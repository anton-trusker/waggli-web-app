
import React, { createContext, useContext, useState, PropsWithChildren, useEffect } from 'react';
import { PlatformSettings } from '../types';
import { getPlatformSettings } from '../services/db';

interface PlatformContextType {
  settings: PlatformSettings;
  updateLocalSettings: (settings: Partial<PlatformSettings>) => void;
  isLoading: boolean;
}

const DEFAULT_SETTINGS: PlatformSettings = {
  id: 'global',
  platformName: 'Pawzly',
  logo_url: '/vite.svg', // Fallback
  favicon_url: '/vite.svg',
  icon_url: '',
  primaryColor: '#7C5CFC',
  modules: {
    ai_chat: true,
    ai_features: true,
    ai_feed: true,
    ocr: true,
    services_module: true,
    providers_module: true,
    subscription_module: true,
    community_module: true
  }
};

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export const PlatformProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      const data = await getPlatformSettings();
      if (data) {
        setSettings({ ...DEFAULT_SETTINGS, ...data });
      }
      setIsLoading(false);
    };
    loadSettings();
  }, []);

  // Update Document Head based on settings
  useEffect(() => {
    // Title
    document.title = settings.platformName;

    // Favicon
    const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'icon';
    link.href = settings.favicon_url;
    document.getElementsByTagName('head')[0].appendChild(link);

    // Primary Color (CSS Var)
    if (settings.primaryColor) {
      document.documentElement.style.setProperty('--color-primary', settings.primaryColor);
    }

  }, [settings]);

  const updateLocalSettings = (newSettings: Partial<PlatformSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <PlatformContext.Provider value={{ settings, updateLocalSettings, isLoading }}>
      {children}
    </PlatformContext.Provider>
  );
};

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (context === undefined) throw new Error('usePlatform must be used within a PlatformProvider');
  return context;
};
