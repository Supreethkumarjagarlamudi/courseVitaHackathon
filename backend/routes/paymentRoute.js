import express from 'express';
import { requireAuth } from '../middlewares/middleware.js';
import { createOrder, verifyPayment, getPaymentStatus, testRazorpayConfig, testEmailConfig } from '../controllers/paymentController.js';

const paymentRouter = express.Router();


paymentRouter.use(requireAuth);

paymentRouter.post('/create-order', createOrder);

paymentRouter.post('/verify', verifyPayment);

paymentRouter.get('/status/:rsvpId', getPaymentStatus);

export default paymentRouter;