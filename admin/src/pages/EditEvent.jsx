import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Save, DollarSign, Upload, X, ArrowLeft } from 'lucide-react';

const EditEvent = ({ backendUrl }) => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    eventType: 'in-person',
    startDate: '',
    endDate: '',
    venue: '',
    address: '',
    city: '',
    capacity: 100,
    shortDescription: '',
    pricing: {
      type: 'free',
      currency: 'USD',
      tickets: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [newTicket, setNewTicket] = useState({
    name: '',
    price: 0,
    quantity: 100,
    description: ''
  });
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const categories = [
    'Technology', 'Business', 'Education', 'Health & Wellness', 
    'Arts & Culture', 'Sports', 'Food & Drink', 'Music', 
    'Networking', 'Workshop', 'Conference', 'Meetup', 'Other'
  ];

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@coursevita.com';
      const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123456';

      const response = await fetch(`${backendUrl}/api/admin/events/${eventId}`, {
        headers: {
          'x-admin-email': adminEmail,
          'x-admin-password': adminPassword
        }
      });

      const data = await response.json();

      if (data.success) {
        const event = data.event;
        setFormData({
          title: event.title || '',
          description: event.description || '',
          category: event.category || '',
          eventType: event.eventType || 'in-person',
          startDate: event.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : '',
          endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
          venue: event.location?.venue || '',
          address: event.location?.address || '',
          city: event.location?.city || '',
          capacity: event.capacity || 100,
          shortDescription: event.shortDescription || '',
          pricing: event.pricing || {
            type: 'free',
            currency: 'INR',
            tickets: []
          }
        });
        setImages(event.images || []);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const eventData = {
        ...formData,
        location: {
          venue: formData.venue,
          address: formData.address,
          city: formData.city
        },
        images: images,
        coverImage: images.find(img => img.isPrimary) || images[0]
      };

      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@coursevita.com';
      const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123456';

      const response = await fetch(`${backendUrl}/api/admin/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': adminEmail,
          'x-admin-password': adminPassword
        },
        body: JSON.stringify(eventData)
      });

      const data = await response.json();

      if (data.success) {
        navigate('/events');
      } else {
        setError(data.message || 'Failed to update event');
      }
    } catch (error) {
      console.error('Update event error:', error);
      setError('Failed to update event');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handlePricingChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [name]: value
      }
    }));
  };

  const addTicket = () => {
    if (newTicket.name.trim()) {
      setFormData(prev => ({
        ...prev,
        pricing: {
          ...prev.pricing,
          tickets: [...prev.pricing.tickets, { ...newTicket }]
        }
      }));
      setNewTicket({
        name: '',
        price: 0,
        quantity: 100,
        description: ''
      });
    }
  };

  const removeTicket = (index) => {
    setFormData(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        tickets: prev.pricing.tickets.filter((_, i) => i !== index)
      }
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    console.log('Files selected:', files);
    setUploading(true);

    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@coursevita.com';
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123456';

    try {
      for (const file of files) {
        console.log('Processing file:', file.name, 'Size:', file.size, 'Type:', file.type);
        
        if (!file.type.startsWith('image/')) {
          alert(`Invalid file type: ${file.name} is not an image file`);
          continue;
        }
        
        if (file.size > 5 * 1024 * 1024) {
          alert(`File too large: ${file.name} is ${(file.size / (1024 * 1024)).toFixed(2)}MB (max 5MB)`);
          continue;
        }

        const formData = new FormData();
        formData.append('image', file);

        console.log('Uploading to:', `${backendUrl}/api/admin/upload`);
        
        const response = await fetch(`${backendUrl}/api/admin/upload`, {
          method: 'POST',
          headers: {
            'x-admin-email': adminEmail,
            'x-admin-password': adminPassword
          },
          body: formData
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Upload failed:', errorText);
          alert(`Failed to upload ${file.name}: HTTP ${response.status} - ${errorText}`);
          continue;
        }

        const data = await response.json();
        console.log('Upload response:', data);

        if (data.success) {
          setImages(prev => [...prev, {
            url: data.data.url,
            public_id: data.data.public_id,
            alt: file.name
          }]);
          console.log('Image uploaded successfully:', file.name);
        } else {
          console.error('Upload failed:', data.message);
          alert(`Failed to upload ${file.name}: ${data.message}`);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Failed to upload images: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const setPrimaryImage = (index) => {
    setImages(prev => prev.map((img, i) => ({
      ...img,
      isPrimary: i === index
    })));
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
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => navigate('/events')}
              className="mr-4 text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
          </div>
          <p className="text-gray-600 mt-2">Update the event details</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter event title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Short Description
                  </label>
                  <input
                    type="text"
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description for event cards"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Description *
                  </label>
                  <textarea
                    name="description"
                    required
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Detailed description of the event"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      name="category"
                      required
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Type *
                    </label>
                    <select
                      name="eventType"
                      required
                      value={formData.eventType}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="in-person">In Person</option>
                      <option value="virtual">Virtual</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Date and Time
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    required
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    required
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Location
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Venue
                  </label>
                  <input
                    type="text"
                    name="venue"
                    value={formData.venue}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Venue name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Street address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="City"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Capacity
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Attendees
                </label>
                <input
                  type="number"
                  name="capacity"
                  min="1"
                  value={formData.capacity}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Maximum number of attendees"
                />
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Event Images
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Images
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {uploading && (
                    <p className="text-sm text-blue-600 mt-1">Uploading images...</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Supported formats: JPG, PNG, GIF. Max file size: 5MB
                  </p>
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image.url}
                          alt={image.alt}
                          className="w-full h-32 object-cover rounded-md"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setPrimaryImage(index)}
                            className="bg-blue-600 text-white p-1 rounded hover:bg-blue-700"
                            title="Set as primary"
                          >
                            ★
                          </button>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="bg-red-600 text-white p-1 rounded hover:bg-red-700"
                            title="Remove image"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        {image.isPrimary && (
                          <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs">
                            Primary
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Pricing
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pricing Type
                    </label>
                    <select
                      name="type"
                      value={formData.pricing.type}
                      onChange={handlePricingChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="free">Free</option>
                      <option value="paid">Paid</option>
                      <option value="donation">Donation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency
                    </label>
                    <select
                      name="currency"
                      value={formData.pricing.currency}
                      onChange={handlePricingChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="INR">INR (₹)</option>
                    </select>
                  </div>
                </div>

                {formData.pricing.type === 'paid' && (
                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-900">Ticket Types</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={newTicket.name}
                        onChange={(e) => setNewTicket(prev => ({ ...prev, name: e.target.value }))}
                        className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ticket name"
                      />
                      <input
                        type="number"
                        value={newTicket.price}
                        onChange={(e) => setNewTicket(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                        className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Price"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="number"
                        value={newTicket.quantity}
                        onChange={(e) => setNewTicket(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                        className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Quantity available"
                        min="1"
                      />
                      <button
                        type="button"
                        onClick={addTicket}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Add Ticket Type
                      </button>
                    </div>

                    <div className="space-y-2">
                      {formData.pricing.tickets.map((ticket, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <div>
                            <span className="font-medium">{ticket.name}</span>
                            <span className="text-gray-600 ml-2">
                              {'₹'}
                              {ticket.price} ({ticket.quantity} available)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeTicket(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Event
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEvent;
