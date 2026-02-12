import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Lock, EyeOff, Eye, Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }
    setLoading(true);
    try {
      const success = await login(email, password);
      if (!success) alert("Invalid credentials or user inactive.");
    } catch (err) {
      alert("Login failed. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] font-sans">
      <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-12 flex flex-col items-center animate-slide-up">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black text-[#2d808e] tracking-tighter mb-2 italic">ALIGN</h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">Data Management System</p>
        </div>
        
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[#2d808e]">
                <User size={16} className="text-gray-400" />
              </div>
              <input
                type="email"
                placeholder="mail@fairtechnology.com.bd"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-[#2d808e] focus:ring-4 focus:ring-cyan-500/5 outline-none text-sm font-medium transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Secure Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[#2d808e]">
                <Lock size={16} className="text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-[#2d808e] focus:ring-4 focus:ring-cyan-500/5 outline-none text-sm font-medium transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-[#2d808e] transition-colors"
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between px-1 pt-1">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#2d808e] focus:ring-[#2d808e]" />
              <span className="text-[11px] font-bold text-gray-400">Remember me</span>
            </label>
            <button type="button" className="text-[11px] font-black text-[#2d808e] hover:underline uppercase">Forgot Password?</button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-6 bg-[#2d808e] text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl shadow-xl shadow-cyan-900/10 transition-all hover:bg-[#256b78] hover:shadow-2xl hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center space-x-3"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            <span>{loading ? 'Authenticating...' : 'Sign In To System'}</span>
          </button>
        </form>

        <div className="mt-12 text-center">
          <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Authorized Access Only</p>
        </div>
      </div>
    </div>
  );
};

export default Login;