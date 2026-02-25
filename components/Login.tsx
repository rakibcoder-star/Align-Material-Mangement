
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, EyeOff, Eye, Loader2, AlertCircle, Database, CheckCircle, ShieldCheck } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center bg-[#f4f7f6] font-sans overflow-hidden relative" style={{ fontFamily: 'var(--ant-font-family)' }}>
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#2d808e]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#2d808e]/5 rounded-full blur-3xl"></div>

      <div className="w-full max-w-[440px] bg-white rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.06)] p-10 flex flex-col items-center animate-slide-up relative border border-white/20 backdrop-blur-sm z-10">
        
        {/* Status indicator */}
        <div className="absolute top-6 right-8 flex items-center space-x-2 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100 transition-all hover:bg-white">
          {dbStatus === 'checking' && <Loader2 size={10} className="animate-spin text-gray-400" />}
          {dbStatus === 'connected' && <CheckCircle size={10} className="text-emerald-500" />}
          {dbStatus === 'error' && <Database size={10} className="text-red-500" />}
          <span className="text-[8px] font-bold uppercase text-gray-400">
            {dbStatus === 'checking' ? 'Connecting' : dbStatus === 'connected' ? 'Secure node' : 'Offline'}
          </span>
        </div>

        <div className="mb-10 text-center">
          <div className="w-14 h-14 bg-[#2d808e] rounded-2xl flex items-center justify-center mb-5 mx-auto shadow-xl shadow-[#2d808e]/10 rotate-3 transform transition-transform hover:rotate-0">
            <ShieldCheck size={28} className="text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-bold text-[#2d808e] mb-0.5 italic">ALIGN</h1>
          <p className="text-[10px] font-bold text-gray-300 uppercase ml-1">Enterprise terminal</p>
        </div>
        
        {errorMsg && (
          <div className="w-full mb-6 p-3.5 bg-red-50 border border-red-100 rounded-xl flex items-start space-x-3 text-red-600 animate-in fade-in slide-in-from-top-2 duration-200">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-[11px] font-bold leading-tight">{errorMsg}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Email Terminal</label>
            <div className="relative group">
              <input
                type="email"
                placeholder="identity@fairtechnology.com.bd"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-[#2d808e] focus:ring-4 focus:ring-[#2d808e]/5 outline-none text-sm font-bold transition-all placeholder:text-gray-300"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Security Key</label>
            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-[#2d808e] focus:ring-4 focus:ring-[#2d808e]/5 outline-none text-sm font-bold transition-all placeholder:text-gray-300"
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

          <div className="flex items-center justify-between px-1 pt-1">
            <label className="flex items-center space-x-2.5 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-200 text-[#2d808e] focus:ring-[#2d808e] transition-all" />
              <span className="text-[11px] font-bold text-gray-400 group-hover:text-gray-500">Maintain Session</span>
            </label>
            <button type="button" className="text-[11px] font-bold text-[#2d808e] hover:underline uppercase">Recovery</button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4.5 mt-3 bg-[#2d808e] text-white font-bold text-[13px] uppercase rounded-2xl shadow-xl shadow-[#2d808e]/10 transition-all hover:bg-[#256b78] hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center space-x-3"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            <span>{loading ? 'Authenticating...' : 'Initialize Terminal'}</span>
          </button>
        </form>

        <div className="mt-12 text-center">
          <p className="text-[9px] text-gray-300 font-bold uppercase">Proprietary Data Node</p>
        </div>
      </div>
    </div>
  );
};

export default Login;