import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Baby, Plus, QrCode } from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Parent {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  childIds: string[];
}

interface Child {
  id: string;
  fullName: string;
  group: string;
}

export function AdminPage() {
  const { currentUser } = useAuth();
  const [parents, setParents] = useState<Parent[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [showAddParent, setShowAddParent] = useState(false);
  const [showAddChild, setShowAddChild] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const [parentForm, setParentForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: ''
  });

  const [childForm, setChildForm] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '2020-01-01',
    allergies: '',
    emergencyContact: '',
    medicalNotes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [parentsRes, childrenRes] = await Promise.all([
        apiService.getParents(),
        apiService.getChildren()
      ]);

      if (parentsRes.success) setParents(parentsRes.data || []);
      if (childrenRes.success) setChildren(childrenRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddParent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiService.createParent(parentForm);
      if (response.success) {
        setParentForm({ firstName: '', lastName: '', phone: '', email: '' });
        setShowAddParent(false);
        loadData();
        alert('Parent added successfully!');
      } else {
        alert('Failed to add parent: ' + response.error);
      }
    } catch (error) {
      console.error('Error adding parent:', error);
      alert('Error adding parent');
    }
  };

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParentId) {
      alert('Please select a parent');
      return;
    }

    try {
      const response = await apiService.createChild(selectedParentId, childForm);
      if (response.success) {
        setChildForm({ firstName: '', lastName: '', dateOfBirth: '2020-01-01', allergies: '', emergencyContact: '', medicalNotes: '' });
        setShowAddChild(false);
        setSelectedParentId('');
        loadData();
        alert('Child added successfully!');
      } else {
        alert('Failed to add child: ' + response.error);
      }
    } catch (error) {
      console.error('Error adding child:', error);
      alert('Error adding child');
    }
  };

  const downloadQrCode = async (parentId: string, parentName: string) => {
    try {
      const response = await apiService.getParentQrCode(parentId);
      if (response.success && response.data) {
        const blob = response.data instanceof Blob ? response.data : new Blob([response.data as any], { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${parentName.replace(/\s+/g, '_')}_QR.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        alert('Failed to download QR code: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error downloading QR code:', error);
      alert('Error downloading QR code');
    }
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
        <p className="text-gray-600">You need admin privileges to access this page.</p>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-600">Manage parents, children, and generate QR codes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Parents Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Parents ({parents.length})</h3>
            </div>
            <button
              onClick={() => setShowAddParent(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Parent</span>
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {parents.map((parent) => (
              <div key={parent.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-800">{parent.firstName} {parent.lastName}</h4>
                    <p className="text-sm text-gray-600">{parent.phone}</p>
                    <p className="text-sm text-gray-600">{parent.email}</p>
                    <p className="text-xs text-gray-500">{parent.childIds.length} children</p>
                  </div>
                  <button
                    onClick={() => downloadQrCode(parent.id, `${parent.firstName} ${parent.lastName}`)}
                    className="p-2 bg-purple-100 hover:bg-purple-200 text-purple-600 rounded-lg transition-colors"
                    title="Download QR Code"
                  >
                    <QrCode className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Children Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Baby className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Children ({children.length})</h3>
            </div>
            <button
              onClick={() => setShowAddChild(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Child</span>
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {children.map((child) => (
              <div key={child.id} className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-gray-800">{child.firstName} {child.lastName}</h4>
                <p className="text-sm text-gray-600">Group: Not assigned</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Parent Modal */}
      {showAddParent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Parent</h3>
            <form onSubmit={handleAddParent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={parentForm.firstName}
                  onChange={(e) => setParentForm({ ...parentForm, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={parentForm.lastName}
                  onChange={(e) => setParentForm({ ...parentForm, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={parentForm.phone}
                  onChange={(e) => setParentForm({ ...parentForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={parentForm.email}
                  onChange={(e) => setParentForm({ ...parentForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddParent(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Add Parent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Child Modal */}
      {showAddChild && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Child</h3>
            <form onSubmit={handleAddChild} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Parent</label>
                <select
                  required
                  value={selectedParentId}
                  onChange={(e) => setSelectedParentId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Choose a parent...</option>
                  {parents.map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.firstName} {parent.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={childForm.firstName}
                  onChange={(e) => setChildForm({ ...childForm, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={childForm.lastName}
                  onChange={(e) => setChildForm({ ...childForm, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={childForm.dateOfBirth}
                  onChange={(e) => setChildForm({ ...childForm, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Allergies (Optional)</label>
                <input
                  type="text"
                  value={childForm.allergies}
                  onChange={(e) => setChildForm({ ...childForm, allergies: e.target.value })}
                  placeholder="e.g., Peanuts, Dairy"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddChild(false);
                    setSelectedParentId('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Add Child
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}