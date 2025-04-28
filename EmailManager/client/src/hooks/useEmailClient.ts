import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { User, Email, Category, EmailServer, Template } from '@shared/schema';

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading';

export function useEmailClient() {
  const [user, setUser] = useState<User | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
  const [currentFolder, setCurrentFolder] = useState('inbox');
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [selectedEmailId, setSelectedEmailId] = useState<number | null>(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user is logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('unimail_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setAuthStatus('authenticated');
      } catch (error) {
        localStorage.removeItem('unimail_user');
        setAuthStatus('unauthenticated');
      }
    } else {
      setAuthStatus('unauthenticated');
    }
  }, []);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await apiRequest('POST', '/api/auth/login', credentials);
      return response.json();
    },
    onSuccess: (data) => {
      setUser(data.user);
      setAuthStatus('authenticated');
      localStorage.setItem('unimail_user', JSON.stringify(data.user));
      toast({
        title: 'Login successful',
        description: 'Welcome back to UniMail',
      });
    },
    onError: (error) => {
      toast({
        title: 'Login failed',
        description: error.message || 'Invalid username or password',
        variant: 'destructive',
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: { 
      username: string; 
      password: string; 
      emailAddress: string;
      displayName?: string;
    }) => {
      const response = await apiRequest('POST', '/api/auth/register', userData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Registration successful',
        description: 'Your account has been created',
      });
    },
    onError: (error) => {
      toast({
        title: 'Registration failed',
        description: error.message || 'Could not create account',
        variant: 'destructive',
      });
    },
  });

  // Add email server mutation
  const addEmailServerMutation = useMutation({
    mutationFn: async (serverData: {
      userId: number;
      serverType: string;
      imapServer?: string;
      imapPort?: number;
      smtpServer?: string;
      smtpPort?: number;
      useSSL?: boolean;
      credentials: Record<string, any>;
    }) => {
      const response = await apiRequest('POST', '/api/email-servers', serverData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-servers'] });
      toast({
        title: 'Server added',
        description: 'Email server has been configured',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to add server',
        description: error.message || 'Could not configure email server',
        variant: 'destructive',
      });
    },
  });

  // Email queries
  const emailsQuery = useQuery({
    queryKey: ['/api/emails', user?.id, currentFolder, currentCategory],
    enabled: !!user,
    staleTime: 30000, // 30 seconds
  });

  const selectedEmailQuery = useQuery({
    queryKey: ['/api/emails', selectedEmailId],
    enabled: !!selectedEmailId,
  });

  // Mark email as read mutation
  const markEmailReadMutation = useMutation({
    mutationFn: async ({ id, read }: { id: number; read: boolean }) => {
      const response = await apiRequest('PATCH', `/api/emails/${id}/read`, { read });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/emails'] });
    },
  });

  // Star email mutation
  const starEmailMutation = useMutation({
    mutationFn: async ({ id, starred }: { id: number; starred: boolean }) => {
      const response = await apiRequest('PATCH', `/api/emails/${id}/star`, { starred });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/emails'] });
    },
  });

  // Move email to folder mutation
  const moveEmailMutation = useMutation({
    mutationFn: async ({ id, folder }: { id: number; folder: string }) => {
      const response = await apiRequest('PATCH', `/api/emails/${id}/folder`, { folder });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/emails'] });
      toast({
        title: 'Email moved',
        description: 'Email has been moved to the selected folder',
      });
    },
  });

  // Categories query
  const categoriesQuery = useQuery({
    queryKey: ['/api/categories', user?.id],
    enabled: !!user,
  });

  // Templates query
  const templatesQuery = useQuery({
    queryKey: ['/api/templates', user?.id],
    enabled: !!user,
  });

  // Logout function
  const logout = () => {
    setUser(null);
    setAuthStatus('unauthenticated');
    localStorage.removeItem('unimail_user');
    queryClient.clear();
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully',
    });
  };

  // Function to select an email and mark it as read
  const selectEmail = (emailId: number) => {
    setSelectedEmailId(emailId);
    if (emailId) {
      markEmailReadMutation.mutate({ id: emailId, read: true });
    }
  };

  return {
    user,
    authStatus,
    currentFolder,
    setCurrentFolder,
    currentCategory,
    setCurrentCategory,
    selectedEmailId,
    setSelectedEmailId,
    selectEmail,
    isFocusMode,
    setIsFocusMode,
    
    // Auth
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    logout,
    
    // Email server
    addEmailServer: addEmailServerMutation.mutate,
    isAddingServer: addEmailServerMutation.isPending,
    
    // Emails
    emails: emailsQuery.data as Email[] | undefined,
    isLoadingEmails: emailsQuery.isLoading,
    selectedEmail: selectedEmailQuery.data as Email | undefined,
    isLoadingSelectedEmail: selectedEmailQuery.isLoading,
    markEmailRead: markEmailReadMutation.mutate,
    starEmail: starEmailMutation.mutate,
    moveEmail: moveEmailMutation.mutate,
    
    // Categories
    categories: categoriesQuery.data as Category[] | undefined,
    isLoadingCategories: categoriesQuery.isLoading,
    
    // Templates
    templates: templatesQuery.data as Template[] | undefined,
    isLoadingTemplates: templatesQuery.isLoading,
  };
}
