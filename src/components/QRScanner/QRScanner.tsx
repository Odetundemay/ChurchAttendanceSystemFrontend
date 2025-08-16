import React, { useEffect, useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';
import QrScanner from 'qr-scanner';

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

export function QRScanner({ isOpen, onClose, onScan }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const qrScannerRef = useRef<QrScanner | null>(null);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const startScanner = async () => {
    if (!videoRef.current) return;
    
    try {
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('QR Code scanned:', result.data);
          try {
            // Validate JSON format
            const parsed = JSON.parse(result.data);
            console.log('Parsed QR data:', parsed);
            
            // Check if it has the expected structure
            if (parsed.family && parsed.s) {
              onScan(result.data);
            } else {
              setError('Invalid QR code. Please scan a parent QR code.');
            }
          } catch (e) {
            console.error('Invalid QR code format:', e);
            setError('Invalid QR code format. Please scan a valid parent QR code.');
          }
        },
        {
          preferredCamera: 'environment',
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );
      
      await qrScannerRef.current.start();
      setIsScanning(true);
      setError('');
    } catch (err) {
      setError('Camera access denied. Please enable camera permissions.');
      console.error('QR Scanner error:', err);
    }
  };

  const stopScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setIsScanning(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Scan QR Code</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative mb-4">
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <Camera className="w-12 h-12 text-red-400 mx-auto mb-2" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg aspect-square flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="absolute inset-4 border-2 border-purple-500 rounded-lg"></div>
            </div>
          )}
        </div>

        <div className="text-center space-y-3">
          <p className="text-gray-600 text-sm">
            Position the QR code within the frame to scan
          </p>
          
          {/* Test button with real data format */}
          <button
            onClick={() => {
              const testData = JSON.stringify({"family":"b2a4fe8b-a30c-4f00-8c99-b0fd75c6a106","s":"dGVzdFNlY3JldA=="});
              console.log('Testing with:', testData);
              onScan(testData);
            }}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors text-sm"
          >
            Test Scan (Debug)
          </button>
        </div>
      </div>
    </div>
  );
}