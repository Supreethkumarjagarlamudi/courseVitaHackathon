import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Plus, 
  LogOut,
  Settings,
  CheckCircle
} from 'lucide-react';

const Sidebar = ({ user, onLogout }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'Create Event', href: '/events/create', icon: Plus },
    { name: 'Attendees', href: '/attendees', icon: Users },
    { name: 'Check-In', href: '/checkin', icon: CheckCircle },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex flex-col w-64 bg-gradient-to-b from-blue-900 to-blue-800 shadow-xl">
      <div className="flex items-center justify-center h-16 px-4 border-b border-blue-700 bg-gradient-to-br from-gray-50 to-blue-50">
        <img src={'./logo(full).png'} alt="" />
      </div>

      <div className="p-4 border-b border-blue-700">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">
              {user?.fullName?.charAt(0) || 'A'}
            </span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">{user?.fullName}</p>
            <p className="text-xs text-blue-200">{user?.email}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-blue-100 hover:bg-blue-700 hover:text-white'
              }`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-blue-700">
        <button
          onClick={onLogout}
          className="flex items-center w-full px-3 py-3 text-sm font-medium text-black rounded-lg hover:bg-blue-700 hover:text-white transition-all duration-200"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
