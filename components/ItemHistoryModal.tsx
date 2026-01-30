import React from 'react';
import { X, Clock, User, Calendar } from 'lucide-react';

interface HistoryEntry {
  updatedBy: string;
  updatedAt: string;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
}

interface ItemHistoryModalProps {
  item: any;
  onClose: () => void;
}

const ItemHistoryModal: React.FC<ItemHistoryModalProps> = ({ item, onClose }) => {
  // Mock history data
  const history: HistoryEntry[] = [
    { updatedBy: 'Sohel Rana', updatedAt: '2026-01-30 14:22', action: 'Modified Quantity', field: 'Safety Stock', oldValue: '5', newValue: 'NA' },
    { updatedBy: 'Md. Azizul Hakim', updatedAt: '2026-01-28 10:05', action: 'Update Price', field: 'Avg Price', oldValue: '0.00', newValue: '7769.18' },
    { updatedBy: 'Admin', updatedAt: '2026-01-25 09:00', action: 'Item Created' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0">
          <div className="flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 tracking-tight">Update History</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="space-y-6">
            {history.map((entry, idx) => (
              <div key={idx} className="relative pl-8 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-[-24px] before:w-[2px] before:bg-gray-100 last:before:hidden">
                <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-[#e2eff1] border-2 border-white flex items-center justify-center z-10 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-[#2d808e]"></div>
                </div>
                
                <div className="bg-gray-50/50 rounded-lg p-4 border border-gray-100 hover:border-[#2d808e]/30 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] font-bold text-[#2d808e] uppercase">{entry.action}</span>
                    <div className="flex items-center space-x-1 text-[10px] text-gray-400 font-bold">
                      <Clock size={12} />
                      <span>{entry.updatedAt}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <User size={12} className="text-gray-400" />
                      <span className="text-[11px] font-bold text-gray-700">{entry.updatedBy}</span>
                    </div>
                  </div>

                  {entry.field && (
                    <div className="mt-3 grid grid-cols-2 gap-4 text-[10px]">
                      <div className="p-2 bg-red-50 rounded border border-red-100">
                        <span className="block text-red-400 font-bold uppercase mb-1">Old Value</span>
                        <span className="text-gray-600 font-medium">{entry.oldValue}</span>
                      </div>
                      <div className="p-2 bg-green-50 rounded border border-green-100">
                        <span className="block text-green-400 font-bold uppercase mb-1">New Value</span>
                        <span className="text-gray-600 font-medium">{entry.newValue}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemHistoryModal;