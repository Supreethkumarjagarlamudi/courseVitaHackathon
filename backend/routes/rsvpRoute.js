import express from 'express';
import { requireAuth } from '../middlewares/middleware.js';
import {
  registerForEvent,
  cancelRSVP,
  getRSVPDetails,
  getRSVPQRCode,
  getCalendarEvent,
  checkInAttendee,
  scanQRCode,
  getEventAttendees,
  approveRSVP
} from '../controllers/rsvpController.js';

const rsvpRouter = express.Router();

rsvpRouter.use(requireAuth);

rsvpRouter.post('/events/:eventId/rsvp', registerForEvent);
rsvpRouter.delete('/rsvp/:rsvpId', cancelRSVP);
rsvpRouter.get('/rsvp/:rsvpId', getRSVPDetails);

rsvpRouter.get('/rsvp/:rsvpId/qr-code', getRSVPQRCode);
rsvpRouter.get('/rsvp/:rsvpId/calendar', getCalendarEvent);

rsvpRouter.post('/rsvp/:rsvpId/checkin', checkInAttendee);
rsvpRouter.post('/scan-qr', scanQRCode);

rsvpRouter.get('/events/:eventId/attendees', getEventAttendees);
rsvpRouter.post('/rsvp/:rsvpId/approve', approveRSVP);

export default rsvpRouter;
