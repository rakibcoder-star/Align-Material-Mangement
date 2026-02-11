import React, { useState, useEffect } from 'react';
import { Home, ChevronDown, Save, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface NewItemProps {
  onBack: () => void;
  onSuccess: () => void;
  initialData?: any;
}

const NewItem: React.FC<NewItemProps> = ({ onBack, onSuccess, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    sku: '',
    uom: '',
    location: '',
    group_name: '',
    type: '',
    last_price: '0.00',
    avg_price: '0.00',
    safety_stock: '0',
    on_hand_stock: '0'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        code: initialData.code || '',
        name: initialData.name || '',
        sku: initialData.sku || '',
        uom: initialData.uom || '',
        location: initialData.location || '',
        group_name: initialData.group_name || '',
        type: initialData.type || '',
        last_price: String(initialData.last_price || '0.00'),
        avg_price: String(initialData.avg_price || '0.00'),
        safety_stock: String(initialData.safety_stock || '0'),
        on_hand_stock: String(initialData.on_hand_stock || '0')
      });
    }
  }, [initialData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.uom || !formData.group_name || !formData.type || !formData.code) {
      alert("Please fill in all mandatory fields (*)");
      return;
    }

    setLoading(true);
    const payload = {
      ...formData,
      last_price: parseFloat(formData.last_price) || 0,
      avg_price: parseFloat(formData.avg_price) || 0,
      safety_stock: parseInt(formData.safety_stock) || 0,
      on_hand_stock: parseInt(formData.on_hand_stock) || 0
    };

    let error;
    if (initialData?.id) {
      const { error: updateError } = await supabase
        .from('items')
        .update(payload)
        .eq('id', initialData.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('items')
        .insert([payload]);
      error = insertError;
    }

    setLoading(false);

    if (error) {
      alert("Database Error: " + error.message);
    } else {
      onSuccess();
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-[10px] font-bold text-[#2d808e] uppercase tracking-wider">
          <Home size={12} className="text-gray-400" />
          <span className="text-gray-300">/</span>
          <button onClick={onBack} className="text-gray-400 hover:text-[#2d808e] transition-colors uppercase">ITEM-LIST</button>
          <span className="text-gray-300">/</span>
          <span className="text-[#2d808e]">{initialData ? 'EDIT-ITEM' : 'NEW-ITEM'}</span>
        </div>
        <button 
          onClick={onBack}
          className="flex items-center space-x-2 text-[11px] font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase"
        >
          <ArrowLeft size={14} />
          <span>Back to List</span>
        </button>
      </div>

      <div className="flex items-center space-x-3">
        <div className="w-1 h-8 bg-[#2d808e] rounded-full"></div>
        <h1 className="text-xl font-black text-gray-800 tracking-tight uppercase">
          {initialData ? 'Edit Item Details' : 'Manual Item Entry'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden transition-all">
        <div className="p-8 space-y-10">
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">Identification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-[#2d808e] uppercase tracking-tighter">
                   <span className="text-red-500 mr-1">*</span>Part Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. 100000XXXX"
                  value={formData.code}
                  disabled={!!initialData}
                  onChange={(e) => handleInputChange('code', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded focus:border-[#2d808e] outline-none text-[12px] font-medium transition-all disabled:bg-gray-50"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[11px] font-black text-[#2d808e] uppercase tracking-tighter">
                  <span className="text-red-500 mr-1">*</span>Item Name
                </label>
                <input
                  type="text"
                  placeholder="Full name of the item"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded focus:border-[#2d808e] outline-none text-[12px] font-black transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-[#2d808e] uppercase tracking-tighter">SKU / Part No.</label>
                <input
                  type="text"
                  placeholder="Manufacturer SKU"
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded focus:border-[#2d808e] outline-none text-[12px] font-medium transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">Classification & Logistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-[#2d808e] uppercase tracking-tighter">
                  <span className="text-red-500 mr-1">*</span>UOM
                </label>
                <input
                  type="text"
                  placeholder="e.g. PIECE"
                  value={formData.uom}
                  onChange={(e) => handleInputChange('uom', e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-[12px] font-bold outline-none focus:border-[#2d808e] transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-[#2d808e] uppercase tracking-tighter">
                  <span className="text-red-500 mr-1">*</span>Item Group
                </label>
                <input
                  type="text"
                  placeholder="e.g. Maintenance Item"
                  value={formData.group_name}
                  onChange={(e) => handleInputChange('group_name', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-[12px] font-bold outline-none focus:border-[#2d808e] transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-[#2d808e] uppercase tracking-tighter">
                  <span className="text-red-500 mr-1">*</span>Item Type
                </label>
                <input
                  type="text"
                  placeholder="e.g. Consumables"
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-[12px] font-bold outline-none focus:border-[#2d808e] transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-[#2d808e] uppercase tracking-tighter">Stock Location</label>
                <input
                  type="text"
                  placeholder="e.g. WH-01-A2"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded focus:border-[#2d808e] outline-none text-[12px] font-medium transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">Inventory & Valuation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-[#2d808e] uppercase tracking-tighter">On-Hand Stock</label>
                <input
                  type="number"
                  value={formData.on_hand_stock}
                  onChange={(e) => handleInputChange('on_hand_stock', e.target.value)}
                  className="w-full px-3 py-2 bg-[#fcfcfc] border border-gray-200 rounded focus:border-[#2d808e] outline-none text-[12px] font-black text-center"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-[#2d808e] uppercase tracking-tighter">Safety Stock</label>
                <input
                  type="number"
                  value={formData.safety_stock}
                  onChange={(e) => handleInputChange('safety_stock', e.target.value)}
                  className="w-full px-3 py-2 bg-orange-50/30 border border-gray-200 rounded focus:border-[#2d808e] outline-none text-[12px] font-black text-center text-orange-600"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-[#2d808e] uppercase tracking-tighter">Last Purchase Price</label>
                <input
                  type="text"
                  value={formData.last_price}
                  onChange={(e) => handleInputChange('last_price', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded focus:border-[#2d808e] outline-none text-[12px] font-bold text-right"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-[#2d808e] uppercase tracking-tighter">Avg. Price</label>
                <input
                  type="text"
                  value={formData.avg_price}
                  onChange={(e) => handleInputChange('avg_price', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded focus:border-[#2d808e] outline-none text-[12px] font-bold text-right"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#fcfcfc] border-t border-gray-100 px-8 py-6 flex justify-end items-center space-x-6">
          <button 
            type="button" 
            onClick={onBack}
            className="text-[12px] font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest transition-colors"
          >
            Discard
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-3 bg-[#2d808e] text-white px-12 py-3 rounded-lg text-[13px] font-black shadow-lg shadow-cyan-900/10 hover:bg-[#256b78] transition-all active:scale-[0.98] uppercase tracking-widest disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            <span>{initialData ? 'Update Database' : 'Commit Item Entry'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewItem;