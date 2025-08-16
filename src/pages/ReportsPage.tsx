import React, { useState, useEffect } from 'react';
import { Calendar, Download, Filter, User, Users } from 'lucide-react';
import { apiService } from '../services/api';
import { format, parseISO, isWithinInterval, startOfWeek, endOfWeek, isToday } from 'date-fns';
import { AttendanceRecord, Child, Parent } from '../types';

export function ReportsPage() {
  const [dateFilter, setDateFilter] = useState('week');
  const [childFilter, setChildFilter] = useState('');
  const [parentFilter, setParentFilter] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [attendanceRes, childrenRes, parentsRes] = await Promise.all([
        apiService.getAttendanceRecords(),
        apiService.getChildren(),
        apiService.getParents()
      ]);
      
      if (attendanceRes.success) setAttendanceRecords(attendanceRes.data || []);
      if (childrenRes.success) setChildren(childrenRes.data || []);
      if (parentsRes.success) setParents(parentsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredRecords = () => {
    let filtered = [...attendanceRecords];

    // Date filtering
    const now = new Date();
    if (dateFilter === 'week') {
      const start = startOfWeek(now);
      const end = endOfWeek(now);
      filtered = filtered.filter(record => 
        isWithinInterval(new Date(record.checkInTime), { start, end })
      );
    } else if (dateFilter === 'today') {
      filtered = filtered.filter(record => isToday(new Date(record.checkInTime)));
    }

    // Child filtering
    if (childFilter) {
      filtered = filtered.filter(record => record.childId === childFilter);
    }

    // Parent filtering
    if (parentFilter) {
      filtered = filtered.filter(record => record.parentId === parentFilter);
    }

    return filtered;
  };

  const filteredRecords = getFilteredRecords();
  const recordsWithDetails = filteredRecords.map(record => ({
    ...record,
    child: children.find(c => c.id === record.childId),
    parent: parents.find(p => p.id === record.parentId)
  })).filter(record => record.child && record.parent);

  const generateSummary = () => {
    const totalSessions = filteredRecords.length;
    const completedSessions = filteredRecords.filter(r => r.checkOutTime).length;
    const avgDuration = completedSessions > 0 
      ? filteredRecords
          .filter(r => r.checkOutTime)
          .reduce((sum, r) => sum + (new Date(r.checkOutTime!).getTime() - new Date(r.checkInTime).getTime()), 0) 
          / completedSessions / (1000 * 60 * 60) // Convert to hours
      : 0;

    return {
      totalSessions,
      completedSessions,
      avgDuration: avgDuration.toFixed(1)
    };
  };

  const summary = generateSummary();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Reports</h1>
          <p className="text-gray-600">Filter and analyze attendance patterns and history.</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
          <Download className="w-4 h-4" />
          <span>Export Report</span>
        </button>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-3 mb-6">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Child</label>
            <select
              value={childFilter}
              onChange={(e) => setChildFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">All Children</option>
              {children.map(child => (
                <option key={child.id} value={child.id}>
                  {child.firstName} {child.lastName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Parent</label>
            <select
              value={parentFilter}
              onChange={(e) => setParentFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">All Parents</option>
              {parents.map(parent => (
                <option key={parent.id} value={parent.id}>
                  {parent.firstName} {parent.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-800">Total Sessions</h3>
          </div>
          <p className="text-3xl font-bold text-purple-600">{summary.totalSessions}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-2">
            <User className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-800">Completed</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">{summary.completedSessions}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-800">Avg Duration</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600">{summary.avgDuration}h</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Attendance Records</h3>
        {recordsWithDetails.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Child
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check Out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recordsWithDetails.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {record.child?.firstName} {record.child?.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {record.parent.firstName} {record.parent.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{record.parent.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(record.checkInTime), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(record.checkInTime), 'HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.checkOutTime ? format(new Date(record.checkOutTime), 'HH:mm') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        record.checkOutTime
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {record.checkOutTime ? 'Completed' : 'In Progress'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No records found for the selected filters.</p>
        )}
      </div>
    </div>
  );
}