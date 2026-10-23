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
    white: 'bg-white border border-[#E8DEC9] shadow-xs',
    almond: 'bg-[#FAF7F2] border border-[#E8DEC9] shadow-xs',
    bordered: 'bg-white border-2 border-[#7A0C1E] shadow-sm shadow-[#7A0C1E]/10',
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
    success: 'bg-[#EBF7EE] text-[#1E562A] border border-[#C3E6CB]',
    warning: 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] font-black',
    danger: 'bg-[#FDF2F4] text-[#7A0C1E] border border-[#F8C8D0]',
    info: 'bg-[#EEF4F8] text-[#255C82] border border-[#C6DCED]',
    neutral: 'bg-[#FAF7F2] text-[#6B5B4E] border border-[#E8DEC9]',
    dietary: 'bg-[#7A0C1E] text-white border border-[#7A0C1E] font-bold shadow-xs',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className={clsx(
          'w-full bg-white rounded-2xl border-2 border-[#7A0C1E] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden',
          maxWidthClasses[maxWidth],
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8DEC9] bg-gradient-to-r from-[#FEF3C7] to-[#FAF7F2]">
          <h2 className="text-xs font-black text-[#7A0C1E] uppercase tracking-wider font-luxury">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-[#7A0C1E] hover:text-[#5E0513] hover:bg-[#FDE68A] p-1.5 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
