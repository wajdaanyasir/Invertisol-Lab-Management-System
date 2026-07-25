import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Landmark, Smartphone, PlusCircle, Trash2 } from 'lucide-react';

export const ManageAccountsTab: React.FC = () => {
  const { wallets, banks, addWallet, deleteWallet, addBank, deleteBank } = useApp();

  // Wallet Form
  const [walletName, setWalletName] = useState('JazzCash');
  const [walletNumber, setWalletNumber] = useState('');
  const [walletHolder, setWalletHolder] = useState('');

  // Bank Form
  const [bankName, setBankName] = useState('Habib Bank Limited (HBL)');
  const [bankNumber, setBankNumber] = useState('');
  const [bankIban, setBankIban] = useState('');
  const [bankHolder, setBankHolder] = useState('');

  const handleAddWallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletNumber || !walletHolder) return;
    addWallet({
      walletName,
      accountNumber: walletNumber,
      accountHolderName: walletHolder,
    });
    alert(`Mobile wallet ${walletName} added!`);
    setWalletNumber('');
    setWalletHolder('');
  };

  const handleAddBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankNumber || !bankHolder) return;
    addBank({
      bankName,
      accountNumber: bankNumber,
      ibanNo: bankIban,
      accountHolderName: bankHolder,
    });
    alert(`Bank account ${bankName} added!`);
    setBankNumber('');
    setBankIban('');
    setBankHolder('');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Landmark className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-bold tracking-tight">Manage Mobile Wallets & Bank Accounts</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Super user configuration for online payment deposit options displayed to customers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section A: Mobile Wallets */}
        <div className="space-y-6">
          <form onSubmit={handleAddWallet} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Smartphone className="w-4 h-4 text-amber-400" />
              <span>Add Mobile Wallet Account</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Wallet Provider Name</label>
                <input
                  type="text"
                  placeholder="e.g. JazzCash / EasyPaisa / NayaPay"
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Account / Mobile Number *</label>
                <input
                  type="text"
                  placeholder="e.g. 0345-5390396"
                  value={walletNumber}
                  onChange={(e) => setWalletNumber(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Account Holder Name *</label>
                <input
                  type="text"
                  placeholder="e.g. YASIR MEHMOOD"
                  value={walletHolder}
                  onChange={(e) => setWalletHolder(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-md"
              >
                Save Mobile Wallet
              </button>
            </div>
          </form>

          {/* Active Wallets List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Active Mobile Wallets</h4>
            <div className="space-y-2 text-xs">
              {wallets.map((w) => (
                <div key={w.id} className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-amber-400">{w.walletName}</p>
                    <p className="font-mono text-white text-xs">{w.accountNumber}</p>
                    <p className="text-slate-400 text-[11px] font-medium">{w.accountHolderName}</p>
                  </div>
                  <button
                    onClick={() => deleteWallet(w.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section B: Bank Accounts */}
        <div className="space-y-6">
          <form onSubmit={handleAddBank} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Landmark className="w-4 h-4 text-cyan-400" />
              <span>Add Commercial Bank Account</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Bank Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Habib Bank Limited / Meezan Bank"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Account Number *</label>
                <input
                  type="text"
                  placeholder="e.g. 120079008564885"
                  value={bankNumber}
                  onChange={(e) => setBankNumber(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">IBAN Number</label>
                <input
                  type="text"
                  placeholder="e.g. PAK 00HAB 120079008564885"
                  value={bankIban}
                  onChange={(e) => setBankIban(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Account Holder Name *</label>
                <input
                  type="text"
                  placeholder="e.g. YASIR MEHMOOD"
                  value={bankHolder}
                  onChange={(e) => setBankHolder(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-md"
              >
                Save Bank Account
              </button>
            </div>
          </form>

          {/* Active Bank Accounts List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Active Bank Accounts</h4>
            <div className="space-y-2 text-xs">
              {banks.map((b) => (
                <div key={b.id} className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-cyan-300">{b.bankName}</p>
                    <p className="font-mono text-white text-xs">{b.accountNumber}</p>
                    {b.ibanNo && <p className="font-mono text-slate-400 text-[10px]">{b.ibanNo}</p>}
                    <p className="text-slate-400 text-[11px] font-medium">{b.accountHolderName}</p>
                  </div>
                  <button
                    onClick={() => deleteBank(b.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
