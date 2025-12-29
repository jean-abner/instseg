import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "font-medium text-sm py-2.5 px-5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-electric-yellow text-black hover:bg-yellow-400 border border-transparent shadow-sm hover:shadow-md",
    secondary: "bg-dark-surface text-text-primary hover:bg-zinc-800 border border-dark-border",
    outline: "bg-transparent border border-dark-border text-text-primary hover:border-electric-yellow hover:text-electric-yellow",
    ghost: "bg-transparent text-text-secondary hover:text-text-primary hover:bg-white/5"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};