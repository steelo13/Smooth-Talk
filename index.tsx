import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

console.log("Starting index.tsx execution...");

const mountApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error("Root element not found");
    return;
  }

  console.log("Root element found. Mounting React App...");

  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <ErrorBoundary>
          <App />
      </ErrorBoundary>
    );
    console.log("React render call successful.");
  } catch (e) {
    console.error("React failed to render:", e);
  }
};

// Robust DOM check
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}