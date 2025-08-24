import { useState, useEffect } from 'react';
import QRCode from 'qrcode';

const QRCodeDisplay = ({ data, size = 200, className = '' }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (data) {
      generateQRCode();
    }
  }, [data]);

  const generateQRCode = async () => {
    try {
      setError('');
      const qrCodeDataURL = await QRCode.toDataURL(data, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
      setQrCodeUrl(qrCodeDataURL);
    } catch (err) {
      console.error('QR Code generation error:', err);
      setError('Failed to generate QR code');
    }
  };

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-md p-4 text-center ${className}`}>
        <div className="text-red-600 text-sm">{error}</div>
        <div className="text-xs text-red-500 mt-1 break-all">{data}</div>
      </div>
    );
  }

  if (!qrCodeUrl) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-md p-4 text-center ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <div className="text-sm text-gray-600 mt-2">Generating QR Code...</div>
      </div>
    );
  }

  return (
    <div className={`text-center ${className}`}>
      <img 
        src={qrCodeUrl} 
        alt="QR Code" 
        className="mx-auto"
        style={{ width: `${size}px`, height: `${size}px` }}
      />
    </div>
  );
};

export default QRCodeDisplay;
