import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean, message?: string }>;
  logout: () => void;
  addUser: (userData: any) => Promise<void>;
  updateUser: (userId: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  users: User[];
  hasPermission: (permissionId: string) => boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_ADMIN: User = {
  id: '00000000-0000-0000-0000-000000000000',
  email: 'admin@fairtechnology.com.bd',
  fullName: 'System Admin',
  username: 'admin',
  role: Role.ADMIN,
  status: 'Active',
  lastLogin: new Date().toISOString(),
  permissions: [],
  granularPermissions: {},
  createdAt: new Date().toISOString()
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Bypass authentication: always set as authenticated with mock admin
  const [user, setUser] = useState<User | null>(MOCK_ADMIN);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([MOCK_ADMIN]);

  const login = async () => ({ success: true });
  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };
  const addUser = async () => {};
  const updateUser = async () => {};
  const deleteUser = async () => {};
  const hasPermission = () => true;

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      login, 
      logout, 
      addUser, 
      updateUser,
      deleteUser, 
      users,
      hasPermission,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};