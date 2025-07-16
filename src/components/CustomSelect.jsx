import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

function CustomSelect({ 
  value, 
  onChange, 
  options, 
  placeholder = "Seleziona...", 
  className = "",
  disabled = false,
  required = false 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(
    options.find(opt => opt.value === value) || null
  );
  const dropdownRef = useRef(null);

  useEffect(() => {
    setSelectedOption(options.find(opt => opt.value === value) || null);
  }, [value, options]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    setSelectedOption(option);
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:border-gray-300 dark:hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 flex items-center ${className.includes('h-12') ? 'h-12' : ''} ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } ${required && !selectedOption ? 'border-red-300 dark:border-red-600' : ''}`}
        disabled={disabled}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 h-full">
            {selectedOption ? (
              <>
                {selectedOption.icon && <span className="text-lg">{selectedOption.icon}</span>}
                <span className="text-gray-900 dark:text-gray-100">{selectedOption.label}</span>
                {selectedOption.subtitle && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">({selectedOption.subtitle})</span>
                )}
              </>
            ) : (
              <span className="text-gray-500 dark:text-gray-400">{placeholder}</span>
            )}
          </div>
          <ChevronDown 
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
          {options.length > 0 ? (
            options.map((option, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelect(option)}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  {option.icon && <span className="text-lg">{option.icon}</span>}
                  <span className="text-gray-900 dark:text-gray-100">{option.label}</span>
                  {option.subtitle && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">({option.subtitle})</span>
                  )}
                </div>
                {selectedOption && selectedOption.value === option.value && (
                  <Check className="w-4 h-4 text-blue-600" />
                )}
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              Nessuna opzione disponibile
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CustomSelect; 