import React, { useState } from 'react';
import { Home, Plus, Trash2, Loader2, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface GRNItem {
  id: string;
  name: string;
  sku: string;
  uom: string;
  unitPrice: string;
  recQty: string;
  location: string;
  remarks: string;
}

interface ManualGRNProps {
  onBack: () => void;
  onSubmit: (data: any) => void;
}

const ManualGRN: React.FC<ManualGRNProps> = ({ onBack, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingSku, setLoadingSku] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    documentDate: new Date().toISOString().split('T')[0],
    receiveDate: new Date().toISOString().split('T')[0],
    transactionType: 'Standard',
    sourceRef: '',
    headerText: '',
  });

  const [items, setItems] = useState<GRNItem[]>([
    { id: '1', name: '', sku: '', uom: '', unitPrice: '', recQty: '', location: '', remarks: '' }
  ]);

  const handleSkuLookup = async (id: string, sku: string) => {
    if (!sku) return;
    setLoadingSku(id);
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
        unitPrice: String(data.last_price || '0.00'),
        location: data.location || '',
      } : item));
    }
    setLoadingSku(null);
  };

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), name: '', sku: '', uom: '', unitPrice: '', recQty: '', location: '', remarks: '' }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof GRNItem, value: string) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.some(i => !i.sku || !i.recQty)) {
      alert("Please ensure SKU and Quantity are filled for all items.");
      return;
    }

    setIsSubmitting(true);
    try {
      // MASTER LOGIC: Update stock for each item in DB
      for (const item of items) {
        const qty = parseInt(item.recQty) || 0;
        const { error } = await supabase.rpc('update_item_stock', {
          item_sku: item.sku,
          qty_change: qty
        });
        if (error) throw error;
      }

      onSubmit({ ...formData, items });
    } catch (err: any) {
      alert("Error updating Master Stock: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4 pb-20">
      <div className="flex items-center space-x-2 text-[11px] font-bold text-[#2d808e] uppercase tracking-wider">
        <Home size={14} className="text-gray-400" />
        <span className="text-gray-400">/</span>
        <button onClick={onBack} className="hover:underline">RECEIVE</button>
        <span className="text-gray-400">/</span>
        <span>MANUAL-GRN</span>
      </div>

      <div className="text-center">
        <h1 className="text-xl md:text-2xl font-bold text-[#2d808e] tracking-tight uppercase">Goods Receive (Stock Addition)</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded shadow-sm border border-gray-100 p-8 space-y-8 max-w-[1400px] mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#2d808e] uppercase">Doc. Date</label>
            <input type="date" value={formData.documentDate} onChange={(e) => setFormData({...formData, documentDate: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#2d808e] uppercase">Source Ref</label>
            <input type="text" placeholder="PO or Invoice Ref" value={formData.sourceRef} onChange={(e) => setFormData({...formData, sourceRef: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded text-sm" />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[#2d808e]">Item Entry (SKU Lookup)</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-[10px] font-bold text-gray-500 text-left uppercase">
                  <th className="pb-3 px-1 w-32">SKU *</th>
                  <th className="pb-3 px-1">Item Name</th>
                  <th className="pb-3 px-1 w-20 text-center">UOM</th>
                  <th className="pb-3 px-1 w-24 text-center">Unit Price</th>
                  <th className="pb-3 px-1 w-24 text-center">Rec. Qty *</th>
                  <th className="pb-3 px-1">Location</th>
                  <th className="pb-3 w-8"></th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-1 px-1">
                      <div className="relative">
                        <input type="text" className="w-full px-2 py-1.5 border border-[#2d808e]/30 rounded text-xs font-bold" value={item.sku} onChange={(e) => updateItem(item.id, 'sku', e.target.value)} onBlur={(e) => handleSkuLookup(item.id, e.target.value)} placeholder="SKU..." />
                        {loadingSku === item.id && <Loader2 size={12} className="absolute right-1 top-2 animate-spin text-gray-400" />}
                      </div>
                    </td>
                    <td className="py-1 px-1">
                      <input type="text" className="w-full px-2 py-1.5 border border-gray-100 bg-gray-50 rounded text-xs font-bold" value={item.name} readOnly />
                    </td>
                    <td className="py-1 px-1">
                      <input type="text" className="w-full px-2 py-1.5 border border-gray-100 bg-gray-50 rounded text-xs text-center" value={item.uom} readOnly />
                    </td>
                    <td className="py-1 px-1">
                      <input type="text" className="w-full px-2 py-1.5 border border-gray-100 rounded text-xs text-center" value={item.unitPrice} onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value)} />
                    </td>
                    <td className="py-1 px-1">
                      <input type="number" className="w-full px-2 py-1.5 border border-[#2d808e]/30 rounded text-xs text-center font-black text-[#2d808e]" value={item.recQty} onChange={(e) => updateItem(item.id, 'recQty', e.target.value)} />
                    </td>
                    <td className="py-1 px-1">
                      <input type="text" className="w-full px-2 py-1.5 border border-gray-100 rounded text-xs" value={item.location} onChange={(e) => updateItem(item.id, 'location', e.target.value)} />
                    </td>
                    <td className="py-1 px-1 text-center">
                      <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" onClick={addItem} className="w-full py-2 bg-gray-50 text-[#2d808e] border border-[#2d808e]/20 flex items-center justify-center space-x-2 text-xs font-bold rounded hover:bg-white transition-all">
            <Plus size={14} /> <span>Add New Item Row</span>
          </button>
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-[#2d808e] text-white text-sm font-black rounded shadow-lg hover:bg-[#256b78] transition-all flex items-center justify-center space-x-3 uppercase tracking-widest disabled:opacity-50">
          {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          <span>Commit Goods Receive to Master Stock</span>
        </button>
      </form>
    </div>
  );
};

export default ManualGRN;