import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Heart, Plus, CheckCircle } from 'lucide-react';

const DEMO_FAMILY_TASKS = [
  'Plan weekend family movie night',
  'Organize family photo album',
  'Plan vacation for next summer',
  'Create family emergency plan',
  'Set up family game tournament',
  'Plan and cook a special dinner together',
  'Organize family outdoor adventure',
  'Create family budget for next month'
];

interface FamilyTaskDemoProps {
  onAddTasks?: (tasks: string[]) => void;
}

export function FamilyTaskDemo({ onAddTasks }: FamilyTaskDemoProps) {
  const [isAdding, setIsAdding] = useState(false);

  const addDemoTasks = () => {
    setIsAdding(true);
    
    // Add a few demo tasks to shared storage
    const existingTasks = localStorage.getItem('todos_shared');
    const tasks = existingTasks ? JSON.parse(existingTasks) : [];
    
    const selectedTasks = DEMO_FAMILY_TASKS.slice(0, 3);
    const newTasks = selectedTasks.map((text, index) => ({
      id: `demo_${Date.now()}_${index}`,
      text,
      completed: false,
      priority: index === 0 ? 'high' : index === 1 ? 'medium' : 'low',
      createdAt: new Date(Date.now() - index * 1000 * 60 * 5) // 5 minutes apart
    }));

    localStorage.setItem('todos_shared', JSON.stringify([...newTasks, ...tasks]));
    
    setTimeout(() => {
      setIsAdding(false);
      if (onAddTasks) {
        onAddTasks(selectedTasks);
      }
    }, 1000);
  };

  return (
    <Card className="p-4 border-dashed border-2 border-muted-foreground/30 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/10 dark:to-purple-950/10">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center mx-auto relative">
          <Heart className="w-6 h-6 text-blue-600 dark:text-blue-400 fill-current" />
        </div>
        
        <div>
          <h3 className="font-medium text-foreground mb-1">Our Goals</h3>
          <p className="text-sm text-muted-foreground">
            Try adding some example Our tasks to get started
          </p>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>Examples: "{DEMO_FAMILY_TASKS[0]}"</p>
          <p>"{DEMO_FAMILY_TASKS[1]}"</p>
          <p>"{DEMO_FAMILY_TASKS[2]}"</p>
        </div>

        <Button 
          onClick={addDemoTasks}
          disabled={isAdding}
          variant="outline"
          size="sm"
          className="gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-300 dark:border-blue-700"
        >
          {isAdding ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Added!
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Add Demo Tasks
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground">
          Perfect for our planning and bonding activities
        </div>
      </div>
    </Card>
  );
}