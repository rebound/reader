import { createRoot } from 'react-dom/client';
import { App } from './components/app';
import './index.css';
import { StrictMode } from 'react';

const rootElement = document.getElementById('root');

if (!rootElement) throw new Error('Failed to find root element');

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
