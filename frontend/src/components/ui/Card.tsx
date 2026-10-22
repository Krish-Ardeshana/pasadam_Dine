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
    white: 'bg-white border border-[#DCD5C9] shadow-none',
    almond: 'bg-[#EDE1CF] border border-[#DCD5C9] shadow-none',
    bordered: 'bg-white border-2 border-[#90323D] shadow-none',
  };

  return (
    <div
      className={clsx('rounded-none p-6 transition-all duration-150', variantStyles[variant], className)}
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
    success: 'bg-[#EBF5EE] text-[#1E562A] border border-[#BCE1C7]',
    warning: 'bg-[#FEF7EC] text-[#9A6216] border border-[#F6DEBA]',
    danger: 'bg-[#FDF0F1] text-[#90323D] border border-[#F6C6CC]',
    info: 'bg-[#EEF4F8] text-[#255C82] border border-[#C6DCED]',
    neutral: 'bg-[#EDE1CF] text-[#594B42] border border-[#DCD5C9]',
    dietary: 'bg-[#90323D] text-white border border-[#90323D] font-bold',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 rounded-none text-[10px] font-bold tracking-wider uppercase border',
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
          'w-full bg-white rounded-none border-2 border-[#5E0B15] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden',
          maxWidthClasses[maxWidth],
        )}
      >
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#DCD5C9] bg-[#EDE1CF]">
          <h2 className="text-xs font-black text-[#5E0B15] uppercase tracking-wider">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-[#594B42] hover:text-[#5E0B15] hover:bg-[#DCD5C9] p-1 rounded-none transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
