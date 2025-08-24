import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Clock,
  Eye,
  CheckCircle,
  AlertCircle,
  Plus,
  Settings
} from 'lucide-react';

const Dashboard = ({ backendUrl }) => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalAttendees: 0,
    upcomingEvents: 0,
    totalViews: 0,
    confirmedRSVPs: 0,
    pendingRSVPs: 0
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@coursevita.com';
      const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123456';

      // Fetch admin's events
      const eventsResponse = await fetch(`${backendUrl}/api/admin/my-events`, {
        headers: {
          'x-admin-email': adminEmail,
          'x-admin-password': adminPassword
        }
      });
      const eventsData = await eventsResponse.json();

      if (eventsData.success) {
        const events = eventsData.events;
        const now = new Date();
        
        const totalEvents = events.length;
        const activeEvents = events.filter(event => event.status === 'published').length;
        const upcomingEvents = events.filter(event => 
          event.status === 'published' && new Date(event.startDate) > now
        ).length;
        
        const totalAttendees = events.reduce((sum, event) => sum + (event.currentAttendees || 0), 0);
        const totalViews = events.reduce((sum, event) => sum + (event.analytics?.views || 0), 0);
        
        const recent = events
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        setStats({
          totalEvents,
          activeEvents,
          totalAttendees,
          upcomingEvents,
          totalViews,
          confirmedRSVPs: totalAttendees,
          pendingRSVPs: 0 
        });
        setRecentEvents(recent);
      } else {
        setError(eventsData.message);
      }
    } catch (error) {
      console.error('Fetch dashboard data error:', error);
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
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
      case 'Upcoming': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Ongoing': return 'bg-green-100 text-green-800 border-green-200';
      case 'Completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'Draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome back!</h1>
          <p className="text-gray-600 text-lg">Here's what's happening with your events</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl shadow-sm">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          </div>
        )}

        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            <Link
              to="/events/create"
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="h-5 w-5" />
              Create New Event
            </Link>
            <Link
              to="/events"
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Calendar className="h-5 w-5" />
              Manage Events
            </Link>
            <Link
              to="/attendees"
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Users className="h-5 w-5" />
              View Attendees
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalEvents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Events</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeEvents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Attendees</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalAttendees}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                <p className="text-3xl font-bold text-gray-900">{stats.upcomingEvents}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl">
                <Eye className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalViews}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl">
                <AlertCircle className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending RSVPs</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pendingRSVPs}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
            <h2 className="text-xl font-semibold text-gray-900">Recent Events</h2>
          </div>
          <div className="p-6">
            {recentEvents.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Calendar className="mx-auto h-16 w-16" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
                <p className="text-gray-600 mb-6">Start creating your first event!</p>
                <Link
                  to="/events/create"
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 inline-flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Plus className="h-5 w-5" />
                  Create Event
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentEvents.map((event) => (
                  <div key={event._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">{event.title}</h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(event.startDate)} • {event.location?.venue || event.location?.city || 'Location TBD'}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(getEventStatus(event))}`}>
                        {getEventStatus(event)}
                      </span>
                      <span className="text-sm text-gray-500 font-medium">
                        {event.currentAttendees || 0} attendees
                      </span>
                      <Link
                        to={`/events/${event._id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                      >
                        Manage
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
