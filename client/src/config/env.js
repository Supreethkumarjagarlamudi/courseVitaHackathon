// Environment configuration for the client
// In production, these should be set as environment variables
// For development, you can modify these values directly

export const config = {
  // Razorpay configuration
  RAZORPAY_KEY_ID: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_your_test_key_here',
  
  // Backend URL
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000',
  
  // Other configuration
  APP_NAME: 'CourseVita Events',
  APP_VERSION: '1.0.0'
};

// Helper function to check if Razorpay is properly configured
export const isRazorpayConfigured = () => {
  return config.RAZORPAY_KEY_ID && 
         config.RAZORPAY_KEY_ID !== 'rzp_test_your_test_key_here' &&
         config.RAZORPAY_KEY_ID.startsWith('rzp_');
};

// Helper function to get configuration status
export const getConfigStatus = () => {
  return {
    razorpay: isRazorpayConfigured(),
    backend: !!config.BACKEND_URL,
    isConfigured: isRazorpayConfigured() && !!config.BACKEND_URL
  };
};

export default config;
