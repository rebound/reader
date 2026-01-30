import { useState, useEffect, useCallback } from 'react';
import { saveSetting, getSetting } from '../utils/db';

export type Theme = 'light' | 'sepia' | 'dark';
export type FontFamily = 'serif' | 'sans';

export interface Settings {
  theme: Theme;
  fontSize: number;
  fontFamily: FontFamily;
  lineHeight: number;
}

export interface UseSettingsReturn {
  settings: Settings;
  loading: boolean;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => Promise<void>;
}

const DEFAULT_SETTINGS: Settings = {
  theme: 'sepia',
  fontSize: 18,
  fontFamily: 'serif',
  lineHeight: 1.8,
};

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const theme = await getSetting<Theme>('theme', DEFAULT_SETTINGS.theme);
        const fontSize = await getSetting<number>('fontSize', DEFAULT_SETTINGS.fontSize);
        const fontFamily = await getSetting<FontFamily>('fontFamily', DEFAULT_SETTINGS.fontFamily);
        const lineHeight = await getSetting<number>('lineHeight', DEFAULT_SETTINGS.lineHeight);

        setSettings({ theme, fontSize, fontFamily, lineHeight });
      } catch (e) {
        console.error('Failed to load settings:', e);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const updateSetting = useCallback(
    async <K extends keyof Settings>(key: K, value: Settings[K]): Promise<void> => {
      try {
        await saveSetting(key, value);
        setSettings((prev) => ({ ...prev, [key]: value }));
      } catch (e) {
        console.error('Failed to save setting:', e);
      }
    },
    []
  );

  return {
    settings,
    loading,
    updateSetting,
  };
}
