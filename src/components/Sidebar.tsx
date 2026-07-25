import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Wrench,
  PackageCheck,
  Wallet,
  BarChart3,
  Sliders,
  ShieldAlert,
} from 'lucide-react';

interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  superOnly?: boolean;
}

export const ALL_TABS: TabItem[] = [
  { id: 'jobs', label: 'Work Orders Hub', icon: Wrench },
  { id: 'inventory', label: 'Parts Inventory', icon: PackageCheck },
  { id: 'cashbook', label: 'Cashbook & Expenses', icon: Wallet },
  { id: 'reports', label: 'Executive Reports', icon: BarChart3, superOnly: true },
  { id: 'settings', label: 'Master Settings', icon: Sliders, superOnly: true },
];

export const Sidebar: React.FC = () => {
  const { currentUser, activeTab, setActiveTab, t } = useApp();

  const TAB_ITEMS: TabItem[] = [
    { id: 'jobs', label: t('jobsHub'), icon: Wrench },
    { id: 'inventory', label: t('inventory'), icon: PackageCheck },
    { id: 'cashbook', label: t('cashbook'), icon: Wallet },
    { id: 'reports', label: t('reports'), icon: BarChart3, superOnly: true },
    { id: 'settings', label: t('settings'), icon: Sliders, superOnly: true },
  ];

  // Helper to check if user can access a tab (supporting legacy authorizedTab IDs)
  const isTabAllowed = (tabId: string) => {
    if (currentUser.role === 'super') return true;
    if (currentUser.authorizedTabs.includes(tabId)) return true;

    // Check legacy aliases
    if (tabId === 'jobs') {
      return ['add_job', 'update_status', 'generate_bill', 'confirm_payment', 'job_inquiry'].some((t) =>
        currentUser.authorizedTabs.includes(t)
      );
    }
    if (tabId === 'inventory') {
      return currentUser.authorizedTabs.includes('manage_inventory');
    }
    if (tabId === 'cashbook') {
      return (
        currentUser.authorizedTabs.includes('cash_register') ||
        currentUser.authorizedTabs.includes('manage_expenses') ||
        currentUser.authorizedTabs.includes('add_expense')
      );
    }
    return false;
  };

  const allowedTabs = TAB_ITEMS.filter((tab) => isTabAllowed(tab.id));

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex-shrink-0 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shadow-xs">
      <div className="space-y-6">
        {/* Role Badge Card */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-lg ${
                currentUser.role === 'super'
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-teal-100 text-teal-800 border border-teal-200'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 leading-tight">{currentUser.username}</p>
              <p className="text-[11px] font-semibold text-[#006673] capitalize mt-0.5">
                {currentUser.role === 'super' ? 'Super Admin (Owner)' : 'Desk Staff'}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Links */}
        <nav className="space-y-1.5">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Main System Navigation
          </p>
          {allowedTabs.map((tab) => {
            const Icon = tab.icon;
            // Map legacy activeTab if needed
            const normalizedActive =
              ['add_job', 'update_status', 'generate_bill', 'confirm_payment', 'job_inquiry'].includes(
                activeTab
              )
                ? 'jobs'
                : ['manage_inventory'].includes(activeTab)
                ? 'inventory'
                : ['cash_register', 'manage_expenses'].includes(activeTab)
                ? 'cashbook'
                : ['manage_referrals', 'manage_accounts', 'manage_users', 'schedule_charges', 'download_db'].includes(
                    activeTab
                  )
                ? 'settings'
                : activeTab;

            const isActive = normalizedActive === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#008b9b] text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                </div>
                {tab.superOnly && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${
                      isActive ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    Super
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-200/80 text-[11px] text-slate-500 space-y-1">
        <p className="font-bold text-[#006673]">InvertiSOL Lab Engine</p>
        <p className="text-slate-500">Simplified Lab & Cashbook System</p>
      </div>
    </aside>
  );
};
