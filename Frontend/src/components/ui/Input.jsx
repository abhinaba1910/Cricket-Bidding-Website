import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  fullWidth = true,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
  
  const baseInputClasses = 'rounded-lg border focus:outline-none focus:ring-2 focus:border-transparent py-2 text-gray-900 placeholder:text-gray-500';
  const stateClasses = error
    ? 'border-error-300 focus:ring-error-500'
    : 'border-gray-300 focus:ring-primary-500';
  
  const widthClass = fullWidth ? 'w-full' : '';
  const paddingClasses = leftIcon && rightIcon
    ? 'pl-10 pr-10'
    : leftIcon
    ? 'pl-10 pr-3'
    : rightIcon
    ? 'pl-3 pr-10'
    : 'px-3';
  
  const inputClasses = [
    baseInputClasses,
    stateClasses,
    paddingClasses,
    widthClass,
    className
  ].join(' ');

  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={inputClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-sm text-error-600">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
