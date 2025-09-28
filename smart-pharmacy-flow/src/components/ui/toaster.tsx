import React from 'react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

const Toaster: React.FC = () => {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = new Date().getTime();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 3000);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <div className="fixed top-0 right-0 p-4">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          {toast.message}
          <button onClick={() => removeToast(toast.id)}>X</button>
        </div>
      ))}
    </div>
  );
};

export const useToaster = () => {
  const context = React.useContext(ToasterContext);
  if (!context) {
    throw new Error('useToaster must be used within a ToasterProvider');
  }
  return context;
};

const ToasterContext = React.createContext<{ addToast: (message: string, type: 'success' | 'error' | 'info') => void } | undefined>(undefined);

export const ToasterProvider: React.FC = ({ children }) => {
  const addToast = (message: string, type: 'success' | 'error' | 'info') => {
    // Implementation to add toast
  };

  return (
    <ToasterContext.Provider value={{ addToast }}>
      {children}
      <Toaster />
    </ToasterContext.Provider>
  );
};