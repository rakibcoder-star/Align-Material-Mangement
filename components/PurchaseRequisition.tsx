import React, { useState, useEffect, useMemo } from 'react';
import { Home, Edit2, Inbox } from 'lucide-react';
import NewPurchaseRequisition from './NewPurchaseRequisition';
import PRPreviewModal from './PRPreviewModal';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const PurchaseRequisition: React.FC = () => {
  const { user } = useAuth();
  const [view, setView] = useState<'list' | 'new'>('list');
  const [requisitions, setRequisitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewPr, setPreviewPr] = useState<any>(null);
  const [editingPr, setEditingPr] = useState<any>(null);

  const fetchRequisitions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('requisitions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data && !error) {
      setRequisitions(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequisitions();
  }, []);

  const handleCreateNew = () => {
    setEditingPr(null);
    setView('new');
  };

  const handleEdit = (pr: any) => {
    setEditingPr(pr);
    setView('new');
  };

  const handlePrClick = (pr: any) => {
    setPreviewPr(pr);
  };

  if (view === 'new') {
    return <NewPurchaseRequisition onBack={() => setView('list')} onSubmit={() => { setView('list'); fetchRequisitions(); }} initialData={editingPr} />;
  }

  return (
    <div className="flex flex-col space-y-4 font-sans max-w-[1600px] mx-auto w-full">
      {/* Breadcrumb & Action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-[10px] font-bold text-[#2d808e] uppercase tracking-wider">
          <Home size={14} className="text-gray-400" />
          <span className="text-gray-400">/</span>
          <span className="text-[#2d808e] font-black uppercase">PURCHASE-REQUISITION</span>
        </div>
        <button 
          onClick={handleCreateNew}
          className="bg-[#2d808e] text-white px-6 py-2 rounded text-[12px] font-black shadow-lg shadow-cyan-900/10 hover:bg-[#256b78] transition-all uppercase tracking-widest"
        >
          New Requisition
        </button>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-[#fcfcfc]">
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                <th className="px-6 py-5 text-center w-16">SL</th>
                <th className="px-6 py-5 text-center">PR NO</th>
                <th className="px-6 py-5 text-center">SKU</th>
                <th className="px-6 py-5 text-center">REF.NO</th>
                <th className="px-6 py-5 text-center">REQ. QTY</th>
                <th className="px-6 py-5 text-center">REQ. BY</th>
                <th className="px-6 py-5 text-center">REQ. DEPT.</th>
                <th className="px-6 py-5 text-center w-24">ACTION</th>
              </tr>
            </thead>
            <tbody className="text-[11px] font-bold text-gray-600 uppercase tracking-tighter">
              {loading ? (
                <tr><td colSpan={8} className="py-20 text-center text-gray-300">Syncing requisitions...</td></tr>
              ) : requisitions.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50/50 border-b border-gray-50 transition-colors group">
                  <td className="px-6 py-4 text-center text-gray-400">{index + 1}</td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => handlePrClick(item)}
                      className="text-blue-500 font-black hover:underline transition-all"
                    >
                      {item.pr_no}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-400 font-medium">MULTI</td>
                  <td className="px-6 py-4 text-center font-black text-gray-800">{item.pr_no}</td>
                  <td className="px-6 py-4 text-center text-gray-400">MULTI</td>
                  <td className="px-6 py-4 text-center uppercase tracking-tighter text-gray-500">MMT-USER</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded text-[9px] font-black uppercase">
                      {item.type === 'foreign' ? 'FOREIGN' : 'LOCAL'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => handleEdit(item)}
                      className="p-1.5 text-gray-300 hover:text-[#2d808e] border border-gray-100 rounded transition-all"
                    >
                      <Edit2 size={12} />
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && requisitions.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-20 text-center text-gray-300 uppercase font-black tracking-widest">No data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {previewPr && <PRPreviewModal pr={previewPr} onClose={() => setPreviewPr(null)} />}
    </div>
  );
};

export default PurchaseRequisition;