import React, { useState } from 'react';
import { useKeyboardShortcuts, type KeyboardShortcut } from '../hooks/useKeyboardShortcuts';
import './KeyboardShortcutsHelp.css';

interface KeyboardShortcutsHelpProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
  isOpen: initialIsOpen = false,
  onClose,
}) => {
  const [isOpen, setIsOpen] = useState(initialIsOpen);

  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'Enter',
      ctrl: true,
      shift: false,
      alt: false,
      description: 'Send message',
      action: () => {},
    },
    {
      key: 'L',
      ctrl: true,
      shift: false,
      alt: false,
      description: 'Clear current chat',
      action: () => {},
    },
    {
      key: '/',
      ctrl: true,
      shift: false,
      alt: false,
      description: 'Show keyboard shortcuts',
      action: () => setIsOpen(true),
    },
    {
      key: 'N',
      ctrl: true,
      shift: false,
      alt: false,
      description: 'New chat session',
      action: () => {},
    },
    {
      key: 'S',
      ctrl: true,
      shift: false,
      alt: false,
      description: 'Export/Save chat',
      action: () => {},
    },
    {
      key: 'T',
      ctrl: true,
      shift: false,
      alt: false,
      description: 'Toggle theme (dark/light)',
      action: () => {},
    },
    {
      key: 'K',
      ctrl: true,
      shift: false,
      alt: false,
      description: 'Open settings',
      action: () => {},
    },
    {
      key: 'B',
      ctrl: true,
      shift: false,
      alt: false,
      description: 'Toggle sidebar',
      action: () => {},
    },
  ];

  const getShortcutDisplay = (shortcut: KeyboardShortcut): string => {
    const parts: string[] = [];
    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.shift) parts.push('Shift');
    if (shortcut.alt) parts.push('Alt');
    parts.push(shortcut.key.toUpperCase());
    return parts.join('+');
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  if (!isOpen) {
    return (
      <button
        className="shortcuts-help-toggle"
        onClick={() => setIsOpen(true)}
        title="Keyboard Shortcuts (Ctrl+/)"
      >
        ⌨️
      </button>
    );
  }

  return (
    <div className="keyboard-shortcuts-overlay" onClick={handleClose}>
      <div
        className="keyboard-shortcuts-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shortcuts-header">
          <h2>⌨️ Keyboard Shortcuts</h2>
          <button
            className="shortcuts-close"
            onClick={handleClose}
            title="Close"
          >
            ✕
          </button>
        </div>

        <div className="shortcuts-content">
          <div className="shortcuts-intro">
            <p>Master these keyboard shortcuts for faster navigation:</p>
          </div>

          <div className="shortcuts-grid">
            {shortcuts.map((shortcut, idx) => (
              <div key={idx} className="shortcut-item">
                <div className="shortcut-keys">
                  {getShortcutDisplay(shortcut)
                    .split('+')
                    .map((key, i) => (
                      <span key={i} className="key-badge">
                        {key}
                      </span>
                    ))}
                </div>
                <div className="shortcut-description">
                  {shortcut.description}
                </div>
              </div>
            ))}
          </div>

          <div className="shortcuts-tips">
            <h4>💡 Tips:</h4>
            <ul>
              <li>Use <code>Ctrl+/</code> anytime to show this help</li>
              <li>These shortcuts work throughout the app</li>
              <li>Shortcuts are disabled when typing in input fields</li>
              <li>Use <code>Ctrl+N</code> to start a fresh conversation</li>
            </ul>
          </div>
        </div>

        <div className="shortcuts-footer">
          <button className="shortcuts-done" onClick={handleClose}>
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};
