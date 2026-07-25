import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Wallet, Building2, ArrowLeftRight, PlusCircle, Trash2, Calendar, Receipt } from 'lucide-react';

export const CashRegisterTab: React.FC = () => {
  const {
    currentUser,
    counterCashBalance,
    bankBalance,
    transactions,
    expenseCategories,
    addExpense,
    transferCash,
    adjustCash,
    deleteTransaction,
    addExpenseCategory,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'add_expense' | 'transfer' | 'adjust' | 'delete_tx' | 'categories'>('add_expense');

  // Expense Form State
  const [selectedCategory, setSelectedCategory] = useState<string>(expenseCategories[0]?.name || 'Electricity Bill');
  const [expenseAmount, setExpenseAmount] = useState<number>(500);
  const [expenseDate, setExpenseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expenseRemarks, setExpenseRemarks] = useState<string>('');
  const [expenseError, setExpenseError] = useState<string | null>(null);

  // Transfer Form State
  const [transferFrom, setTransferFrom] = useState<'counter' | 'bank'>('counter');
  const [transferTo, setTransferTo] = useState<'counter' | 'bank'>('bank');
  const [transferAmount, setTransferAmount] = useState<number>(5000);
  const [transferRemarks, setTransferRemarks] = useState<string>('');

  // Adjust Cash Form State
  const [adjustAccount, setAdjustAccount] = useState<'counter' | 'bank'>('counter');
  const [adjustType, setAdjustType] = useState<'add' | 'remove'>('add');
  const [adjustAmount, setAdjustAmount] = useState<number>(1000);
  const [adjustRemarks, setAdjustRemarks] = useState<string>('');

  // New Category State
  const [newCatName, setNewCatName] = useState<string>('');

  // Filter Transactions by Date
  const [filterStartDate, setFilterStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [filterEndDate, setFilterEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  const filteredTxs = transactions.filter((tx) => {
    const txDateOnly = tx.date.split('T')[0];
    return txDateOnly >= filterStartDate && txDateOnly <= filterEndDate;
  });

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    setExpenseError(null);

    const res = addExpense(selectedCategory, Number(expenseAmount), expenseRemarks, expenseDate);
    if (!res.success) {
      setExpenseError(res.error || 'Failed to add expense');
      return;
    }

    alert(`Expense of Rs. ${expenseAmount} added under ${selectedCategory}! Counter cash updated.`);
    setExpenseAmount(500);
    setExpenseRemarks('');
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (transferFrom === transferTo) {
      alert('Source and destination accounts cannot be the same!');
      return;
    }
    transferCash(transferFrom, transferTo, Number(transferAmount), transferRemarks);
    alert(`Transferred Rs. ${transferAmount} from ${transferFrom} to ${transferTo}!`);
    setTransferRemarks('');
  };

  const handleAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    adjustCash(adjustAccount, adjustType, Number(adjustAmount), adjustRemarks);
    alert(`Cash ${adjustType === 'add' ? 'added to' : 'removed from'} ${adjustAccount}!`);
    setAdjustRemarks('');
  };

  const handleAddCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    addExpenseCategory(newCatName);
    alert(`Category "${newCatName}" added!`);
    setNewCatName('');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Balances Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Counter Cash */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-amber-400" />
              <span>Cash on Counter</span>
            </span>
            <p className="text-3xl font-black font-mono text-amber-400 mt-2">
              Rs. {counterCashBalance.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Updated in real-time from payments & expenses</p>
          </div>
          <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center border border-amber-500/20">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        {/* Bank Account (Super User Access / Restricted View) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-cyan-400" />
              <span>Cash in Bank Accounts</span>
            </span>
            {currentUser.role === 'super' ? (
              <p className="text-3xl font-black font-mono text-cyan-400 mt-2">
                Rs. {bankBalance.toLocaleString()}
              </p>
            ) : (
              <p className="text-sm font-semibold text-slate-500 mt-3">
                [Restricted to Super User]
              </p>
            )}
            <p className="text-[11px] text-slate-400 mt-1">Online customer payments & bank transfers</p>
          </div>
          <div className="w-12 h-12 bg-cyan-500/10 text-cyan-400 rounded-2xl flex items-center justify-center border border-cyan-500/20">
            <Building2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Control Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4">
          <button
            onClick={() => setActiveSubTab('add_expense')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'add_expense' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Add Daily Expense
          </button>

          {currentUser.role === 'super' && (
            <>
              <button
                onClick={() => setActiveSubTab('transfer')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeSubTab === 'transfer' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                Transfer Cash (Bank ↔ Counter)
              </button>
              <button
                onClick={() => setActiveSubTab('adjust')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeSubTab === 'adjust' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                Add/Remove Cash Float
              </button>
              <button
                onClick={() => setActiveSubTab('delete_tx')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeSubTab === 'delete_tx' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                Delete Transactions (Reversal)
              </button>
              <button
                onClick={() => setActiveSubTab('categories')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeSubTab === 'categories' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                Expense Categories
              </button>
            </>
          )}
        </div>

        {/* SUBTAB 1: ADD EXPENSE */}
        {activeSubTab === 'add_expense' && (
          <form onSubmit={handleAddExpense} className="space-y-4 max-w-xl">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Record Daily Expense</h3>

            {expenseError && (
              <p className="text-xs text-rose-400 font-semibold bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                {expenseError}
              </p>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Expense Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                >
                  {expenseCategories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Amount (Rs.)</label>
                <input
                  type="number"
                  min="1"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(Number(e.target.value))}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">
                  Expense Date {currentUser.role === 'normal' && '(Restricted to Today Only)'}
                </label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  disabled={currentUser.role === 'normal'}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Remarks / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Electric bill July paid / Staff refreshment tea..."
                  value={expenseRemarks}
                  onChange={(e) => setExpenseRemarks(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg"
              >
                Record Expense & Deduct Counter Cash
              </button>
            </div>
          </form>
        )}

        {/* SUBTAB 2: TRANSFER CASH (Super User Only) */}
        {activeSubTab === 'transfer' && currentUser.role === 'super' && (
          <form onSubmit={handleTransfer} className="space-y-4 max-w-xl">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Transfer Cash Between Accounts
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Transfer From</label>
                <select
                  value={transferFrom}
                  onChange={(e) => setTransferFrom(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                >
                  <option value="counter">Counter Cash</option>
                  <option value="bank">Bank Account</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Transfer To</label>
                <select
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                >
                  <option value="bank">Bank Account</option>
                  <option value="counter">Counter Cash</option>
                </select>
              </div>
            </div>

            <div className="text-xs space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">Amount to Transfer (Rs.)</label>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(Number(e.target.value))}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Transfer Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Deposit daily counter cash into HBL Bank"
                  value={transferRemarks}
                  onChange={(e) => setTransferRemarks(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg"
              >
                Execute Transfer
              </button>
            </div>
          </form>
        )}

        {/* SUBTAB 3: ADJUST CASH (Super User Only) */}
        {activeSubTab === 'adjust' && currentUser.role === 'super' && (
          <form onSubmit={handleAdjust} className="space-y-4 max-w-xl">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Add / Remove Cash Float
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Target Account</label>
                <select
                  value={adjustAccount}
                  onChange={(e) => setAdjustAccount(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                >
                  <option value="counter">Counter Cash</option>
                  <option value="bank">Bank Account</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Adjustment Action</label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                >
                  <option value="add">Add Cash (+)</option>
                  <option value="remove">Remove Cash (-)</option>
                </select>
              </div>
            </div>

            <div className="text-xs space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">Amount (Rs.)</label>
                <input
                  type="number"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Number(e.target.value))}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Owner cash injection for Float / Owner personal draw..."
                  value={adjustRemarks}
                  onChange={(e) => setAdjustRemarks(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg"
              >
                Save Adjustment
              </button>
            </div>
          </form>
        )}

        {/* SUBTAB 4: DELETE TRANSACTION / REVERSAL (Super User Only - p.10) */}
        {activeSubTab === 'delete_tx' && currentUser.role === 'super' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Delete Cash Transactions & Auto-Reverse Account Balance (Super User)
            </h3>
            <p className="text-xs text-slate-400">
              Selecting and deleting a transaction removes its effect automatically from account balances.
            </p>

            <table className="w-full text-xs text-left text-slate-300 border border-slate-800 rounded-xl overflow-hidden">
              <thead className="bg-slate-800 text-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Category</th>
                  <th className="p-3">Account</th>
                  <th className="p-3">Remarks</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredTxs.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/50">
                    <td className="p-3 font-semibold text-white">{tx.category}</td>
                    <td className="p-3 text-slate-400 capitalize">{tx.account}</td>
                    <td className="p-3 text-slate-300">{tx.remarks}</td>
                    <td className="p-3 text-right font-mono font-bold text-amber-400">
                      Rs. {tx.amount.toLocaleString()}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete transaction "${tx.category} - Rs. ${tx.amount}"? Account balance will be reversed.`)) {
                            deleteTransaction(tx.id);
                          }
                        }}
                        className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded text-[11px] font-semibold"
                      >
                        Delete & Reverse
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* SUBTAB 5: EXPENSE CATEGORIES (Super User Only - p.9) */}
        {activeSubTab === 'categories' && currentUser.role === 'super' && (
          <div className="space-y-4 max-w-xl">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Manage Expense Categories
            </h3>
            <form onSubmit={handleAddCat} className="flex gap-2">
              <input
                type="text"
                placeholder="New Expense Category (e.g. Workshop Tools / Fuel)"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                required
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg"
              >
                Add Category
              </button>
            </form>

            <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700 text-xs space-y-1">
              <p className="font-bold text-slate-300 mb-2">Current Expense Categories:</p>
              {expenseCategories.map((c) => (
                <div key={c.id} className="p-2 bg-slate-900 rounded border border-slate-700 text-slate-200">
                  {c.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
