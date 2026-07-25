import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CreditCard, CheckCircle2, Printer, Share2, AlertTriangle, Image as ImageIcon, Check } from 'lucide-react';

export const ConfirmPaymentTab: React.FC = () => {
  const { jobs, confirmPayment, setSelectedPrintJob, setPrintDocumentType } = useApp();

  // Filter jobs with generated bill awaiting payment
  const pendingPaymentJobs = jobs.filter(
    (j) => j.billGenerated && !j.paymentConfirmed
  );

  const [selectedJobId, setSelectedJobId] = useState<string>(pendingPaymentJobs[0]?.id || '');
  const [discount, setDiscount] = useState<number>(0);
  const [cashPaid, setCashPaid] = useState<number>(0);
  const [onlinePaid, setOnlinePaid] = useState<number>(0);
  const [onlineScreenshot, setOnlineScreenshot] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedSuccessJobId, setConfirmedSuccessJobId] = useState<string | null>(null);

  const activeJob = jobs.find((j) => j.id === selectedJobId);

  const handleSelectJob = (id: string) => {
    setSelectedJobId(id);
    const j = jobs.find((job) => job.id === id);
    if (j) {
      setDiscount(0);
      setCashPaid(j.totalBillAmount); // Default fill exact cash
      setOnlinePaid(0);
      setErrorMessage(null);
      setConfirmedSuccessJobId(null);
    }
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedJobId || !activeJob) return;

    const result = confirmPayment(
      selectedJobId,
      Number(discount),
      Number(cashPaid),
      Number(onlinePaid),
      onlineScreenshot
    );

    if (!result.success) {
      setErrorMessage(result.error || 'Payment failed');
      return;
    }

    // Success! Show confirmation receipt screen instead of going blank
    setConfirmedSuccessJobId(selectedJobId);
  };

  const confirmedJob = jobs.find((j) => j.id === confirmedSuccessJobId);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-bold tracking-tight">Confirm Payment & Issue Receipt</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Exact payment amount validation, cash counter posting, online bank credit, and printable receipt generation.
          </p>
        </div>
      </div>

      {/* POST CONFIRMATION RECEIPT VIEW (Fixes bug where screen went blank - p.5) */}
      {confirmedJob ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center space-y-6 max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/30">
            <Check className="w-8 h-8" />
          </div>

          <div>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-500/30">
              Payment Confirmed & Posted
            </span>
            <h3 className="text-2xl font-bold text-white mt-3">Receipt Generated for #{confirmedJob.trackingId}</h3>
            <p className="text-xs text-slate-400 mt-1">Customer: {confirmedJob.customerName} ({confirmedJob.mobileNo})</p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-left text-xs space-y-2">
            <div className="flex justify-between text-slate-300">
              <span>Total Bill Amount:</span>
              <span className="font-mono font-bold">Rs. {confirmedJob.totalBillAmount.toLocaleString()}</span>
            </div>
            {confirmedJob.discount > 0 && (
              <div className="flex justify-between text-emerald-400 font-semibold">
                <span>Discount Applied:</span>
                <span className="font-mono">- Rs. {confirmedJob.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-300">
              <span>Cash Payment Received:</span>
              <span className="font-mono font-bold">Rs. {confirmedJob.cashPaid.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Online Payment Received:</span>
              <span className="font-mono font-bold">Rs. {confirmedJob.onlinePaid.toLocaleString()}</span>
            </div>
            <div className="pt-2 border-t border-slate-700 flex justify-between font-bold text-sm text-amber-400">
              <span>Final Paid Balance:</span>
              <span className="font-mono">Rs. {confirmedJob.finalPayment.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setSelectedPrintJob(confirmedJob);
                setPrintDocumentType('payment_receipt');
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Receipt</span>
            </button>

            <button
              onClick={() => {
                const text = encodeURIComponent(
                  `*InvertiSOL Payment Receipt*\n` +
                  `Tracking ID: ${confirmedJob.trackingId}\n` +
                  `Customer: ${confirmedJob.customerName}\n` +
                  `Paid Amount: Rs. ${confirmedJob.finalPayment.toLocaleString()}\n` +
                  `Status: Paid & Delivered. Thank you!`
                );
                window.open(`https://wa.me/${confirmedJob.mobileNo.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg"
            >
              <Share2 className="w-4 h-4" />
              <span>Send to WhatsApp</span>
            </button>

            <button
              onClick={() => setConfirmedSuccessJobId(null)}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs border border-slate-700"
            >
              Process Next Payment
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Pending Payment Jobs List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider px-2">
              Jobs Awaiting Payment ({pendingPaymentJobs.length})
            </h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {pendingPaymentJobs.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-4 text-center">No pending bills awaiting payment.</p>
              ) : (
                pendingPaymentJobs.map((j) => {
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
                        <span className="text-emerald-400 font-bold">
                          Rs. {j.totalBillAmount.toLocaleString()}
                        </span>
                      </div>
                      <p className="font-bold text-slate-100 mt-1">{j.customerName}</p>
                      <p className="text-slate-400 text-[11px]">{j.inverterBrand} ({j.inverterKva})</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Payment Confirmation Form with Strict Amount Validation */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            {activeJob ? (
              <form onSubmit={handleConfirm} className="space-y-6">
                {/* Job Info */}
                <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400">Tracking ID:</span>
                    <p className="font-mono font-bold text-amber-400 text-sm">#{activeJob.trackingId}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Customer Name:</span>
                    <p className="font-bold text-white">{activeJob.customerName}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Total Generated Bill:</span>
                    <p className="font-mono font-bold text-emerald-400 text-sm">
                      Rs. {activeJob.totalBillAmount.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Validation Error Box */}
                {errorMessage && (
                  <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-4 rounded-xl flex items-start gap-3 text-xs font-medium">
                    <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                    <p>{errorMessage}</p>
                  </div>
                )}

                {/* Payment Breakdown Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Discount (if any)</label>
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Cash Payment Received</label>
                    <input
                      type="number"
                      value={cashPaid}
                      onChange={(e) => setCashPaid(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono font-bold text-amber-300"
                    />
                    <p className="text-[10px] text-slate-400 mt-0.5">Auto-posted to Counter Cash balance.</p>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Online Payment Received</label>
                    <input
                      type="number"
                      value={onlinePaid}
                      onChange={(e) => setOnlinePaid(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono font-bold text-cyan-300"
                    />
                    <p className="text-[10px] text-slate-400 mt-0.5">Auto-posted to Bank Account.</p>
                  </div>
                </div>

                {/* Online Screenshot Upload Attachment */}
                {onlinePaid > 0 && (
                  <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-2 text-xs">
                    <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-cyan-400" />
                      <span>Attach Online Payment Screenshot / Reference ID (Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Transaction Ref # 98457201 / JazzCash TRX ID"
                      value={onlineScreenshot}
                      onChange={(e) => setOnlineScreenshot(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                    />
                  </div>
                )}

                {/* Amount Verification Calculation Banner */}
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-xs space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>Target Amount (Bill - Discount):</span>
                    <span className="font-mono font-bold text-white">
                      Rs. {(activeJob.totalBillAmount - discount).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Entered Total Received (Cash + Online):</span>
                    <span className="font-mono font-bold text-emerald-400">
                      Rs. {(cashPaid + onlinePaid).toLocaleString()}
                    </span>
                  </div>
                  {Math.abs(activeJob.totalBillAmount - discount - (cashPaid + onlinePaid)) > 0.01 && (
                    <p className="text-[11px] text-rose-400 font-bold pt-1">
                      ⚠️ Mismatch detected! Adjust Cash or Online field to match exactly Rs.{(activeJob.totalBillAmount - discount).toLocaleString()}.
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
                >
                  Confirm Payment & Issue Receipt
                </button>
              </form>
            ) : (
              <div className="p-12 text-center text-slate-500 text-xs">
                No job awaiting payment selected.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
