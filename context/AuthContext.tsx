
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role, AuthState, ModulePermissions } from '../types';

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

const DEFAULT_GRANULAR: Record<string, ModulePermissions> = {
  requisition: { view: true, edit: true, dl: true },
  purchase_order: { view: true, edit: true, dl: true },
  supplier: { view: true, edit: true, dl: true },
  purchase_report: { view: true, edit: true, dl: true },
  inventory: { view: true, edit: true, dl: true },
  receive: { view: true, edit: true, dl: true },
  issue: { view: true, edit: true, dl: true },
  tnx_report: { view: true, edit: true, dl: true },
  mo_report: { view: true, edit: true, dl: true },
  item_list: { view: true, edit: true, dl: true },
  item_uom: { view: true, edit: true, dl: true },
  item_group: { view: true, edit: true, dl: true },
  item_type: { view: true, edit: true, dl: true },
  cost_center: { view: true, edit: true, dl: true },
  user_management: { view: true, edit: true, dl: true }
};

const GUEST_ADMIN: User = {
  id: '00000000-0000-0000-0000-000000000000',
  email: 'admin@fairtechnology.com.bd',
  fullName: 'System Administrator',
  username: 'admin',
  role: Role.ADMIN,
  status: 'Active',
  lastLogin: new Date().toISOString(),
  permissions: [],
  granularPermissions: DEFAULT_GRANULAR,
  createdAt: new Date().toISOString()
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser] = useState<User>(GUEST_ADMIN);
  const [isAuthenticated] = useState(true);
  const [loading] = useState(false);

  const login = async () => ({ success: true });
  const logout = () => {};
  const addUser = async () => {};
  const updateUser = async () => {};
  const deleteUser = async () => {};
  const users = [GUEST_ADMIN];

  const hasPermission = () => true;

  return (
    <AuthContext.Provider value={{ 
      user: currentUser, 
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