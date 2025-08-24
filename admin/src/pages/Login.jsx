import { useState } from 'react';
import { Shield, Eye, EyeOff } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@Occasio.com';
  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123456';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.email === adminEmail && formData.password === adminPassword) {
      const adminUser = {
        _id: 'admin-user',
        fullName: 'Admin User',
        email: adminEmail,
        role: 'admin',
        method: 'local',
        isEmailVerified: true,
        profilePicture: '',
        createdAt: new Date(),
        lastLogin: new Date()
      };

      setTimeout(() => {
        onLogin(adminUser);
        setLoading(false);
      }, 1000);
    } else {
      setError('Invalid admin credentials');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  return (
    <div className='w-screen flex items-center justify-center'>
    <div className="flex items-center justify-center rounded-xl border-2 border-gray-400 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full border-1 border-gray-300 shadow-lg">
            <img src={'./logo(full).png'} alt="logo" className='w-36' />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access the admin panel
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-sm">
              <div className="flex items-center">
                {error}
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm shadow-sm hover:shadow-md transition-all duration-200"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-4 py-3 pr-12 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm shadow-sm hover:shadow-md transition-all duration-200"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-1 border-gray-400 text-sm font-medium rounded-xl text-black hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl shadow-sm">
            <p className="text-xs text-blue-700 text-center">
              <strong>Development Credentials:</strong><br />
              Email: {adminEmail}<br />
              Password: {adminPassword}
            </p>
          </div>
        </form>
      </div>
    </div>
    </div>
  );
};

export default Login;
