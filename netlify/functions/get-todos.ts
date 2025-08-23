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

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { userId } = event.queryStringParameters || {};
    
    if (!userId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'userId is required' }),
      };
    }

    // Get the blob store
    const store = getStore('todos');
    
    // Try to get todos for the user
    const todosBlob = await store.get(`todos_${userId}`);
    
    let todos: Todo[] = [];
    if (todosBlob) {
      const todosText = await todosBlob.text();
      todos = JSON.parse(todosText);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ todos }),
    };
  } catch (error) {
    console.error('Error getting todos:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to get todos' }),
    };
  }
};