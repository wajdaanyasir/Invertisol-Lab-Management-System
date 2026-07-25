import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  UserAccount,
  Job,
  JobStatus,
  InventoryItem,
  ConsumedInventoryItem,
  CashTransaction,
  ExpenseCategory,
  ReferralFranchise,
  MobileWalletAccount,
  BankAccount,
  ScheduleChargesConfig,
  AppNotification,
  ReportPrintData,
} from '../types';
import { Language, AppTheme, translations } from '../utils/translations';
import {
  INITIAL_USERS,
  INITIAL_INVENTORY,
  INITIAL_EXPENSE_CATEGORIES,
  INITIAL_FRANCHISES,
  INITIAL_WALLETS,
  INITIAL_BANKS,
  INITIAL_SCHEDULE_CHARGES,
  INITIAL_JOBS,
  INITIAL_CASH_TRANSACTIONS,
  INITIAL_NOTIFICATIONS,
} from '../data/initialData';

interface AppContextType {
  // Navigation & Role State
  portalMode: 'admin' | 'customer';
  setPortalMode: (mode: 'admin' | 'customer') => void;
  currentUser: UserAccount;
  setCurrentUser: (user: UserAccount) => void;
  users: UserAccount[];
  activeTab: string;
  setActiveTab: (tabId: string) => void;

  // Theme, Language & Branding State
  appTheme: AppTheme;
  setAppTheme: (theme: AppTheme) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  appLogo: string | null;
  setAppLogo: (logoDataUrl: string | null) => void;
  t: (key: string) => string;

  // Data Collections
  jobs: Job[];
  inventory: InventoryItem[];
  transactions: CashTransaction[];
  expenseCategories: ExpenseCategory[];
  franchises: ReferralFranchise[];
  wallets: MobileWalletAccount[];
  banks: BankAccount[];
  scheduleCharges: ScheduleChargesConfig;
  notifications: AppNotification[];

  // Cash Balances
  counterCashBalance: number;
  bankBalance: number;

  // Job Actions
  addJob: (jobData: Partial<Job>) => Job;
  updateJobStatus: (
    jobId: string,
    newStatus: JobStatus,
    remarks?: string,
    consumedItems?: { itemId: string; qty: number }[],
    technicianDispatched?: { name: string; phone: string; remarks: string }
  ) => void;
  generateBill: (
    jobId: string,
    repairCost: number,
    referralCost: number,
    pickupCost: number,
    deliveryCost: number,
    consumedItems?: ConsumedInventoryItem[]
  ) => void;
  downgradeJobStatus: (jobId: string, targetStatus: JobStatus) => void;
  confirmPayment: (
    jobId: string,
    discount: number,
    cashPaid: number,
    onlinePaid: number,
    onlineScreenshot?: string
  ) => { success: boolean; error?: string };
  deleteJob: (jobId: string) => void;

  // Inventory Actions
  addInventoryStock: (itemId: string, addQty: number) => void;
  createInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateInventoryItem: (id: string, name: string, unitOfIssue: InventoryItem['unitOfIssue']) => void;
  deleteInventoryItem: (id: string) => void;

  // Cash Register & Expense Actions
  addExpense: (
    category: string,
    amount: number,
    remarks: string,
    date?: string
  ) => { success: boolean; error?: string };
  transferCash: (from: 'counter' | 'bank', to: 'counter' | 'bank', amount: number, remarks: string) => void;
  adjustCash: (account: 'counter' | 'bank', action: 'add' | 'remove', amount: number, remarks: string) => void;
  deleteTransaction: (txId: string) => void;
  addExpenseCategory: (name: string) => void;

  // Referral Actions
  addFranchise: (
    name: string,
    mobileNo: string,
    address: string,
    cityCode: string,
    uniqueFourDigit: string
  ) => { success: boolean; error?: string };
  toggleFranchiseActive: (id: string) => void;

  // Accounts & Wallets Actions
  addWallet: (wallet: Omit<MobileWalletAccount, 'id'>) => void;
  deleteWallet: (id: string) => void;
  addBank: (bank: Omit<BankAccount, 'id'>) => void;
  deleteBank: (id: string) => void;

