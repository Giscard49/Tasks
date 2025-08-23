export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

const API_BASE = '/api';

// Helper function to convert API todo to local todo format
const convertApiTodo = (apiTodo: any): Todo => ({
  ...apiTodo,
  createdAt: new Date(apiTodo.createdAt)
});

// Helper function to convert local todo to API format
const convertToApiTodo = (todo: Todo): any => ({
  ...todo,
  createdAt: todo.createdAt.toISOString()
});

export const todoApi = {
  // Get all todos for a user
  async getTodos(userId: string): Promise<Todo[]> {
    try {
      const response = await fetch(`${API_BASE}/get-todos?userId=${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.todos.map(convertApiTodo);
    } catch (error) {
      console.error('Error fetching todos:', error);
      // Fallback to localStorage if API fails
      const savedTodos = localStorage.getItem(`todos_${userId}`);
      if (savedTodos) {
        const parsed = JSON.parse(savedTodos);
        return parsed.map((todo: any) => convertApiTodo(todo));
      }
      return [];
    }
  },

  // Save all todos for a user
  async saveTodos(userId: string, todos: Todo[]): Promise<void> {
    try {
      const apiTodos = todos.map(convertToApiTodo);
      const response = await fetch(`${API_BASE}/save-todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, todos: apiTodos }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Also save to localStorage as backup
      localStorage.setItem(`todos_${userId}`, JSON.stringify(apiTodos));
    } catch (error) {
      console.error('Error saving todos:', error);
      // Fallback to localStorage if API fails
      localStorage.setItem(`todos_${userId}`, JSON.stringify(todos.map(convertToApiTodo)));
      throw error;
    }
  },

  // Add a new todo
  async addTodo(userId: string, text: string, priority: 'low' | 'medium' | 'high'): Promise<Todo> {
    try {
      const response = await fetch(`${API_BASE}/add-todo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, text, priority }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return convertApiTodo(data.todo);
    } catch (error) {
      console.error('Error adding todo:', error);
      throw error;
    }
  },

  // Update a todo
  async updateTodo(userId: string, todoId: string, updates: Partial<Todo>): Promise<Todo> {
    try {
      const apiUpdates = updates.createdAt ? { ...updates, createdAt: updates.createdAt.toISOString() } : updates;
      const response = await fetch(`${API_BASE}/update-todo`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, todoId, updates: apiUpdates }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return convertApiTodo(data.todo);
    } catch (error) {
      console.error('Error updating todo:', error);
      throw error;
    }
  },

  // Delete a todo
  async deleteTodo(userId: string, todoId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/delete-todo`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, todoId }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
      throw error;
    }
  },

  // Sync local storage with remote storage
  async syncTodos(userId: string): Promise<Todo[]> {
    try {
      // Get remote todos
      const remoteTodos = await this.getTodos(userId);
      
      // Get local todos
      const savedTodos = localStorage.getItem(`todos_${userId}`);
      const localTodos: Todo[] = savedTodos ? 
        JSON.parse(savedTodos).map(convertApiTodo) : [];

      // Simple sync strategy: use remote if available, otherwise use local
      if (remoteTodos.length > 0 || localTodos.length === 0) {
        // Save remote todos to local storage
        localStorage.setItem(`todos_${userId}`, JSON.stringify(remoteTodos.map(convertToApiTodo)));
        return remoteTodos;
      } else {
        // Upload local todos to remote
        await this.saveTodos(userId, localTodos);
        return localTodos;
      }
    } catch (error) {
      console.error('Error syncing todos:', error);
      // Fallback to local storage
      const savedTodos = localStorage.getItem(`todos_${userId}`);
      return savedTodos ? JSON.parse(savedTodos).map(convertApiTodo) : [];
    }
  }
};