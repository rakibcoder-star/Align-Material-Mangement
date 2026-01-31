
import React, { useState } from 'react';
import { Home, Calendar, ChevronDown, Plus, Trash2 } from 'lucide-react';

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
  const [formData, setFormData] = useState({
    documentDate: '2026-01-30',
    receiveDate: '2026-01-30',
    transactionType: '',
    sourceType: '',
    sourceRef: '',
    headerText: '',
    invoiceNo: '',
    blMushokNo: ''
  });

  const [items, setItems] = useState<GRNItem[]>([
    { id: '1', name: '', sku: '', uom: '', unitPrice: '', recQty: '', location: '', remarks: '' }
  ]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), name: '', sku: '', uom: '', unitPrice: '', recQty: '', location: '', remarks: '' }
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof GRNItem, value: string) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, items });
  };

  return (
    <div className="flex flex-col space-y-4 md:space-y-6 pb-20">
      <div className="flex items-center space-x-2 text-[10px] md:text-[11px] font-bold text-[#2d808e] uppercase tracking-wider">
        <Home size={14} className="text-gray-400" />
        <span className="text-gray-400">/</span>
        <button onClick={onBack} className="hover:underline transition-all text-gray-400">RECEIVE</button>
        <span className="text-gray-400">/</span>
        <span>NEW</span>
      </div>

      <div className="text-center">
        <h1 className="text-xl md:text-2xl font-bold text-[#2d808e] tracking-tight uppercase">Manual Goods Receive</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded shadow-sm border border-gray-100 p-4 md:p-8 space-y-6 md:space-y-8 max-w-[1400px] mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#2d808e] uppercase tracking-tight">Doc. Date</label>
            <input type="date" value={formData.documentDate} onChange={(e) => handleInputChange('documentDate', e.target.value)} className="w-full px-3 py-2 bg-white border border-[#2d808e]/30 rounded focus:border-[#2d808e] outline-none text-xs md:text-sm text-gray-600" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#2d808e] uppercase tracking-tight">Rec. Date</label>
            <input type="date" value={formData.receiveDate} onChange={(e) => handleInputChange('receiveDate', e.target.value)} className="w-full px-3 py-2 bg-white border border-[#2d808e]/30 rounded focus:border-[#2d808e] outline-none text-xs md:text-sm text-gray-600" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#2d808e] uppercase tracking-tight">Tnx Type</label>
            <select value={formData.transactionType} onChange={(e) => handleInputChange('transactionType', e.target.value)} className="w-full px-3 py-2 bg-white border border-[#2d808e]/30 rounded outline-none text-xs md:text-sm text-gray-400">
              <option value="">Select Tnx Type</option>
              <option value="Standard">Standard</option>
              <option value="Return">Return</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#2d808e] uppercase tracking-tight">Source Ref</label>
            <input type="text" placeholder="Ref No." value={formData.sourceRef} onChange={(e) => handleInputChange('sourceRef', e.target.value)} className="w-full px-3 py-2 bg-white border border-[#2d808e]/30 rounded outline-none text-xs md:text-sm placeholder-gray-300" />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[#2d808e] border-b border-gray-50 pb-2">Item Details</h3>
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <div className="inline-block min-w-full align-middle px-4 md:px-0">
              <table className="min-w-full">
                <thead>
                  <tr className="text-[10px] md:text-[11px] font-bold text-gray-700 text-left uppercase">
                    <th className="pb-3 px-1">Name</th>
                    <th className="pb-3 px-1 w-24">SKU</th>
                    <th className="pb-3 px-1 w-16">UOM</th>
                    <th className="pb-3 px-1 w-20">Price</th>
                    <th className="pb-3 px-1 w-16">Qty</th>
                    <th className="pb-3 px-1">Location</th>
                    <th className="pb-3 px-1">Remarks</th>
                    <th className="pb-3 w-8"></th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-1 px-1 min-w-[150px]"><input type="text" className="w-full px-2 py-1.5 border border-gray-100 rounded text-xs outline-none focus:border-[#2d808e]" value={item.name} onChange={(e) => updateItem(item.id, 'name', e.target.value)} /></td>
                      <td className="py-1 px-1 w-24 text-center"><input type="text" className="w-full px-2 py-1.5 border border-gray-100 rounded text-xs outline-none text-center" value={item.sku} onChange={(e) => updateItem(item.id, 'sku', e.target.value)} /></td>
                      <td className="py-1 px-1 w-16 text-center"><input type="text" className="w-full px-2 py-1.5 border border-gray-100 rounded text-xs outline-none text-center uppercase" value={item.uom} onChange={(e) => updateItem(item.id, 'uom', e.target.value)} /></td>
                      <td className="py-1 px-1 w-20 text-center"><input type="text" className="w-full px-2 py-1.5 border border-gray-100 rounded text-xs outline-none text-center" value={item.unitPrice} onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value)} /></td>
                      <td className="py-1 px-1 w-16 text-center"><input type="text" className="w-full px-2 py-1.5 border border-gray-100 rounded text-xs outline-none text-center font-bold" value={item.recQty} onChange={(e) => updateItem(item.id, 'recQty', e.target.value)} /></td>
                      <td className="py-1 px-1 min-w-[100px]"><input type="text" className="w-full px-2 py-1.5 border border-gray-100 rounded text-xs outline-none" value={item.location} onChange={(e) => updateItem(item.id, 'location', e.target.value)} /></td>
                      <td className="py-1 px-1"><input type="text" className="w-full px-2 py-1.5 border border-gray-100 rounded text-xs outline-none" value={item.remarks} onChange={(e) => updateItem(item.id, 'remarks', e.target.value)} /></td>
                      <td className="py-1 px-1 text-center"><button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button type="button" onClick={addItem} className="w-full py-2 bg-[#2d808e] text-white flex items-center justify-center space-x-2 text-xs font-bold rounded shadow-sm hover:bg-[#256b78] transition-all">
            <Plus size={14} strokeWidth={3} />
            <span>Add Item</span>
          </button>
        </div>

        <button type="submit" className="w-full py-3 bg-[#2d808e] text-white text-sm font-bold rounded shadow-lg hover:bg-[#256b78] transition-all active:scale-[0.98]">
          Process Goods Receive
        </button>
      </form>
    </div>
  );
};

export default ManualGRN;
