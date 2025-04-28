import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Sidebar from '@/components/Sidebar';
import EmailList from '@/components/EmailList';
import EmailView from '@/components/EmailView';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';
import { SHORTCUT_CATEGORIES } from '@/lib/constants';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useEmailClient } from '@/hooks/useEmailClient';

export default function Home() {
  const [, navigate] = useLocation();
  const { 
    authStatus,
    selectEmail,
    isFocusMode,
    setIsFocusMode
  } = useEmailClient();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [emailListCollapsed, setEmailListCollapsed] = useState(false);

  // Handle keybaord shortcuts
  const formattedShortcuts = SHORTCUT_CATEGORIES.map(category => ({
    name: category.name,
    shortcuts: category.shortcuts.map(shortcut => ({
      key: shortcut.key,
      description: shortcut.description
    }))
  }));

  const { 
    showShortcutsModal, 
    setShowShortcutsModal 
  } = useKeyboardShortcuts(
    SHORTCUT_CATEGORIES.map(category => ({
      name: category.name,
      shortcuts: category.shortcuts.map(shortcut => ({
        ...shortcut,
        handler: () => {
          // Add handlers for shortcuts here
          console.log(`Shortcut: ${shortcut.key}`);
        }
      }))
    }))
  );

  // Redirect to setup if not authenticated
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      navigate('/setup');
    }
  }, [authStatus, navigate]);

  // Toggle focus mode
  const toggleFocusMode = () => {
    setIsFocusMode(!isFocusMode);
    setSidebarCollapsed(!isFocusMode);
    setEmailListCollapsed(!isFocusMode);
  };

  // Toggle sidebar on mobile
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Select email and handle mobile view
  const handleEmailSelect = (emailId: number) => {
    selectEmail(emailId);
    
    // On mobile, collapse the email list when selecting an email
    if (window.innerWidth < 768) {
      setEmailListCollapsed(true);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Keyboard shortcuts modal */}
      <KeyboardShortcuts
        open={showShortcutsModal}
        onOpenChange={setShowShortcutsModal}
        categories={formattedShortcuts}
      />
      
      {/* Main layout */}
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={toggleSidebar} 
      />
      
      <EmailList 
        collapsed={emailListCollapsed}
        onEmailSelect={handleEmailSelect}
      />
      
      <EmailView 
        onMenuToggle={() => setEmailListCollapsed(!emailListCollapsed)} 
      />
      
      {/* Focus mode toggle */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-card rounded-full shadow-lg p-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full" 
            onClick={toggleFocusMode}
            title={isFocusMode ? "Exit focus mode" : "Enter focus mode"}
          >
            {isFocusMode ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
