import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Role, User, ModulePermissions } from '../types';
import { X, User as UserIcon, Plus, Trash2, Edit, ChevronDown, Check } from 'lucide-react';

interface PermissionCardProps {
  label: string;
  moduleId: string;
  permissions: ModulePermissions;
  onChange: (moduleId: string, field: keyof ModulePermissions, value: boolean) => void;
}

const PermissionCard: React.FC<PermissionCardProps> = ({ label, moduleId, permissions, onChange }) => (
  <div className="bg-white border border-cyan-100 rounded-lg p-3 flex flex-col space-y-3">
    <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">{label}</span>
    <div className="flex items-center space-x-4">
      {(['view', 'edit', 'dl'] as const).map((field) => (
        <label key={field} className="flex items-center space-x-1.5 cursor-pointer group">
          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${permissions[field] ? 'bg-[#2d808e] border-[#2d808e]' : 'border-gray-300 group-hover:border-[#2d808e]'}`}>
            {permissions[field] && <Check size={10} className="text-white" strokeWidth={4} />}
            <input 
              type="checkbox" 
              className="hidden" 
              checked={permissions[field]} 
              onChange={(e) => onChange(moduleId, field, e.target.checked)} 
            />
          </div>
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{field}</span>
        </label>
      ))}
    </div>
  </div>
);

const UserManagement: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, user: currentUser } = useAuth();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  // Local state for modal/form
  const [formData, setFormData] = useState<Partial<User>>({});

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setFormData({ ...user });
  };

  const handleCommitChanges = async () => {
    if (editingUser) {
      await updateUser(editingUser.id, formData);
      setEditingUser(null);
    } else if (isAdding) {
      await addUser(formData);
      setIsAdding(false);
    }
  };

  const handlePermissionChange = (moduleId: string, field: keyof ModulePermissions, value: boolean) => {
    const current = formData.granularPermissions || {};
    const modulePerms = current[moduleId] || { view: false, edit: false, dl: false };
    
    setFormData({
      ...formData,
      granularPermissions: {
        ...current,
        [moduleId]: { ...modulePerms, [field]: value }
      }
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">System Access Control</h2>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mt-0.5">Manage users and granular module permissions</p>
        </div>
        <button
          onClick={() => {
            setIsAdding(true);
            setFormData({ role: Role.USER, granularPermissions: {} });
          }}
          className="flex items-center px-4 py-2 bg-[#2d808e] text-white text-xs font-bold rounded shadow-sm hover:bg-[#256b78] transition-all uppercase tracking-widest"
        >
          <Plus size={14} className="mr-2" /> New User
        </button>
      </div>

      <div className="bg-white rounded border border-gray-100 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-[#fafbfc]">
            <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <th className="px-6 py-5 text-left">User</th>
              <th className="px-6 py-5 text-left">Username</th>
              <th className="px-6 py-5 text-left">Role</th>
              <th className="px-6 py-5 text-left">Status</th>
              <th className="px-6 py-5 text-left">Last Login</th>
              <th className="px-6 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 shadow-inner">
                      <UserIcon size={18} className="text-gray-400" />
                    </div>
                    <div className="ml-4">
                      <div className="text-[12px] font-black text-gray-800 uppercase tracking-tight">{u.fullName}</div>
                      <div className="text-[10px] text-gray-400">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[12px] font-medium text-gray-600">
                  {u.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest border border-gray-200 rounded text-gray-600">
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-full ${
                    u.status === 'Active' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
                  }`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[11px] font-medium text-gray-400">
                  {formatDate(u.lastLogin)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end space-x-4">
                    <button 
                      onClick={() => handleEditClick(u)}
                      className="text-[#2d808e] text-[11px] font-black hover:underline uppercase tracking-tight"
                    >
                      Edit Access
                    </button>
                    <button 
                      disabled={u.id === currentUser?.id}
                      onClick={() => {
                         if(window.confirm(`Delete user ${u.fullName}?`)) deleteUser(u.id);
                      }}
                      className="text-red-500 text-[11px] font-black hover:underline uppercase tracking-tight disabled:opacity-20"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Access Modal - Exact match to image */}
      {(editingUser || isAdding) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-[1000px] rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
              <h3 className="text-lg font-black text-gray-800 tracking-tight">
                {isAdding ? 'New Access' : `Edit Access: ${editingUser?.fullName}`}
              </h3>
              <button onClick={() => { setEditingUser(null); setIsAdding(false); }} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-10 overflow-y-auto max-h-[80vh] scrollbar-thin">
              {/* User Identity Info */}
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                    <input 
                      type="text" 
                      value={formData.fullName || ''}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded outline-none focus:border-[#2d808e] text-sm text-gray-700 font-medium" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Username</label>
                    <input 
                      type="text" 
                      value={formData.username || ''}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded outline-none focus:border-[#2d808e] text-sm text-gray-700 font-medium" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Role Template</label>
                    <div className="relative">
                      <select 
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value as Role})}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded outline-none focus:border-[#2d808e] text-sm text-gray-700 font-medium appearance-none"
                      >
                        <option value={Role.USER}>User</option>
                        <option value={Role.MANAGER}>Manager</option>
                        <option value={Role.ADMIN}>Admin</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded outline-none focus:border-[#2d808e] text-sm text-gray-700 font-medium" 
                    />
                  </div>
                </div>
                
                {/* Avatar section matching image */}
                <div className="w-[300px] bg-gray-50/50 rounded-xl border border-gray-100 p-8 flex flex-col items-center justify-center space-y-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center shadow-inner border border-white">
                      <UserIcon size={40} className="text-gray-400" />
                    </div>
                    <button className="absolute bottom-1 right-1 bg-[#2d808e] text-white p-1 rounded-full border-2 border-white shadow-sm">
                      <Plus size={14} strokeWidth={3} />
                    </button>
                  </div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Avatar</span>
                </div>
              </div>

              {/* Granular Module Restrictions */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                   <div className="w-1 h-5 bg-[#2d808e] rounded-full"></div>
                   <h4 className="text-[12px] font-black text-gray-700 uppercase tracking-widest">Granular Module Restrictions</h4>
                </div>

                <div className="space-y-8">
                  {/* System Base Section */}
                  <div className="bg-gray-50/50 rounded-xl border border-gray-100 p-6 space-y-4">
                    <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">System Base</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <PermissionCard 
                        label="A I Assistant" 
                        moduleId="ai_assistant"
                        permissions={formData.granularPermissions?.ai_assistant || {view: false, edit: false, dl: false}}
                        onChange={handlePermissionChange}
                      />
                    </div>
                  </div>

                  {/* Production Section */}
                  <div className="bg-gray-50/50 rounded-xl border border-gray-100 p-6 space-y-4">
                    <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Production</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <PermissionCard 
                        label="Rolled Out" 
                        moduleId="rolled_out"
                        permissions={formData.granularPermissions?.rolled_out || {view: false, edit: false, dl: false}}
                        onChange={handlePermissionChange}
                      />
                      <PermissionCard 
                        label="Process Damage" 
                        moduleId="process_damage"
                        permissions={formData.granularPermissions?.process_damage || {view: false, edit: false, dl: false}}
                        onChange={handlePermissionChange}
                      />
                      <PermissionCard 
                        label="Incoming Damage" 
                        moduleId="incoming_damage"
                        permissions={formData.granularPermissions?.incoming_damage || {view: false, edit: false, dl: false}}
                        onChange={handlePermissionChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer matching image */}
            <div className="px-8 py-5 border-t border-gray-100 flex items-center justify-end space-x-6 bg-white sticky bottom-0 z-10">
              <button 
                onClick={() => { setEditingUser(null); setIsAdding(false); }}
                className="text-[12px] font-black text-gray-500 hover:text-gray-800 uppercase tracking-widest"
              >
                Cancel
              </button>
              <button 
                onClick={handleCommitChanges}
                className="flex items-center px-10 py-3 bg-[#2d808e] text-white text-[12px] font-black rounded shadow-md hover:bg-[#256b78] transition-all uppercase tracking-widest"
              >
                <Plus size={16} className="mr-3" strokeWidth={3} />
                Commit Access Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;