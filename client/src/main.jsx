import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#FAFAFA',
            color: '#1A1A1C',
            border: '1px solid #E9ECEF',
            borderRadius: '10px',
            fontSize: '0.88rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
          }
        }}
      />
    </BrowserRouter>
  </StrictMode>
);
