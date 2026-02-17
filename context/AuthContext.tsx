
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role, AuthState } from '../types';
import { supabase } from '../lib/supabase';

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Check current session
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetchUserProfile(session.user.id);
      }
      setLoading(false);
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    fetchUsers();

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data && !error) {
      const mappedUser: User = {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        username: data.username,
        role: data.role as Role,
        status: data.status as 'Active' | 'Inactive',
        lastLogin: data.last_login,
        permissions: [],
        granularPermissions: data.granular_permissions || {},
        createdAt: data.created_at
      };
      setUser(mappedUser);
      setIsAuthenticated(true);
    }
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (data && !error) {
      setUsers(data.map(u => ({
        id: u.id,
        email: u.email,
        fullName: u.full_name,
        username: u.username,
        role: u.role as Role,
        status: u.status as 'Active' | 'Inactive',
        lastLogin: u.last_login,
        permissions: [],
        granularPermissions: u.granular_permissions || {},
        createdAt: u.created_at
      })));
    }
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, message: error.message };
    
    // Update last login
    await supabase.from('profiles').update({ last_login: new Date().toISOString() }).eq('id', data.user.id);
    
    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
  };

  const addUser = async (userData: any) => {
    // In a real app, you'd use a service role via an Edge Function to create users in Auth
    // For this simulation, we'll create the profile which is enough for the UI to show it
    const id = crypto.randomUUID();
    const { error } = await supabase.from('profiles').insert([{
      id,
      email: userData.email,
      full_name: userData.fullName,
      username: userData.username,
      role: userData.role,
      status: userData.status,
      granular_permissions: userData.granularPermissions
    }]);
    
    if (error) throw error;
    fetchUsers();
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    const { error } = await supabase.from('profiles').update({
      full_name: updates.fullName,
      username: updates.username,
      role: updates.role,
      status: updates.status,
      granular_permissions: updates.granularPermissions
    }).eq('id', userId);

    if (error) throw error;
    fetchUsers();
    if (user?.id === userId) fetchUserProfile(userId);
  };

  const deleteUser = async (userId: string) => {
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (error) throw error;
    fetchUsers();
  };

  const hasPermission = (permissionId: string) => {
    if (user?.role === Role.ADMIN) return true;
    return !!user?.granularPermissions?.[permissionId]?.view;
  };

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