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
    white: 'bg-white border border-[#E8E2D9] shadow-xs hover:shadow-sm',
    almond: 'bg-[#FAF7F2] border border-[#E4DDD2] shadow-xs',
    bordered: 'bg-white border-2 border-[#5E0B15]/20 shadow-sm',
  };

  return (
    <div
      className={clsx('rounded-xl p-6 transition-all duration-200', variantStyles[variant], className)}
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
    success: 'bg-[#EBF7ED] text-[#1E562A] border border-[#C3E4C8]',
    warning: 'bg-[#FEF8E8] text-[#8C5D0D] border border-[#F8E3B6]',
    danger: 'bg-[#FDF0F1] text-[#90323D] border border-[#F6C6CC]',
    info: 'bg-[#EFF6FB] text-[#1D5477] border border-[#C5DFF1]',
    neutral: 'bg-[#F3EFE8] text-[#594B42] border border-[#E2DAD0]',
    dietary: 'bg-[#5E0B15] text-white border border-[#5E0B15] font-bold shadow-xs',
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
          'w-full bg-white rounded-2xl border border-[#E8E2D9] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden',
          maxWidthClasses[maxWidth],
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E2D9] bg-[#FAF7F2]">
          <h2 className="text-base font-bold text-[#5E0B15] uppercase tracking-wider">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-[#594B42] hover:text-[#5E0B15] hover:bg-[#EFE9DF] p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
