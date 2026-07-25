import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Printer, X, Share2, Zap, Download, Loader2, CheckCircle2 } from 'lucide-react';

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
  } = useApp();

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const jobToPrint = jobs.find((j) => j.id === selectedPrintJob?.id) || selectedPrintJob;

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
        return 'LAB & CUSTOMER CHIT SLIP';
      case 'bill':
        return 'OFFICIAL GENERATED BILL';
      case 'payment_receipt':
        return 'PAYMENT RECEIPT';
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
          <div className="bg-slate-800 px-6 py-2 border-b border-slate-700 flex items-center justify-center gap-2 print:hidden text-xs">
            <span className="text-[11px] font-bold text-slate-400 mr-1">Switch View:</span>
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
            <button
              type="button"
              onClick={() => setPrintDocumentType('payment_receipt')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                printDocumentType === 'payment_receipt'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
              }`}
            >
              💳 Payment Receipt
            </button>
          </div>
        )}

        {/* Printable Area */}
        <div className="p-8 space-y-8 font-sans print:p-0 print:m-0 print:shadow-none" id="printable-area">
          {/* Header Branding */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {appLogo ? (
                <img
                  src={appLogo}
                  alt="InvertiSOL Brand Logo"
                  className="h-20 w-auto max-w-[280px] object-contain"
                />
              ) : (
                <div className="w-14 h-14 bg-slate-900 text-amber-400 rounded-xl flex items-center justify-center font-black text-xl border-2 border-amber-500">
                  IS
                </div>
              )}
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  InvertiSOL Repairing Labs
                </h1>
                <p className="text-xs font-semibold text-slate-600">
                  Solar Inverter Repairing & Maintenance Specialists
                </p>
                <p className="text-[11px] text-slate-500">
                  {labAddress} | Helpline: {labHelplinePhone}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block bg-slate-900 text-amber-300 text-[11px] font-bold px-3 py-1 rounded-md tracking-wider uppercase">
                {getBadgeTitle()}
              </span>
              {jobToPrint && (
                <p className="text-xs text-slate-500 mt-1 font-mono font-bold">
                  Tracking ID: {jobToPrint.trackingId}
                </p>
              )}
              {printReportData && (
                <p className="text-xs text-slate-500 mt-1 font-mono font-bold">
                  {printReportData.periodLabel || printReportData.subtitle || new Date().toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* DOCUMENT TYPE 1: JOB TAG CHIT */}
          {printDocumentType === 'job_tag' && jobToPrint && (
            <div className="space-y-8">
              {/* SECTION A: LAB / OFFICE COPY */}
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

              {/* SECTION B: CUSTOMER COPY */}
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
            </div>
          )}

          {/* DOCUMENT TYPE 2: GENERATED BILL / RECEIPT */}
          {(printDocumentType === 'bill' || printDocumentType === 'payment_receipt') && jobToPrint && (
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <p className="text-slate-500">Customer Name:</p>
                  <p className="font-bold text-slate-900">{jobToPrint.customerName}</p>
                </div>
                <div>
                  <p className="text-slate-500">Mobile No:</p>
                  <p className="font-bold text-slate-900">{jobToPrint.mobileNo}</p>
                </div>
                <div>
                  <p className="text-slate-500">Inverter Model:</p>
                  <p className="font-bold text-slate-900">{jobToPrint.inverterBrand}</p>
                </div>
                <div>
                  <p className="text-slate-500">Address:</p>
                  <p className="font-bold text-slate-900 truncate">{jobToPrint.address || 'Lab Walk-in'}</p>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  1. Replacement Parts & Materials Cost
                </h3>
                <div className="border border-slate-200 rounded-lg p-3 text-xs bg-slate-50/50">
                  <div className="flex justify-between items-center font-bold text-slate-900">
                    <div>
                      <span className="text-sm font-bold text-slate-900">Items / Replacement Parts Cost:</span>
                      {jobToPrint.consumedInventory && jobToPrint.consumedInventory.length > 0 ? (
                        <p className="text-[11px] font-normal text-slate-600 mt-0.5">
                          Replaced Parts: {jobToPrint.consumedInventory.map((ci) => `${ci.itemName} (x${ci.qty})`).join(', ')}
                        </p>
                      ) : (
                        <p className="text-[11px] font-normal text-slate-500 italic mt-0.5">
                          No spare parts consumed (Labor/Service repair only)
                        </p>
                      )}
                    </div>
                    <span className="font-mono text-sm font-bold text-slate-900">
                      Rs. {jobToPrint.totalInventoryCost.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  2. Service & Maintenance Charges
                </h3>
                <div className="border border-slate-200 rounded-lg p-3 space-y-2 text-xs">
                  <div className="flex justify-between font-semibold text-slate-800">
                    <span>Bench Repairing & Testing Labor Cost:</span>
                    <span className="font-mono font-bold">Rs. {jobToPrint.repairCost.toLocaleString()}</span>
                  </div>

                  {jobToPrint.referralCost > 0 && (
                    <div className="flex justify-between font-semibold text-slate-800 border-t border-slate-100 pt-1.5">
                      <span>Referral & Booking Partner Fee:</span>
                      <span className="font-mono font-bold text-slate-900">Rs. {jobToPrint.referralCost.toLocaleString()}</span>
                    </div>
                  )}

                  {/* Additional Cost Heads */}
                  {jobToPrint.additionalCostHeads && jobToPrint.additionalCostHeads.length > 0 && (
                    jobToPrint.additionalCostHeads.map((head) => (
                      <div key={head.id} className="flex justify-between font-semibold text-slate-800 border-t border-slate-100 pt-1.5">
                        <span>{head.name}:</span>
                        <span className="font-mono font-bold text-slate-900">Rs. {Number(head.amount).toLocaleString()}</span>
                      </div>
                    ))
                  )}

                  {jobToPrint.pickupCost > 0 && (
                    <div className="flex justify-between text-slate-700 font-medium">
                      <span>Pick Up Charges:</span>
                      <span className="font-mono font-bold">Rs. {jobToPrint.pickupCost.toLocaleString()}</span>
                    </div>
                  )}
                  {jobToPrint.deliveryCost > 0 && (
                    <div className="flex justify-between text-slate-700 font-medium">
                      <span>Delivery Charges:</span>
                      <span className="font-mono font-bold">Rs. {jobToPrint.deliveryCost.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Technician Remarks on Printable Bill */}
              {jobToPrint.repairRemarks && (
                <div className="bg-amber-50/80 border border-amber-200 p-3 rounded-lg text-xs space-y-0.5">
                  <span className="font-bold text-amber-900 uppercase text-[10px] tracking-wider block">
                    Lab Technician Repair Note / Remarks:
                  </span>
                  <p className="text-amber-950 italic">{jobToPrint.repairRemarks}</p>
                </div>
              )}

              <div className="bg-slate-900 text-white p-5 rounded-xl flex items-center justify-between shadow-md">
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Final Bill Amount</p>
                  <div className="text-2xl font-black font-mono text-amber-400">
                    Rs. {jobToPrint.totalBillAmount.toLocaleString()}
                  </div>
                  {jobToPrint.discount > 0 && (
                    <p className="text-xs text-emerald-400 font-semibold mt-0.5">
                      Includes Discount of Rs. {jobToPrint.discount.toLocaleString()}
                    </p>
                  )}
                </div>

                {printDocumentType === 'payment_receipt' && (
                  <div className="text-right border-l border-slate-800 pl-6">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full font-bold text-xs border border-emerald-500/30">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>PAID & CONFIRMED</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Cash: Rs. {jobToPrint.cashPaid.toLocaleString()} | Online: Rs. {jobToPrint.onlinePaid.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
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
          <div className="border-t pt-4 text-center text-[10px] text-slate-500">
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
