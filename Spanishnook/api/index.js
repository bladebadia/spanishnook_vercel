// Vercel serverless function for Quasar SSR
import { handler, app } from '../dist/ssr/index.js';

export default async function(req, res) {
  try {
    // Si handler es una función, la usamos directamente
    if (typeof handler === 'function') {
      return await handler(req, res);
    }
    
    // Si no, intentamos usar la app Express
    if (app && typeof app === 'function') {
      return app(req, res);
    }
    
    // Fallback: tratar handler como Express app
    if (handler && typeof handler.handle === 'function') {
      return handler.handle(req, res);
    }
    
    throw new Error('No valid handler found');
  } catch (error) {
    console.error('Vercel function error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: error.message 
    });
  }
}