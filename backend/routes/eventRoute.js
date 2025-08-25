import express from 'express';
import { requireAuth } from '../middlewares/middleware.js';
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getMyEvents,
  getMyRegisteredEvents,
  publishEvent,
  cancelEvent,
  getEventStats,
  getEventCategories
} from '../controllers/eventController.js';

const eventRouter = express.Router();

eventRouter.get('/events', getEvents);
eventRouter.get('/events/categories', getEventCategories);
eventRouter.get('/events/:id', getEventById);

eventRouter.use(requireAuth);

eventRouter.post('/events', createEvent);
eventRouter.put('/events/:id', updateEvent);
eventRouter.delete('/events/:id', deleteEvent);
eventRouter.post('/events/:id/publish', publishEvent);
eventRouter.post('/events/:id/cancel', cancelEvent);
eventRouter.get('/events/:id/stats', getEventStats);

eventRouter.get('/my-events', getMyEvents);
eventRouter.get('/my-registered-events', getMyRegisteredEvents);

export default eventRouter;
