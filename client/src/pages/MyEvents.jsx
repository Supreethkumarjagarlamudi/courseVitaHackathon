import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { OccasioContext } from '../context/OccasioContext';
import QRCodeDisplay from '../components/QRCodeDisplay';

const MyEvents = () => {
  const { user, backendUrl } = useContext(OccasioContext);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedRSVP, setSelectedRSVP] = useState(null);
  const [qrCodeData, setQrCodeData] = useState('');

  useEffect(() => {
    fetchRegisteredEvents();
  }, []);

  const fetchRegisteredEvents = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${backendUrl}/api/my-registered-events`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setRegisteredEvents(data.rsvps);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Fetch registered events error:', error);
      setError('Failed to fetch your registered events');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'waitlisted': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
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

  const handleAddToCalendar = async (rsvpId) => {
    try {
      const response = await fetch(`${backendUrl}/api/rsvp/${rsvpId}/calendar`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        window.open(data.calendarEvent.googleCalendarUrl, '_blank');
      } else {
        alert('Failed to generate calendar event');
      }
    } catch (error) {
      console.error('Calendar error:', error);
      alert('Failed to add to calendar');
    }
  };

  const handleViewQRCode = async (rsvpId) => {
    try {
      const response = await fetch(`${backendUrl}/api/rsvp/${rsvpId}/qr-code`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setQrCodeData(data.qrCode);
        setSelectedRSVP(data.rsvp);
        setShowQRModal(true);
      } else {
        alert('Failed to generate QR code');
      }
    } catch (error) {
      console.error('QR code error:', error);
      alert('Failed to generate QR code');
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
          <p className="text-gray-600 mt-2">Events I'm registered for</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div>
          {registeredEvents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">
                <i className="fas fa-calendar-check"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No registrations yet</h3>
              <p className="text-gray-600 mb-6">Start exploring and registering for events!</p>
              <Link
                to="/events"
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
              >
                Browse Events
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {registeredEvents.map((rsvp) => (
                <div key={rsvp._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {rsvp.event.coverImage && (
                    <img
                      src={rsvp.event.coverImage.url}
                      alt={rsvp.event.coverImage.alt || rsvp.event.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {rsvp.event.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rsvp.status)}`}>
                        {rsvp.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <i className="fas fa-calendar mr-2"></i>
                        {formatDate(rsvp.event.startDate)}
                      </div>
                      <div className="flex items-center">
                        <i className="fas fa-map-marker-alt mr-2"></i>
                        {rsvp.event.location?.venue || rsvp.event.location?.city || 'Location TBD'}
                      </div>
                      {rsvp.ticketType && (
                        <div className="flex items-center">
                          <i className="fas fa-ticket-alt mr-2"></i>
                          {rsvp.ticketType.name} - ${rsvp.ticketType.price}
                        </div>
                      )}
                      {rsvp.payment && rsvp.payment.status === 'completed' && (
                        <div className="flex items-center text-green-600">
                          <i className="fas fa-check-circle mr-2"></i>
                          Payment completed
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to={`/events/${rsvp.event._id}`}
                        className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-center hover:bg-gray-200 transition-colors"
                      >
                        View Event
                      </Link>
                      <button
                        onClick={() => handleAddToCalendar(rsvp._id)}
                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Add to Calendar
                      </button>
                    </div>
                    
                    {rsvp.status === 'confirmed' && (
                      <div className="mt-3">
                        <button
                          onClick={() => handleViewQRCode(rsvp._id)}
                          className="w-full bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors"
                        >
                          <i className="fas fa-qrcode mr-2"></i>
                          View QR Code
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">QR Code</h2>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            {selectedRSVP && (
              <div className="mb-4">
                <h3 className="font-medium text-gray-900">{selectedRSVP.event.title}</h3>
                <p className="text-sm text-gray-600">
                  {new Date(selectedRSVP.event.startDate).toLocaleDateString()}
                </p>
              </div>
            )}
            
            <div className="text-center">
              <QRCodeDisplay 
                data={qrCodeData} 
                size={250}
                className="mb-4"
              />
              <p className="text-sm text-gray-600">
                Show this QR code at the event entrance for check-in
              </p>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowQRModal(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyEvents;
