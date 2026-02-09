import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const success = await login(email || 'rakib@align.com', password || 'admin123');
      if (!success) {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#2d808e] via-[#f1f3f4] to-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#2d808e]/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#17a2b8]/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10 animate-slide-up">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(45,128,142,0.2)] p-8 md:p-12 border border-white/60">
          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 bg-[#2d808e] rounded-[24px] flex items-center justify-center mb-6 shadow-2xl shadow-[#2d808e]/30 transition-transform hover:scale-105 duration-300">
              <span className="text-white font-black text-4xl tracking-tighter">A</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tighter text-gray-900">ALIGN</h1>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.4em] mt-2">Data Management System</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#2d808e] uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400 group-focus-within:text-[#2d808e] transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="name@align.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:bg-white focus:border-[#2d808e] focus:ring-8 focus:ring-[#2d808e]/5 outline-none transition-all text-sm text-gray-800"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[11px] font-bold text-[#2d808e] uppercase tracking-widest">Password</label>
                <button type="button" className="text-[10px] font-bold text-gray-400 hover:text-[#2d808e] transition-colors">Forgot?</button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400 group-focus-within:text-[#2d808e] transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:bg-white focus:border-[#2d808e] focus:ring-8 focus:ring-[#2d808e]/5 outline-none transition-all text-sm text-gray-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#2d808e] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-xs text-red-600 font-medium text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#2d808e] text-white font-bold rounded-2xl shadow-xl shadow-[#2d808e]/20 hover:bg-[#256b78] hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center space-x-3 group"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <span className="text-[15px]">Sign In</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-12 flex flex-col items-center">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-8"></div>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.3em] text-center mb-3">System Maintained By</p>
            <a 
              href="https://github.com/rakibcoder-star" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[13px] font-black text-[#2d808e] hover:text-[#17a2b8] hover:tracking-widest transition-all duration-300"
            >
              RAKIB H SHUVO
            </a>
          </div>
        </div>
        
        <p className="text-center mt-10 text-[9px] text-gray-500 font-bold uppercase tracking-[0.3em]">
          Copyright © ALIGN 2026 • Enterprise Edition
        </p>
      </div>
    </div>
  );
};

export default Login;