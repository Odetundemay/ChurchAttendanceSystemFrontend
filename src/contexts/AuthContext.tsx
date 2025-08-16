import React, { createContext, useContext, useState, useEffect } from 'react';
import { Staff } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  currentUser: Staff | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);



export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Staff | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth
    const storedUser = localStorage.getItem('churchAttendanceUser');
    const storedToken = localStorage.getItem('auth_token');
    if (storedUser && storedToken) {
      setCurrentUser(JSON.parse(storedUser));
      apiService.setToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await apiService.login(email, password);
      
      if (response.success && response.data) {
        const { token, user } = response.data;
        apiService.setToken(token);
        setCurrentUser(user);
        localStorage.setItem('churchAttendanceUser', JSON.stringify(user));
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setCurrentUser(null);
      apiService.clearToken();
      localStorage.removeItem('churchAttendanceUser');
    }
  };

  const value = {
    currentUser,
    login,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}