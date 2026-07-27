import { Job, InventoryItem, CashTransaction, ExpenseCategory, ReferralFranchise, MobileWalletAccount, BankAccount, ScheduleChargesConfig, UserAccount } from '../types';

export interface PhpHostConfig {
  phpHostUrl: string;
  apiKey: string;
  autoSyncEnabled: boolean;
  lastSyncedAt?: string;
  lastSyncStatus?: 'success' | 'error' | 'idle';
  lastErrorMessage?: string;
}

const STORAGE_KEY = 'invertisol_php_host_config';

export function getPhpHostConfig(): PhpHostConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading PHP host config from localStorage:', e);
  }
  return {
    phpHostUrl: '',
    apiKey: '',
    autoSyncEnabled: false,
    lastSyncStatus: 'idle',
  };
}

export function savePhpHostConfig(config: PhpHostConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.warn('Error saving PHP host config:', e);
  }
}

export async function testPhpConnection(url: string, apiKey: string): Promise<{ success: boolean; message: string; data?: any }> {
  if (!url.trim()) {
    return { success: false, message: 'PHP Endpoint URL is required.' };
  }

  let formattedUrl = url.trim();
  if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
    formattedUrl = 'https://' + formattedUrl;
  }

  const pingUrl = formattedUrl.includes('?') ? `${formattedUrl}&action=ping` : `${formattedUrl}?action=ping`;

  try {
    const res = await fetch(pingUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-API-KEY': apiKey || '',
      },
    });

    const data = await res.json();
    if (res.ok && data.status === 'success') {
      return {
        success: true,
        message: data.message || 'Connected to PHP MySQL backend successfully!',
        data,
      };
    } else {
      return {
        success: false,
        message: data.message || `Server responded with status ${res.status}`,
      };
    }
  } catch (e: any) {
    return {
      success: false,
      message: `Connection failed: ${e.message || 'Network or CORS error. Verify URL and server CORS headers.'}`,
    };
  }
}

export async function pushStateToPhp(
  url: string,
  apiKey: string,
  stateData: {
    jobs: Job[];
    inventory: InventoryItem[];
    cashTransactions: CashTransaction[];
    expenseCategories: ExpenseCategory[];
    franchises: ReferralFranchise[];
    wallets: MobileWalletAccount[];
    banks: BankAccount[];
    scheduleCharges: ScheduleChargesConfig;
    users?: UserAccount[];
  }
): Promise<{ success: boolean; message: string }> {
  if (!url.trim()) {
    return { success: false, message: 'PHP Endpoint URL is missing.' };
  }

  let formattedUrl = url.trim();
  if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
    formattedUrl = 'https://' + formattedUrl;
  }

  const syncUrl = formattedUrl.includes('?') ? `${formattedUrl}&action=sync_all` : `${formattedUrl}?action=sync_all`;

  try {
    const res = await fetch(syncUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-API-KEY': apiKey || '',
      },
      body: JSON.stringify(stateData),
    });

    const data = await res.json();
    if (res.ok && data.status === 'success') {
      const currentConfig = getPhpHostConfig();
      savePhpHostConfig({
        ...currentConfig,
        lastSyncedAt: new Date().toLocaleTimeString() + ' (' + new Date().toLocaleDateString() + ')',
        lastSyncStatus: 'success',
        lastErrorMessage: undefined,
      });
      return { success: true, message: data.message || 'All local data synced to PHP hosting server successfully!' };
    } else {
      throw new Error(data.message || `HTTP ${res.status}`);
    }
  } catch (e: any) {
    const currentConfig = getPhpHostConfig();
    savePhpHostConfig({
      ...currentConfig,
      lastSyncStatus: 'error',
      lastErrorMessage: e.message,
    });
    return { success: false, message: `Sync failed: ${e.message}` };
  }
}

export async function pullStateFromPhp(
  url: string,
  apiKey: string
): Promise<{ success: boolean; message: string; data?: any }> {
  if (!url.trim()) {
    return { success: false, message: 'PHP Endpoint URL is missing.' };
  }

  let formattedUrl = url.trim();
  if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
    formattedUrl = 'https://' + formattedUrl;
  }

  const getUrl = formattedUrl.includes('?') ? `${formattedUrl}&action=get_all` : `${formattedUrl}?action=get_all`;

  try {
    const res = await fetch(getUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-API-KEY': apiKey || '',
      },
    });

    const response = await res.json();
    if (res.ok && response.status === 'success' && response.data) {
      return {
        success: true,
        message: 'Successfully retrieved data from PHP server!',
        data: response.data,
      };
    } else {
      throw new Error(response.message || `HTTP ${res.status}`);
    }
  } catch (e: any) {
    return {
      success: false,
      message: `Failed to pull data: ${e.message}`,
    };
  }
}
