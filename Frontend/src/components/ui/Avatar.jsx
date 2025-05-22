import React, { useState } from 'react'

function Avatar({ src, alt = 'Avatar', size = 'md', className = '', fallback }) {
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    setHasError(true)
  }

  const getFallbackInitials = () => {
    if (fallback) return fallback
    if (!alt || alt === 'Avatar') return '?'
    return alt
      .split(' ')
      .map(word => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }

  const sizeClasses = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl',
  }

  const baseClasses = 'inline-flex items-center justify-center rounded-full overflow-hidden'
  const classes = [baseClasses, sizeClasses[size] || sizeClasses.md, className].join(' ')

  return (
    <div className={classes}>
      {src && !hasError ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={handleError}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-primary-500 text-white font-medium">
          {getFallbackInitials()}
        </div>
      )}
    </div>
  )
}

export default Avatar
