import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { JobStatus, Job } from '../../types';
import { RefreshCw, Package, Truck, AlertTriangle, CheckCircle2, FileText } from 'lucide-react';

export const ALL_STATUSES: JobStatus[] = [
  'Complaint Filed',
  'Ready for Pick Up',
  'Received and Awaiting Maintenance',
  'Under Maintenance',
  'Awaiting Parts',
  'Repaired under Test',
  'Repaired & Ready for Delivery',
];

export const UpdateJobStatusTab: React.FC = () => {
  const { jobs, inventory, updateJobStatus } = useApp();

  // Active jobs filter (excluding Delivered & Paid)
  const activeJobs = jobs.filter((j) => j.status !== 'Delivered & Paid');

  const [selectedJobId, setSelectedJobId] = useState<string>(activeJobs[0]?.id || '');
  const [targetStatus, setTargetStatus] = useState<JobStatus>('Under Maintenance');
  const [remarks, setRemarks] = useState('');

  // Technician Dispatch state
  const [techName, setTechName] = useState('');
  const [techPhone, setTechPhone] = useState('');
  const [techRemarks, setTechRemarks] = useState('');

  // Inventory Consumption state
  const [selectedItemId, setSelectedItemId] = useState<string>(inventory[0]?.id || '');
  const [consumeQty, setConsumeQty] = useState<number>(1);
  const [pendingItems, setPendingItems] = useState<{ itemId: string; qty: number; name: string; unitPrice: number }[]>([]);

  const activeJob = jobs.find((j) => j.id === selectedJobId);

  // Determine if target status requires/supports inventory consumption (Pages 25, 26)
  const isInventoryAllowed = [
    'Under Maintenance',
    'Awaiting Parts',
    'Repaired under Test',
    'Repaired & Ready for Delivery',
  ].includes(targetStatus);

  const handleSelectJob = (id: string) => {
    setSelectedJobId(id);
    const job = jobs.find((j) => j.id === id);
    if (job) {
      setTargetStatus(job.status);
      setRemarks('');
      setPendingItems([]);
    }
  };

  const handleAddPendingItem = () => {
    if (!selectedItemId || consumeQty <= 0) return;
    const invItem = inventory.find((i) => i.id === selectedItemId);
    if (!invItem) return;

    if (consumeQty > invItem.qtyInStock) {
      alert(`Insufficient stock! Only ${invItem.qtyInStock} ${invItem.unitOfIssue} available.`);
      return;
    }

    setPendingItems((prev) => [
      ...prev,
      { itemId: invItem.id, qty: consumeQty, name: invItem.name, unitPrice: invItem.unitPrice },
    ]);
    setConsumeQty(1);
  };

  const handleRemovePendingItem = (index: number) => {
    setPendingItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobId) return;

    let techDispatch;
    if (techName) {
      techDispatch = {
        name: techName,
        phone: techPhone,
        remarks: techRemarks,
      };
    }

    updateJobStatus(
      selectedJobId,
      targetStatus,
      remarks,
      pendingItems.map((p) => ({ itemId: p.itemId, qty: p.qty })),
      techDispatch
    );

    alert(`Job status updated successfully to "${targetStatus}"!`);

    // Reset Form
    setRemarks('');
    setPendingItems([]);
    setTechName('');
    setTechPhone('');
    setTechRemarks('');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <RefreshCw className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-bold tracking-tight">Update Inverter Job Status</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Update maintenance stages, dispatch pickup technicians, and consume spare parts with stock auto-deduction.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Jobs List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider px-2">
            In-Progress Jobs ({activeJobs.length})
          </h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {activeJobs.map((j) => {
              const isSelected = j.id === selectedJobId;
              const isOverdue =
                j.estimatedRepairDate < new Date().toISOString().split('T')[0] &&
                j.status !== 'Repaired & Ready for Delivery';

              return (
                <div
                  key={j.id}
                  onClick={() => handleSelectJob(j.id)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500 text-white font-medium shadow-md'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono font-bold">
                    <span className="text-amber-400">#{j.trackingId}</span>
                    <span className="bg-slate-900 px-2 py-0.5 rounded text-[10px] border border-slate-700">
                      {j.status}
                    </span>
                  </div>
                  <p className="font-bold text-slate-100 mt-1">{j.customerName}</p>
                  <p className="text-slate-400 text-[11px] truncate">{j.inverterBrand} ({j.inverterKva})</p>
                  {isOverdue && (
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-rose-400 font-bold">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Overdue Repair Date!</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Status Update Controls & Inventory Consumption */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          {activeJob ? (
            <form onSubmit={handleUpdate} className="space-y-6">
              {/* Job Selected Brief */}
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400">Tracking ID:</span>
                  <p className="font-mono font-bold text-amber-400 text-sm">#{activeJob.trackingId}</p>
                </div>
                <div>
                  <span className="text-slate-400">Customer Name:</span>
                  <p className="font-bold text-white">{activeJob.customerName}</p>
                </div>
                <div>
                  <span className="text-slate-400">Inverter:</span>
                  <p className="font-bold text-white">{activeJob.inverterBrand} ({activeJob.inverterKva})</p>
                </div>
                <div>
                  <span className="text-slate-400">Current Status:</span>
                  <p className="font-bold text-emerald-400">{activeJob.status}</p>
                </div>
                <div>
                  <span className="text-slate-400">Estimated Delivery:</span>
                  <p className="font-mono font-bold text-slate-200">{activeJob.estimatedRepairDate}</p>
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Select Target Maintenance Status
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as JobStatus)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs text-white focus:ring-2 focus:ring-amber-500 font-semibold"
                >
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Technician Dispatch Details (p.25) */}
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 space-y-3">
                <label className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-amber-400" />
                  <span>Technician Pick-up / Dispatch Details (Anti-Scam Record)</span>
                </label>
                <p className="text-[11px] text-slate-400">
                  Record dispatched technician information. This is visible on the Customer Portal so customers verify technician identity.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <input
                    type="text"
                    placeholder="Technician Full Name (e.g. Kamran Ali)"
                    value={techName}
                    onChange={(e) => setTechName(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                  <input
                    type="text"
                    placeholder="Technician Mobile Number"
                    value={techPhone}
                    onChange={(e) => setTechPhone(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              {/* Conditional Inventory Consumption Section (Pages 25, 26) */}
              {isInventoryAllowed ? (
                <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                    <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Package className="w-4 h-4" />
                      <span>Consume Spare Parts from Inventory (Optional)</span>
                    </label>
                    <span className="text-[10px] text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Auto-Deducted from Stock
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="sm:col-span-2">
                      <label className="block text-slate-400 mb-1">Select Item from Stock</label>
                      <select
                        value={selectedItemId}
                        onChange={(e) => setSelectedItemId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                      >
                        {inventory.map((inv) => (
                          <option key={inv.id} value={inv.id}>
                            {inv.name} (In Stock: {inv.qtyInStock} {inv.unitOfIssue} - Rs. {inv.unitPrice}/unit)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Quantity</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          value={consumeQty}
                          onChange={(e) => setConsumeQty(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono font-bold"
                        />
                        <button
                          type="button"
                          onClick={handleAddPendingItem}
                          className="px-3 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Consumed Items Preview */}
                  {pendingItems.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <p className="text-[11px] font-bold text-slate-300">Parts to consume on update:</p>
                      <div className="divide-y divide-slate-700 bg-slate-900 rounded-lg p-2 border border-slate-700 text-xs">
                        {pendingItems.map((p, idx) => (
                          <div key={idx} className="p-2 flex items-center justify-between text-slate-200">
                            <span>{p.name} × {p.qty}</span>
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-amber-400 font-bold">
                                Rs. {(p.qty * p.unitPrice).toLocaleString()}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemovePendingItem(idx)}
                                className="text-rose-400 hover:underline text-[10px]"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700 text-xs text-slate-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>
                    No inventory consumption required for status &quot;{targetStatus}&quot;. Inventory options are hidden per lab policy.
                  </span>
                </div>
              )}

              {/* Remarks */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Technician Remarks</label>
                <textarea
                  rows={2}
                  placeholder="Enter repair details, bench testing notes, replaced component status..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
              >
                Update Status to &quot;{targetStatus}&quot;
              </button>
            </form>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs">
              No active in-progress job selected. Select a job from the left panel.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
