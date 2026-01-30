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

// Requested administrator credentials
const MOCK_ADMIN_EMAIL = 'rakib@align.com';
const MOCK_ADMIN_PASS = 'rakib1234';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
    
    if (data && !error) {
      const mappedUsers = data.map(u => ({
        id: u.id,
        email: u.email,
        role: (u.role as Role) || Role.USER,
        permissions: u.permissions || [],
        createdAt: u.created_at || new Date().toISOString()
      }));
      setUsers(mappedUsers);
    }
  }, []);

  const fetchProfile = useCallback(async (userId: string, email?: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (data && !error) {
      setCurrentUser({
        id: data.id,
        email: data.email,
        role: data.role as Role,
        permissions: data.permissions || [],
        createdAt: data.created_at
      });
    } else {
      // If profile doesn't exist but user is authenticated (like the first login), 
      // we can handle it or create one. For the mock admin, we handle it here.
      if (email === MOCK_ADMIN_EMAIL) {
        setCurrentUser({
          id: userId,
          email: MOCK_ADMIN_EMAIL,
          role: Role.ADMIN,
          permissions: ROLE_DEFAULT_PERMISSIONS[Role.ADMIN],
          createdAt: new Date().toISOString()
        });
      }
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user.id, session.user.email);
        fetchUsers();
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session.user.id, session.user.email);
        fetchUsers();
      } else {
        setCurrentUser(null);
        setUsers([]);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, fetchUsers]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Check for the specific admin user requested
    if (email === MOCK_ADMIN_EMAIL && password === MOCK_ADMIN_PASS) {
      // Attempt real login first
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.warn("Supabase Auth failed for admin, using mock bypass for development.");
        // Mock success for development/demo purposes
        setCurrentUser({
          id: 'mock-admin-id',
          email: MOCK_ADMIN_EMAIL,
          role: Role.ADMIN,
          permissions: ROLE_DEFAULT_PERMISSIONS[Role.ADMIN],
          createdAt: new Date().toISOString()
        });
        return true;
      }
      return true;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return !error;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  }, []);

  const addUser = useCallback(async (userData: Omit<User, 'id' | 'createdAt'>) => {
    // In a real app, you'd use a Supabase Edge Function to create the Auth user too.
    // This inserts into the public.profiles table.
    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        email: userData.email,
        role: userData.role,
        permissions: userData.permissions,
        created_at: new Date().toISOString()
      }])
      .select();

    if (!error && data) {
      const newUser = {
        id: data[0].id,
        email: data[0].email,
        role: data[0].role as Role,
        permissions: data[0].permissions || [],
        createdAt: data[0].created_at
      };
      setUsers(prev => [...prev, newUser]);
    } else if (error) {
      console.error("Error adding user profile:", error.message);
      throw error;
    }
  }, []);

  const deleteUser = useCallback(async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (!error) {
      setUsers(prev => prev.filter((u: User) => u.id !== userId));
    }
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