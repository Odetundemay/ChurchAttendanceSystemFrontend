import React, { useState } from 'react';
import { X, Clock, User } from 'lucide-react';
import { Child, Parent, AttendanceRecord } from '../../types';
import { format } from 'date-fns';

interface CheckOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  parent: Parent | null;
  checkedInChildren: { child: Child; record: AttendanceRecord }[];
  onCheckOut: (recordId: string, notes?: string) => void;
}

export function CheckOutModal({ isOpen, onClose, parent, checkedInChildren, onCheckOut }: CheckOutModalProps) {
  const [selectedRecord, setSelectedRecord] = useState<string>('');
  const [notes, setNotes] = useState('');

  if (!isOpen || !parent) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRecord) {
      onCheckOut(selectedRecord, notes.trim() || undefined);
      setSelectedRecord('');
      setNotes('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Check-Out Children</h3>
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

        {checkedInChildren.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No children are currently checked in for this parent.</p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-800 mb-4">Select Child to Check Out</h4>
              <div className="space-y-3">
                {checkedInChildren.map(({ child, record }) => (
                  <div
                    key={record.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedRecord === record.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                    onClick={() => setSelectedRecord(record.id)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <img
                          src={child.photoUrl}
                          alt={`${child.firstName} ${child.lastName}`}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <input
                          type="radio"
                          name="selectedRecord"
                          value={record.id}
                          checked={selectedRecord === record.id}
                          onChange={() => setSelectedRecord(record.id)}
                          className="absolute top-0 right-0 w-5 h-5"
                        />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-800">
                          {child.firstName} {child.lastName}
                        </h5>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                          <Clock className="w-4 h-4" />
                          <span>Checked in: {format(record.checkInTime, 'HH:mm')}</span>
                        </div>
                        {record.notes && (
                          <p className="text-sm text-gray-600 mt-1">
                            Notes: {record.notes}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Checked In
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check-Out Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any notes about the child's experience today..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600 mb-6">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Check-out time: {format(new Date(), 'MMM dd, yyyy HH:mm')}</span>
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
                disabled={!selectedRecord}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
              >
                Check Out Child
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}