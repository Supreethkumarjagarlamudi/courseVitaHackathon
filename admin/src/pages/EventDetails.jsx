import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, MapPin, Users, Eye } from 'lucide-react';

const EventDetails = ({ backendUrl }) => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${backendUrl}/api/events/${id}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setEvent(data.event);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Fetch event details error:', error);
      setError('Failed to fetch event details');
    } finally {
      setLoading(false);
    }
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

  if (!event) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Event not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
          <p className="text-gray-600 mt-2">{event.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Date & Time</p>
                    <p className="text-sm text-gray-600">
                      {new Date(event.startDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(event.startDate).toLocaleTimeString()} - {new Date(event.endDate).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Location</p>
                    <p className="text-sm text-gray-600">{event.location?.venue || 'TBD'}</p>
                    <p className="text-sm text-gray-600">{event.location?.address}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Users className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Capacity</p>
                    <p className="text-sm text-gray-600">
                      {event.currentAttendees || 0} / {event.capacity} attendees
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Eye className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Views</p>
                    <p className="text-sm text-gray-600">{event.analytics?.views || 0} views</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Status</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Status</span>
                  <p className="text-sm text-gray-900 capitalize">{event.status}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Category</span>
                  <p className="text-sm text-gray-900">{event.category}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Event Type</span>
                  <p className="text-sm text-gray-900 capitalize">{event.eventType}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
