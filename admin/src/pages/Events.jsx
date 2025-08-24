import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Edit, Trash2, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';

const Events = ({ backendUrl }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError('');

      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@coursevita.com';
      const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123456';

      const response = await fetch(`${backendUrl}/api/admin/my-events`, {
        headers: {
          'x-admin-email': adminEmail,
          'x-admin-password': adminPassword
        }
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

  const handlePublish = async (eventId) => {
    try {
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@coursevita.com';
      const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123456';

      const response = await fetch(`${backendUrl}/api/admin/events/${eventId}/publish`, {
        method: 'POST',
        headers: {
          'x-admin-email': adminEmail,
          'x-admin-password': adminPassword
        }
      });

      const data = await response.json();

      if (data.success) {
        fetchEvents();
      } else {
        alert(data.message || 'Failed to publish event');
      }
    } catch (error) {
      console.error('Publish event error:', error);
      alert('Failed to publish event');
    }
  };

  const handleCancel = async (eventId) => {
    if (!confirm('Are you sure you want to cancel this event?')) {
      return;
    }

    try {
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@coursevita.com';
      const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123456';

      const response = await fetch(`${backendUrl}/api/admin/events/${eventId}/cancel`, {
        method: 'POST',
        headers: {
          'x-admin-email': adminEmail,
          'x-admin-password': adminPassword
        }
      });

      const data = await response.json();

      if (data.success) {
        fetchEvents();
      } else {
        alert(data.message || 'Failed to cancel event');
      }
    } catch (error) {
      console.error('Cancel event error:', error);
      alert('Failed to cancel event');
    }
  };

  const handleDelete = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@coursevita.com';
      const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123456';

      const response = await fetch(`${backendUrl}/api/admin/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'x-admin-email': adminEmail,
          'x-admin-password': adminPassword
        }
      });

      const data = await response.json();

      if (data.success) {
        fetchEvents();
      } else {
        alert(data.message || 'Failed to delete event');
      }
    } catch (error) {
      console.error('Delete event error:', error);
      alert('Failed to delete event');
    }
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    if (event.status === 'cancelled') return 'Cancelled';
    if (event.status === 'draft') return 'Draft';
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
      case 'Draft': return 'bg-yellow-100 text-yellow-800';
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

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || getEventStatus(event) === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Events</h1>
              <p className="text-gray-600 mt-2">Manage your events</p>
            </div>
            <Link
              to="/events/create"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Event
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="Draft">Draft</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Get started by creating your first event'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Link
                to="/events/create"
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Event
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div key={event._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {event.coverImage && (
                  <div className="h-48 bg-gray-200">
                    <img
                      src={event.coverImage.url}
                      alt={event.coverImage.alt || event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
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
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(event.startDate)}
                    </div>
                    {event.location?.venue && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {event.location.venue}
                      </div>
                    )}
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      {event.currentAttendees || 0} / {event.capacity} attendees
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/events/${event._id}`}
                      className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-center hover:bg-gray-200 transition-colors flex items-center justify-center"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Link>
                    
                    <Link
                      to={`/events/${event._id}/edit`}
                      className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-center hover:bg-blue-200 transition-colors flex items-center justify-center"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Link>
                    
                    <Link
                      to={`/attendees?event=${event._id}`}
                      className="flex-1 bg-green-100 text-green-700 px-3 py-2 rounded-md text-center hover:bg-green-200 transition-colors flex items-center justify-center"
                    >
                      <Users className="h-4 w-4 mr-1" />
                      Attendees
                    </Link>
                    
                    <Link
                      to={`/checkin/${event._id}`}
                      className="flex-1 bg-purple-100 text-purple-700 px-3 py-2 rounded-md text-center hover:bg-purple-200 transition-colors flex items-center justify-center"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Check-In
                    </Link>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    {event.status === 'draft' && (
                      <button
                        onClick={() => handlePublish(event._id)}
                        className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Publish
                      </button>
                    )}
                    
                    {event.status === 'published' && getEventStatus(event) === 'Upcoming' && (
                      <button
                        onClick={() => handleCancel(event._id)}
                        className="flex-1 bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancel
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDelete(event._id)}
                      className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded-md hover:bg-red-200 transition-colors flex items-center justify-center"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </button>
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
