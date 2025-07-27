import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import AuthProvider  from './context/authContext.tsx'
import { CartProvider } from './context/cartContext.tsx'
import { ToastProvider } from './components/ui/toast.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
)
