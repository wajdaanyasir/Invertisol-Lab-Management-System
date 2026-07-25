import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Job } from '../../types';
import { PlusCircle, Printer, UserCheck, Zap, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';

export const AddJobTab: React.FC = () => {
  const { jobs, addJob, franchises, setSelectedPrintJob, setPrintDocumentType } = useApp();

  // Filter complaints filed by customers from mobile app
  const pendingComplaints = jobs.filter(
    (j) => j.status === 'Complaint Filed' || j.status === 'Ready for Pick Up'
  );

  const [selectedComplaintId, setSelectedComplaintId] = useState<string>('');

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [address, setAddress] = useState('');
  const [inverterBrand, setInverterBrand] = useState('Inverex Nitrox');
  const [inverterKva, setInverterKva] = useState('5.0 kVA');
  const [issueDescription, setIssueDescription] = useState('');
  const [labLocation, setLabLocation] = useState('Islamabad Central Lab');
  const [estimatedRepairDate, setEstimatedRepairDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2); // Default 2 days repair time
    return d.toISOString().split('T')[0];
  });
  const [approximateCost, setApproximateCost] = useState<number>(6500);
  const [referralId, setReferralId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Handle selecting a customer complaint from drop down
  const handleSelectComplaint = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedComplaintId(id);
    if (!id) return;

    const complaintJob = jobs.find((j) => j.id === id);
    if (complaintJob) {
      setCustomerName(complaintJob.customerName);
      setMobileNo(complaintJob.mobileNo);
      setAddress(complaintJob.address);
      setInverterBrand(complaintJob.inverterBrand);
      setInverterKva(complaintJob.inverterKva);
      setIssueDescription(complaintJob.issueDescription);
      setLabLocation(complaintJob.labLocation || 'Islamabad Central Lab');
      if (complaintJob.referralId) setReferralId(complaintJob.referralId);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName || !mobileNo || !inverterBrand) {
      alert('Please fill in Customer Name, Mobile Number, and Inverter Brand.');
      return;
    }

    const createdJob = addJob({
      customerName,
      mobileNo,
      address,
      inverterBrand,
      inverterKva,
      issueDescription,
      labLocation,
      estimatedRepairDate,
      approximateCost: Number(approximateCost),
      referralId,
      status: selectedComplaintId ? 'Received and Awaiting Maintenance' : 'Complaint Filed',
    });

    setSuccessMessage(`Job successfully registered! Tracking ID: #${createdJob.trackingId}`);

    // Automatically prompt print chit modal
    setSelectedPrintJob(createdJob);
    setPrintDocumentType('job_tag');

    // Reset Form
    setSelectedComplaintId('');
    setCustomerName('');
    setMobileNo('');
    setAddress('');
    setIssueDescription('');
    setRemarks('');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <PlusCircle className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-bold tracking-tight">Add New Job / Inverter Register</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Register walk-in customer inverters or convert filed customer mobile complaints into lab repair jobs.
          </p>
        </div>
        <div className="bg-amber-500/10 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Auto Tracking ID: DDMMYY0001</span>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-300 hover:underline font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Form Container */}
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-8">
        {/* Step 1: Customer Complaints Dropdown (p.18) */}
        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4" />
              <span>Convert Customer Filed Complaint (Optional)</span>
            </label>
            <span className="text-[10px] text-slate-400">
              {pendingComplaints.length} pending customer complaint(s) available
            </span>
          </div>
          <select
            value={selectedComplaintId}
            onChange={handleSelectComplaint}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            <option value="">-- Walk-in Customer (Select if filing fresh) --</option>
            {pendingComplaints.map((c) => (
              <option key={c.id} value={c.id}>
                #{c.trackingId} - {c.customerName} ({c.inverterBrand} - {c.mobileNo})
              </option>
            ))}
          </select>
          {selectedComplaintId && (
            <p className="text-[11px] text-emerald-400 font-medium">
              ✓ Customer data imported automatically. You can edit or add lab repair details below.
            </p>
          )}
        </div>

        {/* Step 2: Item / Inverter Details */}
        <div>
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2 mb-4">
            1. Inverter Technical Specifications
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Inverter Brand & Model *</label>
              <input
                type="text"
                placeholder="e.g. Inverex Nitrox / Crown / Fronus"
                value={inverterBrand}
                onChange={(e) => setInverterBrand(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Capacity (kVA / kW)</label>
              <select
                value={inverterKva}
                onChange={(e) => setInverterKva(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="1.2 kVA">1.2 kVA</option>
                <option value="2.4 kVA">2.4 kVA</option>
                <option value="3.2 kVA">3.2 kVA</option>
                <option value="5.0 kVA">5.0 kVA</option>
                <option value="6.0 kVA">6.0 kVA</option>
                <option value="8.0 kVA">8.0 kVA</option>
                <option value="10.0 kVA">10.0 kVA</option>
                <option value="12.0 kVA+">12.0 kVA+</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-300 mb-1">Explain Issue Briefly *</label>
              <textarea
                rows={2}
                placeholder="e.g. Overload Code 04, MOSFET burnout, DC bus capacitor blown, no PV charge..."
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Personal Details */}
        <div>
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2 mb-4">
            2. Customer Personal Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Customer Name *</label>
              <input
                type="text"
                placeholder="Full Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Mobile Number *</label>
              <input
                type="text"
                placeholder="e.g. 0300-1234567"
                value={mobileNo}
                onChange={(e) => setMobileNo(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-300 mb-1">Complete Address</label>
              <input
                type="text"
                placeholder="House #, Street, Sector, City"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Step 4: Lab Location, Referral & Estimated Repair Date */}
        <div>
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2 mb-4">
            3. Lab Location, Referral & Estimated Delivery
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Select Lab Location</label>
              <select
                value={labLocation}
                onChange={(e) => setLabLocation(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="Islamabad Central Lab">Islamabad Central Lab</option>
                <option value="Rawalpindi Satellite Lab">Rawalpindi Satellite Lab</option>
                <option value="Lahore Branch Lab">Lahore Branch Lab</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Referral Franchise (Optional)</label>
              <select
                value={referralId}
                onChange={(e) => setReferralId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
              >
                <option value="">-- No Referral (Direct Walk-In) --</option>
                {franchises
                  .filter((f) => f.active)
                  .map((f) => (
                    <option key={f.id} value={f.referralCode}>
                      {f.referralCode} - {f.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Estimated Repair Date *</label>
              <input
                type="date"
                value={estimatedRepairDate}
                onChange={(e) => setEstimatedRepairDate(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                * An alert notification will trigger if repair passes this date without completion.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Approximate Cost (Rs.)</label>
              <input
                type="number"
                value={approximateCost}
                onChange={(e) => setApproximateCost(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono font-bold"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-300 mb-1">Internal Remarks (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Serial # checked, outer body scratches noted..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Clicking register will generate a sequential tracking ID and open the Tag Chit print window.
          </p>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg transition-all transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register Job & Print Chit</span>
          </button>
        </div>
      </form>
    </div>
  );
};
