import { createContext, useContext, useEffect, useRef, useState } from 'react';

interface InstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type InstallState = {
  platform: 'ios' | 'android' | 'desktop';
  installed: boolean;
  available: boolean;
  busy: boolean;
  error: string | null;
  install: () => Promise<void>;
};

const InstallContext = createContext<InstallState | null>(null);

export function AppInstallProvider({ children }: { children: React.ReactNode }) {
  const [platform, setPlatform] = useState<InstallState['platform']>('desktop');
  const [installed, setInstalled] = useState(false);
  const [available, setAvailable] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pending = useRef<InstallPrompt | null>(null);
  const prompting = useRef(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    setPlatform(/iPad|iPhone|iPod/.test(ua) ? 'ios' : /Android/.test(ua) ? 'android' : 'desktop');
    const display = window.matchMedia('(display-mode: standalone)');
    const refresh = () => setInstalled(display.matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);
    const onPrompt = (event: Event) => {
      event.preventDefault();
      pending.current = event as InstallPrompt;
      setAvailable(true);
      setError(null);
    };
    const onInstalled = () => {
      setInstalled(true);
      pending.current = null;
      setAvailable(false);
    };
    refresh();
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    display.addEventListener('change', refresh);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
      display.removeEventListener('change', refresh);
    };
  }, []);

  async function install() {
    const event = pending.current;
    if (!event || prompting.current) return;
    prompting.current = true;
    pending.current = null;
    setAvailable(false);
    setBusy(true);
    setError(null);
    try {
      await event.prompt();
      await event.userChoice;
      // Acceptance is not proof of completed installation; appinstalled confirms it.
    } catch {
      setError('Use your browser menu to install Kingdom Protocol.');
    } finally {
      prompting.current = false;
      setBusy(false);
    }
  }

  return <InstallContext.Provider value={{ platform, installed, available, busy, error, install }}>{children}</InstallContext.Provider>;
}

export function useAppInstall() {
  const context = useContext(InstallContext);
  if (!context) throw new Error('AppInstallProvider is required');
  return context;
}