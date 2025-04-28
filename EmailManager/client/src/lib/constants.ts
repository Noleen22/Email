export const FOLDERS = [
  { id: 'inbox', name: 'Inbox', icon: 'inbox' },
  { id: 'starred', name: 'Starred', icon: 'star' },
  { id: 'sent', name: 'Sent', icon: 'send' },
  { id: 'drafts', name: 'Drafts', icon: 'drafts' },
  { id: 'trash', name: 'Trash', icon: 'delete' },
];

export const EMAIL_PROVIDERS = [
  { id: 'auto', name: 'Auto-detect' },
  { id: 'outlook', name: 'Outlook/Office365' },
  { id: 'gmail', name: 'Gmail/Google Workspace' },
  { id: 'custom', name: 'Custom IMAP/SMTP' },
];

export const SHORTCUT_CATEGORIES = [
  {
    name: 'Navigation',
    shortcuts: [
      { key: 'g i', description: 'Go to Inbox' },
      { key: 'g s', description: 'Go to Starred' },
      { key: 'g t', description: 'Go to Sent' },
      { key: 'g d', description: 'Go to Drafts' },
    ],
  },
  {
    name: 'Actions',
    shortcuts: [
      { key: 'c', description: 'Compose new email' },
      { key: 'e', description: 'Archive' },
      { key: '#', description: 'Delete' },
      { key: 'r', description: 'Reply' },
    ],
  },
  {
    name: 'Email list',
    shortcuts: [
      { key: 'j', description: 'Select next email' },
      { key: 'k', description: 'Select previous email' },
      { key: 'o', description: 'Open selected email' },
      { key: 's', description: 'Toggle star' },
    ],
  },
];

export const DEFAULT_CATEGORIES = [
  { name: 'Classes', color: '#2196F3', icon: 'school' },
  { name: 'Administration', color: '#FFC107', icon: 'admin_panel_settings' },
  { name: 'Events', color: '#4CAF50', icon: 'event' },
  { name: 'Important', color: '#FF5252', icon: 'priority_high' },
];

export const UNIVERSITY_DOMAINS = [
  'edu',
  'ac.uk',
  'edu.au',
  'ac.nz',
  'edu.sg',
  'ca',
  'edu.my',
  'ac.in',
  'ac.za',
];
