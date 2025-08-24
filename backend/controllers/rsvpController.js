import RSVP from '../models/rsvpModel.js';
import Event from '../models/eventModel.js';
import User from '../models/userModel.js';
import QRCode from 'qrcode';

export const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { ticketType, customFields, specialRequirements, dietaryRestrictions, notes } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (event.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Event is not available for registration'
      });
    }

    const existingRSVP = await RSVP.findOne({
      event: eventId,
      user: req.user._id
    });

    if (existingRSVP) {
      return res.status(400).json({
        success: false,
        message: 'You have already registered for this event'
      });
    }

    if (event.currentAttendees >= event.capacity) {
      if (!event.settings.allowWaitlist) {
        return res.status(400).json({
          success: false,
          message: 'Event is full and waitlist is not available'
        });
      }
    }

    const rsvpData = {
      event: eventId,
      user: req.user._id,
      ticketType,
      customFields,
      specialRequirements,
      dietaryRestrictions,
      notes
    };

    if (event.currentAttendees >= event.capacity) {
      rsvpData.status = 'waitlisted';
    } else {
      rsvpData.status = event.settings.requireApproval ? 'pending' : 'confirmed';
    }

    if (ticketType && ticketType.price > 0) {
      rsvpData.payment = {
        status: 'pending',
        amount: ticketType.price * (ticketType.quantity || 1),
        currency: event.pricing.currency || 'USD'
      };
    } else {
      rsvpData.payment = {
        status: 'completed',
        amount: 0,
        currency: event.pricing.currency || 'USD',
        paymentMethod: 'free'
      };
    }

    const rsvp = new RSVP(rsvpData);
    await rsvp.save();

    rsvp.generateQRCode();
    await rsvp.save();

    if (rsvp.status === 'confirmed') {
      event.currentAttendees += 1;
      await event.save();
    }

    await rsvp.populate('event', 'title startDate endDate location');

    res.status(201).json({
      success: true,
      message: rsvp.status === 'waitlisted' ? 'Added to waitlist' : 'Registration successful',
      rsvp
    });
  } catch (error) {
    console.error('Register for event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register for event',
      error: error.message
    });
  }
};

export const cancelRSVP = async (req, res) => {
  try {
    const { rsvpId } = req.params;

    const rsvp = await RSVP.findById(rsvpId)
      .populate('event', 'title startDate settings');

    if (!rsvp) {
      return res.status(404).json({
        success: false,
        message: 'RSVP not found'
      });
    }

    if (rsvp.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to cancel this RSVP'
      });
    }

    if (!rsvp.event.settings.allowCancellations) {
      return res.status(400).json({
        success: false,
        message: 'Cancellations are not allowed for this event'
      });
    }

    if (rsvp.event.settings.cancellationDeadline && 
        new Date() > rsvp.event.settings.cancellationDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Cancellation deadline has passed'
      });
    }

    await rsvp.cancelRSVP();

    if (rsvp.status === 'confirmed') {
      const event = await Event.findById(rsvp.event._id);
      event.currentAttendees = Math.max(0, event.currentAttendees - 1);
      await event.save();
    }

    res.json({
      success: true,
      message: 'RSVP cancelled successfully',
      rsvp
    });
  } catch (error) {
    console.error('Cancel RSVP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel RSVP',
      error: error.message
    });
  }
};

