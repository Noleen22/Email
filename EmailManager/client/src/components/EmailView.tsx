import { useState, useRef } from 'react';
import { 
  Avatar, 
  AvatarFallback 
} from '@/components/ui/avatar';
import { 
  Button 
} from '@/components/ui/button';
import {
  Card,
  CardContent
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, 
  Reply, 
  Star, 
  RefreshCw,
  Archive, 
  Trash, 
  MailOpen,
  MoreVertical,
  ChevronDown,
  Download,
  MoreHorizontal,
  FileText,
  File
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useEmailClient } from '@/hooks/useEmailClient';

interface EmailViewProps {
  onMenuToggle?: () => void;
}

export default function EmailView({ onMenuToggle }: EmailViewProps) {
  const [replyText, setReplyText] = useState('');
  const { 
    selectedEmail, 
    isLoadingSelectedEmail,
    starEmail
  } = useEmailClient();
  
  // Handle star toggle
  const handleStarToggle = () => {
    if (selectedEmail) {
      starEmail({ 
        id: selectedEmail.id, 
        starred: !selectedEmail.starred 
      });
    }
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Get background color for avatar based on name
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-status-info',
      'bg-status-warning',
      'bg-status-success',
      'bg-status-error',
      'bg-primary'
    ];
    
    // Simple hash of name to pick a color
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    
    return colors[sum % colors.length];
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  // Render loading skeleton
  const renderSkeleton = () => (
    <div className="p-4">
      <Skeleton className="h-6 w-48 mb-4" />
      <div className="flex items-start mb-6">
        <Skeleton className="h-10 w-10 rounded-full mr-3" />
        <div className="flex-1">
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-4 w-64 mb-1" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );

  // Render empty state
  const renderEmptyState = () => (
    <div className="h-full flex items-center justify-center">
      <div className="text-center p-6">
        <MailOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No email selected</h3>
        <p className="text-muted-foreground">Select an email from the list to view it here</p>
      </div>
    </div>
  );

  // Render email attachments
  const renderAttachments = () => {
    const attachments = selectedEmail?.attachments as any[] || [];
    
    if (!attachments || attachments.length === 0) return null;
    
    return (
      <div className="mt-6 border-t border-border pt-4">
        <p className="text-sm font-medium mb-3">{attachments.length} Attachment{attachments.length !== 1 ? 's' : ''}</p>
        
        <div className="flex flex-wrap gap-4">
          {attachments.map((attachment, index) => (
            <Card key={index} className="w-56 overflow-hidden">
              <div className="h-32 bg-muted flex items-center justify-center">
                {attachment.type?.includes('pdf') ? (
                  <File className="h-12 w-12 text-muted-foreground" />
                ) : (
                  <FileText className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              <CardContent className="p-3">
                <p className="font-medium text-sm truncate">{attachment.name}</p>
                <p className="text-muted-foreground text-xs">
                  {Math.round(attachment.size / 1024)} KB
                </p>
                <div className="flex items-center mt-2">
                  <Button variant="link" size="sm" className="p-0 h-auto text-primary">
                    Download
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="ml-auto h-6 w-6"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // Render quick reply box
  const renderQuickReply = () => (
    <div className="mt-6 pt-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start">
            <Avatar className="h-8 w-8 mr-3 bg-primary">
              <AvatarFallback>ME</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div 
                className="min-h-[100px] p-3 bg-muted rounded-md mb-3"
                contentEditable
                placeholder="Reply to email..."
                onInput={(e) => setReplyText(e.currentTarget.textContent || '')}
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon">
                    <span className="font-bold">B</span>
                  </Button>
                  <Button variant="ghost" size="icon">
                    <span className="text-lg">📎</span>
                  </Button>
                  <Button variant="ghost" size="icon">
                    <span className="text-lg">🔗</span>
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
                
                <Button 
                  disabled={!replyText.trim()}
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render categories badges
  const renderCategoryBadges = () => {
    const categories = selectedEmail?.categories as string[] || [];
    
    if (!categories || categories.length === 0) return null;
    
    return (
      <div className="flex items-center flex-wrap mt-2 gap-2">
        {categories.map((category, index) => {
          let badgeClass = '';
          
          switch(category.toLowerCase()) {
            case 'classes':
              badgeClass = 'bg-status-info/20 text-status-info';
              break;
            case 'administration':
              badgeClass = 'bg-status-warning/20 text-status-warning';
              break;
            case 'events':
              badgeClass = 'bg-status-success/20 text-status-success';
              break;
            case 'important':
              badgeClass = 'bg-status-error/20 text-status-error';
              break;
          }
          
          return (
            <Badge 
              key={index}
              variant="outline"
              className={`px-2 py-0.5 ${badgeClass}`}
            >
              {category}
            </Badge>
          );
        })}
      </div>
    );
  };

  // If no email is selected
  if (!selectedEmail && !isLoadingSelectedEmail) {
    return renderEmptyState();
  }

  return (
    <div className="flex-1 h-full flex flex-col bg-background">
      {/* Email header toolbar */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon"
            className="lg:hidden mr-2"
            onClick={onMenuToggle}
          >
            <Menu className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-medium">Inbox</h2>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Archive className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Trash className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <MailOpen className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Email content */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoadingSelectedEmail ? (
          renderSkeleton()
        ) : selectedEmail ? (
          <div>
            <h1 className="text-xl font-medium mb-2">{selectedEmail.subject}</h1>
            
            <div className="flex items-start">
              <Avatar className={`h-10 w-10 mr-3 ${getAvatarColor(selectedEmail.fromName || selectedEmail.from)}`}>
                <AvatarFallback>
                  {getInitials(selectedEmail.fromName || selectedEmail.from)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex flex-wrap items-baseline">
                  <p className="font-medium mr-2">
                    {selectedEmail.fromName || selectedEmail.from.split('@')[0]}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    &lt;{selectedEmail.from}&gt;
                  </p>
                  <span className="ml-auto text-sm text-muted-foreground">
                    {formatDate(selectedEmail.received)}
                  </span>
                </div>
                
                <div className="text-sm text-muted-foreground flex items-center mt-1">
                  <span>To: me</span>
                  <Button variant="ghost" size="sm" className="ml-1 h-5 p-0">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
                
                {renderCategoryBadges()}
              </div>
              
              <div className="ml-4 flex items-center">
                <Button variant="ghost" size="icon">
                  <Reply className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleStarToggle}
                >
                  <Star 
                    className={`h-4 w-4 ${selectedEmail.starred ? 'fill-status-warning text-status-warning' : ''}`} 
                  />
                </Button>
              </div>
            </div>
            
            {/* Email body */}
            <div className="mt-6 prose prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: selectedEmail.bodyHtml || '' }} />
              {!selectedEmail.bodyHtml && <p>{selectedEmail.body}</p>}
            </div>
            
            {/* Attachments */}
            {renderAttachments()}
            
            {/* Quick reply */}
            {renderQuickReply()}
          </div>
        ) : null}
      </div>
      
      {/* Focus mode toggle */}
      <div className="fixed bottom-6 right-6">
        <div className="bg-card rounded-full shadow-lg p-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={() => {}}
          >
            <span className="text-lg">👁️</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
