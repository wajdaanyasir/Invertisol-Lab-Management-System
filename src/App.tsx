import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { PrintableDocumentModal } from './components/PrintableDocumentModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { MarketingHomePage } from './components/MarketingHomePage';

// Simplified Core Tab Components
import { JobsHubTab } from './components/tabs/JobsHubTab';
import { ManageInventoryTab } from './components/tabs/ManageInventoryTab';
import { CashbookTab } from './components/tabs/CashbookTab';
import { ReportsTab } from './components/tabs/ReportsTab';
import { SettingsTab } from './components/tabs/SettingsTab';

const MainLayout: React.FC = () => {
  const { portalMode, activeTab, appTheme, language } = useApp();

  const getThemeClass = () => {
    switch (appTheme) {
      case 'dark':
        return 'bg-slate-950 text-slate-100 dark';
      case 'solar':
        return 'bg-slate-900 text-slate-100 theme-solar';
      case 'light':
      default:
        return 'bg-slate-100 text-slate-900';
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'jobs':
      case 'add_job':
      case 'update_status':
      case 'generate_bill':
      case 'confirm_payment':
      case 'job_inquiry':
        return <JobsHubTab />;

      case 'inventory':
      case 'manage_inventory':
        return <ManageInventoryTab />;

      case 'cashbook':
      case 'cash_register':
      case 'manage_expenses':
        return <CashbookTab />;

      case 'reports':
        return <ReportsTab />;

      case 'settings':
      case 'manage_referrals':
      case 'manage_accounts':
      case 'manage_users':
      case 'schedule_charges':
      case 'download_db':
        return <SettingsTab />;

      default:
        return <JobsHubTab />;
    }
  };

  return (
    <div
      dir={language === 'ur' ? 'rtl' : 'ltr'}
      className={`min-h-screen ${getThemeClass()} flex flex-col font-sans selection:bg-[#008b9b] selection:text-white transition-colors duration-300`}
    >
      <Navbar />

      {portalMode === 'customer' ? (
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
          <MarketingHomePage />
        </main>
      ) : (
        <div className="flex flex-1">
          <Sidebar />

          <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
            {renderActiveTab()}
          </main>
        </div>
      )}

      {/* Global Modals */}
      <PrintableDocumentModal />
      <AdminLoginModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
