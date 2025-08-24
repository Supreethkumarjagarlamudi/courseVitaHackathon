import { useState, useEffect } from 'react'
import { Link, Navigate, useLocation, useNavigate} from 'react-router-dom'
import { useContext } from 'react'
import { OccasioContext } from '../context/OccasioContext'

const Login = () => {
  const { 
    user, 
    isAuthenticated, 
    loading, 
    login, 
    register, 
    backendUrl 
  } = useContext(OccasioContext);
  
  const [currentState, setCurrentState] = useState('Login')
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: ""
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const location = useLocation();
  const navigate = useNavigate();


  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/myEvents');
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const authStatus = params.get("auth");

    if (authStatus === "false") {
      setError("Google login failed, please try again.");
    } else if (authStatus === "true") {
      setSuccess("Google login successful!");
      setTimeout(() => navigate('/myEvents'), 1000);
    }
  }, [location, navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      let result;
      
      if (currentState === 'Login') {
        result = await login(formData.email, formData.password);
      } else {
        result = await register(formData.fullName, formData.email, formData.password);
      }

      if (result.success) {
        setSuccess(result.message || `${currentState} successful!`);
        setTimeout(() => navigate('/'), 1000);
      } else {
        setError(result.message || `${currentState} failed`);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = `${backendUrl}/api/auth/googleOauth`;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return <Navigate to="/myEvents" replace />;
  }

  return (
    <div className='flex flex-col min-h-screen justify-center items-center px-4'>
      <div className="w-full max-w-md">
        <div className="w-full flex justify-center items-center gap-3 text-3xl mb-8">
          <div className="flex items-center justify-center gap-2 text-gray-700">
            {currentState}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className='w-full flex flex-col gap-4'>
          {currentState === "Sign-Up" && (
            <input 
              name="fullName"
              onChange={handleInputChange} 
              value={formData.fullName} 
              type="text" 
              className='w-full p-3 text-gray-600 border border-gray-400 rounded-md focus:outline-none focus:border-blue-500' 
              placeholder='Full Name' 
              required
            />
          )}
          
          <input 
            name="email"
            onChange={handleInputChange} 
            value={formData.email} 
            type="email" 
            className='w-full p-3 text-gray-600 border border-gray-400 rounded-md focus:outline-none focus:border-blue-500' 
            placeholder='Email' 
            required
          />
          
          <input 
            name="password"
            onChange={handleInputChange} 
            value={formData.password} 
            type="password" 
            className='w-full p-3 text-gray-600 border border-gray-400 rounded-md focus:outline-none focus:border-blue-500' 
            placeholder='Password' 
            required
          />
          
          <div className='w-full flex justify-between text-gray-600 text-sm'>
            <Link to="/forgotPassword" className="hover:text-blue-600">Forgot Your Password?</Link>
            <button 
              type="button"
              className="cursor-pointer hover:text-blue-600" 
              onClick={() => {
                setCurrentState(currentState === 'Login' ? 'Sign-Up' : 'Login');
                setError("");
                setSuccess("");
              }}
            >
              {currentState === 'Login' ? 'Create Account' : 'Login here'}
            </button>
          </div>
          
          <button 
            type="submit"
            disabled={isSubmitting}
            className='p-3 text-white cursor-pointer border border-gray-400 text-xl bg-black rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isSubmitting ? 'Processing...' : (currentState === 'Login' ? 'Sign-In' : 'Sign-Up')}
          </button>
        </form>

        <div className='flex justify-center items-center text-xl mt-8'>
          <button 
            onClick={handleGoogleLogin}
            className='border border-gray-400 p-3 rounded-xl hover:bg-gray-50 flex items-center gap-2'
          >
            <i className='fa-brands fa-google'></i>
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login
