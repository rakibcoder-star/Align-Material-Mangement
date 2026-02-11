import React, { useState } from 'react';
import { X, Trash2, Search, ChevronDown, Inbox, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<MovementItem[]>(
    selectedItems.map(item => ({
      id: item.id,
      sku: item.sku,
      name: item.name,
      uom: item.uom || 'PC',
      unitPrice: item.unitPrice || 0,
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

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      // MASTER LOGIC: Reduce stock for each item in DB
      for (const item of items) {
        const qty = item.tnxQty || 0;
        const { error } = await supabase.rpc('update_item_stock', {
          item_sku: item.sku,
          qty_change: -qty
        });
        if (error) throw error;
      }

      onSubmit({ items });
    } catch (err: any) {
      alert("Error updating Master Stock: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
          <h2 className="text-[15px] font-bold text-gray-800 tracking-tight">Materials Movement (MO Issue)</h2>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={onCancel} className="px-8 py-1.5 text-[13px] font-bold text-gray-600 bg-white border border-gray-200 rounded">Cancel</button>
          <button 
            onClick={handleFinalSubmit}
            disabled={isSubmitting}
            className="px-10 py-1.5 text-[13px] font-black text-white bg-[#2d808e] rounded hover:bg-[#256b78] shadow-sm flex items-center space-x-2"
          >
            {isSubmitting && <Loader2 className="animate-spin" size={14} />}
            <span>Commit MO Issue</span>
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="bg-white rounded overflow-visible">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead className="bg-[#fcfcfc]">
              <tr className="text-[11px] font-black text-gray-800 border-b border-gray-100 uppercase">
                <th className="px-4 py-4 w-32 text-center">SKU</th>
                <th className="px-4 py-4">name</th>
                <th className="px-4 py-4 text-center w-24">UOM</th>
                <th className="px-4 py-4 text-center w-20">Req. Qty</th>
                <th className="px-4 py-4 text-center w-20">Tnx. Qty *</th>
                <th className="px-4 py-4 text-center w-48">Issue Location</th>
                <th className="px-4 py-4 text-center w-40">Used Dept.</th>
                <th className="px-4 py-4 text-center">Remarks</th>
                <th className="px-4 py-4 text-center w-20">Action</th>
              </tr>
            </thead>
            <tbody className="text-[11px] text-gray-600">
              {items.map((item) => (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                  <td className="px-4 py-5 text-center font-bold">{item.sku}</td>
                  <td className="px-4 py-5 font-bold uppercase text-[10px]">{item.name}</td>
                  <td className="px-4 py-5 text-center">{item.uom}</td>
                  <td className="px-4 py-5 text-center">{item.reqQty}</td>
                  <td className="px-4 py-5 text-center">
                    <input 
                      type="number" 
                      value={item.tnxQty}
                      onChange={(e) => updateItem(item.id, 'tnxQty', Number(e.target.value))}
                      className="w-16 px-2 py-1.5 border border-[#2d808e]/30 rounded text-center font-black text-[#2d808e]"
                    />
                  </td>
                  <td className="px-4 py-5 text-center relative">
                    <div className="relative">
                      <div className="flex items-center justify-between px-3 py-1.5 border border-gray-100 rounded bg-white text-gray-400 cursor-pointer" onClick={() => setShowLocationDropdown(showLocationDropdown === item.id ? null : item.id)}>
                        <span>{item.location || 'Select Location'}</span>
                        <Search size={12} className="text-gray-300" />
                      </div>
                      {showLocationDropdown === item.id && (
                        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-100 rounded shadow-xl z-50 p-4 min-h-[100px] flex flex-col items-center justify-center">
                          <p className="text-[10px] text-gray-400">Loading master locations...</p>
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
                    <input type="text" value={item.remarks} onChange={(e) => updateItem(item.id, 'remarks', e.target.value)} className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs" />
                  </td>
                  <td className="px-4 py-5 text-center">
                    <button onClick={() => removeItem(item.id)} className="text-pink-500 hover:text-pink-700 p-1.5 rounded transition-colors"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MaterialsMovementForm;