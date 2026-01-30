import React, { useState } from 'react';
import { X, Trash2, Search, ChevronDown, Inbox, ChevronLeft, ChevronRight } from 'lucide-react';

interface MovementItem {
  id: string;
  sku: string;
  name: string;
  uom: string;
  unitPrice: number;
  reqQty: number;
  issuedQty: number;
  tnxQty: number;
  location: string;
  usedDept: string;
  remarks: string;
}

interface MaterialsMovementFormProps {
  selectedItems: any[];
  onCancel: () => void;
  onSubmit: (data: any) => void;
}

const MaterialsMovementForm: React.FC<MaterialsMovementFormProps> = ({ selectedItems, onCancel, onSubmit }) => {
  const [items, setItems] = useState<MovementItem[]>(
    selectedItems.map(item => ({
      id: item.id,
      sku: item.sku,
      name: item.name,
      uom: 'CYL', // Based on image
      unitPrice: 16326.185000000001, // Based on image
      reqQty: item.moQty,
      issuedQty: item.issueQty,
      tnxQty: item.moQty,
      location: '',
      usedDept: item.reqDept,
      remarks: ''
    }))
  );

  const [showLocationDropdown, setShowLocationDropdown] = useState<string | null>(null);

  const updateItem = (id: string, field: keyof MovementItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
          <h2 className="text-[15px] font-bold text-gray-800 tracking-tight">Materials Movement Form</h2>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={onCancel}
            className="px-8 py-1.5 text-[13px] font-bold text-gray-600 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={() => onSubmit({ items })}
            className="px-10 py-1.5 text-[13px] font-bold text-white bg-[#2d808e] rounded hover:bg-[#256b78] transition-all shadow-sm"
          >
            Submit
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* Main Table */}
        <div className="bg-white rounded overflow-visible">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead className="bg-[#fcfcfc]">
              <tr className="text-[11px] font-black text-gray-800 border-b border-gray-100">
                <th className="px-4 py-4 w-32 text-center">SKU</th>
                <th className="px-4 py-4 text-center">name</th>
                <th className="px-4 py-4 text-center w-24">UOM</th>
                <th className="px-4 py-4 text-center w-40">Unit Price</th>
                <th className="px-4 py-4 text-center w-20">Req. Qty</th>
                <th className="px-4 py-4 text-center w-20">Issued Qty</th>
                <th className="px-4 py-4 text-center w-20">Tnx. Qty</th>
                <th className="px-4 py-4 text-center w-48">Issue Location</th>
                <th className="px-4 py-4 text-center w-40">Used Dept.</th>
                <th className="px-4 py-4 text-center">Remarks</th>
                <th className="px-4 py-4 text-center w-20">Action</th>
              </tr>
            </thead>
            <tbody className="text-[11px] text-gray-600">
              {items.map((item) => (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors group relative">
                  <td className="px-4 py-5 text-center">{item.sku}</td>
                  <td className="px-4 py-5 font-bold uppercase text-[10px]">{item.name}</td>
                  <td className="px-4 py-5 text-center">{item.uom}</td>
                  <td className="px-4 py-5 text-center">{item.unitPrice}</td>
                  <td className="px-4 py-5 text-center">{item.reqQty}</td>
                  <td className="px-4 py-5 text-center">{item.issuedQty}</td>
                  <td className="px-4 py-5 text-center">
                    <input 
                      type="number" 
                      value={item.tnxQty}
                      onChange={(e) => updateItem(item.id, 'tnxQty', Number(e.target.value))}
                      className="w-16 px-2 py-1.5 border border-gray-200 rounded text-center outline-none focus:border-[#2d808e]"
                    />
                  </td>
                  <td className="px-4 py-5 text-center relative">
                    <div className="relative">
                      <div 
                        className="flex items-center justify-between px-3 py-1.5 border border-gray-100 rounded bg-white text-gray-400 cursor-pointer"
                        onClick={() => setShowLocationDropdown(showLocationDropdown === item.id ? null : item.id)}
                      >
                        <span>Select Location</span>
                        <Search size={12} className="text-gray-300" />
                      </div>
                      
                      {showLocationDropdown === item.id && (
                        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-100 rounded shadow-xl z-50 p-4 min-h-[120px] flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-200">
                          <div className="bg-gray-50 p-2 rounded-full mb-2">
                             <Inbox size={24} className="text-gray-300" strokeWidth={1} />
                          </div>
                          <p className="text-[10px] text-gray-400 font-medium">No data</p>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-5 text-center">
                    <div className="flex items-center justify-between px-3 py-1.5 bg-[#fcfcfc] border border-gray-50 rounded text-gray-700">
                      <span>{item.usedDept}</span>
                      <ChevronDown size={14} className="text-gray-300" />
                    </div>
                  </td>
                  <td className="px-4 py-5">
                    <input 
                      type="text" 
                      value={item.remarks}
                      onChange={(e) => updateItem(item.id, 'remarks', e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded outline-none focus:border-[#2d808e]"
                    />
                  </td>
                  <td className="px-4 py-5 text-center">
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-pink-500 hover:text-pink-700 hover:bg-pink-50 p-1.5 rounded transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Small Footer Pagination matching image */}
        <div className="flex items-center justify-end p-4 space-x-2">
          <button className="text-gray-300 hover:text-gray-500"><ChevronLeft size={16} /></button>
          <button className="w-6 h-6 flex items-center justify-center border border-[#2d808e] text-[#2d808e] text-[11px] font-bold rounded">1</button>
          <button className="text-gray-300 hover:text-gray-500"><ChevronRight size={16} /></button>
        </div>
      </div>
    </div>
  );
};

export default MaterialsMovementForm;