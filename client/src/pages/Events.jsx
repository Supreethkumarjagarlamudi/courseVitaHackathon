import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { OccasioContext } from '../context/OccasioContext';

const Events = () => {
  const { user, backendUrl } = useContext(OccasioContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    eventType: '',
    search: ''
  });

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.eventType) params.append('eventType', filters.eventType);
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(`${backendUrl}/api/events?${params.toString()}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setEvents(data.events);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Fetch events error:', error);
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };



  const getEventStatus = (event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    if (event.status === 'cancelled') return 'Cancelled';
    if (now < startDate) return 'Upcoming';
    if (now >= startDate && now <= endDate) return 'Ongoing';
    if (now > endDate) return 'Completed';
    return event.status;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Upcoming': return 'bg-blue-100 text-blue-800';
      case 'Ongoing': return 'bg-green-100 text-green-800';
      case 'Completed': return 'bg-gray-100 text-gray-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const categories = [
    'Technology', 'Business', 'Education', 'Health & Wellness', 
    'Arts & Culture', 'Sports', 'Food & Drink', 'Music', 
    'Networking', 'Workshop', 'Conference', 'Meetup', 'Other'
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-600 mt-2">Discover and register for amazing events</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search events..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
              <select
                value={filters.eventType}
                onChange={(e) => setFilters(prev => ({ ...prev, eventType: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="in-person">In-Person</option>
                <option value="virtual">Virtual</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">
              <i className="fas fa-calendar-times"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600">Try adjusting your filters or check back later for new events.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {event.coverImage && (
                  <img
                    src={event.coverImage.url}
                    alt={event.coverImage.alt || event.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {event.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(getEventStatus(event))}`}>
                      {getEventStatus(event)}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {event.shortDescription || event.description}
                  </p>
                  
                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <i className="fas fa-calendar mr-2"></i>
                      {formatDate(event.startDate)}
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-map-marker-alt mr-2"></i>
                      {event.location?.venue || event.location?.city || 'Location TBD'}
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-users mr-2"></i>
                      {event.currentAttendees}/{event.capacity} attendees
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-tag mr-2"></i>
                      {event.category}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link
                      to={`/events/${event._id}`}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-center hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
