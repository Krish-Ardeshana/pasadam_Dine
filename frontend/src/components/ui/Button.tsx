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
    'inline-flex items-center justify-center font-medium tracking-wide transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none border text-sm';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variantClasses = {
    // 10% Chocolate Cosmos primary action
    primary:
      'bg-[#5E0B15] text-[#EDE1CF] border-[#5E0B15] hover:bg-[#450810] active:bg-[#34040A]',
    // 30% Cordovan secondary action
    secondary:
      'bg-[#90323D] text-white border-[#90323D] hover:bg-[#782732] active:bg-[#5E0B15]',
    outline:
      'bg-transparent text-[#5E0B15] border-[#5E0B15] hover:bg-[#F7F3EC] active:bg-[#EDE1CF]',
    ghost:
      'bg-transparent text-[#5E0B15] border-transparent hover:bg-[#F7F3EC] active:bg-[#EDE1CF]',
    danger:
      'bg-[#90323D] text-white border-[#90323D] hover:bg-[#5E0B15]',
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
