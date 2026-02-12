
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Role, AuthState, ModulePermissions } from '../types';
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (data && !error) {
        return {
          id: data.id,
          email: data.email,
          fullName: data.full_name,
          username: data.username,
          role: data.role as Role,
          status: data.status as 'Active' | 'Inactive',
          lastLogin: data.last_login,
          permissions: data.permissions || [],
          granularPermissions: data.granular_permissions || DEFAULT_GRANULAR,
          createdAt: data.created_at
        };
      }
      
      // Fallback: If auth exists but profile doesn't (rare with triggers), return basic data
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        return {
          id: authUser.id,
          email: authUser.email || '',
          fullName: authUser.email?.split('@')[0] || 'User',
          username: authUser.email?.split('@')[0] || 'user',
          role: Role.USER,
          status: 'Active' as const,
          lastLogin: new Date().toISOString(),
          permissions: [],
          granularPermissions: DEFAULT_GRANULAR,
          createdAt: new Date().toISOString()
        };
      }
    } catch (e) {
      console.error("Profile fetch error:", e);
    }
    return null;
  }, []);

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
    const initializeAuth = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        if (profile) {
          setCurrentUser(profile);
          setIsAuthenticated(true);
        }
      }
      
      await fetchUsers();
      setLoading(false);
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await fetchProfile(session.user.id);
        setCurrentUser(profile);
        setIsAuthenticated(true);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, fetchUsers]);

  const login = async (email: string, password: string): Promise<{ success: boolean, message?: string }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error("Login Error:", error.message);
      return { success: false, message: error.message };
    }
    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const addUser = async (userData: any) => {
    // 1. Create the user in Supabase Auth
    // Note: In a real admin scenario, you might use the Admin API (auth.admin.createUser)
    // but that requires a service role key. For this platform, we use signUp.
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password || 'TemporaryPassword123!',
      options: {
        data: {
          full_name: userData.fullName,
          username: userData.username
        }
      }
    });

    if (authError) throw authError;

    // 2. The trigger in PostgreSQL will handle creating the profile record.
    // However, if we want to override defaults immediately:
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          role: userData.role || Role.USER,
          granular_permissions: userData.granularPermissions || DEFAULT_GRANULAR
        })
        .eq('id', authData.user.id);
      
      if (profileError) console.error("Could not set custom permissions:", profileError.message);
    }
    
    await fetchUsers();
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
    // Note: This only deletes the profile. To delete the Auth user, you need Admin API.
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (!error) await fetchUsers();
    else throw error;
  };

  const hasPermission = (permissionId: string) => {
    if (currentUser?.role === Role.ADMIN) return true;
    // Check granular permissions for the module
    const perms = currentUser?.granularPermissions?.[permissionId];
    return perms?.view || false;
  };

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
