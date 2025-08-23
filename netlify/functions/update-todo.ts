import { getStore } from '@netlify/blobs';
import type { Handler } from '@netlify/functions';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export const handler: Handler = async (event) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'PUT') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { userId, todoId, updates } = JSON.parse(event.body || '{}');
    
    if (!userId || !todoId || !updates) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'userId, todoId, and updates are required' }),
      };
    }

    // Get the blob store
    const store = getStore('todos');
    
    // Get existing todos
    const todosBlob = await store.get(`todos_${userId}`);
    if (!todosBlob) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'User todos not found' }),
      };
    }

    const todosText = await todosBlob.text();
    let todos: Todo[] = JSON.parse(todosText);

    // Find and update the todo
    const todoIndex = todos.findIndex(todo => todo.id === todoId);
    if (todoIndex === -1) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Todo not found' }),
      };
    }

    // Update the todo
    todos[todoIndex] = { ...todos[todoIndex], ...updates };

    // Save updated todos
    await store.set(`todos_${userId}`, JSON.stringify(todos));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, todo: todos[todoIndex] }),
    };
  } catch (error) {
    console.error('Error updating todo:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to update todo' }),
    };
  }
};