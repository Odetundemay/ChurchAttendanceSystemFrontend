import React, { useState, useEffect } from 'react';
import { Calendar, Download, Filter, User, Users } from 'lucide-react';
import { apiService } from '../services/api';
import { format, parseISO, isWithinInterval, startOfWeek, endOfWeek, isToday } from 'date-fns';
import { AttendanceRecord, Child, Parent } from '../types';
import { useToast } from '../hooks/useToast';

export function ReportsPage() {
  const { success, error } = useToast();
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
    } catch (err) {
      error('Failed to load report data', 'Please try refreshing the page');
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

    // Child filtering - use childName for display but childId for filtering
    if (childFilter) {
      filtered = filtered.filter(record => record.childId === childFilter);
    }

    // Parent filtering - use parentName for display but parentId for filtering
    if (parentFilter) {
      filtered = filtered.filter(record => record.parentId === parentFilter);
    }

    return filtered;
  };

  const filteredRecords = getFilteredRecords();

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

  const exportToCSV = () => {
    try {
      const headers = ['Child Name', 'Parent Name', 'Date', 'Check In', 'Check Out', 'Duration (hours)', 'Status'];
      const csvData = filteredRecords.map(record => [
        record.childName || record.childId,
        record.parentName || record.parentId,
        format(new Date(record.checkInTime), 'yyyy-MM-dd'),
        format(new Date(record.checkInTime), 'HH:mm'),
        record.checkOutTime ? format(new Date(record.checkOutTime), 'HH:mm') : 'N/A',
        record.checkOutTime 
          ? ((new Date(record.checkOutTime).getTime() - new Date(record.checkInTime).getTime()) / (1000 * 60 * 60)).toFixed(2)
          : 'N/A',
        record.checkOutTime ? 'Completed' : 'In Progress'
      ]);

      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `attendance-report-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      success('Export Successful', 'Report has been downloaded');
    } catch (err) {
      error('Export Failed', 'Unable to export report');
    }
  };

  const summary = generateSummary();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Attendance Reports</h1>
          <p className="text-secondary-600">Filter and analyze attendance patterns and history.</p>
        </div>
        <button 
          onClick={exportToCSV}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export Report</span>
        </button>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-3 mb-6">
          <Filter className="w-5 h-5 text-secondary-600" />
          <h3 className="text-lg font-semibold text-secondary-800">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Date Range</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Child</label>
            <select
              value={childFilter}
              onChange={(e) => setChildFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
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
            <label className="block text-sm font-medium text-secondary-700 mb-2">Parent</label>
            <select
              value={parentFilter}
              onChange={(e) => setParentFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
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
            <Calendar className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-secondary-800">Total Sessions</h3>
          </div>
          <p className="text-3xl font-bold text-primary-600">{summary.totalSessions}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-2">
            <User className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-secondary-800">Completed</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">{summary.completedSessions}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-secondary-800">Avg Duration</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600">{summary.avgDuration}h</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-secondary-800 mb-4">Attendance Records</h3>
        {filteredRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Child
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Parent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Check In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Check Out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-secondary-900">
                            {record.childName || record.childId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-secondary-900">
                        {record.parentName || record.parentId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                      {format(new Date(record.checkInTime), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                      {format(new Date(record.checkInTime), 'HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
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
          <p className="text-center text-secondary-500 py-8">No records found for the selected filters.</p>
        )}
      </div>
    </div>
  );
}