import React from 'react';
import { clsx } from 'clsx';
import { LucideIcon, PackageOpen } from 'lucide-react';
import { Button } from './Button';

// ============================================================================
// TABLE
// ============================================================================
export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className="w-full overflow-x-auto rounded-2xl border border-[#E8DEC9] bg-white shadow-xs">
    <table className={clsx('w-full text-left text-xs border-collapse bg-white', className)} {...props}>
      {children}
    </table>
  </div>
);

export const Thead: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  children,
  ...props
}) => (
  <thead className={clsx('bg-gradient-to-r from-[#FEF3C7] to-[#FAF7F2] border-b border-[#E8DEC9] text-[#7A0C1E] uppercase text-[11px] font-black tracking-wider', className)} {...props}>
    {children}
  </thead>
);

export const Th: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  children,
  ...props
}) => (
  <th className={clsx('px-4 py-3 font-black text-[#7A0C1E]', className)} {...props}>
    {children}
  </th>
);

export const Td: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  children,
  ...props
}) => (
  <td className={clsx('px-4 py-3 border-b border-[#FAF7F2] text-[#1C120C] text-xs', className)} {...props}>
    {children}
  </td>
);

// ============================================================================
// SKELETON
// ============================================================================
export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={clsx('animate-pulse bg-[#FEF3C7]/50 rounded-xl', className)}
    {...props}
  />
);

// ============================================================================
// EMPTY STATE
// ============================================================================
interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = PackageOpen,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={clsx(
        'w-full py-12 px-6 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-dashed border-[#E8DEC9]',
        className,
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center mb-3 text-[#7A0C1E]">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xs font-black text-[#7A0C1E] uppercase tracking-wider mb-1 font-luxury">
        {title}
      </h3>
      <p className="text-xs text-[#6B5B4E] max-w-sm mb-4">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
