import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import Attendees from './pages/Attendees';
import CheckIn from './pages/CheckIn';
import CheckInEvents from './pages/CheckInEvents';
import Login from './pages/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  const handleLogin = (adminUser) => {
    setIsAuthenticated(true);
    setUser(adminUser);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        <Sidebar user={user} onLogout={handleLogout} />
        <div className="flex-1 min-w-0">
          <Routes>
            <Route path="/" element={<Dashboard backendUrl={backendUrl} />} />
            <Route path="/events" element={<Events backendUrl={backendUrl} />} />
            <Route path="/events/create" element={<CreateEvent backendUrl={backendUrl} />} />
            <Route path="/events/:id" element={<EventDetails backendUrl={backendUrl} />} />
            <Route path="/events/:eventId/edit" element={<EditEvent backendUrl={backendUrl} />} />
            <Route path="/attendees" element={<Attendees backendUrl={backendUrl} />} />
            <Route path="/checkin" element={<CheckInEvents backendUrl={backendUrl} />} />
            <Route path="/checkin/:eventId" element={<CheckIn backendUrl={backendUrl} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
