import React, { ReactNode } from 'react';

// ToastProvider بسيط جداً - فقط wrapper للأطفال
export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <div className="toast-provider">{children}</div>;
};
