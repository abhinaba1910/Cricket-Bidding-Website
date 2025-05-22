import React, { forwardRef } from 'react';

const Textarea = forwardRef(({ id, className = '', ...props }, ref) => {
  return (
    <textarea
      id={id}
      ref={ref}
      className={[
        'w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
        className
      ].join(' ')}
      {...props}
    />
  );
});

export default Textarea;
