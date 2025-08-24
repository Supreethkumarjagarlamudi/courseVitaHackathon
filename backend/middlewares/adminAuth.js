import mongoose from 'mongoose';

export const adminAuth = (req, res, next) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@occasio.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';
  
  const providedEmail = req.headers['x-admin-email'];
  const providedPassword = req.headers['x-admin-password'];
  
  if (providedEmail === adminEmail && providedPassword === adminPassword) {
    req.user = {
      _id: new mongoose.Types.ObjectId('000000000000000000000001'), // Fixed admin ID
      fullName: 'Admin User',
      email: adminEmail,
      role: 'admin',
      method: 'local',
      isEmailVerified: true,
      profilePicture: '',
      createdAt: new Date(),
      lastLogin: new Date()
    };
    return next();
  }
  
  return res.status(401).json({ 
    success: false,
    message: "Admin authentication required" 
  });
};
