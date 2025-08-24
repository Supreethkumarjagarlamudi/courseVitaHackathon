import transporter from '../config/emailConfig.js';
import QRCode from 'qrcode';

export const sendRegistrationEmail = async (rsvp) => {
  try {
    console.log('=== SENDING REGISTRATION EMAIL ===');
    console.log('RSVP ID:', rsvp._id);
    console.log('User email:', rsvp.user?.email);
    
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Email configuration missing:', {
        host: !!process.env.EMAIL_HOST,
        user: !!process.env.EMAIL_USER,
        pass: !!process.env.EMAIL_PASS,
        from: !!process.env.EMAIL_FROM
      });
      throw new Error('Email configuration incomplete');
    }

    await rsvp.populate('event', 'title startDate endDate location');
    await rsvp.populate('user', 'fullName email');

    console.log('Event populated:', rsvp.event?.title);
    console.log('User populated:', rsvp.user?.fullName);

    let qrCodeDataURL = '';
    try {
      if (!rsvp.checkIn?.qrCode) {
        console.log('QR code not found, generating new one');
        rsvp.generateQRCode();
        await rsvp.save();
        console.log('QR code generated and saved');
      }
      
      console.log('Generating QR code image from data:', rsvp.checkIn.qrCode);
      qrCodeDataURL = await QRCode.toDataURL(rsvp.checkIn.qrCode, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      console.log('QR code image generated successfully');
    } catch (qrError) {
      console.error('QR code generation failed:', qrError);
      console.error('QR error details:', {
        message: qrError.message,
        stack: qrError.stack
      });
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: rsvp.user.email,
      subject: `Registration Confirmed - ${rsvp.event.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: black; color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Registration Confirmed!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Your event registration has been successful</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Event Details</h2>
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #667eea; margin: 0 0 15px 0;">${rsvp.event.title}</h3>
              <p style="margin: 8px 0; color: #666;">
                <strong>Date:</strong> ${new Date(rsvp.event.startDate).toLocaleDateString()}
              </p>
              <p style="margin: 8px 0; color: #666;">
                <strong>Time:</strong> ${new Date(rsvp.event.startDate).toLocaleTimeString()}
              </p>
              <p style="margin: 8px 0; color: #666;">
                <strong>Venue:</strong> ${rsvp.event.location?.venue || 'TBD'}
              </p>
              <p style="margin: 8px 0; color: #666;">
                <strong>Address:</strong> ${rsvp.event.location?.address || 'TBD'}
              </p>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Ticket Information</h2>
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 8px 0; color: #666;">
                <strong>Ticket Type:</strong> ${rsvp.ticketType.name}
              </p>
              <p style="margin: 8px 0; color: #666;">
                <strong>Quantity:</strong> ${rsvp.ticketType.quantity}
              </p>
              <p style="margin: 8px 0; color: #666;">
                <strong>Total Amount:</strong> ${rsvp.payment.currency} ${rsvp.payment.amount}
              </p>
              <p style="margin: 8px 0; color: #666;">
                <strong>Payment Status:</strong> <span style="color: #28a745; font-weight: bold;">${rsvp.payment.status}</span>
              </p>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Check-in QR Code</h2>
            ${qrCodeDataURL ? `
            <div style="text-center; background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <img src="${qrCodeDataURL}" alt="QR Code" style="max-width: 200px; border: 2px solid #ddd; border-radius: 8px;" />
              <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">
                Present this QR code at the event for check-in
              </p>
            </div>
            ` : `
            <div style="text-center; background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="color: #666; font-size: 14px;">
                QR code will be available at the event for check-in
              </p>
            </div>
            `}
            
            <div style="text-center; margin-top: 30px;">
              <p style="color: #666; font-size: 14px;">
                If you have any questions, please contact our support team.
              </p>
              <p style="color: #999; font-size: 12px; margin-top: 20px;">
                This is an automated email. Please do not reply.
              </p>
            </div>
          </div>
        </div>
      `
    };

    // Send email
    console.log('Attempting to send email...');
    console.log('Email options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Registration email sent successfully:', info.messageId);

    // Update RSVP to mark email as sent
    rsvp.communication.confirmationEmailSent = true;
    await rsvp.save();
    console.log('RSVP updated with email sent status');

    return true;

  } catch (error) {
    console.error('=== EMAIL SENDING FAILED ===');
    console.error('Send registration email error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Check for specific email errors
    if (error.code === 'EAUTH') {
      console.error('Authentication failed - check email credentials');
    } else if (error.code === 'ECONNECTION') {
      console.error('Connection failed - check email host and port');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('Connection timeout - check email configuration');
    }
    
    return false;
  }
};

// Send event reminder email
export const sendReminderEmail = async (rsvp) => {
  try {
    await rsvp.populate('event', 'title startDate endDate location');
    await rsvp.populate('user', 'fullName email');

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: rsvp.user.email,
      subject: `Reminder: ${rsvp.event.title} - Tomorrow!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #ff6b6b; color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Event Tomorrow!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Don't forget your upcoming event</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Event Reminder</h2>
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #ff6b6b; margin: 0 0 15px 0;">${rsvp.event.title}</h3>
              <p style="margin: 8px 0; color: #666;">
                <strong>Date:</strong> ${new Date(rsvp.event.startDate).toLocaleDateString()}
              </p>
              <p style="margin: 8px 0; color: #666;">
                <strong>Time:</strong> ${new Date(rsvp.event.startDate).toLocaleTimeString()}
              </p>
              <p style="margin: 8px 0; color: #666;">
                <strong>Venue:</strong> ${rsvp.event.location?.venue || 'TBD'}
              </p>
              <p style="margin: 8px 0; color: #666;">
                <strong>Address:</strong> ${rsvp.event.location?.venue || 'TBD'}
              </p>
            </div>
            
            <div style="text-center; margin-top: 30px;">
              <p style="margin: 8px 0; color: #666;">
                Remember to bring your QR code for check-in!
              </p>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Reminder email sent:', info.messageId);

    // Update RSVP to mark reminder as sent
    rsvp.communication.reminderEmailSent = true;
    rsvp.communication.reminderDates.push(new Date());
    await rsvp.save();

    return true;

  } catch (error) {
    console.error('Send reminder email error:', error);
    return false;
  }
};