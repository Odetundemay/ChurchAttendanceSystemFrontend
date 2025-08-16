import React, { useState } from 'react';
import { apiService } from '../services/api';

export function HealthCheck() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const checkHealth = async () => {
        setStatus('loading');
        try {
            const response = await apiService.healthCheck();
            if (response.success) {
                setStatus('success');
                setMessage(`Backend is healthy! Status: ${response.data?.status}`);
            } else {
                setStatus('error');
                setMessage(`Health check failed: ${response.error}`);
            }
        } catch (error) {
            setStatus('error');
            setMessage(`Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    return (
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-3">Backend Connection Test</h3>
            <button
                onClick={checkHealth}
                disabled={status === 'loading'}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
                {status === 'loading' ? 'Testing...' : 'Test Connection'}
            </button>

            {message && (
                <div className={`mt-3 p-3 rounded-lg ${status === 'success'
                    ? 'bg-green-100 text-green-800'
                    : status === 'error'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                    {message}
                </div>
            )}
        </div>
    );
}