import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ConfirmModal } from '../ConfirmModal';
import {
  Wallet,
  Building2,
  PlusCircle,
  ArrowRightLeft,
  Receipt,
  Trash2,
  Calendar,
  AlertCircle,
  Search,
  Filter,
  DollarSign,
  CheckCircle2,
} from 'lucide-react';

export const CashbookTab: React.FC = () => {
  const {
    transactions,
    expenseCategories,
    counterCashBalance,
    bankBalance,
    addExpense,
    transferCash,
    adjustCash,
    deleteTransaction,
    addExpenseCategory,
    currentUser,
  } = useApp();

  // Active view tab inside Cashbook
  const [activeSubTab, setActiveSubTab] = useState<'ledger' | 'expense' | 'transfer'>('ledger');
  const [txToDelete, setTxToDelete] = useState<{ id: string; remarks: string; amount: number } | null>(null);

  // Ledger Filter
  const [accountFilter, setAccountFilter] = useState<'all' | 'counter' | 'bank'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'inflow' | 'outflow' | 'transfer'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Form State: Add Expense
  const [expenseCategory, setExpenseCategory] = useState(expenseCategories[0]?.name || 'Electricity Bill');
  const [expenseAmount, setExpenseAmount] = useState<number | ''>('');
  const [expenseRemarks, setExpenseRemarks] = useState('');
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [showAddCategoryInput, setShowAddCategoryInput] = useState(false);
  const [expenseFeedback, setExpenseFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  // Form State: Transfer Cash
  const [transferFrom, setTransferFrom] = useState<'counter' | 'bank'>('counter');
  const [transferTo, setTransferTo] = useState<'counter' | 'bank'>('bank');
  const [transferAmount, setTransferAmount] = useState<number | ''>('');
  const [transferRemarks, setTransferRemarks] = useState('');

  // Form State: Adjust Cash
  const [adjustAccount, setAdjustAccount] = useState<'counter' | 'bank'>('counter');
  const [adjustAction, setAdjustAction] = useState<'add' | 'remove'>('add');
  const [adjustAmount, setAdjustAmount] = useState<number | ''>('');
  const [adjustRemarks, setAdjustRemarks] = useState('');

  // Handlers
  const handleRecordExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseAmount || Number(expenseAmount) <= 0) return;

    const res = addExpense(expenseCategory, Number(expenseAmount), expenseRemarks, expenseDate);
    if (!res.success) {
      setExpenseFeedback({ success: false, msg: res.error || 'Failed to record expense' });
    } else {
      setExpenseFeedback({ success: true, msg: 'Expense recorded successfully!' });
      setExpenseAmount('');
      setExpenseRemarks('');
    }
  };

  const handleAddNewCategory = () => {
    if (newCategoryInput.trim()) {
      addExpenseCategory(newCategoryInput.trim());
      setExpenseCategory(newCategoryInput.trim());
      setNewCategoryInput('');
      setShowAddCategoryInput(false);
    }
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferAmount || Number(transferAmount) <= 0) return;
    if (transferFrom === transferTo) {
      alert('From and To accounts cannot be identical.');
      return;
    }

    transferCash(transferFrom, transferTo, Number(transferAmount), transferRemarks || 'Counter/Bank Cash Transfer');
    alert('Cash transfer completed!');
    setTransferAmount('');
    setTransferRemarks('');
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustAmount || Number(adjustAmount) <= 0) return;

    adjustCash(adjustAccount, adjustAction, Number(adjustAmount), adjustRemarks || 'Manual Balance Adjustment');
    alert('Balance adjustment recorded!');
    setAdjustAmount('');
    setAdjustRemarks('');
  };

  // Filtered Ledger
  const filteredTxs = transactions.filter((tx) => {
    const matchesAccount =
      accountFilter === 'all' || tx.account === accountFilter || tx.toAccount === accountFilter;
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    const matchesSearch =
      tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.remarks.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.performedBy.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesAccount && matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-teal-50 text-[#008b9b] rounded-xl border border-teal-200">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900">Cashbook & Expense Register</h1>
              <p className="text-xs text-slate-500">
                Manage counter cash float, bank balances, shop expenses, and account transfers.
              </p>
            </div>
          </div>
        </div>

        {/* Account Balances Summary Badges */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-xs font-mono">
            <p className="text-[10px] text-slate-500 uppercase font-sans font-bold flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Counter Cash</span>
            </p>
            <p className="text-lg font-black text-emerald-700 mt-0.5">
              Rs. {counterCashBalance.toLocaleString()}
            </p>
          </div>

          {currentUser.role === 'super' && (
            <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-xs font-mono">
              <p className="text-[10px] text-slate-500 uppercase font-sans font-bold flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Bank Balance</span>
              </p>
              <p className="text-lg font-black text-amber-700 mt-0.5">
                Rs. {bankBalance.toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Internal Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 w-fit">
        <button
          onClick={() => setActiveSubTab('ledger')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'ledger'
              ? 'bg-[#008b9b] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Cash Ledger ({transactions.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('expense')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'expense'
              ? 'bg-[#008b9b] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>+ Record Shop Expense</span>
        </button>

        {currentUser.role === 'super' && (
          <button
            onClick={() => setActiveSubTab('transfer')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'transfer'
                ? 'bg-[#008b9b] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Transfers & Adjustments</span>
          </button>
        )}
      </div>

      {/* VIEW 1: CASH LEDGER */}
      {activeSubTab === 'ledger' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search Category or Remarks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008b9b]"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
              <select
                value={accountFilter}
                onChange={(e) => setAccountFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium"
              >
                <option value="all">All Accounts (Counter & Bank)</option>
                <option value="counter">Counter Cash Only</option>
                <option value="bank">Bank / Online Only</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium"
              >
                <option value="all">All Transaction Types</option>
                <option value="inflow">Inflows (Income)</option>
                <option value="outflow">Outflows (Expenses)</option>
                <option value="transfer">Transfers</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider bg-slate-50">
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">Account</th>
                  <th className="py-3 px-3">Category & Remarks</th>
                  <th className="py-3 px-3">Staff User</th>
                  <th className="py-3 px-3 text-right">Amount (Rs.)</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTxs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 italic">
                      No cash transactions recorded.
                    </td>
                  </tr>
                ) : (
                  filteredTxs.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">
                        {new Date(tx.date).toLocaleDateString()}{' '}
                        {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      <td className="py-3 px-3 font-bold uppercase text-[10px]">
                        <span
                          className={`px-2 py-0.5 rounded border ${
                            tx.account === 'counter'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-cyan-50 text-cyan-800 border-cyan-200'
                          }`}
                        >
                          {tx.account}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-900">{tx.category}</p>
                        <p className="text-[11px] text-slate-500">{tx.remarks}</p>
                      </td>

                      <td className="py-3 px-3 text-slate-700">{tx.performedBy}</td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-sm">
                        <span
                          className={
                            tx.type === 'inflow' || tx.type === 'adjustment'
                              ? 'text-emerald-700'
                              : tx.type === 'outflow'
                              ? 'text-rose-600'
                              : 'text-amber-700'
                          }
                        >
                          {tx.type === 'inflow' || tx.type === 'adjustment' ? '+' : '-'} Rs.{' '}
                          {tx.amount.toLocaleString()}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        {currentUser.role === 'super' && (
                          <button
                            onClick={() => setTxToDelete({ id: tx.id, remarks: tx.remarks, amount: tx.amount })}
                            className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: RECORD SHOP EXPENSE */}
      {activeSubTab === 'expense' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <Receipt className="w-5 h-5 text-[#008b9b]" />
            <h2 className="text-base font-bold text-slate-900">Record Shop Outflow / Expense</h2>
          </div>

          {expenseFeedback && (
            <div
              className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-between ${
                expenseFeedback.success
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              <span>{expenseFeedback.msg}</span>
              <button onClick={() => setExpenseFeedback(null)} className="cursor-pointer">×</button>
            </div>
          )}

          <form onSubmit={handleRecordExpense} className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">Expense Category *</label>
                <button
                  type="button"
                  onClick={() => setShowAddCategoryInput(!showAddCategoryInput)}
                  className="text-[#008b9b] hover:underline text-[11px] font-bold cursor-pointer"
                >
                  + Add New Category
                </button>
              </div>

              {showAddCategoryInput ? (
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="New Category Name"
                    value={newCategoryInput}
                    onChange={(e) => setNewCategoryInput(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewCategory}
                    className="px-3 py-2 bg-[#008b9b] text-white font-bold rounded-xl cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold"
                >
                  {expenseCategories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Amount (Rs.) *</label>
              <input
                type="number"
                required
                placeholder="e.g. 1500"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono font-bold text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Expense Date *</label>
              <input
                type="date"
                required
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono"
              />
              {currentUser.role === 'normal' && (
                <p className="text-[10px] text-amber-700 mt-1 font-medium">
                  * Desk managers can record expenses for TODAY ONLY.
                </p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Remarks / Note *</label>
              <textarea
                rows={2}
                required
                placeholder="e.g. Staff tea, shop rent portion, electricity bill receipt #"
                value={expenseRemarks}
                onChange={(e) => setExpenseRemarks(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-sm cursor-pointer transition-colors"
            >
              Confirm Expense Outflow
            </button>
          </form>
        </div>
      )}

      {/* VIEW 3: TRANSFERS & ADJUSTMENTS (SUPER ADMIN) */}
      {activeSubTab === 'transfer' && currentUser.role === 'super' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Transfer Cash Form */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <ArrowRightLeft className="w-5 h-5 text-[#008b9b]" />
              <h2 className="text-base font-bold text-slate-900">Transfer Cash (Counter ↔ Bank)</h2>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">From Account</label>
                  <select
                    value={transferFrom}
                    onChange={(e) => setTransferFrom(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold"
                  >
                    <option value="counter">Counter Cash</option>
                    <option value="bank">Bank Account</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">To Account</label>
                  <select
                    value={transferTo}
                    onChange={(e) => setTransferTo(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold"
                  >
                    <option value="bank">Bank Account</option>
                    <option value="counter">Counter Cash</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amount (Rs.) *</label>
                <input
                  type="number"
                  required
                  placeholder="Amount"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Transfer Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Deposited cash to HBL bank"
                  value={transferRemarks}
                  onChange={(e) => setTransferRemarks(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#008b9b] hover:bg-[#006673] text-white font-bold rounded-xl text-xs shadow-sm cursor-pointer transition-colors"
              >
                Execute Transfer
              </button>
            </form>
          </div>

          {/* Balance Adjustment Form */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <DollarSign className="w-5 h-5 text-cyan-600" />
              <h2 className="text-base font-bold text-slate-900">Manual Balance Adjustment</h2>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Account</label>
                  <select
                    value={adjustAccount}
                    onChange={(e) => setAdjustAccount(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold"
                  >
                    <option value="counter">Counter Float</option>
                    <option value="bank">Bank Account</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Action</label>
                  <select
                    value={adjustAction}
                    onChange={(e) => setAdjustAction(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold"
                  >
                    <option value="add">+ Deposit / Add Cash</option>
                    <option value="remove">- Withdraw / Remove</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amount (Rs.) *</label>
                <input
                  type="number"
                  required
                  placeholder="Amount"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Adjustment Reason *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Opening float sync, bank charge correction"
                  value={adjustRemarks}
                  onChange={(e) => setAdjustRemarks(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl text-xs shadow-sm cursor-pointer transition-colors"
              >
                Apply Adjustment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DELETE TRANSACTION CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={!!txToDelete}
        title="Delete Cashbook Entry"
        message={txToDelete ? `Are you sure you want to delete cashbook entry "${txToDelete.remarks}" (Rs. ${txToDelete.amount.toLocaleString()})?` : ''}
        confirmLabel="Delete Entry"
        onConfirm={() => {
          if (txToDelete) {
            deleteTransaction(txToDelete.id);
            setTxToDelete(null);
          }
        }}
        onCancel={() => setTxToDelete(null)}
      />
    </div>
  );
};
