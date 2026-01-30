import React, { useState } from 'react';
import { Home, Calendar, ChevronDown, Plus, Trash2, X } from 'lucide-react';

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
    <div className="flex flex-col space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-[11px] font-bold text-[#2d808e] uppercase tracking-wider">
        <Home size={14} className="text-gray-400" />
        <span className="text-gray-400">/</span>
        <button onClick={onBack} className="hover:underline transition-all text-gray-400">RECEIVE</button>
        <span className="text-gray-400">/</span>
        <span>NEW</span>
      </div>

      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#2d808e] tracking-tight">Goods Receive</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded shadow-sm border border-gray-100 p-8 space-y-8 max-w-[1400px] mx-auto w-full">
        {/* Row 1: Dates & Types */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-[#2d808e]">
              <span className="text-red-500 mr-1">*</span>Document Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.documentDate}
                onChange={(e) => handleInputChange('documentDate', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#2d808e]/40 rounded focus:border-[#2d808e] outline-none text-sm text-gray-600 transition-all"
              />
              <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-[#2d808e]">
              <span className="text-red-500 mr-1">*</span>Receive Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.receiveDate}
                onChange={(e) => handleInputChange('receiveDate', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#2d808e]/40 rounded focus:border-[#2d808e] outline-none text-sm text-gray-600 transition-all"
              />
              <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-[#2d808e]">
              <span className="text-red-500 mr-1">*</span>Transaction Type
            </label>
            <div className="relative">
              <select
                value={formData.transactionType}
                onChange={(e) => handleInputChange('transactionType', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#2d808e]/40 rounded focus:border-[#2d808e] outline-none text-sm text-gray-400 appearance-none transition-all"
              >
                <option value="">Transaction Type</option>
                <option value="Standard">Standard</option>
                <option value="Adjustment">Adjustment</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-[#2d808e]">
              <span className="text-red-500 mr-1">*</span>Source Type
            </label>
            <div className="relative">
              <select
                value={formData.sourceType}
                onChange={(e) => handleInputChange('sourceType', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#2d808e]/40 rounded focus:border-[#2d808e] outline-none text-sm text-gray-400 appearance-none transition-all"
              >
                <option value="">Source Type</option>
                <option value="Supplier">Supplier</option>
                <option value="Internal">Internal</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Row 2: References & Text */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-[#2d808e]">Source Referance</label>
            <div className="relative">
              <input
                type="text"
                maxLength={50}
                placeholder="Source Ref."
                value={formData.sourceRef}
                onChange={(e) => handleInputChange('sourceRef', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#2d808e]/40 rounded focus:border-[#2d808e] outline-none text-sm placeholder-gray-300 transition-all"
              />
              <span className="absolute right-3 top-2 text-[10px] text-gray-400 font-bold">
                {formData.sourceRef.length} / 50
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-[#2d808e]">Header Text</label>
            <div className="relative">
              <input
                type="text"
                maxLength={50}
                placeholder="Source Ref."
                value={formData.headerText}
                onChange={(e) => handleInputChange('headerText', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#2d808e]/40 rounded focus:border-[#2d808e] outline-none text-sm placeholder-gray-300 transition-all"
              />
              <span className="absolute right-3 top-2 text-[10px] text-gray-400 font-bold">
                {formData.headerText.length} / 50
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-[#2d808e]">Invoice No</label>
            <div className="relative">
              <input
                type="text"
                maxLength={50}
                placeholder="Invoice Ref."
                value={formData.invoiceNo}
                onChange={(e) => handleInputChange('invoiceNo', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#2d808e]/40 rounded focus:border-[#2d808e] outline-none text-sm placeholder-gray-300 transition-all"
              />
              <span className="absolute right-3 top-2 text-[10px] text-gray-400 font-bold">
                {formData.invoiceNo.length} / 50
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-[#2d808e]">BL/MUSHOK No</label>
            <div className="relative">
              <input
                type="text"
                maxLength={50}
                placeholder="BL/MUSHOK Ref."
                value={formData.blMushokNo}
                onChange={(e) => handleInputChange('blMushokNo', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#2d808e]/40 rounded focus:border-[#2d808e] outline-none text-sm placeholder-gray-300 transition-all"
              />
              <span className="absolute right-3 top-2 text-[10px] text-gray-400 font-bold">
                {formData.blMushokNo.length} / 50
              </span>
            </div>
          </div>
        </div>

        {/* Item Details Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[#2d808e]">Item Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-[11px] font-bold text-gray-700 text-left">
                  <th className="pb-3 px-1">Name</th>
                  <th className="pb-3 px-1">Part/SKU</th>
                  <th className="pb-3 px-1">UOM</th>
                  <th className="pb-3 px-1">Unit Price</th>
                  <th className="pb-3 px-1">Rec. Qty</th>
                  <th className="pb-3 px-1">Location</th>
                  <th className="pb-3 px-1">Remarks</th>
                  {items.length > 1 && <th className="pb-3 w-8"></th>}
                </tr>
              </thead>
              <tbody className="space-y-2">
                {items.map((item) => (
                  <tr key={item.id} className="group">
                    <td className="py-1 px-1">
                      <input
                        type="text"
                        className="w-full px-2 py-1.5 border border-gray-200 rounded text-[11px] focus:border-[#2d808e] outline-none"
                        value={item.name}
                        onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                      />
                    </td>
                    <td className="py-1 px-1">
                      <input
                        type="text"
                        className="w-full px-2 py-1.5 border border-gray-200 rounded text-[11px] focus:border-[#2d808e] outline-none"
                        value={item.sku}
                        onChange={(e) => updateItem(item.id, 'sku', e.target.value)}
                      />
                    </td>
                    <td className="py-1 px-1">
                      <input
                        type="text"
                        className="w-full px-2 py-1.5 border border-gray-200 rounded text-[11px] focus:border-[#2d808e] outline-none"
                        value={item.uom}
                        onChange={(e) => updateItem(item.id, 'uom', e.target.value)}
                      />
                    </td>
                    <td className="py-1 px-1">
                      <input
                        type="text"
                        className="w-full px-2 py-1.5 border border-gray-200 rounded text-[11px] focus:border-[#2d808e] outline-none"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value)}
                      />
                    </td>
                    <td className="py-1 px-1">
                      <input
                        type="text"
                        className="w-full px-2 py-1.5 border border-gray-200 rounded text-[11px] focus:border-[#2d808e] outline-none"
                        value={item.recQty}
                        onChange={(e) => updateItem(item.id, 'recQty', e.target.value)}
                      />
                    </td>
                    <td className="py-1 px-1">
                      <input
                        type="text"
                        className="w-full px-2 py-1.5 border border-gray-200 rounded text-[11px] focus:border-[#2d808e] outline-none"
                        value={item.location}
                        onChange={(e) => updateItem(item.id, 'location', e.target.value)}
                      />
                    </td>
                    <td className="py-1 px-1">
                      <input
                        type="text"
                        className="w-full px-2 py-1.5 border border-gray-200 rounded text-[11px] focus:border-[#2d808e] outline-none"
                        value={item.remarks}
                        onChange={(e) => updateItem(item.id, 'remarks', e.target.value)}
                      />
                    </td>
                    {items.length > 1 && (
                      <td className="py-1 px-1 text-center">
                        <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 transition-colors p-1">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={addItem}
            className="w-full py-2 bg-[#2d808e] text-white flex items-center justify-center space-x-2 text-sm font-bold rounded hover:bg-[#256b78] transition-all shadow-sm"
          >
            <Plus size={16} strokeWidth={3} />
            <span>Add Item</span>
          </button>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full py-2.5 bg-[#2d808e] text-white text-sm font-bold rounded shadow-lg hover:bg-[#256b78] transition-all active:scale-[0.98]"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManualGRN;