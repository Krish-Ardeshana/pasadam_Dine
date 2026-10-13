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
  <div className="w-full overflow-x-auto border border-[#DECDB5]">
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
  <thead className={clsx('bg-[#F7F3EC] border-b border-[#DECDB5] text-[#594B42] uppercase text-xs tracking-wider', className)} {...props}>
    {children}
  </thead>
);

export const Th: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  children,
  ...props
}) => (
  <th className={clsx('px-4 py-3 font-semibold text-[#5E0B15]', className)} {...props}>
    {children}
  </th>
);

export const Td: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  children,
  ...props
}) => (
  <td className={clsx('px-4 py-3 border-b border-[#F2ECE1] text-[#1C120C]', className)} {...props}>
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
    className={clsx('animate-pulse bg-[#DECDB5]/40', className)}
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
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = PackageOpen,
  title,
  description,
  actionLabel,
  onAction,
}) => (
  <div className="p-12 text-center flex flex-col items-center justify-center bg-white border border-dashed border-[#D6C5A9]">
    <div className="w-12 h-12 bg-[#EDE1CF] flex items-center justify-center text-[#5E0B15] mb-4">
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="text-base font-bold text-[#1C120C] uppercase tracking-wide mb-1">
      {title}
    </h3>
    <p className="text-sm text-[#594B42] max-w-sm mb-6">{description}</p>
    {actionLabel && onAction && (
      <Button variant="primary" onClick={onAction}>
        {actionLabel}
      </Button>
    )}
  </div>
);
