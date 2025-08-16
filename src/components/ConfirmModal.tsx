import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning';
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'danger'
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const buttonColors = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className={`p-2 rounded-lg ${type === 'danger' ? 'bg-red-100' : 'bg-yellow-100'}`}>
            <AlertTriangle className={`w-6 h-6 ${type === 'danger' ? 'text-red-600' : 'text-yellow-600'}`} />
          </div>
          <h3 className="text-lg font-semibold text-secondary-800">{title}</h3>
        </div>
        <p className="text-secondary-600 mb-6">{message}</p>
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-secondary-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${buttonColors[type]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}