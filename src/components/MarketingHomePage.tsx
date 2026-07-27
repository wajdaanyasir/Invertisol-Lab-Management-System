import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Zap,
  Search,
  PlusCircle,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Printer,
  Truck,
  Wrench,
  Cpu,
  Lock,
  PhoneCall,
  MapPin,
  Sparkles,
  HelpCircle,
  Copy,
  History,
  Activity,
  BookmarkCheck,
  CreditCard,
  Receipt,
  ArrowRight,
  Check,
  Building2,
  AlertCircle,
  Gauge,
  Wallet,
  Pencil,
  X,
  Save,
} from 'lucide-react';
import { Job } from '../types';

interface SavedTrackingRecord {
  trackingId: string;
  customerName: string;
  inverterBrand: string;
  date: string;
}

export const MarketingHomePage: React.FC = () => {
  const {
    jobs,
    addJob,
    setSelectedPrintJob,
    setPrintDocumentType,
    setPortalMode,
    appLogo,
    isAdminUnlocked,
    setShowAdminLoginModal,
    labHelplinePhone,
    labAddress,
    updateLabContactInfo,
  } = useApp();

  const [activeSection, setActiveSection] = useState<'track' | 'file' | 'facility' | 'guide'>('track');

  // Admin Contact Info Modal State
  const [showEditContactModal, setShowEditContactModal] = useState(false);
  const [editingPhone, setEditingPhone] = useState(labHelplinePhone);
  const [editingAddress, setEditingAddress] = useState(labAddress);

  // Saved Tracking IDs in local storage
  const [savedRecords, setSavedRecords] = useState<SavedTrackingRecord[]>([]);
  const [trackQuery, setTrackQuery] = useState('');
  const [searchedJob, setSearchedJob] = useState<Job | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Complaint Filing Form State
  const [customerName, setCustomerName] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [address, setAddress] = useState('');
  const [inverterBrand, setInverterBrand] = useState('Inverex Nitrox');
  const [inverterKva, setInverterKva] = useState('5.0 kVA');
  const [issueDescription, setIssueDescription] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [createdJobResult, setCreatedJobResult] = useState<Job | null>(null);
  const [copiedTrackingId, setCopiedTrackingId] = useState(false);

  // Load saved tracking IDs on initial mount
  useEffect(() => {
    try {
      const storedRecordsJson = localStorage.getItem('my_invertisol_tracking_records');
      const lastId = localStorage.getItem('last_invertisol_tracking_id');

      let records: SavedTrackingRecord[] = [];
      if (storedRecordsJson) {
        records = JSON.parse(storedRecordsJson);
        setSavedRecords(records);
      }

      // Default initial query: either last saved tracking ID, first stored record, or first job in array
      const queryToUse = lastId || (records.length > 0 ? records[0].trackingId : (jobs[0]?.trackingId || ''));
      if (queryToUse) {
        setTrackQuery(queryToUse);
        const cleanQuery = queryToUse.toLowerCase().replace(/^#/, '').trim();
        const found = jobs.find((j) => j.trackingId.toLowerCase().replace(/^#/, '').trim() === cleanQuery) || jobs[0] || null;
        if (found) {
          setSearchedJob(found);
        }
      }
    } catch (e) {
      console.error('Error loading local tracking data:', e);
    }
  }, []); // Run once on mount to prevent overwriting active search when jobs update

  // Keep searchedJob synced with latest jobs list updates
  useEffect(() => {
    if (searchedJob) {
      const updated = jobs.find((j) => j.id === searchedJob.id || j.trackingId === searchedJob.trackingId);
      if (updated && updated !== searchedJob) {
        setSearchedJob(updated);
      }
    }
  }, [jobs]);

  // Handle Tracking Search
  const handleTrackSearch = (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const rawQuery = (customQuery !== undefined ? customQuery : trackQuery).trim();
    if (!rawQuery) return;

    const q = rawQuery.toLowerCase();
    const normalizedQ = q.replace(/^#/, '').trim();
    const digitsOnlyQ = q.replace(/\D/g, '');

    const found = jobs.find((j) => {
      const cleanJobTrackingId = j.trackingId.toLowerCase().replace(/^#/, '').trim();
      const cleanMobile = j.mobileNo.replace(/\D/g, '');

      // 1. Exact match on tracking ID (with or without '#')
      if (cleanJobTrackingId === normalizedQ) return true;

      // 2. Exact match on internal Job ID
      if (j.id.toLowerCase() === q) return true;

      // 3. Mobile number search
      if (digitsOnlyQ.length >= 4 && cleanMobile.includes(digitsOnlyQ)) return true;

      // 4. Partial match on tracking ID if at least 4 chars
      if (normalizedQ.length >= 4 && cleanJobTrackingId.includes(normalizedQ)) return true;

      return false;
    });

    if (found) {
      setSearchedJob(found);
      setTrackQuery(found.trackingId);
      setSearchError(null);
      // Save last searched tracking ID to localStorage
      try {
        localStorage.setItem('last_invertisol_tracking_id', found.trackingId);
      } catch (err) {
        console.error(err);
      }
    } else {
      setSearchedJob(null);
      setSearchError(rawQuery);
    }
  };

  // Select a saved record from device storage
  const handleSelectSavedRecord = (trackingId: string) => {
    setTrackQuery(trackingId);
    setSearchError(null);
    handleTrackSearch(undefined, trackingId);
  };

  // Handle File Complaint
  const handleFileComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !mobileNo || !inverterBrand) {
      alert('Please fill in Customer Name, Mobile Number, and Inverter Model.');
      return;
    }

    const newJob = addJob({
      customerName,
      mobileNo,
      address,
      inverterBrand,
      inverterKva,
      issueDescription,
      referralId: referralCode.toUpperCase(),
      status: 'Complaint Filed',
    });

    setCreatedJobResult(newJob);
    setSearchedJob(newJob);
    setTrackQuery(newJob.trackingId);

    // PERSIST TO LOCAL STORAGE FOR NEXT VISIT!
    try {
      localStorage.setItem('last_invertisol_tracking_id', newJob.trackingId);

      const newRecord: SavedTrackingRecord = {
        trackingId: newJob.trackingId,
        customerName: newJob.customerName,
        inverterBrand: `${newJob.inverterBrand} (${newJob.inverterKva})`,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      };

      const existingStr = localStorage.getItem('my_invertisol_tracking_records');
      let existingList: SavedTrackingRecord[] = existingStr ? JSON.parse(existingStr) : [];
      // Remove duplicate if exists
      existingList = existingList.filter((r) => r.trackingId !== newJob.trackingId);
      // Prepend new record
      const updatedList = [newRecord, ...existingList].slice(0, 5); // store up to 5
      localStorage.setItem('my_invertisol_tracking_records', JSON.stringify(updatedList));
      setSavedRecords(updatedList);
    } catch (err) {
      console.error('Failed to save to local storage', err);
    }

    // Reset form fields
    setCustomerName('');
    setMobileNo('');
    setAddress('');
    setIssueDescription('');
    setReferralCode('');

    // Switch view to tracking automatically so customer sees their status
    setActiveSection('track');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTrackingId(true);
    setTimeout(() => setCopiedTrackingId(false), 2000);
  };

  return (
    <div className="w-full space-y-10 pb-16 font-sans text-slate-900">
      {/* 1. HERO MARKETING BANNER */}
      <section className="relative bg-gradient-to-br from-slate-950 via-[#004e57] to-[#008b9b] rounded-3xl p-6 sm:p-10 text-white shadow-2xl overflow-hidden border border-teal-500/30">
        {/* Background Glow Elements */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-teal-300/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto space-y-8">
          {/* Top Bar / Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-teal-500/30 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-amber-400 text-slate-950 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Authorized Solar Repair Lab</span>
              </span>
              <span className="bg-teal-800/80 border border-teal-400/40 text-teal-100 px-3 py-1 rounded-full text-xs font-bold">
                Islamabad & Rawalpindi
              </span>
            </div>

            {/* Helpline & Quick Contact Callout */}
            <div className="flex items-center gap-2">
              <a
                href={`tel:${labHelplinePhone}`}
                className="flex items-center gap-2 bg-slate-950/60 hover:bg-slate-950 px-4 py-2 rounded-2xl border border-amber-400/40 text-xs font-bold text-amber-300 transition-all shadow-md cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>Helpline: {labHelplinePhone}</span>
              </a>
              {isAdminUnlocked && (
                <button
                  onClick={() => {
                    setEditingPhone(labHelplinePhone);
                    setEditingAddress(labAddress);
                    setShowEditContactModal(true);
                  }}
                  className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 px-3 py-2 rounded-2xl text-xs font-black shadow-md transition-colors cursor-pointer"
                  title="Admin: Change Mobile Number & Address"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Edit Contact Info</span>
                </button>
              )}
            </div>
          </div>

          {/* Hero Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="space-y-2">
                <p className="text-amber-300 text-xs font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>ISO Standard Precision Engineering</span>
                </p>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
                  InvertiSOL Repairing Labs
                </h1>
                <p className="text-teal-100 text-xs sm:text-sm leading-relaxed font-medium">
                  State-of-the-art diagnostic and testing lab for Hybrid, Off-Grid, and On-Grid Solar Inverters. Advanced oscilloscope testing, high-voltage load bench, micro-soldering, and 100% genuine component replacement.
                </p>
              </div>

              {/* Key Features Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                <div className="bg-slate-950/50 border border-teal-400/30 rounded-xl p-2.5 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-bold text-slate-100">Genuine MOSFETs</span>
                </div>
                <div className="bg-slate-950/50 border border-teal-400/30 rounded-xl p-2.5 text-xs flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-300 shrink-0" />
                  <span className="font-bold text-slate-100">Oscilloscope Test</span>
                </div>
                <div className="bg-slate-950/50 border border-teal-400/30 rounded-xl p-2.5 text-xs flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-300 shrink-0" />
                  <span className="font-bold text-slate-100">24-48h Fast Turnaround</span>
                </div>
                <div className="bg-slate-950/50 border border-teal-400/30 rounded-xl p-2.5 text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-bold text-slate-100">6 Months Lab Warranty</span>
                </div>
                <div className="bg-slate-950/50 border border-teal-400/30 rounded-xl p-2.5 text-xs flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-amber-300 shrink-0" />
                  <span className="font-bold text-slate-100">5.0 kVA Load Bench</span>
                </div>
                <div className="bg-slate-950/50 border border-teal-400/30 rounded-xl p-2.5 text-xs flex items-center gap-2">
                  <Truck className="w-4 h-4 text-cyan-300 shrink-0" />
                  <span className="font-bold text-slate-100">Verified Dispatch</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <button
                  onClick={() => setActiveSection('file')}
                  className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-2xl text-xs sm:text-sm shadow-xl transition-all flex items-center gap-2 cursor-pointer active:scale-98"
                >
                  <PlusCircle className="w-4.5 h-4.5" />
                  <span>File Online Complaint</span>
                </button>
                <button
                  onClick={() => setActiveSection('track')}
                  className="px-6 py-3.5 bg-slate-900 hover:bg-slate-950 text-white border border-teal-400/40 font-bold rounded-2xl text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Search className="w-4.5 h-4.5 text-amber-300" />
                  <span>Track Status</span>
                </button>
              </div>
            </div>

            {/* Hero Right Visual / Logo Box */}
            <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 text-center space-y-4 shadow-xl">
              {appLogo ? (
                <img
                  src={appLogo}
                  alt="InvertiSOL Logo"
                  className="h-20 w-auto max-w-[280px] object-contain bg-white p-3 rounded-2xl mx-auto shadow-lg border border-amber-300"
                />
              ) : (
                <div className="w-16 h-16 bg-amber-400 text-slate-950 font-black rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <Zap className="w-9 h-9 fill-current" />
                </div>
              )}

              <div className="space-y-1">
                <h3 className="font-black text-xl text-white">InvertiSOL Service Hub</h3>
                <p className="text-xs text-teal-100 font-medium flex items-center justify-center gap-1 px-2">
                  <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span>{labAddress}</span>
                </p>
              </div>

              {/* Quick Admin Access Button */}
              <div className="pt-2 border-t border-white/15">
                {isAdminUnlocked ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => setPortalMode('admin')}
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Open Admin Console (Unlocked)</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditingPhone(labHelplinePhone);
                        setEditingAddress(labAddress);
                        setShowEditContactModal(true);
                      }}
                      className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Change Phone Number & Address</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAdminLoginModal(true)}
                    className="w-full py-2.5 bg-slate-950/80 hover:bg-slate-950 text-amber-300 border border-amber-400/40 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-colors"
                  >
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>Admin Staff Access (Password Protected)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. RECENT DEVICE SAVED TRACKING NUMBERS BANNER (LOCAL STORAGE PERSISTENCE) */}
      {savedRecords.length > 0 && (
        <section className="max-w-5xl mx-auto bg-amber-50/90 border border-amber-300 rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
              <BookmarkCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Saved On Your Device — Tap to Track Instantly</span>
            </div>
            <span className="text-[10px] text-amber-700 font-medium hidden sm:inline">
              Automatically remembered for future visits
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {savedRecords.map((rec) => (
              <button
                key={rec.trackingId}
                onClick={() => handleSelectSavedRecord(rec.trackingId)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  trackQuery === rec.trackingId
                    ? 'bg-[#008b9b] text-white border-[#008b9b] shadow-md'
                    : 'bg-white hover:bg-amber-100 text-slate-800 border-amber-200'
                }`}
              >
                <History className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-mono">#{rec.trackingId}</span>
                <span className="text-[10px] opacity-80">({rec.customerName})</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 3. SECTION NAVIGATION TABS */}
      <section className="flex flex-wrap sm:flex-nowrap bg-slate-200/90 p-1.5 rounded-2xl border border-slate-300 max-w-5xl mx-auto shadow-inner text-xs font-bold gap-1">
        <button
          onClick={() => setActiveSection('track')}
          className={`flex-1 min-w-[130px] py-3 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSection === 'track'
              ? 'bg-[#008b9b] text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/60'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Track Status</span>
        </button>
        <button
          onClick={() => setActiveSection('file')}
          className={`flex-1 min-w-[130px] py-3 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSection === 'file'
              ? 'bg-[#008b9b] text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/60'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>File Complaint</span>
        </button>
        <button
          onClick={() => setActiveSection('facility')}
          className={`flex-1 min-w-[130px] py-3 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSection === 'facility'
              ? 'bg-[#008b9b] text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/60'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Our Lab Facility</span>
        </button>
        <button
          onClick={() => setActiveSection('guide')}
          className={`flex-1 min-w-[130px] py-3 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSection === 'guide'
              ? 'bg-[#008b9b] text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/60'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Process Guide</span>
        </button>
      </section>

      {/* 4. MAIN DYNAMIC CONTENT */}
      <div className="max-w-5xl mx-auto">
        {/* TAB 1: TRACK STATUS */}
        {activeSection === 'track' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2 text-[#008b9b] font-bold text-xs uppercase tracking-wider">
                <Search className="w-4 h-4" />
                <span>Customer Self-Service Tracker</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 mt-1">
                Track Inverter Repair Complaint & Maintenance Status
              </h2>
              <p className="text-xs text-slate-500">
                Enter your Tracking ID (e.g., {jobs[0]?.trackingId || '2507260001'}) or registered Mobile Number. Your device will save your tracking number so you don't have to re-type it next time!
              </p>
            </div>

            {/* Track Search Box */}
            <form onSubmit={handleTrackSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder={`Enter Tracking ID (e.g. ${jobs[0]?.trackingId || '2507260001'} or 0321782233)`}
                  value={trackQuery}
                  onChange={(e) => {
                    setTrackQuery(e.target.value);
                    if (searchError) setSearchError(null);
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3.5 font-mono text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008b9b]"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-3.5 bg-[#008b9b] hover:bg-[#007280] text-white font-black text-xs rounded-2xl cursor-pointer shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>Check Status</span>
              </button>
            </form>

            {/* Search Result Display */}
            {searchError ? (
              <div className="bg-rose-50 border-2 border-rose-200/90 rounded-3xl p-6 sm:p-8 text-center space-y-4 animate-in fade-in duration-200 shadow-sm my-2">
                <div className="w-14 h-14 rounded-2xl bg-rose-500 text-white flex items-center justify-center mx-auto font-black shadow-md">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Invalid or Unregistered Tracking Number
                  </h3>
                  <p className="text-xs text-rose-800 max-w-md mx-auto leading-relaxed">
                    No complaint record found for <span className="font-mono font-bold bg-rose-100 px-2.5 py-0.5 rounded-lg text-rose-950 border border-rose-200 font-bold">"{searchError}"</span>. Please verify your printed intake receipt or contact our helpline at <span className="font-bold underline">{labHelplinePhone}</span>.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setSearchError(null);
                      setTrackQuery('');
                    }}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
                  >
                    Clear Search
                  </button>

                  {savedRecords.length > 0 && (
                    <button
                      onClick={() => {
                        const first = savedRecords[0].trackingId;
                        setSearchError(null);
                        setTrackQuery(first);
                        handleTrackSearch(null as any, first);
                      }}
                      className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-300 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
                    >
                      Load Stored Device ID ({savedRecords[0].trackingId})
                    </button>
                  )}
                </div>
              </div>
            ) : searchedJob ? (
              <div className="space-y-6 pt-2">
                {/* Header Badge Box */}
                <div className="bg-gradient-to-r from-slate-900 via-[#004e57] to-[#006e7a] text-white p-6 rounded-3xl shadow-lg space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-teal-500/30 pb-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-widest block">
                        Tracking ID #{searchedJob.trackingId}
                      </span>
                      <h3 className="text-xl font-black">{searchedJob.customerName}</h3>
                      <p className="text-xs text-teal-200">{searchedJob.address || 'Islamabad/Rawalpindi'}</p>
                    </div>

                    <span className="bg-amber-400 text-slate-950 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wide shadow-md">
                      {searchedJob.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="bg-slate-950/40 p-3 rounded-2xl border border-teal-400/20">
                      <span className="text-teal-200/80 block text-[10px] uppercase font-bold">Inverter Model</span>
                      <span className="font-bold text-white">{searchedJob.inverterBrand} ({searchedJob.inverterKva})</span>
                    </div>
                    <div className="bg-slate-950/40 p-3 rounded-2xl border border-teal-400/20">
                      <span className="text-teal-200/80 block text-[10px] uppercase font-bold">Est. Completion Date</span>
                      <span className="font-mono font-bold text-amber-300">{searchedJob.estimatedRepairDate}</span>
                    </div>
                    <div className="bg-slate-950/40 p-3 rounded-2xl border border-teal-400/20">
                      <span className="text-teal-200/80 block text-[10px] uppercase font-bold">Approximate Cost</span>
                      <span className="font-mono font-bold text-emerald-300">Rs. {searchedJob.approximateCost.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Dispatched Technician Card */}
                {searchedJob.technicianDispatched && (
                  <div className="bg-amber-50 border border-amber-300 p-5 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                      <Truck className="w-4 h-4 text-amber-700" />
                      <span>Dispatched Technician Assigned</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-800">
                      <div>
                        <span className="text-slate-500 font-semibold">Name: </span>
                        <span className="font-bold text-slate-900">{searchedJob.technicianDispatched.name}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-semibold">Phone: </span>
                        <span className="font-mono font-bold text-slate-900">{searchedJob.technicianDispatched.phone}</span>
                      </div>
                    </div>
                    <p className="text-xs text-amber-800 bg-amber-100/80 p-2.5 rounded-xl italic font-medium">
                      "{searchedJob.technicianDispatched.remarks}"
                    </p>
                  </div>
                )}

                {/* Status Timeline History */}
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-4">
                  <h4 className="font-extrabold text-slate-800 uppercase tracking-wider text-xs flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#008b9b]" />
                    <span>Real-Time Laboratory Maintenance Progress Log</span>
                  </h4>

                  <div className="space-y-4 border-l-2 border-[#008b9b] pl-4">
                    {searchedJob.statusHistory.map((h, idx) => (
                      <div key={idx} className="relative space-y-1">
                        <div className="absolute -left-[21px] top-1 w-3.5 h-3.5 rounded-full bg-[#008b9b] border-2 border-white ring-2 ring-teal-100" />
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#008b9b] text-xs">{h.status}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{h.timestamp}</span>
                        </div>
                        {h.remarks && (
                          <p className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200/80 italic">
                            {h.remarks}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Itemized Bill & Payment Status Card (Only shown when Admin generates & locks the bill) */}
                {searchedJob.billGenerated && searchedJob.isBillLocked ? (
                  <div className="bg-gradient-to-br from-slate-900 to-[#003840] text-white p-6 rounded-3xl border border-teal-500/30 space-y-4 shadow-xl">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-teal-500/30 pb-3">
                      <div className="flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-amber-300" />
                        <div>
                          <h4 className="font-black text-sm">Official Maintenance Bill & Warranty Invoice</h4>
                          <p className="text-[11px] text-teal-200">Finalized & Locked by InvertiSOL Technical Team</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {searchedJob.paymentConfirmed ? (
                          <span className="bg-emerald-400 text-slate-950 px-3 py-1 rounded-full text-xs font-black uppercase flex items-center gap-1 shadow-md">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Bill Paid & Confirmed</span>
                          </span>
                        ) : (
                          <span className="bg-amber-400 text-slate-950 px-3 py-1 rounded-full text-xs font-black uppercase flex items-center gap-1 shadow-md">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Payment Pending</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Cost Breakdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="bg-slate-950/50 p-4 rounded-2xl border border-teal-400/20 space-y-3">
                        <div>
                          <span className="text-teal-200 uppercase text-[10px] font-bold block mb-1">Replaced Components</span>
                          {searchedJob.consumedInventory && searchedJob.consumedInventory.length > 0 ? (
                            <ul className="space-y-1 text-slate-300 text-xs">
                              {searchedJob.consumedInventory.map((item, i) => (
                                <li key={i} className="flex justify-between font-medium">
                                  <span>• {item.itemName}</span>
                                  <span className="text-teal-300 font-bold">x{item.qty}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-slate-400 italic text-[11px]">No hardware replacement components required.</p>
                          )}
                        </div>

                        {/* Collective Costs Summary */}
                        <div className="border-t border-teal-500/30 pt-2 space-y-1.5 text-xs">
                          {searchedJob.totalInventoryCost > 0 && (
                            <div className="flex justify-between font-medium text-slate-200">
                              <span>Collective Parts & Materials Total:</span>
                              <span className="font-mono font-bold text-amber-300">Rs. {searchedJob.totalInventoryCost.toLocaleString()}</span>
                            </div>
                          )}

                          {searchedJob.repairCost > 0 && (
                            <div className="flex justify-between font-medium text-slate-200">
                              <span>Bench Repairing & Testing Fee:</span>
                              <span className="font-mono font-bold text-amber-300">Rs. {searchedJob.repairCost.toLocaleString()}</span>
                            </div>
                          )}

                          {searchedJob.referralCost > 0 && (
                            <div className="flex justify-between font-medium text-slate-200">
                              <span>Referral / Booking Partner Fee:</span>
                              <span className="font-mono font-bold text-amber-300">Rs. {searchedJob.referralCost.toLocaleString()}</span>
                            </div>
                          )}

                          {/* Additional Custom Cost Heads */}
                          {searchedJob.additionalCostHeads && searchedJob.additionalCostHeads.length > 0 && (
                            searchedJob.additionalCostHeads.map((head) => (
                              <div key={head.id} className="flex justify-between font-medium text-teal-200">
                                <span>{head.name}:</span>
                                <span className="font-mono font-bold text-amber-300">Rs. {Number(head.amount).toLocaleString()}</span>
                              </div>
                            ))
                          )}

                          {(searchedJob.pickupCost > 0 || searchedJob.deliveryCost > 0) && (
                            <div className="flex justify-between font-medium text-slate-300">
                              <span>Pickup & Delivery Logistics:</span>
                              <span className="font-mono font-bold text-amber-300">
                                Rs. {(searchedJob.pickupCost + searchedJob.deliveryCost).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-slate-950/50 p-4 rounded-2xl border border-teal-400/20 space-y-3 flex flex-col justify-between">
                        <div>
                          <span className="text-teal-200 uppercase text-[10px] font-bold block">Final Amount Payable</span>
                          <div className="text-2xl font-black font-mono text-emerald-300">
                            Rs. {searchedJob.totalBillAmount.toLocaleString()}
                          </div>
                          <p className="text-[10px] text-teal-100/80 mt-0.5">
                            Includes 6-Month InvertiSOL Lab Backed Hardware Warranty
                          </p>

                          {/* Technician Repair Remarks */}
                          {searchedJob.repairRemarks && (
                            <div className="mt-3 p-2.5 bg-teal-950/80 rounded-xl border border-teal-500/40 text-[11px] text-teal-100">
                              <span className="font-bold text-amber-300 block mb-0.5">Lab Technician Repair Note:</span>
                              <p className="italic">{searchedJob.repairRemarks}</p>
                            </div>
                          )}
                        </div>

                        {/* Online Payment Method Instructions Box */}
                        <div className="bg-teal-900/40 p-2.5 rounded-xl border border-teal-400/30 text-[11px] space-y-1 mt-2">
                          <div className="font-bold text-amber-300 flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5" />
                            <span>Online Bank Payment Details</span>
                          </div>
                          <p className="text-slate-200 text-[10px] leading-tight font-mono">
                            Meezan Bank | A/C: 01020108823412 | IBAN: PK36MEZN0001020108823412
                          </p>
                          <p className="text-teal-200 text-[10px]">
                            Send payment screenshot on WhatsApp: <strong>{labHelplinePhone}</strong>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Bill NOT locked/generated yet notice for customer */
                  <div className="bg-gradient-to-br from-slate-900 to-[#003840] text-white p-5 rounded-3xl border border-amber-500/30 space-y-3 shadow-xl">
                    <div className="flex items-center gap-3 border-b border-slate-700/60 pb-3">
                      <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-white">Laboratory Inspection & Technical Repair Active</h4>
                        <p className="text-[11px] text-teal-200">Official Bill Invoice Pending Finalization & Lock by Technical Engineer</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Current Service Status</span>
                        <p className="font-bold text-amber-300 text-sm">{searchedJob.status}</p>
                        <p className="text-[11px] text-slate-300">
                          Initial agreed estimate: <strong className="font-mono text-white">Rs. {searchedJob.approximateCost.toLocaleString()}</strong>
                        </p>
                      </div>

                      <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Billing Notice</span>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          The official itemized bill is generated only after complete benchmark load testing. Once our engineers lock the bill, full cost details will be updated here automatically.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Document Printing & Receipt Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      setSelectedPrintJob(searchedJob);
                      setPrintDocumentType('job_tag');
                    }}
                    className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-2xl border border-slate-300 flex items-center justify-center gap-2 text-xs cursor-pointer shadow-sm transition-colors"
                  >
                    <Printer className="w-4 h-4 text-[#008b9b]" />
                    <span>Print Intake Receipt Chit</span>
                  </button>

                  {searchedJob.billGenerated && searchedJob.isBillLocked ? (
                    <button
                      onClick={() => {
                        setSelectedPrintJob(searchedJob);
                        setPrintDocumentType('bill');
                      }}
                      className="flex-1 py-3 px-4 bg-[#008b9b] hover:bg-[#007280] text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-xs cursor-pointer shadow-md transition-colors"
                    >
                      <FileText className="w-4 h-4 text-amber-300" />
                      <span>View & Print Official Bill Invoice</span>
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex-1 py-3 px-4 bg-slate-200 text-slate-400 font-bold rounded-2xl flex items-center justify-center gap-2 text-xs cursor-not-allowed border border-slate-300"
                      title="Bill will be available once maintenance is completed & locked by admin"
                    >
                      <Lock className="w-4 h-4 text-slate-400" />
                      <span>Bill Invoice (Pending Completion)</span>
                    </button>
                  )}

                  {searchedJob.paymentConfirmed ? (
                    <button
                      onClick={() => {
                        setSelectedPrintJob(searchedJob);
                        setPrintDocumentType('payment_receipt');
                      }}
                      className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-xs cursor-pointer shadow-md transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4 text-white" />
                      <span>Print 6-Month Warranty Receipt</span>
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex-1 py-3 px-4 bg-slate-200 text-slate-400 font-bold rounded-2xl flex items-center justify-center gap-2 text-xs cursor-not-allowed border border-slate-300"
                      title="6-Month Warranty Receipt will unlock once payment is received and confirmed by admin"
                    >
                      <Lock className="w-4 h-4 text-slate-400" />
                      <span>6-Month Warranty (Pending Payment Confirmation)</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs">
                Enter your Tracking ID above to check live repair progress.
              </div>
            )}
          </div>
        )}

        {/* TAB 2: FILE ONLINE COMPLAINT */}
        {activeSection === 'file' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2 text-[#008b9b] font-bold text-xs uppercase tracking-wider">
                <PlusCircle className="w-4 h-4" />
                <span>Quick Online Registration</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 mt-1">
                Register New Solar Inverter Repair Complaint
              </h2>
              <p className="text-xs text-slate-500">
                Submit your inverter fault details. Your Tracking ID will be generated immediately and stored on your device for fast access whenever you visit!
              </p>
            </div>

            {/* Created Job Notification Banner */}
            {createdJobResult && (
              <div className="bg-emerald-50 border-2 border-emerald-500/80 rounded-2xl p-6 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-md">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">
                        Complaint Registered & Saved to Device!
                      </h3>
                      <p className="text-xs text-emerald-800">
                        Your tracking number is saved in your browser localStorage. Return anytime to check status automatically!
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCreatedJobResult(null)}
                    className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                <div className="bg-white p-4 rounded-xl border border-emerald-200 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Tracking ID:</span>
                    <span className="font-mono text-xl font-black text-[#008b9b] tracking-wider">
                      #{createdJobResult.trackingId}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(createdJobResult.trackingId)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5 text-[#008b9b]" />
                      <span>{copiedTrackingId ? 'Copied!' : 'Copy ID'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPrintJob(createdJobResult);
                        setPrintDocumentType('job_tag');
                      }}
                      className="px-4 py-2 bg-[#008b9b] hover:bg-[#007280] text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Customer Tag Chit</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Complaint Form */}
            <form onSubmit={handleFileComplaint} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Yasir Mehmood"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008b9b]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Mobile Number (SMS Updates) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 0321-782233"
                    value={mobileNo}
                    onChange={(e) => setMobileNo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008b9b]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Address / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Sector G-11/3, Islamabad"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008b9b]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Inverter Model / Brand *</label>
                  <select
                    value={inverterBrand}
                    onChange={(e) => setInverterBrand(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008b9b]"
                  >
                    <option value="Inverex Nitrox">Inverex Nitrox Hybrid</option>
                    <option value="Inverex Veyron">Inverex Veyron MPPT</option>
                    <option value="Inverex Aerox">Inverex Aerox</option>
                    <option value="Solis Hybrid">Solis On-Grid / Hybrid</option>
                    <option value="Growatt SPF">Growatt SPF / SPH</option>
                    <option value="Knox Krypton">Knox Krypton / Xenon</option>
                    <option value="Huawei Sun2000">Huawei Sun2000</option>
                    <option value="Crown Elego">Crown Elego / Micro</option>
                    <option value="Fronus Hybrid">Fronus Platinum</option>
                    <option value="MaxPower Solar">MaxPower Solar</option>
                    <option value="Other Solar Inverter">Other Solar Brand</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Capacity Rating (kVA)</label>
                  <select
                    value={inverterKva}
                    onChange={(e) => setInverterKva(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008b9b]"
                  >
                    <option value="1.2 kVA">1.2 kVA</option>
                    <option value="2.5 kVA">2.5 kVA</option>
                    <option value="3.2 kVA">3.2 kVA</option>
                    <option value="5.0 kVA">5.0 kVA</option>
                    <option value="6.0 kVA">6.0 kVA</option>
                    <option value="8.0 kVA">8.0 kVA</option>
                    <option value="10.0 kVA">10.0 kVA</option>
                    <option value="15.0 kVA">15.0 kVA</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Fault Description / Error Code</label>
                <textarea
                  rows={3}
                  placeholder="Describe problem, e.g. Error 08 Bus Volt High, MOSFET Short Circuit, Burning Smell, No Display, PV Grid Sync Failure..."
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008b9b]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Referral Franchise Code (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. ISB1121"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008b9b]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#008b9b] hover:bg-[#007280] text-white font-black text-sm rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Submit Complaint & Save Tracking ID</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: STATE OF THE ART FACILITY */}
        {activeSection === 'facility' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-8">
            <div className="border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2 text-[#008b9b] font-bold text-xs uppercase tracking-wider">
                <Cpu className="w-4 h-4" />
                <span>State-of-the-Art Repairing Facility</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 mt-1">
                Advanced High-Tech Laboratory Equipment
              </h2>
              <p className="text-xs text-slate-500">
                Unlike local repair shops, InvertiSOL operates an ISO-grade electronics laboratory equipped with military-spec diagnostic gear to ensure long-term reliability.
              </p>
            </div>

            {/* Showcase Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Facility Card 1 */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500 text-white flex items-center justify-center font-black shadow-md">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm">Digital Storage Oscilloscope Stations</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Precision sine wave analysis to verify pure sine wave output (50Hz harmonic distortion check) before returning the inverter to the customer.
                </p>
              </div>

              {/* Facility Card 2 */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black shadow-md">
                  <Gauge className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm">5.0 kVA High-Voltage Load Bench</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Real-world simulated load testing. Every repaired unit is run continuously under heavy load for 2+ hours to guarantee stress performance under extreme summer temperatures.
                </p>
              </div>

              {/* Facility Card 3 */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-md">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm">ESD-Safe Micro-Soldering Benches</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Anti-static grounded workstations with optical microscopes for precision surface-mount device (SMD) and main driver IC micro-repair.
                </p>
              </div>

              {/* Facility Card 4 */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-[#008b9b] text-white flex items-center justify-center font-black shadow-md">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm">100% Genuine Imported MOSFETs & IGBTs</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  We strictly install factory-original power transistors (IXYS, IXFH, Infineon) — avoiding cheap market replicas that blow out under heavy surge currents.
                </p>
              </div>
            </div>

            {/* Error Code Diagnostic List */}
            <div className="bg-gradient-to-r from-teal-50 to-slate-100 border border-teal-200 rounded-2xl p-6 space-y-4">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <Wrench className="w-5 h-5 text-[#008b9b]" />
                <span>Common Fault Errors Diagnosed & Fixed Daily</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="font-bold text-[#008b9b] block">Error 08 / Error 09</span>
                  <span className="text-slate-600 text-[11px]">Bus Voltage High / Soft Start Fault</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="font-bold text-[#008b9b] block">Error 51 / Error 58</span>
                  <span className="text-slate-600 text-[11px]">Over Current / Inverter Output Low</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="font-bold text-[#008b9b] block">Grid & MPPT Failure</span>
                  <span className="text-slate-600 text-[11px]">Solar Charger / Relay Synchronization</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PROCESS GUIDE */}
        {activeSection === 'guide' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-8">
            <div className="border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2 text-[#008b9b] font-bold text-xs uppercase tracking-wider">
                <HelpCircle className="w-4 h-4" />
                <span>Transparent Process Standard</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 mt-1">
                Step-by-Step Customer Repair Journey
              </h2>
              <p className="text-xs text-slate-500">
                Simple, transparent 5-step process from registering your complaint to tracking live facility progress, viewing itemized bills, paying online/at counter, and receiving your 6-month warranty receipt.
              </p>
            </div>

            {/* Stepper Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Step 1 */}
              <div className="bg-gradient-to-b from-slate-50 to-teal-50/30 border border-slate-200 rounded-2xl p-4 text-center space-y-3 flex flex-col justify-between hover:border-[#008b9b] transition-all shadow-sm">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-[#008b9b] text-white font-black text-sm flex items-center justify-center mx-auto shadow-md">
                    1
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-xs">1. Register Complaint</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Submit fault details online or at our counter. Your unique Tracking ID is generated immediately and <strong>automatically saved to your device</strong>.
                  </p>
                </div>
                <button
                  onClick={() => setActiveSection('file')}
                  className="w-full py-2 bg-[#008b9b] hover:bg-[#007280] text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-sm"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>File Complaint Now</span>
                </button>
              </div>

              {/* Step 2 */}
              <div className="bg-gradient-to-b from-slate-50 to-amber-50/30 border border-slate-200 rounded-2xl p-4 text-center space-y-3 flex flex-col justify-between hover:border-amber-400 transition-all shadow-sm">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center mx-auto shadow-md">
                    2
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-xs">2. Auto-Saved Track</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Visit the app anytime on your phone or laptop. Your stored tracking number fills in automatically for 1-click status checking.
                  </p>
                </div>
                <button
                  onClick={() => setActiveSection('track')}
                  className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-sm"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Track Complaint</span>
                </button>
              </div>

              {/* Step 3 */}
              <div className="bg-gradient-to-b from-slate-50 to-cyan-50/30 border border-slate-200 rounded-2xl p-4 text-center space-y-3 flex flex-col justify-between hover:border-cyan-500 transition-all shadow-sm">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500 text-white font-black text-sm flex items-center justify-center mx-auto shadow-md">
                    3
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-xs">3. Lab Facility Progress</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Engineers perform PCB thermal scan, oscilloscope pure sine wave test, micro-soldering, 5.0 kVA load bench run & technician updates.
                  </p>
                </div>
                <button
                  onClick={() => setActiveSection('facility')}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-950 text-cyan-300 border border-cyan-400/30 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-sm"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>View Lab Gear</span>
                </button>
              </div>

              {/* Step 4 */}
              <div className="bg-gradient-to-b from-slate-50 to-emerald-50/30 border border-slate-200 rounded-2xl p-4 text-center space-y-3 flex flex-col justify-between hover:border-emerald-500 transition-all shadow-sm">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white font-black text-sm flex items-center justify-center mx-auto shadow-md">
                    4
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-xs">4. View & Pay Bill</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Review transparent itemized bill (replaced parts + labor). Pay easily via Online Bank Transfer (Meezan/Bank Alfalah/Easypaisa) or cash at counter.
                  </p>
                </div>
                <button
                  onClick={() => setActiveSection('track')}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-sm"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>View & Pay Bill</span>
                </button>
              </div>

              {/* Step 5 */}
              <div className="bg-gradient-to-b from-slate-50 to-teal-50/30 border border-slate-200 rounded-2xl p-4 text-center space-y-3 flex flex-col justify-between hover:border-teal-600 transition-all shadow-sm">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-teal-700 text-white font-black text-sm flex items-center justify-center mx-auto shadow-md">
                    5
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-xs">5. Warranty Service Receipt</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Collect your repaired solar inverter along with official service receipt chit containing our <strong>6-Month Lab Backed Hardware Warranty</strong>.
                  </p>
                </div>
                <button
                  onClick={() => setActiveSection('track')}
                  className="w-full py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-sm"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                  <span>Print Receipt</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. STATS & METRICS STRIP */}
      <section className="bg-slate-950 text-white rounded-3xl p-8 border border-slate-900 shadow-xl max-w-5xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          <div className="space-y-1 pt-4 lg:pt-0">
            <div className="text-3xl font-black text-amber-400 font-mono">5,000+</div>
            <div className="text-xs font-bold text-slate-300">Inverters Repaired</div>
          </div>
          <div className="space-y-1 pt-4 lg:pt-0">
            <div className="text-3xl font-black text-cyan-300 font-mono">99.2%</div>
            <div className="text-xs font-bold text-slate-300">Lab Repair Success</div>
          </div>
          <div className="space-y-1 pt-4 lg:pt-0">
            <div className="text-3xl font-black text-emerald-400 font-mono">24-48h</div>
            <div className="text-xs font-bold text-slate-300">Average Turnaround</div>
          </div>
          <div className="space-y-1 pt-4 lg:pt-0">
            <div className="text-3xl font-black text-amber-300 font-mono">100+</div>
            <div className="text-xs font-bold text-slate-300">Franchise Referral Partners</div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER & HELPLINE BAR */}
      <footer className="bg-slate-950 text-slate-400 rounded-3xl p-8 border border-slate-900 max-w-5xl mx-auto text-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-sm">InvertiSOL Repairing Labs</h4>
              <p className="text-[11px] text-slate-400">{labAddress}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${labHelplinePhone}`}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call Helpline: {labHelplinePhone}</span>
            </a>
            {isAdminUnlocked && (
              <button
                onClick={() => {
                  setEditingPhone(labHelplinePhone);
                  setEditingAddress(labAddress);
                  setShowEditContactModal(true);
                }}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                title="Edit Mobile Number & Address"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Info</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <span>© 2026 InvertiSOL Repairing Labs. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAdminLoginModal(true)}
              className="hover:text-amber-300 transition-colors cursor-pointer"
            >
              Admin / Staff Portal
            </button>
            <button
              onClick={() => setActiveSection('guide')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Process Guide
            </button>
          </div>
        </div>
      </footer>

      {/* ADMIN EDIT HELPLINE & ADDRESS MODAL */}
      {showEditContactModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-sm">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Edit Home Page Contact & Address</h3>
                  <p className="text-[11px] text-slate-500">Admin Facility — Updates Helpline & Lab Address</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditContactModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateLabContactInfo(editingPhone, editingAddress);
                setShowEditContactModal(false);
              }}
              className="space-y-4 text-xs font-bold"
            >
              <div className="space-y-1.5">
                <label className="text-slate-700 flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-[#008b9b]" />
                  <span>Helpline Mobile Number</span>
                </label>
                <input
                  type="text"
                  value={editingPhone}
                  onChange={(e) => setEditingPhone(e.target.value)}
                  placeholder="e.g. +92 345 5390396"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#008b9b] font-mono text-slate-900"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#008b9b]" />
                  <span>Lab Location / Address</span>
                </label>
                <textarea
                  rows={3}
                  value={editingAddress}
                  onChange={(e) => setEditingAddress(e.target.value)}
                  placeholder="e.g. Main Service Center, Koral Chowk, Islamabad"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#008b9b] text-slate-900 leading-relaxed resize-none"
                  required
                />
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-[11px] text-amber-900 font-medium">
                💡 Changes will immediately reflect across the Home Page hero, helpline badges, contact links, and footer.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditContactModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#008b9b] hover:bg-[#007280] text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