  // Schedule Charges Action
  updateScheduleCharges: (config: ScheduleChargesConfig) => void;

  // Users Management Action
  addUser: (username: string, role: UserRole, authorizedTabs: string[]) => void;
  updateUserTabs: (userId: string, authorizedTabs: string[]) => void;
  deleteUser: (userId: string) => void;

  // Utilities & Reports
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  downloadDatabase: () => void;
  selectedPrintJob: Job | null;
  setSelectedPrintJob: (job: Job | null) => void;
  printReportData: ReportPrintData | null;
  setPrintReportData: (data: ReportPrintData | null) => void;
  printDocumentType: 'job_tag' | 'bill' | 'payment_receipt' | 'profit_report' | 'day_progress' | 'stock_report' | 'consumption_report' | 'referral_report' | null;
  setPrintDocumentType: (
    type: 'job_tag' | 'bill' | 'payment_receipt' | 'profit_report' | 'day_progress' | 'stock_report' | 'consumption_report' | 'referral_report' | null
  ) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [portalMode, setPortalMode] = useState<'admin' | 'customer'>('admin');
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('invertisol_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });
  const [currentUser, setCurrentUser] = useState<UserAccount>(users[0]);
  const [activeTab, setActiveTab] = useState<string>('jobs');

  const [jobs, setJobs] = useState<Job[]>(() => {
    const saved = localStorage.getItem('invertisol_jobs');
    return saved ? JSON.parse(saved) : INITIAL_JOBS;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('invertisol_inventory');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  const [transactions, setTransactions] = useState<CashTransaction[]>(() => {
    const saved = localStorage.getItem('invertisol_transactions');
    return saved ? JSON.parse(saved) : INITIAL_CASH_TRANSACTIONS;
  });

  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>(() => {
    const saved = localStorage.getItem('invertisol_expense_categories');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSE_CATEGORIES;
  });

  const [franchises, setFranchises] = useState<ReferralFranchise[]>(() => {
    const saved = localStorage.getItem('invertisol_franchises');
    return saved ? JSON.parse(saved) : INITIAL_FRANCHISES;
  });

  const [wallets, setWallets] = useState<MobileWalletAccount[]>(() => {
    const saved = localStorage.getItem('invertisol_wallets');
    return saved ? JSON.parse(saved) : INITIAL_WALLETS;
  });

  const [banks, setBanks] = useState<BankAccount[]>(() => {
    const saved = localStorage.getItem('invertisol_banks');
    return saved ? JSON.parse(saved) : INITIAL_BANKS;
  });

  const [scheduleCharges, setScheduleCharges] = useState<ScheduleChargesConfig>(() => {
    const saved = localStorage.getItem('invertisol_schedule_charges');
    return saved ? JSON.parse(saved) : INITIAL_SCHEDULE_CHARGES;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('invertisol_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [selectedPrintJob, setSelectedPrintJob] = useState<Job | null>(null);
  const [printReportData, setPrintReportData] = useState<ReportPrintData | null>(null);
  const [printDocumentType, setPrintDocumentType] = useState<
    'job_tag' | 'bill' | 'payment_receipt' | 'profit_report' | 'day_progress' | 'stock_report' | 'consumption_report' | 'referral_report' | null
  >(null);

  // Theme, Language, and Logo State
  const [appTheme, setAppTheme] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('invertisol_theme');
    return (saved as AppTheme) || 'solar';
  });

  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('invertisol_language');
    return (saved as Language) || 'en';
  });

  const [appLogo, setAppLogo] = useState<string | null>(() => {
    return localStorage.getItem('invertisol_logo') || null;
  });

  // Translation Helper Function
  const t = (key: string): string => {
    const dict = translations[language] || translations.en;
    return (dict as any)[key] || (translations.en as any)[key] || key;
  };

  // Sync Theme, Language & Logo to LocalStorage
  useEffect(() => {
    localStorage.setItem('invertisol_theme', appTheme);
  }, [appTheme]);

  useEffect(() => {
    localStorage.setItem('invertisol_language', language);
    // Set document direction for RTL when Urdu is active
    if (language === 'ur') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ur';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'en';
    }
  }, [language]);

  useEffect(() => {
    if (appLogo) {
      localStorage.setItem('invertisol_logo', appLogo);
    } else {
      localStorage.removeItem('invertisol_logo');
    }
  }, [appLogo]);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('invertisol_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('invertisol_jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('invertisol_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('invertisol_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('invertisol_expense_categories', JSON.stringify(expenseCategories));
  }, [expenseCategories]);

  useEffect(() => {
    localStorage.setItem('invertisol_franchises', JSON.stringify(franchises));
  }, [franchises]);

  useEffect(() => {
    localStorage.setItem('invertisol_wallets', JSON.stringify(wallets));
  }, [wallets]);

  useEffect(() => {
    localStorage.setItem('invertisol_banks', JSON.stringify(banks));
  }, [banks]);

  useEffect(() => {
    localStorage.setItem('invertisol_schedule_charges', JSON.stringify(scheduleCharges));
  }, [scheduleCharges]);

  useEffect(() => {
    localStorage.setItem('invertisol_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Compute Balances
  const counterCashBalance = transactions.reduce((acc, tx) => {
    if (tx.account === 'counter') {
      if (tx.type === 'inflow') return acc + tx.amount;
      if (tx.type === 'outflow') return acc - tx.amount;
      if (tx.type === 'adjustment') return acc + tx.amount;
    }
    if (tx.type === 'transfer') {
      if (tx.account === 'bank' && tx.toAccount === 'counter') return acc + tx.amount;
      if (tx.account === 'counter' && tx.toAccount === 'bank') return acc - tx.amount;
    }
    return acc;
  }, 0);

  const bankBalance = transactions.reduce((acc, tx) => {
    if (tx.account === 'bank') {
      if (tx.type === 'inflow') return acc + tx.amount;
      if (tx.type === 'outflow') return acc - tx.amount;
      if (tx.type === 'adjustment') return acc + tx.amount;
    }
    if (tx.type === 'transfer') {
      if (tx.account === 'counter' && tx.toAccount === 'bank') return acc + tx.amount;
      if (tx.account === 'bank' && tx.toAccount === 'counter') return acc - tx.amount;
    }
    return acc;
  }, 0);

  // Auto-check for Overdue Jobs & push notification
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    jobs.forEach((job) => {
      if (
        job.estimatedRepairDate < todayStr &&
        job.status !== 'Repaired & Ready for Delivery' &&
        job.status !== 'Delivered & Paid'
      ) {
        // Check if notification already exists
        const exists = notifications.some((n) => n.jobTrackingId === job.trackingId && n.type === 'overdue');
        if (!exists) {
          const newNotif: AppNotification = {
            id: `notif-overdue-${job.id}-${Date.now()}`,
            title: 'Overdue Repair Alert!',
            message: `Job #${job.trackingId} (${job.customerName}) passed estimated repair date (${job.estimatedRepairDate}) and is still in ${job.status}.`,
            timestamp: 'Just now',
            read: false,
            type: 'overdue',
            jobTrackingId: job.trackingId,
          };
          setNotifications((prev) => [newNotif, ...prev]);
        }
      }
    });
  }, [jobs]);

  // Generate Sequential Tracking ID DDMMYY0001
  const generateTrackingId = (): string => {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yy = String(now.getFullYear()).slice(-2);
    const prefix = `${dd}${mm}${yy}`;

    // Filter jobs created today starting with this prefix
    const todayJobs = jobs.filter((j) => j.trackingId.startsWith(prefix));
    let highest = 0;
    todayJobs.forEach((j) => {
      const numPart = parseInt(j.trackingId.slice(6), 10);
      if (!isNaN(numPart) && numPart > highest) {
        highest = numPart;
      }
    });
    const nextSeq = String(highest + 1).padStart(4, '0');
    return `${prefix}${nextSeq}`;
  };

  // Add Job Action
  const addJob = (jobData: Partial<Job>): Job => {
    const trackingId = generateTrackingId();
    const nowIso = new Date().toISOString();
    const dateOnly = nowIso.split('T')[0];

    const newJob: Job = {
      id: `job-${Date.now()}`,
      trackingId,
      customerName: jobData.customerName || 'Walk-in Customer',
      mobileNo: jobData.mobileNo || '',
      address: jobData.address || '',
      inverterBrand: jobData.inverterBrand || '',
      inverterKva: jobData.inverterKva || '',
      issueDescription: jobData.issueDescription || '',
      labLocation: jobData.labLocation || 'Main Lab',
      estimatedRepairDate: jobData.estimatedRepairDate || dateOnly,
      approximateCost: jobData.approximateCost || 0,
      status: (jobData.status as JobStatus) || 'Complaint Filed',
      statusHistory: [
        {
          status: (jobData.status as JobStatus) || 'Complaint Filed',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          remarks: jobData.issueDescription || 'New job registered',
          updatedBy: currentUser.username,
        },
      ],
      consumedInventory: [],
      referralId: jobData.referralId || '',
      repairCost: jobData.approximateCost || 0,
      referralCost: jobData.referralId ? scheduleCharges.defaultReferralShare : 0,
      pickupCost: scheduleCharges.pickupCharges,
      deliveryCost: scheduleCharges.deliveryCharges,
      totalInventoryCost: 0,
      totalBillAmount: (jobData.approximateCost || 0) + scheduleCharges.pickupCharges + scheduleCharges.deliveryCharges,
      billGenerated: false,
      discount: 0,
      cashPaid: 0,
      onlinePaid: 0,
      finalPayment: 0,
      paymentConfirmed: false,
      createdAt: nowIso,
      createdDateOnly: dateOnly,
    };

    setJobs((prev) => [newJob, ...prev]);

    // Push notification
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'New Job Registered',
      message: `Job #${trackingId} added for ${newJob.customerName} (${newJob.inverterBrand})`,
      timestamp: 'Just now',
      read: false,
      type: 'system',
      jobTrackingId: trackingId,
    };
    setNotifications((prev) => [notif, ...prev]);

    return newJob;
  };

  // Update Job Status
  const updateJobStatus = (
    jobId: string,
    newStatus: JobStatus,
    remarks?: string,
    consumedItems?: { itemId: string; qty: number }[],
    technicianDispatched?: { name: string; phone: string; remarks: string }
  ) => {
    setJobs((prevJobs) =>
      prevJobs.map((job) => {
        if (job.id !== jobId) return job;

        let newConsumedList = [...job.consumedInventory];

        // Process inventory consumption if provided
        if (consumedItems && consumedItems.length > 0) {
          consumedItems.forEach(({ itemId, qty }) => {
            const invItem = inventory.find((i) => i.id === itemId);
            if (invItem && qty > 0) {
              const totalCost = invItem.unitPrice * qty;
              // Check if already in consumed list
              const existingIndex = newConsumedList.findIndex((ci) => ci.itemId === itemId);
              if (existingIndex >= 0) {
                newConsumedList[existingIndex].qty += qty;
                newConsumedList[existingIndex].totalCost += totalCost;
              } else {
                newConsumedList.push({
                  itemId,
                  itemName: invItem.name,
                  qty,
                  unitPrice: invItem.unitPrice,
                  totalCost,
                });
              }

              // Deduct stock from inventory
              setInventory((prevInv) =>
                prevInv.map((inv) =>
                  inv.id === itemId ? { ...inv, qtyInStock: Math.max(0, inv.qtyInStock - qty) } : inv
                )
              );
            }
          });
        }

        const totalInventoryCost = newConsumedList.reduce((acc, item) => acc + item.totalCost, 0);
        const totalBillAmount =
          job.repairCost + job.referralCost + job.pickupCost + job.deliveryCost + totalInventoryCost;

        const updatedHistory = [
          ...job.statusHistory,
          {
            status: newStatus,
            timestamp: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}`,
            remarks: remarks || `Status updated to ${newStatus}`,
            updatedBy: currentUser.username,
          },
        ];

        return {
          ...job,
          status: newStatus,
          statusHistory: updatedHistory,
          consumedInventory: newConsumedList,
          totalInventoryCost,
          totalBillAmount,
          technicianDispatched: technicianDispatched
            ? { ...technicianDispatched, dispatchDate: new Date().toISOString().split('T')[0] }
            : job.technicianDispatched,
        };
      })
    );

    // Notification
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Job Status Updated',
      message: `Job status changed to ${newStatus}`,
      timestamp: 'Just now',
      read: false,
      type: 'status_update',
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Generate Bill
  const generateBill = (
    jobId: string,
    repairCost: number,
    referralCost: number,
    pickupCost: number,
    deliveryCost: number,
    consumedItems?: ConsumedInventoryItem[]
  ) => {
    setJobs((prevJobs) =>
      prevJobs.map((job) => {
        if (job.id !== jobId) return job;

        const updatedConsumed = consumedItems || job.consumedInventory;
        const totalInventoryCost = updatedConsumed.reduce((sum, item) => sum + item.totalCost, 0);
        const totalBillAmount = repairCost + referralCost + pickupCost + deliveryCost + totalInventoryCost;

        return {
          ...job,
          repairCost,
          referralCost,
          pickupCost,
          deliveryCost,
          consumedInventory: updatedConsumed,
          totalInventoryCost,
          totalBillAmount,
          billGenerated: true,
          billGeneratedAt: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}`,
        };
      })
    );
  };

  // Downgrade Status
  const downgradeJobStatus = (jobId: string, targetStatus: JobStatus) => {
    setJobs((prevJobs) =>
      prevJobs.map((job) => {
        if (job.id !== jobId) return job;
        return {
          ...job,
          status: targetStatus,
          billGenerated: false,
          statusHistory: [
            ...job.statusHistory,
            {
              status: targetStatus,
              timestamp: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}`,
              remarks: `Status downgraded to ${targetStatus} to correct record/bill`,
              updatedBy: currentUser.username,
            },
          ],
        };
      })
    );
  };

  // Confirm Payment with Strict Validation
  const confirmPayment = (
    jobId: string,
    discount: number,
    cashPaid: number,
    onlinePaid: number,
    onlineScreenshot?: string
  ): { success: boolean; error?: string } => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return { success: false, error: 'Job not found' };

    const expectedTotal = job.totalBillAmount - discount;
    const actualReceived = cashPaid + onlinePaid;

    if (Math.abs(expectedTotal - actualReceived) > 0.01) {
      return {
        success: false,
        error: `Payment Mismatch! Total Bill after Rs. ${discount} discount is Rs. ${expectedTotal.toLocaleString()}, but received total is Rs. ${actualReceived.toLocaleString()}. Payment amount must match exactly.`,
      };
    }

    const nowIso = new Date().toISOString();

    // 1. Post to Cash Register
    const newTxs: CashTransaction[] = [];
    if (cashPaid > 0) {
      newTxs.push({
        id: `tx-${Date.now()}-cash`,
        date: nowIso,
        type: 'inflow',
        account: 'counter',
        amount: cashPaid,
        category: 'Customer Payment (Cash)',
        jobId: job.id,
        remarks: `Cash Payment for Job #${job.trackingId} (${job.customerName})`,
        performedBy: currentUser.username,
      });
    }
    if (onlinePaid > 0) {
      newTxs.push({
        id: `tx-${Date.now()}-online`,
        date: nowIso,
        type: 'inflow',
        account: 'bank',
        amount: onlinePaid,
        category: 'Customer Payment (Online/Bank)',
        jobId: job.id,
        remarks: `Online Payment for Job #${job.trackingId} (${job.customerName})`,
        performedBy: currentUser.username,
      });
    }

    if (newTxs.length > 0) {
      setTransactions((prev) => [...newTxs, ...prev]);
    }

    // 2. Update Job
    setJobs((prevJobs) =>
      prevJobs.map((j) => {
        if (j.id !== jobId) return j;
        return {
          ...j,
          discount,
          cashPaid,
          onlinePaid,
          finalPayment: actualReceived,
          onlinePaymentScreenshot: onlineScreenshot,
          paymentConfirmed: true,
          paymentConfirmedAt: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}`,
          status: 'Delivered & Paid',
          statusHistory: [
            ...j.statusHistory,
            {
              status: 'Delivered & Paid',
              timestamp: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}`,
              remarks: `Payment of Rs. ${actualReceived.toLocaleString()} confirmed and delivered`,
              updatedBy: currentUser.username,
            },
          ],
        };
      })
    );

    return { success: true };
  };

