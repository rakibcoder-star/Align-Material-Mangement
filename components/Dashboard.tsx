
import React from 'react';
import { useAuth } from '../context/AuthContext';
import UserManagement from './UserManagement';
import { Role } from '../types';

const Dashboard: React.FC = () => {
  const { user, logout, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'overview' | 'users'>('overview');

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <h1 className="text-2xl font-bold tracking-tight text-[#2d808e]">ALLOT</h1>
          <nav className="hidden md:flex space-x-4">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1 text-sm font-medium transition-colors ${activeTab === 'overview' ? 'text-[#2d808e]' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Overview
            </button>
            {hasPermission('manage_users') && (
              <button 
                onClick={() => setActiveTab('users')}
                className={`px-3 py-1 text-sm font-medium transition-colors ${activeTab === 'users' ? 'text-[#2d808e]' : 'text-gray-500 hover:text-gray-900'}`}
              >
                User Management
              </button>
            )}
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{user.email}</p>
            <p className="text-xs text-gray-500 capitalize">{user.role.toLowerCase()}</p>
          </div>
          <button 
            onClick={logout}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            title="Logout"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'overview' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Account Status</h3>
                <div className="flex items-center space-x-2">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  <span className="text-xl font-semibold">Active</span>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Role Permissions</h3>
                <div className="flex flex-wrap gap-2">
                  {user.permissions.map(p => (
                    <span key={p} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded border border-gray-200 uppercase font-mono">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Session Info</h3>
                <p className="text-gray-600 text-sm">Last login: Today, {new Date().toLocaleTimeString()}</p>
              </div>
              
              <div className="md:col-span-3 bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold mb-4">Welcome to ALLOT</h2>
                <p className="text-gray-600 mb-6">
                  You are currently signed in with {user.role.toLowerCase()} privileges. 
                  Use the navigation above to manage tasks or view platform statistics.
                </p>
                <div className="flex space-x-4">
                  <button className="px-4 py-2 bg-[#2d808e] text-white rounded hover:bg-[#256b78] transition-colors">
                    Start New Project
                  </button>
                  <button className="px-4 py-2 border border-gray-200 text-gray-700 rounded hover:bg-gray-50 transition-colors">
                    View Logs
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <UserManagement />
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
