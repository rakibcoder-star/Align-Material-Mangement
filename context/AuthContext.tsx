
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
      const mappedUser: User = {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        username: data.username,
        officeId: data.office_id,
        contactNumber: data.contact_number,
        department: data.department,
        roleTemplate: data.role_template,
        role: data.role as Role,
        status: data.status as 'Active' | 'Inactive',
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
      setUsers(data.map(u => ({
        id: u.id,
        email: u.email,
        fullName: u.full_name,
        username: u.username,
        officeId: u.office_id,
        contactNumber: u.contact_number,
        department: u.department,
        roleTemplate: u.role_template,
        role: u.role as Role,
        status: u.status as 'Active' | 'Inactive',
        lastLogin: u.last_login,
        avatarUrl: u.avatar_url,
        permissions: [],
        granularPermissions: u.granular_permissions || {},
        createdAt: u.created_at
      })));
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
      const { data: initialProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', cleanUsername)
        .maybeSingle();

      if (error) {
        console.error("Database Error:", error);
        // HARDCODED FALLBACK for 'rakib' to ensure access even if DB is down or table is missing
        if (cleanUsername === 'rakib' && password === '123456') {
          const fallbackAdmin: User = {
            id: 'rakib-fallback-id',
            email: 'rakib@system.local',
            fullName: 'Rakib Admin (System Fallback)',
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
          localStorage.setItem('align_session_id', 'rakib-fallback-id');
          return { success: true };
        }
        return { success: false, message: `Database error: ${error.message}` };
      }

      let profile = initialProfile;

      // Auto-create 'rakib' if it doesn't exist
      if (!profile && cleanUsername === 'rakib' && password === '123456') {
        const newId = crypto.randomUUID();
        const { data: newProfile, error: createError } = await supabase.from('profiles').insert([{
          id: newId,
          email: 'rakib@system.local',
          full_name: 'Rakib Admin',
          username: 'rakib',
          password: '123456',
          role: Role.ADMIN,
          status: 'Active'
        }]).select().single();
        
        if (createError) {
          console.error("Failed to initialize admin profile:", createError);
          // Fallback if create fails
          const fallbackAdmin: User = {
            id: newId,
            email: 'rakib@system.local',
            fullName: 'Rakib Admin (Fallback)',
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
          localStorage.setItem('align_session_id', newId);
          return { success: true };
        }
        profile = newProfile;
      }

      if (!profile) return { success: false, message: "Invalid username or password" };
      
      // Check password (plain text as requested for simplicity)
      if (profile.password !== password) {
        return { success: false, message: "Invalid username or password" };
      }

      const mappedUser: User = {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        username: profile.username,
        officeId: profile.office_id,
        contactNumber: profile.contact_number,
        department: profile.department,
        roleTemplate: profile.role_template,
        role: profile.role as Role,
        status: profile.status as 'Active' | 'Inactive',
        lastLogin: new Date().toISOString(),
        avatarUrl: profile.avatar_url,
        permissions: [],
        granularPermissions: profile.granular_permissions || {},
        createdAt: profile.created_at
      };

      setUser(mappedUser);
      setIsAuthenticated(true);
      localStorage.setItem('align_session_id', profile.id);

      // Update last login
      await supabase.from('profiles').update({ last_login: new Date().toISOString() }).eq('id', profile.id);
      
      return { success: true };
    } catch (err: any) {
      console.error("Login Exception:", err);
      // Final fallback for 'rakib'
      if (username.trim().toLowerCase() === 'rakib' && password === '123456') {
        const fallbackAdmin: User = {
          id: 'rakib-final-fallback',
          email: 'rakib@system.local',
          fullName: 'Rakib Admin (Final Fallback)',
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
        localStorage.setItem('align_session_id', 'rakib-final-fallback');
        return { success: true };
      }
      return { success: false, message: `System error: ${err.message || 'Unknown error'}` };
    }
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
    const { error: profileError } = await supabase.from('profiles').insert([{
      id: newId,
      email: userData.email || systemEmail,
      full_name: userData.fullName,
      username: userData.username,
      password: userData.password || 'Fair@123456',
      office_id: userData.officeId,
      contact_number: userData.contactNumber,
      department: userData.department,
      role_template: userData.roleTemplate,
      role: userData.role,
      status: userData.status,
      granular_permissions: userData.granularPermissions
    }]);
    
    if (profileError) throw profileError;
    
    fetchUsers();
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    const { error } = await supabase.from('profiles').update({
      full_name: updates.fullName,
      username: updates.username,
      office_id: updates.officeId,
      contact_number: updates.contactNumber,
      department: updates.department,
      role_template: updates.roleTemplate,
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
