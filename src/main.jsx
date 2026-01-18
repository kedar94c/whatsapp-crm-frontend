import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BusinessProvider } from "./context/BusinessContext";
import './index.css'
import App from './App.jsx'

console.log('MAIN LOADED');

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BusinessProvider>
      <App />
    </BusinessProvider>
  </StrictMode>
);
