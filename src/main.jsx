import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // ✅ Only if you have Tailwind or global CSS

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
