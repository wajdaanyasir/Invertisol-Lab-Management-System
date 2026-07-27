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
  PhoneCall,
  MapPin,
  Save,
  Phone,
  Server,
  RefreshCw,
  Copy,
  Check,
  FileCode,
  HardDrive,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';
import { UserRole } from '../../types';
import {
  getPhpHostConfig,
  savePhpHostConfig,
  testPhpConnection,
  pushStateToPhp,
  pullStateFromPhp,
  PhpHostConfig,
} from '../../services/phpApiService';

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
    bulkImportState,
    jobs,
    inventory,
    transactions,
    expenseCategories,
    currentUser,
    appTheme,
    setAppTheme,
    language,
    setLanguage,
    appLogo,
    setAppLogo,
    labHelplinePhone,
    labAddress,
    updateLabContactInfo,
    adminPin,
    updateAdminPin,
    t,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<
    'branding' | 'franchises' | 'accounts' | 'rates' | 'users' | 'php_hosting' | 'backup'
  >('branding');

  // Admin Security PIN State
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [showPinFields, setShowPinFields] = useState(false);
  const [pinMsg, setPinMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPinInput.trim() || newPinInput.trim().length < 3) {
      setPinMsg({ type: 'error', text: 'New PIN must be at least 3 characters long.' });
      return;
    }
    if (newPinInput !== confirmPinInput) {
      setPinMsg({ type: 'error', text: 'New PIN and Confirm PIN do not match.' });
      return;
    }
    const success = updateAdminPin(newPinInput.trim());
    if (success) {
      setPinMsg({ type: 'success', text: 'Admin PIN updated successfully! Future portal logins will use your new PIN.' });
      setNewPinInput('');
      setConfirmPinInput('');
      setTimeout(() => setPinMsg(null), 4000);
    } else {
      setPinMsg({ type: 'error', text: 'Failed to update PIN.' });
    }
  };

  // PHP Hosting Sync State
  const [phpConfig, setPhpConfig] = useState<PhpHostConfig>(getPhpHostConfig());
  const [testingConnection, setTestingConnection] = useState(false);
  const [connTestResult, setConnTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [syncingData, setSyncingData] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [copiedApiPhp, setCopiedApiPhp] = useState(false);

  const [resetLogoConfirm, setResetLogoConfirm] = useState(false);
  const [bankToDelete, setBankToDelete] = useState<{ id: string; name: string } | null>(null);
  const [walletToDelete, setWalletToDelete] = useState<{ id: string; name: string } | null>(null);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);

  // Home Page Contact Info & Address State
  const [phoneInput, setPhoneInput] = useState(labHelplinePhone);
  const [addressInput, setAddressInput] = useState(labAddress);
  const [contactSavedSuccess, setContactSavedSuccess] = useState(false);

  React.useEffect(() => {
    setPhoneInput(labHelplinePhone);
    setAddressInput(labAddress);
  }, [labHelplinePhone, labAddress]);

  // PHP Hosting Sync Handlers
  const handleTestPhpConnection = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setTestingConnection(true);
    setConnTestResult(null);
    savePhpHostConfig(phpConfig);
    const res = await testPhpConnection(phpConfig.phpHostUrl, phpConfig.apiKey);
    setTestingConnection(false);
    setConnTestResult(res);
  };

  const handlePushDataToPhp = async () => {
    if (!phpConfig.phpHostUrl) {
      alert('Please enter your PHP API Endpoint URL first.');
      return;
    }
    setSyncingData(true);
    setSyncResult(null);
    savePhpHostConfig(phpConfig);
    const res = await pushStateToPhp(phpConfig.phpHostUrl, phpConfig.apiKey, {
      jobs,
      inventory,
      cashTransactions: transactions,
      expenseCategories,
      franchises,
      wallets,
      banks,
      scheduleCharges,
      users,
    });
    setSyncingData(false);
    setSyncResult(res);
    setPhpConfig(getPhpHostConfig());
  };

  const handlePullDataFromPhp = async () => {
    if (!phpConfig.phpHostUrl) {
      alert('Please enter your PHP API Endpoint URL first.');
      return;
    }
    if (!confirm('Pulling data from PHP server will replace local state with MySQL server data. Continue?')) {
      return;
    }
    setSyncingData(true);
    setSyncResult(null);
    const res = await pullStateFromPhp(phpConfig.phpHostUrl, phpConfig.apiKey);
    setSyncingData(false);
    if (res.success && res.data) {
      bulkImportState(res.data);
      setSyncResult({ success: true, message: 'Local data successfully updated from PHP MySQL server!' });
    } else {
      setSyncResult({ success: false, message: res.message });
    }
  };

  const handleSavePhpConfig = (e: React.FormEvent) => {
    e.preventDefault();
    savePhpHostConfig(phpConfig);
    alert('PHP Hosting Database settings saved!');
  };

  const handleSaveContactInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateLabContactInfo(phoneInput, addressInput);
    setContactSavedSuccess(true);
    setTimeout(() => setContactSavedSuccess(false), 3500);
  };

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
          { id: 'branding', label: 'Branding, Security PIN & Language', icon: ImageIcon },
          { id: 'franchises', label: 'Referral Franchises', icon: Share2 },
          { id: 'accounts', label: 'Banks & Mobile Wallets', icon: Landmark },
          { id: 'rates', label: 'Service Charge Rates', icon: Sliders },
          { id: 'users', label: 'Staff User Accounts', icon: Users },
          { id: 'php_hosting', label: 'PHP & MySQL Hosting', icon: Server },
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
        <div className="space-y-6">
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

          {/* Home Page Contact Helpline & Lab Address Settings Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-[#008b9b]" />
                <span>Home Page Mobile Number & Lab Address Branding</span>
              </h2>
              {contactSavedSuccess && (
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Saved & Applied Live!</span>
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Customize the Helpline Phone Number and Lab Location displayed on the Home Page, Header Badges, Print Invoices, WhatsApp links, and Page Footer.
            </p>

            <form onSubmit={handleSaveContactInfo} className="space-y-4 text-xs font-bold">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-700 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#008b9b]" />
                    <span>Helpline Mobile Phone Number</span>
                  </label>
                  <input
                    type="text"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="e.g. +92 345 5390396"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#008b9b] font-mono text-slate-900 bg-slate-50"
                    required
                  />
                  <p className="text-[10px] text-slate-400 font-normal">
                    Appears on Hero helpline badge, payment WhatsApp instructions, and customer print invoices.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#008b9b]" />
                    <span>Main Lab Address / Location</span>
                  </label>
                  <input
                    type="text"
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    placeholder="e.g. Main Service Center, Koral Chowk, Islamabad"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#008b9b] text-slate-900 bg-slate-50 font-normal"
                    required
                  />
                  <p className="text-[10px] text-slate-400 font-normal">
                    Appears under Home Page header, facility badges, footer location tag, and receipt chits.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#008b9b] hover:bg-[#007280] text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-md transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Update Contact Details</span>
                </button>
              </div>
            </form>
          </div>

          {/* Admin Security PIN Management Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#008b9b]" />
                <span>Admin Portal PIN & Security Settings</span>
              </h2>
              {pinMsg && (
                <span
                  className={`text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1 ${
                    pinMsg.type === 'success'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {pinMsg.type === 'success' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  )}
                  <span>{pinMsg.text}</span>
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Change the PIN or Password required to unlock the Admin & Staff Back-Office Portal.
            </p>

            <form onSubmit={handleUpdatePin} className="space-y-4 text-xs font-bold">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-700 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#008b9b]" />
                    <span>New Admin Security PIN</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPinFields ? 'text' : 'password'}
                      value={newPinInput}
                      onChange={(e) => setNewPinInput(e.target.value)}
                      placeholder="Enter new PIN / Password"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#008b9b] font-mono text-slate-900 bg-slate-50 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPinFields(!showPinFields)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPinFields ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#008b9b]" />
                    <span>Confirm New PIN</span>
                  </label>
                  <input
                    type={showPinFields ? 'text' : 'password'}
                    value={confirmPinInput}
                    onChange={(e) => setConfirmPinInput(e.target.value)}
                    placeholder="Re-enter new PIN"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#008b9b] font-mono text-slate-900 bg-slate-50"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-[11px] text-slate-500 font-normal">
                  Current PIN format: <span className="font-mono font-bold text-slate-800">{adminPin.length} characters</span>
                </p>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#008b9b] hover:bg-[#007280] text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-md transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Update Admin PIN</span>
                </button>
              </div>
            </form>
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

      {/* SUB-TAB: PHP & MYSQL HOSTING DATABASE SYNC */}
      {activeSubTab === 'php_hosting' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 to-teal-950 text-white rounded-2xl p-6 shadow-md border border-slate-800 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
                  <Server className="w-3.5 h-3.5" />
                  <span>Online Database Engine Active</span>
                </div>
                <h2 className="text-xl font-black text-white">MySQL Database & Real-Time Sync Console</h2>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Your website is pre-configured to connect directly to your online MySQL database (<code className="font-mono font-bold text-teal-300">eenjimvt_invertisol_lab</code>). All job cards, inventory, billing, and transactions sync live across all devices without storing local data.
                </p>
              </div>
              <div className="hidden sm:block text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Database Mode</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Online Storage Active</span>
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Database Name</span>
                <span className="font-mono font-bold text-teal-300">eenjimvt_invertisol_lab</span>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Database User</span>
                <span className="font-mono font-bold text-teal-300">eenjimvt_labmanager</span>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Active Backend API</span>
                <span className="font-mono font-bold text-emerald-400">/api.php (Live Sync)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CARD 1: PHP API ENDPOINT CONFIGURATION */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#008b9b]" />
                  <span>PHP Server Connection Settings</span>
                </h2>
                {phpConfig.lastSyncedAt && (
                  <span className="text-[11px] text-slate-500 font-mono">
                    Last Sync: {phpConfig.lastSyncedAt}
                  </span>
                )}
              </div>

              <form onSubmit={handleSavePhpConfig} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    PHP API Endpoint URL:
                  </label>
                  <input
                    type="url"
                    value={phpConfig.phpHostUrl}
                    onChange={(e) => setPhpConfig({ ...phpConfig, phpHostUrl: e.target.value })}
                    placeholder="https://your-domain.com/api.php"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#008b9b] focus:border-[#008b9b] outline-none font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    The full web URL where you uploaded <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">api.php</code> on your PHP host.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    API Secret Key (Optional Security Header):
                  </label>
                  <input
                    type="password"
                    value={phpConfig.apiKey}
                    onChange={(e) => setPhpConfig({ ...phpConfig, apiKey: e.target.value })}
                    placeholder="Leave blank or enter API_SECRET_KEY from api.php"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#008b9b] focus:border-[#008b9b] outline-none font-mono"
                  />
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={phpConfig.autoSyncEnabled}
                      onChange={(e) => {
                        const updated = { ...phpConfig, autoSyncEnabled: e.target.checked };
                        setPhpConfig(updated);
                        savePhpHostConfig(updated);
                      }}
                      className="w-4 h-4 text-[#008b9b] rounded border-slate-300 focus:ring-[#008b9b] cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Enable Real-time Background Auto-Sync</span>
                      <span className="text-[11px] text-slate-500 block">
                        Automatically pushes job, billing, and inventory changes to your PHP MySQL server in real-time.
                      </span>
                    </div>
                  </label>
                </div>

                {/* Connection Test Result Indicator */}
                {connTestResult && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${
                      connTestResult.success
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    {connTestResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-bold">{connTestResult.success ? 'PHP Connection Successful!' : 'Connection Failed'}</p>
                      <p className="mt-0.5">{connTestResult.message}</p>
                    </div>
                  </div>
                )}

                {/* Data Sync Result Indicator */}
                {syncResult && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${
                      syncResult.success
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {syncResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-bold">{syncResult.success ? 'Sync Completed' : 'Sync Error'}</p>
                      <p className="mt-0.5">{syncResult.message}</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleTestPhpConnection}
                    disabled={testingConnection}
                    className="flex-1 min-w-[140px] px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {testingConnection ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-400" />}
                    <span>{testingConnection ? 'Testing...' : 'Test Connection'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePushDataToPhp}
                    disabled={syncingData}
                    className="px-4 py-2.5 bg-[#008b9b] hover:bg-[#006673] text-white font-bold rounded-xl text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {syncingData ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>Push Local to PHP</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePullDataFromPhp}
                    disabled={syncingData}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {syncingData ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                    <span>Pull Server Data</span>
                  </button>
                </div>
              </form>
            </div>

            {/* CARD 2: SERVER FILES & DEPLOYMENT GUIDE */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-[#008b9b]" />
                  <span>PHP Host Deployment Files</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Download or copy these two backend files to deploy on your cPanel / PHP web host:
                </p>
              </div>

              {/* Downloads & Copy Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-900">api.php</span>
                    <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded">PHP Script</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    REST API backend that handles database queries and JSON syncing.
                  </p>
                  <a
                    href="/api.php"
                    download="api.php"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#008b9b] hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download api.php</span>
                  </a>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-900">schema.sql</span>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">MySQL Schema</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Database tables and indexes for MySQL / MariaDB on cPanel.
                  </p>
                  <a
                    href="/schema.sql"
                    download="schema.sql"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#008b9b] hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download schema.sql</span>
                  </a>
                </div>
              </div>

              {/* Step-by-Step Setup Guide */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
                <p className="font-bold text-slate-900 border-b pb-1">5-Step Hosting Installation Guide:</p>
                <ol className="list-decimal list-inside space-y-1.5 text-[11.5px] leading-relaxed">
                  <li>Log into your web hosting cPanel / Plesk and open <strong>MySQL Databases</strong>.</li>
                  <li>Create a new database (e.g. <code className="bg-white px-1 py-0.5 rounded border border-slate-300 font-mono">invertisol_lab</code>) and assign a user with full privileges.</li>
                  <li>Open <strong>phpMyAdmin</strong>, select your database, and import <code className="bg-white px-1 py-0.5 rounded border border-slate-300 font-mono">schema.sql</code>.</li>
                  <li>Upload <code className="bg-white px-1 py-0.5 rounded border border-slate-300 font-mono">api.php</code> to your hosting <code className="bg-white px-1 py-0.5 rounded border border-slate-300 font-mono">public_html</code> or website folder.</li>
                  <li>Open <code className="bg-white px-1 py-0.5 rounded border border-slate-300 font-mono">api.php</code> in File Manager and enter your DB credentials (<code className="font-mono text-slate-900 font-bold">DB_NAME, DB_USER, DB_PASS</code>).</li>
                </ol>
              </div>
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
