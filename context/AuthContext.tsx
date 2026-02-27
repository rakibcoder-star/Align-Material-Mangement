
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
  hasGranularPermission: (moduleId: string, action: string) => boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<User[]>([]);

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

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

    const timer = setTimeout(() => {
      fetchUsers();
    }, 0);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

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
    // 1. Create the Auth User
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password || 'Fair@123456', // Default password if none provided
      options: {
        data: {
          full_name: userData.fullName,
          username: userData.username,
        }
      }
    });

    if (signUpError) throw signUpError;

    // 2. Create the Database Profile if user creation was successful
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert([{
        id: data.user.id,
        email: userData.email,
        full_name: userData.fullName,
        username: userData.username,
        role: userData.role,
        status: userData.status,
        granular_permissions: userData.granularPermissions
      }]);
      
      if (profileError) throw profileError;
    }
    
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

  const hasGranularPermission = (moduleId: string, action: string) => {
    if (user?.role === Role.ADMIN) return true;
    const modulePerms = user?.granularPermissions?.[moduleId];
    if (!modulePerms) return false;
    return !!(modulePerms as any)[action];
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
      hasGranularPermission,
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
