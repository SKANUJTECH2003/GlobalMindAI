import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';
import './Settings.css';

interface SettingsState {
  fontSize: 'small' | 'medium' | 'large';
  theme: 'light' | 'dark' | 'system';
  temperature: number;
  autoSave: boolean;
  enableVoice: boolean;
  enableVision: boolean;
  analyticsEnabled: boolean;
  notificationsEnabled: boolean;
}

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Settings({ isOpen, onClose }: SettingsProps) {
  const { theme: currentTheme, setTheme } = useTheme();
  const [settings, setSettings] = useState<SettingsState>(() => {
    const saved = localStorage.getItem('eduflow-settings');
    return saved ? JSON.parse(saved) : {
      fontSize: 'medium',
      theme: 'dark',
      temperature: 0.7,
      autoSave: true,
      enableVoice: true,
      enableVision: true,
      analyticsEnabled: false,
      notificationsEnabled: true,
    };
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('eduflow-settings', JSON.stringify(settings));
  }, [settings]);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setSettings(prev => ({ ...prev, theme: newTheme }));
    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
      setTheme(systemTheme);
    } else {
      setTheme(newTheme);
    }
    toast.success(`Theme changed to ${newTheme}`);
  };

  const handleFontSizeChange = (size: 'small' | 'medium' | 'large') => {
    setSettings(prev => ({ ...prev, fontSize: size }));
    document.documentElement.setAttribute('data-font-size', size);
    toast.success(`Font size set to ${size}`);
  };

  const handleTemperatureChange = (temp: number) => {
    setSettings(prev => ({ ...prev, temperature: temp }));
  };

  const handleToggle = (key: keyof Omit<SettingsState, 'fontSize' | 'theme' | 'temperature'>) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    const label = key.replace(/([A-Z])/g, ' $1').trim();
    toast.success(`${label} ${!settings[key] ? 'enabled' : 'disabled'}`);
  };

  const handleResetSettings = () => {
    const confirmed = window.confirm('Reset all settings to defaults?');
    if (confirmed) {
      const defaults: SettingsState = {
        fontSize: 'medium',
        theme: 'dark',
        temperature: 0.7,
        autoSave: true,
        enableVoice: true,
        enableVision: true,
        analyticsEnabled: false,
        notificationsEnabled: true,
      };
      setSettings(defaults);
      setTheme('dark');
      document.documentElement.removeAttribute('data-font-size');
      toast.success('Settings reset to defaults');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={e => e.stopPropagation()}>
        <div className="settings-header">
          <h2>⚙️ Settings</h2>
          <button className="settings-close" onClick={onClose} title="Close">✕</button>
        </div>

        <div className="settings-content">
          {/* Theme Settings */}
          <div className="settings-section">
            <h3>🎨 Appearance</h3>
            <div className="settings-row">
              <label>Theme</label>
              <div className="theme-options">
                {(['light', 'dark', 'system'] as const).map(t => (
                  <button
                    key={t}
                    className={`theme-btn ${settings.theme === t ? 'active' : ''}`}
                    onClick={() => handleThemeChange(t)}
                    title={`Switch to ${t} theme`}
                  >
                    {t === 'light' ? '☀️' : t === 'dark' ? '🌙' : '⚙️'} {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="settings-row">
              <label>Font Size</label>
              <div className="font-size-options">
                {(['small', 'medium', 'large'] as const).map(size => (
                  <button
                    key={size}
                    className={`size-btn ${settings.fontSize === size ? 'active' : ''}`}
                    onClick={() => handleFontSizeChange(size)}
                    title={`Set font to ${size}`}
                  >
                    {size === 'small' ? 'A' : size === 'medium' ? 'A' : 'A'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AI Settings */}
          <div className="settings-section">
            <h3>🤖 AI Configuration</h3>
            <div className="settings-row">
              <label>
                Temperature
                <span className="hint"> (Controls creativity: 0 = factual, 1 = creative)</span>
              </label>
              <div className="slider-wrapper">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.temperature}
                  onChange={e => handleTemperatureChange(parseFloat(e.target.value))}
                  className="temperature-slider"
                />
                <span className="slider-value">{settings.temperature.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Feature Settings */}
          <div className="settings-section">
            <h3>✨ Features</h3>
            
            <div className="settings-checkbox">
              <input
                type="checkbox"
                id="voice"
                checked={settings.enableVoice}
                onChange={() => handleToggle('enableVoice')}
              />
              <label htmlFor="voice">🎤 Enable Voice Input/Output</label>
            </div>

            <div className="settings-checkbox">
              <input
                type="checkbox"
                id="vision"
                checked={settings.enableVision}
                onChange={() => handleToggle('enableVision')}
              />
              <label htmlFor="vision">👁️ Enable Vision (Image Analysis)</label>
            </div>

            <div className="settings-checkbox">
              <input
                type="checkbox"
                id="autosave"
                checked={settings.autoSave}
                onChange={() => handleToggle('autoSave')}
              />
              <label htmlFor="autosave">💾 Auto-save Conversations</label>
            </div>

            <div className="settings-checkbox">
              <input
                type="checkbox"
                id="notifications"
                checked={settings.notificationsEnabled}
                onChange={() => handleToggle('notificationsEnabled')}
              />
              <label htmlFor="notifications">🔔 Enable Notifications</label>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="settings-section">
            <h3>🔒 Privacy</h3>
            
            <div className="settings-checkbox">
              <input
                type="checkbox"
                id="analytics"
                checked={settings.analyticsEnabled}
                onChange={() => handleToggle('analyticsEnabled')}
              />
              <label htmlFor="analytics">📊 Allow Analytics (Help us improve)</label>
              <p className="hint">Non-personal usage data only</p>
            </div>
          </div>

          {/* About Section */}
          <div className="settings-section">
            <h3>ℹ️ About</h3>
            <p className="about-text">
              <strong>EduFlow AI</strong> v0.1.0<br/>
              Your Personal Study Companion<br/>
              <a href="#" onClick={() => alert('Privacy Policy will be here')}>Privacy Policy</a> • 
              <a href="#" onClick={() => alert('Terms will be here')}> Terms</a>
            </p>
          </div>
        </div>

        <div className="settings-footer">
          <button className="btn-secondary" onClick={handleResetSettings}>
            🔄 Reset to Defaults
          </button>
          <button className="btn-primary" onClick={onClose}>
            ✓ Done
          </button>
        </div>
      </div>
    </div>
  );
}
