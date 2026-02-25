
import React, { useState, useEffect } from 'react';
import { X, Loader2, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface GRNItem {
  id: string;
  poId: string;
  poNo: string;
  sku: string;
  name: string;
  uom: string;
  poQty: number;
  alreadyReceived: number;
  grnPrice: number;
  grnQty: number;
  location: string;
  remarks: string;
}

interface MakeGRNFormProps {
  selectedItems: any[];
  onClose: () => void;
  onSubmit: () => void;
}

const MakeGRNForm: React.FC<MakeGRNFormProps> = ({ selectedItems, onClose, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<GRNItem[]>([]);
  const [formData, setFormData] = useState({
    documentDate: new Date().toISOString().split('T')[0],
    receiveDate: new Date().toISOString().split('T')[0],
    headerText: '',
    invoiceNo: '',
    blMushokNo: ''
  });

  useEffect(() => {
    // Initialize items from selectedItems
    const initialItems = selectedItems.map(item => ({
      id: item.id,
      poId: item.poId,
      poNo: item.poNo,
      sku: item.sku,
      name: item.name,
      uom: item.uom || 'SET', // Default from image
      poQty: item.poQty || 0,
      alreadyReceived: 0, // Should probably fetch this if available
      grnPrice: item.unitPrice || 0,
      grnQty: item.poQty || 0, // Default to PO Qty
      location: '',
      remarks: ''
    }));
    setItems(initialItems);
  }, [selectedItems]);

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof GRNItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsSubmitting(true);
    try {
      // 1. Create GRN Record (optional, depending on schema)
      // 2. Update Item Stock
      for (const item of items) {
        const { error } = await supabase.rpc('update_item_stock', {
          item_sku: item.sku,
          qty_change: Number(item.grnQty),
          is_receive: true
        });
        if (error) throw error;
      }

      // 3. Update PO Status if needed (e.g., mark as received)
      // This is simplified. In a real app, you'd track partial receipts.

      alert("GRN Submitted Successfully!");
      onSubmit();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-[1600px] rounded-lg shadow-2xl flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-3">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
            <h2 className="text-[16px] font-bold text-gray-800">Make a Gate Receive Note(GRN)</h2>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={onClose}
              className="px-6 py-1.5 border border-gray-200 text-gray-600 text-[13px] font-medium rounded hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting || items.length === 0}
              className="px-8 py-1.5 bg-[#2d808e] text-white text-[13px] font-bold rounded hover:bg-[#256b78] transition-all flex items-center space-x-2"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              <span>Submit</span>
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Top Fields */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-gray-600"><span className="text-red-500 mr-1">*</span>Document Date</label>
              <input 
                type="date" 
                value={formData.documentDate}
                onChange={(e) => setFormData({...formData, documentDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-100 rounded text-[13px] outline-none focus:border-[#2d808e] bg-gray-50/30" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-gray-600"><span className="text-red-500 mr-1">*</span>Receive Date</label>
              <input 
                type="date" 
                value={formData.receiveDate}
                onChange={(e) => setFormData({...formData, receiveDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-100 rounded text-[13px] outline-none focus:border-[#2d808e] bg-gray-50/30" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-gray-600">Header Text</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Source Ref."
                  maxLength={50}
                  value={formData.headerText}
                  onChange={(e) => setFormData({...formData, headerText: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-100 rounded text-[13px] outline-none focus:border-[#2d808e] pr-12 bg-gray-50/30 placeholder:text-gray-300" 
                />
                <span className="absolute right-2 top-2.5 text-[10px] text-gray-300 font-medium">{formData.headerText.length} / 50</span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-gray-600">Invoice No</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Invoice Ref."
                  maxLength={50}
                  value={formData.invoiceNo}
                  onChange={(e) => setFormData({...formData, invoiceNo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-100 rounded text-[13px] outline-none focus:border-[#2d808e] pr-12 bg-gray-50/30 placeholder:text-gray-300" 
                />
                <span className="absolute right-2 top-2.5 text-[10px] text-gray-300 font-medium">{formData.invoiceNo.length} / 50</span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-gray-600">BL/MUSHOK No</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="BL/MUSHOK Ref."
                  maxLength={50}
                  value={formData.blMushokNo}
                  onChange={(e) => setFormData({...formData, blMushokNo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-100 rounded text-[13px] outline-none focus:border-[#2d808e] pr-12 bg-gray-50/30 placeholder:text-gray-300" 
                />
                <span className="absolute right-2 top-2.5 text-[10px] text-gray-300 font-medium">{formData.blMushokNo.length} / 50</span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[12px] font-bold text-gray-800 border-b border-gray-100">
                  <th className="px-4 py-4 text-center">SKU</th>
                  <th className="px-4 py-4">name</th>
                  <th className="px-4 py-4 text-center">UOM</th>
                  <th className="px-4 py-4 text-center">PO Qty</th>
                  <th className="px-4 py-4 text-center">Already Recevied</th>
                  <th className="px-4 py-4 text-center">GRN Price</th>
                  <th className="px-4 py-4 text-center">GRN Qty</th>
                  <th className="px-4 py-4">Receive Location</th>
                  <th className="px-4 py-4">GRN Remarks</th>
                  <th className="px-4 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="text-[13px]">
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                    <td className="px-4 py-5 text-center text-gray-600">{item.sku}</td>
                    <td className="px-4 py-5 text-gray-700 font-medium uppercase max-w-[350px] leading-tight">{item.name}</td>
                    <td className="px-4 py-5 text-center text-gray-600">{item.uom}</td>
                    <td className="px-4 py-5 text-center text-gray-600">{item.poQty}</td>
                    <td className="px-4 py-5 text-center text-gray-600">{item.alreadyReceived}</td>
                    <td className="px-4 py-5 text-center text-gray-600">{item.grnPrice}</td>
                    <td className="px-4 py-5 text-center">
                      <input 
                        type="number" 
                        value={item.grnQty}
                        onChange={(e) => updateItem(item.id, 'grnQty', Number(e.target.value))}
                        className="w-20 px-2 py-1 border border-gray-100 rounded text-center outline-none focus:border-[#2d808e] bg-gray-50/30"
                      />
                    </td>
                    <td className="px-4 py-5">
                      <select 
                        value={item.location}
                        onChange={(e) => updateItem(item.id, 'location', e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-100 rounded text-[12px] outline-none focus:border-[#2d808e] text-gray-300 bg-white"
                      >
                        <option value="">Select Location</option>
                        <option value="WH-01">Warehouse 01</option>
                        <option value="WH-02">Warehouse 02</option>
                      </select>
                    </td>
                    <td className="px-4 py-5">
                      <input 
                        type="text" 
                        value={item.remarks}
                        onChange={(e) => updateItem(item.id, 'remarks', e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-100 rounded text-[12px] outline-none focus:border-[#2d808e] bg-gray-50/30"
                      />
                    </td>
                    <td className="px-4 py-5 text-center">
                      <button onClick={() => removeItem(item.id)} className="text-pink-300 hover:text-pink-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MakeGRNForm;
