import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BarChart3, Calendar, ChevronLeft, ChevronRight, Printer, Share2, TrendingUp, DollarSign } from 'lucide-react';

export const ReportsTab: React.FC = () => {
  const { jobs, transactions, setPrintReportData, setPrintDocumentType } = useApp();

  const [activeReportTab, setActiveReportTab] = useState<'profit_sheet' | 'day_progress'>('profit_sheet');

  // Month Selection State
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${mm}`;
  });

  // Day Wise Date State
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Compute Monthly Profit Sheet Data
  const monthlyJobs = jobs.filter((j) => j.createdDateOnly.startsWith(selectedMonth));

  const completedProjectsCount = monthlyJobs.filter((j) => j.paymentConfirmed).length;
  const cashPaymentsTotal = monthlyJobs.reduce((acc, j) => acc + j.cashPaid, 0);
  const onlinePaymentsTotal = monthlyJobs.reduce((acc, j) => acc + j.onlinePaid, 0);
  const totalCashReceived = cashPaymentsTotal + onlinePaymentsTotal;

  // Repairing Cost Revenue = Actual labor service profit
  const totalRepairingCostRevenue = monthlyJobs.reduce((acc, j) => acc + j.repairCost, 0);

  // Compute Expenses in selected month from Transactions
  const monthlyExpenses = transactions.filter(
    (tx) => tx.type === 'outflow' && tx.date.startsWith(selectedMonth)
  );

  const salariesTotal = monthlyExpenses
    .filter((tx) => tx.category.toLowerCase().includes('salary'))
    .reduce((sum, tx) => sum + tx.amount, 0);

  const billsTotal = monthlyExpenses
    .filter((tx) => tx.category.toLowerCase().includes('bill') || tx.category.toLowerCase().includes('electricity'))
    .reduce((sum, tx) => sum + tx.amount, 0);

  const deliveryChargesTotal = monthlyJobs.reduce((acc, j) => acc + j.pickupCost + j.deliveryCost, 0);
  const inventoryCostTotal = monthlyJobs.reduce((acc, j) => acc + j.totalInventoryCost, 0);

  const otherExpensesTotal = monthlyExpenses
    .filter(
      (tx) =>
        !tx.category.toLowerCase().includes('salary') &&
        !tx.category.toLowerCase().includes('bill') &&
        !tx.category.toLowerCase().includes('electricity')
    )
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpensesSum = salariesTotal + billsTotal + deliveryChargesTotal + inventoryCostTotal + otherExpensesTotal;
  const netCalculatedProfit = totalRepairingCostRevenue - totalExpensesSum;

  // Compute Day Wise Progress Metrics
  const dayJobs = jobs.filter((j) => j.createdDateOnly === selectedDate);
  const newProjectsCount = dayJobs.length;
  const dayCompletedCount = dayJobs.filter((j) => j.status === 'Delivered & Paid' || j.status === 'Repaired & Ready for Delivery').length;
  const dayUnderMaintenanceCount = dayJobs.filter((j) => j.status === 'Under Maintenance').length;
  const dayAwaitingPartsCount = dayJobs.filter((j) => j.status === 'Awaiting Parts').length;

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white text-slate-900 p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#008b9b]" />
            <h2 className="text-xl font-black tracking-tight">Executive Reports & Business Progress</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time Profit & Loss statement, day-wise maintenance progress, and financial analytics.
          </p>
        </div>

        {/* Report Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveReportTab('profit_sheet')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeReportTab === 'profit_sheet' ? 'bg-[#008b9b] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Profit Sheet by Month
          </button>
          <button
            onClick={() => setActiveReportTab('day_progress')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeReportTab === 'day_progress' ? 'bg-[#008b9b] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Day Wise Progress
          </button>
        </div>
      </div>

      {/* REPORT TYPE 1: PROFIT SHEET BY MONTH (p.13, 14) */}
      {activeReportTab === 'profit_sheet' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Monthly Profit / Loss Sheet
              </h3>
              <p className="text-xs text-slate-500">
                Formula: Repairing Labor Revenue minus Operational Expenses = Net Lab Profit.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 font-semibold">Select Month:</span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-slate-50 text-slate-900 rounded-lg px-3 py-1.5 text-xs font-mono font-bold border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#008b9b]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Box */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-emerald-700 uppercase tracking-wider">
                  Revenue Overview ({monthlyJobs.length} Projects)
                </span>
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono text-[10px] border border-emerald-200 font-bold">
                  Completed: {completedProjectsCount}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-slate-700">
                  <span>Cash Payments Received:</span>
                  <span className="font-mono font-bold">Rs. {cashPaymentsTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Online Payments Received:</span>
                  <span className="font-mono font-bold">Rs. {onlinePaymentsTotal.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-amber-700">
                  <span>Total Cash Collections:</span>
                  <span className="font-mono">Rs. {totalCashReceived.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-emerald-800">
                  <span>Bench Repair Service Revenue (Profit Component):</span>
                  <span className="font-mono text-sm">Rs. {totalRepairingCostRevenue.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Expenses Box */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 text-xs">
              <div className="border-b border-slate-200 pb-2">
                <span className="font-bold text-rose-700 uppercase tracking-wider">
                  Operational Expenses Breakdown
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-slate-700">
                  <span>Salaries & Staff Wages:</span>
                  <span className="font-mono font-bold">Rs. {salariesTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Electricity & Utility Bills:</span>
                  <span className="font-mono font-bold">Rs. {billsTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Delivery & Logistics Charges:</span>
                  <span className="font-mono font-bold">Rs. {deliveryChargesTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Inventory Consumed Parts Cost:</span>
                  <span className="font-mono font-bold">Rs. {inventoryCostTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Other Miscellaneous Expenses:</span>
                  <span className="font-mono font-bold">Rs. {otherExpensesTotal.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-rose-700">
                  <span>Total Expenses:</span>
                  <span className="font-mono">Rs. {totalExpensesSum.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Calculated Net Profit Banner (p.13 Fix) */}
          <div className="bg-teal-50/80 border border-teal-200 p-6 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#008b9b] uppercase tracking-wider">Calculated Net Lab Profit</p>
              <p className="text-xs text-slate-600 mt-1">
                Net Profit = Repair Labor Revenue (Rs. {totalRepairingCostRevenue.toLocaleString()}) - Total Expenses (Rs. {totalExpensesSum.toLocaleString()})
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black font-mono text-[#008b9b]">
                Rs. {netCalculatedProfit.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => {
                setPrintReportData({
                  reportType: 'profit_report',
                  title: 'Monthly Profit / Loss Statement',
                  periodLabel: `Month: ${selectedMonth}`,
                  profitReport: {
                    month: selectedMonth,
                    monthlyJobsCount: monthlyJobs.length,
                    completedProjectsCount,
                    cashPaymentsTotal,
                    onlinePaymentsTotal,
                    totalCashReceived,
                    totalRepairingCostRevenue,
                    salariesTotal,
                    billsTotal,
                    deliveryChargesTotal,
                    inventoryCostTotal,
                    otherExpensesTotal,
                    totalExpensesSum,
                    netCalculatedProfit,
                  },
                });
                setPrintDocumentType('profit_report');
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#008b9b] hover:bg-[#006673] text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF Profit Report</span>
            </button>
          </div>
        </div>
      )}

      {/* REPORT TYPE 2: DAY WISE PROGRESS (p.13) */}
      {activeReportTab === 'day_progress' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-6 max-w-2xl mx-auto text-center">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Day Wise Maintenance Progress</h3>
            <p className="text-xs text-slate-500 mt-1">
              Click Next or Previous to inspect job progress breakdown for any date.
            </p>
          </div>

          {/* Date Selector with Nav Buttons */}
          <div className="flex items-center justify-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <button
              onClick={handlePrevDay}
              className="p-2 bg-white hover:bg-slate-100 text-[#008b9b] border border-slate-200 rounded-xl transition-colors font-bold flex items-center gap-1 text-xs cursor-pointer shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
              <Calendar className="w-4 h-4 text-[#008b9b]" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-slate-900 font-mono font-bold text-sm focus:outline-none"
              />
            </div>

            <button
              onClick={handleNextDay}
              className="p-2 bg-white hover:bg-slate-100 text-[#008b9b] border border-slate-200 rounded-xl transition-colors font-bold flex items-center gap-1 text-xs cursor-pointer shadow-sm"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Cards Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs pt-2">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="text-left">
                <p className="text-slate-500 font-medium">New Projects</p>
                <p className="text-2xl font-black font-mono text-cyan-700 mt-1">{newProjectsCount}</p>
              </div>
              <div className="w-10 h-10 bg-cyan-100 text-cyan-800 rounded-xl flex items-center justify-center border border-cyan-200 font-black">
                01
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="text-left">
                <p className="text-slate-500 font-medium">Completed Jobs</p>
                <p className="text-2xl font-black font-mono text-emerald-700 mt-1">{dayCompletedCount}</p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center border border-emerald-200 font-black">
                02
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="text-left">
                <p className="text-slate-500 font-medium">Under Maintenance</p>
                <p className="text-2xl font-black font-mono text-amber-700 mt-1">{dayUnderMaintenanceCount}</p>
              </div>
              <div className="w-10 h-10 bg-amber-100 text-amber-800 rounded-xl flex items-center justify-center border border-amber-200 font-black">
                03
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="text-left">
                <p className="text-slate-500 font-medium">Awaiting Parts</p>
                <p className="text-2xl font-black font-mono text-rose-700 mt-1">{dayAwaitingPartsCount}</p>
              </div>
              <div className="w-10 h-10 bg-rose-100 text-rose-800 rounded-xl flex items-center justify-center border border-rose-200 font-black">
                04
              </div>
            </div>
          </div>

          {/* Day Progress Print Action */}
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={() => {
                setPrintReportData({
                  reportType: 'day_progress',
                  title: 'Day Wise Maintenance Progress Report',
                  periodLabel: `Date: ${selectedDate}`,
                  dayProgressReport: {
                    date: selectedDate,
                    newProjectsCount,
                    dayCompletedCount,
                    dayUnderMaintenanceCount,
                    dayAwaitingPartsCount,
                    dayJobs: dayJobs.map((j) => ({
                      trackingId: j.trackingId,
                      customerName: j.customerName,
                      inverterBrand: `${j.inverterBrand} (${j.inverterKva})`,
                      status: j.status,
                      approximateCost: j.approximateCost,
                    })),
                  },
                });
                setPrintDocumentType('day_progress');
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#008b9b] hover:bg-[#006673] text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF Day Report</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
