import React, { useState } from 'react';
import { Users, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      const success = await login(email, password);
      console.log("Login API response:", success);
      if (!success) {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred during login');
    }
  };

  const fillDemoCredentials = () => {
    setEmail('admin@church.com');
    setPassword('SecurePass123!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">KidsCheck</h2>
          <p className="mt-2 text-gray-600">Children's Ministry Attendance System</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 border border-purple-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>

            <div className="mt-6 border-t pt-6">
              <p className="text-sm text-gray-600 text-center mb-3">Demo Credentials:</p>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="w-full py-2 px-4 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors text-sm"
              >
                Use Admin Account (admin@church.com)
              </button>
            </div>
          </form>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Secure access for church staff only
          </p>
        </div>
      </div>
    </div>
  );
}