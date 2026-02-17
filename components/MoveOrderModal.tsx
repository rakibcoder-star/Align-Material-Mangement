
import React, { useState, useEffect } from 'react';
import { X, Trash2, Plus, ScanLine, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ScannerModal from './ScannerModal';

interface MoveOrderItem {
  id: string;
  name: string;
  sku: string;
  uom: string;
  onHand: string;
  reqQty: string;
  unitPrice: number;
  remarks: string;
}

interface MoveOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MoveOrderModal: React.FC<MoveOrderModalProps> = ({ isOpen, onClose }) => {
  const [items, setItems] = useState<MoveOrderItem[]>([
    { id: '1', name: '', sku: '', uom: '', onHand: '', reqQty: '', unitPrice: 0, remarks: '' }
  ]);
  const [refText, setRefText] = useState('');
  const [headerText, setHeaderText] = useState('');
  const [department, setDepartment] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setItems([{ id: '1', name: '', sku: '', uom: '', onHand: '', reqQty: '', unitPrice: 0, remarks: '' }]);
      setRefText('');
      setHeaderText('');
      setDepartment('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const addItem = (itemData?: Partial<MoveOrderItem>) => {
    setItems(prev => [
      ...prev, 
      { 
        id: Date.now().toString(), 
        name: itemData?.name || '', 
        sku: itemData?.sku || '', 
        uom: itemData?.uom || '', 
        onHand: itemData?.onHand || '', 
        reqQty: itemData?.reqQty || '', 
        unitPrice: itemData?.unitPrice || 0,
        remarks: itemData?.remarks || '' 
      }
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof MoveOrderItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSkuLookup = async (id: string, sku: string) => {
    if (!sku) return;
    setIsSearching(true);
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('sku', sku)
      .maybeSingle();

    if (data && !error) {
      setItems(prev => prev.map(item => item.id === id ? {
        ...item,
        name: data.name,
        uom: data.uom,
        unitPrice: data.avg_price || data.last_price || 0,
        onHand: String(data.on_hand_stock || '0'),
      } : item));
    }
    setIsSearching(false);
  };

  const handleSubmit = async () => {
    if (items.some(i => !i.sku || !i.reqQty)) {
      alert("Please fill in SKU and Required Quantity for all items.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Get next MO Number
      const { data: lastMO } = await supabase
        .from('move_orders')
        .select('mo_no')
        .order('mo_no', { ascending: false })
        .limit(1);

      let nextMoNo = '100001';
      if (lastMO && lastMO.length > 0) {
        nextMoNo = (parseInt(lastMO[0].mo_no) + 1).toString();
      }

      // 2. Calculate total value
      const totalValue = items.reduce((acc, i) => acc + (Number(i.reqQty) * i.unitPrice), 0);

      // 3. Insert MO
      const { error } = await supabase.from('move_orders').insert([{
        mo_no: nextMoNo,
        reference: refText,
        header_text: headerText,
        department: department,
        total_value: totalValue,
        items: items,
        status: 'Pending'
      }]);

      if (error) throw error;

      alert(`Move Order ${nextMoNo} submitted successfully.`);
      onClose();
    } catch (err: any) {
      alert("Submission failed: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScannedCode = async (code: string) => {
    setIsScannerOpen(false);
    setIsSearching(true);
    
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('sku', code)
        .maybeSingle();

      if (data && !error) {
        const firstRow = items[0];
        if (items.length === 1 && !firstRow.sku && !firstRow.name) {
          setItems([{
            id: firstRow.id,
            sku: data.sku,
            name: data.name,
            uom: data.uom,
            onHand: String(data.on_hand_stock || '0'),
            unitPrice: data.avg_price || data.last_price || 0,
            reqQty: '',
            remarks: ''
          }]);
        } else {
          addItem({
            sku: data.sku,
            name: data.name,
            uom: data.uom,
            unitPrice: data.avg_price || data.last_price || 0,
            onHand: String(data.on_hand_stock || '0')
          });
        }
      } else {
        alert(`Item with SKU "${code}" not found.`);
      }
    } catch (err) {
      console.error("Lookup error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 px-4 bg-black/30 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-[1400px] rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
            <h2 className="text-lg font-bold text-gray-800 tracking-tight">Move Order Request</h2>
            {isSearching && <Loader2 size={16} className="animate-spin text-[#2d808e]" />}
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsScannerOpen(true)}
              className="flex items-center px-6 py-2 text-sm font-black text-white bg-[#2d808e] rounded hover:bg-[#256b78] transition-all shadow-md group uppercase tracking-widest"
            >
              <ScanLine size={18} className="mr-2 group-hover:scale-110 transition-transform" />
              MO Scanner
            </button>
            <div className="h-6 w-px bg-gray-200 mx-1"></div>
            <button 
              onClick={onClose}
              className="px-6 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-2 text-sm font-semibold text-white bg-[#2d808e] rounded hover:bg-[#256b78] transition-all shadow-sm flex items-center gap-2"
            >
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              Submit
            </button>
          </div>
        </div>

        <div className="p-8 space-y-8">
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
                  className="w-full px-3 py-2.5 bg-white border border-cyan-700/30 rounded focus:border-[#2d808e] outline-none text-sm placeholder:text-gray-300"
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
                  className="w-full px-3 py-2.5 bg-white border border-cyan-700/30 rounded focus:border-[#2d808e] outline-none text-sm placeholder:text-gray-300"
                />
                <span className="absolute right-3 top-2.5 text-[10px] text-gray-400 font-bold">{headerText.length} / 50</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#2d808e]">Department</label>
              <div className="relative">
                <select 
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-cyan-700/30 rounded focus:border-[#2d808e] outline-none text-sm text-gray-700 appearance-none"
                >
                  <option value="">Cost Center</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Production">Production</option>
                  <option value="Admin">Admin</option>
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#2d808e]">Item Details</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-[11px] font-bold text-gray-800 text-left">
                    <th className="pb-2 pr-2">Name</th>
                    <th className="pb-2 px-2 w-[180px]">Part/SKU</th>
                    <th className="pb-2 px-2 w-[100px]">UOM</th>
                    <th className="pb-2 px-2 w-[120px]">On-Hand</th>
                    <th className="pb-2 px-2 w-[120px]">Req. Qty</th>
                    <th className="pb-2 px-2">Remarks</th>
                    <th className="pb-2 w-[40px]"></th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  {items.map((item) => (
                    <tr key={item.id} className="group border-b border-gray-50 last:border-0">
                      <td className="pr-2 py-1">
                        <input 
                          type="text" 
                          placeholder="Item Name"
                          value={item.name}
                          onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                          className="w-full px-3 py-2 bg-[#f8f9fa] border border-cyan-700/30 rounded focus:border-[#2d808e] outline-none text-xs font-bold uppercase"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input 
                          type="text" 
                          placeholder="SKU/Code"
                          value={item.sku}
                          onChange={(e) => updateItem(item.id, 'sku', e.target.value)}
                          onBlur={(e) => handleSkuLookup(item.id, e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-[#2d808e]/40 rounded focus:border-[#2d808e] outline-none text-xs font-black text-[#2d808e]"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input 
                          type="text" 
                          value={item.uom}
                          readOnly
                          className="w-full px-3 py-2 bg-[#f8f9fa] border border-transparent rounded text-xs text-gray-500 text-center"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input 
                          type="text" 
                          value={item.onHand}
                          readOnly
                          className="w-full px-3 py-2 bg-[#f8f9fa] border border-transparent rounded text-xs text-[#2d808e] font-black text-center"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input 
                          type="number" 
                          placeholder="0"
                          value={item.reqQty}
                          onChange={(e) => updateItem(item.id, 'reqQty', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-cyan-700/30 rounded focus:border-[#2d808e] outline-none text-xs font-black text-center"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input 
                          type="text" 
                          placeholder="Remarks"
                          value={item.remarks}
                          onChange={(e) => updateItem(item.id, 'remarks', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-cyan-700/30 rounded focus:border-[#2d808e] outline-none text-xs placeholder:text-gray-300"
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

            <button 
              onClick={() => addItem()}
              className="w-full py-2 bg-gray-50 border border-dashed border-[#2d808e]/30 text-[#2d808e] flex items-center justify-center space-x-2 text-[11px] font-bold rounded hover:bg-white transition-all uppercase"
            >
              <Plus size={14} strokeWidth={3} />
              <span>Add Item Row</span>
            </button>
          </div>
        </div>
      </div>

      {isScannerOpen && (
        <ScannerModal 
          onScan={handleScannedCode} 
          onClose={() => setIsScannerOpen(false)} 
        />
      )}
    </div>
  );
};

const ChevronDown = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export default MoveOrderModal;
