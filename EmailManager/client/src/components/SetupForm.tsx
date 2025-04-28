import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { EMAIL_PROVIDERS, UNIVERSITY_DOMAINS } from '@/lib/constants';
import { useEmailClient } from '@/hooks/useEmailClient';

// Define the form schema with zod
const formSchema = z.object({
  emailAddress: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  serverType: z.string(),
  imapServer: z.string().optional(),
  imapPort: z.coerce.number().optional(),
  smtpServer: z.string().optional(),
  smtpPort: z.coerce.number().optional(),
  useSSL: z.boolean().default(true),
  rememberPassword: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface SetupFormProps {
  onSuccess: () => void;
  onCancel?: () => void;
}

export default function SetupForm({ onSuccess, onCancel }: SetupFormProps) {
  const { user, addEmailServer, isAddingServer } = useEmailClient();
  const [showCustomFields, setShowCustomFields] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emailAddress: user?.emailAddress || '',
      password: '',
      serverType: 'auto',
      imapServer: '',
      imapPort: 993,
      smtpServer: '',
      smtpPort: 587,
      useSSL: true,
      rememberPassword: true,
    },
  });

  const onSubmit = (data: FormValues) => {
    if (!user) return;

    // Convert form data to server configuration
    const serverData = {
      userId: user.id,
      serverType: data.serverType,
      imapServer: data.imapServer,
      imapPort: data.imapPort,
      smtpServer: data.smtpServer,
      smtpPort: data.smtpPort,
      useSSL: data.useSSL,
      credentials: {
        email: data.emailAddress,
        password: data.rememberPassword ? data.password : undefined,
      },
    };

    addEmailServer(serverData);
    onSuccess();
  };

  // Update custom fields visibility when server type changes
  const handleServerTypeChange = (value: string) => {
    form.setValue('serverType', value);
    setShowCustomFields(value === 'custom');
  };

  // Check if the email is from a university domain
  const isUniversityEmail = (email: string) => {
    return UNIVERSITY_DOMAINS.some(domain => email.toLowerCase().endsWith(domain));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="emailAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>University Email Address</FormLabel>
              <FormControl>
                <Input 
                  placeholder="student@university.edu" 
                  {...field} 
                />
              </FormControl>
              {field.value && !isUniversityEmail(field.value) && (
                <FormDescription className="text-status-warning">
                  This doesn't appear to be a university email.
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="********" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="serverType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mail Server</FormLabel>
              <Select 
                onValueChange={handleServerTypeChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a mail server" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {EMAIL_PROVIDERS.map(provider => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {showCustomFields && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="imapServer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IMAP Server</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="imap.university.edu" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imapPort"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IMAP Port</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="993" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="smtpServer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SMTP Server</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="smtp.university.edu" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="smtpPort"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SMTP Port</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="587" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="useSSL"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Use SSL/TLS</FormLabel>
                    <FormDescription>
                      Enable secure connection to mail servers
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name="rememberPassword"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Remember password</FormLabel>
                <FormDescription>
                  Store your password securely for automatic login
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="mt-6 flex justify-between">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
            >
              Later
            </Button>
          )}
          <Button 
            type="submit" 
            className={onCancel ? '' : 'w-full'}
            disabled={isAddingServer}
          >
            {isAddingServer ? 'Connecting...' : 'Connect Account'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
