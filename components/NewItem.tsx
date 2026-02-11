import React, { useState } from 'react';
import { Home, ChevronDown, Save, ArrowLeft } from 'lucide-react';

interface NewItemProps {
  onBack: () => void;
  onSubmit: (item: any) => void;
}

const NewItem: React.FC<NewItemProps> = ({ onBack, onSubmit }) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    sku: '',
    uom: '',
    location: '',
    group: '',
    type: '',
    lastPrice: '0.00',
    avgPrice: '0.00',
    safetyStock: '0',
    onHand: '0',
    shelfLife: false,
    serialized: false
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.uom || !formData.group || !formData.type) {
      alert("Please fill in all mandatory fields (*)");
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-[10px] font-bold text-[#2d808e] uppercase tracking-wider">
          <Home size={12} className="text-gray-400" />
          <span className="text-gray-300">/</span>
          <button onClick={onBack} className="text-gray-400 hover:text-[#2d808e] transition-colors">ITEM-LIST</button>
          <span className="text-gray-300">/</span>
          <span className="text-[#2d808e]">NEW-ITEM</span>
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
        <h1 className="text-xl font-black text-gray-800 tracking-tight uppercase">Manual Item Entry</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden transition-all">
        <div className="p-8 space-y-10">
          {/* Identity Section */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">Identification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-[#2d808e] uppercase tracking-tighter">Part Code</label>
                <input
                  type="text"
                  placeholder="e.g. 100000XXXX"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded focus:border-[#2d808e] outline-none text-[12px] font-medium transition-all"
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

          {/* Logistics Section */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">Classification & Logistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-[#2d808e] uppercase tracking-tighter">
                  <span className="text-red-500 mr-1">*</span>UOM
                </label>
                <div className="relative">
                  <select
                    value={formData.uom}
                    onChange={(e) => handleInputChange('uom', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-[12px] font-bold text-gray-600 appearance-none outline-none focus:border-[#2d808e] transition-all"
                  >
                    <option value="">Select Unit</option>
                    <option value="PIECE">PIECE</option>
                    <option value="BOX">BOX</option>
                    <option value="SET">SET</option>
                    <option value="REAM">REAM</option>
                    <option value="KG">KG</option>
                    <option value="LTR">LTR</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-[#2d808e] uppercase tracking-tighter">
                  <span className="text-red-500 mr-1">*</span>Item Group
                </label>
                <div className="relative">
                  <select
                    value={formData.group}
                    onChange={(e) => handleInputChange('group', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-[12px] font-bold text-gray-600 appearance-none outline-none focus:border-[#2d808e] transition-all"
                  >
                    <option value="">Select Group</option>
                    <option value="Maintenance Item">Maintenance Item</option>
                    <option value="Paint Item">Paint Item</option>
                    <option value="Admin Item">Admin Item</option>
                    <option value="Civil Item">Civil Item</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-[#2d808e] uppercase tracking-tighter">
                  <span className="text-red-500 mr-1">*</span>Item Type
                </label>
                <div className="relative">
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-[12px] font-bold text-gray-600 appearance-none outline-none focus:border-[#2d808e] transition-all"
                  >
                    <option value="">Select Type</option>
                    <option value="Spare Parts">Spare Parts</option>
                    <option value="Consumables">Consumables</option>
                    <option value="Fixed Asset">Fixed Asset</option>
                    <option value="Stationary">Stationary</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                </div>
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

          {/* Inventory & Value Section */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">Inventory & Valuation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-[#2d808e] uppercase tracking-tighter">On-Hand Stock</label>
                <input
                  type="text"
                  value={formData.onHand}
                  onChange={(e) => handleInputChange('onHand', e.target.value)}
                  className="w-full px-3 py-2 bg-[#fcfcfc] border border-gray-200 rounded focus:border-[#2d808e] outline-none text-[12px] font-black text-center"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-[#2d808e] uppercase tracking-tighter">Safety Stock</label>
                <input
                  type="text"
                  value={formData.safetyStock}
                  onChange={(e) => handleInputChange('safetyStock', e.target.value)}
                  className="w-full px-3 py-2 bg-orange-50/30 border border-gray-200 rounded focus:border-[#2d808e] outline-none text-[12px] font-black text-center text-orange-600"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-[#2d808e] uppercase tracking-tighter">Last Purchase Price</label>
                <input
                  type="text"
                  value={formData.lastPrice}
                  onChange={(e) => handleInputChange('lastPrice', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded focus:border-[#2d808e] outline-none text-[12px] font-bold text-right"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-[#2d808e] uppercase tracking-tighter">Avg. Price</label>
                <input
                  type="text"
                  value={formData.avgPrice}
                  onChange={(e) => handleInputChange('avgPrice', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded focus:border-[#2d808e] outline-none text-[12px] font-bold text-right"
                />
              </div>
            </div>
          </div>

          {/* Config Section */}
          <div className="flex flex-wrap gap-10 bg-gray-50/50 p-6 rounded-lg border border-gray-100">
            <div className="flex items-center space-x-4">
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Shelf Life Control</label>
              <div 
                onClick={() => handleInputChange('shelfLife', !formData.shelfLife)}
                className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-colors duration-200 ${formData.shelfLife ? 'bg-[#2d808e]' : 'bg-gray-300'} relative`}
              >
                <div className={`w-3 h-3 bg-white rounded-full transition-transform duration-200 ${formData.shelfLife ? 'translate-x-5' : 'translate-x-0'}`}></div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Serialization Required</label>
              <div 
                onClick={() => handleInputChange('serialized', !formData.serialized)}
                className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-colors duration-200 ${formData.serialized ? 'bg-[#2d808e]' : 'bg-gray-300'} relative`}
              >
                <div className={`w-3 h-3 bg-white rounded-full transition-transform duration-200 ${formData.serialized ? 'translate-x-5' : 'translate-x-0'}`}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
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
            className="flex items-center space-x-3 bg-[#2d808e] text-white px-12 py-3 rounded-lg text-[13px] font-black shadow-lg shadow-cyan-900/10 hover:bg-[#256b78] transition-all active:scale-[0.98] uppercase tracking-widest"
          >
            <Save size={16} />
            <span>Commit Item Entry</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewItem;