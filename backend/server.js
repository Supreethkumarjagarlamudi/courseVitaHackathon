import express from 'express'
import dotenv from 'dotenv'
import connectDB from './config/mongodbConfig.js'
import authRouter from './routes/authRoute.js';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';

const app = express();
connectDB()
dotenv.config({quiet: true})
app.use(cors({
    origin: "http://localhost:3001",
    credentials: true
}))
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.use(passport.initialize())
app.use(passport.session())



app.use("/api/auth", authRouter)

app.listen(process.env.PORT, () => {
    console.log(`Server running at PORT: ${process.env.PORT}`);
})