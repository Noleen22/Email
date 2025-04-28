import { useEffect } from 'react';
import { useLocation } from 'wouter';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Mail } from 'lucide-react';
import SetupForm from '@/components/SetupForm';
import { useEmailClient } from '@/hooks/useEmailClient';

export default function Setup() {
  const [, navigate] = useLocation();
  const { authStatus, user } = useEmailClient();

  // Redirect if already authenticated
  useEffect(() => {
    if (authStatus === 'authenticated' && user) {
      navigate('/inbox');
    }
  }, [authStatus, user, navigate]);

  // Handle setup success
  const handleSetupSuccess = () => {
    navigate('/inbox');
  };

  // Skip setup for now
  const handleSkipSetup = () => {
    navigate('/inbox');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Mail className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">UniMail</h1>
          </div>
          <p className="text-muted-foreground">
            Your university email client
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome to UniMail</CardTitle>
            <CardDescription>
              Connect to your university email server to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SetupForm 
              onSuccess={handleSetupSuccess}
              onCancel={handleSkipSetup}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
