import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ConfirmModal } from './ConfirmModal';
import {
  Zap,
  ShieldCheck,
  User,
  Bell,
  Smartphone,
  LayoutDashboard,
  Wallet,
  Building2,
  Download,
  AlertTriangle,
  CheckCircle2,
  Globe,
  Sun,
  Moon,
  Palette,
  Lock,
  Home,
  LogOut,
} from 'lucide-react';
import { AppTheme, Language } from '../utils/translations';

export const Navbar: React.FC = () => {
  const {
    portalMode,
    setPortalMode,
    isAdminUnlocked,
    lockAdmin,
    setShowAdminLoginModal,
    currentUser,
    setCurrentUser,
    users,
    counterCashBalance,
    bankBalance,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    downloadDatabase,
    appTheme,
    setAppTheme,
    language,
    setLanguage,
    appLogo,
    t,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showClearNotifsConfirm, setShowClearNotifsConfirm] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="bg-[#008b9b] border-b border-[#007280] text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-3">
            {appLogo ? (
              <img
                src={appLogo}
                alt="InvertiSOL Custom Logo"
                className="h-12 sm:h-14 w-auto max-w-[220px] sm:max-w-[280px] object-contain bg-white px-2.5 py-1 rounded-xl shadow-md border border-white/50"
              />
            ) : (
              <div className="flex items-center gap-1 font-black text-2xl sm:text-3xl tracking-tight text-white select-none">
                <span className="font-extrabold text-white">inverti</span>
                <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded-lg flex items-center justify-center font-black shadow-md ml-0.5">
                  S<Zap className="w-5 h-5 fill-slate-950 inline -mt-0.5" />L
                </span>
              </div>
            )}

            <div className="border-l border-teal-500/50 pl-3 hidden sm:block">
              <p className="text-xs font-bold text-amber-300 tracking-wide">
                {t('tagline')}
              </p>
              <p className="text-[10px] text-teal-100/80 font-medium">
                {t('location')}
              </p>
            </div>
          </div>

          {/* Center Mode Switcher: Marketing Home vs Password-Protected Admin Panel */}
          <div className="flex items-center bg-[#006e7a] p-1 rounded-xl border border-teal-600/60 shadow-inner gap-1">
            <button
              onClick={() => setPortalMode('customer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                portalMode === 'customer'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-teal-100 hover:text-white hover:bg-teal-700/50'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Lab Home & Tracking</span>
            </button>

            <button
              onClick={() => {
                if (!isAdminUnlocked) {
                  setShowAdminLoginModal(true);
                } else {
                  setPortalMode('admin');
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                portalMode === 'admin'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-teal-100 hover:text-white hover:bg-teal-700/50'
              }`}
            >
              {isAdminUnlocked ? (
                <ShieldCheck className="w-3.5 h-3.5 text-slate-950" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-amber-300" />
              )}
              <span>Admin Panel</span>
            </button>

            {portalMode === 'admin' && isAdminUnlocked && (
              <button
                onClick={lockAdmin}
                title="Lock & Exit Admin Mode"
                className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors cursor-pointer ml-1"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-2.5">
            {/* Language Switcher Button */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-[#006e7a] hover:bg-teal-700 text-xs font-bold text-amber-300 rounded-xl border border-teal-600/60 transition-colors cursor-pointer shadow-inner"
              title="Change Language (English / Urdu)"
            >
              <Globe className="w-3.5 h-3.5 text-amber-300" />
              <span>{language === 'en' ? 'اردو' : 'EN'}</span>
            </button>

            {/* Theme Selector */}
            <div className="relative flex items-center bg-[#006e7a] p-0.5 rounded-xl border border-teal-600/60">
              <button
                onClick={() => setAppTheme('light')}
                title="Light Theme"
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  appTheme === 'light' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-teal-100 hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setAppTheme('dark')}
                title="Dark Theme"
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  appTheme === 'dark' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-teal-100 hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setAppTheme('solar')}
                title="Solar Teal Theme"
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  appTheme === 'solar' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-teal-100 hover:text-white'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
              </button>
            </div>

            {portalMode === 'admin' && (
              <>
                {/* Cash Balance Highlight Badges */}
                <div className="hidden lg:flex items-center gap-2 bg-[#006e7a]/80 px-2.5 py-1 rounded-lg border border-teal-600/50 text-xs font-medium text-white">
                  <div className="flex items-center gap-1 text-amber-300 border-r border-teal-600/60 pr-2">
                    <Wallet className="w-3.5 h-3.5" />
                    <span>{t('counterCash')}:</span>
                    <span className="font-bold font-mono text-white">Rs. {counterCashBalance.toLocaleString()}</span>
                  </div>
                  {currentUser.role === 'super' && (
                    <div className="flex items-center gap-1 text-cyan-200">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{t('bankBalance')}:</span>
                      <span className="font-bold font-mono text-white">Rs. {bankBalance.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Database Download (Super User) */}
                {currentUser.role === 'super' && (
                  <button
                    onClick={downloadDatabase}
                    title="Export Database Record (Excel/JSON)"
                    className="p-1.5 text-teal-100 hover:text-amber-300 hover:bg-[#006e7a] rounded-lg transition-colors border border-teal-600/50 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}

                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-1.5 text-teal-100 hover:text-white hover:bg-[#006e7a] rounded-lg transition-colors border border-teal-600/50 cursor-pointer"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse shadow-md">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden text-slate-800">
                      <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-[#008b9b]" />
                          <span className="font-bold text-sm text-slate-800">{t('notifications')} ({notifications.length})</span>
                        </div>
                        {notifications.length > 0 && (
                          <button
                            onClick={() => setShowClearNotifsConfirm(true)}
                            className="text-xs text-slate-500 hover:text-rose-600 font-medium cursor-pointer"
                          >
                            Clear all
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-500">No notifications</div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => markNotificationRead(n.id)}
                              className={`p-3 transition-colors cursor-pointer text-xs ${
                                !n.read ? 'bg-amber-50/80 border-l-4 border-amber-500' : 'hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-bold text-slate-800 flex items-center gap-1">
                                  {n.type === 'overdue' && <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
                                  {n.type === 'payment' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                                  {n.title}
                                </span>
                                <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                              </div>
                              <p className="mt-1 text-slate-600 leading-relaxed">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Active User Switcher */}
                <div className="flex items-center gap-1.5 bg-[#006e7a] px-2.5 py-1 rounded-xl border border-teal-600/60 shadow-inner">
                  {currentUser.role === 'super' ? (
                    <ShieldCheck className="w-4 h-4 text-amber-300" />
                  ) : (
                    <User className="w-4 h-4 text-teal-200" />
                  )}
                  <select
                    value={currentUser.id}
                    onChange={(e) => {
                      const found = users.find((u) => u.id === e.target.value);
                      if (found) setCurrentUser(found);
                    }}
                    className="bg-transparent text-xs font-bold text-white focus:outline-none border-none cursor-pointer pr-1"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id} className="bg-white text-slate-800 font-medium">
                        {u.username} ({u.role === 'super' ? 'Super User' : 'Normal User'})
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showClearNotifsConfirm}
        title="Clear All Notifications"
        message="Are you sure you want to clear all active notifications? This action cannot be undone."
        confirmLabel="Clear Notifications"
        onConfirm={clearAllNotifications}
        onCancel={() => setShowClearNotifsConfirm(false)}
      />
    </header>
  );
};
