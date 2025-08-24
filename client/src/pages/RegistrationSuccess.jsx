import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { OccasioContext } from '../context/OccasioContext';
import { CheckCircle, Download, Calendar, MapPin, QrCode, ArrowLeft } from 'lucide-react';
import QRCodeDisplay from '../components/QRCodeDisplay';

const RegistrationSuccess = () => {
  const { rsvpId } = useParams();
  const { backendUrl } = useContext(OccasioContext);
  const navigate = useNavigate();
  
  const [rsvp, setRsvp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrCodeData, setQrCodeData] = useState('');
  const [qrCodeImage, setQrCodeImage] = useState('');

  useEffect(() => {
    if (rsvpId) {
      fetchRSVPDetails();
    }
  }, [rsvpId]);

  const fetchRSVPDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/api/rsvp/${rsvpId}`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        setRsvp(data.rsvp);
        setQrCodeData(data.qrCode);
        setQrCodeImage(data.qrCodeImage);
      } else {
        setError(data.message || 'Failed to fetch registration details');
      }
    } catch (error) {
      console.error('Fetch RSVP error:', error);
      setError('Failed to fetch registration details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCalendar = async () => {
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

  const downloadTicket = () => {
    const ticketData = {
      event: rsvp.event.title,
      attendee: rsvp.user.fullName,
      date: new Date(rsvp.event.startDate).toLocaleDateString(),
      time: new Date(rsvp.event.startDate).toLocaleTimeString(),
      venue: rsvp.event.location?.venue || 'TBD',
      ticketType: rsvp.ticketType?.name || 'General Admission'
    };

    alert(`Ticket Details:\n${JSON.stringify(ticketData, null, 2)}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <Link
            to="/events"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  if (!rsvp) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-xl mb-4">Registration not found</div>
          <Link
            to="/events"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Registration Successful!
          </h1>
          <p className="text-gray-600">
            You're all set for {rsvp.event.title}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Details</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{rsvp.event.title}</h3>
                <p className="text-gray-600">{rsvp.event.description}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <Calendar className="h-5 w-5 mr-3 text-gray-400" />
                  <div>
                    <div className="font-medium">{formatDate(rsvp.event.startDate)}</div>
                    <div className="text-sm text-gray-500">
                      {formatTime(rsvp.event.startDate)} - {formatTime(rsvp.event.endDate)}
                    </div>
                  </div>
                </div>

                {rsvp.event.location?.venue && (
                  <div className="flex items-center text-gray-700">
                    <MapPin className="h-5 w-5 mr-3 text-gray-400" />
                    <div>
                      <div className="font-medium">{rsvp.event.location.venue}</div>
                      {rsvp.event.location.address && (
                        <div className="text-sm text-gray-500">{rsvp.event.location.address}</div>
                      )}
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="text-sm text-gray-600">Ticket Type</div>
                  <div className="font-medium">{rsvp.ticketType?.name || 'General Admission'}</div>
                  {rsvp.ticketType?.price > 0 && (
                    <div className="text-sm text-gray-500">
                      ${rsvp.ticketType.price}
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 p-3 rounded-md">
                  <div className="text-sm text-blue-600 font-medium">Registration Status</div>
                  <div className="text-blue-800">
                    {rsvp.status === 'confirmed' ? 'Confirmed' : 
                     rsvp.status === 'pending' ? 'Pending Approval' : 
                     rsvp.status === 'waitlisted' ? 'Waitlisted' : rsvp.status}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <QrCode className="h-5 w-5 mr-2" />
              Your QR Code
            </h2>
            
            <div className="text-center">
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <div className="text-xs text-gray-500 mb-2">QR Code for Check-in</div>
                <div className="bg-white p-4 rounded border-2 border-dashed border-gray-300">
                  <QRCodeDisplay 
                    data={qrCodeData} 
                    size={200}
                    className="mb-2"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Show this QR code at the event entrance for check-in
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleAddToCalendar}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Add to Calendar
                </button>

                {/* <button
                  onClick={downloadTicket}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Ticket
                </button> */}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to={`/events/${rsvp.event._id}`}
            className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors"
          >
            View Event Details
          </Link>
          
          <Link
            to="/myEvents"
            className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            View My Events
          </Link>
          
          <Link
            to="/events"
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Browse More Events
          </Link>
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Important Information</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Please arrive 15 minutes before the event starts</li>
            <li>• Bring a valid ID for check-in</li>
            <li>• You can cancel your registration up to 24 hours before the event</li>
            <li>• Check your email for any updates or changes</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSuccess;
