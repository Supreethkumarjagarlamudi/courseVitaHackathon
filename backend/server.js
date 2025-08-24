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
connectDB()
dotenv.config({quiet: true})

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: ["http://localhost:3001", "http://localhost:3002", "http://localhost:5173", "http://localhost:5174", "https://occasioclients.vercel.app", "https://occasioadmin.vercel.app"],
    credentials: true
}))

app.use(session({
    secret: process.env.SESSION_SECRET || 'test',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.use(passport.initialize())
app.use(passport.session())

app.use("/api/admin", adminRouter)
app.use("/api/auth", authRouter)
app.use("/api", eventRouter)
app.use("/api", rsvpRouter)
app.use("/api", uploadRouter)
app.use("/api/payment", paymentRouter)

app.get("/health", (req, res) => {
    res.json({ status: "OK", message: "Server is running" });
});


app.listen(process.env.PORT || 3000, () => {
    console.log(`Server running at PORT: ${process.env.PORT || 3000}`);
})