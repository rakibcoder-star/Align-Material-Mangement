
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
      setError("Authentication error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8] font-sans overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#247d8c]/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#247d8c]/5 rounded-full blur-[100px]" />
      
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-10 py-14 flex flex-col items-center relative z-10 animate-slide-up">
        {/* Branding */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 bg-[#247d8c] rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-cyan-900/20">
            <ShieldCheck className="text-white" size={28} />
          </div>
          <h1 className="text-[28px] font-black text-[#1a2b3c] tracking-[0.15em] uppercase">ALLOT</h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-1">Enterprise DMS</p>
        </div>
        
        {error && (
          <div className="w-full mb-6 text-center text-[11px] text-red-500 font-bold bg-red-50 py-3 rounded-lg border border-red-100 animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-300 group-focus-within:text-[#247d8c] transition-colors">
                <User size={16} />
              </div>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-100 rounded-xl text-sm placeholder:text-gray-300 outline-none focus:bg-white focus:border-[#247d8c] focus:ring-4 focus:ring-[#247d8c]/5 transition-all font-medium"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Secure Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-300 group-focus-within:text-[#247d8c] transition-colors">
                <Lock size={16} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3.5 bg-gray-50/50 border border-gray-100 rounded-xl text-sm placeholder:text-gray-300 outline-none focus:bg-white focus:border-[#247d8c] focus:ring-4 focus:ring-[#247d8c]/5 transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-300 hover:text-[#247d8c] transition-colors px-2"
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center space-x-2 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-200 text-[#247d8c] focus:ring-[#247d8c]/20" />
              <span className="text-[11px] font-bold text-gray-400 group-hover:text-gray-600 transition-colors">Keep me signed in</span>
            </label>
            <button type="button" className="text-[11px] font-bold text-[#247d8c] hover:underline">Forgot password?</button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-6 bg-[#247d8c] text-white font-black text-xs rounded-xl shadow-xl shadow-cyan-900/20 hover:bg-[#1d6470] active:scale-[0.98] transition-all flex items-center justify-center space-x-3 uppercase tracking-[0.2em]"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            <span>{loading ? 'Authenticating' : 'Log in'}</span>
          </button>
        </form>

        <p className="mt-10 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center leading-loose">
          Secure Access Portal<br />
          <span className="text-[#247d8c]/60">Authorized Personnel Only</span>
        </p>
      </div>

      {/* Footer copyright for login screen */}
      <p className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-black text-gray-400 uppercase tracking-widest opacity-40">
        © 2026 ALIGN DATA SYSTEMS
      </p>
    </div>
  );
};

export default Login;
