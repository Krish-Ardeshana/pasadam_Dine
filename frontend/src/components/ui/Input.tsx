import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || props.name || generatedId;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-bold tracking-wider uppercase text-[#6B5B4E]">
            {label}
            {props.required && <span className="text-[#7A0C1E] ml-1">*</span>}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={clsx(
            'w-full px-3.5 py-2.5 bg-white rounded-xl border text-xs text-[#1C120C] placeholder-[#9C8B7E] shadow-xs transition-all',
            'focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#7A0C1E]',
            error ? 'border-[#7A0C1E]' : 'border-[#E8DEC9] hover:border-[#F59E0B]',
            props.disabled && 'bg-[#FAF7F2] opacity-60 cursor-not-allowed',
            className,
          )}
          {...props}
        />
        {error && <span className="text-xs text-[#7A0C1E] font-bold">{error}</span>}
        {!error && helperText && <span className="text-xs text-[#6B5B4E]">{helperText}</span>}
      </div>
    );
  },
);

Input.displayName = 'Input';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, id, ...props }, ref) => {
    const generatedId = React.useId();
    const selectId = id || props.name || generatedId;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-xs font-bold tracking-wider uppercase text-[#6B5B4E]">
            {label}
            {props.required && <span className="text-[#7A0C1E] ml-1">*</span>}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={clsx(
            'w-full px-3.5 py-2.5 bg-white rounded-xl border text-xs text-[#1C120C] shadow-xs transition-all cursor-pointer',
            'focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#7A0C1E]',
            error ? 'border-[#7A0C1E]' : 'border-[#E8DEC9] hover:border-[#F59E0B]',
            props.disabled && 'bg-[#FAF7F2] opacity-60 cursor-not-allowed',
            className,
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="text-xs text-[#7A0C1E] font-bold">{error}</span>}
      </div>
    );
  },
);

Select.displayName = 'Select';
