import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sliders, CheckCircle2 } from 'lucide-react';

export const ScheduleChargesTab: React.FC = () => {
  const { scheduleCharges, updateScheduleCharges } = useApp();

  const [chargeType, setChargeType] = useState<'pickup' | 'delivery' | 'referral'>('pickup');
  const [newAmount, setNewAmount] = useState<number>(scheduleCharges.pickupCharges);

  const handleTypeChange = (type: 'pickup' | 'delivery' | 'referral') => {
    setChargeType(type);
    if (type === 'pickup') setNewAmount(scheduleCharges.pickupCharges);
    if (type === 'delivery') setNewAmount(scheduleCharges.deliveryCharges);
    if (type === 'referral') setNewAmount(scheduleCharges.defaultReferralShare);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    let updated = { ...scheduleCharges };
    if (chargeType === 'pickup') updated.pickupCharges = Number(newAmount);
    if (chargeType === 'delivery') updated.deliveryCharges = Number(newAmount);
    if (chargeType === 'referral') updated.defaultReferralShare = Number(newAmount);

    updateScheduleCharges(updated);
    alert('Default schedule charges updated successfully!');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-bold tracking-tight">Schedule Default Service Charges</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Set lab default rates for Inverter Pickup, Delivery, and Franchise Referral Commission.
          </p>
        </div>
      </div>

      <form onSubmit={handleUpdate} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 text-xs">
        <div>
          <label className="block text-slate-300 font-bold mb-2 uppercase tracking-wider">Select Charge Category</label>
          <select
            value={chargeType}
            onChange={(e) => handleTypeChange(e.target.value as any)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white font-bold"
          >
            <option value="pickup">Pick Up Charges (Default Home Pickup Rate)</option>
            <option value="delivery">Delivery Charges (Default Return Delivery Rate)</option>
            <option value="referral">Referral Share Commission (Paid to Franchises per Job)</option>
          </select>
        </div>

        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 flex items-center justify-between">
          <div>
            <span className="text-slate-400">Current Standard Rate:</span>
            <p className="text-xl font-black font-mono text-amber-400 mt-1">
              Rs.{' '}
              {chargeType === 'pickup' && scheduleCharges.pickupCharges.toLocaleString()}
              {chargeType === 'delivery' && scheduleCharges.deliveryCharges.toLocaleString()}
              {chargeType === 'referral' && scheduleCharges.defaultReferralShare.toLocaleString()}
            </p>
          </div>
          <span className="text-[11px] text-slate-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-700">
            Auto-populated in new job bills
          </span>
        </div>

        <div>
          <label className="block text-slate-300 font-bold mb-1">Enter New Charge Amount (Rs.) *</label>
          <input
            type="number"
            min="0"
            value={newAmount}
            onChange={(e) => setNewAmount(Number(e.target.value))}
            required
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white font-mono font-bold text-sm focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg"
        >
          Update Rate Settings
        </button>
      </form>
    </div>
  );
};
