import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Users, 
  CheckCircle,
  Clock,
  Search
} from 'lucide-react';

const CheckInEvents = ({ backendUrl }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@coursevita.com';
      const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123456';

      console.log('Fetching events with admin credentials...');
      
      const response = await fetch(`${backendUrl}/api/admin/events`, {
        headers: {
          'x-admin-email': adminEmail,
          'x-admin-password': adminPassword
        }
      });
      const data = await response.json();

      console.log('Events response:', data);

      if (data.success) {
        console.log('Total events fetched:', data.events.length);
        
        const allPublishedEvents = data.events.filter(event => event.status === 'published');
        console.log('Published events:', allPublishedEvents.length);
        
        const checkInEvents = data.events.filter(event => 
          event.status === 'published'
        );
        
        console.log('Events with attendees:', checkInEvents.length);
        console.log('Events data:', data.events.map(e => ({
          title: e.title,
          status: e.status,
          currentAttendees: e.currentAttendees,
          capacity: e.capacity
        })));
        
        setEvents(checkInEvents);
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

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location?.venue?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEventStatus = (event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    if (now < startDate) {
      return 'Upcoming';
    } else if (now >= startDate && now <= endDate) {
      return 'Ongoing';
    } else {
      return 'Past';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Upcoming': return 'bg-blue-100 text-blue-800';
      case 'Ongoing': return 'bg-green-100 text-green-800';
      case 'Past': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Event Check-In</h1>
          <p className="text-gray-600 mt-2">Select an event to manage check-ins</p>
        </div>

        <div className="mb-6">
          <div className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search events..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No events found' : 'No events available for check-in'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Events with registered attendees will appear here'
              }
            </p>
            
            {!searchTerm && (
              <div className="bg-gray-50 p-4 rounded-lg max-w-md mx-auto">
                <p className="text-sm text-gray-500 mb-2">Debug Info:</p>
                <p className="text-xs text-gray-400">
                  Total events: {events.length} | 
                  Published events: {events.filter(e => e.status === 'published').length} | 
                  Events with attendees: {events.filter(e => e.currentAttendees > 0).length}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Make sure events are published and have confirmed RSVPs
                </p>
              </div>
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
                      {event.currentAttendees === 0 && (
                        <span className="ml-2 text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                          No attendees yet
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <Link
                    to={`/checkin/${event._id}`}
                    className={`w-full px-4 py-2 rounded-md transition-colors flex items-center justify-center ${
                      event.currentAttendees > 0 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    onClick={(e) => {
                      if (event.currentAttendees === 0) {
                        e.preventDefault();
                        alert('This event has no attendees yet. Check-in will be available once people register.');
                      }
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {event.currentAttendees > 0 ? 'Manage Check-In' : 'No Attendees'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckInEvents;
