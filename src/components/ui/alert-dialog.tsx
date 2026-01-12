import React from 'react';
import { Button } from './button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';

export interface AlertDialogProps {
  children: React.ReactNode;
}

export interface AlertDialogTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

export interface AlertDialogContentProps {
  children: React.ReactNode;
  className?: string;
}

export interface AlertDialogHeaderProps {
  children: React.ReactNode;
}

export interface AlertDialogTitleProps {
  children: React.ReactNode;
}

export interface AlertDialogDescriptionProps {
  children: React.ReactNode;
}

export interface AlertDialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

export interface AlertDialogActionProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export interface AlertDialogCancelProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({ children }) => {
  return <>{children}</>;
};

export const AlertDialogTrigger: React.FC<AlertDialogTriggerProps> = ({ children, asChild }) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children);
  }
  return <>{children}</>;
};

export const AlertDialogContent: React.FC<AlertDialogContentProps> = ({ children, className = '' }) => {
  return (
    <DialogContent className={`sm:max-w-md ${className}`}>
      {children}
    </DialogContent>
  );
};

export const AlertDialogHeader: React.FC<AlertDialogHeaderProps> = ({ children }) => {
  return <DialogHeader>{children}</DialogHeader>;
};

export const AlertDialogTitle: React.FC<AlertDialogTitleProps> = ({ children }) => {
  return <DialogTitle>{children}</DialogTitle>;
};

export const AlertDialogDescription: React.FC<AlertDialogDescriptionProps> = ({ children }) => {
  return (
    <div className="text-sm text-muted-foreground">
      {children}
    </div>
  );
};

export const AlertDialogFooter: React.FC<AlertDialogFooterProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className}`}>
      {children}
    </div>
  );
};

export const AlertDialogAction: React.FC<AlertDialogActionProps> = ({ 
  children, 
  onClick, 
  className = '', 
  variant = 'default' 
}) => {
  return (
    <Button variant={variant} className={className} onClick={onClick}>
      {children}
    </Button>
  );
};

export const AlertDialogCancel: React.FC<AlertDialogCancelProps> = ({ 
  children, 
  onClick, 
  className = '' 
}) => {
  return (
    <Button variant="outline" className={`mt-2 sm:mt-0 ${className}`} onClick={onClick}>
      {children}
    </Button>
  );
};