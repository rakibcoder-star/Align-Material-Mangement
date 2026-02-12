import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Role, AuthState, ModulePermissions } from '../types';
import { supabase } from '../lib/supabase';
import { ROLE_DEFAULT_PERMISSIONS } from '../constants';

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

const DEFAULT_ADMIN_USER: User = {
  id: 'default-admin-id',
  email: 'admin@align.com',
  fullName: 'System Admin',
  username: 'admin',
  role: Role.ADMIN,
  status: 'Active',
  lastLogin: new Date().toISOString(),
  permissions: ROLE_DEFAULT_PERMISSIONS[Role.ADMIN],
  granularPermissions: DEFAULT_GRANULAR,
  createdAt: new Date().toISOString()
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  // Set default user to bypass login for now
  const [currentUser, setCurrentUser] = useState<User | null>(DEFAULT_ADMIN_USER);
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (data && !error) {
      setUsers(data.map(u => ({
        id: u.id,
        email: u.email,
        fullName: u.full_name || u.email.split('@')[0],
        username: u.username || u.email.split('@')[0],
        role: u.role as Role,
        status: (u.status || 'Active') as 'Active' | 'Inactive',
        lastLogin: u.last_login || u.created_at,
        permissions: u.permissions || [],
        granularPermissions: u.granular_permissions || DEFAULT_GRANULAR,
        createdAt: u.created_at
      })));
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const login = async (email: string, _password: string): Promise<boolean> => {
    // Basic mock login for development
    setCurrentUser(DEFAULT_ADMIN_USER);
    return true;
  };

  const logout = () => {
    // For now, logout doesn't do much since we force auth on refresh
    setCurrentUser(null);
  };

  const addUser = async (userData: any) => {
    const { error } = await supabase.from('profiles').insert([{
      email: userData.email,
      full_name: userData.fullName,
      username: userData.username,
      role: userData.role || Role.USER,
      status: 'Active',
      granular_permissions: userData.granularPermissions || DEFAULT_GRANULAR,
      created_at: new Date().toISOString()
    }]);
    
    if (!error) await fetchUsers();
    else throw error;
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    const dbUpdates: any = {};
    if (updates.fullName) dbUpdates.full_name = updates.fullName;
    if (updates.username) dbUpdates.username = updates.username;
    if (updates.role) dbUpdates.role = updates.role;
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.granularPermissions) dbUpdates.granular_permissions = updates.granularPermissions;

    const { error } = await supabase.from('profiles').update(dbUpdates).eq('id', userId);
    if (!error) await fetchUsers();
    else throw error;
  };

  const deleteUser = async (userId: string) => {
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (!error) await fetchUsers();
    else throw error;
  };

  const hasPermission = (permissionId: string) => {
    // Grant all permissions while authorization is disabled
    return true;
  };

  return (
    <AuthContext.Provider value={{ 
      user: currentUser, 
      isAuthenticated: true, // Always true for now
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