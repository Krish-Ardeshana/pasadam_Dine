import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium tracking-wide transition-all duration-150 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none border text-sm rounded-lg shadow-xs';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-md',
    md: 'px-4 py-2 text-sm rounded-lg',
    lg: 'px-6 py-2.5 text-base rounded-xl',
  };

  const variantClasses = {
    // Warm Terracotta primary action (Image 1 CTA style)
    primary:
      'bg-[#DE6C3A] text-white border-[#DE6C3A] hover:bg-[#C85929] active:bg-[#B24A1E] shadow-sm hover:shadow',
    // Calming Sage Green secondary action
    secondary:
      'bg-[#829582] text-white border-[#829582] hover:bg-[#6C806C] active:bg-[#5F735F] shadow-sm hover:shadow',
    outline:
      'bg-[#FAF8F5] text-[#23201C] border-[#E0DACF] hover:bg-[#ECE6DC] hover:border-[#829582] active:bg-[#E0DACF]',
    ghost:
      'bg-transparent text-[#23201C] border-transparent hover:bg-[#ECE6DC] active:bg-[#E0DACF] shadow-none',
    danger:
      'bg-[#C24141] text-white border-[#C24141] hover:bg-[#A83232] shadow-sm',
  };

  return (
    <button
      className={clsx(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin shrink-0" />}
      {children}
    </button>
  );
};
