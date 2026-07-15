import React, { createContext, useContext, useMemo, useState } from 'react';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [mode, setMode] = useState('light');
  const [language, setLanguage] = useState('English');
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [emailReportsEnabled, setEmailReportsEnabled] = useState(false);

  const value = useMemo(
    () => ({
      mode,
      toggleMode: () => setMode((m) => (m === 'light' ? 'dark' : 'light')),
      setMode,
      language,
      setLanguage,
      alertsEnabled,
      setAlertsEnabled,
      emailReportsEnabled,
      setEmailReportsEnabled,
    }),
    [mode, language, alertsEnabled, emailReportsEnabled]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
  return ctx;
}
