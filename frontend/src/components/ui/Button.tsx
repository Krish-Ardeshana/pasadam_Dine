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
    'inline-flex items-center justify-center font-bold tracking-wider uppercase transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none border text-xs rounded-none shadow-none';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-[11px]',
    md: 'px-4 py-2 text-xs',
    lg: 'px-6 py-2.5 text-sm',
  };

  const variantClasses = {
    // 30% Cordovan primary action button
    primary:
      'bg-[#90323D] text-white border-[#90323D] hover:bg-[#7A2731] hover:border-[#7A2731] active:bg-[#641E26]',
    // 10% Chocolate Cosmos secondary action button
    secondary:
      'bg-[#5E0B15] text-white border-[#5E0B15] hover:bg-[#450810] hover:border-[#450810] active:bg-[#32040B]',
    // 60% Almond neutral outline action button
    outline:
      'bg-[#FAF8F5] text-[#1C120C] border-[#DCD5C9] hover:bg-[#EDE1CF] hover:border-[#90323D] active:bg-[#DCD5C9]',
    ghost:
      'bg-transparent text-[#1C120C] border-transparent hover:bg-[#EDE1CF] active:bg-[#DCD5C9]',
    danger:
      'bg-[#90323D] text-white border-[#90323D] hover:bg-[#7A2731]',
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
