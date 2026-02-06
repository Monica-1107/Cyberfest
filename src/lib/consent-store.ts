
'use client';

export type ConsentType = 'necessary' | 'analytics' | 'marketing';

export interface UserConsent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

const STORAGE_KEY = 'privacypilot_consent';

export const getConsent = (): UserConsent => {
  if (typeof window === 'undefined') return { necessary: true, analytics: false, marketing: false, timestamp: '' };
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse consent', e);
    }
  }
  return { necessary: true, analytics: false, marketing: false, timestamp: '' };
};

export const setConsent = (consent: Partial<UserConsent>) => {
  if (typeof window === 'undefined') return;
  const current = getConsent();
  const updated = {
    ...current,
    ...consent,
    necessary: true, // Always true
    timestamp: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  
  // Custom event to notify other components
  window.dispatchEvent(new CustomEvent('privacypilot_consent_updated', { detail: updated }));
  
  // Log change
  addPrivacyLog('Consent updated', updated);
};

export const addPrivacyLog = (action: string, data: any) => {
  if (typeof window === 'undefined') return;
  const logs = JSON.parse(localStorage.getItem('privacypilot_logs') || '[]');
  logs.unshift({
    id: Math.random().toString(36).substring(7),
    timestamp: new Date().toISOString(),
    action,
    details: data
  });
  localStorage.setItem('privacypilot_logs', JSON.stringify(logs.slice(0, 50)));
};

export const getPrivacyLogs = () => {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('privacypilot_logs') || '[]');
};
