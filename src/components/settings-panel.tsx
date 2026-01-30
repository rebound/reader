import { X, Sun, Coffee, Moon, Type, Minus, Plus, type LucideIcon } from 'lucide-react';
import type { Settings, Theme, FontFamily } from '../hooks/use-settings';

interface ThemeOption {
  id: Theme;
  label: string;
  icon: LucideIcon;
  bg: string;
  text: string;
}

interface SettingsPanelProps {
  settings: Settings;
  onUpdateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => Promise<void>;
  onClose?: () => void;
  isPdf?: boolean;
}

export function SettingsPanel({
  settings,
  onUpdateSetting,
  onClose,
  isPdf = false,
}: SettingsPanelProps) {
  const themes: ThemeOption[] = [
    { id: 'light', label: 'Light', icon: Sun, bg: '#ffffff', text: '#1f2937' },
    { id: 'sepia', label: 'Sepia', icon: Coffee, bg: '#f4ecd8', text: '#433422' },
    { id: 'dark', label: 'Dark', icon: Moon, bg: '#1a1a1a', text: '#e5e5e5' },
  ];

  const fontSizes = [14, 16, 18, 20, 22, 24];

  return (
    <div
      className="absolute right-4 top-4 w-72 rounded-xl shadow-xl z-30 overflow-hidden"
      style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <h3 className="font-medium">Settings</h3>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-black/5 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Theme */}
        <div>
          <label className="text-sm font-medium mb-3 block opacity-70">Theme</label>
          <div className="grid grid-cols-3 gap-2">
            {themes.map((theme) => {
              const Icon = theme.icon;
              const isActive = settings.theme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => onUpdateSetting('theme', theme.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    isActive ? 'border-current' : 'border-transparent'
                  }`}
                  style={{
                    backgroundColor: theme.bg,
                    color: theme.text,
                    borderColor: isActive ? 'var(--accent-color)' : 'transparent',
                  }}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{theme.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Font size (only for EPUB) */}
        {!isPdf && (
          <div>
            <label className="text-sm font-medium mb-3 block opacity-70">Font Size</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const currentIndex = fontSizes.indexOf(settings.fontSize);
                  if (currentIndex > 0) {
                    onUpdateSetting('fontSize', fontSizes[currentIndex - 1]);
                  }
                }}
                disabled={settings.fontSize <= fontSizes[0]}
                className="p-2 rounded-lg hover:bg-black/5 transition-colors disabled:opacity-30"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="flex-1 flex items-center justify-center gap-2">
                <Type className="w-4 h-4 opacity-50" />
                <span className="text-sm font-medium">{settings.fontSize}px</span>
              </div>

              <button
                onClick={() => {
                  const currentIndex = fontSizes.indexOf(settings.fontSize);
                  if (currentIndex < fontSizes.length - 1) {
                    onUpdateSetting('fontSize', fontSizes[currentIndex + 1]);
                  }
                }}
                disabled={settings.fontSize >= fontSizes[fontSizes.length - 1]}
                className="p-2 rounded-lg hover:bg-black/5 transition-colors disabled:opacity-30"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Font family (only for EPUB) */}
        {!isPdf && (
          <div>
            <label className="text-sm font-medium mb-3 block opacity-70">Font</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onUpdateSetting('fontFamily', 'serif' as FontFamily)}
                className={`px-4 py-2 rounded-lg border-2 transition-all font-serif ${
                  settings.fontFamily === 'serif' ? '' : 'border-transparent'
                }`}
                style={{
                  borderColor:
                    settings.fontFamily === 'serif' ? 'var(--accent-color)' : 'var(--border-color)',
                }}
              >
                Serif
              </button>
              <button
                onClick={() => onUpdateSetting('fontFamily', 'sans' as FontFamily)}
                className={`px-4 py-2 rounded-lg border-2 transition-all font-sans ${
                  settings.fontFamily === 'sans' ? '' : 'border-transparent'
                }`}
                style={{
                  borderColor:
                    settings.fontFamily === 'sans' ? 'var(--accent-color)' : 'var(--border-color)',
                }}
              >
                Sans-serif
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
