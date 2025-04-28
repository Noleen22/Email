import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ShortcutItem {
  key: string;
  description: string;
}

interface ShortcutCategory {
  name: string;
  shortcuts: ShortcutItem[];
}

interface KeyboardShortcutsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: ShortcutCategory[];
}

export default function KeyboardShortcuts({
  open,
  onOpenChange,
  categories,
}: KeyboardShortcutsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle className="text-xl font-semibold">Keyboard Shortcuts</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="grid gap-6 overflow-y-auto max-h-[70vh]">
          {categories.map((category, i) => (
            <div key={i}>
              <h3 className="text-sm uppercase text-muted-foreground mb-2">
                {category.name}
              </h3>
              <ul className="space-y-2">
                {category.shortcuts.map((shortcut, j) => (
                  <li key={j} className="flex justify-between">
                    <span>{shortcut.description}</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-sm">
                      {shortcut.key}
                    </kbd>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
