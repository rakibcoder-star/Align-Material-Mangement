import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { Home, FileSpreadsheet, History, Printer, Edit2, Filter, ChevronDown } from 'lucide-react';
import NewPurchaseRequisition from './NewPurchaseRequisition';
import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const PurchaseRequisition: React.FC = () => {
  const { user } = useAuth();
  const [view, setView] = useState<'list' | 'new'>('list');
  const [requisitions, setRequisitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPr, setEditingPr] = useState<any>(null);
  const [filterMonth, setFilterMonth] = useState('2026-01');

  const fetchRequisitions = async () => {
    setLoading(true);
    // Fetching requisitions and joining with profiles and potentially some metadata if available
    const { data, error } = await supabase
      .from('requisitions')
      .select(`*, profiles(email)`)
      .order('created_at', { ascending: false });
    
    if (data && !error) {
      setRequisitions(data.map(r => ({
        ...r,
        PR: r.pr_no,
        // In a real app we would join with requisition_items to get a summary SKU
        sku: 'SKU-META', 
        name: r.reference || 'Item List Attached',
        reqQty: 'Multi',
        reqBy: r.profiles?.email?.split('@')[0] || 'Unknown',
        reqDept: r.type === 'foreign' ? 'IMPORTS' : 'LOCAL PROCUREMENT', // Example mapping
        createdAt: r.created_at,
        status: r.status
      })));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequisitions();
  }, []);

  const filteredData = useMemo(() => {
    return requisitions.filter(item => item.createdAt.startsWith(filterMonth));
  }, [filterMonth, requisitions]);

  const handleCreateNew = () => {
    setEditingPr(null);
    setView('new');
  };

  const handleEdit = (pr: any) => {
    setEditingPr(pr);
    setView('new');
  };

  const handleSubmitNew = async (newPR: any) => {
    const { data: prData, error: prError } = await supabase
      .from('requisitions')
      .insert([{
        pr_no: newPR.PR,
        reference: newPR.reference,
        note: newPR.note,
        type: newPR.type,
        status: 'In-Process',
        req_by_id: user?.id,
        total_value: newPR.value
      }])
      .select()
      .single();

    if (prError) {
      alert("Error saving requisition: " + prError.message);
      return;
    }

    await fetchRequisitions();
    setView('list');
  };

  if (view === 'new') {
    return <NewPurchaseRequisition onBack={() => setView('list')} onSubmit={handleSubmitNew} initialData={editingPr} />;
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-[11px] font-bold text-[#2d808e] uppercase tracking-wider">
          <Home size={14} className="text-gray-400" />
          <span className="text-gray-400">/</span>
          <span>Purchase-Requisition</span>
        </div>
        <button 
          onClick={handleCreateNew}
          className="bg-[#2d808e] text-white px-6 py-1.5 rounded text-[13px] font-bold shadow-sm hover:bg-[#256b78]"
        >
          New Requisition
        </button>
      </div>

      <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-20 text-center text-gray-400">Loading requisitions...</div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead className="bg-[#fafbfc]">
              <tr className="text-[11px] font-bold text-gray-700 uppercase border-b border-gray-100">
                <th className="px-4 py-4 text-center w-12">SL</th>
                <th className="px-4 py-4 text-center">PR No</th>
                <th className="px-4 py-4 text-center">SKU</th>
                <th className="px-4 py-4">Name</th>
                <th className="px-4 py-4 text-center">Req. Qty</th>
                <th className="px-4 py-4 text-center">Req. By</th>
                <th className="px-4 py-4 text-center">Req. Dept.</th>
                <th className="px-4 py-4 text-center w-24">Action</th>
              </tr>
            </thead>
            <tbody className="text-[11px] text-gray-600">
              {filteredData.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50 border-b border-gray-50 last:border-0">
                  <td className="px-4 py-3.5 text-center">{index + 1}</td>
                  <td className="px-4 py-3.5 text-center text-blue-500 font-bold">{item.PR}</td>
                  <td className="px-4 py-3.5 text-center text-gray-500">{item.sku}</td>
                  <td className="px-4 py-3.5">{item.name}</td>
                  <td className="px-4 py-3.5 text-center font-bold">{item.reqQty}</td>
                  <td className="px-4 py-3.5 text-center">{item.reqBy}</td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-gray-100 text-gray-600">
                      {item.reqDept}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <button onClick={() => handleEdit(item)} className="p-1.5 text-gray-400 hover:text-blue-500 border border-gray-100 rounded">
                      <Edit2 size={12} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-20 text-center text-gray-300">No requisitions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PurchaseRequisition;