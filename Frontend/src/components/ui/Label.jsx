import React from 'react';

export default function Label({ htmlFor, children, className = '' }) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-sm font-medium text-secondary ${className}`}
    >
      {children}
    </label>
  );
}
