import { useState, useEffect, createContext } from "react";

export const OccasioContext = createContext();
export const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const OccasioContextProvider = (props) => {
  const currency = "$"
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/auth/status`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.authenticated) {
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true, data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed' };
    }
  };

  const register = async (fullName, email, password) => {
    try {
      const response = await fetch(`${backendUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ fullName, email, password })
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true, data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${backendUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      
      setUser(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, message: 'Logout failed' };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await fetch(`${backendUrl}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        return { success: true, data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, message: 'Profile update failed' };
    }
  };

  const value = {
    currency,
    backendUrl,
    user,
    setUser,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    checkAuthStatus
  };

  return (
    <OccasioContext.Provider value={value}>{props.children}</OccasioContext.Provider>
  );
}

export default OccasioContextProvider;