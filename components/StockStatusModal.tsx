import React from 'react';
import { X, Inbox } from 'lucide-react';

interface StockStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const StockStatusModal: React.FC<StockStatusModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-[2px]">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 tracking-tight">On-Hand Stock Status</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Section */}
        <div className="p-4 bg-white">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Name / SKU"
              className="w-full px-4 py-2.5 bg-[#f5f5f5] border border-transparent focus:border-gray-200 focus:bg-white rounded outline-none text-sm placeholder-gray-400 transition-all"
            />
          </div>
        </div>

        {/* Table Section */}
        <div className="px-4 pb-6">
          <div className="border border-gray-100 rounded-md overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white text-[13px] font-bold text-gray-800">
                  <th className="py-3 px-4 border-r border-b border-gray-100 w-1/5 text-center">SKU</th>
                  <th className="py-3 px-4 border-r border-b border-gray-100 w-1/5 text-center">Name</th>
                  <th className="py-3 px-4 border-r border-b border-gray-100 w-1/5 text-center">UOM</th>
                  <th className="py-3 px-4 border-r border-b border-gray-100 w-1/5 text-center">Location (Unit)</th>
                  <th className="py-3 px-4 border-b border-gray-100 w-1/5 text-center">Stock</th>
                </tr>
              </thead>
            </table>
            
            {/* Empty State */}
            <div className="py-20 flex flex-col items-center justify-center bg-white">
              <div className="text-gray-200 mb-3">
                <Inbox size={64} strokeWidth={1} />
              </div>
              <p className="text-sm font-medium text-gray-400">No data</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockStatusModal;