import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Lock, EyeOff, Eye, Loader2, ShieldCheck } from 'lucide-react';
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
      setError("Please enter both email and password");
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
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafb] font-sans">
      <div className="w-full max-w-[420px] px-6">
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-10 animate-slide-up">
          <div className="mb-10 text-center">
            <div className="w-16 h-16 bg-[#2d808e]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShieldCheck size={32} className="text-[#2d808e]" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter mb-1 uppercase">Align</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em]">Enterprise DMS</p>
          </div>
          
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg text-[11px] font-bold text-red-600 text-center animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Account Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400 transition-colors group-focus-within:text-[#2d808e]">
                  <User size={16} />
                </div>
                <input
                  type="email"
                  placeholder="admin@align.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-[#2d808e] focus:ring-4 focus:ring-cyan-500/5 outline-none text-sm font-medium transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Password</label>
                <button type="button" className="text-[10px] font-bold text-[#2d808e] hover:underline uppercase tracking-tighter">Forgot?</button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400 transition-colors group-focus-within:text-[#2d808e]">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-[#2d808e] focus:ring-4 focus:ring-cyan-500/5 outline-none text-sm font-medium transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-4 flex items-center text-gray-300 hover:text-[#2d808e] transition-colors"
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-4 bg-[#2d808e] text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-cyan-900/10 transition-all hover:bg-[#256b78] hover:shadow-xl active:scale-[0.98] disabled:opacity-70 flex items-center justify-center space-x-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              <span>{loading ? 'Authenticating' : 'Sign In'}</span>
            </button>
          </form>
        </div>
        
        <p className="mt-8 text-center text-[10px] font-bold text-gray-300 uppercase tracking-widest">
          Secure Access Protocol v4.0
        </p>
      </div>
    </div>
  );
};

export default Login;