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
    'inline-flex items-center justify-center font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none border text-xs rounded-xl shadow-xs';

  const sizeClasses = {
    sm: 'px-3.5 py-1.5 text-[11px] rounded-lg',
    md: 'px-4 py-2 text-xs rounded-xl',
    lg: 'px-6 py-2.5 text-sm rounded-xl',
  };

  const variantClasses = {
    // Glossy Maroon primary action button
    primary:
      'bg-gradient-to-r from-[#8B1226] to-[#680514] text-white border-[#7A0C1E] hover:from-[#9C162D] hover:to-[#7A0C1E] active:from-[#5E0513] active:to-[#45020B] shadow-sm hover:shadow-md hover:shadow-[#7A0C1E]/20',
    // Golden Yellow secondary action button
    secondary:
      'bg-gradient-to-r from-[#FBBF24] to-[#E69500] text-[#5E0513] border-[#F59E0B] hover:from-[#F59E0B] hover:to-[#D97706] hover:text-white active:from-[#D97706] active:to-[#B45309] shadow-sm hover:shadow-md hover:shadow-[#F59E0B]/20',
    // Milky White outline button
    outline:
      'bg-white text-[#7A0C1E] border-[#E8DEC9] hover:bg-[#FEF3C7] hover:border-[#F59E0B] hover:text-[#5E0513] active:bg-[#FDE68A]',
    ghost:
      'bg-transparent text-[#7A0C1E] border-transparent hover:bg-[#FEF3C7] active:bg-[#FDE68A]',
    danger:
      'bg-[#7A0C1E] text-white border-[#7A0C1E] hover:bg-[#5E0513] active:bg-[#45020B] shadow-sm',
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
      {isLoading && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin shrink-0" />}
      {children}
    </button>
  );
};
