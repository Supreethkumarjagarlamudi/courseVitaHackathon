import express from 'express'
import dotenv from 'dotenv'
import connectDB from './config/mongodbConfig.js'
import authRouter from './routes/authRoute.js';
import eventRouter from './routes/eventRoute.js';
import rsvpRouter from './routes/rsvpRoute.js';
import adminRouter from './routes/adminRoute.js';
import uploadRouter from './routes/uploadRoute.js';
import paymentRouter from './routes/paymentRoute.js';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';

const app = express();

// Load environment variables first
dotenv.config({quiet: true})

// Connect to database (only in development, Vercel handles this differently)
if (process.env.NODE_ENV !== 'production') {
    connectDB()
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
    origin: [
        "http://localhost:3001", 
        "http://localhost:3002", 
        "http://localhost:5173", 
        "http://localhost:5174", 
        "https://occasioclients.vercel.app", 
        "https://occasioadmin.vercel.app"
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token', 'Origin', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    preflightContinue: false,
    optionsSuccessStatus: 200
}));

// Handle preflight requests
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-auth-token, Origin, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.status(200).end();
});

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'test',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
}));

app.use(passport.initialize())
app.use(passport.session())

// Routes
app.use("/api/admin", adminRouter)
app.use("/api/auth", authRouter)
app.use("/api", eventRouter)
app.use("/api", rsvpRouter)
app.use("/api", uploadRouter)
app.use("/api/payment", paymentRouter)

app.get("/health", (req, res) => {
    res.json({ status: "OK", message: "Server is running" });
});

app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.use("/", (req, res) => {
    res.json({ status: "OK", message: "Server is running" });
})

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// For Vercel serverless functions, export the app
export default app;

// Only listen in development
if (process.env.NODE_ENV !== 'production') {
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server running at PORT: ${process.env.PORT || 3000}`);
    });
}