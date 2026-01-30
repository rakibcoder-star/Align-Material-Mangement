import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { ROLE_DEFAULT_PERMISSIONS } from '../constants';

const UserManagement: React.FC = () => {
  const { users, addUser, deleteUser, user: currentUser } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<Role>(Role.USER);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addUser({
        email: newEmail,
        password: newPassword,
        role: newRole,
        permissions: ROLE_DEFAULT_PERMISSIONS[newRole]
      });
      setNewEmail('');
      setNewPassword('');
      setIsAdding(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, email: string) => {
    if (window.confirm(`Are you absolutely sure you want to delete the user "${email}"? This action cannot be undone and will immediately revoke their access.`)) {
      await deleteUser(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">User Management</h2>
          <p className="text-sm text-gray-500">Add, edit or remove platform users from Supabase.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center px-4 py-2 bg-[#2d808e] text-white rounded hover:bg-[#256b78] transition-colors shadow-sm"
        >
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add User
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Create New User</h3>
          <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Email Address</label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-[#2d808e] outline-none"
                placeholder="user@allot.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-[#2d808e] outline-none"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Assign Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as Role)}
                className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-[#2d808e] outline-none bg-white"
              >
                <option value={Role.ADMIN}>Administrator</option>
                <option value={Role.MANAGER}>Manager</option>
                <option value={Role.USER}>Standard User</option>
              </select>
            </div>
            <div className="md:col-span-3 flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-[#2d808e] text-white rounded text-sm font-medium hover:bg-[#256b78] disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save User'}
              </button>
            </div>
          </form>
          <p className="mt-4 text-xs text-gray-400 italic">
            Note: For direct user creation to work, you must enable the Supabase Admin API or create users via Auth first.
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs">
                      {u.email.substring(0, 1).toUpperCase()}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{u.email}</div>
                      <div className="text-xs text-gray-500">ID: {u.id.substring(0, 8)}...</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    u.role === Role.ADMIN ? 'bg-purple-100 text-purple-800' : 
                    u.role === Role.MANAGER ? 'bg-blue-100 text-blue-800' : 
                    'bg-green-100 text-green-800'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {u.permissions.slice(0, 2).map(p => (
                      <span key={p} className="px-1.5 py-0.5 bg-gray-50 text-[10px] text-gray-500 border border-gray-100 rounded">
                        {p.split('_').pop()}
                      </span>
                    ))}
                    {u.permissions.length > 2 && (
                      <span className="text-[10px] text-gray-400">+{u.permissions.length - 2} more</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    disabled={u.id === currentUser?.id}
                    onClick={() => handleDelete(u.id, u.email)}
                    className="text-red-600 hover:text-red-900 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;