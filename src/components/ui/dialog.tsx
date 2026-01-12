import * as React from "react"
import { X } from "lucide-react"

// Context للتحكم في حالة Dialog
const DialogContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>({
  open: false,
  onOpenChange: () => {},
});

// Dialog Root Component
interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const Dialog: React.FC<DialogProps> = ({ 
  open = false, 
  onOpenChange = () => {}, 
  children 
}) => {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
};

// Dialog Content Component
interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className = "", children, ...props }, ref) => {
    const { open, onOpenChange } = React.useContext(DialogContext);

    if (!open) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50" 
          onClick={() => onOpenChange(false)}
        />
        
        {/* Content */}
        <div
          ref={ref}
          className={`relative bg-white rounded-lg shadow-lg w-full mx-4 max-h-[85vh] overflow-hidden ${className}`}
          {...props}
        >
          {children}
          
          {/* Close Button */}
          <button
            className="absolute top-4 left-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>
      </div>
    );
  }
);

DialogContent.displayName = "DialogContent";

// Dialog Header Component
interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const DialogHeader: React.FC<DialogHeaderProps> = ({ 
  className = "", 
  children, 
  ...props 
}) => {
  return (
    <div
      className={`flex flex-col space-y-1.5 text-center sm:text-right p-6 pb-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Dialog Title Component
interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

const DialogTitle: React.FC<DialogTitleProps> = ({ 
  className = "", 
  children, 
  ...props 
}) => {
  return (
    <h2
      className={`text-lg font-semibold leading-none tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h2>
  );
};

// Dialog Description Component
interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

const DialogDescription: React.FC<DialogDescriptionProps> = ({ 
  className = "", 
  children, 
  ...props 
}) => {
  return (
    <p
      className={`text-sm text-gray-600 ${className}`}
      {...props}
    >
      {children}
    </p>
  );
};

// Dialog Footer Component
interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const DialogFooter: React.FC<DialogFooterProps> = ({ 
  className = "", 
  children, 
  ...props 
}) => {
  return (
    <div
      className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Dialog Trigger Component
interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  asChild?: boolean;
}

const DialogTrigger: React.FC<DialogTriggerProps> = ({ 
  children, 
  asChild = false,
  ...props 
}) => {
  const { onOpenChange } = React.useContext(DialogContext);
  
  if (asChild) {
    return React.cloneElement(children as React.ReactElement, {
      onClick: () => onOpenChange(true),
    });
  }
  
  return (
    <button
      onClick={() => onOpenChange(true)}
      {...props}
    >
      {children}
    </button>
  );
};

export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
}
