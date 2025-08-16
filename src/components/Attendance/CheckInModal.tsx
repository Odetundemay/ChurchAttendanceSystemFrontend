import React, { useState } from 'react';
import { X, Clock, User, AlertTriangle } from 'lucide-react';
import { Child, Parent } from '../../types';
import { format } from 'date-fns';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  parent: Parent | null;
  children: Child[];
  onCheckIn: (childId: string, notes?: string) => void;
}

export function CheckInModal({ isOpen, onClose, parent, children, onCheckIn }: CheckInModalProps) {
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [notes, setNotes] = useState('');

  if (!isOpen || !parent) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedChild) {
      onCheckIn(selectedChild, notes.trim() || undefined);
      setSelectedChild('');
      setNotes('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Check-In Children</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">
                {parent.firstName} {parent.lastName}
              </h4>
              <p className="text-gray-600">{parent.email}</p>
              <p className="text-gray-600">{parent.phone}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-800 mb-4">Select Child to Check In</h4>
            <div className="space-y-3">
              {children.map(child => (
                <div
                  key={child.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedChild === child.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                  onClick={() => setSelectedChild(child.id)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                        <User className="w-8 h-8 text-purple-600" />
                      </div>
                      <input
                        type="radio"
                        name="selectedChild"
                        value={child.id}
                        checked={selectedChild === child.id}
                        onChange={() => setSelectedChild(child.id)}
                        className="absolute top-0 right-0 w-5 h-5"
                      />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-800">
                        {child.firstName} {child.lastName}
                      </h5>
                      <p className="text-sm text-gray-600">
                        Born: {format(new Date(child.dateOfBirth), 'MMM dd, yyyy')}
                      </p>
                      {child.allergies && (
                        <div className="flex items-center space-x-1 mt-1">
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                          <span className="text-sm text-orange-600">
                            Allergies: {child.allergies}
                          </span>
                        </div>
                      )}
                      {child.medicalNotes && (
                        <div className="flex items-center space-x-1 mt-1">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <span className="text-sm text-red-600">
                            Medical: {child.medicalNotes}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Check-In Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special notes about the child today..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600 mb-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Check-in time: {format(new Date(), 'MMM dd, yyyy HH:mm')}</span>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedChild}
              className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
            >
              Check In Child
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}