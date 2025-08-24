import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { OccasioContext } from '../context/OccasioContext';
import PaymentModal from '../components/PaymentModal.jsx';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  DollarSign, 
  ArrowLeft,
  CheckCircle,
  XCircle
} from 'lucide-react';

const EventDetails = () => {
  const { eventId } = useParams();
  const { user, backendUrl } = useContext(OccasioContext);
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [userRSVP, setUserRSVP] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchEventDetails();
    if (user) {
      checkUserRegistration();
    }
  }, [eventId, user]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/api/events/${eventId}`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        setEvent(data.event);
        if (data.event.pricing.type === 'free') {
          setSelectedTicket({
            name: 'General Admission',
            price: 0,
            quantity: 1
          });
        }
      } else {
        setError(data.message || 'Failed to fetch event details');
      }
    } catch (error) {
      console.error('Fetch event error:', error);
      setError('Failed to fetch event details');
    } finally {
      setLoading(false);
    }
  };

  const checkUserRegistration = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/my-registered-events`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        const userEvent = data.rsvps.find(rsvp => rsvp.event._id === eventId);
        if (userEvent) {
          setIsRegistered(true);
          setUserRSVP(userEvent);
        }
      }
    } catch (error) {
      console.error('Check registration error:', error);
    }
  };

  const handleRegister = async () => {
    if (!user) {
      alert('Please login to register for events');
      return;
    }

    if (!selectedTicket) {
      alert('Please select a ticket type');
      return;
    }

    if (selectedTicket.price > 0) {
      setShowRegistrationModal(false);
      setShowPaymentModal(true);
    } else {
      setRegistering(true);
      try {
        const response = await fetch(`${backendUrl}/api/events/${eventId}/rsvp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            ticketType: selectedTicket
          })
        });

        const data = await response.json();

        if (data.success) {
          setShowRegistrationModal(false);
          navigate(`/registration-success/${data.rsvp._id}`);
        } else {
          alert(data.message || 'Failed to register for event');
        }
      } catch (error) {
        console.error('Register error:', error);
        alert('Failed to register for event');
      } finally {
        setRegistering(false);
      }
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
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

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-xl mb-4">Event not found</div>
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
        <div className="mb-6">
          <Link
            to="/events"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          {event.coverImage && (
            <div className="h-64 bg-gray-200">
              <img
                src={event.coverImage.url}
                alt={event.coverImage.alt || event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6">
            <div className="mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(getEventStatus(event))}`}>
                {getEventStatus(event)}
              </span>
            </div>

            <div className="mb-4">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
              <div className="flex items-center text-gray-600">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                  {event.category}
                </span>
                {event.tags && event.tags.length > 0 && (
                  <div className="ml-4 flex gap-2">
                    {event.tags.map(tag => (
                      <span key={tag} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <Calendar className="h-5 w-5 mr-3 text-gray-400" />
                  <div>
                    <div className="font-medium">{formatTime(event.startDate)}</div>
                    <div className="text-sm text-gray-500">
                      {formatTime(event.startDate)} - {formatTime(event.endDate)}
                    </div>
                  </div>
                </div>

                {event.eventType !== 'virtual' && event.location?.venue && (
                  <div className="flex items-center text-gray-700">
                    <MapPin className="h-5 w-5 mr-3 text-gray-400" />
                    <div>
                      <div className="font-medium">{event.location.venue}</div>
                      {event.location.address && (
                        <div className="text-sm text-gray-500">{event.location.address}</div>
                      )}
                      {event.location.city && (
                        <div className="text-sm text-gray-500">{event.location.city}</div>
                      )}
                    </div>
                  </div>
                )}

                {event.eventType !== 'in-person' && event.virtualEvent?.platform && (
                  <div className="flex items-center text-gray-700">
                    <Clock className="h-5 w-5 mr-3 text-gray-400" />
                    <div>
                      <div className="font-medium">Virtual Event</div>
                      <div className="text-sm text-gray-500">{event.virtualEvent.platform}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <Users className="h-5 w-5 mr-3 text-gray-400" />
                  <div>
                    <div className="font-medium">Capacity</div>
                    <div className="text-sm text-gray-500">
                      {event.currentAttendees || 0} / {event.capacity} registered
                    </div>
                  </div>
                </div>

                <div className="flex items-center text-gray-700">
                  <DollarSign className="h-5 w-5 mr-3 text-gray-400" />
                  <div>
                    <div className="font-medium">Pricing</div>
                    <div className="text-sm text-gray-500 capitalize">
                      {event.pricing.type} event
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">About This Event</h3>
              <p className="text-gray-700 leading-relaxed">{event.description}</p>
            </div>

            {!isRegistered && getEventStatus(event) !== 'Cancelled' && getEventStatus(event) !== 'Completed' && (
              <button
                onClick={() => setShowRegistrationModal(true)}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Register for Event
              </button>
            )}

            {isRegistered && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium">You're registered for this event!</span>
                </div>
                <div className="mt-2 text-sm text-green-700">
                  Status: {userRSVP?.status === 'confirmed' ? 'Confirmed' : 
                          userRSVP?.status === 'pending' ? 'Pending Approval' : 
                          userRSVP?.status === 'waitlisted' ? 'Waitlisted' : userRSVP?.status}
                </div>
              </div>
            )}

            {getEventStatus(event) === 'Cancelled' && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-center">
                  <XCircle className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-red-800 font-medium">This event has been cancelled</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {showRegistrationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Ticket Type</h2>
            
            {event.pricing.type === 'free' ? (
              <div className="mb-4">
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-green-800 font-medium">Free Event</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Available Tickets</h3>
                <div className="space-y-2">
                  {event.pricing.tickets.map((ticket, index) => (
                    <div
                      key={index}
                      className={`border rounded-md p-3 cursor-pointer transition-colors ${
                        selectedTicket?.name === ticket.name
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedTicket({
                        ...ticket,
                        quantity: 1
                      })}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{ticket.name}</div>
                          <div className="text-sm text-gray-500">
                            {ticket.quantity - (ticket.sold || 0)} available
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {event.pricing.currency === 'USD' ? '$' : 
                             event.pricing.currency === 'EUR' ? '€' : 
                             event.pricing.currency === 'GBP' ? '£' : '₹'}
                            {ticket.price}
                          </div>
                          {ticket.description && (
                            <div className="text-xs text-gray-500">{ticket.description}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => setShowRegistrationModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
              onClick={handleRegister}
              disabled={registering || !selectedTicket}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {registering ? 'Registering...' : selectedTicket?.price > 0 ? 'Continue to Payment' : 'Register'}
            </button>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          event={event}
          selectedTicket={selectedTicket}
          backendUrl={backendUrl}
          user={user}
        />
      )}
      </div>
    </div>
  );
};

export default EventDetails;
