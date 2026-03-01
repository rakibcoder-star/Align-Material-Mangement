
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
  dbError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<User[]>([]);
  const [dbError, setDbError] = useState<string | null>(null);

  // Load users from LocalStorage as a primary/fallback source
  const loadLocalUsers = () => {
    const saved = localStorage.getItem('align_managed_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  const saveLocalUsers = (newUsers: User[]) => {
    localStorage.setItem('align_managed_users', JSON.stringify(newUsers));
    setUsers(newUsers);
  };

  const fetchUserProfile = async (userId: string) => {
    // First check local users
    const localUsers = loadLocalUsers();
    const localUser = localUsers.find((u: User) => u.id === userId);
    
    if (localUser) {
      setUser(localUser);
      setIsAuthenticated(true);
    }

    // Then try to refresh from DB
    try {
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
        
        // Update local cache for this user
        const updatedLocal = localUsers.map((u: User) => u.id === userId ? mappedUser : u);
        if (!localUser) updatedLocal.push(mappedUser);
        localStorage.setItem('align_managed_users', JSON.stringify(updatedLocal));
      }
    } catch (e) {
      console.warn("Profile fetch failed, using local session");
    }
  };

  const fetchUsers = async () => {
    // Start with local data
    const localUsers = loadLocalUsers();
    setUsers(localUsers);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setDbError(error.message);
        return;
      }

      if (data) {
        const mappedUsers = data.map(u => {
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
        });
        
        setUsers(mappedUsers);
        localStorage.setItem('align_managed_users', JSON.stringify(mappedUsers));
        setDbError(null);
      }
    } catch (e: any) {
      setDbError(e.message);
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
    try {
      await supabase.from('profiles').update({ last_login: new Date().toISOString() }).eq('id', profile.id);
    } catch (e) {
      // Ignore errors if column doesn't exist
    }
    
    return { success: true };
  };

  const logout = async () => {
    localStorage.removeItem('align_session_id');
    setUser(null);
    setIsAuthenticated(false);
  };

  const addUser = async (userData: any) => {
    const newId = crypto.randomUUID();
    const systemEmail = `${userData.username.trim().toLowerCase()}@system.local`;
    
    const newUser: User = {
      id: newId,
      email: userData.email || systemEmail,
      fullName: userData.fullName,
      username: userData.username,
      officeId: userData.officeId,
      contactNumber: userData.contactNumber,
      department: userData.department,
      roleTemplate: userData.roleTemplate,
      role: userData.role,
      status: userData.status,
      lastLogin: 'Never',
      permissions: [],
      granularPermissions: userData.granularPermissions || {},
      createdAt: new Date().toISOString()
    };

    // Update local first
    const updatedUsers = [newUser, ...users];
    saveLocalUsers(updatedUsers);

    // Try to sync with DB
    try {
      const { error: profileError } = await supabase.from('profiles').insert([{
        id: newId,
        granular_permissions: {
          ...(userData.granularPermissions || {}),
          _metadata: {
            ...userData,
            email: userData.email || systemEmail,
            password: userData.password || 'Fair@123456'
          }
        }
      }]);
      
      if (profileError) {
        console.error("DB Sync Error:", profileError);
        setDbError(`Sync failed: ${profileError.message}. Data is saved locally.`);
      }
    } catch (e: any) {
      setDbError(`System error during sync: ${e.message}`);
    }
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    // Update local first
    const updatedUsers = users.map(u => u.id === userId ? { ...u, ...updates } : u);
    saveLocalUsers(updatedUsers);
    if (user?.id === userId) setUser({ ...user, ...updates });

    // Try to sync with DB
    try {
      const { error } = await supabase.from('profiles').update({
        granular_permissions: {
          ...(updates.granularPermissions || {}),
          _metadata: {
            ...updates
          }
        }
      }).eq('id', userId);

      if (error) {
        console.error("DB Sync Error:", error);
        setDbError(`Sync failed: ${error.message}. Changes saved locally.`);
      }
    } catch (e: any) {
      setDbError(`System error during sync: ${e.message}`);
    }
  };

  const deleteUser = async (userId: string) => {
    // Update local first
    const updatedUsers = users.filter(u => u.id !== userId);
    saveLocalUsers(updatedUsers);

    // Try to sync with DB
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      if (error) {
        setDbError(`Delete sync failed: ${error.message}. User removed locally.`);
      }
    } catch (e: any) {
      setDbError(`System error during delete sync: ${e.message}`);
    }
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
      loading,
      dbError
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
