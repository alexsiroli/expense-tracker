import { Filter } from 'lucide-react';

export default function FilterButton({ onClick, isActive = false, className = '', children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400/60 relative ${className}`}
      aria-label="Filtri"
    >
      <Filter className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      {children && <span className="font-medium text-sm text-gray-700 dark:text-gray-200">{children}</span>}
      {isActive && (
        <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full shadow" />
      )}
    </button>
  );
} 