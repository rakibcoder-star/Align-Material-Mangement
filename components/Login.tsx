
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, EyeOff, Eye, Loader2, AlertCircle, Database, CheckCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { error } = await supabase.from('profiles').select('id').limit(1);
        if (error && error.code === 'PGRST116') {
           setDbStatus('connected');
           return;
        }
        if (error) throw error;
        setDbStatus('connected');
      } catch (err: any) {
        setDbStatus('error');
      }
    };
    checkConnection();
  }, []);

  if (isAuthenticated) {
    return <Navigate to="/overview" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg("Required: Email and Password");
      return;
    }

    setLoading(true);
    try {
      const result = await login(email, password);
      if (!result.success) {
        setErrorMsg(result.message || "Invalid credentials");
      }
    } catch (err) {
      setErrorMsg("Authentication service unavailable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f7f6] font-sans overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#2d808e]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#2d808e]/5 rounded-full blur-3xl"></div>

      <div className="w-full max-w-[480px] bg-white rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.06)] p-12 flex flex-col items-center animate-slide-up relative border border-white/20 backdrop-blur-sm z-10">
        
        {/* Status indicator */}
        <div className="absolute top-8 right-8 flex items-center space-x-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 transition-all hover:bg-white">
          {dbStatus === 'checking' && <Loader2 size={12} className="animate-spin text-gray-400" />}
          {dbStatus === 'connected' && <CheckCircle size={12} className="text-emerald-500" />}
          {dbStatus === 'error' && <Database size={12} className="text-red-500" />}
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">
            {dbStatus === 'checking' ? 'Connecting' : dbStatus === 'connected' ? 'Secure Node' : 'Service Down'}
          </span>
        </div>

        <div className="mb-12 text-center">
          <div className="w-16 h-16 bg-[#2d808e] rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-xl shadow-[#2d808e]/20 rotate-3 transform transition-transform hover:rotate-0">
            <ShieldCheck size={32} className="text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-5xl font-black text-[#2d808e] tracking-tighter mb-1 italic">ALIGN</h1>
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] ml-1">Secure Management Portal</p>
        </div>
        
        {errorMsg && (
          <div className="w-full mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start space-x-3 text-red-600 animate-in fade-in slide-in-from-top-4 duration-300">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-[12px] font-black leading-tight">{errorMsg}</span>
              <span className="text-[10px] mt-1 opacity-70">Please check your credentials or contact IT support.</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Email Terminal</label>
            <div className="relative group">
              <input
                type="email"
                placeholder="identity@fairtechnology.com.bd"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:bg-white focus:border-[#2d808e] focus:ring-8 focus:ring-cyan-500/5 outline-none text-sm font-bold transition-all placeholder:text-gray-300"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Security Key</label>
            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:bg-white focus:border-[#2d808e] focus:ring-8 focus:ring-cyan-500/5 outline-none text-sm font-bold transition-all placeholder:text-gray-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-5 flex items-center text-gray-300 hover:text-[#2d808e] transition-colors"
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between px-2 pt-2">
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input type="checkbox" className="w-5 h-5 rounded-lg border-gray-200 text-[#2d808e] focus:ring-[#2d808e] transition-all" />
              <span className="text-[12px] font-bold text-gray-400 group-hover:text-gray-600">Maintain Session</span>
            </label>
            <button type="button" className="text-[12px] font-black text-[#2d808e] hover:underline uppercase tracking-tight">Access Recovery</button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 mt-4 bg-[#2d808e] text-white font-black text-sm uppercase tracking-[0.25em] rounded-2xl shadow-2xl shadow-[#2d808e]/20 transition-all hover:bg-[#256b78] hover:shadow-[#2d808e]/30 hover:-translate-y-1 active:scale-[0.97] disabled:opacity-70 flex items-center justify-center space-x-4"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : null}
            <span>{loading ? 'Validating...' : 'Initialize Terminal'}</span>
          </button>
        </form>

        <div className="mt-16 text-center">
          <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.4em]">Proprietary Enterprise System</p>
          <div className="flex items-center justify-center space-x-4 mt-4">
             <div className="w-8 h-[1px] bg-gray-100"></div>
             <ShieldCheck size={14} className="text-gray-100" />
             <div className="w-8 h-[1px] bg-gray-100"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
