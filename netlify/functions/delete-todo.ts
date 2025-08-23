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

  if (event.httpMethod !== 'DELETE') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { userId, todoId } = JSON.parse(event.body || '{}');
    
    if (!userId || !todoId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'userId and todoId are required' }),
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

    // Find the todo to delete
    const todoIndex = todos.findIndex(todo => todo.id === todoId);
    if (todoIndex === -1) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Todo not found' }),
      };
    }

    // Remove the todo
    const deletedTodo = todos.splice(todoIndex, 1)[0];

    // Save updated todos
    await store.set(`todos_${userId}`, JSON.stringify(todos));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, deletedTodo }),
    };
  } catch (error) {
    console.error('Error deleting todo:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to delete todo' }),
    };
  }
};