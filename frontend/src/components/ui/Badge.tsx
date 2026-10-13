import React from 'react';
import { clsx } from 'clsx';

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

export default Badge;
