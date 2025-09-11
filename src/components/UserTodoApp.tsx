import { useState, useEffect } from 'react';
import { TodoForm } from './TodoForm';
import { TodoList } from './TodoList';
import { TodoFilters } from './TodoFilters';
import { ThemeToggle } from './ThemeToggle';
import { NotificationManager } from './NotificationManager';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Plus, ArrowLeft, Heart, Users } from 'lucide-react';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  dueDate?: Date;
}

export type FilterType = 'all' | 'active' | 'completed';
export type SortType = 'newest' | 'oldest' | 'alphabetical' | 'priority' | 'duedate';

interface User {
  id: string;
  name: string;
  initials: string;
  color: string;
  type?: 'individual' | 'shared';
}

interface UserTodoAppProps {
  user: User;
  onBack: () => void;
}

export function UserTodoApp({ user, onBack }: UserTodoAppProps) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('newest');
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const isShared = user.type === 'shared';

  // Load user-specific todos from localStorage on mount
  useEffect(() => {
    const savedTodos = localStorage.getItem(`todos_${user.id}`);
    if (savedTodos) {
      const parsed = JSON.parse(savedTodos);
      setTodos(parsed.map((todo: any) => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined
      })));
    }
  }, [user.id]);

  // Save user-specific todos to localStorage whenever todos change
  useEffect(() => {
    localStorage.setItem(`todos_${user.id}`, JSON.stringify(todos));
  }, [todos, user.id]);

  const addTodo = (text: string, priority: 'low' | 'medium' | 'high', dueDate?: Date) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      text,
      completed: false,
      priority,
      createdAt: new Date(),
      dueDate
    };
    setTodos(prev => [newTodo, ...prev]);
    setIsAddingTodo(false);
  };

  const updateTodo = (id: string, text: string, priority: 'low' | 'medium' | 'high', dueDate?: Date) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, text, priority, dueDate } : todo
    ));
    setEditingId(null);
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const filteredTodos = todos.filter(todo => {
    switch (filter) {
      case 'active':
        return !todo.completed;
      case 'completed':
        return todo.completed;
      default:
        return true;
    }
  });

  const sortedTodos = [...filteredTodos].sort((a, b) => {
    switch (sort) {
      case 'oldest':
        return a.createdAt.getTime() - b.createdAt.getTime();
      case 'alphabetical':
        return a.text.localeCompare(b.text);
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'duedate':
        // Sort by due date, with no due date items at the end
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.getTime() - b.dueDate.getTime();
      default: // newest
        return b.createdAt.getTime() - a.createdAt.getTime();
    }
  });

  const completedCount = todos.filter(todo => todo.completed).length;
  const activeCount = todos.filter(todo => !todo.completed).length;

  const getTodoCount = () => {
    const total = todos.length;
    const active = todos.filter(todo => !todo.completed).length;
    return { total, active };
  };

  const getTodos = () => {
    return todos;
  };

  return (
    <div className={`min-h-screen ${isShared ? 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/10 dark:to-purple-950/10' : 'bg-background'}`}>
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between pt-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="h-10 w-10 p-0 mr-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarFallback className={`${user.color} text-white font-bold`}>
                  {user.initials}
                </AvatarFallback>
              </Avatar>
              {isShared && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <Heart className="w-2.5 h-2.5 text-white fill-current" />
                </div>
              )}
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
                {isShared && (
                  <div className="px-2 py-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-xs text-white font-medium">
                    Shared
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {isShared ? (
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {activeCount} active, {completedCount} completed goals
                  </span>
                ) : (
                  `${activeCount} active, ${completedCount} completed`
                )}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <NotificationManager 
              userId={user.id}
              userName={user.name}
              getTodoCount={getTodoCount}
              getTodos={getTodos}
            />
            <ThemeToggle />
          </div>
        </div>

        {/* Shared Tasks Info Banner */}
        {isShared && (
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-white fill-current" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Our Tasks</h3>
                <p className="text-sm text-muted-foreground">
                  Tasks and goals to accomplish together
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Add Todo Form */}
        {isAddingTodo && (
          <TodoForm
            onSubmit={addTodo}
            onCancel={() => setIsAddingTodo(false)}
          />
        )}

        {/* Filters and Sorting */}
        <TodoFilters
          filter={filter}
          sort={sort}
          onFilterChange={setFilter}
          onSortChange={setSort}
        />

        {/* Todo List */}
        <TodoList
          todos={sortedTodos}
          editingId={editingId}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
          onEdit={setEditingId}
          onUpdate={updateTodo}
        />

        {/* Add Button */}
        {!isAddingTodo && (
          <Button
            onClick={() => setIsAddingTodo(true)}
            className={`w-full h-12 gap-2 ${
              isShared 
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            <Plus className="w-5 h-5" />
            {isShared ? 'Add Tasks Baby' : 'Add New Task'}
          </Button>
        )}

        {/* Empty State */}
        {sortedTodos.length === 0 && (
          <div className="text-center py-12">
            <div className={`w-16 h-16 ${user.color} rounded-full flex items-center justify-center mx-auto mb-4 relative`}>
              <Plus className="w-8 h-8 text-white" />
              {isShared && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <Heart className="w-3 h-3 text-white fill-current" />
                </div>
              )}
            </div>
            <p className="text-muted-foreground">
              {filter === 'all' 
                ? (isShared ? 'No shared goals yet' : 'No tasks yet')
                : `No ${filter} ${isShared ? 'family goals' : 'tasks'}`
              }
            </p>
            {isShared && filter === 'all' && (
              <p className="text-sm text-muted-foreground mt-2">
                Create goals that we can work on together!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}