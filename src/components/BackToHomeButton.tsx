import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BackToHomeButtonProps {
  className?: string;
}

const BackToHomeButton: React.FC<BackToHomeButtonProps> = ({ className = "" }) => {
  return (
    <Link to="/" className={`inline-block ${className}`}>
      <Button 
        variant="ghost" 
        className="group flex items-center gap-2 text-gray-600 hover:text-brand-main hover:bg-brand-light/10 transition-all duration-300 font-medium rounded-xl px-4 py-2"
      >
        <ArrowRight className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <Home className="w-4 h-4 opacity-70 group-hover:opacity-100" />
        <span>العودة للرئيسية</span>
      </Button>
    </Link>
  );
};

export default BackToHomeButton;
