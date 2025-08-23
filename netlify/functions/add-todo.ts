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

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { userId, text, priority } = JSON.parse(event.body || '{}');
    
    if (!userId || !text || !priority) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'userId, text, and priority are required' }),
      };
    }

    // Get the blob store
    const store = getStore('todos');
    
    // Get existing todos
    const todosBlob = await store.get(`todos_${userId}`);
    let todos: Todo[] = [];
    if (todosBlob) {
      const todosText = await todosBlob.text();
      todos = JSON.parse(todosText);
    }

    // Create new todo
    const newTodo: Todo = {
      id: Date.now().toString(),
      text,
      completed: false,
      priority,
      createdAt: new Date().toISOString(),
    };

    // Add to beginning of array
    todos.unshift(newTodo);

    // Save updated todos
    await store.set(`todos_${userId}`, JSON.stringify(todos));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, todo: newTodo }),
    };
  } catch (error) {
    console.error('Error adding todo:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to add todo' }),
    };
  }
};