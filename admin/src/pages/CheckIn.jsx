import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { 
  QrCode, 
  Users, 
  CheckCircle, 
  XCircle, 
  Search,
  Camera,
  UserCheck,
  Clock,
  AlertCircle
} from 'lucide-react';
import QRCodeDisplay from '../components/QRCodeDisplay';
import { Html5Qrcode } from 'html5-qrcode';

console.log('Html5Qrcode imported:', Html5Qrcode);
console.log('Html5Qrcode version:', Html5Qrcode?.VERSION);

const CheckIn = ({ backendUrl }) => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState('');
  const [checkInResult, setCheckInResult] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAttendee, setSelectedAttendee] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeData, setQrCodeData] = useState('');
  const [scannerLoading, setScannerLoading] = useState(false);
  
  const scannerRef = useRef(null);

  useEffect(() => {
    if (eventId) {
      fetchEventDetails();
      fetchAttendees();
    }
    
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
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
        setEvent(data.event);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Fetch event details error:', error);
      setError('Failed to fetch event details');
    }
  };

  const fetchAttendees = async () => {
    try {
      setLoading(true);
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@coursevita.com';
      const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123456';

      const response = await fetch(`${backendUrl}/api/admin/events/${eventId}/attendees`, {
        headers: {
          'x-admin-email': adminEmail,
          'x-admin-password': adminPassword
        }
      });
      const data = await response.json();

      if (data.success) {
        setAttendees(data.attendees);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Fetch attendees error:', error);
      setError('Failed to fetch attendees');
    } finally {
      setLoading(false);
    }
  };

  const startScanning = async () => {
    try {
      setScanning(true);
      setScannerLoading(true);
      setCheckInResult(null);
      setError('');
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await startHtml5QrcodeScanner();
      
    } catch (error) {
      console.error('Camera access error:', error);
      setError('Failed to access camera. Please check permissions.');
      setScanning(false);
      setScannerLoading(false);
    }
  };

  const startHtml5QrcodeScanner = async () => {
    try {
      console.log('Creating Html5Qrcode scanner...');
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const container = document.getElementById('scanner-container');
      if (!container) {
        throw new Error('Scanner container not found in DOM');
      }
      
      console.log('Scanner container found:', container);
      
      container.style.display = 'block';
      
      const scanner = new Html5Qrcode('scanner-container');
      scannerRef.current = scanner;
      console.log('Html5Qrcode scanner created successfully:', scanner);
      
      console.log('Starting scanner with camera...');
      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText, decodedResult) => {
          console.log('QR Code detected:', decodedText);
          setScannedData(decodedText);
          stopScanning();
          processQRCode(decodedText);
        },
        (errorMessage) => {
          if (errorMessage.includes('NotFoundException')) {
            return;
          }
          console.error('Html5Qrcode error:', errorMessage);
        }
      );
      
      console.log('Html5Qrcode scanner started successfully');
      setScannerLoading(false);
      
    } catch (error) {
      console.error('Html5Qrcode scanner error:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      setError('QR scanner failed to start. Please use manual input.');
      setScanning(false);
      setScannerLoading(false);
    }
  };

  const stopScanning = async () => {
    setScanning(false);
    setScannerLoading(false);
    
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        console.log('Html5Qrcode scanner stopped');
      } catch (error) {
        console.error('Error stopping scanner:', error);
      }
      scannerRef.current = null;
    }
    
    setScannedData('');
  };

  const handleManualQRInput = async () => {
    if (!scannedData.trim()) {
      setError('Please enter a QR code');
      return;
    }

    await processQRCode(scannedData);
  };

  const processQRCode = async (qrCode) => {
    try {
      setCheckInResult(null);
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@coursevita.com';
      const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123456';

      const response = await fetch(`${backendUrl}/api/admin/scan-qr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': adminEmail,
          'x-admin-password': adminPassword
        },
        body: JSON.stringify({ qrCode })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCheckInResult({
          success: true,
          message: 'Check-in successful!',
          attendee: data.rsvp
        });
        fetchAttendees();
      } else {
        setCheckInResult({
          success: false,
          message: data.message,
          attendee: data.rsvp
        });
      }
    } catch (error) {
      console.error('QR code processing error:', error);
      setCheckInResult({
        success: false,
        message: 'Failed to process QR code'
      });
    }
  };

  const handleManualCheckIn = async (attendeeId) => {
    try {
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@coursevita.com';
      const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123456';

      const response = await fetch(`${backendUrl}/api/admin/rsvp/${attendeeId}/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': adminEmail,
          'x-admin-password': adminPassword
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCheckInResult({
          success: true,
          message: 'Manual check-in successful!',
          attendee: data.rsvp
        });
        fetchAttendees();
      } else {
        setCheckInResult({
          success: false,
          message: data.message
        });
      }
    } catch (error) {
      console.error('Manual check-in error:', error);
      setCheckInResult({
        success: false,
        message: 'Failed to check in attendee'
      });
    }
  };

  const handleViewQRCode = async (attendee) => {
    try {
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@coursevita.com';
      const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123456';

      const response = await fetch(`${backendUrl}/api/admin/rsvp/${attendee._id}/qr-code`, {
        headers: {
          'x-admin-email': adminEmail,
          'x-admin-password': adminPassword
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setQrCodeData(data.qrCode);
        setSelectedAttendee(attendee);
        setShowQRModal(true);
      } else {
        alert('Failed to generate QR code');
      }
    } catch (error) {
      console.error('QR code error:', error);
      alert('Failed to generate QR code');
    }
  };

  const filteredAttendees = attendees.filter(attendee =>
    attendee.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendee.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'waitlisted': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Event Check-In</h1>
          {event && (
            <div className="mt-2">
              <h2 className="text-xl text-gray-700">{event.title}</h2>
              <p className="text-gray-600">
                {new Date(event.startDate).toLocaleDateString()} • {event.location?.venue}
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div id="scanner-container" className="w-full" style={{ display: 'none' }}></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <QrCode className="h-5 w-5 mr-2" />
              QR Code Scanner
            </h2>

            {!scanning ? (
              <div className="space-y-4">
                <button
                  onClick={startScanning}
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  Start Camera Scanner
                </button>

                <div className="text-center">
                  <p className="text-gray-600 mb-2">Or enter QR code manually:</p>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={scannedData}
                      onChange={(e) => setScannedData(e.target.value)}
                      placeholder="Enter QR code data..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleManualQRInput}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                    >
                      Check In
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {scannerLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Initializing QR scanner...</p>
                  </div>
                ) : (
                  <>
                    {/* Scanner container - will be populated by Html5Qrcode */}
                  </>
                )}
                
                <div className="text-center text-sm text-gray-600">
                  {scannerLoading && (
                    <p className="text-blue-600">Initializing scanner...</p>
                  )}
                  {scanning && !scannerLoading && !scannedData && (
                    <p>Scanning for QR codes...</p>
                  )}
                  {scannedData && (
                    <p className="text-green-600 font-medium">QR Code detected: {scannedData.substring(0, 50)}...</p>
                  )}
                  {scanning && !scannerLoading && (
                    <p className="text-xs text-gray-500 mt-1">
                      Point camera at a QR code. If scanning doesn't work, use manual input below.
                    </p>
                  )}
                </div>
                
                <button
                  onClick={stopScanning}
                  className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Stop Scanner
                </button>
              </div>
            )}

            {checkInResult && (
              <div className={`mt-4 p-4 rounded-md ${
                checkInResult.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center">
                  {checkInResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 mr-2" />
                  )}
                  <span className={`font-medium ${
                    checkInResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {checkInResult.message}
                  </span>
                </div>
                {checkInResult.attendee && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p><strong>Name:</strong> {checkInResult.attendee.user.fullName}</p>
                    <p><strong>Email:</strong> {checkInResult.attendee.user.email}</p>
                    <p><strong>Status:</strong> {checkInResult.attendee.status}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Attendees ({attendees.length})
              </h2>
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search attendees..."
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredAttendees.map((attendee) => (
                <div key={attendee._id} className="border border-gray-200 rounded-md p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{attendee.user.fullName}</h3>
                      <p className="text-sm text-gray-600">{attendee.user.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(attendee.status)}`}>
                          {attendee.status}
                        </span>
                        {attendee.checkIn?.checkedIn ? (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            <span className="text-xs">Checked in</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            <span className="text-xs">Not checked in</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {!attendee.checkIn?.checkedIn && attendee.status === 'confirmed' && (
                        <button
                          onClick={() => handleManualCheckIn(attendee._id)}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Manual Check-in"
                        >
                          <UserCheck className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleViewQRCode(attendee)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="View QR Code"
                      >
                        <QrCode className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Attendee QR Code</h2>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            {selectedAttendee && (
              <div className="mb-4">
                <h3 className="font-medium text-gray-900">{selectedAttendee.user.fullName}</h3>
                <p className="text-sm text-gray-600">{selectedAttendee.user.email}</p>
                <p className="text-sm text-gray-500">
                  Status: {selectedAttendee.status}
                </p>
              </div>
            )}
            
            <div className="text-center">
              <QRCodeDisplay 
                data={qrCodeData} 
                size={250}
                className="mb-4"
              />
              <p className="text-sm text-gray-600">
                QR Code for event check-in
              </p>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowQRModal(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckIn;
