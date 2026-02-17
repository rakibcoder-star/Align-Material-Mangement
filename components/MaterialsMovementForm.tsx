import React, { useState, useEffect } from 'react';
import { X, Trash2, Search, ChevronDown, Inbox, ChevronLeft, ChevronRight, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface MovementItem {
  id: string;
  moId?: string;
  moNo?: string;
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

interface NotificationData {
  giId: string;
  moNo: string;
  itemsCount: number;
  details: string;
}

interface MaterialsMovementFormProps {
  selectedItems: any[];
  onCancel: () => void;
  onSubmit: (data: any) => void;
}

const MaterialsMovementForm: React.FC<MaterialsMovementFormProps> = ({ selectedItems, onCancel, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allLocations, setAllLocations] = useState<string[]>([]);
  const [showNotification, setShowNotification] = useState<NotificationData | null>(null);
  const [items, setItems] = useState<MovementItem[]>(
    selectedItems.map(item => {
      const moId = item.fullMo?.id;
      const moNo = item.moNo;
      return {
        id: item.id,
        moId: moId,
        moNo: moNo,
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

      try {
        const { data: locData } = await supabase
          .from('items')
          .select('location')
          .not('location', 'is', null);
        
        if (locData) {
          // Fix: Explicitly cast mapping results to string to resolve 'unknown[]' type mismatch with string[] state
          const uniqueLocs = Array.from(new Set(locData.map((l: any) => l.location as string).filter(Boolean)));
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
          qty_change: -qty,
          is_receive: false
        });
        if (error) throw error;
      }

      // 2. Complete the issue task by updating Move Order status and item locations
      const uniqueMoIds = Array.from(new Set(items.map(i => i.moId).filter(Boolean)));
      for (const moId of uniqueMoIds) {
        // Construct the new items array for the Move Order, preserving critical fields
        const moItems = items.filter(i => i.moId === moId).map(i => ({
          sku: i.sku,
          name: i.name,
          uom: i.uom,
          unitPrice: i.unitPrice, // Preserved
          reqQty: i.reqQty,       // Preserved
          issuedQty: Number(i.issuedQty || 0) + Number(i.tnxQty), // Updated
          location: i.location,
          remarks: i.remarks
        }));

        const { error: updateError } = await supabase
          .from('move_orders')
          .update({ 
            status: 'Completed',
            items: moItems, 
            updated_at: new Date().toISOString()
          })
          .eq('id', moId);
        
        if (updateError) throw updateError;
      }

      // 3. Show Success Notification starting from 500000
      const giId = (500000 + Math.floor(Math.random() * 5000)).toString();
      const firstItem = items[0];
      setShowNotification({
        giId: giId,
        moNo: firstItem.moNo || 'N/A',
        itemsCount: items.length,
        details: `Item: ${firstItem.name} | Qty: ${firstItem.tnxQty} | Loc: ${firstItem.location}`
      });

      setIsSubmitting(false);
    } catch (err: any) {
      alert("Error processing issue: " + err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen relative">
      <datalist id="location-suggestions">
        {allLocations.map((loc, idx) => (
          <option key={idx} value={loc} />
        ))}
      </datalist>

      {/* Success Notification Popup (Floating Center-Top) */}
      {showNotification && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
          <div className="w-[450px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-emerald-100 overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-emerald-500 p-6 text-center">
              <CheckCircle2 size={48} className="text-white mx-auto mb-3" strokeWidth={3} />
              <h4 className="text-xl font-black text-white uppercase tracking-tight">MO Issue Completed</h4>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Issue Number</span>
                  <span className="text-[13px] font-black text-[#2d808e]">#{showNotification.giId}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">MO Number</span>
                  <span className="text-[13px] font-black text-blue-600">#{showNotification.moNo}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block">Details</span>
                  <p className="text-[14px] font-bold text-gray-800 leading-tight bg-gray-50 p-3 rounded-lg border border-gray-100">{showNotification.details}</p>
                </div>
                <p className="text-[10px] text-center text-gray-400 font-medium">Total Items Processed: {showNotification.itemsCount}</p>
              </div>
              <button 
                onClick={() => { setShowNotification(null); onSubmit({ items }); }} 
                className="w-full py-3 bg-[#2d808e] text-white font-black text-[13px] uppercase tracking-[0.2em] rounded-xl shadow-lg hover:bg-[#256b78] transition-all active:scale-[0.98]"
              >
                Close & Proceed
              </button>
            </div>
          </div>
        </div>
      )}

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
            disabled={isSubmitting || !!showNotification}
            className="px-10 py-1.5 text-[13px] font-black text-white bg-[#2d808e] rounded hover:bg-[#256b78] shadow-lg shadow-cyan-900/10 transition-all flex items-center space-x-2 active:scale-[0.98] disabled:opacity-50"
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