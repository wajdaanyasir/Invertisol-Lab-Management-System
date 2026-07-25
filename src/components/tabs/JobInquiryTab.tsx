import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Printer, Trash2, Calendar, Clock, User, ShieldAlert, CheckCircle2, AlertTriangle, Truck } from 'lucide-react';

export const JobInquiryTab: React.FC = () => {
  const { jobs, currentUser, deleteJob, setSelectedPrintJob, setPrintDocumentType } = useApp();

  const [searchTrackingId, setSearchTrackingId] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchInverter, setSearchInverter] = useState('');

  const [selectedJobId, setSelectedJobId] = useState<string>(jobs[0]?.id || '');

  const filteredJobs = jobs.filter((j) => {
    const matchTracking = !searchTrackingId || j.trackingId.toLowerCase().includes(searchTrackingId.toLowerCase());
    const matchName = !searchName || j.customerName.toLowerCase().includes(searchName.toLowerCase());
    const matchLoc = !searchLocation || j.labLocation.toLowerCase().includes(searchLocation.toLowerCase());
    const matchInv = !searchInverter || j.inverterBrand.toLowerCase().includes(searchInverter.toLowerCase());
    return matchTracking && matchName && matchLoc && matchInv;
  });

  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  const handleDelete = () => {
    if (!selectedJob) return;
    const confirm = window.confirm(
      `CRITICAL DELETION:\nAre you sure you want to delete Job #${selectedJob.trackingId}?\n\nDeleting this job will:\n1. Restore consumed inventory items (${selectedJob.consumedInventory.length} parts) back to stock.\n2. Reverse associated cash register transactions.\n\nProceed with deletion?`
    );
    if (confirm) {
      deleteJob(selectedJob.id);
      alert(`Job #${selectedJob.trackingId} deleted and all inventory/financial effects restored!`);
      setSelectedJobId(jobs.find((j) => j.id !== selectedJob.id)?.id || '');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Search className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-bold tracking-tight">Job Inquiry & Search Database</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Search job history, audit timeline, printable slips, and Super User job rollback deletion.
          </p>
        </div>
      </div>

      {/* Search Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="block text-slate-400 mb-1 font-semibold">Enter Tracking ID</label>
          <input
            type="text"
            placeholder="e.g. 2407260001"
            value={searchTrackingId}
            onChange={(e) => setSearchTrackingId(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono font-bold"
          />
        </div>

        <div>
          <label className="block text-slate-400 mb-1 font-semibold">Customer Name</label>
          <input
            type="text"
            placeholder="Customer Name..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
          />
        </div>

        <div>
          <label className="block text-slate-400 mb-1 font-semibold">Lab Location</label>
          <input
            type="text"
            placeholder="Location..."
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
          />
        </div>

        <div>
          <label className="block text-slate-400 mb-1 font-semibold">Inverter Type / Brand</label>
          <input
            type="text"
            placeholder="e.g. Inverex / Crown..."
            value={searchInverter}
            onChange={(e) => setSearchInverter(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
          />
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider px-2">
            Search Records Found ({filteredJobs.length})
          </h3>
          <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
            {filteredJobs.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-4 text-center">No matching job records found.</p>
            ) : (
              filteredJobs.map((j) => {
                const isSelected = j.id === selectedJobId;
                return (
                  <div
                    key={j.id}
                    onClick={() => setSelectedJobId(j.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-white font-medium shadow-md'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono font-bold">
                      <span className="text-amber-400">#{j.trackingId}</span>
                      <span className="bg-slate-900 px-2 py-0.5 rounded text-[10px] text-slate-300 border border-slate-700">
                        {j.status}
                      </span>
                    </div>
                    <p className="font-bold text-slate-100 mt-1">{j.customerName}</p>
                    <p className="text-slate-400 text-[11px] truncate">{j.inverterBrand} ({j.inverterKva})</p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Details Panel */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          {selectedJob ? (
            <div className="space-y-6 text-xs">
              {/* Job Header & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] uppercase font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Tracking ID: #{selectedJob.trackingId}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">{selectedJob.customerName}</h3>
                  <p className="text-slate-400">{selectedJob.mobileNo} | {selectedJob.address}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedPrintJob(selectedJob);
                      setPrintDocumentType('job_tag');
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg font-bold border border-slate-700"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Details</span>
                  </button>

                  {/* Super User Job Deletion (p.21) */}
                  {currentUser.role === 'super' && (
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-1.5 px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg font-bold border border-rose-500/40"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Job (Rollback)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Status & Technical Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <div>
                  <span className="text-slate-400">Current Status:</span>
                  <p className="font-bold text-emerald-400 mt-0.5">{selectedJob.status}</p>
                </div>
                <div>
                  <span className="text-slate-400">Inverter Specs:</span>
                  <p className="font-bold text-white mt-0.5">{selectedJob.inverterBrand} ({selectedJob.inverterKva})</p>
                </div>
                <div>
                  <span className="text-slate-400">Lab Location:</span>
                  <p className="font-bold text-white mt-0.5">{selectedJob.labLocation}</p>
                </div>
                <div>
                  <span className="text-slate-400">Estimated Delivery:</span>
                  <p className="font-mono font-bold text-amber-300 mt-0.5">{selectedJob.estimatedRepairDate}</p>
                </div>
              </div>

              {/* Dispatched Technician Info (p.25) */}
              {selectedJob.technicianDispatched && (
                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 flex items-center gap-3">
                  <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-white">Dispatched Technician: {selectedJob.technicianDispatched.name}</p>
                    <p className="text-slate-400 text-[11px]">
                      Phone: {selectedJob.technicianDispatched.phone} | Remarks: {selectedJob.technicianDispatched.remarks}
                    </p>
                  </div>
                </div>
              )}

              {/* Consumed Inventories Used */}
              <div>
                <h4 className="font-bold text-slate-300 uppercase tracking-wider mb-2">
                  List of Inventories Consumed
                </h4>
                <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700">
                  {selectedJob.consumedInventory.length === 0 ? (
                    <p className="text-slate-500 italic text-center py-2">No spare parts consumed.</p>
                  ) : (
                    <div className="divide-y divide-slate-700">
                      {selectedJob.consumedInventory.map((ci, idx) => (
                        <div key={idx} className="py-2 flex items-center justify-between text-slate-200">
                          <span>{ci.itemName} (Qty: {ci.qty})</span>
                          <span className="font-mono font-bold text-amber-400">
                            Rs. {ci.totalCost.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Cost Summary */}
              <div>
                <h4 className="font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Financial Breakdown
                </h4>
                <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-1.5 font-mono">
                  <div className="flex justify-between text-slate-300">
                    <span>Parts Material Cost:</span>
                    <span>Rs. {selectedJob.totalInventoryCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Bench Repairing Service Cost:</span>
                    <span>Rs. {selectedJob.repairCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Referral Cost:</span>
                    <span>Rs. {selectedJob.referralCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Pick Up / Delivery Cost:</span>
                    <span>Rs. {(selectedJob.pickupCost + selectedJob.deliveryCost).toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-700 flex justify-between font-bold text-sm text-amber-400">
                    <span>Total Bill:</span>
                    <span>Rs. {selectedJob.totalBillAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Status Update History Audit Timeline */}
              <div>
                <h4 className="font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Status History Timeline
                </h4>
                <div className="space-y-2 border-l-2 border-amber-500/40 pl-4 my-2">
                  {selectedJob.statusHistory.map((h, idx) => (
                    <div key={idx} className="text-slate-300 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-300">{h.status}</span>
                        <span className="text-[10px] text-slate-500">{h.timestamp}</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">Updated by: {h.updatedBy}</p>
                      {h.remarks && <p className="text-slate-300 italic">{h.remarks}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs">
              Select a job record from the search list to view complete inquiry details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
