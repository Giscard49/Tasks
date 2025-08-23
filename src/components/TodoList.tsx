import { TodoItem } from './TodoItem';
import { TodoForm } from './TodoForm';
import { Todo } from './TodoApp';

interface TodoListProps {
  todos: Todo[];
  editingId: string | null;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onUpdate: (id: string, text: string, priority: 'low' | 'medium' | 'high') => void;
}

export function TodoList({ 
  todos, 
  editingId, 
  onToggle, 
  onDelete, 
  onEdit, 
  onUpdate 
}: TodoListProps) {
  return (
    <div className="space-y-2">
      {todos.map((todo) => (
        <div key={todo.id}>
          {editingId === todo.id ? (
            <TodoForm
              initialText={todo.text}
              initialPriority={todo.priority}
              isEditing={true}
              onSubmit={(text, priority) => onUpdate(todo.id, text, priority)}
              onCancel={() => onEdit('')}
            />
          ) : (
            <TodoItem
              todo={todo}
              onToggle={() => onToggle(todo.id)}
              onDelete={() => onDelete(todo.id)}
              onEdit={() => onEdit(todo.id)}
            />
          )}
        </div>
      ))}
    </div>
  );
}