import { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import './Toaster.css';

interface ToasterProviderProps {
  children: ReactNode;
}

export function ToasterProvider({ children }: ToasterProviderProps) {
  return (
    <>
      <Toaster
        position="bottom-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--bg-medium, #12122e)',
            color: 'var(--text-primary, #ffffff)',
            border: '1px solid var(--border, rgba(139, 92, 246, 0.2))',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            fontSize: '0.95rem',
            fontWeight: 500,
            borderRadius: '8px',
            padding: '12px 16px',
          },
          loading: {
            duration: Infinity,
          },
          success: {
            duration: 3000,
          },
          error: {
            duration: 4000,
          },
      }}
      />
      {children}
    </>
  );
}
