import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Users, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock,
  Download,
  QrCode
} from 'lucide-react';
import QRCodeDisplay from '../components/QRCodeDisplay';

const Attendees = ({ backendUrl }) => {
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedAttendee, setSelectedAttendee] = useState(null);
  const [qrCodeData, setQrCodeData] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    const eventParam = searchParams.get('event');
    if (eventParam && events.length > 0) {
      setSelectedEvent(eventParam);
    }
  }, [searchParams, events]);

  useEffect(() => {
    if (selectedEvent) {
      fetchAttendees(selectedEvent);
    }
  }, [selectedEvent, filters]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError('');

      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@coursevita.com';
      const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123456';

      const response = await fetch(`${backendUrl}/api/admin/events`, {
        headers: {
          'x-admin-email': adminEmail,
          'x-admin-password': adminPassword
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setEvents(data.events);
        if (data.events.length > 0) {
          setSelectedEvent(data.events[0]._id);
        }
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

  const fetchAttendees = async (eventId) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@coursevita.com';
      const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123456';

      const response = await fetch(`${backendUrl}/api/admin/events/${eventId}/attendees?${params.toString()}`, {
        headers: {
          'x-admin-email': adminEmail,
          'x-admin-password': adminPassword
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setAttendees(data.attendees);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Fetch attendees error:', error);
      setError('Failed to fetch attendees');
    }
  };

  const handleCheckIn = async (rsvpId) => {
    try {
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@coursevita.com';
      const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123456';

      const response = await fetch(`${backendUrl}/api/admin/rsvp/${rsvpId}/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': adminEmail,
          'x-admin-password': adminPassword
        },
        body: JSON.stringify({ location: 'Main Entrance' })
      });
      const data = await response.json();

      if (data.success) {
        fetchAttendees(selectedEvent); 
      } else {
        alert(data.message || 'Failed to check in attendee');
      }
    } catch (error) {
      console.error('Check-in error:', error);
      alert('Failed to check in attendee');
    }
  };

  const handleApproveRSVP = async (rsvpId, action) => {
    try {
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@coursevita.com';
      const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123456';

      const response = await fetch(`${backendUrl}/api/admin/rsvp/${rsvpId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': adminEmail,
          'x-admin-password': adminPassword
        },
        body: JSON.stringify({ action })
      });
      const data = await response.json();

      if (data.success) {
        fetchAttendees(selectedEvent);
      } else {
        alert(data.message || 'Failed to process RSVP');
      }
    } catch (error) {
      console.error('Approve RSVP error:', error);
      alert('Failed to process RSVP');
    }
  };

  const handleViewQRCode = async (attendee) => {
    try {
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@coursevita.com';
      const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123456';

      const response = await fetch(`${backendUrl}/api/admin/rsvp/${attendee._id}/qr-code`, {
        headers: {
          'x-admin-email': adminEmail,
          'x-admin-password': adminPassword
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setQrCodeData(data.qrCode);
        setSelectedAttendee(attendee);
        setShowQRModal(true);
      } else {
        alert('Failed to generate QR code: ' + data.message);
      }
    } catch (error) {
      console.error('QR code error:', error);
      alert('Failed to generate QR code: ' + error.message);
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

  const exportAttendees = () => {
    const csvContent = [
      ['Name', 'Email', 'Status', 'Registration Date', 'Check-in Time', 'Ticket Type'],
      ...attendees.map(attendee => [
        attendee.user.fullName,
        attendee.user.email,
        attendee.status,
        formatDate(attendee.createdAt),
        attendee.checkIn?.checkedIn ? formatDate(attendee.checkIn.checkedInAt) : 'Not checked in',
        attendee.ticketType?.name || 'General Admission'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendees-${selectedEvent}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Attendees</h1>
        <p className="text-gray-600 mt-2">Manage event attendance and check-ins</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Event</label>
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {events.map((event) => (
            <option key={event._id} value={event._id}>
              {event.title} - {formatDate(event.startDate)}
            </option>
          ))}
        </select>
      </div>

      {selectedEvent && (
        <>
          <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search attendees..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="waitlisted">Waitlisted</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={exportAttendees}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Attendees ({attendees.length})</h2>
            </div>
            
            {attendees.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No attendees found</h3>
                <p className="text-gray-600">No one has registered for this event yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Attendee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registration Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ticket Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check-in
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendees.map((attendee) => (
                      <tr key={attendee._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{attendee.user.fullName}</div>
                            <div className="text-sm text-gray-500">{attendee.user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(attendee.createdAt)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {attendee.ticketType?.name || 'General Admission'}
                          </div>
                          {attendee.ticketType?.price > 0 && (
                            <div className="text-sm text-gray-500">
                              ${attendee.ticketType.price}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(attendee.status)}`}>
                            {attendee.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {attendee.checkIn?.checkedIn ? (
                            <div className="flex items-center text-green-600">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              <span className="text-sm">Checked in</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-gray-500">
                              <Clock className="h-4 w-4 mr-1" />
                              <span className="text-sm">Not checked in</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            {!attendee.checkIn?.checkedIn && attendee.status === 'confirmed' && (
                              <button
                                onClick={() => handleCheckIn(attendee._id)}
                                className="text-green-600 hover:text-green-900"
                                title="Check In"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            )}
                            {attendee.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApproveRSVP(attendee._id, 'approve')}
                                  className="text-green-600 hover:text-green-900"
                                  title="Approve"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleApproveRSVP(attendee._id, 'reject')}
                                  className="text-red-600 hover:text-red-900"
                                  title="Reject"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleViewQRCode(attendee)}
                              className="text-blue-600 hover:text-blue-900"
                              title="View QR Code"
                            >
                              <QrCode className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Attendee QR Code</h2>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            {selectedAttendee && (
              <div className="mb-4">
                <h3 className="font-medium text-gray-900">{selectedAttendee.user.fullName}</h3>
                <p className="text-sm text-gray-600">{selectedAttendee.user.email}</p>
                <p className="text-sm text-gray-500">
                  Status: {selectedAttendee.status}
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
                QR Code for event check-in
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

export default Attendees;
