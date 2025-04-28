import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  X, 
  Minimize2, 
  Maximize2, 
  Bold, 
  Italic, 
  Link, 
  List, 
  ListOrdered, 
  Image, 
  Paperclip 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ComposeEmailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  replyToEmail?: any;
  initialValues?: {
    to?: string;
    cc?: string;
    bcc?: string;
    subject?: string;
    body?: string;
  };
}

export default function ComposeEmail({ 
  open, 
  onOpenChange, 
  replyToEmail,
  initialValues = {}
}: ComposeEmailProps) {
  const [to, setTo] = useState(initialValues.to || '');
  const [cc, setCc] = useState(initialValues.cc || '');
  const [bcc, setBcc] = useState(initialValues.bcc || '');
  const [subject, setSubject] = useState(initialValues.subject || '');
  const [body, setBody] = useState(initialValues.body || '');
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!to) {
      toast({
        title: 'Missing recipient',
        description: 'Please enter at least one recipient',
        variant: 'destructive',
      });
      return;
    }
    
    if (!subject) {
      toast({
        title: 'Missing subject',
        description: 'Please enter a subject for your email',
        variant: 'destructive',
      });
      return;
    }
    
    // In a real application, this would call the API to send the email
    toast({
      title: 'Email sent',
      description: 'Your email has been sent successfully',
    });
    
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setTo('');
    setCc('');
    setBcc('');
    setSubject('');
    setBody('');
    setAttachments([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(prev => [...prev, ...Array.from(e.target.files || [])]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`sm:max-w-[600px] ${isMinimized ? 'h-14 overflow-hidden' : ''}`}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="flex flex-row items-center justify-between p-2">
          <DialogTitle>
            {replyToEmail ? 'Reply' : 'New Message'}
          </DialogTitle>
          <div className="flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {!isMinimized && (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="to">To</Label>
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowCcBcc(!showCcBcc)}
                    className="h-6 px-2"
                  >
                    {showCcBcc ? 'Hide CC/BCC' : 'Show CC/BCC'}
                  </Button>
                </div>
                <Input
                  id="to"
                  placeholder="recipients@university.edu"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>

              {showCcBcc && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="cc">CC</Label>
                    <Input
                      id="cc"
                      placeholder="cc@university.edu"
                      value={cc}
                      onChange={(e) => setCc(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="bcc">BCC</Label>
                    <Input
                      id="bcc"
                      placeholder="bcc@university.edu"
                      value={bcc}
                      onChange={(e) => setBcc(e.target.value)}
                    />
                  </div>
                </>
              )}

              <div className="grid gap-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Email subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 bg-muted p-1 rounded-md">
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                  <Bold className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                  <Italic className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                  <Link className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                  <List className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                  <ListOrdered className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                  <Image className="h-4 w-4" />
                </Button>
                <label className="ml-auto cursor-pointer">
                  <input 
                    type="file" 
                    multiple 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                  <div className="p-1 rounded-md hover:bg-accent">
                    <Paperclip className="h-4 w-4" />
                  </div>
                </label>
              </div>
              
              <div className="min-h-[200px]">
                <textarea
                  className="w-full h-full min-h-[200px] bg-transparent border-none resize-none focus:outline-none"
                  placeholder="Write your message here..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              </div>

              {attachments.length > 0 && (
                <div className="border-t border-border pt-2">
                  <Label className="mb-2 block">Attachments</Label>
                  <div className="flex flex-wrap gap-2">
                    {attachments.map((file, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-1 bg-muted px-3 py-1 rounded-full text-xs"
                      >
                        <span>{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost" 
                          size="icon" 
                          className="h-4 w-4"
                          onClick={() => removeAttachment(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="mt-4">
              <Button type="submit" className="ml-auto">
                Send
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
