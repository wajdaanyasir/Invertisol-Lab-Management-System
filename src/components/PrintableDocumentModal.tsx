import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Printer, X, Share2, Zap, Download, Loader2, CheckCircle2, ShieldCheck, Award, Calendar, ShieldAlert } from 'lucide-react';

export const PrintableDocumentModal: React.FC = () => {
  const {
    jobs,
    selectedPrintJob,
    setSelectedPrintJob,
    printReportData,
    setPrintReportData,
    printDocumentType,
    setPrintDocumentType,
    appLogo,
    labHelplinePhone,
    labAddress,
    portalMode,
  } = useApp();

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [chitCopyFilter, setChitCopyFilter] = useState<'both' | 'customer' | 'lab'>(
    portalMode === 'customer' ? 'customer' : 'both'
  );

  const jobToPrint = jobs.find((j) => j.id === selectedPrintJob?.id) || selectedPrintJob;

  useEffect(() => {
    if (portalMode === 'customer') {
      setChitCopyFilter('customer');
      if (jobToPrint) {
        if (printDocumentType === 'bill' && (!jobToPrint.billGenerated || !jobToPrint.isBillLocked)) {
          setPrintDocumentType('job_tag');
        } else if (printDocumentType === 'payment_receipt' && !jobToPrint.paymentConfirmed) {
          setPrintDocumentType('job_tag');
        }
      }
    }
  }, [portalMode, jobToPrint, printDocumentType, setPrintDocumentType]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedPrintJob(null);
        setPrintReportData(null);
        setPrintDocumentType(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSelectedPrintJob, setPrintReportData, setPrintDocumentType]);

  if (!printDocumentType || (!jobToPrint && !printReportData)) return null;

  const openPrintPopup = () => {
    const printableArea = document.getElementById('printable-area');
    if (!printableArea) {
      window.print();
      return;
    }

    const title = jobToPrint
      ? `InvertiSOL_${printDocumentType}_${jobToPrint.trackingId}`
      : `InvertiSOL_${printReportData?.reportType || 'Document'}`;

    const printWin = window.open('', '_blank', 'width=900,height=1000');
    if (!printWin) {
      window.print();
      return;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
            body {
              font-family: 'Plus Jakarta Sans', sans-serif;
              background: #ffffff;
              color: #0f172a;
              margin: 0;
              padding: 24px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div style="max-width: 800px; margin: 0 auto;">
            ${printableArea.innerHTML}
          </div>
          <script>
            window.addEventListener('load', () => {
              setTimeout(() => {
                window.focus();
                window.print();
              }, 300);
            });
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  const handlePrint = () => {
    try {
      window.focus();
      const isIframe = window.self !== window.top;
      if (isIframe) {
        openPrintPopup();
      } else {
        window.print();
      }
    } catch (err) {
      console.warn('Direct print failed, opening print popup:', err);
      openPrintPopup();
    }
  };

  const handleSavePDF = async () => {
    const element = document.getElementById('printable-area');
    if (!element) return;

    setIsGeneratingPDF(true);

    const docName = jobToPrint
      ? `InvertiSOL_${printDocumentType}_${jobToPrint.trackingId}`
      : `InvertiSOL_${printReportData?.reportType || 'Report'}_${new Date().toISOString().slice(0, 10)}`;

    try {
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = html2pdfModule.default || html2pdfModule;

      const opt = {
        margin: [8, 8, 8, 8],
        filename: `${docName}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };

      await (html2pdf as any)().set(opt).from(element).save();
    } catch (err) {
      console.warn('PDF export error, falling back to print popup:', err);
      openPrintPopup();
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleWhatsAppShare = () => {
    if (jobToPrint) {
      const text = encodeURIComponent(
        `*InvertiSOL Repairing Labs*\n` +
          `Tracking ID: ${jobToPrint.trackingId}\n` +
          `Customer: ${jobToPrint.customerName}\n` +
          `Inverter: ${jobToPrint.inverterBrand} (${jobToPrint.inverterKva})\n` +
          `Status: ${jobToPrint.status}\n` +
          `Total Bill: Rs. ${jobToPrint.totalBillAmount.toLocaleString()}\n` +
          `Discount: Rs. ${jobToPrint.discount.toLocaleString()}\n` +
          `Paid: Rs. ${(jobToPrint.cashPaid + jobToPrint.onlinePaid).toLocaleString()}\n` +
          `Thank you for choosing InvertiSOL Labs!`
      );
      window.open(`https://wa.me/${jobToPrint.mobileNo.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
    } else if (printReportData) {
      const text = encodeURIComponent(
        `*InvertiSOL Repairing Labs Report*\n` +
          `Title: ${printReportData.title}\n` +
          `Period: ${printReportData.periodLabel || printReportData.subtitle || ''}\n` +
          `Generated from InvertiSOL Management Console.`
      );
      window.open(`https://wa.me/?text=${text}`, '_blank');
    }
  };

  const closeModal = () => {
    setSelectedPrintJob(null);
    setPrintReportData(null);
    setPrintDocumentType(null);
  };

  const getBadgeTitle = () => {
    switch (printDocumentType) {
      case 'job_tag':
        if (portalMode === 'customer' || chitCopyFilter === 'customer') {
          return 'CUSTOMER RECEIPT CHIT';
        }
        if (chitCopyFilter === 'lab') {
          return 'LAB & OFFICE RECORD SLIP';
        }
        return 'LAB & CUSTOMER CHIT SLIP';
      case 'bill':
        return 'OFFICIAL GENERATED BILL';
      case 'payment_receipt':
        return 'PAYMENT RECEIPT & 6-MONTH LAB WARRANTY';
      case 'profit_report':
        return 'MONTHLY PROFIT / LOSS STATEMENT';
      case 'day_progress':
        return 'DAY WISE MAINTENANCE PROGRESS REPORT';
      case 'stock_report':
        return 'INVENTORY STOCK VALUATION REPORT';
      case 'consumption_report':
        return 'INVENTORY CONSUMPTION REPORT';
      default:
        return 'OFFICIAL REPORT DOCUMENT';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white"
      onClick={closeModal}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full text-slate-900 border border-slate-200 overflow-hidden my-8 relative print:my-0 print:border-none print:shadow-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar (Screen only) */}
        <div className="bg-slate-900 text-white px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400 fill-current" />
            <span className="font-bold text-sm tracking-wide">
              InvertiSOL Printable Document Preview
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={handleSavePDF}
              disabled={isGeneratingPDF}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-md"
            >
              {isGeneratingPDF ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-md"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Document</span>
            </button>
            <button
              type="button"
              onClick={closeModal}
              title="Close Preview (ESC)"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-md ml-1"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* Work Order Document Switcher Tabs (Screen view only) */}
        {jobToPrint && (
          <div className="bg-slate-800 px-6 py-2 border-b border-slate-700 flex flex-wrap items-center justify-between gap-2 print:hidden text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400">Switch View:</span>
              <button
                type="button"
                onClick={() => setPrintDocumentType('job_tag')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  printDocumentType === 'job_tag'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                }`}
              >
                🏷️ Tag Chit Slip
              </button>
              {/* Official Bill: Show to Admin ALWAYS, or to Customer ONLY when generated & locked */}
              {(portalMode === 'admin' || (jobToPrint.billGenerated && jobToPrint.isBillLocked)) && (
                <button
                  type="button"
                  onClick={() => setPrintDocumentType('bill')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    printDocumentType === 'bill'
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                  }`}
                >
                  📄 Official Bill
                </button>
              )}

              {/* Payment Receipt & Warranty: Show to Admin ALWAYS, or to Customer ONLY when payment is confirmed */}
              {(portalMode === 'admin' || jobToPrint.paymentConfirmed) && (
                <button
                  type="button"
                  onClick={() => setPrintDocumentType('payment_receipt')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    printDocumentType === 'payment_receipt'
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                  }`}
                >
                  💳 Payment Receipt & Warranty
                </button>
              )}
            </div>

            {/* Admin Copy Filter Toggle for Chit Slips */}
            {portalMode === 'admin' && printDocumentType === 'job_tag' && (
              <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-lg border border-slate-700">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-1.5">Print Filter:</span>
                <button
                  type="button"
                  onClick={() => setChitCopyFilter('both')}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                    chitCopyFilter === 'both' ? 'bg-teal-500 text-slate-950' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Both Copies
                </button>
                <button
                  type="button"
                  onClick={() => setChitCopyFilter('customer')}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                    chitCopyFilter === 'customer' ? 'bg-amber-400 text-slate-950' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Customer Copy Only
                </button>
                <button
                  type="button"
                  onClick={() => setChitCopyFilter('lab')}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                    chitCopyFilter === 'lab' ? 'bg-indigo-400 text-slate-950' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Lab Copy Only
                </button>
              </div>
            )}
          </div>
        )}

        {/* Printable Area */}
        <div className="p-6 sm:p-8 space-y-3 print:p-0 print:space-y-1 font-sans print:m-0 print:shadow-none" id="printable-area">
          {/* Header Branding */}
          <div className="border-b-2 border-slate-900 pb-3 print:pb-1 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {appLogo ? (
                <img
                  src={appLogo}
                  alt="InvertiSOL Brand Logo"
                  className="h-14 sm:h-16 print:h-9 w-auto max-w-[220px] object-contain"
                />
              ) : (
                <div className="w-12 h-12 print:w-9 print:h-9 bg-slate-900 text-amber-400 rounded-xl flex items-center justify-center font-black text-lg print:text-sm border-2 border-amber-500">
                  IS
                </div>
              )}
              <div>
                <h1 className="text-xl sm:text-2xl print:text-lg font-black text-slate-900 tracking-tight">
                  InvertiSOL Repairing Labs
                </h1>
                <p className="text-xs print:text-[10px] font-semibold text-slate-600">
                  Solar Inverter Repairing & Maintenance Specialists
                </p>
                <p className="text-[11px] print:text-[9px] text-slate-500">
                  {labAddress} | Helpline: {labHelplinePhone}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block bg-slate-900 text-amber-300 text-[11px] print:text-[9.5px] font-bold px-2.5 py-0.5 rounded-md tracking-wider uppercase">
                {getBadgeTitle()}
              </span>
              {jobToPrint && (
                <p className="text-xs print:text-[9.5px] text-slate-500 mt-0.5 font-mono font-bold">
                  Tracking ID: {jobToPrint.trackingId}
                </p>
              )}
              {printReportData && (
                <p className="text-xs print:text-[9.5px] text-slate-500 mt-0.5 font-mono font-bold">
                  {printReportData.periodLabel || printReportData.subtitle || new Date().toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* DOCUMENT TYPE 1: JOB TAG CHIT */}
          {printDocumentType === 'job_tag' && jobToPrint && (
            <div className="space-y-8">
              {/* SECTION A: LAB / OFFICE COPY (Shown only in Admin Mode when filter permits) */}
              {portalMode === 'admin' && (chitCopyFilter === 'both' || chitCopyFilter === 'lab') && (
                <div className="border-2 border-dashed border-slate-300 p-6 rounded-xl relative bg-slate-50/50">
                  <span className="absolute top-2 right-3 text-[10px] font-black uppercase text-slate-400 border border-slate-300 px-2 py-0.5 rounded bg-white">
                    LAB COPY / OFFICE RECORD
                  </span>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-slate-500 font-medium">Tracking ID:</p>
                      <p className="font-bold text-slate-900 font-mono text-sm">{jobToPrint.trackingId}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">Customer Name:</p>
                      <p className="font-bold text-slate-900">{jobToPrint.customerName}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">Inverter Model/Brand:</p>
                      <p className="font-bold text-slate-900">{jobToPrint.inverterBrand} ({jobToPrint.inverterKva})</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">Mobile No:</p>
                      <p className="font-bold text-slate-900">{jobToPrint.mobileNo}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">Issue Description:</p>
                      <p className="font-bold text-slate-900">{jobToPrint.issueDescription}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">Estimated Repair Date:</p>
                      <p className="font-bold text-slate-900 font-mono">{jobToPrint.estimatedRepairDate}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">Approximate Cost:</p>
                      <p className="font-bold text-slate-900 font-mono">Rs. {jobToPrint.approximateCost.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">Referral ID (Internal):</p>
                      <p className="font-bold text-slate-900 font-mono">{jobToPrint.referralId || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION B: CUSTOMER COPY (Always shown on Customer Portal, or when filter permits in Admin) */}
              {(portalMode === 'customer' || chitCopyFilter === 'both' || chitCopyFilter === 'customer') && (
                <div className="border-2 border-slate-900 p-6 rounded-xl relative">
                  <span className="absolute top-2 right-3 text-[10px] font-black uppercase text-slate-900 border border-slate-900 px-2 py-0.5 rounded bg-amber-100">
                    CUSTOMER COPY
                  </span>
                  <h3 className="font-bold text-slate-900 border-b pb-2 mb-3 text-sm">Customer Receipt Chit</h3>
                  <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                    <div>
                      <p className="text-slate-500">Tracking ID:</p>
                      <p className="font-bold text-slate-900 font-mono">{jobToPrint.trackingId}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Customer Name:</p>
                      <p className="font-bold text-slate-900">{jobToPrint.customerName}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Inverter Specs:</p>
                      <p className="font-bold text-slate-900">{jobToPrint.inverterBrand} ({jobToPrint.inverterKva})</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Estimated Delivery Date:</p>
                      <p className="font-bold text-slate-900 font-mono">{jobToPrint.estimatedRepairDate}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg text-[11px] text-slate-600 border border-slate-200 space-y-1">
                    <p className="font-bold text-slate-800">Terms & Conditions:</p>
                    <p>1. Please present this receipt chit at the time of receiving your inverter.</p>
                    <p>2. Laboratory benchmark testing is required before final hand-over.</p>
                    <p>3. It is certified that I have checked my inverter on bench and it is in good working condition and complete in all aspects.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-8 mt-8 text-xs pt-4 border-t">
                    <div>
                      <p className="text-slate-500 mb-6">Customer Signature:</p>
                      <div className="border-b border-slate-400 w-full"></div>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-6">Lab Officer Signature & Stamp:</p>
                      <div className="border-b border-slate-400 w-full"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DOCUMENT TYPE 2: GENERATED BILL / RECEIPT */}
          {(printDocumentType === 'bill' || printDocumentType === 'payment_receipt') && jobToPrint && (
            <div className="space-y-2.5 print:space-y-1">
              {/* Customer Info Box */}
              <div className="bg-slate-50 p-2 sm:p-2.5 print:py-1 print:px-2 rounded-lg border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <p className="text-slate-500 text-[9.5px] print:text-[8.5px] font-bold uppercase">Customer Name:</p>
                  <p className="font-bold text-slate-900 text-[11px] print:text-[10px]">{jobToPrint.customerName}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[9.5px] print:text-[8.5px] font-bold uppercase">Mobile No:</p>
                  <p className="font-bold text-slate-900 text-[11px] print:text-[10px]">{jobToPrint.mobileNo}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[9.5px] print:text-[8.5px] font-bold uppercase">Inverter Model:</p>
                  <p className="font-bold text-slate-900 text-[11px] print:text-[10px]">{jobToPrint.inverterBrand} ({jobToPrint.inverterKva})</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[9.5px] print:text-[8.5px] font-bold uppercase">Address:</p>
                  <p className="font-bold text-slate-900 text-[11px] print:text-[10px] truncate">{jobToPrint.address || 'Lab Walk-in'}</p>
                </div>
              </div>

              {/* Section 1: Parts */}
              <div>
                <h3 className="text-[10.5px] print:text-[9.5px] font-bold text-slate-900 uppercase tracking-wider mb-0.5">
                  1. Replacement Parts & Materials Cost
                </h3>
                <div className="border border-slate-200 rounded-lg p-2 print:py-1 print:px-2 text-xs bg-slate-50/50">
                  <div className="flex justify-between items-center font-bold text-slate-900">
                    <div>
                      <span className="text-[11px] print:text-[10px] font-bold text-slate-900">Items / Replacement Parts Cost:</span>
                      {jobToPrint.consumedInventory && jobToPrint.consumedInventory.length > 0 ? (
                        <p className="text-[10px] print:text-[9px] font-normal text-slate-600">
                          Replaced Parts: {jobToPrint.consumedInventory.map((ci) => `${ci.itemName} (x${ci.qty})`).join(', ')}
                        </p>
                      ) : (
                        <p className="text-[10px] print:text-[9px] font-normal text-slate-500 italic">
                          No spare parts consumed (Labor/Service repair only)
                        </p>
                      )}
                    </div>
                    <span className="font-mono text-[11px] print:text-[10px] font-bold text-slate-900">
                      Rs. {jobToPrint.totalInventoryCost.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 2: Service Charges */}
              <div>
                <h3 className="text-[10.5px] print:text-[9.5px] font-bold text-slate-900 uppercase tracking-wider mb-0.5">
                  2. Service & Maintenance Charges
                </h3>
                <div className="border border-slate-200 rounded-lg p-2 print:py-1 print:px-2 space-y-0.5 text-xs">
                  <div className="flex justify-between font-semibold text-slate-800 text-[10.5px] print:text-[9.5px]">
                    <span>Bench Repairing & Testing Labor Cost:</span>
                    <span className="font-mono font-bold">Rs. {jobToPrint.repairCost.toLocaleString()}</span>
                  </div>

                  {jobToPrint.referralCost > 0 && (
                    <div className="flex justify-between font-semibold text-slate-800 border-t border-slate-100 pt-0.5 text-[10.5px] print:text-[9.5px]">
                      <span>Referral & Booking Partner Fee:</span>
                      <span className="font-mono font-bold text-slate-900">Rs. {jobToPrint.referralCost.toLocaleString()}</span>
                    </div>
                  )}

                  {/* Additional Cost Heads */}
                  {jobToPrint.additionalCostHeads && jobToPrint.additionalCostHeads.length > 0 && (
                    jobToPrint.additionalCostHeads.map((head) => (
                      <div key={head.id} className="flex justify-between font-semibold text-slate-800 border-t border-slate-100 pt-0.5 text-[10.5px] print:text-[9.5px]">
                        <span>{head.name}:</span>
                        <span className="font-mono font-bold text-slate-900">Rs. {Number(head.amount).toLocaleString()}</span>
                      </div>
                    ))
                  )}

                  {jobToPrint.pickupCost > 0 && (
                    <div className="flex justify-between text-slate-700 font-medium text-[10.5px] print:text-[9.5px]">
                      <span>Pick Up Charges:</span>
                      <span className="font-mono font-bold">Rs. {jobToPrint.pickupCost.toLocaleString()}</span>
                    </div>
                  )}
                  {jobToPrint.deliveryCost > 0 && (
                    <div className="flex justify-between text-slate-700 font-medium text-[10.5px] print:text-[9.5px]">
                      <span>Delivery Charges:</span>
                      <span className="font-mono font-bold">Rs. {jobToPrint.deliveryCost.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Technician Remarks */}
              {jobToPrint.repairRemarks && (
                <div className="bg-amber-50/80 border border-amber-200 p-1.5 print:py-1 print:px-2 rounded-lg text-xs space-y-0.5">
                  <span className="font-bold text-amber-900 uppercase text-[9px] tracking-wider block">
                    Lab Technician Repair Note / Remarks:
                  </span>
                  <p className="text-amber-950 italic text-[10px] print:text-[9px]">{jobToPrint.repairRemarks}</p>
                </div>
              )}

              {/* Final Bill Box */}
              <div className="bg-slate-900 text-white p-2.5 sm:p-3 print:py-1.5 print:px-2.5 rounded-xl flex items-center justify-between shadow-xs">
                <div>
                  <p className="text-[9.5px] print:text-[8.5px] font-medium text-slate-400 uppercase tracking-wider">Final Bill Amount</p>
                  <div className="text-lg sm:text-xl print:text-base font-black font-mono text-amber-400">
                    Rs. {jobToPrint.totalBillAmount.toLocaleString()}
                  </div>
                  {jobToPrint.discount > 0 && (
                    <p className="text-[9.5px] print:text-[8.5px] text-emerald-400 font-semibold">
                      Includes Discount of Rs. {jobToPrint.discount.toLocaleString()}
                    </p>
                  )}
                </div>

                {printDocumentType === 'payment_receipt' && (
                  <div className="text-right border-l border-slate-800 pl-3 sm:pl-5">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full font-bold text-[10px] print:text-[9px] border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>PAID & CONFIRMED</span>
                    </div>
                    <p className="text-[10px] print:text-[9px] text-slate-400 mt-0.5">
                      Cash: Rs. {jobToPrint.cashPaid.toLocaleString()} | Online: Rs. {jobToPrint.onlinePaid.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {/* 6-Month Lab Hardware Warranty Certificate Card */}
              {printDocumentType === 'payment_receipt' && jobToPrint.paymentConfirmed && (() => {
                const dates = (() => {
                  let startDate = new Date();
                  if (jobToPrint.deliveryDate) {
                    const d = new Date(jobToPrint.deliveryDate);
                    if (!isNaN(d.getTime())) startDate = d;
                  } else if (jobToPrint.estimatedRepairDate) {
                    const d = new Date(jobToPrint.estimatedRepairDate);
                    if (!isNaN(d.getTime())) startDate = d;
                  }
                  const expiryDate = new Date(startDate);
                  expiryDate.setMonth(expiryDate.getMonth() + 6);
                  
                  const fmt = (date: Date) => {
                    const yyyy = date.getFullYear();
                    const mm = String(date.getMonth() + 1).padStart(2, '0');
                    const dd = String(date.getDate()).padStart(2, '0');
                    return `${yyyy}-${mm}-${dd}`;
                  };
                  return { start: fmt(startDate), expiry: fmt(expiryDate) };
                })();

                const replacedPartsNames = jobToPrint.consumedInventory && jobToPrint.consumedInventory.length > 0
                  ? jobToPrint.consumedInventory.map((ci) => ci.itemName).join(', ')
                  : 'bench-tested circuit & labor components';

                return (
                  <div className="mt-2 print:mt-1 border-2 border-emerald-700 bg-gradient-to-br from-emerald-50 via-slate-50 to-teal-50 p-2.5 sm:p-3 print:p-1.5 rounded-xl relative shadow-xs text-xs">
                    {/* Top Header Badge */}
                    <div className="flex items-center justify-between border-b border-emerald-300 pb-1.5 print:pb-1 mb-1.5 print:mb-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                          <Award className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-[8px] font-black uppercase text-emerald-800 tracking-widest block">
                            OFFICIAL INVERTISOL LAB CERTIFICATE
                          </span>
                          <h4 className="font-extrabold text-slate-900 text-[11px] print:text-[10px] uppercase tracking-wide">
                            6-Month Replaced Parts Hardware Warranty
                          </h4>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[8.5px] print:text-[8px] font-mono font-bold px-2 py-0.5 rounded-full shadow-xs uppercase">
                          <ShieldCheck className="w-2.5 h-2.5" />
                          <span>AUTHENTIC & VALID</span>
                        </span>
                        <p className="text-[8.5px] font-mono text-slate-500 mt-0.5 font-bold">
                          CERT # WAR-{jobToPrint.trackingId}
                        </p>
                      </div>
                    </div>

                    {/* Structured Warranty Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-white/95 p-1.5 print:p-1 rounded-lg border border-emerald-200/80 mb-1.5 print:mb-1 text-[9.5px]">
                      <div>
                        <span className="text-[8px] font-bold text-slate-400 uppercase block">Warranty Holder</span>
                        <span className="font-bold text-slate-900 text-[10px] block truncate">{jobToPrint.customerName}</span>
                        <span className="text-[9px] font-mono text-slate-500">{jobToPrint.mobileNo}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-bold text-slate-400 uppercase block">Equipment Specs</span>
                        <span className="font-bold text-slate-900 text-[10px] block truncate">{jobToPrint.inverterBrand} ({jobToPrint.inverterKva})</span>
                        <span className="text-[9px] font-mono text-slate-500">S/N: {jobToPrint.serialNo || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-bold text-slate-400 uppercase block">Effective Date</span>
                        <span className="font-bold text-emerald-700 font-mono text-[10px] block flex items-center gap-0.5">
                          <Calendar className="w-2.5 h-2.5 text-emerald-600" />
                          {dates.start}
                        </span>
                        <span className="text-[8px] text-slate-500">Settlement Date</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-bold text-slate-400 uppercase block">Expiry Date</span>
                        <span className="font-bold text-rose-700 font-mono text-[10px] block flex items-center gap-0.5">
                          <Calendar className="w-2.5 h-2.5 text-rose-600" />
                          {dates.expiry}
                        </span>
                        <span className="text-[8px] text-emerald-700 font-bold">180 Days Active</span>
                      </div>
                    </div>

                    {/* Coverage Details & Explicit Part-Only Rules */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-[9.5px] mb-1.5 print:mb-1">
                      <div className="bg-emerald-100/60 p-1.5 print:p-1 rounded-lg border border-emerald-200">
                        <p className="font-bold text-emerald-950 mb-0.5 flex items-center gap-1 text-[9.5px] print:text-[9px]">
                          <ShieldCheck className="w-2.5 h-2.5 text-emerald-700 shrink-0" />
                          <span>Covered Replaced Parts & Labor:</span>
                        </p>
                        <ul className="list-disc list-inside text-emerald-900 space-y-0.5 text-[9px] print:text-[8.5px] leading-tight">
                          <li><strong>Part-Specific Scope:</strong> Valid strictly for replaced/repaired components (<span className="font-bold text-emerald-950">{replacedPartsNames}</span>).</li>
                          <li>100% Free bench repair labor for replaced parts.</li>
                          <li>Laboratory benchmark stress load re-testing.</li>
                        </ul>
                      </div>

                      <div className="bg-amber-50/90 p-1.5 print:p-1 rounded-lg border border-amber-200">
                        <p className="font-bold text-amber-950 mb-0.5 flex items-center gap-1 text-[9.5px] print:text-[9px]">
                          <ShieldAlert className="w-2.5 h-2.5 text-amber-700 shrink-0" />
                          <span>Warranty Terms & Exclusion Rules:</span>
                        </p>
                        <ul className="list-disc list-inside text-amber-900 space-y-0.5 text-[9px] print:text-[8.5px] leading-tight">
                          <li className="font-bold text-rose-900">Any malfunction outside replaced parts is NOT covered.</li>
                          <li>Must present this Warranty Certificate or Tracking ID.</li>
                          <li>Void if security seal is broken or opened elsewhere.</li>
                          <li>Excludes lightning/grid surges, overvoltage, & liquid damage.</li>
                        </ul>
                      </div>
                    </div>

                    {/* Signatures & Stamp Row */}
                    <div className="flex items-center justify-between border-t border-emerald-200/80 pt-1 print:pt-0.5 text-[9px] print:text-[8.5px] text-slate-600">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                        <span>System Verified Settlement: <strong>Rs. {jobToPrint.totalBillAmount.toLocaleString()}</strong></span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">InvertiSOL Repairing Labs Certification</p>
                        <p className="text-[8.5px] print:text-[8px] text-slate-500">Authorized Officer Stamp & Signature</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* REPORT 1: PROFIT REPORT */}
          {printDocumentType === 'profit_report' && printReportData?.profitReport && (
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                <div>
                  <p className="text-slate-500 font-medium uppercase tracking-wider">Report Month:</p>
                  <p className="font-bold text-slate-900 font-mono text-sm">{printReportData.profitReport.month}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 font-medium uppercase tracking-wider">Total Monthly Jobs:</p>
                  <p className="font-bold text-slate-900 font-mono text-sm">
                    {printReportData.profitReport.monthlyJobsCount} Projects ({printReportData.profitReport.completedProjectsCount} Completed)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 text-xs">
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
                  <h3 className="font-bold text-emerald-800 uppercase tracking-wider border-b border-slate-200 pb-2">
                    1. Revenue Collections
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Cash Payments Received:</span>
                      <span className="font-mono font-bold">Rs. {printReportData.profitReport.cashPaymentsTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Online Payments Received:</span>
                      <span className="font-mono font-bold">Rs. {printReportData.profitReport.onlinePaymentsTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-amber-800">
                      <span>Total Cash Collections:</span>
                      <span className="font-mono">Rs. {printReportData.profitReport.totalCashReceived.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-emerald-900">
                      <span>Bench Repair Service Revenue:</span>
                      <span className="font-mono text-sm">Rs. {printReportData.profitReport.totalRepairingCostRevenue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
                  <h3 className="font-bold text-rose-800 uppercase tracking-wider border-b border-slate-200 pb-2">
                    2. Operational Expenses
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Salaries & Staff Wages:</span>
                      <span className="font-mono font-bold">Rs. {printReportData.profitReport.salariesTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Electricity & Utility Bills:</span>
                      <span className="font-mono font-bold">Rs. {printReportData.profitReport.billsTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Delivery & Logistics:</span>
                      <span className="font-mono font-bold">Rs. {printReportData.profitReport.deliveryChargesTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Inventory Consumed Cost:</span>
                      <span className="font-mono font-bold">Rs. {printReportData.profitReport.inventoryCostTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Miscellaneous Expenses:</span>
                      <span className="font-mono font-bold">Rs. {printReportData.profitReport.otherExpensesTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-rose-800">
                      <span>Total Operational Expenses:</span>
                      <span className="font-mono">Rs. {printReportData.profitReport.totalExpensesSum.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-teal-900 text-white p-5 rounded-xl flex items-center justify-between shadow-md">
                <div>
                  <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">Calculated Net Lab Profit</p>
                  <p className="text-[11px] text-slate-300 mt-1">
                    Net Profit = Bench Repair Labor Revenue - Total Expenses
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black font-mono text-amber-300">
                    Rs. {printReportData.profitReport.netCalculatedProfit.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mt-12 text-xs pt-8 border-t border-slate-300">
                <div>
                  <p className="text-slate-500 mb-8">Lab Manager Signature & Stamp:</p>
                  <div className="border-b border-slate-400 w-full"></div>
                </div>
                <div>
                  <p className="text-slate-500 mb-8">Executive Director / Auditor:</p>
                  <div className="border-b border-slate-400 w-full"></div>
                </div>
              </div>
            </div>
          )}

          {/* REPORT 2: DAY PROGRESS REPORT */}
          {printDocumentType === 'day_progress' && printReportData?.dayProgressReport && (
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                <div>
                  <p className="text-slate-500 font-medium uppercase tracking-wider">Date Inspected:</p>
                  <p className="font-bold text-slate-900 font-mono text-sm">{printReportData.dayProgressReport.date}</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                  <p className="text-slate-500 font-medium">New Projects</p>
                  <p className="text-2xl font-black font-mono text-cyan-700 mt-1">
                    {printReportData.dayProgressReport.newProjectsCount}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                  <p className="text-slate-500 font-medium">Completed Jobs</p>
                  <p className="text-2xl font-black font-mono text-emerald-700 mt-1">
                    {printReportData.dayProgressReport.dayCompletedCount}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                  <p className="text-slate-500 font-medium">Under Maintenance</p>
                  <p className="text-2xl font-black font-mono text-amber-700 mt-1">
                    {printReportData.dayProgressReport.dayUnderMaintenanceCount}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                  <p className="text-slate-500 font-medium">Awaiting Parts</p>
                  <p className="text-2xl font-black font-mono text-rose-700 mt-1">
                    {printReportData.dayProgressReport.dayAwaitingPartsCount}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Job Records for {printReportData.dayProgressReport.date}
                </h3>
                <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Tracking ID</th>
                      <th className="p-2.5">Customer Name</th>
                      <th className="p-2.5">Inverter Model</th>
                      <th className="p-2.5">Current Status</th>
                      <th className="p-2.5 text-right">Approx Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {printReportData.dayProgressReport.dayJobs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-slate-400 italic">
                          No jobs recorded on this date.
                        </td>
                      </tr>
                    ) : (
                      printReportData.dayProgressReport.dayJobs.map((j, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-mono font-bold text-[#008b9b]">#{j.trackingId}</td>
                          <td className="p-2.5 font-semibold text-slate-900">{j.customerName}</td>
                          <td className="p-2.5 text-slate-700">{j.inverterBrand}</td>
                          <td className="p-2.5 font-bold text-slate-800">{j.status}</td>
                          <td className="p-2.5 text-right font-mono font-bold">Rs. {j.approximateCost.toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-2 gap-8 mt-12 text-xs pt-8 border-t border-slate-300">
                <div>
                  <p className="text-slate-500 mb-8">Lab Supervisor Signature:</p>
                  <div className="border-b border-slate-400 w-full"></div>
                </div>
                <div>
                  <p className="text-slate-500 mb-8">Official Stamp:</p>
                  <div className="border-b border-slate-400 w-full"></div>
                </div>
              </div>
            </div>
          )}

          {/* REPORT 3: STOCK VALUATION REPORT */}
          {printDocumentType === 'stock_report' && printReportData?.stockReport && (
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                <div>
                  <p className="text-slate-500 font-medium uppercase tracking-wider">Report Title:</p>
                  <p className="font-bold text-slate-900 text-sm">Inventory Stock Valuation Statement</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 font-medium uppercase tracking-wider">Total Stock Valuation:</p>
                  <p className="font-bold text-[#008b9b] font-mono text-base">
                    Rs. {printReportData.stockReport.totalStockValue.toLocaleString()}
                  </p>
                </div>
              </div>

              <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Item Name</th>
                    <th className="p-2.5 text-center">Unit of Issue</th>
                    <th className="p-2.5 text-center">Qty in Stock</th>
                    <th className="p-2.5 text-right">Unit Price</th>
                    <th className="p-2.5 text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {printReportData.stockReport.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 font-semibold text-slate-900">{item.name}</td>
                      <td className="p-2.5 text-center text-slate-600">{item.unitOfIssue}</td>
                      <td className="p-2.5 text-center font-mono font-bold">{item.qtyInStock}</td>
                      <td className="p-2.5 text-right font-mono">Rs. {item.unitPrice.toLocaleString()}</td>
                      <td className="p-2.5 text-right font-mono font-bold text-[#008b9b]">
                        Rs. {item.totalAmount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100 font-bold border-t border-slate-200">
                  <tr>
                    <td colSpan={4} className="p-2.5 text-right uppercase">Total Available Valuation:</td>
                    <td className="p-2.5 text-right font-mono text-sm text-[#008b9b]">
                      Rs. {printReportData.stockReport.totalStockValue.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>

              <div className="grid grid-cols-2 gap-8 mt-12 text-xs pt-8 border-t border-slate-300">
                <div>
                  <p className="text-slate-500 mb-8">Store Incharge Signature:</p>
                  <div className="border-b border-slate-400 w-full"></div>
                </div>
                <div>
                  <p className="text-slate-500 mb-8">Lab Manager Approval & Stamp:</p>
                  <div className="border-b border-slate-400 w-full"></div>
                </div>
              </div>
            </div>
          )}

          {/* REPORT 4: CONSUMPTION REPORT */}
          {printDocumentType === 'consumption_report' && printReportData?.consumptionReport && (
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                <div>
                  <p className="text-slate-500 font-medium uppercase tracking-wider">Date Range:</p>
                  <p className="font-bold text-slate-900 font-mono text-sm">
                    {printReportData.consumptionReport.dateFrom} to {printReportData.consumptionReport.dateTo}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 font-medium uppercase tracking-wider">Total Consumed Cost:</p>
                  <p className="font-bold text-[#008b9b] font-mono text-base">
                    Rs. {printReportData.consumptionReport.totalCost.toLocaleString()}
                  </p>
                </div>
              </div>

              <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Tracking ID</th>
                    <th className="p-2.5">Item Name</th>
                    <th className="p-2.5 text-center">Units Consumed</th>
                    <th className="p-2.5 text-right">Cost</th>
                    <th className="p-2.5 text-center">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {printReportData.consumptionReport.records.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-400 italic">
                        No inventory consumed in selected date range.
                      </td>
                    </tr>
                  ) : (
                    printReportData.consumptionReport.records.map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2.5 font-mono font-bold text-[#008b9b]">#{r.trackingId}</td>
                        <td className="p-2.5 font-medium text-slate-900">{r.itemName}</td>
                        <td className="p-2.5 text-center font-mono font-bold">{r.units}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-emerald-700">
                          Rs. {r.cost.toLocaleString()}
                        </td>
                        <td className="p-2.5 text-center font-mono text-slate-500">{r.date}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-slate-100 font-bold border-t border-slate-200">
                  <tr>
                    <td colSpan={3} className="p-2.5 text-right uppercase">Total Material Cost Consumed:</td>
                    <td className="p-2.5 text-right font-mono text-sm text-[#008b9b]">
                      Rs. {printReportData.consumptionReport.totalCost.toLocaleString()}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>

              <div className="grid grid-cols-2 gap-8 mt-12 text-xs pt-8 border-t border-slate-300">
                <div>
                  <p className="text-slate-500 mb-8">Store Officer Signature:</p>
                  <div className="border-b border-slate-400 w-full"></div>
                </div>
                <div>
                  <p className="text-slate-500 mb-8">Auditor Approval & Stamp:</p>
                  <div className="border-b border-slate-400 w-full"></div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Statement */}
          <div className="border-t pt-2 print:pt-1 text-center text-[9.5px] print:text-[8.5px] text-slate-500">
            <p className="font-bold text-slate-700">This is an official System Generated Document by InvertiSOL Repairing Labs Engine.</p>
            <p>For questions or assistance, please contact {labHelplinePhone}.</p>
          </div>
        </div>

        {/* Bottom Exit Control Bar (Screen only) */}
        <div className="bg-slate-900 px-6 py-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="text-xs text-slate-400 font-medium">
            Done reviewing? Click <span className="text-rose-400 font-bold">Close</span> or press anywhere outside to exit preview.
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Document</span>
            </button>
            <button
              type="button"
              onClick={closeModal}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Close / Exit Preview</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
