
import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface MOApprovalModalProps {
  mo: any;
  isOpen: boolean;
  onClose: () => void;
}

const MOApprovalModal: React.FC<MOApprovalModalProps> = ({ mo, isOpen, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !mo) return null;

  const items = mo.items || [];
  const totalQty = items.reduce((sum: number, item: any) => sum + (Number(item.reqQty) || 0), 0);
  const totalValue = items.reduce((sum: number, item: any) => sum + ((Number(item.reqQty) || 0) * (Number(item.unitPrice) || 0)), 0);

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('move_orders')
        .update({ status: 'Approved' })
        .eq('id', mo.id);

      if (error) throw error;
      onClose();
    } catch (err: any) {
      alert("Approval failed: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHold = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('move_orders')
        .update({ status: 'On Hold' })
        .eq('id', mo.id);

      if (error) throw error;
      onClose();
    } catch (err: any) {
      alert("Status update failed: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-[1150px] rounded-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5">
          <h2 className="text-[16px] font-bold text-gray-800 tracking-tight">Move Order Approval</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>

        {/* Table Content */}
        <div className="px-6 pb-8">
          <div className="border border-gray-100 rounded-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#fafafa]">
                <tr className="text-[11px] font-black text-gray-800 uppercase tracking-tight border-b border-gray-100">
                  <th className="px-4 py-4 text-center border-r border-gray-50/50">SKU</th>
                  <th className="px-4 py-4 text-center border-r border-gray-50/50">Name</th>
                  <th className="px-4 py-4 text-center border-r border-gray-50/50">UOM</th>
                  <th className="px-4 py-4 text-center border-r border-gray-50/50">Unit Price</th>
                  <th className="px-4 py-4 text-center border-r border-gray-50/50">Req. Qty</th>
                  <th className="px-4 py-4 text-center border-r border-gray-50/50">Req. Value</th>
                  <th className="px-4 py-4 text-center border-r border-gray-50/50">On-Hand</th>
                  <th className="px-4 py-4 text-center border-r border-gray-50/50">1M Used</th>
                  <th className="px-4 py-4 text-center">6M Used</th>
                </tr>
              </thead>
              <tbody className="text-[12px] font-medium text-gray-700">
                {items.map((item: any, idx: number) => (
                  <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/20 transition-colors">
                    <td className="px-4 py-5 text-center font-medium">{item.sku}</td>
                    <td className="px-4 py-5 text-center uppercase font-bold text-gray-800">{item.name}</td>
                    <td className="px-4 py-5 text-center font-medium">{item.uom}</td>
                    <td className="px-4 py-5 text-center font-medium">{(Number(item.unitPrice) || 0).toFixed(2)}</td>
                    <td className="px-4 py-5 text-center font-medium">{item.reqQty}</td>
                    <td className="px-4 py-5 text-center font-medium">{(Number(item.reqQty || 0) * Number(item.unitPrice || 0)).toFixed(2)}</td>
                    <td className="px-4 py-5 text-center font-medium text-gray-800">{item.onHand || '0'}</td>
                    <td className="px-4 py-5 text-center font-medium text-gray-800">{item.used1m || '0'}</td>
                    <td className="px-4 py-5 text-center font-medium text-gray-800">{item.used6m || '0'}</td>
                  </tr>
                ))}
                {/* Total Row */}
                <tr className="bg-white border-t border-gray-100">
                  <td colSpan={3}></td>
                  <td className="px-4 py-5 text-center font-black text-gray-800">Total</td>
                  <td className="px-4 py-5 text-center font-black text-gray-800">{totalQty.toFixed(2)}</td>
                  <td className="px-4 py-5 text-center font-black text-gray-800">{totalValue.toFixed(2)}</td>
                  <td colSpan={3}></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 mt-10">
            <button 
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2 text-[13px] font-bold text-gray-600 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleApprove}
              disabled={isSubmitting}
              className="px-8 py-2 text-[13px] font-black text-white bg-[#2d808e] rounded shadow-sm hover:bg-[#256b78] transition-all flex items-center gap-2"
            >
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              Approved
            </button>
            <button 
              onClick={handleHold}
              disabled={isSubmitting}
              className="px-8 py-2 text-[13px] font-bold text-red-500 bg-white border border-red-400 rounded hover:bg-red-50 transition-all"
            >
              Hold
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MOApprovalModal;
