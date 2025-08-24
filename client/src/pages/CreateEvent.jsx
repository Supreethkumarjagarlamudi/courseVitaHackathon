import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { OccasioContext } from '../context/OccasioContext';

const CreateEvent = () => {
  const { backendUrl } = useContext(OccasioContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    eventType: 'in-person',
    category: '',
    tags: [],
    startDate: '',
    endDate: '',
    timezone: 'UTC',
    location: {
      venue: '',
      address: '',
      city: '',
      state: '',
      country: '',
      zipCode: ''
    },
    virtualEvent: {
      platform: 'zoom',
      meetingLink: '',
      meetingId: '',
      password: '',
      instructions: ''
    },
    capacity: 100,
    pricing: {
      type: 'free',
      currency: 'USD',
      tickets: []
    },
    settings: {
      allowWaitlist: true,
      requireApproval: false,
      allowCancellations: true,
      allowRefunds: true,
      sendReminders: true
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [newTag, setNewTag] = useState('');
  const [newTicket, setNewTicket] = useState({
    name: '',
    price: 0,
    quantity: 100,
    description: '',
    benefits: []
  });

  const categories = [
    'Technology', 'Business', 'Education', 'Health & Wellness', 
    'Arts & Culture', 'Sports', 'Food & Drink', 'Music', 
    'Networking', 'Workshop', 'Conference', 'Meetup', 'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [name]: value
      }
    }));
  };

  const handleVirtualEventChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      virtualEvent: {
        ...prev.virtualEvent,
        [name]: value
      }
    }));
  };

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
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
        description: '',
        benefits: []
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${backendUrl}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        navigate(`/events/${data.event._id}`);
      } else {
        setError(data.message || 'Failed to create event');
      }
    } catch (error) {
      console.error('Create event error:', error);
      setError('Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Create New Event</h1>
            <p className="text-gray-600 mt-1">Build your perfect event page</p>
          </div>

          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  {step < 4 && (
                    <div className={`w-16 h-1 mx-2 ${
                      currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>Basic Info</span>
              <span>Details</span>
              <span>Pricing</span>
              <span>Settings</span>
            </div>
          </div>

          {error && (
            <div className="mx-6 mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6">
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter event title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description
                  </label>
                  <input
                    type="text"
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleInputChange}
                    maxLength={200}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description (max 200 characters)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Detailed description of your event"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add a tag"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Event Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Type *
                  </label>
                  <select
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="in-person">In-Person</option>
                    <option value="virtual">Virtual</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                {formData.eventType !== 'virtual' && (
                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-900">Location</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        name="venue"
                        value={formData.location.venue}
                        onChange={handleLocationChange}
                        className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Venue name"
                      />
                      <input
                        type="text"
                        name="address"
                        value={formData.location.address}
                        onChange={handleLocationChange}
                        className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Street address"
                      />
                      <input
                        type="text"
                        name="city"
                        value={formData.location.city}
                        onChange={handleLocationChange}
                        className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="City"
                      />
                      <input
                        type="text"
                        name="state"
                        value={formData.location.state}
                        onChange={handleLocationChange}
                        className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="State/Province"
                      />
                    </div>
                  </div>
                )}

                {formData.eventType !== 'in-person' && (
                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-900">Virtual Event Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <select
                        name="platform"
                        value={formData.virtualEvent.platform}
                        onChange={handleVirtualEventChange}
                        className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="zoom">Zoom</option>
                        <option value="teams">Microsoft Teams</option>
                        <option value="google-meet">Google Meet</option>
                        <option value="custom">Custom Platform</option>
                      </select>
                      <input
                        type="text"
                        name="meetingLink"
                        value={formData.virtualEvent.meetingLink}
                        onChange={handleVirtualEventChange}
                        className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Meeting link"
                      />
                    </div>
                    <textarea
                      name="instructions"
                      value={formData.virtualEvent.instructions}
                      onChange={handleVirtualEventChange}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Instructions for joining the virtual event"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacity *
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Maximum number of attendees"
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Pricing & Tickets</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pricing Type
                  </label>
                  <select
                    name="pricing.type"
                    value={formData.pricing.type}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="free">Free</option>
                    <option value="paid">Paid</option>
                    <option value="donation">Donation</option>
                  </select>
                </div>

                {formData.pricing.type === 'paid' && (
                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-900">Ticket Types</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={newTicket.name}
                        onChange={(e) => setNewTicket(prev => ({ ...prev, name: e.target.value }))}
                        className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ticket name"
                      />
                      <input
                        type="number"
                        value={newTicket.price}
                        onChange={(e) => setNewTicket(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                        className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Quantity available"
                        min="1"
                      />
                      <button
                        type="button"
                        onClick={addTicket}
                        className="px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Add Ticket Type
                      </button>
                    </div>

                    <div className="space-y-2">
                      {formData.pricing.tickets.map((ticket, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <div>
                            <span className="font-medium">{ticket.name}</span>
                            <span className="text-gray-600 ml-2">${ticket.price} ({ticket.quantity} available)</span>
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
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Event Settings</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Allow Waitlist</label>
                      <p className="text-sm text-gray-500">Automatically add people to waitlist when event is full</p>
                    </div>
                    <input
                      type="checkbox"
                      name="allowWaitlist"
                      checked={formData.settings.allowWaitlist}
                      onChange={handleSettingsChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Require Approval</label>
                      <p className="text-sm text-gray-500">Manually approve registrations before confirming</p>
                    </div>
                    <input
                      type="checkbox"
                      name="requireApproval"
                      checked={formData.settings.requireApproval}
                      onChange={handleSettingsChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Allow Cancellations</label>
                      <p className="text-sm text-gray-500">Let attendees cancel their registration</p>
                    </div>
                    <input
                      type="checkbox"
                      name="allowCancellations"
                      checked={formData.settings.allowCancellations}
                      onChange={handleSettingsChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Allow Refunds</label>
                      <p className="text-sm text-gray-500">Allow refunds for paid tickets</p>
                    </div>
                    <input
                      type="checkbox"
                      name="allowRefunds"
                      checked={formData.settings.allowRefunds}
                      onChange={handleSettingsChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Send Reminders</label>
                      <p className="text-sm text-gray-500">Automatically send reminder emails to attendees</p>
                    </div>
                    <input
                      type="checkbox"
                      name="sendReminders"
                      checked={formData.settings.sendReminders}
                      onChange={handleSettingsChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Event'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
