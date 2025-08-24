import razorpay from '../config/razorpayConfig.js';
import RSVP from '../models/rsvpModel.js';
import Event from '../models/eventModel.js';
import { sendRegistrationEmail } from '../services/emailService.js';
import crypto from 'crypto';

export const createOrder = async (req, res) => {
  try {
    const { eventId, ticketType, quantity = 1 } = req.body;
    const userId = req.user._id;

    console.log('Creating order with:', {
      eventId,
      ticketType,
      quantity,
      userId: userId.toString()
    });

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay not configured:', {
        keyId: !!process.env.RAZORPAY_KEY_ID,
        keySecret: !!process.env.RAZORPAY_KEY_SECRET
      });
      return res.status(500).json({
        success: false,
        message: 'Payment gateway not configured. Please contact administrator.'
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    console.log('Event found:', {
      title: event.title,
      pricing: event.pricing
    });

    const ticket = event.pricing.tickets.find(t => t.name === ticketType);
    if (!ticket) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ticket type'
      });
    }

    const totalAmount = ticket.price * quantity * 100;
    console.log('Payment details:', {
      ticketPrice: ticket.price,
      quantity,
      totalAmount,
      currency: event.pricing.currency || 'INR'
    });

    const shortReceipt = `evt_${eventId.slice(-8)}_${Date.now().toString().slice(-8)}`;
    console.log('Receipt:', shortReceipt);

    const order = await razorpay.orders.create({
      amount: totalAmount,
      currency: event.pricing.currency || 'INR',
      receipt: shortReceipt,
      notes: {
        eventId: eventId,
        userId: userId.toString(),
        ticketType: ticketType,
        quantity: quantity
      }
    });

    console.log('Razorpay order created:', {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });

    const rsvp = new RSVP({
      event: eventId,
      user: userId,
      ticketType: {
        name: ticket.name,
        price: ticket.price,
        quantity: quantity
      },
      payment: {
        amount: ticket.price * quantity,
        currency: event.pricing.currency || 'INR',
        paymentMethod: 'razorpay'
      }
    });

    console.log('RSVP object created:', {
      rsvpId: rsvp._id,
      event: rsvp.event,
      user: rsvp.user,
      ticketType: rsvp.ticketType,
      payment: rsvp.payment
    });

    await rsvp.save();
    console.log('RSVP saved successfully');

    try {
      rsvp.generateQRCode();
      await rsvp.save();
      console.log('QR code generated and saved');
    } catch (qrError) {
      console.error('Failed to generate QR code:', qrError);
    }

    res.json({
      success: true,
      order: order,
      rsvpId: rsvp._id
    });

  } catch (error) {
    console.error('Create order error:', error);
    
    let errorMessage = 'Failed to create order';
    
    if (error && error.message) {
      if (error.message.includes('Invalid key_id')) {
        errorMessage = 'Payment gateway configuration error. Please contact administrator.';
      } else if (error.message.includes('Invalid key_secret')) {
        errorMessage = 'Payment gateway configuration error. Please contact administrator.';
      } else if (error.message.includes('amount')) {
        errorMessage = 'Invalid amount. Please try again.';
      } else if (error.message.includes('receipt')) {
        errorMessage = 'Payment order creation failed. Please try again.';
      } else if (error.message.includes('BAD_REQUEST_ERROR')) {
        errorMessage = 'Payment request invalid. Please try again.';
      }
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? (error?.message || 'Unknown error') : undefined
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, rsvpId } = req.body;

    console.log('=== PAYMENT VERIFICATION START ===');
    console.log('Request body:', req.body);
    console.log('Verifying payment with:', {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature: razorpay_signature ? 'present' : 'missing',
      rsvpId
    });

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !rsvpId) {
      console.error('Missing required fields:', {
        razorpay_order_id: !!razorpay_order_id,
        razorpay_payment_id: !!razorpay_payment_id,
        razorpay_signature: !!razorpay_signature,
        rsvpId: !!rsvpId
      });
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification fields'
      });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      console.error('RAZORPAY_KEY_SECRET is missing from environment variables');
      return res.status(500).json({
        success: false,
        message: 'Payment gateway configuration error'
      });
    }

    console.log('RAZORPAY_KEY_SECRET available:', !!process.env.RAZORPAY_KEY_SECRET);

    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    console.log('Signature text to hash:', text);
    
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    console.log('Signature verification:', {
      expected: expectedSignature,
      received: razorpay_signature,
      matches: expectedSignature === razorpay_signature
    });

    if (expectedSignature !== razorpay_signature) {
      console.error('Signature mismatch!');
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature. Payment verification failed.'
      });
    }

    console.log('Signature verification successful');

    console.log('Looking for RSVP with ID:', rsvpId);
    const rsvp = await RSVP.findById(rsvpId);
    if (!rsvp) {
      console.error('RSVP not found with ID:', rsvpId);
      return res.status(404).json({
        success: false,
        message: 'RSVP not found'
      });
    }

    console.log('RSVP found:', {
      id: rsvp._id,
      status: rsvp.status,
      paymentStatus: rsvp.payment?.status
    });

    rsvp.payment.status = 'completed';
    rsvp.payment.transactionId = razorpay_payment_id;
    rsvp.payment.paymentDate = new Date();
    rsvp.status = 'confirmed';

    console.log('Updating RSVP with payment details...');
    await rsvp.save();
    console.log('RSVP updated successfully');

    try {
      console.log('Attempting to send confirmation email...');
      await sendRegistrationEmail(rsvp);
      console.log('Confirmation email sent successfully');
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

    console.log('=== PAYMENT VERIFICATION SUCCESS ===');
    res.json({
      success: true,
      message: 'Payment verified successfully',
      rsvp: rsvp
    });

  } catch (error) {
    console.error('=== PAYMENT VERIFICATION ERROR ===');
    console.error('Verify payment error:', error);
    console.error('Error stack:', error.stack);
    
    let errorMessage = 'Failed to verify payment';
    
    if (error.name === 'ValidationError') {
      errorMessage = 'Payment data validation failed';
    } else if (error.name === 'CastError') {
      errorMessage = 'Invalid RSVP ID format';
    } else if (error.message) {
      errorMessage = `Payment verification failed: ${error.message}`;
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getPaymentStatus = async (req, res) => {
  try {
    const { rsvpId } = req.params;
    
    const rsvp = await RSVP.findById(rsvpId)
      .populate('event', 'title startDate endDate location')
      .populate('user', 'fullName email');

    if (!rsvp) {
      return res.status(404).json({
        success: false,
        message: 'RSVP not found'
      });
    }

    res.json({
      success: true,
      payment: rsvp.payment,
      rsvp: rsvp
    });

  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment status',
      error: error.message
    });
  }
};