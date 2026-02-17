
import React, { useState, useEffect } from 'react';
import { X, Trash2, Search, ChevronDown, Inbox, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface MovementItem {
  id: string;
  moId?: string; // Added to track parent Move Order
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
  const [allLocations, setAllLocations] = useState<string[]>([]);
  const [items, setItems] = useState<MovementItem[]>(
    selectedItems.map(item => {
      // item.id is formatted as moId_itemIdx in Issue.tsx
      const moId = item.fullMo?.id;
      return {
        id: item.id,
        moId: moId,
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
      };
    })
  );

  useEffect(() => {
    const fetchMasterData = async () => {
      // 1. Fetch initial locations for items
      const skus = Array.from(new Set(items.map(i => i.sku)));
      if (skus.length > 0) {
        try {
          const { data: itemData } = await supabase
            .from('items')
            .select('sku, location')
            .in('sku', skus);

          if (itemData) {
            const locationMap = itemData.reduce((acc: any, item: any) => {
              acc[item.sku] = item.location;
              return acc;
            }, {});

            setItems(prev => prev.map(item => ({
              ...item,
              location: item.location || locationMap[item.sku] || ''
            })));
          }
        } catch (err) {
          console.error("Error fetching master locations:", err);
        }
      }

      // 2. Fetch all unique locations for auto-suggestion
      try {
        const { data: locData } = await supabase
          .from('items')
          .select('location')
          .not('location', 'is', null);
        
        if (locData) {
          const uniqueLocs = Array.from(new Set(locData.map(l => l.location).filter(Boolean)));
          setAllLocations(uniqueLocs);
        }
      } catch (err) {
        console.error("Error fetching unique locations:", err);
      }
    };

    fetchMasterData();
  }, []);

  const updateItem = (id: string, field: keyof MovementItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleFinalSubmit = async () => {
    if (items.some(i => !i.location)) {
      alert("Please ensure all items have an Issue Location assigned.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Reduce stock for each item in DB
      for (const item of items) {
        const qty = item.tnxQty || 0;
        const { error } = await supabase.rpc('update_item_stock', {
          item_sku: item.sku,
          qty_change: -qty
        });
        if (error) throw error;
      }

      // 2. Complete the issue task by updating Move Order status
      const uniqueMoIds = Array.from(new Set(items.map(i => i.moId).filter(Boolean)));
      if (uniqueMoIds.length > 0) {
        const { error: statusError } = await supabase
          .from('move_orders')
          .update({ status: 'Completed' })
          .in('id', uniqueMoIds);
        
        if (statusError) throw statusError;
      }

      onSubmit({ items });
    } catch (err: any) {
      alert("Error processing issue: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <datalist id="location-suggestions">
        {allLocations.map((loc, idx) => (
          <option key={idx} value={loc} />
        ))}
      </datalist>

      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
          <h2 className="text-[15px] font-bold text-gray-800 tracking-tight uppercase">Materials Movement (MO Issue)</h2>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={onCancel} className="px-8 py-1.5 text-[13px] font-bold text-gray-600 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-all">Cancel</button>
          <button 
            onClick={handleFinalSubmit}
            disabled={isSubmitting}
            className="px-10 py-1.5 text-[13px] font-black text-white bg-[#2d808e] rounded hover:bg-[#256b78] shadow-lg shadow-cyan-900/10 transition-all flex items-center space-x-2 active:scale-[0.98]"
          >
            {isSubmitting && <Loader2 className="animate-spin" size={14} />}
            <span>Commit MO Issue</span>
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="bg-white rounded border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead className="bg-[#fafbfc]">
              <tr className="text-[11px] font-black text-gray-700 border-b border-gray-100 uppercase tracking-tight">
                <th className="px-4 py-4 w-32 text-center border-r border-gray-50">SKU</th>
                <th className="px-4 py-4 border-r border-gray-50">Name</th>
                <th className="px-4 py-4 text-center w-24 border-r border-gray-50">UOM</th>
                <th className="px-4 py-4 text-center w-24 border-r border-gray-50">Req. Qty</th>
                <th className="px-4 py-4 text-center w-28 border-r border-gray-50">Tnx. Qty *</th>
                <th className="px-4 py-4 text-center w-56 border-r border-gray-50">Issue Location</th>
                <th className="px-4 py-4 text-center w-40 border-r border-gray-50">Used Dept.</th>
                <th className="px-4 py-4 border-r border-gray-50">Remarks</th>
                <th className="px-4 py-4 text-center w-20">Action</th>
              </tr>
            </thead>
            <tbody className="text-[11px] text-gray-600 font-bold uppercase">
              {items.map((item) => (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                  <td className="px-4 py-5 text-center border-r border-gray-50">{item.sku}</td>
                  <td className="px-4 py-5 font-black uppercase text-gray-800 leading-tight border-r border-gray-50">{item.name}</td>
                  <td className="px-4 py-5 text-center border-r border-gray-50">{item.uom}</td>
                  <td className="px-4 py-5 text-center border-r border-gray-50">{item.reqQty}</td>
                  <td className="px-4 py-5 text-center border-r border-gray-50">
                    <input 
                      type="number" 
                      value={item.tnxQty}
                      onChange={(e) => updateItem(item.id, 'tnxQty', Number(e.target.value))}
                      className="w-20 px-2 py-1.5 border border-[#2d808e]/30 rounded text-center font-black text-[#2d808e] focus:border-[#2d808e] outline-none"
                    />
                  </td>
                  <td className="px-4 py-5 text-center border-r border-gray-50">
                    <div className="relative group">
                      <input 
                        type="text" 
                        list="location-suggestions"
                        value={item.location}
                        onChange={(e) => updateItem(item.id, 'location', e.target.value)}
                        placeholder="Type location..."
                        className="w-full px-3 py-1.5 border border-gray-200 rounded text-gray-800 font-black focus:border-[#2d808e] outline-none transition-all placeholder:font-medium placeholder:text-gray-300"
                      />
                      <Search size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                    </div>
                  </td>
                  <td className="px-4 py-5 text-center border-r border-gray-50">
                    <div className="flex items-center justify-between px-3 py-1.5 bg-[#fcfcfc] border border-gray-100 rounded text-gray-700">
                      <span className="truncate">{item.usedDept}</span>
                      <ChevronDown size={14} className="text-gray-300 ml-1 shrink-0" />
                    </div>
                  </td>
                  <td className="px-4 py-5 border-r border-gray-50">
                    <input 
                      type="text" 
                      value={item.remarks} 
                      onChange={(e) => updateItem(item.id, 'remarks', e.target.value)} 
                      className="w-full px-2 py-1.5 border border-gray-100 rounded text-[10px] outline-none focus:border-[#2d808e] transition-all placeholder:text-gray-200"
                      placeholder="Add notes..."
                    />
                  </td>
                  <td className="px-4 py-5 text-center">
                    <button 
                      onClick={() => removeItem(item.id)} 
                      className="text-pink-400 hover:text-pink-600 p-2 rounded hover:bg-pink-50 transition-all"
                      title="Remove Item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-between text-[10px] font-black text-gray-300 uppercase tracking-widest px-2">
           <span>* Negative stock transaction will be committed to Master SKU List</span>
           <span>Proprietary Inventory Node</span>
        </div>
      </div>
    </div>
  );
};

export default MaterialsMovementForm;
