import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Job, AdditionalCostHead, ConsumedInventoryItem } from '../../types';
import { FileText, ArrowLeftRight, Printer, Share2, CheckCircle2, DollarSign, Plus, Trash2, Lock, Unlock, MessageSquare } from 'lucide-react';

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
    (j) => j.status === 'Repaired & Ready for Delivery' || j.billGenerated || j.status === 'Delivered & Paid'
  );

  const [selectedJobId, setSelectedJobId] = useState<string>(completedJobs[0]?.id || '');

  const activeJob = jobs.find((j) => j.id === selectedJobId);

  // Bill edit fields
  const [repairCost, setRepairCost] = useState<number>(activeJob ? activeJob.repairCost : 3500);
  const [referralCost, setReferralCost] = useState<number>(activeJob ? activeJob.referralCost : 1000);
  const [pickupCost, setPickupCost] = useState<number>(activeJob ? activeJob.pickupCost : 500);
  const [deliveryCost, setDeliveryCost] = useState<number>(activeJob ? activeJob.deliveryCost : 500);
  const [consumedItems, setConsumedItems] = useState<ConsumedInventoryItem[]>(activeJob ? activeJob.consumedInventory.map(i => ({...i})) : []);
  const [additionalCostHeads, setAdditionalCostHeads] = useState<AdditionalCostHead[]>(activeJob?.additionalCostHeads || []);
  const [repairRemarks, setRepairRemarks] = useState<string>(activeJob?.repairRemarks || '');
  const [isBillLocked, setIsBillLocked] = useState<boolean>(activeJob?.isBillLocked ?? activeJob?.billGenerated ?? false);

  // New cost head input states
  const [newCostName, setNewCostName] = useState<string>('');
  const [newCostAmount, setNewCostAmount] = useState<string>('');

  useEffect(() => {
    if (activeJob) {
      setRepairCost(activeJob.repairCost);
      setReferralCost(activeJob.referralCost);
      setPickupCost(activeJob.pickupCost);
      setDeliveryCost(activeJob.deliveryCost);
      setConsumedItems(activeJob.consumedInventory ? activeJob.consumedInventory.map(i => ({...i})) : []);
      setAdditionalCostHeads(activeJob.additionalCostHeads || []);
      setRepairRemarks(activeJob.repairRemarks || '');
      setIsBillLocked(activeJob.isBillLocked ?? activeJob.billGenerated ?? false);
    }
  }, [selectedJobId, activeJob]);

  const handleSelectJob = (id: string) => {
    setSelectedJobId(id);
  };

  const handleConsumedItemPriceChange = (index: number, newCost: number) => {
    setConsumedItems((prev) => {
      const updated = [...prev];
      const qty = updated[index].qty || 1;
      const validCost = isNaN(newCost) ? 0 : Math.max(0, newCost);
      updated[index] = {
        ...updated[index],
        totalCost: validCost,
        unitPrice: Math.round(validCost / qty),
      };
      return updated;
    });
  };

  const handleAddCostHead = () => {
    if (!newCostName.trim() || !newCostAmount || isNaN(Number(newCostAmount))) {
      alert('Please enter a valid cost head name and amount.');
      return;
    }
    const newHead: AdditionalCostHead = {
      id: `cost-${Date.now()}`,
      name: newCostName.trim(),
      amount: Number(newCostAmount),
    };
    setAdditionalCostHeads((prev) => [...prev, newHead]);
    setNewCostName('');
    setNewCostAmount('');
  };

  const handleRemoveCostHead = (id: string) => {
    setAdditionalCostHeads((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSaveBill = (e: React.FormEvent, shouldLock: boolean = true) => {
    e.preventDefault();
    if (!selectedJobId || !activeJob) return;

    generateBill(
      selectedJobId,
      Number(repairCost),
      Number(referralCost),
      Number(pickupCost),
      Number(deliveryCost),
      consumedItems,
      additionalCostHeads,
      repairRemarks,
      shouldLock
    );

    setIsBillLocked(shouldLock);
    alert(shouldLock ? 'Bill locked & generated successfully! Customer can now view it.' : 'Bill saved as draft (unlocked).');

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

  const totalInventoryCost = consumedItems.reduce((acc, i) => acc + (Number(i.totalCost) || 0), 0);
  const additionalCostsTotal = additionalCostHeads.reduce((acc, c) => acc + (Number(c.amount) || 0), 0);
  const grandTotalCost = (repairCost || 0) + (referralCost || 0) + (pickupCost || 0) + (deliveryCost || 0) + totalInventoryCost + additionalCostsTotal;

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
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    1. Replacement Parts Used (Editable Billed Cost)
                  </h4>
                  <span className="text-[11px] text-teal-400 font-normal">
                    Edits increase bill total & lab profit without altering inventory stock cost
                  </span>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700 space-y-2">
                  {consumedItems.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-2">
                      No spare parts used. (Labor / Service repair only)
                    </p>
                  ) : (
                    <div className="space-y-2 text-xs">
                      {consumedItems.map((item, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-800 rounded-lg border border-slate-700/80 flex items-center justify-between gap-3 text-slate-200">
                          <div>
                            <span className="font-semibold">{item.itemName}</span>
                            <span className="text-slate-400 text-[11px] ml-2">
                              (Qty: {item.qty})
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-400">Billed Amount (Rs.):</span>
                            <input
                              type="number"
                              value={item.totalCost}
                              onChange={(e) => handleConsumedItemPriceChange(idx, Number(e.target.value))}
                              className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-right font-mono font-bold text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                          </div>
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
                  2. Lab Repair Profit & Operational Service Charges
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

              {/* 3. Additional Custom Cost Heads */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center justify-between">
                  <span>3. Custom Additional Cost Heads</span>
                  <span className="text-[11px] text-teal-400 font-normal">Shown on customer bill</span>
                </h4>

                {/* List of existing cost heads */}
                {additionalCostHeads.length > 0 && (
                  <div className="space-y-2 bg-slate-800/40 p-3 rounded-xl border border-slate-700">
                    {additionalCostHeads.map((c) => (
                      <div key={c.id} className="flex items-center justify-between bg-slate-800 p-2.5 rounded-lg text-xs">
                        <span className="font-semibold text-slate-200">{c.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-amber-300">Rs. {c.amount.toLocaleString()}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCostHead(c.id)}
                            className="text-rose-400 hover:text-rose-300 cursor-pointer p-1"
                            title="Remove Cost Head"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new cost head inputs */}
                <div className="flex flex-col sm:flex-row items-center gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="Cost Head Name (e.g. Diagnostic Fee, Thermal Paste, Courier)"
                    value={newCostName}
                    onChange={(e) => setNewCostName(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-medium focus:ring-1 focus:ring-teal-500"
                  />
                  <input
                    type="number"
                    placeholder="Amount (Rs.)"
                    value={newCostAmount}
                    onChange={(e) => setNewCostAmount(e.target.value)}
                    className="w-full sm:w-32 bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono font-bold focus:ring-1 focus:ring-teal-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCostHead}
                    className="w-full sm:w-auto px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Head</span>
                  </button>
                </div>
              </div>

              {/* 4. Technician Repair Remarks for Customer */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-teal-400" />
                  <span>4. Repair Summary & Technician Remarks for Customer Bill</span>
                </h4>
                <textarea
                  rows={2}
                  value={repairRemarks}
                  onChange={(e) => setRepairRemarks(e.target.value)}
                  placeholder="Enter notes for customer (e.g., Replaced 4x power MOSFETs, replaced burnt thermal paste, calibrated 220V inverter output under 5kW load test)."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Total Summary & Bill Status Box */}
              <div className="bg-gradient-to-r from-amber-500/10 via-slate-800 to-teal-500/10 border border-amber-500/30 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Calculated Grand Total</p>
                    {isBillLocked ? (
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Lock className="w-3 h-3 text-emerald-400" />
                        <span>Locked for Customer</span>
                      </span>
                    ) : (
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Unlock className="w-3 h-3 text-amber-400" />
                        <span>Unlocked Draft</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Parts + Repair Labor + Referral + Pickup/Delivery + Additional Cost Heads</p>
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

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPrintJob(activeJob);
                      setPrintDocumentType('bill');
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-amber-400" />
                    <span>Print Bill Slip</span>
                  </button>

                  {isBillLocked ? (
                    <button
                      type="button"
                      onClick={(e) => handleSaveBill(e, false)}
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/50 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                    >
                      <Unlock className="w-4 h-4 text-amber-400" />
                      <span>Unlock Bill for Editing</span>
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={(e) => handleSaveBill(e, true)}
                    className="flex items-center gap-1.5 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-lg cursor-pointer transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save & Lock Customer Bill</span>
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
