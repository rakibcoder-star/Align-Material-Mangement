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
          // Flatten all items from all approved PRs
          const flattened: PendingPRItem[] = [];
          data.forEach(pr => {
            const prItems = pr.items || [];
            prItems.forEach((item: any, idx: number) => {
              flattened.push({
                id: `${pr.id}_${idx}`, // unique identifier for checkbox selection
                prNo: pr.pr_no,
                sku: item.sku || 'N/A',
                name: item.name || 'N/A',
                specification: item.specification || '',
                reqQty: Number(item.reqQty) || 0,
                poQty: 0, // In a full implementation, you'd calculate this from existing POs
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
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === pendingItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingItems.map(i => i.id)));
    }
  };

  const handleMakePO = () => {
    if (selectedIds.size === 0) return;
    const selectedItems = pendingItems.filter(item => selectedIds.has(item.id));
    onSubmit(selectedItems);
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-[11px] font-bold text-[#2d808e] uppercase tracking-wider">
        <Home size={14} className="text-gray-400" />
        <span className="text-gray-400">/</span>
        <button onClick={onBack} className="text-gray-400 hover:text-[#2d808e]">PURCHASE-ORDER</button>
        <span className="text-gray-400">/</span>
        <span>NEW</span>
      </div>

      {/* Action Button */}
      <div>
        <button 
          onClick={handleMakePO}
          disabled={selectedIds.size === 0 || loading}
          className={`px-6 py-1.5 rounded text-[13px] font-bold transition-all shadow-sm ${
            selectedIds.size > 0 
              ? 'bg-[#2d808e] text-white hover:bg-[#256b78] active:scale-[0.98]' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
          }`}
        >
          {loading ? 'Syncing...' : 'Make PO'}
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead className="bg-[#fafbfc]">
              <tr className="text-[11px] font-bold text-gray-800 uppercase tracking-tight border-b border-gray-100">
                <th className="px-3 py-4 text-center w-12">
                   <input 
                    type="checkbox" 
                    checked={selectedIds.size === pendingItems.length && pendingItems.length > 0}
                    onChange={toggleSelectAll}
                    disabled={loading}
                    className="w-4 h-4 rounded border-gray-300 text-[#2d808e] focus:ring-[#2d808e]"
                   />
                </th>
                <th className="px-3 py-4 text-center relative w-32">
                  PR No
                  <Filter size={10} className="inline-block ml-2 text-gray-300" />
                </th>
                <th className="px-3 py-4 text-center relative w-32">
                  SKU
                  <Filter size={10} className="inline-block ml-2 text-gray-300" />
                </th>
                <th className="px-3 py-4 text-left w-64">Name</th>
                <th className="px-3 py-4 text-left">Specification</th>
                <th className="px-3 py-4 text-center w-24">Req. Qty</th>
                <th className="px-3 py-4 text-center w-24">PO Qty</th>
                <th className="px-3 py-4 text-center w-32">Received Qty</th>
                <th className="px-3 py-4 text-left w-40">Req. By</th>
                <th className="px-3 py-4 text-left w-32">Req. Dept.</th>
              </tr>
            </thead>
            <tbody className="text-[11px] text-gray-600 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-20 text-center">
                    <div className="flex flex-col items-center space-y-2">
                      <Loader2 className="animate-spin text-[#2d808e]" size={24} />
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fetching Approved PR items...</span>
                    </div>
                  </td>
                </tr>
              ) : pendingItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                  <td className="px-3 py-4 text-center">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.has(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className="w-4 h-4 rounded border-gray-300 text-[#2d808e] focus:ring-[#2d808e]"
                    />
                  </td>
                  <td className="px-3 py-4 text-center font-bold text-gray-700">{item.prNo}</td>
                  <td className="px-3 py-4 text-center">{item.sku}</td>
                  <td className="px-3 py-4 font-bold uppercase text-[10px] text-gray-800 leading-tight">
                    {item.name}
                  </td>
                  <td className="px-3 py-4 italic text-gray-500 leading-tight">
                    {item.specification || ''}
                  </td>
                  <td className="px-3 py-4 text-center text-gray-800">{item.reqQty}</td>
                  <td className="px-3 py-4 text-center">{item.poQty}</td>
                  <td className="px-3 py-4 text-center">{item.receivedQty}</td>
                  <td className="px-3 py-4 whitespace-nowrap">{item.reqBy}</td>
                  <td className="px-3 py-4 whitespace-nowrap">{item.reqDept}</td>
                </tr>
              ))}
              {!loading && pendingItems.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-20 text-center text-gray-300 uppercase font-black tracking-widest text-[9px]">
                    No approved PR items pending for Purchase Order
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NewPurchaseOrder;