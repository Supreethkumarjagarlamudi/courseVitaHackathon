import express from 'express'
import dotenv from 'dotenv'
import connectDB from './config/mongodbConfig.js'
import authRouter from './routes/authRoute.js'
import eventRouter from './routes/eventRoute.js'
import rsvpRouter from './routes/rsvpRoute.js'
import adminRouter from './routes/adminRoute.js'
import uploadRouter from './routes/uploadRoute.js'
import paymentRouter from './routes/paymentRoute.js'
import session from 'express-session'
import passport from 'passport'
import cors from 'cors'

const app = express()


dotenv.config({ quiet: true })

connectDB()


const allowedOrigins = [
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:5173',
  'http://localhost:5174',
  'https://occasioclients.vercel.app',
  'https://occasioadmin.vercel.app'
]

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-auth-token',
      'Origin',
      'Accept'
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    optionsSuccessStatus: 200
  })
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'test',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
  })
)

app.use(passport.initialize())
app.use(passport.session())


app.use('/api/admin', adminRouter)
app.use('/api/auth', authRouter)
app.use('/api', eventRouter)
app.use('/api', rsvpRouter)
app.use('/api', uploadRouter)
app.use('/api/payment', paymentRouter)

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

app.get('/', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' })
})

app.get("/ping", (req, res) => {
  res.json({ message: "pong" });
});

app.use((req, res, next) => {
  if (!req.path.startsWith("/api")) {
    return res.status(404).json({ error: "API route not found" });
  }
  next();
});

app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({
    error: 'Internal Server Error',
    message:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'Something went wrong'
  })
})

export default app

if (process.env.NODE_ENV !== 'production') {
  app.listen(process.env.PORT || 3000, () => {
    console.log(`Server running at PORT: ${process.env.PORT || 3000}`)
  })
}