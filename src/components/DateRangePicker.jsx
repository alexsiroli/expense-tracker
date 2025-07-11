import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

function DateRangePicker({ onDateRangeChange }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleDateChange = () => {
    if (startDate && endDate) {
      onDateRangeChange({ startDate, endDate });
    }
  };

  const setLastWeek = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
    onDateRangeChange({ startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] });
  };

  const setLastMonth = () => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 1);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
    onDateRangeChange({ startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] });
  };

  const setLastYear = () => {
    const end = new Date();
    const start = new Date();
    start.setFullYear(start.getFullYear() - 1);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
    onDateRangeChange({ startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] });
  };

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Filtro Temporale</h3>
      </div>
      
      <div className="space-y-4">
        {/* Quick Filters */}
        <div className="flex gap-2">
          <button
            onClick={setLastWeek}
            className="px-3 py-1 text-xs bg-secondary text-secondary-foreground rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/80 transition-colors"
          >
            Ultima settimana
          </button>
          <button
            onClick={setLastMonth}
            className="px-3 py-1 text-xs bg-secondary text-secondary-foreground rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/80 transition-colors"
          >
            Ultimo mese
          </button>
          <button
            onClick={setLastYear}
            className="px-3 py-1 text-xs bg-secondary text-secondary-foreground rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/80 transition-colors"
          >
            Ultimo anno
          </button>
        </div>

        {/* Custom Date Range */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Data inizio
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (endDate) handleDateChange();
              }}
              className="input text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Data fine
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                if (startDate) handleDateChange();
              }}
              className="input text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DateRangePicker; 