import Event from '../models/eventModel.js';
import RSVP from '../models/rsvpModel.js';
import User from '../models/userModel.js';

export const createEvent = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Only admins can create events"
      });
    }

    const eventData = {
      ...req.body,
      creator: req.user._id,
      organizers: [{ user: req.user._id, role: 'organizer', permissions: ['manage_event', 'manage_attendees', 'manage_payments', 'view_reports'] }]
    };

    const event = new Event(eventData);
    await event.save();

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create event',
      error: error.message
    });
  }
};

export const getEvents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      eventType,
      status = 'published',
      search,
      location,
      startDate,
      endDate,
      sortBy = 'startDate',
      sortOrder = 'asc'
    } = req.query;

    const query = { status };

    if (category) query.category = category;
    if (eventType) query.eventType = eventType;
    if (location) query['location.city'] = new RegExp(location, 'i');
    if (startDate) query.startDate = { $gte: new Date(startDate) };
    if (endDate) query.endDate = { $lte: new Date(endDate) };
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const isAdminRequest = req.headers['x-admin-email'] && req.headers['x-admin-password'];
    
    let events;
    if (isAdminRequest) {
      events = await Event.aggregate([
        { $match: query },
        {
          $lookup: {
            from: 'rsvps',
            localField: '_id',
            foreignField: 'event',
            pipeline: [
              { $match: { status: { $in: ['confirmed'] } } }
            ],
            as: 'attendees'
          }
        },
        {
          $addFields: {
            currentAttendees: { $size: '$attendees' }
          }
        },
        {
          $sort: sortOptions
        },
        {
          $skip: (page - 1) * limit
        },
        {
          $limit: limit * 1
        }
      ]);

      events = await Event.populate(events, [
        { path: 'creator', select: 'fullName email' }
      ]);
    } else {
      events = await Event.find(query)
        .populate('creator', 'fullName email')
        .sort(sortOptions)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();
    }

    const total = await Event.countDocuments(query);
    res.json({
      success: true,
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: error.message
    });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('creator', 'fullName email profilePicture')
      .populate('organizers.user', 'fullName email profilePicture');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    event.analytics.views += 1;
    await event.save();

    res.json({
      success: true,
      event
    });
  } catch (error) {
    console.error('Get event by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event',
      error: error.message
    });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Only admins can update events"
      });
    }

    const isCreator = event.creator.toString() === req.user._id.toString();
    const isOrganizer = event.organizers.some(org => 
      org.user.toString() === req.user._id.toString() && 
      org.permissions.includes('manage_event')
    );

    if (!isCreator && !isOrganizer) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this event'
      });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('creator', 'fullName email');

    res.json({
      success: true,
      message: 'Event updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update event',
      error: error.message
    });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Only admins can delete events"
      });
    }

    if (event.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this event'
      });
    }

    await RSVP.deleteMany({ event: req.params.id });

    await Event.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete event',
      error: error.message
    });
  }
};

export const getMyEvents = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Only admins can access this endpoint"
      });
    }

    const { status, page = 1, limit = 10 } = req.query;

    const query = { creator: req.user._id };
    if (status) query.status = status;

    const events = await Event.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Event.countDocuments(query);

    res.json({
      success: true,
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get my events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your events',
      error: error.message
    });
  }
};

export const getMyRegisteredEvents = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { user: req.user._id };
    if (status) query.status = status;

    const rsvps = await RSVP.find(query)
      .populate('event', 'title startDate endDate location coverImage status')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await RSVP.countDocuments(query);

    res.json({
      success: true,
      rsvps,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get registered events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your registered events',
      error: error.message
    });
  }
};

export const publishEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Only admins can publish events"
      });
    }

    if (event.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to publish this event'
      });
    }

    event.status = 'published';
    event.publishedAt = new Date();
    await event.save();

    res.json({
      success: true,
      message: 'Event published successfully',
      event
    });
  } catch (error) {
    console.error('Publish event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to publish event',
      error: error.message
    });
  }
};

export const cancelEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Only admins can cancel events"
      });
    }

    if (event.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to cancel this event'
      });
    }

    event.status = 'cancelled';
    await event.save();

    await RSVP.updateMany(
      { event: req.params.id, status: { $in: ['pending', 'confirmed'] } },
      { status: 'cancelled' }
    );

    res.json({
      success: true,
      message: 'Event cancelled successfully',
      event
    });
  } catch (error) {
    console.error('Cancel event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel event',
      error: error.message
    });
  }
};

export const getEventStats = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Only admins can view event statistics"
      });
    }

    const isCreator = event.creator.toString() === req.user._id.toString();
    const isOrganizer = event.organizers.some(org => 
      org.user.toString() === req.user._id.toString() && 
      org.permissions.includes('view_reports')
    );

    if (!isCreator && !isOrganizer) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view event statistics'
      });
    }

    const stats = await RSVP.getEventStats(req.params.id);
    const totalRSVPs = await RSVP.countDocuments({ event: req.params.id });
    const checkedInCount = await RSVP.countDocuments({ 
      event: req.params.id, 
      'checkIn.checkedIn': true 
    });

    res.json({
      success: true,
      stats: {
        totalRSVPs,
        checkedInCount,
        statusBreakdown: stats,
        views: event.analytics.views,
        uniqueViews: event.analytics.uniqueViews,
        shares: event.analytics.shares
      }
    });
  } catch (error) {
    console.error('Get event stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event statistics',
      error: error.message
    });
  }
};

export const getEventCategories = async (req, res) => {
  try {
    const categories = await Event.distinct('category');
    
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};
