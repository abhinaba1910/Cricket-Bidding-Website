import React from 'react'

function Card({ className = '', children, onClick, hoverEffect = false }) {
  const baseClasses = 'bg-white rounded-xl shadow-md overflow-hidden'
  const hoverClasses = hoverEffect ? 'hover:shadow-lg transition-shadow duration-200' : ''
  const clickableClasses = onClick ? 'cursor-pointer' : ''

  const cardClasses = [baseClasses, hoverClasses, clickableClasses, className].join(' ')

  return (
    <div
      className={cardClasses}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className = '', children }) {
  return <div className={`p-5 border-b border-gray-200 ${className}`}>{children}</div>
}

export function CardContent({ className = '', children }) {
  return <div className={`p-5 ${className}`}>{children}</div>
}

export function CardFooter({ className = '', children }) {
  return <div className={`p-5 border-t border-gray-200 ${className}`}>{children}</div>
}

export default Card
