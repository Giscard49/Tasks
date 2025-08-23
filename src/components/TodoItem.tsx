import { motion } from 'motion/react';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Trash2, Edit3 } from 'lucide-react';
import { Todo } from './TodoApp';

interface TodoItemProps {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

export function TodoItem({ todo, onToggle, onDelete, onEdit }: TodoItemProps) {
  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '';
    }
  };

  const getPriorityBorder = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-muted';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`p-4 border-l-4 ${getPriorityBorder(todo.priority)} hover:shadow-md transition-shadow group`}>
        <div className="flex items-start gap-3">
          <div className="pt-1">
            <Checkbox
              checked={todo.completed}
              onCheckedChange={onToggle}
              className="w-5 h-5"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs">{getPriorityIndicator(todo.priority)}</span>
              <span className="text-xs text-muted-foreground capitalize">
                {todo.priority} priority
              </span>
            </div>
            
            <p className={`text-base leading-relaxed break-words ${
              todo.completed 
                ? 'line-through text-muted-foreground' 
                : 'text-foreground'
            }`}>
              {todo.text}
            </p>
            
            <div className="text-xs text-muted-foreground mt-2">
              {todo.createdAt.toLocaleDateString()} at {todo.createdAt.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
          
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="h-8 w-8 p-0 hover:bg-accent"
              disabled={todo.completed}
            >
              <Edit3 className="w-4 h-4 text-muted-foreground" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-8 w-8 p-0 hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}