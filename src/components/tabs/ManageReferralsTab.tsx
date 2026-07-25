import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Share2, PlusCircle, Printer, AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';

export const ManageReferralsTab: React.FC = () => {
  const {
    franchises,
    jobs,
    addFranchise,
    toggleFranchiseActive,
    setSelectedPrintJob,
    setPrintDocumentType,
  } = useApp();

  // Add Franchise State
  const [name, setName] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [address, setAddress] = useState('');
  const [cityCode, setCityCode] = useState('ISB');
  const [uniqueFourDigit, setUniqueFourDigit] = useState('1125');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Referral Report State
  const [selectedFranchiseCode, setSelectedFranchiseCode] = useState<string>(
    franchises[0]?.referralCode || ''
  );
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const res = addFranchise(name, mobileNo, address, cityCode, uniqueFourDigit);
    if (!res.success) {
      setErrorMessage(res.error || 'Error adding franchise');
      return;
    }

    alert(`Franchise "${name}" with code ${cityCode}${uniqueFourDigit} added successfully!`);
    setName('');
    setMobileNo('');
    setAddress('');
  };

  // Compute Referral Report for Selected Franchise
  const targetFranchise = franchises.find((f) => f.referralCode === selectedFranchiseCode);

  // Qualified Jobs rule (p.23): Status must be "Received and Awaiting Maintenance" or higher (excludes Complaint Filed & Ready for Pickup)
  const eligibleStatuses = [
    'Received and Awaiting Maintenance',
    'Under Maintenance',
    'Awaiting Parts',
    'Repaired under Test',
    'Repaired & Ready for Delivery',
    'Delivered & Paid',
  ];

  const referredJobs = jobs.filter((j) => {
    const matchCode = j.referralId === selectedFranchiseCode;
    const matchDate = j.createdDateOnly >= dateFrom && j.createdDateOnly <= dateTo;
    const matchStatus = eligibleStatuses.includes(j.status);
    return matchCode && matchDate && matchStatus;
  });

  const totalPaymentDue = referredJobs.reduce((acc, j) => acc + j.referralCost, 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Share2 className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-bold tracking-tight">Manage Referrals & Franchise Network</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Assign unique referral codes (format CITYXXX), calculate franchise share payments, and print share reports.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Box: Add Franchise & Active List */}
        <div className="space-y-6">
          {/* Add Franchise Form */}
          <form onSubmit={handleAdd} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <PlusCircle className="w-4 h-4 text-amber-400" />
              <span>Add New Franchise / Referral Partner</span>
            </h3>

            {errorMessage && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-lg text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Franchise / Partner Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Islamabad Solar Solutions"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Mobile Number *</label>
                <input
                  type="text"
                  placeholder="e.g. 0300-5551121"
                  value={mobileNo}
                  onChange={(e) => setMobileNo(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Address</label>
                <input
                  type="text"
                  placeholder="Street / Sector / City"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              {/* Unique Code Format CITYXXX (p.27) */}
              <div className="grid grid-cols-2 gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">City Code (e.g. ISB, RWP)</label>
                  <input
                    type="text"
                    placeholder="ISB"
                    value={cityCode}
                    onChange={(e) => setCityCode(e.target.value.toUpperCase())}
                    maxLength={4}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">4-Digit Unique ID</label>
                  <input
                    type="text"
                    placeholder="1121"
                    value={uniqueFourDigit}
                    onChange={(e) => setUniqueFourDigit(e.target.value)}
                    maxLength={4}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono font-bold"
                  />
                </div>
                <p className="col-span-2 text-[11px] text-amber-300 font-mono font-bold">
                  Generated Referral Code: {cityCode.toUpperCase()}{uniqueFourDigit}
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg"
              >
                Register Referral Partner
              </button>
            </div>
          </form>

          {/* Franchise Network List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Registered Franchises</h3>
            <div className="divide-y divide-slate-800 text-xs">
              {franchises.map((f) => (
                <div key={f.id} className="py-3 flex items-center justify-between text-slate-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-400 font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {f.referralCode}
                      </span>
                      <span className="font-bold text-white">{f.name}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">{f.mobileNo} | {f.address}</p>
                  </div>
                  <button
                    onClick={() => toggleFranchiseActive(f.id)}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                      f.active
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {f.active ? 'Active' : 'Blocked'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Box: Referral Payment Calculation & Share Report (p.23, 28) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Referral Payment & Share Calculation
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select franchise and date range to compute referral share due for confirmed lab jobs.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Select Franchise</label>
              <select
                value={selectedFranchiseCode}
                onChange={(e) => setSelectedFranchiseCode(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono font-bold"
              >
                {franchises.map((f) => (
                  <option key={f.id} value={f.referralCode}>
                    {f.referralCode} - {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Date From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Date To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>
            </div>

            {/* Total Due Banner */}
            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Total Projects Referred: {referredJobs.length}
                </p>
                <p className="text-[11px] text-slate-300">Filtered for confirmed lab jobs</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Total Share Payment Due</span>
                <span className="text-2xl font-black font-mono text-amber-400">
                  Rs. {totalPaymentDue.toLocaleString()}
                </span>
              </div>
            </div>

            {/* List of Referred Projects */}
            <div>
              <h4 className="font-bold text-slate-300 uppercase tracking-wider mb-2">Referred Projects List</h4>
              <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700 divide-y divide-slate-700 max-h-60 overflow-y-auto">
                {referredJobs.length === 0 ? (
                  <p className="text-slate-500 italic text-center py-4">No confirmed referred jobs in selected range.</p>
                ) : (
                  referredJobs.map((j) => (
                    <div key={j.id} className="py-2 flex items-center justify-between">
                      <div>
                        <span className="font-mono font-bold text-amber-400">#{j.trackingId}</span>
                        <span className="text-slate-200 ml-2 font-medium">{j.customerName}</span>
                        <span className="text-[10px] text-slate-400 block">{j.inverterBrand} ({j.status})</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-400">
                        Rs. {j.referralCost.toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Print Referral Share Report */}
            {targetFranchise && (
              <button
                type="button"
                onClick={() => {
                  if (referredJobs.length > 0) {
                    setSelectedPrintJob(referredJobs[0]);
                    setPrintDocumentType('referral_report');
                  } else {
                    alert('No referred jobs to print report.');
                  }
                }}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Print Official Referral Share Report</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
