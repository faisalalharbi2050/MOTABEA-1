import * as React from "react"

// مكون Badge مبسط
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

function Badge({ className = "", variant = "default", children, ...props }: BadgeProps) {
  const baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  
  const variantClasses = {
    default: "border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200",
    secondary: "border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200", 
    destructive: "border-transparent bg-red-100 text-red-800 hover:bg-red-200",
    outline: "text-gray-700 border-gray-300",
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  return (
    <div className={combinedClasses} {...props}>
      {children}
    </div>
  )
}

export { Badge }
