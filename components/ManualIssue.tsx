import React, { useState } from 'react';
import { Home, Trash2, Loader2, Save, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface IssueItem {
  id: string;
  name: string;
  sku: string;
  uom: string;
  avgPrice: string;
  location: string;
  issueQty: string;
  remarks: string;
}

interface ManualIssueProps {
  onBack: () => void;
  onSubmit: (data: any) => void;
}

const ManualIssue: React.FC<ManualIssueProps> = ({ onBack, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingSku, setLoadingSku] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    documentDate: new Date().toISOString().split('T')[0],
    issueDate: new Date().toISOString().split('T')[0],
    transactionType: 'Issue',
    costCenter: '',
    reference: '',
    headerText: ''
  });

  const [items, setItems] = useState<IssueItem[]>([
    { id: '1', name: '', sku: '', uom: '', avgPrice: '', location: '', issueQty: '', remarks: '' }
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
        avgPrice: String(data.avg_price || '0.00'),
        location: data.location || '',
      } : item));
    }
    setLoadingSku(null);
  };

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), name: '', sku: '', uom: '', avgPrice: '', location: '', issueQty: '', remarks: '' }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof IssueItem, value: string) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.some(i => !i.sku || !i.issueQty)) {
      alert("Please ensure SKU and Issue Quantity are filled.");
      return;
    }

    setIsSubmitting(true);
    try {
      // MASTER LOGIC: Reduce stock for each item in DB (negative change)
      for (const item of items) {
        const qty = parseInt(item.issueQty) || 0;
        const { error } = await supabase.rpc('update_item_stock', {
          item_sku: item.sku,
          qty_change: -qty
        });
        if (error) throw error;
      }

      onSubmit({ ...formData, items });
    } catch (err: any) {
      alert("Error reducing Master Stock: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col space-y-6 min-h-screen bg-[#f1f3f4] pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-[11px] font-bold text-[#2d808e] uppercase tracking-wider">
          <Home size={14} className="text-gray-400" />
          <span className="text-gray-400">/</span>
          <button onClick={onBack} className="text-gray-400 hover:text-[#2d808e]">ISSUE</button>
          <span className="text-gray-400">/</span>
          <span>NEW-ISSUE</span>
        </div>
      </div>

      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#2d808e] tracking-tight uppercase">Manual Goods Issue (Stock Reduction)</h1>
      </div>

      <div className="bg-white rounded shadow-sm border border-gray-100 p-8 space-y-8 max-w-[1400px] mx-auto w-full transition-all">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <label className="text-sm font-bold text-[#2d808e]">Issue Date</label>
            <input type="date" value={formData.issueDate} onChange={(e) => setFormData({...formData, issueDate: e.target.value})} className="w-full px-3 py-2 border border-[#2d808e]/30 rounded text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-[#2d808e]">Cost Center</label>
            <select value={formData.costCenter} onChange={(e) => setFormData({...formData, costCenter: e.target.value})} className="w-full px-3 py-2 border border-[#2d808e]/30 rounded text-sm">
              <option value="">Select Center</option>
              <option value="DEPT1">Production</option>
              <option value="DEPT2">Maintenance</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-[#2d808e]">Reference</label>
            <input type="text" placeholder="MO Ref..." value={formData.reference} onChange={(e) => setFormData({...formData, reference: e.target.value})} className="w-full px-3 py-2 border border-[#2d808e]/30 rounded text-sm" />
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <h3 className="text-sm font-bold text-[#2d808e]">Item Details (SKU Lookup)</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-[11px] font-bold text-gray-800 text-left uppercase border-b border-gray-50">
                  <th className="pb-3 px-1 w-[15%]">SKU *</th>
                  <th className="pb-3 px-1">Item Name</th>
                  <th className="pb-3 px-1 w-[10%] text-center">UOM</th>
                  <th className="pb-3 px-1 w-[12%] text-center">Avg.Price</th>
                  <th className="pb-3 px-1 w-[10%] text-center">Issue Qty *</th>
                  <th className="pb-3 px-1">Remarks</th>
                  <th className="pb-3 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2 px-1">
                      <div className="relative">
                        <input type="text" placeholder="SKU..." className="w-full px-2 py-1.5 border border-[#2d808e]/30 rounded text-[11px] font-bold" value={item.sku} onChange={(e) => updateItem(item.id, 'sku', e.target.value)} onBlur={(e) => handleSkuLookup(item.id, e.target.value)} />
                        {loadingSku === item.id && <Loader2 size={12} className="absolute right-1 top-2 animate-spin text-gray-400" />}
                      </div>
                    </td>
                    <td className="py-2 px-1">
                      <input type="text" className="w-full px-2 py-1.5 border border-gray-50 bg-gray-50 rounded text-[11px] font-bold" value={item.name} readOnly />
                    </td>
                    <td className="py-2 px-1 text-center">
                      <input type="text" className="w-full px-2 py-1.5 border border-gray-50 bg-gray-50 rounded text-[11px] text-center" value={item.uom} readOnly />
                    </td>
                    <td className="py-2 px-1 text-center">
                      <input type="text" className="w-full px-2 py-1.5 border border-gray-50 bg-gray-50 rounded text-[11px] text-center" value={item.avgPrice} readOnly />
                    </td>
                    <td className="py-2 px-1">
                      <input type="number" className="w-full px-2 py-1.5 border border-red-200 rounded text-[11px] text-center font-black text-red-600" value={item.issueQty} onChange={(e) => updateItem(item.id, 'issueQty', e.target.value)} />
                    </td>
                    <td className="py-2 px-1">
                      <input type="text" className="w-full px-2 py-1.5 border border-gray-100 rounded text-[11px]" value={item.remarks} onChange={(e) => updateItem(item.id, 'remarks', e.target.value)} />
                    </td>
                    <td className="py-2 px-1 text-center">
                      <button onClick={() => removeItem(item.id)} className="text-red-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
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

        <button onClick={handleSubmit} disabled={isSubmitting} className="w-full py-3 bg-[#2d808e] text-white text-sm font-black rounded shadow-lg hover:bg-[#256b78] transition-all flex items-center justify-center space-x-3 uppercase tracking-widest disabled:opacity-50">
          {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          <span>Commit Goods Issue (Reduce Master Stock)</span>
        </button>
      </div>
    </div>
  );
};

export default ManualIssue;