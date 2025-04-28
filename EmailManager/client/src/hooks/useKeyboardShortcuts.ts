import { useEffect, useCallback } from 'react';

type ShortcutHandler = () => void;

interface Shortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  handler: ShortcutHandler;
  description: string;
}

interface ShortcutCategory {
  name: string;
  shortcuts: Shortcut[];
}

export function useKeyboardShortcuts(
  shortcutCategories: ShortcutCategory[],
  isEnabled: boolean = true
) {
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isEnabled) return;

      // Show keyboard shortcuts when pressing '?'
      if (event.key === '?' && !event.ctrlKey && !event.metaKey) {
        setShowShortcutsModal(true);
        event.preventDefault();
        return;
      }

      // Close modals with Escape key
      if (event.key === 'Escape' && showShortcutsModal) {
        setShowShortcutsModal(false);
        event.preventDefault();
        return;
      }

      // Check for other shortcuts
      for (const category of shortcutCategories) {
        for (const shortcut of category.shortcuts) {
          if (
            event.key.toLowerCase() === shortcut.key.toLowerCase() &&
            (shortcut.ctrlKey === undefined || event.ctrlKey === shortcut.ctrlKey) &&
            (shortcut.altKey === undefined || event.altKey === shortcut.altKey) &&
            (shortcut.shiftKey === undefined || event.shiftKey === shortcut.shiftKey) &&
            (shortcut.metaKey === undefined || event.metaKey === shortcut.metaKey)
          ) {
            shortcut.handler();
            event.preventDefault();
            return;
          }
        }
      }
    },
    [isEnabled, shortcutCategories, showShortcutsModal]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const getShortcutsByCategory = () => {
    return shortcutCategories;
  };

  return {
    showShortcutsModal,
    setShowShortcutsModal,
    getShortcutsByCategory,
  };
}

// Import useState at the top
import { useState } from 'react';
