import React from 'react';
import { format } from 'date-fns';

export default function Calendar({ selected, onSelect }) {
  // Format date for <input type="date">
  const formatted = selected ? format(selected, 'yyyy-MM-dd') : '';

  return (
    <input
      type="date"
      value={formatted}
      onChange={e => onSelect(new Date(e.target.value))}
      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
    />
  );
}
