import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Smartphone, Search, Zap, Truck, CheckCircle2, AlertTriangle, Printer, Clock, FileText, ArrowLeft } from 'lucide-react';

export const CustomerPortal: React.FC = () => {
  const { jobs, addJob, setSelectedPrintJob, setPrintDocumentType, setPortalMode, appLogo, t } = useApp();

  const [activeTab, setActiveTab] = useState<'track' | 'file_complaint'>('track');
  const [trackQuery, setTrackQuery] = useState('2407260002');
  const [searchedJob, setSearchedJob] = useState(() => {
    return jobs.find((j) => j.trackingId === '2407260002') || jobs[0];
  });

  // Complaint Form State
  const [customerName, setCustomerName] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [address, setAddress] = useState('');
  const [inverterBrand, setInverterBrand] = useState('Inverex Nitrox');
  const [inverterKva, setInverterKva] = useState('5.0 kVA');
  const [issueDescription, setIssueDescription] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [filedJobResult, setFiledJobResult] = useState<any>(null);

  const handleTrackSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = jobs.find((j) => j.trackingId.trim() === trackQuery.trim());
    if (found) {
      setSearchedJob(found);
    } else {
      alert(`No inverter repair record found for Tracking ID #${trackQuery}`);
    }
  };

  const handleFileComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !mobileNo || !inverterBrand) {
      alert('Name, Mobile Number, and Inverter Model are required.');
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

    setFiledJobResult(newJob);
    setSearchedJob(newJob);
    alert(`Complaint filed successfully! Your Tracking ID is #${newJob.trackingId}`);
  };

  return (
    <div className="max-w-md mx-auto my-6 bg-slate-50 border-4 border-slate-300 rounded-[2.5rem] shadow-2xl overflow-hidden text-slate-900 font-sans">
      {/* Phone Screen Notch / Status Bar */}
      <div className="bg-[#007280] px-6 py-3 flex items-center justify-between border-b border-teal-600/50 text-[11px] text-teal-100">
        <span className="font-mono font-bold text-white">9:41 AM</span>
        <div className="flex items-center gap-1">
          <span className="text-amber-300 font-bold">InvertiSOL Mobile</span>
        </div>
      </div>

      {/* Screen Header */}
      <div className="bg-[#008b9b] p-5 border-b border-[#007280] text-center relative">
        <button
          onClick={() => setPortalMode('admin')}
          className="absolute left-4 top-5 text-xs text-teal-100 hover:text-white flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Admin</span>
        </button>

        {appLogo ? (
          <img
            src={appLogo}
            alt="InvertiSOL Custom Logo"
            className="h-20 w-auto max-w-[280px] object-contain bg-white p-2.5 rounded-2xl mx-auto mb-2 shadow-lg border-2 border-amber-300 ring-2 ring-white/40"
          />
        ) : (
          <div className="w-10 h-10 bg-amber-400 text-slate-950 font-black rounded-xl flex items-center justify-center mx-auto mb-1 shadow-sm">
            <Zap className="w-5 h-5 fill-current" />
          </div>
        )}
        <h2 className="font-extrabold text-base tracking-tight text-white">{t('appName')} Repairing Labs</h2>
        <p className="text-[10px] text-teal-100/80">{t('tagline')}</p>

        {/* Navigation Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl mt-4 border border-slate-200 text-xs font-semibold shadow-inner">
          <button
            onClick={() => setActiveTab('track')}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'track' ? 'bg-white text-slate-900 font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('trackInverter')}
          </button>
          <button
            onClick={() => setActiveTab('file_complaint')}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'file_complaint' ? 'bg-white text-slate-900 font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('fileRequest')}
          </button>
        </div>
      </div>

      {/* Screen Body */}
      <div className="p-5 space-y-6 min-h-[500px] text-xs bg-white">
        {activeTab === 'track' && (
          <div className="space-y-6">
            {/* Search Box */}
            <form onSubmit={handleTrackSearch} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Tracking ID (e.g. 2407260002)"
                value={trackQuery}
                onChange={(e) => setTrackQuery(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#008b9b]"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-[#008b9b] hover:bg-[#006673] text-white font-bold rounded-xl cursor-pointer shadow-sm transition-colors"
              >
                Track
              </button>
            </form>

            {searchedJob ? (
              <div className="space-y-4">
                {/* Status Badge Card */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono text-[#008b9b] font-bold">
                      Tracking ID: #{searchedJob.trackingId}
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                      {searchedJob.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900">{searchedJob.customerName}</h3>
                  <p className="text-slate-600 text-[11px]">{searchedJob.inverterBrand} ({searchedJob.inverterKva})</p>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Est. Repair Date:</span>
                    <span className="font-mono font-bold text-slate-900">{searchedJob.estimatedRepairDate}</span>
                  </div>
                </div>

                {/* Technician Dispatched Remarks (Anti-Scam p.25) */}
                {searchedJob.technicianDispatched && (
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-800 font-bold">
                      <Truck className="w-4 h-4 text-amber-700" />
                      <span>Dispatched Technician Verification</span>
                    </div>
                    <p className="text-slate-900 font-bold">{searchedJob.technicianDispatched.name}</p>
                    <p className="text-slate-700">Phone: {searchedJob.technicianDispatched.phone}</p>
                    <p className="text-[10px] text-slate-600 italic">{searchedJob.technicianDispatched.remarks}</p>
                  </div>
                )}

                {/* Status History */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
                  <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Real-time Maintenance Updates
                  </h4>
                  <div className="space-y-3 border-l-2 border-[#008b9b] pl-3">
                    {searchedJob.statusHistory.map((h, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <p className="font-bold text-[#008b9b] text-xs">{h.status}</p>
                        <p className="text-[10px] text-slate-400">{h.timestamp}</p>
                        {h.remarks && <p className="text-[11px] text-slate-600 italic">{h.remarks}</p>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedPrintJob(searchedJob);
                      setPrintDocumentType('job_tag');
                    }}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 text-[11px] cursor-pointer shadow-sm transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#008b9b]" />
                    <span>View Customer Chit Slip</span>
                  </button>

                  {searchedJob.billGenerated && (
                    <button
                      onClick={() => {
                        setSelectedPrintJob(searchedJob);
                        setPrintDocumentType('bill');
                      }}
                      className="flex-1 py-2.5 bg-[#008b9b] hover:bg-[#006673] text-white font-bold rounded-xl flex items-center justify-center gap-1.5 text-[11px] cursor-pointer shadow-sm transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Bill</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">Enter your tracking ID above to track job status.</p>
            )}
          </div>
        )}

        {/* TAB 2: FILE REPAIR REQUEST */}
        {activeTab === 'file_complaint' && (
          <form onSubmit={handleFileComplaint} className="space-y-4">
            <h3 className="font-bold text-[#008b9b] uppercase tracking-wider text-[11px]">
              File Inverter Maintenance Complaint
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Your Name *</label>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008b9b]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Mobile Number *</label>
                <input
                  type="text"
                  placeholder="0300-1234567"
                  value={mobileNo}
                  onChange={(e) => setMobileNo(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#008b9b]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Pickup Address</label>
                <input
                  type="text"
                  placeholder="House #, Street, City"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008b9b]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Inverter Model</label>
                  <input
                    type="text"
                    placeholder="Inverex / Crown"
                    value={inverterBrand}
                    onChange={(e) => setInverterBrand(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008b9b]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Capacity</label>
                  <select
                    value={inverterKva}
                    onChange={(e) => setInverterKva(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008b9b]"
                  >
                    <option value="2.4 kVA">2.4 kVA</option>
                    <option value="3.2 kVA">3.2 kVA</option>
                    <option value="5.0 kVA">5.0 kVA</option>
                    <option value="6.0 kVA">6.0 kVA</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Issue Description *</label>
                <textarea
                  rows={2}
                  placeholder="Fault code, noise, or burning smell..."
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008b9b]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Franchise Referral Code (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. ISB1121"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#008b9b]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#008b9b] hover:bg-[#006673] text-white font-bold rounded-xl shadow-sm cursor-pointer transition-colors"
              >
                Submit Repair Complaint
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
