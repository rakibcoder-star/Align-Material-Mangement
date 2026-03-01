
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role, AuthState } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<{ success: boolean, message?: string }>;
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
      const metadata = data.granular_permissions?._metadata || {};
      const mappedUser: User = {
        id: data.id,
        email: data.email || metadata.email || '',
        fullName: metadata.fullName || data.full_name || 'User',
        username: metadata.username || data.username || 'user',
        officeId: metadata.officeId,
        contactNumber: metadata.contactNumber,
        department: metadata.department,
        roleTemplate: metadata.roleTemplate,
        role: (metadata.role || data.role || Role.USER) as Role,
        status: (metadata.status || data.status || 'Active') as 'Active' | 'Inactive',
        lastLogin: data.last_login,
        avatarUrl: data.avatar_url,
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
      setUsers(data.map(u => {
        const metadata = u.granular_permissions?._metadata || {};
        return {
          id: u.id,
          email: u.email || metadata.email || '',
          fullName: metadata.fullName || u.full_name || 'User',
          username: metadata.username || u.username || 'user',
          officeId: metadata.officeId,
          contactNumber: metadata.contactNumber,
          department: metadata.department,
          roleTemplate: metadata.roleTemplate,
          role: (metadata.role || u.role || Role.USER) as Role,
          status: (metadata.status || u.status || 'Active') as 'Active' | 'Inactive',
          lastLogin: u.last_login,
          avatarUrl: u.avatar_url,
          permissions: [],
          granularPermissions: u.granular_permissions || {},
          createdAt: u.created_at
        };
      }));
    }
  };

  useEffect(() => {
    // Check current session from localStorage
    const initAuth = async () => {
      const savedUserId = localStorage.getItem('align_session_id');
      if (savedUserId) {
        await fetchUserProfile(savedUserId);
      }
      setLoading(false);
    };

    initAuth();

    const timer = setTimeout(() => {
      fetchUsers();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const cleanUsername = username.trim().toLowerCase();
      
      // Check profiles table directly
      // We try to find by username in metadata if the column doesn't work
      const { data: allProfiles, error: fetchError } = await supabase
        .from('profiles')
        .select('*');

      if (fetchError) {
        console.error("Database Fetch Error:", fetchError);
        // Fallback for 'rakib'
        if (cleanUsername === 'rakib' && password === '123456') {
          return loginWithFallback('rakib-fallback-id', 'Rakib Admin (System Fallback)');
        }
        return { success: false, message: `Database error: ${fetchError.message}` };
      }

      // Find the profile manually in the returned list to be schema-agnostic
      const profile = allProfiles?.find(p => {
        const metadata = p.granular_permissions?._metadata || {};
        const pUsername = (metadata.username || p.username || '').toLowerCase();
        return pUsername === cleanUsername;
      });

      // Auto-create 'rakib' if it doesn't exist
      if (!profile && cleanUsername === 'rakib' && password === '123456') {
        const newId = crypto.randomUUID();
        const { data: newProfile, error: createError } = await supabase.from('profiles').insert([{
          id: newId,
          granular_permissions: {
            _metadata: {
              email: 'rakib@system.local',
              fullName: 'Rakib Admin',
              username: 'rakib',
              password: '123456',
              role: Role.ADMIN,
              status: 'Active'
            }
          }
        }]).select().single();
        
        if (createError) {
          console.error("Failed to initialize admin profile:", createError);
          return loginWithFallback(newId, 'Rakib Admin (Fallback)');
        }
        return completeLogin(newProfile);
      }

      if (!profile) return { success: false, message: "Invalid username or password" };
      
      const metadata = profile.granular_permissions?._metadata || {};
      const pPassword = metadata.password || profile.password;

      // Check password
      if (pPassword !== password) {
        return { success: false, message: "Invalid username or password" };
      }

      return completeLogin(profile);
    } catch (err: any) {
      console.error("Login Exception:", err);
      if (username.trim().toLowerCase() === 'rakib' && password === '123456') {
        return loginWithFallback('rakib-final-fallback', 'Rakib Admin (Final Fallback)');
      }
      return { success: false, message: `System error: ${err.message || 'Unknown error'}` };
    }
  };

  const loginWithFallback = (id: string, name: string) => {
    const fallbackAdmin: User = {
      id,
      email: 'rakib@system.local',
      fullName: name,
      username: 'rakib',
      role: Role.ADMIN,
      status: 'Active',
      lastLogin: new Date().toISOString(),
      avatarUrl: undefined,
      permissions: [],
      granularPermissions: {},
      createdAt: new Date().toISOString()
    };
    setUser(fallbackAdmin);
    setIsAuthenticated(true);
    localStorage.setItem('align_session_id', id);
    return { success: true };
  };

  const completeLogin = async (profile: any) => {
    const metadata = profile.granular_permissions?._metadata || {};
    const mappedUser: User = {
      id: profile.id,
      email: profile.email || metadata.email || '',
      fullName: metadata.fullName || profile.full_name || 'User',
      username: metadata.username || profile.username || 'user',
      officeId: metadata.officeId,
      contactNumber: metadata.contactNumber,
      department: metadata.department,
      roleTemplate: metadata.roleTemplate,
      role: (metadata.role || profile.role || Role.USER) as Role,
      status: (metadata.status || profile.status || 'Active') as 'Active' | 'Inactive',
      lastLogin: new Date().toISOString(),
      avatarUrl: profile.avatar_url,
      permissions: [],
      granularPermissions: profile.granular_permissions || {},
      createdAt: profile.created_at
    };

    setUser(mappedUser);
    setIsAuthenticated(true);
    localStorage.setItem('align_session_id', profile.id);

    // Update last login if column exists, otherwise ignore
    await supabase.from('profiles').update({ last_login: new Date().toISOString() }).eq('id', profile.id).catch(() => {});
    
    return { success: true };
  };

  const logout = async () => {
    localStorage.removeItem('align_session_id');
    setUser(null);
    setIsAuthenticated(false);
  };

  const addUser = async (userData: any) => {
    // Check if user already exists locally
    if (users.some(u => u.username.toLowerCase() === userData.username.toLowerCase())) {
      throw new Error("A user with this username already exists in the system.");
    }

    const newId = crypto.randomUUID();
    const systemEmail = `${userData.username.trim().toLowerCase()}@system.local`;

    // Create the Database Profile directly
    // We only use 'id' and 'granular_permissions' to be schema-agnostic
    const { error: profileError } = await supabase.from('profiles').insert([{
      id: newId,
      granular_permissions: {
        ...(userData.granularPermissions || {}),
        _metadata: {
          email: userData.email || systemEmail,
          fullName: userData.fullName,
          username: userData.username,
          password: userData.password || 'Fair@123456',
          officeId: userData.officeId,
          contactNumber: userData.contactNumber,
          department: userData.department,
          roleTemplate: userData.roleTemplate,
          role: userData.role,
          status: userData.status
        }
      }
    }]);
    
    if (profileError) throw profileError;
    
    fetchUsers();
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    // We only update 'granular_permissions' to be schema-agnostic
    const { error } = await supabase.from('profiles').update({
      granular_permissions: {
        ...(updates.granularPermissions || {}),
        _metadata: {
          email: updates.email,
          fullName: updates.fullName,
          username: updates.username,
          password: (updates as any).password,
          officeId: updates.officeId,
          contactNumber: updates.contactNumber,
          department: updates.department,
          roleTemplate: updates.roleTemplate,
          role: updates.role,
          status: updates.status
        }
      }
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
    if (user?.role === Role.ADMIN || user?.username === 'rakib') return true;
    return !!user?.granularPermissions?.[permissionId]?.view;
  };

  const hasGranularPermission = (moduleId: string, action: string) => {
    if (user?.role === Role.ADMIN || user?.username === 'rakib') return true;
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
