import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { config, isRazorpayConfigured } from '../config/env.js';

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  event, 
  selectedTicket, 
  backendUrl,
  user 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError('');

      if (!user) {
        throw new Error('User not authenticated. Please login first.');
      }

      const quantity = 1;

      console.log('Starting payment process...');
      console.log('Backend URL:', backendUrl);
      console.log('User:', user);
      console.log('Event:', event);
      console.log('Selected Ticket:', selectedTicket);

      const orderResponse = await fetch(`${backendUrl}/api/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          eventId: event._id,
          ticketType: selectedTicket.name,
          quantity: quantity
        })
      });

      console.log('Order response status:', orderResponse.status);
      console.log('Order response headers:', orderResponse.headers);

      const contentType = orderResponse.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await orderResponse.text();
        console.error('Non-JSON response received:', responseText);
        throw new Error(`Server returned ${orderResponse.status}: ${responseText.substring(0, 100)}...`);
      }

      const orderData = await orderResponse.json();
      console.log('Order data:', orderData);
      
      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to create order');
      }

      if (!isRazorpayConfigured()) {
        throw new Error('Payment gateway not configured. Please contact administrator.');
      }

      const options = {
        key: config.RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'CourseVita Events',
        description: `Registration for ${event.title}`,
        order_id: orderData.order.id,
        prefill: {
          name: user.fullName,
          email: user.email,
          contact: user.phone || ''
        },
        theme: {
          color: '#0d437b'
        },
        handler: async function (response) {
          try {
            console.log('=== PAYMENT VERIFICATION REQUEST ===');
            console.log('Full Razorpay response:', response);
            console.log('Response keys:', Object.keys(response));
            
            const orderId = response.razorpay_order_id || response.order_id || response.razorpayOrderId;
            const paymentId = response.razorpay_payment_id || response.payment_id || response.razorpayPaymentId;
            const signature = response.razorpay_signature || response.signature || response.razorpaySignature;
            
            console.log('Normalized response keys:', {
              orderId,
              paymentId,
              signature
            });
            
            const verificationData = {
              razorpay_order_id: orderId,
              razorpay_payment_id: paymentId,
              razorpay_signature: signature,
              rsvpId: orderData.rsvpId
            };
            
            console.log('Sending verification data:', verificationData);
            console.log('Data types:', {
              razorpay_order_id: typeof verificationData.razorpay_order_id,
              razorpay_payment_id: typeof verificationData.razorpay_payment_id,
              razorpay_signature: typeof verificationData.razorpay_signature,
              rsvpId: typeof verificationData.rsvpId
            });

            if (!verificationData.razorpay_order_id || !verificationData.razorpay_payment_id || !verificationData.razorpay_signature) {
              throw new Error(`Missing payment data: orderId=${!!verificationData.razorpay_order_id}, paymentId=${!!verificationData.razorpay_payment_id}, signature=${!!verificationData.razorpay_signature}`);
            }

            const verifyResponse = await fetch(`${backendUrl}/api/payment/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify(verificationData)
            });

            console.log('Verification response status:', verifyResponse.status);
            console.log('Verification response headers:', verifyResponse.headers);
            
            const verifyData = await verifyResponse.json();
            console.log('Verification response data:', verifyData);
            
            if (verifyData.success) {
              console.log('Payment verification successful!');
              onClose();
              navigate(`/registration-success/${orderData.rsvpId}`);
            } else {
              console.error('Payment verification failed:', verifyData.message);
              setError('Payment verification failed: ' + verifyData.message);
            }
          } catch (verifyError) {
            console.error('Verification error:', verifyError);
            console.error('Error details:', {
              message: verifyError.message,
              stack: verifyError.stack,
              name: verifyError.name
            });
            setError('Failed to verify payment. Please contact support.');
          }
        },
        modal: {
          ondismiss: function() {
            onClose();
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('Payment error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      let errorMessage = 'Failed to start payment: ' + error.message;
      
      if (error.message.includes('Payment gateway not configured')) {
        errorMessage = 'Payment gateway not configured. Please contact administrator.';
      } else if (error.message.includes('Failed to create order')) {
        errorMessage = 'Failed to create order. Please try again.';
      } else if (error.message.includes('Invalid key_id')) {
        errorMessage = 'Payment gateway configuration error. Please contact administrator.';
      } else if (error.message.includes('Server returned')) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Complete Registration</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="mb-6">
          <h3 className="font-medium text-gray-900 mb-2">{event.title}</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>Ticket:</strong> {selectedTicket.name}</p>
            <p><strong>Quantity:</strong> 1</p>
            <p><strong>Price:</strong> {'₹'}
                                        {selectedTicket.price}</p>
            <p><strong>Total:</strong> {'₹'}
                                       {selectedTicket.price}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={handlePayment}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>

        <div className="mt-4 text-xs text-gray-500 text-center">
          Secure payment powered by Razorpay
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;