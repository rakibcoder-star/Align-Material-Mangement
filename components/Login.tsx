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
      setError("Enter credentials to proceed");
      return;
    }
    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        navigate('/overview');
      } else {
        setError("Unauthorized access. Check email or status.");
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafb] font-sans overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#2d808e]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-900/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>

      <div className="w-full max-w-[420px] px-6 relative z-10">
        <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 p-12 animate-slide-up">
          <div className="mb-12 text-center">
            <div className="w-20 h-20 bg-[#2d808e] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-cyan-900/20 rotate-3 transition-transform hover:rotate-0 cursor-default">
              <ShieldCheck size={40} className="text-white" strokeWidth={1.5} />
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-1 uppercase">Align</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em] ml-1">Enterprise DMS</p>
          </div>
          
          {error && (
            <div className="mb-8 p-3 bg-red-50 border border-red-100 rounded-xl text-[10px] font-black text-red-600 text-center animate-in fade-in slide-in-from-top-2 uppercase tracking-wider">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Secure Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400 transition-colors group-focus-within:text-[#2d808e]">
                  <User size={18} />
                </div>
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#2d808e] focus:ring-8 focus:ring-cyan-500/5 outline-none text-sm font-bold transition-all placeholder:text-gray-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Access Key</label>
                <button type="button" className="text-[10px] font-black text-[#2d808e] hover:underline uppercase tracking-tighter">Reset?</button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400 transition-colors group-focus-within:text-[#2d808e]">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#2d808e] focus:ring-8 focus:ring-cyan-500/5 outline-none text-sm font-bold transition-all placeholder:text-gray-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-4 flex items-center text-gray-300 hover:text-[#2d808e] transition-colors"
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-6 bg-[#2d808e] text-white font-black text-[12px] uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-cyan-900/20 transition-all hover:bg-[#256b78] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 flex items-center justify-center space-x-3"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              <span>{loading ? 'Verifying Access' : 'Sign In'}</span>
            </button>
          </form>
        </div>
        
        <p className="mt-12 text-center text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">
          Secure Access Protocol v4.0.2
        </p>
      </div>
    </div>
  );
};

export default Login;