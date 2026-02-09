import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Role, AuthState } from '../types';
import { supabase } from '../lib/supabase';
import { ROLE_DEFAULT_PERMISSIONS } from '../constants';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  addUser: (userData: Omit<User, 'id' | 'createdAt'>) => Promise<void>;
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
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (data && !error) {
        setUsers(data.map(u => ({
          id: u.id,
          email: u.email,
          role: (u.role as Role) || Role.USER,
          permissions: u.permissions || ROLE_DEFAULT_PERMISSIONS[(u.role as Role) || Role.USER],
          createdAt: u.created_at || new Date().toISOString()
        })));
      }
    } catch (e) {
      console.warn("Supabase fetch failed, using local state");
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          setCurrentUser({
            id: session.user.id,
            email: session.user.email || '',
            role: (profile?.role as Role) || Role.ADMIN,
            permissions: profile?.permissions || ROLE_DEFAULT_PERMISSIONS[(profile?.role as Role) || Role.ADMIN],
            createdAt: profile?.created_at || new Date().toISOString()
          });
          await fetchUsers();
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [fetchUsers]);

  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    // Modified to allow instant login for development/demo purposes as requested
    const simulatedUser: User = {
      id: 'sim-' + Math.random().toString(36).substr(2, 9),
      email: email || 'user@align.com',
      role: Role.ADMIN,
      permissions: ROLE_DEFAULT_PERMISSIONS[Role.ADMIN],
      createdAt: new Date().toISOString()
    };
    setCurrentUser(simulatedUser);
    setUsers(prev => prev.find(u => u.email === simulatedUser.email) ? prev : [simulatedUser, ...prev]);
    return true;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  }, []);

  const addUser = useCallback(async (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      id: 'usr-' + Math.random().toString(36).substr(2, 9),
      ...userData,
      createdAt: new Date().toISOString()
    };

    try {
      const { error } = await supabase.from('profiles').insert([{
        email: userData.email,
        role: userData.role,
        permissions: userData.permissions,
        created_at: newUser.createdAt
      }]);
      if (error) throw error;
    } catch (e) {
      console.warn("Database storage skipped, adding to local UI state only.");
    }

    setUsers(prev => [newUser, ...prev]);
  }, []);

  const deleteUser = useCallback(async (userId: string) => {
    try {
      await supabase.from('profiles').delete().eq('id', userId);
    } catch (e) {}
    setUsers(prev => prev.filter(u => u.id !== userId));
  }, []);

  const hasPermission = useCallback((permissionId: string) => {
    if (!currentUser) return false;
    if (currentUser.role === Role.ADMIN) return true;
    return currentUser.permissions.includes(permissionId);
  }, [currentUser]);

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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};