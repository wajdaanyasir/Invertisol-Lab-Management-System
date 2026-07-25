import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ConfirmModal } from '../ConfirmModal';
import { UnitOfIssue } from '../../types';
import { PackageCheck, Search, PlusCircle, Edit, Trash2, BarChart2, Calendar, Printer } from 'lucide-react';

export const ManageInventoryTab: React.FC = () => {
  const {
    currentUser,
    inventory,
    jobs,
    addInventoryStock,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    setPrintReportData,
    setPrintDocumentType,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'stock' | 'stock_report' | 'consumption_report'>('stock');
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);

  // Add Stock Quantity Modal / Form
  const [addQtyItemId, setAddQtyItemId] = useState<string>('');
  const [addQtyVal, setAddQtyVal] = useState<number>(10);

  // Super User New Item Form
  const [newItemName, setNewItemName] = useState('');
  const [newItemUnit, setNewItemUnit] = useState<UnitOfIssue>('Each');
  const [newItemPrice, setNewItemPrice] = useState<number>(100);
  const [newItemQty, setNewItemQty] = useState<number>(50);

  // Super User Edit Item State
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editUnit, setEditUnit] = useState<UnitOfIssue>('Each');

  // Consumption Report Date Filter
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalStockValue = inventory.reduce((sum, item) => sum + item.qtyInStock * item.unitPrice, 0);

  // Handle Stock Qty Addition
  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addQtyItemId || addQtyVal <= 0) return;
    addInventoryStock(addQtyItemId, Number(addQtyVal));
    alert(`Added ${addQtyVal} units to stock successfully!`);
    setAddQtyItemId('');
    setAddQtyVal(10);
  };

  // Handle Super User Create Item
  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName) return;
    createInventoryItem({
      name: newItemName,
      unitOfIssue: newItemUnit,
      qtyInStock: Number(newItemQty),
      unitPrice: Number(newItemPrice),
    });
    alert(`New item "${newItemName}" added to master inventory!`);
    setNewItemName('');
  };

  // Handle Edit Item
  const handleUpdateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItemId) return;
    updateInventoryItem(editingItemId, editName, editUnit);
    alert('Item updated successfully!');
    setEditingItemId(null);
  };

  // Compute Consumption Report Data across Jobs
  const consumedReportRecords: {
    trackingId: string;
    itemName: string;
    units: number;
    cost: number;
    date: string;
  }[] = [];

  jobs.forEach((job) => {
    if (job.createdDateOnly >= dateFrom && job.createdDateOnly <= dateTo) {
      job.consumedInventory.forEach((ci) => {
        consumedReportRecords.push({
          trackingId: job.trackingId,
          itemName: ci.itemName,
          units: ci.qty,
          cost: ci.totalCost,
          date: job.createdDateOnly,
        });
      });
    }
  });

  const totalConsumptionCost = consumedReportRecords.reduce((sum, r) => sum + r.cost, 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white text-slate-900 p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <PackageCheck className="w-6 h-6 text-[#008b9b]" />
            <h2 className="text-xl font-black tracking-tight">Inventory & Stock Master</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track spare parts stock, unit of issue, value valuation, and consumption reports.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setSelectedTab('stock')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              selectedTab === 'stock' ? 'bg-[#008b9b] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Stock List
          </button>
          <button
            onClick={() => setSelectedTab('stock_report')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              selectedTab === 'stock_report' ? 'bg-[#008b9b] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Stock Valuation Report
          </button>
          <button
            onClick={() => setSelectedTab('consumption_report')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              selectedTab === 'consumption_report'
                ? 'bg-[#008b9b] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Consumption Report
          </button>
        </div>
      </div>

      {/* VIEW 1: MAIN STOCK LIST & EDIT CONTROLS */}
      {selectedTab === 'stock' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Inventory Items Table */}
          <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search item name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-[#008b9b]"
                />
              </div>
              <span className="text-xs text-slate-600 font-mono font-bold whitespace-nowrap">
                Total Value: <span className="text-[#008b9b] font-black">Rs. {totalStockValue.toLocaleString()}</span>
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3">Item Name</th>
                    <th className="p-3">Unit of Issue</th>
                    <th className="p-3 text-center">Qty in Stock</th>
                    <th className="p-3 text-right">Unit Price</th>
                    {currentUser.role === 'super' && <th className="p-3 text-center">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInventory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-semibold text-slate-900">{item.name}</td>
                      <td className="p-3 text-slate-500 font-medium">{item.unitOfIssue}</td>
                      <td className="p-3 text-center font-bold font-mono">
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${
                            item.qtyInStock < 10 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-emerald-800 border border-slate-200'
                          }`}
                        >
                          {item.qtyInStock}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-[#008b9b]">
                        Rs. {item.unitPrice.toLocaleString()}
                      </td>
                      {currentUser.role === 'super' && (
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setEditingItemId(item.id);
                                setEditName(item.name);
                                setEditUnit(item.unitOfIssue);
                              }}
                              className="p-1 text-slate-400 hover:text-amber-600 cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setItemToDelete({ id: item.id, name: item.name })}
                              className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Col: Add Stock (Normal & Super) / Super User Add Item */}
          <div className="space-y-6">
            {/* Form A: Add Stock Qty (All Users) */}
            <form onSubmit={handleAddStock} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
                <PlusCircle className="w-4 h-4 text-[#008b9b]" />
                <span>Add Stock Quantity</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Select Inventory Item</label>
                  <select
                    value={addQtyItemId}
                    onChange={(e) => setAddQtyItemId(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900"
                  >
                    <option value="">-- Choose Item --</option>
                    {inventory.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name} (Current: {i.qtyInStock})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Quantity to Add</label>
                  <input
                    type="number"
                    min="1"
                    value={addQtyVal}
                    onChange={(e) => setAddQtyVal(Number(e.target.value))}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 font-mono font-bold"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#008b9b] hover:bg-[#006673] text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer transition-colors"
                >
                  Update Stock Level
                </button>
              </div>
            </form>

            {/* Form B: Super User Add New Master Item */}
            {currentUser.role === 'super' && (
              <form onSubmit={handleCreateItem} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-[#008b9b] uppercase tracking-wider border-b border-slate-200 pb-2">
                  Create New Master Item (Super User Only)
                </h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-700 mb-1 font-semibold">Item Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Igbt Power Transistor 60N60"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1 font-semibold">Unit of Issue *</label>
                    <select
                      value={newItemUnit}
                      onChange={(e) => setNewItemUnit(e.target.value as UnitOfIssue)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900"
                    >
                      <option value="Each">Each</option>
                      <option value="By Weight (kg)">By Weight (kg)</option>
                      <option value="By Length (meter)">By Length (meter)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-700 mb-1 font-semibold">Unit Price (Rs.)</label>
                      <input
                        type="number"
                        value={newItemPrice}
                        onChange={(e) => setNewItemPrice(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 mb-1 font-semibold">Initial Qty</label>
                      <input
                        type="number"
                        value={newItemQty}
                        onChange={(e) => setNewItemQty(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 cursor-pointer transition-colors"
                  >
                    Add Master Item
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: STOCK VALUATION REPORT (p.16) */}
      {selectedTab === 'stock_report' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Inventory Stock Valuation Report</h3>
              <p className="text-xs text-slate-500">Date: {new Date().toLocaleDateString()}</p>
            </div>
            <div className="bg-teal-50 text-[#008b9b] px-4 py-2 rounded-xl border border-teal-200 text-xs font-mono font-bold">
              Total Stocks Available: Rs. {totalStockValue.toLocaleString()}
            </div>
          </div>

          <table className="w-full text-xs text-left text-slate-700 border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3">Item Name</th>
                <th className="p-3 text-center">Unit of Issue</th>
                <th className="p-3 text-center">Qty in Stock</th>
                <th className="p-3 text-right">Price Per Unit</th>
                <th className="p-3 text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inventory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80">
                  <td className="p-3 font-semibold text-slate-900">{item.name}</td>
                  <td className="p-3 text-center text-slate-500">{item.unitOfIssue}</td>
                  <td className="p-3 text-center font-mono font-bold">{item.qtyInStock}</td>
                  <td className="p-3 text-right font-mono">Rs. {item.unitPrice.toLocaleString()}</td>
                  <td className="p-3 text-right font-mono font-bold text-[#008b9b]">
                    Rs. {(item.qtyInStock * item.unitPrice).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
              <tr>
                <td colSpan={4} className="p-3 text-right uppercase text-slate-700">Total Available Valuation:</td>
                <td className="p-3 text-right font-mono text-[#008b9b] text-sm font-black">
                  Rs. {totalStockValue.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                setPrintReportData({
                  reportType: 'stock_report',
                  title: 'Inventory Stock Valuation Report',
                  subtitle: `Date: ${new Date().toLocaleDateString()}`,
                  stockReport: {
                    totalStockValue,
                    items: inventory.map((i) => ({
                      name: i.name,
                      unitOfIssue: i.unitOfIssue,
                      qtyInStock: i.qtyInStock,
                      unitPrice: i.unitPrice,
                      totalAmount: i.qtyInStock * i.unitPrice,
                    })),
                  },
                });
                setPrintDocumentType('stock_report');
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#008b9b] hover:bg-[#006673] text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF Stock Report</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW 3: INVENTORY CONSUMPTION REPORT WITH DATE RANGE (p.16) */}
      {selectedTab === 'consumption_report' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Inventory Consumption Report</h3>
              <p className="text-xs text-slate-500">Track spare parts consumed across repair jobs by date range.</p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200">
                <Calendar className="w-4 h-4 text-[#008b9b]" />
                <span className="text-slate-600 font-medium">From:</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-900 rounded px-2 py-0.5 font-mono"
                />
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200">
                <Calendar className="w-4 h-4 text-[#008b9b]" />
                <span className="text-slate-600 font-medium">To:</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-900 rounded px-2 py-0.5 font-mono"
                />
              </div>
            </div>
          </div>

          <table className="w-full text-xs text-left text-slate-700 border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3">Tracking ID</th>
                <th className="p-3">Item Name</th>
                <th className="p-3 text-center">Units Consumed</th>
                <th className="p-3 text-right">Cost</th>
                <th className="p-3 text-center">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {consumedReportRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400 italic">
                    No inventory consumed in selected date range.
                  </td>
                </tr>
              ) : (
                consumedReportRecords.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="p-3 font-mono font-bold text-[#008b9b]">#{r.trackingId}</td>
                    <td className="p-3 font-medium text-slate-900">{r.itemName}</td>
                    <td className="p-3 text-center font-mono font-bold text-slate-800">{r.units}</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-700">
                      Rs. {r.cost.toLocaleString()}
                    </td>
                    <td className="p-3 text-center font-mono text-slate-500">{r.date}</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
              <tr>
                <td colSpan={3} className="p-3 text-right uppercase text-slate-700">Total Consumption:</td>
                <td className="p-3 text-right font-mono text-[#008b9b] text-sm font-black">
                  Rs. {totalConsumptionCost.toLocaleString()}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                setPrintReportData({
                  reportType: 'consumption_report',
                  title: 'Inventory Consumption Report',
                  periodLabel: `Period: ${dateFrom} to ${dateTo}`,
                  consumptionReport: {
                    dateFrom,
                    dateTo,
                    totalCost: totalConsumptionCost,
                    records: consumedReportRecords,
                  },
                });
                setPrintDocumentType('consumption_report');
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#008b9b] hover:bg-[#006673] text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF Consumption Report</span>
            </button>
          </div>
        </div>
      )}

      {/* DELETE INVENTORY ITEM CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={!!itemToDelete}
        title="Delete Inventory Item"
        message={itemToDelete ? `Are you sure you want to delete inventory item "${itemToDelete.name}"? This item will be permanently removed from stock list.` : ''}
        confirmLabel="Delete Item"
        onConfirm={() => {
          if (itemToDelete) {
            deleteInventoryItem(itemToDelete.id);
            setItemToDelete(null);
          }
        }}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};
