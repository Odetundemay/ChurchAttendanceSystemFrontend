import React, { useState, useEffect } from 'react';
import { QrCode, UserCheck, UserX } from 'lucide-react';
import { QRScanner } from '../components/QRScanner/QRScanner';
import { CheckInModal } from '../components/Attendance/CheckInModal';
import { CheckOutModal } from '../components/Attendance/CheckOutModal';
import { useAuth } from '../contexts/AuthContext';
import { AttendanceRecord } from '../types';
import { apiService } from '../services/api';
import { format, isToday } from 'date-fns';

export function AttendancePage() {
  const { currentUser } = useAuth();
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttendanceData();
  }, []);

  const loadAttendanceData = async () => {
    try {
      const response = await apiService.getAttendanceRecords();
      if (response.success) {
        setAttendanceRecords(response.data || []);
      }
    } catch (error) {
      console.error('Error loading attendance data:', error);
    } finally {
      setLoading(false);
    }
  };
  const [scanMode, setScanMode] = useState<'checkin' | 'checkout'>('checkin');

  const handleQRScan = async (qrData: string) => {
    console.log('QR Data received:', qrData);
    try {
      // Validate QR data format before sending
      let parsedData;
      try {
        parsedData = JSON.parse(qrData);
        if (!parsedData.family || !parsedData.s) {
          throw new Error('Invalid QR format');
        }
      } catch (e) {
        alert('Invalid QR code format. Please scan a valid parent QR code.');
        return;
      }

      const response = await apiService.scanQrCode(qrData);
      console.log('Scan response:', response);
      
      if (response.success && response.data) {
        setSelectedParent(response.data);
        setShowQRScanner(false);
        if (scanMode === 'checkin') {
          setShowCheckInModal(true);
        } else {
          setShowCheckOutModal(true);
        }
      } else {
        // Handle encoded error messages
        let errorMsg = response.error || 'Parent not found. Please try scanning again.';
        if (errorMsg.includes('+') || errorMsg.includes('/') || errorMsg.includes('=')) {
          errorMsg = 'Server error occurred. Please try again or contact support.';
        }
        alert(`Scan failed: ${errorMsg}`);
      }
    } catch (error) {
      console.error('QR scan error:', error);
      alert('Error scanning QR code. Please try again.');
    }
  };

  const handleCheckIn = async (childId: string, notes?: string) => {
    try {
      const response = await apiService.checkIn(childId, notes);
      if (response.success) {
        alert('Child checked in successfully!');
        setShowCheckInModal(false);
        loadAttendanceData();
      } else {
        alert('Failed to check in child. Please try again.');
      }
    } catch (error) {
      console.error('Check-in error:', error);
      alert('Error checking in child. Please try again.');
    }
  };

  const handleCheckOut = async (recordId: string, notes?: string) => {
    try {
      const response = await apiService.checkOut(recordId, notes);
      if (response.success) {
        alert('Child checked out successfully!');
        setShowCheckOutModal(false);
        loadAttendanceData();
      } else {
        alert('Failed to check out child. Please try again.');
      }
    } catch (error) {
      console.error('Check-out error:', error);
      alert('Error checking out child. Please try again.');
    }
  };

  const startQRScan = (mode: 'checkin' | 'checkout') => {
    setScanMode(mode);
    setShowQRScanner(true);
  };

  const getParentChildren = () => {
    if (!selectedParent) return [];
    return selectedParent.children || [];
  };

  const getCheckedInChildren = (parentId: string) => {
    const todaysRecords = attendanceRecords.filter(record => 
      isToday(new Date(record.checkInTime)) && 
      record.parentId === parentId && 
      !record.checkOutTime
    );
    
    return todaysRecords.map(record => ({
      child: { id: record.childId, firstName: 'Child', lastName: 'Name' },
      record
    }));
  };

  const todaysAttendance = attendanceRecords
    .filter(record => isToday(new Date(record.checkInTime)));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
        <p className="text-gray-600">Check children in and out using QR code scanning.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Check-In</h3>
              <p className="text-sm text-gray-600">Scan parent QR code to check in children</p>
            </div>
          </div>
          <button
            onClick={() => startQRScan('checkin')}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <QrCode className="w-5 h-5" />
            <span>Start Check-In</span>
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <UserX className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Check-Out</h3>
              <p className="text-sm text-gray-600">Scan parent QR code to check out children</p>
            </div>
          </div>
          <button
            onClick={() => startQRScan('checkout')}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <QrCode className="w-5 h-5" />
            <span>Start Check-Out</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Attendance</h3>
        {todaysAttendance.length > 0 ? (
          <div className="space-y-3">
            {todaysAttendance.map((record) => (
              <div key={record.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-gray-800">
                      Child ID: {record.childId}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      record.checkOutTime 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {record.checkOutTime ? 'Completed' : 'Checked In'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Parent ID: {record.parentId}
                  </p>
                  <p className="text-sm text-gray-500">
                    In: {format(new Date(record.checkInTime), 'HH:mm')}
                    {record.checkOutTime && ` • Out: ${format(new Date(record.checkOutTime), 'HH:mm')}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No attendance records for today yet.</p>
        )}
      </div>

      <QRScanner
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScan={handleQRScan}
      />

      <CheckInModal
        isOpen={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        parent={selectedParent?.parent || null}
        children={getParentChildren()}
        onCheckIn={handleCheckIn}
      />

      <CheckOutModal
        isOpen={showCheckOutModal}
        onClose={() => setShowCheckOutModal(false)}
        parent={selectedParent?.parent || null}
        checkedInChildren={selectedParent ? getCheckedInChildren(selectedParent.parent?.id || '') : []}
        onCheckOut={handleCheckOut}
      />
    </div>
  );
}