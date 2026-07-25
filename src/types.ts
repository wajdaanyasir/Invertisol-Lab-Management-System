export type UserRole = 'super' | 'normal';

export interface UserAccount {
  id: string;
  username: string;
  role: UserRole;
  authorizedTabs: string[]; // List of tab IDs allowed for this user
}

export type JobStatus =
  | 'Complaint Filed'
  | 'Ready for Pick Up'
  | 'Received and Awaiting Maintenance'
  | 'Under Maintenance'
  | 'Awaiting Parts'
  | 'Repaired under Test'
  | 'Repaired & Ready for Delivery'
  | 'Delivered & Paid';

export type UnitOfIssue = 'Each' | 'By Weight (kg)' | 'By Length (meter)';

export interface InventoryItem {
  id: string;
  name: string;
  unitOfIssue: UnitOfIssue;
  qtyInStock: number;
  unitPrice: number;
}

export interface ConsumedInventoryItem {
  itemId: string;
  itemName: string;
  qty: number;
  unitPrice: number;
  totalCost: number;
}

export interface AdditionalCostHead {
  id: string;
  name: string;
  amount: number;
}

export interface Job {
  id: string; // Internal UUID
  trackingId: string; // Formatted DDMMYY0001
  customerName: string;
  mobileNo: string;
  address: string;
  inverterBrand: string;
  inverterKva: string;
  issueDescription: string;
  labLocation: string;
  estimatedRepairDate: string; // YYYY-MM-DD
  approximateCost: number;
  status: JobStatus;
  statusHistory: {
    status: JobStatus;
    timestamp: string;
    remarks?: string;
    updatedBy: string;
  }[];
  consumedInventory: ConsumedInventoryItem[];
  technicianDispatched?: {
    name: string;
    phone: string;
    dispatchDate: string;
    remarks: string;
  };
  referralId?: string; // Franchise Referral Code (e.g., ISB1121)
  
  // Billing details
  repairCost: number; // Actual repair labor/service cost = BUSINESS PROFIT
  referralCost: number;
  pickupCost: number;
  deliveryCost: number;
  totalInventoryCost: number;
  additionalCostHeads?: AdditionalCostHead[];
  repairRemarks?: string; // Admin notes/remarks regarding the repair for customer view
  totalBillAmount: number;
  billGenerated: boolean;
  isBillLocked?: boolean; // When admin locks / finalizes the bill for customer view
  billGeneratedAt?: string;

  // Payment details
  discount: number;
  cashPaid: number;
  onlinePaid: number;
  onlinePaymentScreenshot?: string;
  finalPayment: number;
  paymentConfirmed: boolean;
  paymentConfirmedAt?: string;

  createdAt: string; // ISO date
  createdDateOnly: string; // YYYY-MM-DD
}

export interface CashTransaction {
  id: string;
  date: string; // ISO String
  type: 'inflow' | 'outflow' | 'transfer' | 'adjustment';
  account: 'counter' | 'bank';
  toAccount?: 'counter' | 'bank';
  amount: number;
  category: string; // e.g. 'Customer Payment', 'Electricity Bill', 'Salary', 'Tax', 'Inventory Purchase', etc.
  jobId?: string;
  remarks: string;
  performedBy: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
}

export interface ReferralFranchise {
  id: string;
  name: string;
  mobileNo: string;
  address: string;
  referralCode: string; // Format CITYXXX e.g., ISB1121
  cityCode: string; // e.g., ISB, RWP
  uniqueFourDigit: string; // e.g., 1121
  active: boolean; // if false, cannot assign to new jobs
  createdAt: string;
}

export interface MobileWalletAccount {
  id: string;
  walletName: string; // e.g. JazzCash, EasyPaisa
  accountNumber: string;
  accountHolderName: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  ibanNo: string;
  accountHolderName: string;
}

export interface ScheduleChargesConfig {
  pickupCharges: number;
  deliveryCharges: number;
  defaultReferralShare: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'overdue' | 'status_update' | 'payment' | 'inventory_low' | 'system';
  jobTrackingId?: string;
}

export interface ReportPrintData {
  reportType: 'profit_report' | 'day_progress' | 'stock_report' | 'consumption_report';
  title: string;
  subtitle?: string;
  periodLabel?: string;
  profitReport?: {
    month: string;
    monthlyJobsCount: number;
    completedProjectsCount: number;
    cashPaymentsTotal: number;
    onlinePaymentsTotal: number;
    totalCashReceived: number;
    totalRepairingCostRevenue: number;
    salariesTotal: number;
    billsTotal: number;
    deliveryChargesTotal: number;
    inventoryCostTotal: number;
    otherExpensesTotal: number;
    totalExpensesSum: number;
    netCalculatedProfit: number;
  };
  dayProgressReport?: {
    date: string;
    newProjectsCount: number;
    dayCompletedCount: number;
    dayUnderMaintenanceCount: number;
    dayAwaitingPartsCount: number;
    dayJobs: {
      trackingId: string;
      customerName: string;
      inverterBrand: string;
      status: string;
      approximateCost: number;
    }[];
  };
  stockReport?: {
    totalStockValue: number;
    items: {
      name: string;
      unitOfIssue: string;
      qtyInStock: number;
      unitPrice: number;
      totalAmount: number;
    }[];
  };
  consumptionReport?: {
    dateFrom: string;
    dateTo: string;
    totalCost: number;
    records: {
      trackingId: string;
      itemName: string;
      units: number;
      cost: number;
      date: string;
    }[];
  };
}

