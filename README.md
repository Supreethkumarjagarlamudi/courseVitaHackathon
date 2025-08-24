# 🎉 Occasio - Event Management Platform

**Occasio** is a comprehensive event management platform that enables users to create, manage, and attend events seamlessly. The platform consists of three main modules: a client-facing web application, an admin dashboard, and a robust backend API.

## 🌟 Features

### Client Module
- **User Authentication**: Secure login and registration system
- **Event Discovery**: Browse and search through available events
- **Event Registration**: RSVP and attend events with QR code generation
- **Payment Integration**: Secure payment processing via Razorpay
- **User Profile Management**: Personalize your profile and track event history
- **Responsive Design**: Modern UI built with React and Tailwind CSS

### Admin Module
- **Event Management**: Create, edit, and manage events
- **Attendee Management**: Track and manage event registrations
- **QR Code Scanner**: Real-time check-in system for attendees
- **Analytics Dashboard**: Monitor event performance and attendance
- **Content Management**: Upload and manage event images and content

### Backend API
- **RESTful API**: Comprehensive endpoints for all platform operations
- **Authentication & Authorization**: Secure user and admin authentication
- **File Management**: Cloudinary integration for image uploads
- **Email Services**: Automated email notifications via Nodemailer
- **Payment Processing**: Secure payment handling with Razorpay
- **Database Management**: MongoDB with Mongoose ODM

## 🏗️ Project Structure

```
courseVitaHackathon/
├── client/                 # Frontend client application
├── admin/                  # Admin dashboard application
├── backend/                # Backend API server
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB
- npm or yarn package manager

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Supreethkumarjagarlamudi/courseVitaHackathon.git
   cd courseVitaHackathon
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Copy environment variables
   cp env.example .env
   
   # Configure your environment variables in .env file
   npm start
   ```

3. **Client Setup**
   ```bash
   cd client
   npm install
   npm run dev
   ```

4. **Admin Setup**
   ```bash
   cd admin
   npm install
   npm run dev
   ```

## 🔧 Configuration

### Backend Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# MongoDB Configuration
MONGODB_URI=your_mongodb_connection_string

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password

# Server Configuration
PORT=5000
NODE_ENV=development
```

## 📱 Available Scripts

### Backend
- `npm start` - Start the development server with nodemon
- `npm run build` - Build for production

### Client & Admin
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🛠️ Tech Stack

### Frontend (Client & Admin)
- **React 19** - Modern React with latest features
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icons
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Passport.js** - Authentication middleware
- **Multer** - File upload handling
- **Cloudinary** - Cloud image management
- **Razorpay** - Payment gateway
- **Nodemailer** - Email service
- **QRCode** - QR code generation

## 🔐 Authentication & Security

- **JWT-based authentication** for secure user sessions
- **Password hashing** using bcryptjs
- **CORS protection** for cross-origin requests
- **Session management** with express-session
- **Google OAuth2** integration for social login

## 📊 Database Models

- **User Model**: User authentication and profile information
- **Event Model**: Event details, dates, and capacity
- **RSVP Model**: Event registration and attendance tracking

## 🚀 Deployment

### Backend Deployment
1. Set environment variables for production
2. Build the application: `npm run build`
3. Deploy to your preferred hosting service (Heroku, AWS, etc.)

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Configure environment variables for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Supreeth Kumar J**
- GitHub: [@Supreethkumarjagarlamudi](https://github.com/Supreethkumarjagarlamudi)

## 🆘 Support

If you encounter any issues or have questions:

1. Check the existing issues on GitHub
2. Create a new issue with detailed information
3. Contact the development team

## 🔮 Future Enhancements

- Real-time notifications
- Advanced analytics and reporting
- Mobile application
- Multi-language support
- Advanced event templates
- Integration with calendar applications

---

**Occasio** - Making event management simple, efficient, and enjoyable! 🎊
