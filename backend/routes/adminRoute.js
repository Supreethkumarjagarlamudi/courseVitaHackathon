import express from 'express';
import { adminAuth } from '../middlewares/adminAuth.js';
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getMyEvents,
  publishEvent,
  cancelEvent,
  getEventStats,
  getEventCategories
} from '../controllers/eventController.js';
import {
  getEventAttendees,
  checkInAttendee,
  approveRSVP,
  getRSVPQRCode,
  getAdminRSVPQRCode,
  scanQRCode
} from '../controllers/rsvpController.js';
import { uploadImage, deleteImage } from '../controllers/uploadController.js';
import multer from 'multer';

const adminRouter = express.Router();

adminRouter.use(adminAuth);

adminRouter.post('/events', createEvent);
adminRouter.get('/events', getEvents);
adminRouter.get('/events/categories', getEventCategories);
adminRouter.get('/events/:id', getEventById);
adminRouter.put('/events/:id', updateEvent);
adminRouter.delete('/events/:id', deleteEvent);
adminRouter.post('/events/:id/publish', publishEvent);
adminRouter.post('/events/:id/cancel', cancelEvent);
adminRouter.get('/events/:id/stats', getEventStats);
adminRouter.get('/my-events', getMyEvents);

adminRouter.get('/events/:eventId/attendees', getEventAttendees);
adminRouter.post('/rsvp/:rsvpId/checkin', checkInAttendee);
adminRouter.post('/rsvp/:rsvpId/approve', approveRSVP);
adminRouter.get('/rsvp/:rsvpId/qr-code', getAdminRSVPQRCode);
adminRouter.post('/scan-qr', scanQRCode);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

adminRouter.post('/upload', upload.single('image'), uploadImage);
adminRouter.delete('/delete', deleteImage);

export default adminRouter;
