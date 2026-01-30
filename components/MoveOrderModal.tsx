import React, { useState } from 'react';
import { X, Trash2, Plus } from 'lucide-react';

interface MoveOrderItem {
  id: string;
  name: string;
  sku: string;
  uom: string;
  onHand: string;
  reqQty: string;
  remarks: string;
}

interface MoveOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MoveOrderModal: React.FC<MoveOrderModalProps> = ({ isOpen, onClose }) => {
  const [items, setItems] = useState<MoveOrderItem[]>([
    { id: '1', name: '', sku: '', uom: '', onHand: '', reqQty: '', remarks: '' }
  ]);
  const [refText, setRefText] = useState('');
  const [headerText, setHeaderText] = useState('');

  if (!isOpen) return null;

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), name: '', sku: '', uom: '', onHand: '', reqQty: '', remarks: '' }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof MoveOrderItem, value: string) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 px-4 bg-black/30 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-[1400px] rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
            <h2 className="text-lg font-bold text-gray-800 tracking-tight">Move Order Request</h2>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={onClose}
              className="px-6 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button 
              className="px-8 py-2 text-sm font-semibold text-white bg-[#2d808e] rounded hover:bg-[#256b78] transition-all shadow-sm"
            >
              Submit
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Top Fields - Matching Image Labels and Structure */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#2d808e]">Referance</label>
              <div className="relative">
                <input 
                  type="text" 
                  maxLength={50}
                  value={refText}
                  onChange={(e) => setRefText(e.target.value)}
                  placeholder="Movement Ref."
                  className="w-full px-3 py-2.5 bg-white border border-cyan-700/30 rounded focus:border-[#2d808e] outline-none text-sm placeholder-gray-300"
                />
                <span className="absolute right-3 top-2.5 text-[10px] text-gray-400 font-bold">{refText.length} / 50</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#2d808e]">Header Text</label>
              <div className="relative">
                <input 
                  type="text" 
                  maxLength={50}
                  value={headerText}
                  onChange={(e) => setHeaderText(e.target.value)}
                  placeholder="Header Text"
                  className="w-full px-3 py-2.5 bg-white border border-cyan-700/30 rounded focus:border-[#2d808e] outline-none text-sm placeholder-gray-300"
                />
                <span className="absolute right-3 top-2.5 text-[10px] text-gray-400 font-bold">{headerText.length} / 50</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#2d808e]">Deptartment</label>
              <div className="relative">
                <select className="w-full px-3 py-2.5 bg-white border border-cyan-700/30 rounded focus:border-[#2d808e] outline-none text-sm text-gray-400 appearance-none">
                  <option value="">Cost Center</option>
                  <option value="dept1">Department 1</option>
                  <option value="dept2">Department 2</option>
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>
          </div>

          {/* Item Details Table Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#2d808e]">Item Details</h3>
            <div className="overflow-x-auto">
              <div className="min-w-full inline-block align-middle">
                <div className="overflow-hidden">
                  <table className="min-w-full">
                    <thead>
                      <tr className="text-[11px] font-bold text-gray-800 text-left">
                        <th className="pb-2 pr-2">Name</th>
                        <th className="pb-2 px-2 w-[160px]">Part/SKU</th>
                        <th className="pb-2 px-2 w-[100px]">UOM</th>
                        <th className="pb-2 px-2 w-[120px]">On-Hand</th>
                        <th className="pb-2 px-2 w-[120px]">Req. Qty</th>
                        <th className="pb-2 px-2">Remarks</th>
                        <th className="pb-2 w-[40px]"></th>
                      </tr>
                    </thead>
                    <tbody className="space-y-2">
                      {items.map((item) => (
                        <tr key={item.id} className="group">
                          <td className="pr-2 py-1">
                            <select 
                              value={item.name}
                              onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-cyan-700/30 rounded focus:border-[#2d808e] outline-none text-xs text-gray-400"
                            >
                              <option value="">Item Name</option>
                              <option value="item1">Item 1</option>
                              <option value="item2">Item 2</option>
                            </select>
                          </td>
                          <td className="px-2 py-1">
                            <input 
                              type="text" 
                              placeholder="SKU/Code"
                              value={item.sku}
                              onChange={(e) => updateItem(item.id, 'sku', e.target.value)}
                              className="w-full px-3 py-2 bg-[#f8f9fa] border border-cyan-700/30 rounded focus:border-[#2d808e] outline-none text-xs placeholder-gray-300"
                            />
                          </td>
                          <td className="px-2 py-1">
                            <input 
                              type="text" 
                              placeholder="UOM"
                              value={item.uom}
                              onChange={(e) => updateItem(item.id, 'uom', e.target.value)}
                              className="w-full px-3 py-2 bg-[#f8f9fa] border border-cyan-700/30 rounded focus:border-[#2d808e] outline-none text-xs placeholder-gray-300 text-center"
                            />
                          </td>
                          <td className="px-2 py-1">
                            <input 
                              type="text" 
                              placeholder="On-Hand"
                              value={item.onHand}
                              onChange={(e) => updateItem(item.id, 'onHand', e.target.value)}
                              className="w-full px-3 py-2 bg-[#f8f9fa] border border-cyan-700/30 rounded focus:border-[#2d808e] outline-none text-xs placeholder-gray-300 text-center"
                            />
                          </td>
                          <td className="px-2 py-1">
                            <input 
                              type="text" 
                              placeholder="Req. Qty"
                              value={item.reqQty}
                              onChange={(e) => updateItem(item.id, 'reqQty', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-cyan-700/30 rounded focus:border-[#2d808e] outline-none text-xs placeholder-gray-300 text-center"
                            />
                          </td>
                          <td className="px-2 py-1">
                            <input 
                              type="text" 
                              placeholder="Remarks"
                              value={item.remarks}
                              onChange={(e) => updateItem(item.id, 'remarks', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-cyan-700/30 rounded focus:border-[#2d808e] outline-none text-xs placeholder-gray-300"
                            />
                          </td>
                          <td className="pl-2 py-1">
                            <button 
                              onClick={() => removeItem(item.id)}
                              className="p-1.5 text-pink-500 hover:bg-pink-50 rounded transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Add Item Button Bar */}
            <button 
              onClick={addItem}
              className="w-full py-2 bg-[#2d808e] text-white flex items-center justify-center space-x-2 text-xs font-bold rounded hover:bg-[#256b78] transition-all"
            >
              <Plus size={14} strokeWidth={3} />
              <span>Add Item</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper for select arrows
// Fixed: Making className optional to resolve TS error on line 111
const ChevronDown = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export default MoveOrderModal;