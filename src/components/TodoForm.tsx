import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card } from './ui/card';
import { X, Check } from 'lucide-react';

interface TodoFormProps {
  onSubmit: (text: string, priority: 'low' | 'medium' | 'high') => void;
  onCancel: () => void;
  initialText?: string;
  initialPriority?: 'low' | 'medium' | 'high';
  isEditing?: boolean;
}

export function TodoForm({ 
  onSubmit, 
  onCancel, 
  initialText = '', 
  initialPriority = 'medium',
  isEditing = false 
}: TodoFormProps) {
  const [text, setText] = useState(initialText);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(initialPriority);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text.trim(), priority);
      setText('');
      setPriority('medium');
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const getPriorityLabel = (p: string) => {
    switch (p) {
      case 'high':
        return '🔴 High';
      case 'medium':
        return '🟡 Medium';
      case 'low':
        return '🟢 Low';
      default:
        return 'Select priority';
    }
  };

  return (
    <Card className="p-4 border-2 border-dashed border-muted-foreground/30">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What needs to be done?"
            className="text-base bg-input-background border-0 h-12"
            autoFocus
          />
          
          <Select value={priority} onValueChange={(value) => setPriority(value as 'low' | 'medium' | 'high')}>
            <SelectTrigger className="h-12 bg-input-background border-0">
              <SelectValue className={getPriorityColor(priority)}>
                {getPriorityLabel(priority)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high" className="text-red-500">
                🔴 High Priority
              </SelectItem>
              <SelectItem value="medium" className="text-yellow-500">
                🟡 Medium Priority
              </SelectItem>
              <SelectItem value="low" className="text-green-500">
                🟢 Low Priority
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={!text.trim()}
            className="flex-1 h-11 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Check className="w-4 h-4" />
            {isEditing ? 'Update' : 'Add Task'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="h-11 px-4"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
}