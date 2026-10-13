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
    white: 'bg-white border border-[#DECDB5]',
    almond: 'bg-[#F7F3EC] border border-[#D6C5A9]',
    bordered: 'bg-transparent border-2 border-[#5E0B15]',
  };

  return (
    <div
      className={clsx('p-5 transition-shadow', variantStyles[variant], className)}
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
    success: 'bg-[#EAF3EB] text-[#1E562A] border border-[#BBDCBF]',
    warning: 'bg-[#FDF7E7] text-[#8C5D0D] border border-[#F6E3B4]',
    danger: 'bg-[#FCECEE] text-[#90323D] border border-[#F2C0C6]',
    info: 'bg-[#EBF2F7] text-[#1D5477] border border-[#BED7E9]',
    neutral: 'bg-[#EDE1CF] text-[#594B42] border border-[#DECDB5]',
    dietary: 'bg-[#5E0B15] text-[#EDE1CF] border border-[#5E0B15] font-semibold',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 text-xs font-medium tracking-wide uppercase',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className={clsx(
          'w-full bg-white border-2 border-[#5E0B15] shadow-2xl flex flex-col max-h-[90vh]',
          maxWidthClasses[maxWidth],
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DECDB5] bg-[#EDE1CF]">
          <h2 className="text-base font-bold text-[#5E0B15] uppercase tracking-wider">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-[#594B42] hover:text-[#5E0B15] p-1 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
