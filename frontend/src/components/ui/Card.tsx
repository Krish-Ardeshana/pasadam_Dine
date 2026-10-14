import React from 'react';
import { clsx } from 'clsx';
import { X } from 'lucide-react';

// ============================================================================
// CARD
// ============================================================================
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'white' | 'almond' | 'bordered';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'white',
  className,
  ...props
}) => {
  const variantStyles = {
    white: 'bg-[#FAF8F5] border border-[#E0DACF] shadow-xs hover:shadow-sm',
    almond: 'bg-[#ECE6DC] border border-[#E0DACF] shadow-xs',
    bordered: 'bg-[#FAF8F5] border-2 border-[#829582]/30 shadow-sm',
  };

  return (
    <div
      className={clsx('rounded-2xl p-6 transition-all duration-200', variantStyles[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
};

// ============================================================================
// BADGE
// ============================================================================
export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'dietary';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className,
}) => {
  const variantStyles = {
    success: 'bg-[#EAF0E9] text-[#2B522C] border border-[#BCD0BD]',
    warning: 'bg-[#FEF6E9] text-[#9A6216] border border-[#F4DCB5]',
    danger: 'bg-[#FDECEB] text-[#B83A3A] border border-[#F7CBC9]',
    info: 'bg-[#EBF2F7] text-[#255C82] border border-[#C6DCED]',
    neutral: 'bg-[#ECE6DC] text-[#5E584F] border border-[#DDD7CD]',
    dietary: 'bg-[#DE6C3A] text-white border border-[#DE6C3A] font-bold shadow-xs',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase',
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
};

// ============================================================================
// MODAL
// ============================================================================
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
}) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={clsx(
          'w-full bg-[#FAF8F5] rounded-2xl border border-[#E0DACF] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden',
          maxWidthClasses[maxWidth],
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0DACF] bg-[#ECE6DC]">
          <h2 className="text-base font-bold text-[#23201C] uppercase tracking-wider">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-[#6D675E] hover:text-[#23201C] hover:bg-[#E0DACF] p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
