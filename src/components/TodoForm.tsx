import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { X, Check, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns@4.1.0';

interface TodoFormProps {
  onSubmit: (text: string, priority: 'low' | 'medium' | 'high', dueDate?: Date) => void;
  onCancel: () => void;
  initialText?: string;
  initialPriority?: 'low' | 'medium' | 'high';
  initialDueDate?: Date;
  isEditing?: boolean;
}

export function TodoForm({ 
  onSubmit, 
  onCancel, 
  initialText = '', 
  initialPriority = 'medium',
  initialDueDate,
  isEditing = false 
}: TodoFormProps) {
  const [text, setText] = useState(initialText);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(initialPriority);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDueDate);
  const [selectedTime, setSelectedTime] = useState<string>(
    initialDueDate ? format(initialDueDate, 'HH:mm') : '23:59'
  );
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      let finalDueDate: Date | undefined;
      
      if (selectedDate && selectedTime) {
        finalDueDate = new Date(selectedDate);
        const [hours, minutes] = selectedTime.split(':').map(Number);
        finalDueDate.setHours(hours, minutes, 0, 0);
      }
      
      onSubmit(text.trim(), priority, finalDueDate);
      setText('');
      setPriority('medium');
      setSelectedDate(undefined);
      setSelectedTime('23:59');
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

          {/* Due Date Section */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm">
              <CalendarIcon className="w-4 h-4" />
              Due Date & Time (optional)
            </Label>
            
            <div className="grid grid-cols-2 gap-3">
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-12 bg-input-background border-0 justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, "MMM dd")
                    ) : (
                      <span className="text-muted-foreground">Pick date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-background" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setIsCalendarOpen(false);
                    }}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="h-12 bg-input-background border-0 pl-10"
                  disabled={!selectedDate}
                />
              </div>
            </div>

            {selectedDate && (
              <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                <span>
                  Due: {format(selectedDate, "EEEE, MMMM do, yyyy")} at {new Date(`2000-01-01T${selectedTime}`).toLocaleTimeString([], { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                  })}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedDate(undefined);
                    setSelectedTime('23:59');
                  }}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
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