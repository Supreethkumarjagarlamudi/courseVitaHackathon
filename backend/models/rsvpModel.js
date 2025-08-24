import mongoose from 'mongoose';

const rsvpSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'waitlisted', 'no-show'],
    default: 'pending'
  },
  
  ticketType: {
    name: String,
    price: Number,
    quantity: {
      type: Number,
      default: 1
    }
  },
  
  payment: {
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    amount: Number,
    currency: {
      type: String,
      default: 'INR'
    },
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'free'],
      default: 'free'
    },
    transactionId: String,
    paymentDate: Date,
    refundDate: Date,
    refundAmount: Number
  },
  
  checkIn: {
    checkedIn: {
      type: Boolean,
      default: false
    },
    checkInTime: Date,
    checkInLocation: String,
    checkedInBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    qrCode: String,
    qrCodeScanned: {
      type: Boolean,
      default: false
    }
  },
  
  customFields: [{
    label: String,
    value: String,
    type: {
      type: String,
      enum: ['text', 'email', 'phone', 'select', 'checkbox']
    }
  }],
  
  specialRequirements: String,
  dietaryRestrictions: String,
  notes: String,
  
  communication: {
    confirmationEmailSent: {
      type: Boolean,
      default: false
    },
    reminderEmailSent: {
      type: Boolean,
      default: false
    },
    reminderDates: [Date],
    lastEmailSent: Date
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  cancelledAt: Date,
  confirmedAt: Date
}, {
  timestamps: true
});

// Indexes for better query performance
rsvpSchema.index({ event: 1, user: 1 }, { unique: true });
rsvpSchema.index({ event: 1, status: 1 });
rsvpSchema.index({ user: 1, status: 1 });
rsvpSchema.index({ 'payment.status': 1 });
rsvpSchema.index({ 'checkIn.checkedIn': 1 });

// Virtual for checking if RSVP is active
rsvpSchema.virtual('isActive').get(function() {
  return ['pending', 'confirmed', 'waitlisted'].includes(this.status);
});

// Virtual for checking if payment is required
rsvpSchema.virtual('paymentRequired').get(function() {
  return this.ticketType && this.ticketType.price > 0;
});

// Virtual for checking if payment is completed
rsvpSchema.virtual('paymentCompleted').get(function() {
  return this.payment.status === 'completed';
});

// Pre-save middleware to update updatedAt
rsvpSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Update status timestamps
  if (this.isModified('status')) {
    if (this.status === 'confirmed' && !this.confirmedAt) {
      this.confirmedAt = new Date();
    } else if (this.status === 'cancelled' && !this.cancelledAt) {
      this.cancelledAt = new Date();
    }
  }
  
  next();
});

// Method to generate QR code
rsvpSchema.methods.generateQRCode = function() {
  const qrData = {
    rsvpId: this._id.toString(),
    eventId: this.event.toString(),
    userId: this.user.toString(),
    timestamp: Date.now()
  };
  
  // Create a unique string for QR code
  this.checkIn.qrCode = Buffer.from(JSON.stringify(qrData)).toString('base64');
  return this.checkIn.qrCode;
};

// Method to check in attendee
rsvpSchema.methods.checkInAttendee = function(checkInBy, location = 'Main Entrance') {
  if (this.checkIn.checkedIn) {
    throw new Error('Attendee already checked in');
  }
  
  this.checkIn.checkedIn = true;
  this.checkIn.checkInTime = new Date();
  this.checkIn.checkedInBy = checkInBy;
  this.checkIn.checkInLocation = location;
  
  return this.save();
};

// Method to cancel RSVP
rsvpSchema.methods.cancelRSVP = function() {
  if (this.status === 'cancelled') {
    throw new Error('RSVP already cancelled');
  }
  
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  
  return this.save();
};

// Static method to get event statistics
rsvpSchema.statics.getEventStats = function(eventId) {
  return this.aggregate([
    { $match: { event: mongoose.Types.ObjectId(eventId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$payment.amount' }
      }
    }
  ]);
};

// Static method to get user's events
rsvpSchema.statics.getUserEvents = function(userId, status = null) {
  const match = { user: mongoose.Types.ObjectId(userId) };
  if (status) {
    match.status = status;
  }
  
  return this.find(match)
    .populate('event', 'title startDate endDate location coverImage')
    .sort({ createdAt: -1 });
};

const RSVP = mongoose.model('RSVP', rsvpSchema);
export default RSVP;
