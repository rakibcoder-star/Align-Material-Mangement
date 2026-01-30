import React, { useState } from 'react';
import { Home, ChevronDown } from 'lucide-react';

interface NewItemProps {
  onBack: () => void;
  onSubmit: (item: any) => void;
}

const NewItem: React.FC<NewItemProps> = ({ onBack, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    uom: '',
    group: '',
    type: '',
    lowStock: '100',
    shelfLife: false,
    serialized: false
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* Breadcrumbs & Bulk Add */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-[10px] font-bold text-[#2d808e] uppercase tracking-wider">
          <Home size={12} className="text-gray-400" />
          <span className="text-gray-300">/</span>
          <button onClick={onBack} className="text-gray-400 hover:text-[#2d808e]">ITEM-LIST</button>
          <span className="text-gray-300">/</span>
          <span className="text-[#2d808e]">NEW</span>
        </div>
        <button className="bg-gray-100 text-gray-400 border border-gray-200 px-6 py-1.5 rounded text-[12px] font-bold cursor-not-allowed">
          Bulk Add
        </button>
      </div>

      <h1 className="text-xl font-bold text-[#2d808e] tracking-tight">Add New Item</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded shadow-sm border border-gray-100 p-8 space-y-8">
        {/* Row 1: Name & Description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-[#2d808e] flex items-center">
              <span className="text-red-500 mr-1 text-lg">*</span>Item Name
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={50}
                placeholder="Item Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#2d808e]/30 rounded focus:border-[#2d808e] outline-none text-sm placeholder-gray-300 transition-all"
              />
              <span className="absolute right-3 top-2.5 text-[10px] text-gray-400 font-bold">
                {formData.name.length} / 50
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-bold text-[#2d808e]">
              Item Discription
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={50}
                placeholder="Discription/Specification"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#2d808e]/30 rounded focus:border-[#2d808e] outline-none text-sm placeholder-gray-300 transition-all"
              />
              <span className="absolute right-3 top-2.5 text-[10px] text-gray-400 font-bold">
                {formData.description.length} / 50
              </span>
            </div>
          </div>
        </div>

        {/* Row 2: SKU, UOM, Group */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-[#2d808e]">SKU</label>
            <input
              type="text"
              placeholder="Item SKU/Part Code"
              value={formData.sku}
              onChange={(e) => handleInputChange('sku', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#2d808e]/30 rounded focus:border-[#2d808e] outline-none text-sm placeholder-gray-300 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-bold text-[#2d808e]">
              <span className="text-red-500 mr-1 text-lg">*</span>UOM
            </label>
            <div className="relative">
              <select
                value={formData.uom}
                onChange={(e) => handleInputChange('uom', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#2d808e]/30 rounded text-sm text-gray-400 appearance-none outline-none focus:border-[#2d808e]"
              >
                <option value="">Select UOM</option>
                <option value="PCS">PCS</option>
                <option value="BOX">BOX</option>
                <option value="SET">SET</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-bold text-[#2d808e]">
              <span className="text-red-500 mr-1 text-lg">*</span>Group
            </label>
            <div className="relative">
              <select
                value={formData.group}
                onChange={(e) => handleInputChange('group', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#2d808e]/30 rounded text-sm text-gray-400 appearance-none outline-none focus:border-[#2d808e]"
              >
                <option value="">Select Group</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Admin">Admin</option>
                <option value="IT">IT</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Row 3: Type, Low Stock, Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-[#2d808e]">
              <span className="text-red-500 mr-1 text-lg">*</span>Type
            </label>
            <div className="relative">
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#2d808e]/30 rounded text-sm text-gray-400 appearance-none outline-none focus:border-[#2d808e]"
              >
                <option value="">Select Type</option>
                <option value="Spare Parts">Spare Parts</option>
                <option value="Consumables">Consumables</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-bold text-[#2d808e]">Low Stock</label>
            <input
              type="text"
              value={formData.lowStock}
              onChange={(e) => handleInputChange('lowStock', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#2d808e]/30 rounded focus:border-[#2d808e] outline-none text-sm text-gray-600 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-bold text-[#2d808e]">
              <span className="text-red-500 mr-1 text-lg">*</span>Shelf Life
            </label>
            <div 
              onClick={() => handleInputChange('shelfLife', !formData.shelfLife)}
              className="flex items-center cursor-pointer pt-1"
            >
              <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${formData.shelfLife ? 'bg-[#2d808e]' : 'bg-gray-300'} relative`}>
                 <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${formData.shelfLife ? 'translate-x-6' : 'translate-x-0'} flex items-center justify-center`}>
                    <span className="absolute -right-8 text-[9px] font-bold text-gray-400 uppercase">{formData.shelfLife ? 'YES' : 'NO'}</span>
                 </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-bold text-[#2d808e]">
              <span className="text-red-500 mr-1 text-lg">*</span>Serialized
            </label>
            <div 
              onClick={() => handleInputChange('serialized', !formData.serialized)}
              className="flex items-center cursor-pointer pt-1"
            >
              <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${formData.serialized ? 'bg-[#2d808e]' : 'bg-gray-300'} relative`}>
                 <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${formData.serialized ? 'translate-x-6' : 'translate-x-0'} flex items-center justify-center`}>
                    <span className="absolute -right-8 text-[9px] font-bold text-gray-400 uppercase">{formData.serialized ? 'YES' : 'NO'}</span>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full py-2.5 bg-[#2d808e] text-white text-sm font-bold rounded shadow-sm hover:bg-[#256b78] transition-all active:scale-[0.99] uppercase"
          >
            Add Item
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewItem;