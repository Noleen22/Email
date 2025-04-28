import { useState } from 'react';
import { useLocation } from 'wouter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';
import EmailItem from './EmailItem';
import { useEmailClient } from '@/hooks/useEmailClient';
import type { Email } from '@shared/schema';

interface EmailListProps {
  collapsed?: boolean;
  onEmailSelect: (emailId: number) => void;
}

export default function EmailList({ collapsed = false, onEmailSelect }: EmailListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('primary');
  
  const { 
    emails, 
    isLoadingEmails, 
    selectedEmailId,
    currentFolder
  } = useEmailClient();
  
  const [location] = useLocation();

  // Filter emails by search query
  const filteredEmails = emails?.filter(email => {
    if (!searchQuery) return true;
    
    const subject = email.subject?.toLowerCase() || '';
    const from = email.from?.toLowerCase() || '';
    const fromName = email.fromName?.toLowerCase() || '';
    const body = email.body?.toLowerCase() || '';
    
    const query = searchQuery.toLowerCase();
    
    return subject.includes(query) || 
      from.includes(query) || 
      fromName.includes(query) || 
      body.includes(query);
  });

  // Get capitalized folder name
  const getFolderName = () => {
    return currentFolder.charAt(0).toUpperCase() + currentFolder.slice(1);
  };

  // Render loading skeletons
  const renderSkeletons = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="p-3 border-b border-border">
        <div className="flex items-start mb-1">
          <Skeleton className="h-8 w-8 rounded-full mr-2" />
          <div className="flex-1">
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-3 w-10" />
        </div>
        <Skeleton className="h-3 w-full mt-2" />
        <Skeleton className="h-3 w-5/6 mt-1" />
        <div className="mt-2 flex">
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
      </div>
    ));
  };

  return (
    <div 
      className={`border-r border-border h-full flex flex-col transition-all duration-300 ${
        collapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-80'
      }`}
    >
      <div className="p-3 border-b border-border sticky top-0 bg-card z-10">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search emails"
            className="pl-8 bg-muted"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Tabs defaultValue="primary" value={activeTab} onValueChange={setActiveTab} className="mt-3">
          <TabsList className="w-full">
            <TabsTrigger value="primary" className="flex-1">Primary</TabsTrigger>
            <TabsTrigger value="social" className="flex-1">Social</TabsTrigger>
            <TabsTrigger value="promotions" className="flex-1">Promotions</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="overflow-y-auto flex-1">
        {isLoadingEmails ? (
          renderSkeletons()
        ) : (
          filteredEmails && filteredEmails.length > 0 ? (
            filteredEmails.map(email => (
              <EmailItem
                key={email.id}
                email={email}
                onClick={() => onEmailSelect(email.id)}
                isSelected={selectedEmailId === email.id}
              />
            ))
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              <p>No emails in {getFolderName()}</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
