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
    const { userId, todos } = JSON.parse(event.body || '{}');
    
    if (!userId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'userId is required' }),
      };
    }

    if (!Array.isArray(todos)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'todos must be an array' }),
      };
    }

    // Get the blob store
    const store = getStore('todos');
    
    // Save todos for the user
    await store.set(`todos_${userId}`, JSON.stringify(todos));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: 'Todos saved successfully' }),
    };
  } catch (error) {
    console.error('Error saving todos:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to save todos' }),
    };
  }
};