  // Super User Job Deletion with Full Rollback
  const deleteJob = (jobId: string) => {
    const targetJob = jobs.find((j) => j.id === jobId);
    if (!targetJob) return;

    // 1. Rollback Consumed Inventory back into stock
    if (targetJob.consumedInventory && targetJob.consumedInventory.length > 0) {
      setInventory((prevInv) =>
        prevInv.map((inv) => {
          const consumed = targetJob.consumedInventory.find((ci) => ci.itemId === inv.id);
          if (consumed) {
            return { ...inv, qtyInStock: inv.qtyInStock + consumed.qty };
          }
          return inv;
        })
      );
    }

    // 2. Reverse associated Cash Transactions
    setTransactions((prevTxs) => prevTxs.filter((tx) => tx.jobId !== jobId));

    // 3. Remove Job
    setJobs((prevJobs) => prevJobs.filter((j) => j.id !== jobId));

    // Notification
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'Job Deleted & Restored',
        message: `Job #${targetJob.trackingId} deleted. Inventory stock restored and financial records reversed.`,
        timestamp: 'Just now',
        read: false,
        type: 'system',
      },
      ...prev,
    ]);
  };

  // Inventory Stock Add
  const addInventoryStock = (itemId: string, addQty: number) => {
    setInventory((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, qtyInStock: item.qtyInStock + addQty } : item))
    );
  };

  // Create Inventory Item (Super User)
  const createInventoryItem = (item: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      ...item,
    };
    setInventory((prev) => [...prev, newItem]);
  };

  // Update Inventory Item
  const updateInventoryItem = (id: string, name: string, unitOfIssue: InventoryItem['unitOfIssue']) => {
    setInventory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name, unitOfIssue } : item))
    );
  };

  // Delete Inventory Item
  const deleteInventoryItem = (id: string) => {
    setInventory((prev) => prev.filter((item) => item.id !== id));
  };

  // Add Expense
  const addExpense = (
    category: string,
    amount: number,
    remarks: string,
    date?: string
  ): { success: boolean; error?: string } => {
    const todayIso = new Date().toISOString().split('T')[0];

    // Normal User Restriction: Today only!
    if (currentUser.role === 'normal' && date && date !== todayIso) {
      return {
        success: false,
        error: 'Desk users are restricted to recording expenses for TODAY ONLY.',
      };
    }

    const txDate = date ? new Date(date).toISOString() : new Date().toISOString();

    const newTx: CashTransaction = {
      id: `tx-${Date.now()}`,
      date: txDate,
      type: 'outflow',
      account: 'counter',
      amount,
      category,
      remarks,
      performedBy: currentUser.username,
    };

    setTransactions((prev) => [newTx, ...prev]);
    return { success: true };
  };

  // Transfer Cash
  const transferCash = (from: 'counter' | 'bank', to: 'counter' | 'bank', amount: number, remarks: string) => {
    const newTx: CashTransaction = {
      id: `tx-${Date.now()}`,
      date: new Date().toISOString(),
      type: 'transfer',
      account: from,
      toAccount: to,
      amount,
      category: `Transfer ${from} to ${to}`,
      remarks,
      performedBy: currentUser.username,
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  // Adjust Cash
  const adjustCash = (account: 'counter' | 'bank', action: 'add' | 'remove', amount: number, remarks: string) => {
    const newTx: CashTransaction = {
      id: `tx-${Date.now()}`,
      date: new Date().toISOString(),
      type: action === 'add' ? 'adjustment' : 'outflow',
      account,
      amount,
      category: `Manual ${action === 'add' ? 'Deposit' : 'Withdrawal'}`,
      remarks,
      performedBy: currentUser.username,
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  // Delete Transaction with Balance Reversal
  const deleteTransaction = (txId: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== txId));
  };

  // Add Expense Category
  const addExpenseCategory = (name: string) => {
    const newCat: ExpenseCategory = { id: `cat-${Date.now()}`, name };
    setExpenseCategories((prev) => [...prev, newCat]);
  };

  // Franchise Referral Actions
  const addFranchise = (
    name: string,
    mobileNo: string,
    address: string,
    cityCode: string,
    uniqueFourDigit: string
  ): { success: boolean; error?: string } => {
    const referralCode = `${cityCode.toUpperCase().trim()}${uniqueFourDigit.trim()}`;

    // Check duplicate referral code
    const existing = franchises.find((f) => f.referralCode === referralCode);
    if (existing) {
      return {
        success: false,
        error: `Referral ID ${referralCode} is already assigned to ${existing.name}. Each referral code must be unique!`,
      };
    }

    const newFranchise: ReferralFranchise = {
      id: `ref-${Date.now()}`,
      name,
      mobileNo,
      address,
      referralCode,
      cityCode: cityCode.toUpperCase().trim(),
      uniqueFourDigit: uniqueFourDigit.trim(),
      active: true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setFranchises((prev) => [...prev, newFranchise]);
    return { success: true };
  };

  const toggleFranchiseActive = (id: string) => {
    setFranchises((prev) =>
      prev.map((f) => (f.id === id ? { ...f, active: !f.active } : f))
    );
  };

  // Wallets & Banks
  const addWallet = (wallet: Omit<MobileWalletAccount, 'id'>) => {
    setWallets((prev) => [...prev, { id: `wal-${Date.now()}`, ...wallet }]);
  };

  const deleteWallet = (id: string) => {
    setWallets((prev) => prev.filter((w) => w.id !== id));
  };

  const addBank = (bank: Omit<BankAccount, 'id'>) => {
    setBanks((prev) => [...prev, { id: `bank-${Date.now()}`, ...bank }]);
  };

  const deleteBank = (id: string) => {
    setBanks((prev) => prev.filter((b) => b.id !== id));
  };

  // Schedule Charges
  const updateScheduleCharges = (config: ScheduleChargesConfig) => {
    setScheduleCharges(config);
  };

  // User Accounts
  const addUser = (username: string, role: UserRole, authorizedTabs: string[]) => {
    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      username,
      role,
      authorizedTabs,
    };
    setUsers((prev) => [...prev, newUser]);
  };

  const updateUserTabs = (userId: string, authorizedTabs: string[]) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, authorizedTabs } : u))
    );
  };

  const deleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const downloadDatabase = () => {
    const fullDb = {
      users,
      jobs,
      inventory,
      transactions,
      expenseCategories,
      franchises,
      wallets,
      banks,
      scheduleCharges,
      exportedAt: new Date().toISOString(),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullDb, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `invertisol_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <AppContext.Provider
      value={{
        portalMode,
        setPortalMode,
        currentUser,
        setCurrentUser,
        users,
        activeTab,
        setActiveTab,
        jobs,
        inventory,
        transactions,
        expenseCategories,
        franchises,
        wallets,
        banks,
        scheduleCharges,
        notifications,
        counterCashBalance,
        bankBalance,
        addJob,
        updateJobStatus,
        generateBill,
        downgradeJobStatus,
        confirmPayment,
        deleteJob,
        addInventoryStock,
        createInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        addExpense,
        transferCash,
        adjustCash,
        deleteTransaction,
        addExpenseCategory,
        addFranchise,
        toggleFranchiseActive,
        addWallet,
        deleteWallet,
        addBank,
        deleteBank,
        updateScheduleCharges,
        addUser,
        updateUserTabs,
        deleteUser,
        markNotificationRead,
        clearAllNotifications,
        downloadDatabase,
        selectedPrintJob,
        setSelectedPrintJob,
        printReportData,
        setPrintReportData,
        printDocumentType,
        setPrintDocumentType,
        appTheme,
        setAppTheme,
        language,
        setLanguage,
        appLogo,
        setAppLogo,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
