import React from 'react'

function Badge({ variant = 'primary', size = 'md', children, className = '' }) {
  const baseClasses = 'inline-flex items-center font-medium rounded-full'

  const variantClasses = {
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-secondary-100 text-secondary-800',
    accent: 'bg-accent-100 text-accent-800',
    success: 'bg-success-100 text-success-800',
    warning: 'bg-warning-100 text-warning-800',
    error: 'bg-error-100 text-error-800',
    outline: 'bg-transparent border border-gray-300 text-gray-700',
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1',
  }

  const classes = [
    baseClasses,
    variantClasses[variant] || variantClasses.primary,
    sizeClasses[size] || sizeClasses.md,
    className,
  ].join(' ')

  return <span className={classes}>{children}</span>
}

export default Badge
