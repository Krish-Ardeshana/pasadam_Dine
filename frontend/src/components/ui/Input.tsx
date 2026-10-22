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
          <label htmlFor={inputId} className="text-xs font-bold tracking-wider uppercase text-[#594B42]">
            {label}
            {props.required && <span className="text-[#90323D] ml-1">*</span>}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={clsx(
            'w-full px-3.5 py-2 bg-white rounded-none border text-xs text-[#1C120C] placeholder-[#9C8B7E] shadow-none transition-colors',
            'focus:outline-none focus:ring-1 focus:ring-[#90323D] focus:border-[#90323D]',
            error ? 'border-[#90323D]' : 'border-[#DCD5C9] hover:border-[#90323D]',
            props.disabled && 'bg-[#FAF7F2] opacity-60 cursor-not-allowed',
            className,
          )}
          {...props}
        />
        {error && <span className="text-xs text-[#90323D] font-bold">{error}</span>}
        {!error && helperText && <span className="text-xs text-[#594B42]">{helperText}</span>}
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
          <label htmlFor={selectId} className="text-xs font-bold tracking-wider uppercase text-[#594B42]">
            {label}
            {props.required && <span className="text-[#90323D] ml-1">*</span>}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={clsx(
            'w-full px-3.5 py-2 bg-white rounded-none border text-xs text-[#1C120C] shadow-none transition-colors cursor-pointer',
            'focus:outline-none focus:ring-1 focus:ring-[#90323D] focus:border-[#90323D]',
            error ? 'border-[#90323D]' : 'border-[#DCD5C9] hover:border-[#90323D]',
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
        {error && <span className="text-xs text-[#90323D] font-bold">{error}</span>}
      </div>
    );
  },
);

Select.displayName = 'Select';
