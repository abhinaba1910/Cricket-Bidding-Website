import React from 'react'

function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props
}) {
  const baseClasses =
    'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2'

  const variantClasses = {
    primary:
      'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary:
      'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500',
    accent:
      'bg-accent-500 text-white hover:bg-accent-600 focus:ring-accent-400',
    outline:
      'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-gray-400',
    ghost:
      'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-400',
    link:
      'bg-transparent text-primary-600 hover:underline focus:ring-primary-500 p-0',
  }

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3',
  }

  const disabledClasses = 'opacity-60 cursor-not-allowed'
  const widthClass = fullWidth ? 'w-full' : ''

  const classes = [
    baseClasses,
    variantClasses[variant] || variantClasses.primary,
    sizeClasses[size] || sizeClasses.md,
    disabled || isLoading ? disabledClasses : '',
    widthClass,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={classes} disabled={disabled || isLoading} {...props}>
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  )
}

export default Button
