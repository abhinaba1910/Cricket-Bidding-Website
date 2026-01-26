import React, { useState, useRef } from 'react';
import { FiChevronDown, FiX } from 'react-icons/fi';

/**
 * Custom MultiSelect Combobox (no Chakra UI)
 */
export function MultiSelectCombobox({
  options,
  selectedValues,
  onChange,
  placeholder = 'Select options...',
  searchPlaceholder = 'Search...',
  emptyPlaceholder = 'No options found.',
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const triggerRef = useRef();

  const handleSelect = (value) => {
    const next = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onChange(next);
  };

  const filtered = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`relative ${className}`} ref={triggerRef}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full border rounded px-3 py-2 flex items-center justify-between bg-white shadow-sm hover:border-gray-400"
      >
        {selectedValues.length ? (
          <div className="flex flex-wrap gap-1">
            {options
              .filter((opt) => selectedValues.includes(opt.value))
              .map((opt) => (
                <div
                  key={opt.value}
                  className="flex items-center bg-teal-100 text-teal-800 rounded-full px-2 py-1 text-sm"
                >
                  {opt.icon && <span className="mr-1">{opt.icon}</span>}
                  {opt.label}
                  <FiX
                    className="ml-1 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(opt.value);
                    }}
                  />
                </div>
              ))}
          </div>
        ) : (
          <span className="text-gray-500">{placeholder}</span>
        )}
        <FiChevronDown className="ml-2" />
      </button>

      {open && (
        <div
          className="absolute z-10 mt-2 w-full bg-white border rounded shadow-lg p-3"
          style={{ maxHeight: '300px', overflowY: 'auto' }}
        >
          <input
            type="text"
            className="w-full mb-2 px-2 py-1 border rounded"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {filtered.length ? (
            <div className="space-y-2">
              {filtered.map((opt) => (
                <label key={opt.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(opt.value)}
                    onChange={() => handleSelect(opt.value)}
                  />
                  {opt.icon && <span>{opt.icon}</span>}
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">{emptyPlaceholder}</div>
          )}
        </div>
      )}
    </div>
  );
}
