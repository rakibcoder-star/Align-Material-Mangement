import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Role, AuthState, ModulePermissions } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
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

const MOCK_ADMIN: User = {
  id: 'admin-1',
  email: 'admin@align.com',
  fullName: 'System Administrator',
  username: 'admin',
  role: Role.ADMIN,
  status: 'Active',
  lastLogin: new Date().toISOString(),
  permissions: ['view_dashboard', 'manage_users'],
  granularPermissions: DEFAULT_GRANULAR,
  createdAt: new Date().toISOString()
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([MOCK_ADMIN]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('align_user');
    const savedUsers = localStorage.getItem('align_users_list');
    
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      localStorage.setItem('align_users_list', JSON.stringify([MOCK_ADMIN]));
    }
    
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Logic: Find user in the local storage list
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    // For mock purposes, we allow any password for admin or any added user
    if (foundUser && foundUser.status === 'Active') {
      const updatedUser = { ...foundUser, lastLogin: new Date().toISOString() };
      setCurrentUser(updatedUser);
      localStorage.setItem('align_user', JSON.stringify(updatedUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('align_user');
  };

  const addUser = async (userData: any) => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: userData.email,
      fullName: userData.fullName || userData.email.split('@')[0],
      username: userData.username || userData.email.split('@')[0],
      role: userData.role || Role.USER,
      status: 'Active',
      lastLogin: '',
      permissions: [],
      granularPermissions: userData.granularPermissions || DEFAULT_GRANULAR,
      createdAt: new Date().toISOString()
    };
    const newList = [...users, newUser];
    setUsers(newList);
    localStorage.setItem('align_users_list', JSON.stringify(newList));
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    const newList = users.map(u => u.id === userId ? { ...u, ...updates } : u);
    setUsers(newList);
    localStorage.setItem('align_users_list', JSON.stringify(newList));
    if (currentUser?.id === userId) {
      setCurrentUser({ ...currentUser, ...updates });
    }
  };

  const deleteUser = async (userId: string) => {
    const newList = users.filter(u => u.id !== userId);
    setUsers(newList);
    localStorage.setItem('align_users_list', JSON.stringify(newList));
  };

  const hasPermission = (permissionId: string) => {
    if (currentUser?.role === Role.ADMIN) return true;
    return currentUser?.permissions.includes(permissionId) || false;
  };

  return (
    <AuthContext.Provider value={{ 
      user: currentUser, 
      isAuthenticated: !!currentUser,
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