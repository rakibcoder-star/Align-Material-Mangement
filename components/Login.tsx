import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Lock, EyeOff, Eye, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        navigate('/overview');
      } else {
        setError("Invalid credentials or account inactive.");
      }
    } catch (err: any) {
      setError("Authentication error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e5e5e5] font-sans">
      <div className="w-full max-w-[440px] bg-white rounded-md shadow-lg p-12 py-16 flex flex-col items-center">
        {/* Header Label */}
        <h1 className="text-[32px] font-bold text-[#1a2b3c] mb-12 tracking-tight">ALLOT</h1>
        
        {error && (
          <div className="w-full mb-4 text-center text-xs text-red-500 font-bold bg-red-50 py-2 rounded border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-5">
          {/* Email Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500">
              <User size={16} />
            </div>
            <input
              type="email"
              placeholder="Enter your mail here"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded text-sm placeholder:text-gray-300 outline-none focus:border-gray-400 transition-colors"
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500">
              <Lock size={16} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-2.5 bg-white border border-gray-300 rounded text-sm placeholder:text-gray-300 outline-none focus:border-gray-400 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-300 hover:text-gray-500 transition-colors"
            >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 bg-[#247d8c] text-white font-medium text-sm rounded shadow-sm hover:bg-[#1d6470] active:bg-[#1a5a65] transition-all flex items-center justify-center space-x-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            <span>Log in</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;