import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#ffffff',
              color: '#1a1714',
              border: '1px solid rgba(191, 161, 95, 0.35)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
              fontFamily: 'var(--ryox-font-body)',
              fontSize: '0.9rem',
              borderRadius: '10px',
            },
            success: {
              iconTheme: {
                primary: '#bfa15f',
                secondary: '#ffffff',
              },
            },
          }}
        />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
)