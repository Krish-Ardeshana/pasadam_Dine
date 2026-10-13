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
    // Chocolate Cosmos primary action with crisp white text
    primary:
      'bg-[#5E0B15] text-white border-[#5E0B15] hover:bg-[#480810] active:bg-[#34040A] shadow-sm hover:shadow',
    // Cordovan secondary action
    secondary:
      'bg-[#90323D] text-white border-[#90323D] hover:bg-[#782732] active:bg-[#5E0B15] shadow-sm hover:shadow',
    outline:
      'bg-white text-[#5E0B15] border-[#E8E2D9] hover:bg-[#FAF7F2] hover:border-[#90323D] active:bg-[#EDE1CF]',
    ghost:
      'bg-transparent text-[#5E0B15] border-transparent hover:bg-[#FAF7F2] active:bg-[#EDE1CF] shadow-none',
    danger:
      'bg-[#90323D] text-white border-[#90323D] hover:bg-[#5E0B15] shadow-sm',
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
