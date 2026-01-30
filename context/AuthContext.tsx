
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Role, AuthState } from '../types';
import { supabase } from '../lib/supabase';

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
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
    
    if (data && !error) {
      // Map database fields to our User interface if they differ
      const mappedUsers = data.map(u => ({
        id: u.id,
        email: u.email,
        role: u.role as Role,
        permissions: u.permissions || [],
        createdAt: u.created_at || u.createdAt
      }));
      setUsers(mappedUsers);
    }
  }, []);

  const fetchProfile = useCallback(async (userId: string) => {
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
        createdAt: data.created_at || data.createdAt
      });
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user.id);
        fetchUsers();
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session.user.id);
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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return !error;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const addUser = useCallback(async (userData: Omit<User, 'id' | 'createdAt'>) => {
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
