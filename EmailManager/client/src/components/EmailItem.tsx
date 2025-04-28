import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { useEmailClient } from '@/hooks/useEmailClient';
import type { Email } from '@shared/schema';

interface EmailItemProps {
  email: Email;
  onClick: () => void;
  isSelected: boolean;
}

export default function EmailItem({ email, onClick, isSelected }: EmailItemProps) {
  const { starEmail } = useEmailClient();

  // Helper to get a color based on category
  const getCategoryColor = (categoryName: string) => {
    switch(categoryName.toLowerCase()) {
      case 'classes':
        return 'bg-status-info/20 text-status-info';
      case 'administration':
        return 'bg-status-warning/20 text-status-warning';
      case 'events':
        return 'bg-status-success/20 text-status-success';
      case 'important':
        return 'bg-status-error/20 text-status-error';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // If today, return time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
    
    // If this year, return month and day
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    // Otherwise return short date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: '2-digit' });
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

  // Handle star toggle
  const handleStarToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    starEmail({ id: email.id, starred: !email.starred });
  };

  // Get categories as array
  const categories = email.categories as string[] || [];

  return (
    <div 
      className={`p-3 border-b border-border cursor-pointer transition-colors ${
        isSelected ? 'bg-primary/10' : email.read ? '' : 'bg-muted/10'
      } hover:bg-primary/5`}
      onClick={onClick}
    >
      <div className="flex items-start mb-1">
        <Avatar className={`h-8 w-8 mr-2 ${getAvatarColor(email.fromName || email.from)}`}>
          <AvatarFallback>{getInitials(email.fromName || email.from)}</AvatarFallback>
        </Avatar>
        
        <div className="min-w-0 flex-1">
          <p className={`font-medium truncate ${!email.read ? 'font-semibold' : ''}`}>
            {email.fromName || email.from.split('@')[0]}
          </p>
          <p className="text-sm text-muted-foreground truncate">
            {email.subject}
          </p>
        </div>
        
        <div className="flex-shrink-0 text-xs text-muted-foreground">
          {formatDate(email.received)}
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground line-clamp-2">
        {email.body?.substring(0, 120) || ''}
      </p>
      
      <div className="mt-1 flex items-center">
        {categories.length > 0 && (
          <Badge 
            variant="outline" 
            className={`text-xs font-medium ${getCategoryColor(categories[0])}`}
          >
            {categories[0]}
          </Badge>
        )}
        
        {email.attachments && (email.attachments as any[]).length > 0 && (
          <Badge variant="outline" className="ml-2 text-xs font-medium bg-dark-elevated text-muted-foreground">
            <span className="mr-1">📎</span>
            {(email.attachments as any[]).length}
          </Badge>
        )}
        
        <button 
          className="ml-auto text-muted-foreground"
          onClick={handleStarToggle}
        >
          <Star className={`h-4 w-4 ${email.starred ? 'fill-status-warning text-status-warning' : ''}`} />
        </button>
      </div>
    </div>
  );
}
