import React from 'react';

interface TooltipProps {
  children: React.ReactNode;
  delayDuration?: number;
}

interface TooltipTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

interface TooltipContentProps {
  children: React.ReactNode;
  className?: string;
}

export const TooltipProvider: React.FC<TooltipProps> = ({ children }) => {
  return <>{children}</>;
};

export const Tooltip: React.FC<TooltipProps> = ({ children }) => {
  return <div className="relative group">{children}</div>;
};

export const TooltipTrigger: React.FC<TooltipTriggerProps> = ({ 
  children, 
  asChild = false 
}) => {
  return <>{children}</>;
};

export const TooltipContent: React.FC<TooltipContentProps> = ({ 
  children, 
  className = "" 
}) => {
  return (
    <div 
      className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 ${className}`}
    >
      {children}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
    </div>
  );
};