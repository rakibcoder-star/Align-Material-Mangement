
import React, { useState, useEffect } from 'react';
import { Home, Inbox, Filter, ChevronDown, Search, Plus, Loader2 } from 'lucide-react';
import ManualGRN from './ManualGRN';
import { supabase } from '../lib/supabase';

const Receive: React.FC = () => {
  const [view, setView] = useState<'list' | 'manual'>('list');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [pendingItems, setPendingItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingPOItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select('*')
        .eq('status', 'Open')
        .order('created_at', { ascending: false });

      if (data) {
        const flattened: any[] = [];
        data.forEach(po => {
          const poItems = po.items || [];
          poItems.forEach((item: any, idx: number) => {
            flattened.push({
              id: `${po.id}_${idx}`,
              poNo: po.po_no,
              sku: item.sku,
              name: item.name,
              poQty: item.poQty,
              grnQty: 0, // In real logic, subtract from existing GRNs
              reqBy: po.terms?.contactPerson || 'N/A',
              supplier: po.supplier_name
            });
          });
        });
        setPendingItems(flattened);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPOItems();
  }, []);

  const handleManualGRNSubmit = (data: any) => {
    alert("Goods Receive Note created successfully!");
    setView('list');
    fetchPendingPOItems();
  };

  const toggleSelect = (id: string) => {
    // Fix: Using correct state variable name 'selectedItems' and adding generic type to ensure Set<string>
    const next = new Set<string>(selectedItems);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedItems(next);
  };

  if (view === 'manual') {
    return <ManualGRN onBack={() => setView('list')} onSubmit={handleManualGRNSubmit} />;
  }

  return (
    <div className="flex flex-col space-y-4 font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-[10px] font-black text-[#2d808e] uppercase tracking-widest">
          <Home size={14} className="text-gray-400" />
          <span className="text-gray-400">/</span>
          <span className="bg-[#eef5f6] px-3 py-1 rounded">WAREHOUSE-RECEIVE</span>
        </div>
        <button 
          onClick={() => setView('manual')}
          className="bg-[#2d808e] text-white px-8 py-2 rounded text-[12px] font-black shadow-lg shadow-cyan-900/10 hover:bg-[#256b78] transition-all uppercase tracking-widest"
        >
          Manual GRN Entry
        </button>
      </div>

      <div className="flex items-center space-x-2">
        <button 
          disabled={selectedItems.size === 0}
          className={`px-8 py-2 rounded text-[12px] font-black transition-all border uppercase tracking-widest ${
            selectedItems.size > 0 
              ? 'bg-[#2d808e] text-white border-[#2d808e] hover:bg-[#256b78] shadow-lg' 
              : 'bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed'
          }`}
        >
          Batch Make GRN
        </button>
      </div>

      <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-[#fafbfc]">
              <tr className="text-[10px] font-black text-gray-700 uppercase tracking-widest border-b border-gray-100">
                <th className="px-6 py-5 w-12 text-center"></th>
                <th className="px-6 py-5 text-center">PO NO</th>
                <th className="px-6 py-5 text-center">SKU</th>
                <th className="px-6 py-5">ITEM NAME</th>
                <th className="px-6 py-5">SUPPLIER</th>
                <th className="px-6 py-5 text-center">PO QTY</th>
                <th className="px-6 py-5 text-center">REC. QTY</th>
              </tr>
            </thead>
            <tbody className="text-[11px] font-bold text-gray-600">
              {loading ? (
                <tr><td colSpan={7} className="py-20 text-center uppercase tracking-widest text-gray-400"><Loader2 className="animate-spin inline mr-2" /> Syncing with Purchase Orders...</td></tr>
              ) : pendingItems.length > 0 ? (
                pendingItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors border-b border-gray-50">
                    <td className="px-6 py-4 text-center">
                      <input 
                        type="checkbox" 
                        checked={selectedItems.has(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        className="w-4 h-4 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 text-center font-black text-blue-500">{item.poNo}</td>
                    <td className="px-6 py-4 text-center text-gray-400">{item.sku}</td>
                    <td className="px-6 py-4 uppercase text-gray-900 leading-tight">{item.name}</td>
                    <td className="px-6 py-4 uppercase text-[9px]">{item.supplier}</td>
                    <td className="px-6 py-4 text-center text-gray-800">{item.poQty}</td>
                    <td className="px-6 py-4 text-center text-[#2d808e] font-black">{item.grnQty}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-32">
                    <div className="flex flex-col items-center justify-center text-gray-300">
                      <Inbox size={48} strokeWidth={1} className="mb-2" />
                      <p className="text-[10px] font-black uppercase tracking-widest">No pending purchase orders for receive</p>
                    </div>
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

export default Receive;
