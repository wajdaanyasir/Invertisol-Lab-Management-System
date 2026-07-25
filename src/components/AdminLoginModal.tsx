import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, KeyRound, Eye, EyeOff, ShieldAlert, X, Zap, CheckCircle2 } from 'lucide-react';

export const AdminLoginModal: React.FC = () => {
  const { showAdminLoginModal, setShowAdminLoginModal, unlockAdmin } = useApp();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!showAdminLoginModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMsg('Please enter the Admin Password or Staff PIN.');
      return;
    }

    const success = unlockAdmin(password);
    if (success) {
      setPassword('');
      setErrorMsg('');
    } else {
      setErrorMsg('Invalid password! Default Staff PIN is 1234.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 text-slate-900 animate-in fade-in zoom-in duration-200">
        {/* Modal Top Header */}
        <div className="bg-[#008b9b] px-6 py-5 text-white relative">
          <button
            onClick={() => {
              setShowAdminLoginModal(false);
              setErrorMsg('');
              setPassword('');
            }}
            className="absolute right-4 top-4 p-1.5 rounded-xl bg-teal-800/40 hover:bg-teal-800 text-teal-100 hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg ring-4 ring-white/20">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Restricted Access</span>
              </div>
              <h3 className="text-lg font-black tracking-tight text-white">Admin & Staff Portal</h3>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Enter your Authorized Staff Password or Administrator PIN to access the back-office management console, financial cashbooks, and work orders.
          </p>

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2 font-semibold">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Staff PIN / Admin Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4 text-[#008b9b]" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Enter password (Default: 1234)"
                autoFocus
                className="w-full bg-slate-50 border border-slate-300 focus:border-[#008b9b] focus:ring-2 focus:ring-[#008b9b]/20 rounded-xl py-3 pl-10 pr-10 text-sm font-bold text-slate-900 transition-all focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Password Hint Box */}
          <div className="bg-teal-50/80 border border-teal-200/80 rounded-2xl p-3 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#008b9b] shrink-0 mt-0.5" />
            <div className="text-[11px] text-teal-900">
              <span className="font-bold text-[#008b9b]">Default Staff PIN: </span>
              <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-teal-200 font-bold text-slate-900 ml-1">
                1234
              </span>
              <p className="text-[10px] text-teal-700 mt-0.5">
                (You can also use <code className="bg-white px-1 rounded font-mono text-slate-800">admin123</code> or <code className="bg-white px-1 rounded font-mono text-slate-800">admin</code>)
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setShowAdminLoginModal(false);
                setErrorMsg('');
                setPassword('');
              }}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
            >
              Back to Home
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-[#008b9b] hover:bg-[#007280] text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Unlock Admin</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
