import { useEffect, useCallback } from 'react';
import { logger } from '../services/logger';

export interface KeyboardShortcut {
  key: string;
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  description: string;
  action: () => void;
}

export interface KeyboardShortcutsConfig {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
  excludeInputs?: boolean;
}

/**
 * Hook to handle keyboard shortcuts globally
 * Usage: useKeyboardShortcuts({ shortcuts: [...], excludeInputs: true })
 */
export function useKeyboardShortcuts(config: KeyboardShortcutsConfig) {
  const { shortcuts, enabled = true, excludeInputs = true } = config;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Skip if user is typing in input/textarea unless excludeInputs is false
      if (excludeInputs) {
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          return;
        }
      }

      // Find matching shortcut
      const matchingShortcut = shortcuts.find((shortcut) => {
        const isKeyMatch =
          event.key.toLowerCase() === shortcut.key.toLowerCase() ||
          event.code === shortcut.key;

        const isCtrlMatch = shortcut.ctrl === (event.ctrlKey || event.metaKey);
        const isShiftMatch = shortcut.shift === event.shiftKey;
        const isAltMatch = shortcut.alt === event.altKey;

        return isKeyMatch && isCtrlMatch && isShiftMatch && isAltMatch;
      });

      if (matchingShortcut) {
        event.preventDefault();
        logger.debug('Keyboard shortcut triggered', {
          key: matchingShortcut.key,
          description: matchingShortcut.description,
        });
        matchingShortcut.action();
      }
    },
    [shortcuts, enabled, excludeInputs]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Return helper to display shortcuts
  const getShortcutDisplay = (shortcut: KeyboardShortcut): string => {
    const parts: string[] = [];
    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.shift) parts.push('Shift');
    if (shortcut.alt) parts.push('Alt');
    parts.push(shortcut.key.toUpperCase());
    return parts.join('+');
  };

  return {
    shortcuts: shortcuts.map((s) => ({
      ...s,
      display: getShortcutDisplay(s),
    })),
  };
}
