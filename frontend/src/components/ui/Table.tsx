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
  <div className="w-full overflow-x-auto rounded-xl border border-[#E8E2D9] shadow-xs bg-white">
    <table className={clsx('w-full text-left text-sm border-collapse bg-white', className)} {...props}>
      {children}
    </table>
  </div>
);

export const Thead: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  children,
  ...props
}) => (
  <thead className={clsx('bg-[#FAF7F2] border-b border-[#E8E2D9] text-[#594B42] uppercase text-xs tracking-wider', className)} {...props}>
    {children}
  </thead>
);

export const Th: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  children,
  ...props
}) => (
  <th className={clsx('px-4 py-3.5 font-bold text-[#5E0B15]', className)} {...props}>
    {children}
  </th>
);

export const Td: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  children,
  ...props
}) => (
  <td className={clsx('px-4 py-3.5 border-b border-[#F5EFE6] text-[#1C120C]', className)} {...props}>
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
    className={clsx('animate-pulse bg-[#EFE9DF]/70 rounded-lg', className)}
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
        'w-full py-12 px-6 flex flex-col items-center justify-center text-center bg-white rounded-xl border border-dashed border-[#DCD5C9]',
        className,
      )}
    >
      <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#E8E2D9] flex items-center justify-center mb-3">
        <Icon className="w-6 h-6 text-[#90323D]" />
      </div>
      <h3 className="text-sm font-bold text-[#5E0B15] uppercase tracking-wider mb-1">
        {title}
      </h3>
      <p className="text-xs text-[#594B42] max-w-sm mb-4">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
