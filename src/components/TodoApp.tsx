import { useState, useEffect } from 'react';
import { TodoForm } from './TodoForm';
import { TodoList } from './TodoList';
import { TodoFilters } from './TodoFilters';
import { ThemeToggle } from './ThemeToggle';
import { NotificationManager } from './NotificationManager';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';

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

export function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('newest');
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Load todos from localStorage on mount
  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      const parsed = JSON.parse(savedTodos);
      setTodos(parsed.map((todo: any) => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined
      })));
    }
  }, []);

  // Save todos to localStorage whenever todos change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

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
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pt-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
            <p className="text-sm text-muted-foreground">
              {activeCount} active, {completedCount} completed
            </p>
          </div>
          <div className="flex gap-2">
            <NotificationManager 
              getTodoCount={getTodoCount}
              getTodos={getTodos}
            />
            <ThemeToggle />
          </div>
        </div>

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
            className="w-full h-12 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-5 h-5" />
            Add New Task
          </Button>
        )}

        {/* Empty State */}
        {sortedTodos.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              {filter === 'all' ? 'No tasks yet' : `No ${filter} tasks`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}