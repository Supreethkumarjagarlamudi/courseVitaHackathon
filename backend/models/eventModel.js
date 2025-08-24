import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String,
    maxLength: 200
  },
  
  eventType: {
    type: String,
    enum: ['in-person', 'virtual', 'hybrid'],
    default: 'in-person'
  },
  category: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  
  location: {
    venue: String,
    address: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  virtualEvent: {
    platform: {
      type: String,
      enum: ['zoom', 'teams', 'google-meet', 'custom'],
      default: 'zoom'
    },
    meetingLink: String,
    meetingId: String,
    password: String,
    instructions: String
  },
  
  images: [{
    url: String,
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  coverImage: {
    url: String,
    alt: String
  },
  
  agenda: [{
    time: String,
    title: String,
    description: String,
    speaker: String,
    duration: Number
  }],
  
  capacity: {
    type: Number,
    required: true
  },
  currentAttendees: {
    type: Number,
    default: 0
  },
  pricing: {
    type: {
      type: String,
      enum: ['free', 'paid', 'donation'],
      default: 'free'
    },
    currency: {
      type: String,
      default: 'INR'
    },
    tickets: [{
      name: String,
      price: Number,
      quantity: Number,
      sold: {
        type: Number,
        default: 0
      },
      description: String,
      benefits: [String],
      isActive: {
        type: Boolean,
        default: true
      }
    }]
  },
  
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft'
  },

  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  organizers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['organizer', 'staff', 'volunteer'],
      default: 'staff'
    },
    permissions: [{
      type: String,
      enum: ['manage_event', 'manage_attendees', 'manage_payments', 'view_reports']
    }]
  }],
  
  settings: {
    allowWaitlist: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    allowCancellations: {
      type: Boolean,
      default: true
    },
    cancellationDeadline: Date,
    allowRefunds: {
      type: Boolean,
      default: true
    },
    refundDeadline: Date,
    sendReminders: {
      type: Boolean,
      default: true
    },
    reminderDays: [{
      type: Number,
      default: [1, 7]
    }]
  },
  
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    uniqueViews: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    }
  },
  
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  
  customFields: [{
    label: String,
    type: {
      type: String,
      enum: ['text', 'email', 'phone', 'select', 'checkbox'],
      default: 'text'
    },
    required: Boolean,
    options: [String],
    placeholder: String
  }],
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  publishedAt: Date
}, {
  timestamps: true
});

eventSchema.index({ creator: 1, status: 1 });
eventSchema.index({ startDate: 1, status: 1 });
eventSchema.index({ category: 1, status: 1 });
eventSchema.index({ 'location.city': 1, status: 1 });
eventSchema.index({ tags: 1 });

// Virtual for checking if event is full
eventSchema.virtual('isFull').get(function() {
  return this.currentAttendees >= this.capacity;
});

// Virtual for checking if event is upcoming
eventSchema.virtual('isUpcoming').get(function() {
  return new Date() < this.startDate;
});

// Virtual for checking if event is ongoing
eventSchema.virtual('isOngoing').get(function() {
  const now = new Date();
  return now >= this.startDate && now <= this.endDate;
});

// Virtual for checking if event is past
eventSchema.virtual('isPast').get(function() {
  return new Date() > this.endDate;
});

// Method to update attendee count
eventSchema.methods.updateAttendeeCount = function() {
  return this.model('Event').aggregate([
    { $match: { _id: this._id } },
    {
      $lookup: {
        from: 'rsvps',
        localField: '_id',
        foreignField: 'event',
        pipeline: [
          { $match: { status: { $in: ['confirmed', 'paid'] } } }
        ],
        as: 'attendees'
      }
    },
    {
      $addFields: {
        currentAttendees: { $size: '$attendees' }
      }
    }
  ]);
};

// Pre-save middleware to update updatedAt
eventSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Event = mongoose.model('Event', eventSchema);
export default Event;
