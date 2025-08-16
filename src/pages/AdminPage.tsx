import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Baby, Plus, QrCode, Trash2, Upload } from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { ConfirmModal } from '../components/ConfirmModal';
import QRCode from 'qrcode';

interface Parent {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  phone: string;
  email: string;
  childIds: string[];
  imageUrl?: string;
}

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  photoUrl: string;
}

export function AdminPage() {
  const { currentUser } = useAuth();
  const { success, error } = useToast();
  const [parents, setParents] = useState<Parent[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [showAddParent, setShowAddParent] = useState(false);
  const [showAddChild, setShowAddChild] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const [parentForm, setParentForm] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    phone: '',
    email: '',
    imageUrl: ''
  });

  const [childForm, setChildForm] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '2020-01-01',
    allergies: '',
    emergencyContact: '',
    medicalNotes: '',
    imageUrl: ''
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
    } catch (err) {
      error('Failed to load data', 'Please try refreshing the page');
    } finally {
      setLoading(false);
    }
  };

  const handleAddParent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiService.createParent(parentForm);
      if (response.success) {
        setParentForm({ firstName: '', lastName: '', gender: '', phone: '', email: '', imageUrl: '' });
        setShowAddParent(false);
        loadData();
        success('Parent Added', 'Parent has been added successfully');
      } else {
        error('Failed to Add Parent', response.error || 'Please try again');
      }
    } catch (err) {
      error('Error Adding Parent', 'Please try again');
    }
  };

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParentId) {
      error('No Parent Selected', 'Please select a parent');
      return;
    }

    try {
      const response = await apiService.createChild(selectedParentId, childForm);
      if (response.success) {
        setChildForm({ firstName: '', lastName: '', gender: '', dateOfBirth: '2020-01-01', allergies: '', emergencyContact: '', medicalNotes: '', imageUrl: '' });
        setShowAddChild(false);
        setSelectedParentId('');
        await loadData();
        success('Child Added', `${childForm.firstName} ${childForm.lastName} has been added successfully`);
      } else {
        error('Failed to Add Child', response.error || 'Please try again');
      }
    } catch (err) {
      error('Error Adding Child', 'Please try again');
    }
  };

  const deleteParent = async (parentId: string, parentName: string) => {
    try {
      const response = await apiService.deleteParent(parentId);
      if (response.success) {
        loadData();
        success('Parent Deleted', `${parentName} and their children have been deleted`);
      } else {
        error('Failed to Delete Parent', response.error || 'Please try again');
      }
    } catch (err) {
      error('Error Deleting Parent', 'Please try again');
    }
  };

  const confirmDeleteParent = (parentId: string, parentName: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Parent',
      message: `Are you sure you want to delete ${parentName}? This will also delete all their children and cannot be undone.`,
      onConfirm: () => {
        deleteParent(parentId, parentName);
        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} });
      }
    });
  };

  const deleteChild = async (childId: string, childName: string) => {
    try {
      const response = await apiService.deleteChild(childId);
      if (response.success) {
        loadData();
        success('Child Deleted', `${childName} has been deleted successfully`);
      } else {
        error('Failed to Delete Child', response.error || 'Please try again');
      }
    } catch (err) {
      error('Error Deleting Child', 'Please try again');
    }
  };

  const confirmDeleteChild = (childId: string, childName: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Child',
      message: `Are you sure you want to delete ${childName}? This action cannot be undone.`,
      onConfirm: () => {
        deleteChild(childId, childName);
        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} });
      }
    });
  };

  const downloadQrCode = async (parentId: string, parentName: string) => {
    try {
      const response = await apiService.getParentQrData(parentId);
      if (response.success && response.data) {
        const qrData = JSON.stringify(response.data);
        const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        
        const a = document.createElement('a');
        a.href = qrCodeDataUrl;
        a.download = `${parentName.replace(/\s+/g, '_')}_QR.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        success('QR Code Downloaded', 'QR code has been saved to your downloads');
      } else {
        error('Failed to Generate QR Code', response.error || 'Please try again');
      }
    } catch (err) {
      error('Error Generating QR Code', 'Please try again');
    }
  };

  console.log('Current user:', currentUser);
  console.log('User role:', currentUser?.role);
  
  if (currentUser?.role?.toLowerCase() !== 'admin') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-secondary-900 mb-4">Access Denied</h2>
        <p className="text-secondary-600">You need admin privileges to access this page.</p>
        <p className="text-secondary-500 text-sm mt-2">Current role: {currentUser?.role || 'Not logged in'}</p>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold text-secondary-900">Admin Panel</h1>
        <p className="text-secondary-600">Manage parents, children, and generate QR codes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Parents Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-secondary-800">Parents ({parents.length})</h3>
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
                  <div className="flex items-center space-x-3">
                    {parent.imageUrl && (
                      <img src={parent.imageUrl} alt={parent.firstName} className="w-10 h-10 rounded-full object-cover" />
                    )}
                    <div>
                      <h4 className="font-semibold text-secondary-800">{parent.firstName} {parent.lastName}</h4>
                      <p className="text-sm text-secondary-600">{parent.gender} • {parent.phone}</p>
                      <p className="text-sm text-secondary-600">{parent.email}</p>
                      <p className="text-xs text-secondary-500">{parent.childIds.length} children</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => downloadQrCode(parent.id, `${parent.firstName} ${parent.lastName}`)}
                      className="p-2 bg-primary-100 hover:bg-primary-200 text-primary-600 rounded-lg transition-colors"
                      title="Download QR Code"
                    >
                      <QrCode className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => confirmDeleteParent(parent.id, `${parent.firstName} ${parent.lastName}`)}
                      className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                      title="Delete Parent"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
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
              <h3 className="text-lg font-semibold text-secondary-800">Children ({children.length})</h3>
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img src={child.photoUrl} alt={child.firstName} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <h4 className="font-semibold text-secondary-800">{child.firstName} {child.lastName}</h4>
                      <p className="text-sm text-secondary-600">{child.gender}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => confirmDeleteChild(child.id, `${child.firstName} ${child.lastName}`)}
                    className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                    title="Delete Child"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Parent Modal */}
      {showAddParent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-secondary-800 mb-4">Add New Parent</h3>
            <form onSubmit={handleAddParent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={parentForm.firstName}
                  onChange={(e) => setParentForm({ ...parentForm, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={parentForm.lastName}
                  onChange={(e) => setParentForm({ ...parentForm, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Gender</label>
                <select
                  required
                  value={parentForm.gender}
                  onChange={(e) => setParentForm({ ...parentForm, gender: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={parentForm.phone}
                  onChange={(e) => setParentForm({ ...parentForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Email</label>
                <input
                  type="email"
                  value={parentForm.email}
                  onChange={(e) => setParentForm({ ...parentForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Image URL (Optional)</label>
                <input
                  type="url"
                  value={parentForm.imageUrl}
                  onChange={(e) => setParentForm({ ...parentForm, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddParent(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-secondary-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
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
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-secondary-800 mb-4">Add New Child</h3>
            <form onSubmit={handleAddChild} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Select Parent</label>
                <select
                  required
                  value={selectedParentId}
                  onChange={(e) => setSelectedParentId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-secondary-700 mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={childForm.firstName}
                  onChange={(e) => setChildForm({ ...childForm, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={childForm.lastName}
                  onChange={(e) => setChildForm({ ...childForm, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Gender</label>
                <select
                  required
                  value={childForm.gender}
                  onChange={(e) => setChildForm({ ...childForm, gender: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={childForm.dateOfBirth}
                  onChange={(e) => setChildForm({ ...childForm, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Allergies (Optional)</label>
                <input
                  type="text"
                  value={childForm.allergies}
                  onChange={(e) => setChildForm({ ...childForm, allergies: e.target.value })}
                  placeholder="e.g., Peanuts, Dairy"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Emergency Contact (Optional)</label>
                <input
                  type="text"
                  value={childForm.emergencyContact}
                  onChange={(e) => setChildForm({ ...childForm, emergencyContact: e.target.value })}
                  placeholder="Emergency contact information"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Medical Notes (Optional)</label>
                <textarea
                  value={childForm.medicalNotes}
                  onChange={(e) => setChildForm({ ...childForm, medicalNotes: e.target.value })}
                  placeholder="Any medical conditions or notes"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Image URL (Optional)</label>
                <input
                  type="url"
                  value={childForm.imageUrl}
                  onChange={(e) => setChildForm({ ...childForm, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddChild(false);
                    setSelectedParentId('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-secondary-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                >
                  Add Child
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} })}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
}