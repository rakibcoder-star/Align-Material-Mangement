import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Role, AuthState } from '../types';
import { supabase } from '../lib/supabase';
import { ROLE_DEFAULT_PERMISSIONS } from '../constants';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  addUser: (userData: any) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  users: User[];
  hasPermission: (permissionId: string) => boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
        role: u.role as Role,
        permissions: u.permissions || [],
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
            role: profile.role as Role,
            permissions: profile.permissions,
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
    // For demo: We use a static login that maps to a "Master Admin" if no session exists
    // In production, use supabase.auth.signInWithPassword
    const mockId = '00000000-0000-0000-0000-000000000000';
    const profile = {
      id: mockId,
      email: email || 'admin@align.com',
      role: Role.ADMIN,
      permissions: ROLE_DEFAULT_PERMISSIONS[Role.ADMIN],
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
    const { data, error } = await supabase.from('profiles').insert([{
      id: uuidv4(), // Client side UUID for demo if not using Auth signup
      email: userData.email,
      role: userData.role,
      permissions: userData.permissions
    }]).select();
    
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