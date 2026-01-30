import React, { useState } from 'react';
import { Home, Calendar, ChevronDown, Plus, Trash2 } from 'lucide-react';

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
  const [formData, setFormData] = useState({
    documentDate: '2026-01-30',
    issueDate: '2026-01-30',
    transactionType: '',
    costCenter: '',
    reference: '',
    headerText: ''
  });

  const [items, setItems] = useState<IssueItem[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), name: '', sku: '', uom: '', avgPrice: '', location: '', issueQty: '', remarks: '' }
    ]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof IssueItem, value: string) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  return (
    <div className="flex flex-col space-y-6 min-h-screen bg-[#f1f3f4] pb-12">
      {/* Top Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-[11px] font-bold text-[#2d808e] uppercase tracking-wider">
          <Home size={14} className="text-gray-400" />
          <span className="text-gray-400">/</span>
          <button onClick={onBack} className="text-gray-400 hover:text-[#2d808e] transition-colors">ISSUE</button>
          <span className="text-gray-400">/</span>
          <span>NEW</span>
        </div>
        <button className="px-4 py-1 text-[12px] font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-all">
          Logs
        </button>
      </div>

      {/* Main Title */}
      <div className="text-center py-2">
        <h1 className="text-2xl font-bold text-[#2d808e] tracking-tight">Goods Issue</h1>
      </div>

      <div className="bg-white rounded-md shadow-sm border border-gray-100 p-8 space-y-8 max-w-[1400px] mx-auto w-full transition-all">
        {/* Row 1: Dates & Transaction Type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <label className="text-sm font-bold text-[#2d808e]">
              <span className="text-red-500 mr-1">*</span>Document Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.documentDate}
                onChange={(e) => handleInputChange('documentDate', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#2d808e]/30 rounded focus:border-[#2d808e] outline-none text-sm text-gray-500 transition-all"
              />
              <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-[#2d808e]">
              <span className="text-red-500 mr-1">*</span>Issue Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.issueDate}
                onChange={(e) => handleInputChange('issueDate', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#2d808e]/30 rounded focus:border-[#2d808e] outline-none text-sm text-gray-500 transition-all"
              />
              <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-[#2d808e]">
              <span className="text-red-500 mr-1">*</span>Transaction Type
            </label>
            <div className="relative">
              <select
                value={formData.transactionType}
                onChange={(e) => handleInputChange('transactionType', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#2d808e]/30 rounded focus:border-[#2d808e] outline-none text-sm text-[#c4dee3] appearance-none transition-all"
              >
                <option value="">Transaction Type</option>
                <option value="Issue" className="text-gray-700">Issue</option>
                <option value="Return" className="text-gray-700">Return</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Row 2: Cost Center, Reference, Header Text */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <label className="text-sm font-bold text-[#2d808e]">
              <span className="text-red-500 mr-1">*</span>Cost Center
            </label>
            <div className="relative">
              <select
                value={formData.costCenter}
                onChange={(e) => handleInputChange('costCenter', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#2d808e]/30 rounded focus:border-[#2d808e] outline-none text-sm text-[#c4dee3] appearance-none transition-all"
              >
                <option value="">Cost Center</option>
                <option value="DEPT1" className="text-gray-700">Department 1</option>
                <option value="DEPT2" className="text-gray-700">Department 2</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-[#2d808e]">Referance</label>
            <div className="relative">
              <input
                type="text"
                maxLength={50}
                placeholder="Movement Ref."
                value={formData.reference}
                onChange={(e) => handleInputChange('reference', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#2d808e]/30 rounded focus:border-[#2d808e] outline-none text-sm placeholder-[#c4dee3] transition-all"
              />
              <span className="absolute right-3 top-2 text-[10px] text-gray-400 font-bold">
                {formData.reference.length} / 50
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-[#2d808e]">Header Text</label>
            <div className="relative">
              <input
                type="text"
                maxLength={50}
                placeholder="Header Text"
                value={formData.headerText}
                onChange={(e) => handleInputChange('headerText', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#2d808e]/30 rounded focus:border-[#2d808e] outline-none text-sm placeholder-[#c4dee3] transition-all"
              />
              <span className="absolute right-3 top-2 text-[10px] text-gray-400 font-bold">
                {formData.headerText.length} / 50
              </span>
            </div>
          </div>
        </div>

        {/* Item Details Section */}
        <div className="space-y-3 pt-4">
          <h3 className="text-sm font-bold text-[#2d808e]">Item Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-[11px] font-bold text-gray-800 text-left border-b border-gray-50">
                  <th className="pb-3 px-1 w-[20%]">Name</th>
                  <th className="pb-3 px-1 w-[15%] text-center">Part/SKU</th>
                  <th className="pb-3 px-1 w-[10%] text-center">UOM</th>
                  <th className="pb-3 px-1 w-[12%] text-center">Avg.Price</th>
                  <th className="pb-3 px-1 w-[12%] text-center">Location</th>
                  <th className="pb-3 px-1 w-[10%] text-center">Issue Qty</th>
                  <th className="pb-3 px-1 w-[21%]">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((item) => (
                  <tr key={item.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="py-2 px-1">
                      <input
                        type="text"
                        placeholder="Item name..."
                        className="w-full px-2 py-1.5 border border-gray-100 rounded text-[11px] focus:border-[#2d808e] outline-none transition-all"
                        value={item.name}
                        onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                      />
                    </td>
                    <td className="py-2 px-1">
                      <input
                        type="text"
                        placeholder="..."
                        className="w-full px-2 py-1.5 border border-gray-100 rounded text-[11px] focus:border-[#2d808e] outline-none text-center"
                        value={item.sku}
                        onChange={(e) => updateItem(item.id, 'sku', e.target.value)}
                      />
                    </td>
                    <td className="py-2 px-1">
                      <input
                        type="text"
                        placeholder="..."
                        className="w-full px-2 py-1.5 border border-gray-100 rounded text-[11px] focus:border-[#2d808e] outline-none text-center"
                        value={item.uom}
                        onChange={(e) => updateItem(item.id, 'uom', e.target.value)}
                      />
                    </td>
                    <td className="py-2 px-1">
                      <input
                        type="text"
                        placeholder="0.00"
                        className="w-full px-2 py-1.5 border border-gray-100 rounded text-[11px] focus:border-[#2d808e] outline-none text-center"
                        value={item.avgPrice}
                        onChange={(e) => updateItem(item.id, 'avgPrice', e.target.value)}
                      />
                    </td>
                    <td className="py-2 px-1">
                      <input
                        type="text"
                        placeholder="..."
                        className="w-full px-2 py-1.5 border border-gray-100 rounded text-[11px] focus:border-[#2d808e] outline-none text-center"
                        value={item.location}
                        onChange={(e) => updateItem(item.id, 'location', e.target.value)}
                      />
                    </td>
                    <td className="py-2 px-1">
                      <input
                        type="text"
                        placeholder="0"
                        className="w-full px-2 py-1.5 border border-gray-100 rounded text-[11px] focus:border-[#2d808e] outline-none text-center"
                        value={item.issueQty}
                        onChange={(e) => updateItem(item.id, 'issueQty', e.target.value)}
                      />
                    </td>
                    <td className="py-2 px-1 relative">
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Note..."
                          className="flex-1 px-2 py-1.5 border border-gray-100 rounded text-[11px] focus:border-[#2d808e] outline-none"
                          value={item.remarks}
                          onChange={(e) => updateItem(item.id, 'remarks', e.target.value)}
                        />
                        <button onClick={() => removeItem(item.id)} className="text-red-300 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Item Full-width Teal Bar */}
          <button
            type="button"
            onClick={addItem}
            className="w-full py-2 bg-[#2d808e] text-white flex items-center justify-center space-x-2 text-[12px] font-bold rounded shadow-sm hover:bg-[#256b78] transition-all"
          >
            <Plus size={14} strokeWidth={3} />
            <span>Add Item</span>
          </button>
        </div>

        {/* Submit Full-width Teal Bar */}
        <div className="pt-4">
          <button
            type="button"
            onClick={() => onSubmit({ ...formData, items })}
            className="w-full py-2.5 bg-[#2d808e] text-white text-[14px] font-bold rounded shadow-lg hover:bg-[#256b78] transition-all active:scale-[0.99]"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualIssue;