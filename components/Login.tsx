import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Lock, EyeOff, Eye } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simplification: Direct login without credentials check as requested
    await login(email || 'user@align.com', password || 'password');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e5e5e5] font-sans">
      <div className="w-full max-w-[480px] bg-white rounded-lg shadow-xl p-16 flex flex-col items-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-12 tracking-tight">ALIGN</h1>
        
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          {/* Email Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <User className="h-4 w-4 text-gray-800" />
            </div>
            <input
              type="email"
              placeholder="Enter your mail here"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 focus:border-gray-300 outline-none text-sm placeholder-gray-300 transition-all"
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-gray-800" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-gray-200 focus:border-gray-300 outline-none text-sm placeholder-gray-300 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>

          {/* Log in Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-4 bg-[#2d808e] text-white font-medium text-sm transition-all hover:bg-[#256b78] active:scale-[0.99] disabled:opacity-70"
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;