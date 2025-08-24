import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { OccasioContext } from '../context/OccasioContext';
import { Calendar, MapPin, Users, ArrowRight, ArrowLeft } from 'lucide-react';

const Home = () => {
  const { backendUrl } = useContext(OccasioContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/events`);
      const data = await response.json();
      
      if (data.success) {
        setEvents(data.events.slice(0, 6));
      }
    } catch (error) {
      console.error('Fetch events error:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % events.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + events.length) % events.length);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white text-black border-1 border-gray-400 rounded-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Discover Amazing Events
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-black">
            Join exciting events, connect with people, and create unforgettable memories
          </p>
          <Link
            to="/events"
            className="inline-flex items-center bg-white text-[#0d437b] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Browse Events
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>

      {events.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Events</h2>
            <p className="text-gray-600">Discover what's happening around you</p>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-xl">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {events.map((event, index) => (
                  <div key={event._id} className="w-full flex-shrink-0">
                    <div className="max-w-4xl mx-auto">
                      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                          <div className="relative">
                            {event.coverImage ? (
                              <img
                                src={event.coverImage.url}
                                alt={event.coverImage.alt}
                                className="w-full h-64 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-full h-64 bg-black text-white rounded-lg flex items-center justify-center">
                                <Calendar className="h-16 w-16 text-white" />
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col justify-center">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                              {event.title}
                            </h3>
                            <p className="text-gray-600 mb-6 line-clamp-3">
                              {event.description}
                            </p>
                            
                            <div className="space-y-3 mb-6">
                              <div className="flex items-center text-gray-700">
                                <Calendar className="h-5 w-5 mr-3 text-blue-500" />
                                <span>{formatDate(event.startDate)}</span>
                              </div>
                              
                              {event.location?.venue && (
                                <div className="flex items-center text-gray-700">
                                  <MapPin className="h-5 w-5 mr-3 text-blue-500" />
                                  <span>{event.location.venue}</span>
                                </div>
                              )}
                              
                              <div className="flex items-center text-gray-700">
                                <Users className="h-5 w-5 mr-3 text-blue-500" />
                                <span>{event.pricing?.type === 'free' ? 'Free Event' : 'Paid Event'}</span>
                              </div>
                            </div>

                            <Link
                              to={`/events/${event._id}`}
                              className="inline-flex items-center bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              View Details
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all"
            >
              <ArrowRight className="h-6 w-6" />
            </button>

            <div className="flex justify-center mt-6 space-x-2">
              {events.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentSlide ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