export const getRSVPDetails = async (req, res) => {
  try {
    const { rsvpId } = req.params;

    const rsvp = await RSVP.findById(rsvpId)
      .populate('event', 'title startDate endDate location coverImage description')
      .populate('user', 'fullName email');

    if (!rsvp) {
      return res.status(404).json({
        success: false,
        message: 'RSVP not found'
      });
    }

    if (rsvp.user._id.toString() !== req.user._id.toString()) {
      const event = await Event.findById(rsvp.event._id);
      const isOrganizer = event.organizers.some(org => 
        org.user.toString() === req.user._id.toString() && 
        org.permissions.includes('manage_attendees')
      );

      if (!isOrganizer) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to view this RSVP'
        });
      }
    }

    let qrCodeData = '';
    let qrCodeImage = '';
    
    try {
      if (!rsvp.checkIn?.qrCode) {
        console.log('Generating QR code for RSVP:', rsvpId);
        rsvp.generateQRCode();
        await rsvp.save();
      }
      
      qrCodeData = rsvp.checkIn.qrCode;

      const QRCode = await import('qrcode');
      qrCodeImage = await QRCode.toDataURL(rsvp.checkIn.qrCode, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      console.log('QR code generated successfully for RSVP:', rsvpId);
    } catch (qrError) {
      console.error('Failed to generate QR code for RSVP:', rsvpId, qrError);
    }

    res.json({
      success: true,
      rsvp,
      qrCode: qrCodeData,
      qrCodeImage: qrCodeImage
    });
  } catch (error) {
    console.error('Get RSVP details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch RSVP details',
      error: error.message
    });
  }
};

export const getRSVPQRCode = async (req, res) => {
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

    if (rsvp.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this QR code'
      });
    }

    if (!rsvp.checkIn.qrCode) {
      rsvp.generateQRCode();
      await rsvp.save();
    }

    const qrCodeDataURL = await QRCode.toDataURL(rsvp.checkIn.qrCode, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    res.json({
      success: true,
      qrCode: rsvp.checkIn.qrCode,
      qrCodeImage: qrCodeDataURL,
      rsvp: {
        _id: rsvp._id,
        status: rsvp.status,
        event: rsvp.event,
        user: rsvp.user,
        ticketType: rsvp.ticketType,
        payment: rsvp.payment
      }
    });
  } catch (error) {
    console.error('Get QR code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate QR code',
      error: error.message
    });
  }
};

export const getAdminRSVPQRCode = async (req, res) => {
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

    if (!rsvp.checkIn.qrCode) {
      rsvp.generateQRCode();
      await rsvp.save();
    }

    const qrCodeDataURL = await QRCode.toDataURL(rsvp.checkIn.qrCode, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    res.json({
      success: true,
      qrCode: rsvp.checkIn.qrCode,
      qrCodeImage: qrCodeDataURL,
      rsvp: {
        _id: rsvp._id,
        status: rsvp.status,
        event: rsvp.event,
        user: rsvp.user,
        ticketType: rsvp.ticketType,
        payment: rsvp.payment
      }
    });
  } catch (error) {
    console.error('Get admin QR code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate QR code',
      error: error.message
    });
  }
};

export const getCalendarEvent = async (req, res) => {
  try {
    const { rsvpId } = req.params;

    const rsvp = await RSVP.findById(rsvpId)
      .populate('event', 'title startDate endDate location description')
      .populate('user', 'fullName email');

    if (!rsvp) {
      return res.status(404).json({
        success: false,
        message: 'RSVP not found'
      });
    }

    if (rsvp.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this calendar event'
      });
    }

    const event = rsvp.event;
    
    const calendarEvent = {
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location?.venue || event.location?.address || 'Location TBD',
      googleCalendarUrl: generateGoogleCalendarUrl(event),
      outlookUrl: generateOutlookUrl(event),
      icalData: generateICalData(event)
    };

    res.json({
      success: true,
      calendarEvent
    });
  } catch (error) {
    console.error('Get calendar event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate calendar event',
      error: error.message
    });
  }
};

const generateGoogleCalendarUrl = (event) => {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatDateForCalendar(event.startDate)}/${formatDateForCalendar(event.endDate)}`,
    details: event.description,
    location: event.location?.venue || event.location?.address || 'Location TBD'
  });
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};


const generateOutlookUrl = (event) => {
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    startdt: event.startDate.toISOString(),
    enddt: event.endDate.toISOString(),
    body: event.description,
    location: event.location?.venue || event.location?.address || 'Location TBD'
  });
  
  return `https://outlook.live.com/calendar/0/${params.toString()}`;
};

