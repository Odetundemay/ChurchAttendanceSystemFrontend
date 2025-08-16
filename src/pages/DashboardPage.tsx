import React, { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, TrendingUp, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StatsCard } from '../components/Dashboard/StatsCard';
import { apiService } from '../services/api';
import { format, isToday } from 'date-fns';
import { AttendanceRecord, Child } from '../types';
import { useToast } from '../hooks/useToast';

export function DashboardPage() {
  const navigate = useNavigate();
  const { error } = useToast();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [attendanceRes, childrenRes] = await Promise.all([
        apiService.getTodaysAttendance(),
        apiService.getChildren()
      ]);
      
      if (attendanceRes.success) setAttendanceRecords(attendanceRes.data || []);
      if (childrenRes.success) setChildren(childrenRes.data || []);
    } catch (err) {
      error('Failed to load dashboard data', 'Please try refreshing the page');
    } finally {
      setLoading(false);
    }
  };

  const todaysRecords = attendanceRecords.filter(record => 
    isToday(new Date(record.checkInTime))
  );
  
  const checkedInToday = todaysRecords.filter(record => !record.checkOutTime).length;
  const totalChildren = children.length;
  const completedSessions = todaysRecords.filter(record => record.checkOutTime).length;

  const recentActivity = todaysRecords
    .sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
        <p className="text-secondary-600">Welcome back! Here's today's attendance overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Currently Checked In"
          value={checkedInToday}
          icon={UserCheck}
          color="green"
        />
        <StatsCard
          title="Total Children"
          value={totalChildren}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Completed Sessions"
          value={completedSessions}
          icon={UserX}
          color="primary"
        />
        <StatsCard
          title="Attendance Rate"
          value={`${Math.round((todaysRecords.length / totalChildren) * 100)}%`}
          icon={TrendingUp}
          color="secondary"
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-secondary-800 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map(record => (
                <div key={record.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-secondary-800">
                      {record.childName || record.childId}
                    </p>
                    <p className="text-sm text-secondary-600">
                      {record.checkOutTime ? 'Checked out' : 'Checked in'} at{' '}
                      {format(new Date(record.checkInTime), 'HH:mm')}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    record.checkOutTime 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {record.checkOutTime ? 'Complete' : 'Active'}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-secondary-500">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No activity today yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-secondary-800 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/attendance')}
              className="w-full flex items-center space-x-3 p-4 text-left border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <UserCheck className="w-6 h-6 text-primary-600" />
              <div>
                <p className="font-medium text-secondary-800">Start Check-In</p>
                <p className="text-sm text-secondary-600">Scan QR codes to check in children</p>
              </div>
            </button>
            <button 
              onClick={() => navigate('/attendance')}
              className="w-full flex items-center space-x-3 p-4 text-left border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <UserX className="w-6 h-6 text-primary-600" />
              <div>
                <p className="font-medium text-secondary-800">Start Check-Out</p>
                <p className="text-sm text-secondary-600">Release children to parents</p>
              </div>
            </button>
            <button 
              onClick={() => navigate('/reports')}
              className="w-full flex items-center space-x-3 p-4 text-left border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <TrendingUp className="w-6 h-6 text-primary-600" />
              <div>
                <p className="font-medium text-secondary-800">View Reports</p>
                <p className="text-sm text-secondary-600">Analyze attendance patterns</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}