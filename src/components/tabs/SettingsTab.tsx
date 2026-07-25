import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ConfirmModal } from '../ConfirmModal';
import {
  Sliders,
  Share2,
  Landmark,
  Users,
  Database,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Download,
  ShieldCheck,
  Building2,
  Wallet,
  Lock,
  Image as ImageIcon,
  Globe,
  Sun,
  Moon,
  Palette,
  Upload,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { UserRole } from '../../types';

export const SettingsTab: React.FC = () => {
  const {
    franchises,
    addFranchise,
    toggleFranchiseActive,
    wallets,
    addWallet,
    deleteWallet,
    banks,
    addBank,
    deleteBank,
    scheduleCharges,
    updateScheduleCharges,
    users,
    addUser,
    updateUserTabs,
    deleteUser,
    downloadDatabase,
    currentUser,
    appTheme,
    setAppTheme,
    language,
    setLanguage,
    appLogo,
    setAppLogo,
    t,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<
    'branding' | 'franchises' | 'accounts' | 'rates' | 'users' | 'backup'
  >('branding');

  const [resetLogoConfirm, setResetLogoConfirm] = useState(false);
  const [bankToDelete, setBankToDelete] = useState<{ id: string; name: string } | null>(null);
  const [walletToDelete, setWalletToDelete] = useState<{ id: string; name: string } | null>(null);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Logo image must be smaller than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAppLogo(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Franchise Form
  const [frName, setFrName] = useState('');
  const [frMobile, setFrMobile] = useState('');
  const [frAddress, setFrAddress] = useState('');
  const [frCityCode, setFrCityCode] = useState('ISB');
  const [frUniqueDigit, setFrUniqueDigit] = useState('');
  const [frError, setFrError] = useState<string | null>(null);

  // Bank Form
  const [bName, setBName] = useState('');
  const [bAccNo, setBAccNo] = useState('');
  const [bIban, setBIban] = useState('');
  const [bHolder, setBHolder] = useState('YASIR MEHMOOD');

  // Wallet Form
  const [wName, setWName] = useState('JazzCash');
  const [wAccNo, setWAccNo] = useState('');
  const [wHolder, setWHolder] = useState('YASIR MEHMOOD');

  // Rates Form
  const [pickup, setPickup] = useState(scheduleCharges.pickupCharges);
  const [delivery, setDelivery] = useState(scheduleCharges.deliveryCharges);
  const [referral, setReferral] = useState(scheduleCharges.defaultReferralShare);

  // User Form
  const [uName, setUName] = useState('');
  const [uRole, setURole] = useState<UserRole>('normal');
  const [uTabs, setUTabs] = useState<string[]>(['jobs', 'inventory', 'cashbook']);

  // Handlers
  const handleAddFranchise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!frName || !frCityCode || !frUniqueDigit) return;

    const res = addFranchise(frName, frMobile, frAddress, frCityCode, frUniqueDigit);
    if (!res.success) {
      setFrError(res.error || 'Error adding franchise');
    } else {
      setFrError(null);
      setFrName('');
      setFrMobile('');
      setFrAddress('');
      setFrUniqueDigit('');
    }
  };

  const handleAddBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bName || !bAccNo) return;
    addBank({ bankName: bName, accountNumber: bAccNo, ibanNo: bIban, accountHolderName: bHolder });
    setBName('');
    setBAccNo('');
    setBIban('');
  };

  const handleAddWallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wAccNo) return;
    addWallet({ walletName: wName, accountNumber: wAccNo, accountHolderName: wHolder });
    setWAccNo('');
  };

  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    updateScheduleCharges({
      pickupCharges: Number(pickup),
      deliveryCharges: Number(delivery),
      defaultReferralShare: Number(referral),
    });
    alert('Service rates updated successfully!');
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uName) return;
    addUser(uName, uRole, uTabs);
    setUName('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-teal-50 text-[#008b9b] rounded-xl border border-teal-200">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900">Master Settings & Setup</h1>
            <p className="text-xs text-slate-500">
              Configure referral franchises, bank/wallet accounts, rate schedules, staff permissions, and backup.
            </p>
          </div>
        </div>

        <button
          onClick={downloadDatabase}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs border border-slate-200 shadow-sm cursor-pointer transition-colors"
        >
          <Download className="w-4 h-4 text-[#008b9b]" />
          <span>Export Database JSON</span>
        </button>
      </div>

      {/* Sub-Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 overflow-x-auto">
        {[
          { id: 'branding', label: 'Branding, Logo & Language', icon: ImageIcon },
          { id: 'franchises', label: 'Referral Franchises', icon: Share2 },
          { id: 'accounts', label: 'Banks & Mobile Wallets', icon: Landmark },
          { id: 'rates', label: 'Service Charge Rates', icon: Sliders },
          { id: 'users', label: 'Staff User Accounts', icon: Users },
          { id: 'backup', label: 'Database Backup', icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#008b9b] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-TAB 0: BRANDING, LOGO, THEME & LANGUAGE */}
      {activeSubTab === 'branding' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo Upload Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#008b9b]" />
                <span>InvertiSOL Custom Logo</span>
              </h2>
              {appLogo && (
                <button
                  onClick={() => setResetLogoConfirm(true)}
                  className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-bold cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Default</span>
                </button>
              )}
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Upload a custom PNG or SVG image logo for InvertiSOL. This logo will appear across the Navbar, Customer App View, Print Chits, and Customer Bills.
            </p>

            {/* Logo Preview Box */}
            <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center space-y-3">
              {appLogo ? (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Logo Preview</p>
                  <img
                    src={appLogo}
                    alt="Uploaded Logo"
                    className="max-h-52 w-auto max-w-[360px] mx-auto object-contain bg-white p-4 rounded-2xl border-2 border-slate-300 shadow-lg ring-2 ring-slate-100"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-amber-400 text-slate-950 font-black rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                    S<Zap className="w-6 h-6 fill-current inline -mt-0.5" />L
                  </div>
                  <p className="text-xs font-bold text-slate-800">InvertiSOL Default Brand Mark</p>
                  <p className="text-[11px] text-slate-400">No custom logo uploaded yet</p>
                </div>
              )}

              {/* Upload Button */}
              <div className="pt-2">
                <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#008b9b] hover:bg-[#006673] text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Upload Logo Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Theme & Language Preferences Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-6">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#008b9b]" />
              <span>Theme & Language Configuration</span>
            </h2>

            {/* Language Switcher */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Application Language (زبان)</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    language === 'en'
                      ? 'bg-[#008b9b] text-white border-[#007280] shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span>English (Default)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLanguage('ur')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    language === 'ur'
                      ? 'bg-[#008b9b] text-white border-[#007280] shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Globe className="w-4 h-4 text-amber-300" />
                  <span>اردو (Urdu RTL)</span>
                </button>
              </div>
            </div>

            {/* Theme Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Visual App Theme</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setAppTheme('light')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    appTheme === 'light'
                      ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Sun className="w-5 h-5" />
                  <span>Light Theme</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAppTheme('dark')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    appTheme === 'dark'
                      ? 'bg-slate-900 text-amber-300 border-slate-800 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Moon className="w-5 h-5" />
                  <span>Dark Theme</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAppTheme('solar')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    appTheme === 'solar'
                      ? 'bg-[#008b9b] text-white border-[#007280] shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Palette className="w-5 h-5" />
                  <span>Solar Teal</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 1: REFERRAL FRANCHISES */}
      {activeSubTab === 'franchises' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
              Register New Referral Franchise
            </h2>

            {frError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium">
                {frError}
              </div>
            )}

            <form onSubmit={handleAddFranchise} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Franchise Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Islamabad Solar Hub"
                  value={frName}
                  onChange={(e) => setFrName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mobile Number</label>
                <input
                  type="text"
                  placeholder="0300-5551121"
                  value={frMobile}
                  onChange={(e) => setFrMobile(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="ISB / RWP"
                    value={frCityCode}
                    onChange={(e) => setFrCityCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono uppercase font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">4-Digit Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    placeholder="1121"
                    value={frUniqueDigit}
                    onChange={(e) => setFrUniqueDigit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  placeholder="Sector / City"
                  value={frAddress}
                  onChange={(e) => setFrAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#008b9b] hover:bg-[#006673] text-white font-bold rounded-xl shadow-sm cursor-pointer transition-colors"
              >
                + Register Franchise
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
              Registered Franchises ({franchises.length})
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold bg-slate-50">
                    <th className="py-2.5 px-3">Referral Code</th>
                    <th className="py-2.5 px-3">Franchise Name</th>
                    <th className="py-2.5 px-3">Contact</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {franchises.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#008b9b]">{f.referralCode}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{f.name}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{f.mobileNo}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            f.active
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {f.active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => toggleFranchiseActive(f.id)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold border border-slate-200 cursor-pointer"
                        >
                          {f.active ? 'Disable' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: BANKS & WALLETS */}
      {activeSubTab === 'accounts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bank Accounts */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-cyan-600" />
              <span>Bank Accounts ({banks.length})</span>
            </h2>

            <form onSubmit={handleAddBank} className="space-y-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <input
                type="text"
                required
                placeholder="Bank Name (e.g. HBL / Meezan)"
                value={bName}
                onChange={(e) => setBName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900"
              />
              <input
                type="text"
                required
                placeholder="Account Number"
                value={bAccNo}
                onChange={(e) => setBAccNo(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 font-mono"
              />
              <input
                type="text"
                placeholder="IBAN Number (Optional)"
                value={bIban}
                onChange={(e) => setBIban(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 font-mono"
              />
              <button
                type="submit"
                className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg cursor-pointer transition-colors"
              >
                + Add Bank Account
              </button>
            </form>

            <div className="space-y-2">
              {banks.map((b) => (
                <div key={b.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-900">{b.bankName}</p>
                    <p className="font-mono text-cyan-700 font-semibold">{b.accountNumber}</p>
                    <p className="text-[10px] text-slate-500">{b.accountHolderName}</p>
                  </div>
                  <button
                    onClick={() => setBankToDelete({ id: b.id, name: `${b.bankName} (${b.accountNumber})` })}
                    className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Wallets */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-600" />
              <span>Mobile Wallets ({wallets.length})</span>
            </h2>

            <form onSubmit={handleAddWallet} className="space-y-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <select
                value={wName}
                onChange={(e) => setWName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 font-bold"
              >
                <option value="JazzCash">JazzCash</option>
                <option value="EasyPaisa">EasyPaisa</option>
                <option value="SadaPay">SadaPay</option>
                <option value="NayaPay">NayaPay</option>
              </select>
              <input
                type="text"
                required
                placeholder="Mobile Account Number (03xx-xxxxxxx)"
                value={wAccNo}
                onChange={(e) => setWAccNo(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 font-mono"
              />
              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer transition-colors"
              >
                + Add Wallet
              </button>
            </form>

            <div className="space-y-2">
              {wallets.map((w) => (
                <div key={w.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-900">{w.walletName}</p>
                    <p className="font-mono text-emerald-700 font-semibold">{w.accountNumber}</p>
                    <p className="text-[10px] text-slate-500">{w.accountHolderName}</p>
                  </div>
                  <button
                    onClick={() => setWalletToDelete({ id: w.id, name: `${w.walletName} (${w.accountNumber})` })}
                    className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: SERVICE CHARGE RATES */}
      {activeSubTab === 'rates' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm max-w-xl mx-auto space-y-6">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
            Schedule Operational Rates
          </h2>

          <form onSubmit={handleSaveRates} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Standard Pickup Charges (Rs.)</label>
              <input
                type="number"
                value={pickup}
                onChange={(e) => setPickup(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono font-bold text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Standard Delivery Charges (Rs.)</label>
              <input
                type="number"
                value={delivery}
                onChange={(e) => setDelivery(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono font-bold text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Default Referral Share (Rs.)</label>
              <input
                type="number"
                value={referral}
                onChange={(e) => setReferral(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono font-bold text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#008b9b] hover:bg-[#006673] text-white font-bold rounded-xl shadow-sm cursor-pointer transition-colors"
            >
              Save Schedule Rates
            </button>
          </form>
        </div>
      )}

      {/* SUB-TAB 4: STAFF USER ACCOUNTS */}
      {activeSubTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">Add Staff User</h2>

            <form onSubmit={handleAddUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Staff Username *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tariq (Lab Tech)"
                  value={uName}
                  onChange={(e) => setUName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role Type</label>
                <select
                  value={uRole}
                  onChange={(e) => setURole(e.target.value as UserRole)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold"
                >
                  <option value="normal">Normal Desk / Tech Staff</option>
                  <option value="super">Super Admin (Owner)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#008b9b] hover:bg-[#006673] text-white font-bold rounded-xl shadow-sm cursor-pointer transition-colors"
              >
                + Add User Account
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
              Staff Accounts ({users.length})
            </h2>

            <div className="space-y-3">
              {users.map((u) => (
                <div key={u.id} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{u.username}</p>
                    <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold ${u.role === 'super' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-cyan-100 text-cyan-800 border border-cyan-200'}`}>
                      {u.role === 'super' ? 'Super Admin' : 'Desk Staff'}
                    </span>
                  </div>

                  {u.role !== 'super' && (
                    <button
                      onClick={() => setUserToDelete({ id: u.id, name: u.username })}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: DATABASE BACKUP */}
      {activeSubTab === 'backup' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-8 shadow-sm max-w-xl mx-auto text-center space-y-4">
          <div className="p-4 bg-teal-50 text-[#008b9b] rounded-2xl w-16 h-16 mx-auto flex items-center justify-center border border-teal-200">
            <Database className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Full System Backup & Export</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Download an offline backup file containing all work orders, inventory stock, cash transactions, franchise registers, and staff configurations.
          </p>

          <button
            onClick={downloadDatabase}
            className="px-8 py-3 bg-[#008b9b] hover:bg-[#006673] text-white font-bold rounded-xl text-xs shadow-sm transition-all cursor-pointer"
          >
            Download Database Backup (JSON)
          </button>
        </div>
      )}

      {/* CONFIRM MODALS */}
      <ConfirmModal
        isOpen={resetLogoConfirm}
        title="Reset Custom Logo"
        message="Are you sure you want to reset the branding logo back to default?"
        confirmLabel="Reset Logo"
        onConfirm={() => {
          setAppLogo(null);
          setResetLogoConfirm(false);
        }}
        onCancel={() => setResetLogoConfirm(false)}
      />

      <ConfirmModal
        isOpen={!!bankToDelete}
        title="Delete Bank Account"
        message={bankToDelete ? `Are you sure you want to delete bank account "${bankToDelete.name}"?` : ''}
        confirmLabel="Delete Bank"
        onConfirm={() => {
          if (bankToDelete) {
            deleteBank(bankToDelete.id);
            setBankToDelete(null);
          }
        }}
        onCancel={() => setBankToDelete(null)}
      />

      <ConfirmModal
        isOpen={!!walletToDelete}
        title="Delete Wallet Account"
        message={walletToDelete ? `Are you sure you want to delete mobile wallet account "${walletToDelete.name}"?` : ''}
        confirmLabel="Delete Wallet"
        onConfirm={() => {
          if (walletToDelete) {
            deleteWallet(walletToDelete.id);
            setWalletToDelete(null);
          }
        }}
        onCancel={() => setWalletToDelete(null)}
      />

      <ConfirmModal
        isOpen={!!userToDelete}
        title="Delete Staff Account"
        message={userToDelete ? `Are you sure you want to delete staff account "${userToDelete.name}"?` : ''}
        confirmLabel="Delete Account"
        onConfirm={() => {
          if (userToDelete) {
            deleteUser(userToDelete.id);
            setUserToDelete(null);
          }
        }}
        onCancel={() => setUserToDelete(null)}
      />
    </div>
  );
};
