import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ConfirmModal } from '../ConfirmModal';
import { Job, JobStatus, ConsumedInventoryItem, AdditionalCostHead } from '../../types';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  RefreshCw,
  FileText,
  CreditCard,
  Printer,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  X,
  User,
  Phone,
  MapPin,
  Package,
  Zap,
  ArrowLeftRight,
  Camera,
  MessageSquare,
  Edit3,
} from 'lucide-react';

export const JobsHubTab: React.FC = () => {
  const {
    jobs,
    inventory,
    franchises,
    addJob,
    updateJobStatus,
    generateBill,
    confirmPayment,
    downgradeJobStatus,
    deleteJob,
    setSelectedPrintJob,
    setPrintDocumentType,
    currentUser,
  } = useApp();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeModalJob, setActiveModalJob] = useState<Job | null>(null);
  const [activeModalType, setActiveModalType] = useState<'status' | 'bill' | 'payment' | null>(null);

  // --- Form States for Add Job Modal ---
  const [addCustomerName, setAddCustomerName] = useState('');
  const [addMobileNo, setAddMobileNo] = useState('');
  const [addAddress, setAddAddress] = useState('');
  const [addBrand, setAddBrand] = useState('Inverex Nitrox');
  const [addKva, setAddKva] = useState('5.0 kVA');
  const [addIssue, setAddIssue] = useState('');
  const [addLab, setAddLab] = useState('Islamabad Central Lab');
  const [addEstDate, setAddEstDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [addCost, setAddCost] = useState<number>(6500);
  const [addReferral, setAddReferral] = useState('');

  // --- Status Update Modal Form State ---
  const [updateStatus, setUpdateStatus] = useState<JobStatus>('Under Maintenance');
  const [updateRemarks, setUpdateRemarks] = useState('');
  const [selectedPartId, setSelectedPartId] = useState('');
  const [selectedPartQty, setSelectedPartQty] = useState<number>(1);
  const [partsToDeduct, setPartsToDeduct] = useState<{ itemId: string; qty: number }[]>([]);
  const [techName, setTechName] = useState('');
  const [techPhone, setTechPhone] = useState('');
  const [techRemarks, setTechRemarks] = useState('');

  // --- Bill Generator Modal State ---
  const [billRepairCost, setBillRepairCost] = useState<number>(3500);
  const [billReferralCost, setBillReferralCost] = useState<number>(1000);
  const [billPickupCost, setBillPickupCost] = useState<number>(500);
  const [billDeliveryCost, setBillDeliveryCost] = useState<number>(500);
  const [billConsumedInventory, setBillConsumedInventory] = useState<ConsumedInventoryItem[]>([]);
  const [billAdditionalCostHeads, setBillAdditionalCostHeads] = useState<AdditionalCostHead[]>([]);
  const [newHeadName, setNewHeadName] = useState<string>('');
  const [newHeadAmount, setNewHeadAmount] = useState<string>('');
  const [billRepairRemarks, setBillRepairRemarks] = useState<string>('');

  // --- Confirm Payment Modal State ---
  const [payDiscount, setPayDiscount] = useState<number>(0);
  const [payCash, setPayCash] = useState<number>(0);
  const [payOnline, setPayOnline] = useState<number>(0);
  const [payScreenshot, setPayScreenshot] = useState<string>('');
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // --- Filtered Jobs List ---
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.trackingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.mobileNo.includes(searchTerm) ||
      job.inverterBrand.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'in_maintenance') {
      return (
        job.status === 'Received and Awaiting Maintenance' ||
        job.status === 'Under Maintenance' ||
        job.status === 'Awaiting Parts' ||
        job.status === 'Repaired under Test'
      );
    }
    if (statusFilter === 'ready_bill') {
      return job.status === 'Repaired & Ready for Delivery' && !job.billGenerated;
    }
    if (statusFilter === 'awaiting_payment') {
      return job.billGenerated && !job.paymentConfirmed;
    }
    if (statusFilter === 'delivered') {
      return job.status === 'Delivered & Paid';
    }
    return job.status === statusFilter;
  });

  // Handle Submit New Job
  const handleRegisterJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addCustomerName || !addMobileNo || !addBrand) {
      alert('Please enter Customer Name, Mobile Number, and Inverter Brand.');
      return;
    }

    const createdJob = addJob({
      customerName: addCustomerName,
      mobileNo: addMobileNo,
      address: addAddress,
      inverterBrand: addBrand,
      inverterKva: addKva,
      issueDescription: addIssue,
      labLocation: addLab,
      estimatedRepairDate: addEstDate,
      approximateCost: Number(addCost),
      referralId: addReferral,
      status: 'Complaint Filed',
    });

    setShowAddModal(false);
    // Reset form
    setAddCustomerName('');
    setAddMobileNo('');
    setAddAddress('');
    setAddIssue('');

    // Automatically trigger Print Tag Chit
    setSelectedPrintJob(createdJob);
    setPrintDocumentType('job_tag');
  };

  // Open Status Modal
  const openStatusModal = (job: Job) => {
    setActiveModalJob(job);
    setUpdateStatus(job.status);
    setUpdateRemarks('');
    setPartsToDeduct([]);
    setTechName(job.technicianDispatched?.name || '');
    setTechPhone(job.technicianDispatched?.phone || '');
    setTechRemarks(job.technicianDispatched?.remarks || '');
    setActiveModalType('status');
  };

  const handleAddPartToDeduct = () => {
    if (!selectedPartId) return;
    const item = inventory.find((i) => i.id === selectedPartId);
    if (!item) return;

    if (selectedPartQty > item.qtyInStock) {
      alert(`Warning: Only ${item.qtyInStock} in stock!`);
      return;
    }

    const existingIndex = partsToDeduct.findIndex((p) => p.itemId === selectedPartId);
    if (existingIndex >= 0) {
      const updated = [...partsToDeduct];
      updated[existingIndex].qty += selectedPartQty;
      setPartsToDeduct(updated);
    } else {
      setPartsToDeduct([...partsToDeduct, { itemId: selectedPartId, qty: selectedPartQty }]);
    }

    setSelectedPartId('');
    setSelectedPartQty(1);
  };

  const handleSaveStatusUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalJob) return;

    const techInfo =
      updateStatus === 'Ready for Pick Up' && techName
        ? { name: techName, phone: techPhone, remarks: techRemarks }
        : undefined;

    updateJobStatus(
      activeModalJob.id,
      updateStatus,
      updateRemarks || `Status updated to ${updateStatus}`,
      partsToDeduct,
      techInfo
    );

    setActiveModalType(null);
    setActiveModalJob(null);
  };

  // Open Bill Modal
  const openBillModal = (job: Job) => {
    setActiveModalJob(job);
    setBillRepairCost(job.repairCost || 3500);
    setBillReferralCost(job.referralCost || (job.referralId ? 1000 : 0));
    setBillPickupCost(job.pickupCost || 500);
    setBillDeliveryCost(job.deliveryCost || 500);
    setBillConsumedInventory(job.consumedInventory ? job.consumedInventory.map(i => ({ ...i })) : []);
    setBillAdditionalCostHeads(job.additionalCostHeads ? job.additionalCostHeads.map(c => ({ ...c })) : []);
    setBillRepairRemarks(job.repairRemarks || '');
    setNewHeadName('');
    setNewHeadAmount('');
    setActiveModalType('bill');
  };

  const handleConsumedItemCostChange = (index: number, newCost: number) => {
    setBillConsumedInventory((prev) => {
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

  const handleAddAdditionalCostHead = () => {
    if (!newHeadName.trim() || !newHeadAmount || isNaN(Number(newHeadAmount))) {
      alert('Please enter a valid cost head name and amount.');
      return;
    }
    const newHead: AdditionalCostHead = {
      id: `cost-${Date.now()}`,
      name: newHeadName.trim(),
      amount: Number(newHeadAmount),
    };
    setBillAdditionalCostHeads((prev) => [...prev, newHead]);
    setNewHeadName('');
    setNewHeadAmount('');
  };

  const handleRemoveAdditionalCostHead = (id: string) => {
    setBillAdditionalCostHeads((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSaveBillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalJob) return;

    generateBill(
      activeModalJob.id,
      Number(billRepairCost),
      Number(billReferralCost),
      Number(billPickupCost),
      Number(billDeliveryCost),
      billConsumedInventory,
      billAdditionalCostHeads,
      billRepairRemarks,
      true
    );

    setSelectedPrintJob(activeModalJob);
    setPrintDocumentType('bill');
    setActiveModalType(null);
    setActiveModalJob(null);
  };

  // Open Payment Modal
  const openPaymentModal = (job: Job) => {
    setActiveModalJob(job);
    setPayDiscount(job.discount || 0);
    const total = job.totalBillAmount - (job.discount || 0);
    setPayCash(total);
    setPayOnline(0);
    setPayScreenshot('');
    setPaymentError(null);
    setActiveModalType('payment');
  };

  const handleConfirmPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalJob) return;

    const res = confirmPayment(
      activeModalJob.id,
      Number(payDiscount),
      Number(payCash),
      Number(payOnline),
      payScreenshot
    );

    if (!res.success) {
      setPaymentError(res.error || 'Payment failed');
      return;
    }

    setSelectedPrintJob(activeModalJob);
    setPrintDocumentType('payment_receipt');
    setActiveModalType(null);
    setActiveModalJob(null);
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPayScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Stats Counters
  const totalJobsCount = jobs.length;
  const inMaintenanceCount = jobs.filter((j) =>
    ['Complaint Filed', 'Ready for Pick Up', 'Received and Awaiting Maintenance', 'Under Maintenance', 'Awaiting Parts', 'Repaired under Test'].includes(j.status)
  ).length;
  const readyForBillCount = jobs.filter((j) => j.status === 'Repaired & Ready for Delivery' && !j.billGenerated).length;
  const awaitingPaymentCount = jobs.filter((j) => j.billGenerated && !j.paymentConfirmed).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Actions Bar */}
      <div className="bg-white border border-slate-200/90 p-6 rounded-2xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-50 text-[#008b9b] rounded-xl border border-teal-200">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Repair Jobs Manager</h1>
              <p className="text-xs text-slate-500">
                Unified work orders, inverter tracking, status updates, billing, and payment processing.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-[#008b9b] hover:bg-[#006673] text-white font-bold rounded-xl text-xs shadow-md transition-all transform active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Register New Repair Job</span>
        </button>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'all'
              ? 'bg-teal-50 border-[#008b9b] shadow-xs'
              : 'bg-white border-slate-200 hover:border-teal-300'
          }`}
        >
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Work Orders</p>
          <p className="text-2xl font-black font-mono text-slate-900 mt-1">{totalJobsCount}</p>
        </div>

        <div
          onClick={() => setStatusFilter('in_maintenance')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'in_maintenance'
              ? 'bg-amber-50 border-amber-400 shadow-xs'
              : 'bg-white border-slate-200 hover:border-amber-300'
          }`}
        >
          <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">In-Lab / Maintenance</p>
          <p className="text-2xl font-black font-mono text-amber-600 mt-1">{inMaintenanceCount}</p>
        </div>

        <div
          onClick={() => setStatusFilter('ready_bill')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'ready_bill'
              ? 'bg-cyan-50 border-cyan-400 shadow-xs'
              : 'bg-white border-slate-200 hover:border-cyan-300'
          }`}
        >
          <p className="text-[11px] font-bold text-cyan-700 uppercase tracking-wider">Ready for Billing</p>
          <p className="text-2xl font-black font-mono text-cyan-600 mt-1">{readyForBillCount}</p>
        </div>

        <div
          onClick={() => setStatusFilter('awaiting_payment')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'awaiting_payment'
              ? 'bg-emerald-50 border-emerald-400 shadow-xs'
              : 'bg-white border-slate-200 hover:border-emerald-300'
          }`}
        >
          <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Awaiting Payment</p>
          <p className="text-2xl font-black font-mono text-emerald-600 mt-1">{awaitingPaymentCount}</p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white border border-slate-200/90 p-4 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search ID, Name, Mobile, Model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#008b9b]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-700"
              >
                ×
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'All Jobs' },
              { id: 'in_maintenance', label: 'In Maintenance' },
              { id: 'ready_bill', label: 'Ready for Bill' },
              { id: 'awaiting_payment', label: 'Awaiting Payment' },
              { id: 'delivered', label: 'Delivered & Paid' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === f.id
                    ? 'bg-[#008b9b] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Work Orders Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold tracking-wider bg-slate-50">
                <th className="py-3 px-3">Tracking ID</th>
                <th className="py-3 px-3">Customer & Contact</th>
                <th className="py-3 px-3">Inverter Model</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Est. Cost / Bill</th>
                <th className="py-3 px-3 text-center">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 italic">
                    No repair jobs found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => {
                  const isOverdue =
                    job.estimatedRepairDate < new Date().toISOString().split('T')[0] &&
                    job.status !== 'Repaired & Ready for Delivery' &&
                    job.status !== 'Delivered & Paid';

                  return (
                    <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                      {/* Tracking ID */}
                      <td className="py-3 px-3 font-mono font-bold">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#008b9b]">#{job.trackingId}</span>
                          {isOverdue && (
                            <span
                              title="Overdue repair target date!"
                              className="bg-rose-100 text-rose-700 p-0.5 rounded"
                            >
                              <AlertTriangle className="w-3 h-3 text-rose-600 animate-pulse" />
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 font-sans">{job.labLocation}</p>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-900">{job.customerName}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{job.mobileNo}</p>
                        {job.referralId && (
                          <span className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono border border-slate-200">
                            Ref: {job.referralId}
                          </span>
                        )}
                      </td>

                      {/* Inverter Specs */}
                      <td className="py-3 px-3">
                        <p className="font-semibold text-slate-800">{job.inverterBrand}</p>
                        <p className="text-[10px] text-slate-500">{job.inverterKva}</p>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold border ${
                            job.status === 'Delivered & Paid'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : job.status === 'Repaired & Ready for Delivery'
                              ? 'bg-cyan-50 text-cyan-800 border-cyan-200'
                              : job.status === 'Under Maintenance'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {job.status}
                        </span>
                        {job.billGenerated && (
                          <span className="ml-1.5 text-[9px] font-mono text-emerald-600 font-bold">
                            (Bill Locked)
                          </span>
                        )}
                      </td>

                      {/* Bill / Cost */}
                      <td className="py-3 px-3 text-right font-mono font-bold">
                        {job.billGenerated ? (
                          <div className="text-emerald-700">
                            Rs. {job.totalBillAmount.toLocaleString()}
                          </div>
                        ) : (
                          <div className="text-slate-800">
                            Rs. {job.approximateCost.toLocaleString()}
                            <span className="block text-[9px] font-sans text-slate-500 font-normal">Approx</span>
                          </div>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* 1. Status & Parts Button */}
                          <button
                            onClick={() => openStatusModal(job)}
                            title="Update Status & Add Parts"
                            className="p-1.5 bg-slate-100 hover:bg-[#008b9b] hover:text-white text-slate-700 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>

                          {/* 2. Bill Generator Button */}
                          <button
                            onClick={() => openBillModal(job)}
                            title="Generate / Edit Bill"
                            className={`p-1.5 rounded-lg transition-colors border cursor-pointer ${
                              job.billGenerated
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-600 hover:text-white'
                                : 'bg-slate-100 text-amber-700 border-slate-200 hover:bg-amber-500 hover:text-white'
                            }`}
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          {/* 3. Confirm Payment Button */}
                          <button
                            onClick={() => openPaymentModal(job)}
                            title="Confirm Payment & Delivery"
                            className={`p-1.5 rounded-lg transition-colors border cursor-pointer ${
                              job.paymentConfirmed
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-slate-100 text-emerald-700 border-slate-200 hover:bg-emerald-600 hover:text-white'
                            }`}
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>

                          {/* 4. Print Document Options */}
                          <button
                            onClick={() => {
                              setSelectedPrintJob(job);
                              setPrintDocumentType(job.billGenerated ? 'bill' : 'job_tag');
                            }}
                            title="Print Tag / Invoice"
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Super User */}
                          {currentUser.role === 'super' && (
                            <button
                              onClick={() => setJobToDelete(job)}
                              title="Delete Job (Super Admin)"
                              className="p-1.5 bg-slate-100 hover:bg-rose-600 hover:text-white text-slate-500 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================== MODALS ==================== */}

      {/* MODAL 1: REGISTER NEW REPAIR JOB */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative space-y-6 my-8 text-slate-800">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <Plus className="w-5 h-5 text-[#008b9b]" />
              <h2 className="text-base font-bold text-slate-900">Register New Inverter Repair Job</h2>
            </div>

            <form onSubmit={handleRegisterJobSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={addCustomerName}
                    onChange={(e) => setAddCustomerName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008b9b]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="0300-1234567"
                    value={addMobileNo}
                    onChange={(e) => setAddMobileNo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008b9b]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Inverter Model *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Inverex Nitrox / Crown Elego"
                    value={addBrand}
                    onChange={(e) => setAddBrand(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008b9b]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Capacity Rating</label>
                  <select
                    value={addKva}
                    onChange={(e) => setAddKva(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008b9b]"
                  >
                    <option value="1.2 kVA">1.2 kVA</option>
                    <option value="2.4 kVA">2.4 kVA</option>
                    <option value="3.2 kVA">3.2 kVA</option>
                    <option value="5.0 kVA">5.0 kVA</option>
                    <option value="6.0 kVA">6.0 kVA</option>
                    <option value="8.0 kVA">8.0 kVA</option>
                    <option value="10.0 kVA">10.0 kVA</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Issue Description *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Describe fault (e.g. Code 04 Overload, MOSFET burnout)"
                    value={addIssue}
                    onChange={(e) => setAddIssue(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008b9b]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Referral Franchise</label>
                  <select
                    value={addReferral}
                    onChange={(e) => setAddReferral(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#008b9b]"
                  >
                    <option value="">-- Direct Walk-In --</option>
                    {franchises
                      .filter((f) => f.active)
                      .map((f) => (
                        <option key={f.id} value={f.referralCode}>
                          {f.referralCode} ({f.name})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Approximate Cost (Rs.)</label>
                  <input
                    type="number"
                    value={addCost}
                    onChange={(e) => setAddCost(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#008b9b]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Customer Address</label>
                  <input
                    type="text"
                    placeholder="House, Street, City"
                    value={addAddress}
                    onChange={(e) => setAddAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008b9b]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#008b9b] hover:bg-[#006673] text-white font-bold rounded-xl text-xs shadow-md cursor-pointer"
                >
                  Register & Print Tag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: UPDATE STATUS & ADD PARTS */}
      {activeModalType === 'status' && activeModalJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative space-y-6 my-8 text-slate-800">
            <button
              onClick={() => setActiveModalType(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-mono font-bold text-[#008b9b] bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Job #{activeModalJob.trackingId}
              </span>
              <h2 className="text-base font-bold text-slate-900 mt-1">
                Update Status & Consume Spare Parts ({activeModalJob.customerName})
              </h2>
            </div>

            <form onSubmit={handleSaveStatusUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select New Status *</label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value as JobStatus)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#008b9b]"
                >
                  <option value="Complaint Filed">Complaint Filed</option>
                  <option value="Ready for Pick Up">Ready for Pick Up (Dispatch Pickup Tech)</option>
                  <option value="Received and Awaiting Maintenance">Received and Awaiting Maintenance</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                  <option value="Awaiting Parts">Awaiting Parts</option>
                  <option value="Repaired under Test">Repaired under Test</option>
                  <option value="Repaired & Ready for Delivery">Repaired & Ready for Delivery</option>
                </select>
              </div>

              {/* Technician Dispatch fields if Pickup */}
              {updateStatus === 'Ready for Pick Up' && (
                <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200 space-y-2">
                  <p className="font-bold text-amber-900 text-[11px]">Technician Pickup Dispatch</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Tech Name"
                      value={techName}
                      onChange={(e) => setTechName(e.target.value)}
                      className="bg-white border border-amber-200 rounded-lg p-2 text-slate-900"
                    />
                    <input
                      type="text"
                      placeholder="Tech Mobile"
                      value={techPhone}
                      onChange={(e) => setTechPhone(e.target.value)}
                      className="bg-white border border-amber-200 rounded-lg p-2 text-slate-900"
                    />
                  </div>
                </div>
              )}

              {/* Spare Parts Consumption section */}
              <div className="space-y-2">
                <label className="block font-semibold text-slate-700">Consume Spare Parts from Inventory</label>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedPartId}
                    onChange={(e) => setSelectedPartId(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900"
                  >
                    <option value="">-- Select Spare Part --</option>
                    {inventory.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.name} (Stock: {inv.qtyInStock} | Rs. {inv.unitPrice})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    value={selectedPartQty}
                    onChange={(e) => setSelectedPartQty(Number(e.target.value))}
                    className="w-20 bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleAddPartToDeduct}
                    className="px-3 py-2 bg-[#008b9b] hover:bg-[#006673] text-white font-bold rounded-xl cursor-pointer"
                  >
                    + Add
                  </button>
                </div>

                {/* Selected parts preview list */}
                {partsToDeduct.length > 0 && (
                  <div className="bg-teal-50/80 rounded-xl p-3 border border-teal-200 space-y-1">
                    <p className="text-[11px] font-bold text-[#006673]">Parts To Be Deducted:</p>
                    {partsToDeduct.map((pt, i) => {
                      const item = inventory.find((inv) => inv.id === pt.itemId);
                      return (
                        <div key={i} className="flex items-center justify-between text-[11px] text-slate-800">
                          <span>{item?.name}</span>
                          <span className="font-mono font-bold">
                            {pt.qty} unit(s) = Rs. {((item?.unitPrice || 0) * pt.qty).toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Already consumed parts */}
                {activeModalJob.consumedInventory.length > 0 && (
                  <div className="text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">Previously Consumed: </span>
                    {activeModalJob.consumedInventory.map((ci) => `${ci.itemName} (${ci.qty})`).join(', ')}
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status Log Remarks</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Replaced MOSFETs, bench tested on load..."
                  value={updateRemarks}
                  onChange={(e) => setUpdateRemarks(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008b9b]"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModalType(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#008b9b] hover:bg-[#006673] text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Save Status & Deduct Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: GENERATE BILL */}
      {activeModalType === 'bill' && activeModalJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative space-y-5 my-8 text-slate-800">
            <button
              onClick={() => setActiveModalType(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-mono font-bold text-[#008b9b] bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Bill Calculation — Job #{activeModalJob.trackingId}
              </span>
              <h2 className="text-base font-bold text-slate-900 mt-1">
                Finalize Repair Bill ({activeModalJob.customerName})
              </h2>
            </div>

            <form onSubmit={handleSaveBillSubmit} className="space-y-4 text-xs">
              {/* Parts breakdown summary with editable item prices */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between font-bold text-[#006673]">
                  <div className="flex items-center gap-1.5">
                    <Package className="w-4 h-4" />
                    <span>Consumed Spare Parts (Editable Billed Cost)</span>
                  </div>
                  <span className="font-mono text-sm font-black text-[#008b9b]">
                    Rs.{' '}
                    {billConsumedInventory
                      .reduce((sum, item) => sum + (Number(item.totalCost) || 0), 0)
                      .toLocaleString()}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 italic leading-tight">
                  * Edit customer price below. Price additions increase bill total & lab profit without affecting stock catalog cost.
                </p>

                {billConsumedInventory.length === 0 ? (
                  <p className="text-slate-400 italic text-[11px]">No spare parts consumed for this repair.</p>
                ) : (
                  <div className="space-y-2 pt-1">
                    {billConsumedInventory.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-2 bg-white p-2 rounded-lg border border-slate-200 text-xs shadow-2xs">
                        <div className="flex-1">
                          <span className="font-bold text-slate-800">{item.itemName}</span>
                          <span className="text-[11px] text-slate-500 ml-1.5">(Qty: {item.qty})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-slate-500 font-medium">Customer Bill (Rs.):</span>
                          <input
                            type="number"
                            value={item.totalCost}
                            onChange={(e) => handleConsumedItemCostChange(idx, Number(e.target.value))}
                            className="w-24 bg-slate-50 border border-slate-300 rounded px-2 py-1 text-right font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bench Repair Profit & Service Costs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#006673] mb-1">Bench Repair Labor Profit *</label>
                  <input
                    type="number"
                    required
                    value={billRepairCost}
                    onChange={(e) => setBillRepairCost(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Referral Share Cost (Rs.)</label>
                  <input
                    type="number"
                    value={billReferralCost}
                    onChange={(e) => setBillReferralCost(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pickup Charges (Rs.)</label>
                  <input
                    type="number"
                    value={billPickupCost}
                    onChange={(e) => setBillPickupCost(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Delivery Charges (Rs.)</label>
                  <input
                    type="number"
                    value={billDeliveryCost}
                    onChange={(e) => setBillDeliveryCost(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Additional Custom Cost Heads */}
              <div className="space-y-2 border-t border-slate-200 pt-3">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800 text-xs">Additional Cost Heads (Optional)</label>
                  <span className="text-[10px] text-teal-600 font-medium">Added to customer bill</span>
                </div>

                {billAdditionalCostHeads.length > 0 && (
                  <div className="space-y-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200">
                    {billAdditionalCostHeads.map((c) => (
                      <div key={c.id} className="flex items-center justify-between bg-white p-2 rounded-lg text-xs border border-slate-200">
                        <span className="font-semibold text-slate-700">{c.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#008b9b]">Rs. {c.amount.toLocaleString()}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAdditionalCostHead(c.id)}
                            className="text-rose-500 hover:text-rose-700 cursor-pointer p-0.5"
                            title="Remove Cost Head"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Cost Head Name (e.g. Diagnostic Fee, Thermal Compound)"
                    value={newHeadName}
                    onChange={(e) => setNewHeadName(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-medium text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Amount (Rs.)"
                    value={newHeadAmount}
                    onChange={(e) => setNewHeadAmount(e.target.value)}
                    className="w-28 bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-mono font-bold text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddAdditionalCostHead}
                    className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Repair Comments Section */}
              <div className="space-y-1 border-t border-slate-200 pt-3">
                <label className="block font-bold text-slate-800 text-xs flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-[#008b9b]" />
                  <span>Repair Comments & Technician Notes (Shown on Customer Bill)</span>
                </label>
                <textarea
                  rows={2}
                  value={billRepairRemarks}
                  onChange={(e) => setBillRepairRemarks(e.target.value)}
                  placeholder="Enter notes about repair work, benchmark testing, or component replacements to display on customer bill..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              {/* Calculated Total */}
              <div className="bg-teal-50 border border-teal-200 p-3 rounded-xl flex items-center justify-between">
                <span className="font-bold text-[#006673] uppercase">Calculated Total Bill</span>
                <span className="text-xl font-black font-mono text-[#008b9b]">
                  Rs.{' '}
                  {(
                    (billRepairCost || 0) +
                    (billReferralCost || 0) +
                    (billPickupCost || 0) +
                    (billDeliveryCost || 0) +
                    billConsumedInventory.reduce((s, i) => s + (Number(i.totalCost) || 0), 0) +
                    billAdditionalCostHeads.reduce((s, c) => s + (Number(c.amount) || 0), 0)
                  ).toLocaleString()}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    downgradeJobStatus(activeModalJob.id, 'Under Maintenance');
                    setActiveModalType(null);
                  }}
                  className="px-3 py-2 bg-rose-50 text-rose-700 rounded-xl font-semibold text-[11px] hover:bg-rose-100 cursor-pointer"
                >
                  Revert to In-Maintenance
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveModalType(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold cursor-pointer hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#008b9b] text-white font-bold rounded-xl shadow-md cursor-pointer hover:bg-[#006673] transition-colors"
                  >
                    Lock & Print Bill
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CONFIRM PAYMENT */}
      {activeModalType === 'payment' && activeModalJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative space-y-6 my-8 text-slate-800">
            <button
              onClick={() => setActiveModalType(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Payment & Delivery Confirmation
              </span>
              <h2 className="text-base font-bold text-slate-900 mt-1">
                Receive Payment for Job #{activeModalJob.trackingId}
              </h2>
            </div>

            {paymentError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
                {paymentError}
              </div>
            )}

            <form onSubmit={handleConfirmPaymentSubmit} className="space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center font-mono">
                <span className="text-slate-600 font-sans">Total Bill Amount:</span>
                <span className="text-lg font-bold text-[#008b9b]">
                  Rs. {activeModalJob.totalBillAmount.toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Discount Allowed (Rs.)</label>
                  <input
                    type="number"
                    value={payDiscount}
                    onChange={(e) => {
                      const disc = Number(e.target.value);
                      setPayDiscount(disc);
                      setPayCash(Math.max(0, activeModalJob.totalBillAmount - disc - payOnline));
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-emerald-700 mb-1">Cash Paid (Counter) *</label>
                  <input
                    type="number"
                    value={payCash}
                    onChange={(e) => setPayCash(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-cyan-700 mb-1">Online / Bank Paid *</label>
                  <input
                    type="number"
                    value={payOnline}
                    onChange={(e) => setPayOnline(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Online Payment Screenshot */}
              {payOnline > 0 && (
                <div className="space-y-2 bg-cyan-50/60 p-3 rounded-xl border border-cyan-200">
                  <label className="block font-semibold text-cyan-900 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-cyan-700" />
                    <span>Attach Online Transfer Receipt Screenshot</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshotUpload}
                    className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-cyan-100 file:text-cyan-800 file:font-bold hover:file:bg-cyan-200"
                  />
                  {payScreenshot && (
                    <img
                      src={payScreenshot}
                      alt="Receipt Preview"
                      className="h-24 rounded-lg object-contain border border-slate-200 mt-2 bg-white"
                    />
                  )}
                </div>
              )}

              {/* Validation Summary */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs font-mono">
                <span className="text-slate-600">
                  Expected: Rs. {(activeModalJob.totalBillAmount - payDiscount).toLocaleString()}
                </span>
                <span
                  className={`font-bold ${
                    Math.abs(activeModalJob.totalBillAmount - payDiscount - (payCash + payOnline)) < 0.01
                      ? 'text-emerald-700'
                      : 'text-rose-600'
                  }`}
                >
                  Received Total: Rs. {(payCash + payOnline).toLocaleString()}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModalType(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Confirm Payment & Deliver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={!!jobToDelete}
        title="Warning: Delete Job Card"
        message={
          jobToDelete
            ? `Are you sure you want to delete Job #${jobToDelete.trackingId} (${jobToDelete.customerName} - ${jobToDelete.inverterBrand})? This will restore any deducted inventory parts and reverse financial transaction records.`
            : ''
        }
        confirmLabel="Delete Job"
        onConfirm={() => {
          if (jobToDelete) {
            deleteJob(jobToDelete.id);
            setJobToDelete(null);
          }
        }}
        onCancel={() => setJobToDelete(null)}
      />
    </div>
  );
};
