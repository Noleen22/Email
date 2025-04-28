import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { FOLDERS } from '@/lib/constants';
import { 
  Menu, Mail, ChevronRight, PlusCircle, 
  Inbox, Star, Send, File, Trash, Settings
} from 'lucide-react';
import ComposeEmail from './ComposeEmail';
import { useEmailClient } from '@/hooks/useEmailClient';

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const [location] = useLocation();
  const { 
    user, 
    logout, 
    currentFolder, 
    setCurrentFolder,
    categories,
    isLoadingCategories
  } = useEmailClient();
  const [composeOpen, setComposeOpen] = useState(false);

  // Extract folder from URL path
  const folderFromPath = location.split('/')[1] || 'inbox';

  // Handler for folder selection
  const handleFolderSelect = (folderId: string) => {
    setCurrentFolder(folderId);
  };

  // Get initials for avatar
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const renderFolders = () => {
    return FOLDERS.map(folder => (
      <Link 
        key={folder.id}
        href={`/${folder.id}`}
        onClick={() => handleFolderSelect(folder.id)}
      >
        <Button
          variant="ghost"
          className={`w-full justify-start rounded-r-full ${folderFromPath === folder.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
        >
          {folder.icon === 'inbox' && <Inbox className="mr-2 h-4 w-4" />}
          {folder.icon === 'star' && <Star className="mr-2 h-4 w-4" />}
          {folder.icon === 'send' && <Send className="mr-2 h-4 w-4" />}
          {folder.icon === 'drafts' && <File className="mr-2 h-4 w-4" />}
          {folder.icon === 'delete' && <Trash className="mr-2 h-4 w-4" />}
          <span className={collapsed ? 'sr-only' : ''}>{folder.name}</span>
          {folder.id === 'inbox' && (
            <span className={`ml-auto ${collapsed ? 'sr-only' : ''} bg-primary text-xs px-2 py-0.5 rounded-full`}>
              24
            </span>
          )}
          {folder.id === 'drafts' && (
            <span className={`ml-auto ${collapsed ? 'sr-only' : ''} bg-muted text-xs px-2 py-0.5 rounded-full`}>
              2
            </span>
          )}
        </Button>
      </Link>
    ));
  };

  const renderCategories = () => {
    if (isLoadingCategories) {
      return <div className="py-2 px-4 text-sm text-muted-foreground">Loading...</div>;
    }

    if (!categories || categories.length === 0) {
      return <div className="py-2 px-4 text-sm text-muted-foreground">No categories</div>;
    }

    return categories.map(category => (
      <Link 
        key={category.id}
        href={`/category/${category.id}`}
      >
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground rounded-r-full"
        >
          <span 
            className="w-2 h-2 rounded-full mr-2"
            style={{ backgroundColor: category.color }}
          ></span>
          <span className={collapsed ? 'sr-only' : ''}>{category.name}</span>
          <span className={`ml-auto ${collapsed ? 'sr-only' : ''} text-xs text-muted-foreground`}>
            {Math.floor(Math.random() * 10)}
          </span>
        </Button>
      </Link>
    ));
  };

  return (
    <>
      <div 
        className={`border-r border-border bg-card h-full flex flex-col transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-primary" />
              {!collapsed && <h1 className="text-xl font-bold ml-2">UniMail</h1>}
            </div>
            <Button variant="ghost" size="icon" onClick={onToggle} className="md:hidden">
              <Menu className="h-4 w-4" />
            </Button>
          </div>
          
          <Button 
            className="w-full rounded-full"
            onClick={() => setComposeOpen(true)}
          >
            {collapsed ? <Mail className="h-4 w-4" /> : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Compose
              </>
            )}
          </Button>
        </div>
        
        <nav className="mt-2 flex-1 overflow-y-auto">
          <div className="space-y-1 px-2">
            {renderFolders()}
          </div>
          
          <div className="px-4 py-2 mt-4">
            <div className="flex items-center justify-between text-muted-foreground text-sm">
              <span className={collapsed ? 'sr-only' : ''}>CATEGORIES</span>
              <Button variant="ghost" size="icon" className="h-4 w-4">
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2 space-y-1 px-2">
              {renderCategories()}
            </div>
          </div>
        </nav>
        
        <div className="p-4 border-t border-border">
          <div className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{getInitials(user?.displayName || user?.username)}</AvatarFallback>
            </Avatar>
            
            {!collapsed && (
              <div className="ml-2 flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.displayName || user?.username}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.emailAddress}
                </p>
              </div>
            )}
            
            <Button variant="ghost" size="icon" className="ml-auto">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <ComposeEmail
        open={composeOpen}
        onOpenChange={setComposeOpen}
      />
    </>
  );
}
