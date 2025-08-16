import React, { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { apiService } from '../services/api';

interface BackendHealthCheckProps {
  children: React.ReactNode;
}

export function BackendHealthCheck({ children }: BackendHealthCheckProps) {
  const [isBackendUp, setIsBackendUp] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkBackend = async () => {
    setIsChecking(true);
    try {
      const response = await apiService.healthCheck();
      setIsBackendUp(response.success);
    } catch {
      setIsBackendUp(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkBackend();
    const interval = setInterval(checkBackend, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (isBackendUp === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to server...</p>
        </div>
      </div>
    );
  }

  if (!isBackendUp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Server Unavailable</h2>
          <p className="text-gray-600 mb-6">
            Unable to connect to the backend server. Please check your connection or contact support.
          </p>
          <button
            onClick={checkBackend}
            disabled={isChecking}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg mx-auto transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'Checking...' : 'Retry Connection'}</span>
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}