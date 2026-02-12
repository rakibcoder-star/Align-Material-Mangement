import React, { useState, useEffect } from 'react';
import { Home, Filter, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PendingPRItem {
  id: string;
  prNo: string;
  sku: string;
  name: string;
  specification: string;
  reqQty: number;
  poQty: number;
  poPrice: number;
  receivedQty: number;
  reqBy: string;
  reqDept: string;
}

interface NewPurchaseOrderProps {
  onBack: () => void;
  onSubmit: (selectedItems: PendingPRItem[]) => void;
}

const NewPurchaseOrder: React.FC<NewPurchaseOrderProps> = ({ onBack, onSubmit }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pendingItems, setPendingItems] = useState<PendingPRItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchApprovedPrItems = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('requisitions')
          .select('*')
          .eq('status', 'Approved')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const flattened: PendingPRItem[] = [];
          data.forEach(pr => {
            const prItems = pr.items || [];
            prItems.forEach((item: any, idx: number) => {
              flattened.push({
                id: `${pr.id}_${idx}`,
                prNo: pr.pr_no,
                sku: item.sku || 'N/A',
                name: item.name || 'N/A',
                specification: item.specification || '',
                reqQty: Number(item.reqQty) || 0,
                poQty: Number(item.reqQty) || 0,
                poPrice: Number(item.unitPrice) || 0, // Pass unitPrice as the initial poPrice
                receivedQty: 0,
                reqBy: pr.req_by_name || 'N/A',
                reqDept: pr.reqDpt || 'N/A'
              });
            });
          });
          setPendingItems(flattened);
        }
      } catch (err: any) {
        console.error("Error fetching approved items:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedPrItems();
  }, []);

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleMakePO = () => {
    if (selectedIds.size === 0) return;
    const selectedItems = pendingItems.filter(item => selectedIds.has(item.id));
    onSubmit(selectedItems);
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center space-x-2 text-[11px] font-bold text-[#2d808e] uppercase tracking-wider">
        <Home size={14} className="text-gray-400" />
        <span className="text-gray-400">/</span>
        <button onClick={onBack} className="text-gray-400 hover:text-[#2d808e]">PURCHASE-ORDER</button>
        <span className="text-gray-400">/</span>
        <span>NEW</span>
      </div>

      <div>
        <button 
          onClick={handleMakePO}
          disabled={selectedIds.size === 0 || loading}
          className={`px-6 py-2 rounded text-[13px] font-black transition-all shadow-sm uppercase tracking-widest ${
            selectedIds.size > 0 
              ? 'bg-[#2d808e] text-white hover:bg-[#256b78] active:scale-[0.98]' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
          }`}
        >
          {loading ? 'Syncing...' : 'Make Purchase Order'}
        </button>
      </div>

      <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead className="bg-[#fafbfc]">
              <tr className="text-[11px] font-black text-gray-800 uppercase tracking-tight border-b border-gray-100">
                <th className="px-3 py-4 text-center w-12"></th>
                <th className="px-3 py-4 text-center w-32">PR No</th>
                <th className="px-3 py-4 text-center w-32">SKU</th>
                <th className="px-3 py-4 text-left">Item Name</th>
                <th className="px-3 py-4 text-center w-24">Req. Qty</th>
                <th className="px-3 py-4 text-center w-24">Unit Price</th>
                <th className="px-3 py-4 text-left w-40">Req. By</th>
                <th className="px-3 py-4 text-left w-32">Dept.</th>
              </tr>
            </thead>
            <tbody className="text-[11px] text-gray-600 font-bold">
              {loading ? (
                <tr><td colSpan={8} className="py-20 text-center uppercase tracking-widest text-gray-400">Loading approved requisitions...</td></tr>
              ) : pendingItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors border-b border-gray-50">
                  <td className="px-3 py-4 text-center">
                    <input type="checkbox" checked={selectedIds.has(item.id)} onChange={() => toggleSelect(item.id)} className="w-4 h-4 rounded" />
                  </td>
                  <td className="px-3 py-4 text-center font-bold text-gray-700">{item.prNo}</td>
                  <td className="px-3 py-4 text-center text-gray-400">{item.sku}</td>
                  <td className="px-3 py-4 uppercase font-black text-gray-800">{item.name}</td>
                  <td className="px-3 py-4 text-center">{item.reqQty}</td>
                  <td className="px-3 py-4 text-center text-[#2d808e]">{item.poPrice.toLocaleString()}</td>
                  <td className="px-3 py-4 whitespace-nowrap">{item.reqBy}</td>
                  <td className="px-3 py-4 whitespace-nowrap">{item.reqDept}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NewPurchaseOrder;