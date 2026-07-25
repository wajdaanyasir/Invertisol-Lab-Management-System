import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Job } from '../../types';
import { FileText, ArrowLeftRight, Printer, Share2, CheckCircle2, DollarSign } from 'lucide-react';

export const GenerateBillTab: React.FC = () => {
  const {
    jobs,
    inventory,
    generateBill,
    downgradeJobStatus,
    setSelectedPrintJob,
    setPrintDocumentType,
  } = useApp();

  // Show jobs ready for billing or bill generated
  const completedJobs = jobs.filter(
    (j) => j.status === 'Repaired & Ready for Delivery' || j.billGenerated
  );

  const [selectedJobId, setSelectedJobId] = useState<string>(completedJobs[0]?.id || '');

  const activeJob = jobs.find((j) => j.id === selectedJobId);

  // Bill edit fields
  const [repairCost, setRepairCost] = useState<number>(activeJob ? activeJob.repairCost : 3500);
  const [referralCost, setReferralCost] = useState<number>(activeJob ? activeJob.referralCost : 1000);
  const [pickupCost, setPickupCost] = useState<number>(activeJob ? activeJob.pickupCost : 500);
  const [deliveryCost, setDeliveryCost] = useState<number>(activeJob ? activeJob.deliveryCost : 500);

  const handleSelectJob = (id: string) => {
    setSelectedJobId(id);
    const j = jobs.find((job) => job.id === id);
    if (j) {
      setRepairCost(j.repairCost);
      setReferralCost(j.referralCost);
      setPickupCost(j.pickupCost);
      setDeliveryCost(j.deliveryCost);
    }
  };

  const handleSaveBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobId || !activeJob) return;

    generateBill(
      selectedJobId,
      Number(repairCost),
      Number(referralCost),
      Number(pickupCost),
      Number(deliveryCost),
      activeJob.consumedInventory
    );

    alert('Bill updated/generated successfully!');

    // Show printable bill modal
    setSelectedPrintJob(activeJob);
    setPrintDocumentType('bill');
  };

  const handleDowngrade = () => {
    if (!selectedJobId || !activeJob) return;
    const confirmChoice = window.confirm(
      `Are you sure you want to downgrade status for Job #${activeJob.trackingId} back to "Under Maintenance"?`
    );
    if (confirmChoice) {
      downgradeJobStatus(selectedJobId, 'Under Maintenance');
      alert('Job status downgraded back to "Under Maintenance".');
    }
  };

  const totalInventoryCost = activeJob ? activeJob.consumedInventory.reduce((acc, i) => acc + i.totalCost, 0) : 0;
  const grandTotalCost = (repairCost || 0) + (referralCost || 0) + (pickupCost || 0) + (deliveryCost || 0) + totalInventoryCost;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-bold tracking-tight">Generate & Update Customer Bill</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Calculate replacement parts cost, repairing service profit, referral share, and delivery charges.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left List: Completed Jobs */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider px-2">
            Completed / Ready Jobs ({completedJobs.length})
          </h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {completedJobs.map((j) => {
              const isSelected = j.id === selectedJobId;
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
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        j.billGenerated
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {j.billGenerated ? 'Bill Ready' : 'Pending Bill'}
                    </span>
                  </div>
                  <p className="font-bold text-slate-100 mt-1">{j.customerName}</p>
                  <p className="text-slate-400 text-[11px]">{j.inverterBrand} ({j.inverterKva})</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Details: Bill Calculator */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          {activeJob ? (
            <form onSubmit={handleSaveBill} className="space-y-6">
              {/* Job Header Info */}
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400">Tracking ID:</span>
                  <p className="font-mono font-bold text-amber-400 text-sm">#{activeJob.trackingId}</p>
                </div>
                <div>
                  <span className="text-slate-400">Customer:</span>
                  <p className="font-bold text-white">{activeJob.customerName}</p>
                </div>
                <div>
                  <span className="text-slate-400">Mobile:</span>
                  <p className="font-bold text-white">{activeJob.mobileNo}</p>
                </div>
              </div>

              {/* 1. List of Consumed Inventories */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">
                  1. Replacement Parts Used (Auto-Calculated)
                </h4>
                <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700">
                  {activeJob.consumedInventory.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-2">
                      No spare parts used. (Labor / Service repair only)
                    </p>
                  ) : (
                    <div className="divide-y divide-slate-700 text-xs">
                      {activeJob.consumedInventory.map((item, idx) => (
                        <div key={idx} className="py-2 flex items-center justify-between text-slate-200">
                          <div>
                            <span className="font-semibold">{item.itemName}</span>
                            <span className="text-slate-400 text-[11px] ml-2">
                              (Rs. {item.unitPrice} × {item.qty})
                            </span>
                          </div>
                          <span className="font-mono font-bold text-amber-300">
                            Rs. {item.totalCost.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-700 text-xs font-bold flex justify-between text-slate-300">
                    <span>Total Parts Cost:</span>
                    <span className="font-mono text-emerald-400">Rs. {totalInventoryCost.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* 2. Service & Operational Charges Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">
                  2. Lab Repair Profit & Service Charges
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-amber-300 mb-1">
                      Bench Repairing Cost (Lab Profit) *
                    </label>
                    <input
                      type="number"
                      value={repairCost}
                      onChange={(e) => setRepairCost(Number(e.target.value))}
                      required
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono font-bold text-sm focus:ring-2 focus:ring-amber-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      * Represents actual labor profit for profit calculation.
                    </p>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Referral Share Cost (Rs.)</label>
                    <input
                      type="number"
                      value={referralCost}
                      onChange={(e) => setReferralCost(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Pick Up Cost (Rs.)</label>
                    <input
                      type="number"
                      value={pickupCost}
                      onChange={(e) => setPickupCost(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Delivery Charges (Rs.)</label>
                    <input
                      type="number"
                      value={deliveryCost}
                      onChange={(e) => setDeliveryCost(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Total Summary Box */}
              <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Calculated Grand Total</p>
                  <p className="text-xs text-slate-300">Parts + Repair + Referral + Pickup/Delivery</p>
                </div>
                <span className="text-2xl font-black font-mono text-amber-400">
                  Rs. {grandTotalCost.toLocaleString()}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleDowngrade}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-semibold"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  <span>Downgrade Status (Revert)</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPrintJob(activeJob);
                      setPrintDocumentType('bill');
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700"
                  >
                    <Printer className="w-4 h-4 text-amber-400" />
                    <span>Print Bill Slip</span>
                  </button>

                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-lg"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Generate & Lock Bill</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs">
              No completed job selected. Select a job from the left panel.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
