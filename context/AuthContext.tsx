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
  ai_assistant: { view: false, edit: false, dl: false },
  rolled_out: { view: true, edit: false, dl: false },
  process_damage: { view: true, edit: false, dl: false },
  incoming_damage: { view: true, edit: false, dl: false }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setCurrentUser({
            id: profile.id,
            email: profile.email,
            fullName: profile.full_name,
            username: profile.username,
            role: profile.role as Role,
            status: profile.status || 'Active',
            lastLogin: profile.last_login || profile.created_at,
            permissions: profile.permissions,
            granularPermissions: profile.granular_permissions || DEFAULT_GRANULAR,
            createdAt: profile.created_at
          });
        }
        await fetchUsers();
      }
      setLoading(false);
    };
    initAuth();
  }, [fetchUsers]);

  const login = async (email: string, _password: string): Promise<boolean> => {
    const mockId = '00000000-0000-0000-0000-000000000000';
    const profile: User = {
      id: mockId,
      email: email || 'rakib@prodex.com',
      fullName: 'RAKIB',
      username: 'rakib',
      role: Role.ADMIN,
      status: 'Active',
      lastLogin: new Date().toISOString(),
      permissions: ROLE_DEFAULT_PERMISSIONS[Role.ADMIN],
      granularPermissions: DEFAULT_GRANULAR,
      createdAt: new Date().toISOString()
    };
    
    setCurrentUser(profile);
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const addUser = async (userData: any) => {
    const { error } = await supabase.from('profiles').insert([{
      id: uuidv4(),
      email: userData.email,
      full_name: userData.fullName,
      username: userData.username,
      role: userData.role,
      status: 'Active',
      granular_permissions: userData.granularPermissions || DEFAULT_GRANULAR
    }]).select();
    
    if (!error) await fetchUsers();
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    // Map internal camelCase to DB snake_case if needed
    const dbUpdates: any = {};
    if (updates.fullName) dbUpdates.full_name = updates.fullName;
    if (updates.username) dbUpdates.username = updates.username;
    if (updates.role) dbUpdates.role = updates.role;
    if (updates.granularPermissions) dbUpdates.granular_permissions = updates.granularPermissions;

    const { error } = await supabase.from('profiles').update(dbUpdates).eq('id', userId);
    if (!error) await fetchUsers();
  };

  const deleteUser = async (userId: string) => {
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (!error) await fetchUsers();
  };

  const hasPermission = (permissionId: string) => {
    if (!currentUser) return false;
    if (currentUser.role === Role.ADMIN) return true;
    return currentUser.permissions.includes(permissionId);
  };

  function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

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
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};