
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Safe access to environment variables for Vite
// @ts-ignore
const meta = import.meta || {};
// @ts-ignore
const env = meta.env || {};

// Polyfill process.env for Google GenAI SDK
// This ensures 'process.env.API_KEY' access works in the browser
// @ts-ignore
window.process = {
  env: {
    API_KEY: env.VITE_API_KEY || env.API_KEY || 'AIzaSyAK9MWXu8xbDodqeikISEPkvBJ7UZLBh28', // Fallback for stability
    NODE_ENV: env.MODE || 'development'
  }
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
