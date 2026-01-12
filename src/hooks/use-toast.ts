import { useContext } from 'react';

export const useToast = () => {
  // نظام toast بسيط يستخدم alert للآن
  const toast = ({ title, description, variant, className, duration }: {
    title?: string;
    description?: string;
    variant?: 'default' | 'destructive';
    className?: string;
    duration?: number;
  }) => {
    const message = title ? `${title}: ${description || ''}` : description || '';
    console.log('Toast:', message);
    
    // عرض alert بسيط للآن
    alert(message);
  };
  
  return { toast };
};
