import React from 'react';
import { X } from 'lucide-react';

export interface ToastProps {
  id: string;
  title?: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ id, title, message, type, onClose }) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500 border-green-600';
      case 'error':
        return 'bg-red-500 border-red-600';
      case 'warning':
        return 'bg-yellow-500 border-yellow-600';
      case 'info':
        return 'bg-blue-500 border-blue-600';
      default:
        return 'bg-gray-500 border-gray-600';
    }
  };

  return (
    <div 
      className={`fixed top-4 right-4 z-50 max-w-sm p-4 rounded-lg shadow-lg text-white border-l-4 ${getTypeStyles()} transform transition-all duration-300 ease-in-out`}
      style={{ direction: 'rtl' }}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {title && (
            <h3 className="font-bold text-sm mb-1">{title}</h3>
          )}
          <p className="text-sm opacity-90">{message}</p>
        </div>
        <button
          onClick={() => onClose(id)}
          className="ml-2 text-white hover:text-gray-200 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export const ToastContainer: React.FC<{ toasts: ToastProps[]; onClose: (id: string) => void }> = ({ toasts, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast, index) => (
        <div 
          key={toast.id}
          style={{ transform: `translateY(${index * 10}px)` }}
        >
          <Toast {...toast} onClose={onClose} />
        </div>
      ))}
    </div>
  );
};