const generateICalData = (event) => {
  const formatDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const escapeText = (text) => {
    return text.replace(/[\\;,]/g, '\\$&').replace(/\n/g, '\\n');
  };

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CourseVita//Event Calendar//EN',
    'BEGIN:VEVENT',
    `UID:${event._id}@coursevita.com`,
    `DTSTART:${formatDate(event.startDate)}`,
    `DTEND:${formatDate(event.endDate)}`,
    `SUMMARY:${escapeText(event.title)}`,
    `DESCRIPTION:${escapeText(event.description)}`,
    `LOCATION:${escapeText(event.location?.venue || event.location?.address || 'Location TBD')}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
};

const formatDateForCalendar = (date) => {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

export const checkInAttendee = async (req, res) => {
  try {
    const { rsvpId } = req.params;
    const { location = 'Main Entrance' } = req.body;

    const rsvp = await RSVP.findById(rsvpId)
      .populate('event', 'title')
      .populate('user', 'fullName email');

    if (!rsvp) {
      return res.status(404).json({
        success: false,
        message: 'RSVP not found'
      });
    }

    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to check in attendees'
      });
    }

    await rsvp.checkInAttendee(req.user._id, location);

    res.json({
      success: true,
      message: 'Attendee checked in successfully',
      rsvp
    });
  } catch (error) {
    console.error('Check-in attendee error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to check in attendee',
      error: error.message
    });
  }
};

export const scanQRCode = async (req, res) => {
  try {
    const { qrCode } = req.body;

    if (!qrCode) {
      return res.status(400).json({
        success: false,
        message: 'QR code is required'
      });
    }

    let qrData;
    try {
      const decoded = Buffer.from(qrCode, 'base64').toString();
      qrData = JSON.parse(decoded);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code'
      });
    }

    const rsvp = await RSVP.findById(qrData.rsvpId)
      .populate('event', 'title')
      .populate('user', 'fullName email');

    if (!rsvp) {
      return res.status(404).json({
        success: false,
        message: 'RSVP not found'
      });
    }

    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to check in attendees'
      });
    }

    if (rsvp.checkIn.checkedIn) {
      return res.status(400).json({
        success: false,
        message: 'Attendee already checked in',
        rsvp
      });
    }

    await rsvp.checkInAttendee(req.user._id);

    res.json({
      success: true,
      message: 'QR code scanned successfully',
      rsvp
    });
  } catch (error) {
    console.error('Scan QR code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to scan QR code',
      error: error.message
    });
  }
};


export const getEventAttendees = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status, page = 1, limit = 20 } = req.query;

    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view attendees'
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const query = { event: eventId };
    if (status) query.status = status;

    const attendees = await RSVP.find(query)
      .populate('user', 'fullName email profilePicture')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await RSVP.countDocuments(query);

    res.json({
      success: true,
      attendees,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get event attendees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendees',
      error: error.message
    });
  }
};

export const approveRSVP = async (req, res) => {
  try {
    const { rsvpId } = req.params;
    const { action, reason } = req.body;

    const rsvp = await RSVP.findById(rsvpId)
      .populate('event', 'title capacity currentAttendees');

    if (!rsvp) {
      return res.status(404).json({
        success: false,
        message: 'RSVP not found'
      });
    }

    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to approve RSVPs'
      });
    }

    if (action === 'approve') {
      if (rsvp.event.currentAttendees >= rsvp.event.capacity) {
        return res.status(400).json({
          success: false,
          message: 'Event is at full capacity'
        });
      }

      rsvp.status = 'confirmed';
      rsvp.event.currentAttendees += 1;
      await rsvp.event.save();
    } else if (action === 'reject') {
      rsvp.status = 'cancelled';
      rsvp.notes = reason || 'RSVP rejected by organizer';
    }

    await rsvp.save();

    res.json({
      success: true,
      message: `RSVP ${action}d successfully`,
      rsvp
    });
  } catch (error) {
    console.error('Approve RSVP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process RSVP',
      error: error.message
    });
  }
};
