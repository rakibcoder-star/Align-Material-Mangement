
import React, { useState, useRef, useEffect } from 'react';
import { Filter, X } from 'lucide-react';

interface ColumnFilterProps {
  columnName: string;
  onFilter: (value: string) => void;
  currentValue: string;
}

const ColumnFilter: React.FC<ColumnFilterProps> = ({ columnName, onFilter, currentValue }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(currentValue);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleApply = () => {
    onFilter(inputValue);
    setIsOpen(false);
  };

  const handleClear = () => {
    setInputValue('');
    onFilter('');
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block ml-1" ref={containerRef} onClick={(e) => e.stopPropagation()}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-1 rounded hover:bg-gray-100 transition-colors ${currentValue ? 'text-[#2d808e]' : 'text-gray-300'}`}
      >
        <Filter size={10} strokeWidth={3} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-100 shadow-xl rounded-lg p-3 z-[100] animate-in fade-in zoom-in duration-150">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Filter {columnName}</span>
            <button onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-gray-500">
              <X size={12} />
            </button>
          </div>
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            placeholder={`Search ${columnName}...`}
            className="w-full px-3 py-1.5 border border-gray-100 rounded text-[11px] outline-none focus:border-[#2d808e] mb-3"
            autoFocus
          />
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleApply}
              className="flex-1 py-1.5 bg-[#2d808e] text-white text-[10px] font-black uppercase rounded hover:bg-[#256b78] transition-all"
            >
              Apply
            </button>
            <button 
              onClick={handleClear}
              className="px-3 py-1.5 border border-gray-100 text-gray-400 text-[10px] font-black uppercase rounded hover:bg-gray-50 transition-all"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColumnFilter;
