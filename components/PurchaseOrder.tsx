import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Home, 
  FileSpreadsheet, 
  History, 
  Edit2, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  Printer,
  Loader2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import NewPurchaseOrder from './NewPurchaseOrder';
import CreatePODetails from './CreatePODetails';
import POPrintTemplate from './POPrintTemplate';
import { supabase } from '../lib/supabase';

const PurchaseOrder: React.FC = () => {
  const [view, setView] = useState<'list' | 'select-items' | 'create-details'>('list');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPRItems, setSelectedPRItems] = useState<any[]>([]);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data && !error) setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(orders);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchase Orders");
    XLSX.writeFile(workbook, "Purchase_Orders.xlsx");
  };

  const handlePrint = (po: any) => {
    const printSection = document.getElementById('print-section');
    if (!printSection) return;
    printSection.innerHTML = '';
    const root = createRoot(printSection);
    root.render(<POPrintTemplate po={po} />);
    setTimeout(() => window.print(), 600);
  };

  if (view === 'select-items') {
    return <NewPurchaseOrder onBack={() => setView('list')} onSubmit={(items) => { setSelectedPRItems(items); setView('create-details'); }} />;
  }

  if (view === 'create-details') {
    return <CreatePODetails items={selectedPRItems} onCancel={() => setView('select-items')} onSubmit={() => { setView('list'); fetchOrders(); }} />;
  }

  return (
    <div className="flex flex-col space-y-4 font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-[10px] font-black text-[#2d808e] uppercase tracking-widest">
          <Home size={14} className="text-gray-400" />
          <span className="text-gray-400">/</span>
          <span>Purchase-Order</span>
        </div>
        <button 
          onClick={() => setView('select-items')}
          className="bg-[#2d808e] text-white px-8 py-2 rounded text-[12px] font-black shadow-lg shadow-cyan-900/10 hover:bg-[#256b78] transition-all uppercase tracking-widest"
        >
          New Purchase Order
        </button>
      </div>

      <div className="bg-white rounded border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead className="bg-[#fafbfc]">
              <tr className="text-[10px] font-black text-gray-700 uppercase tracking-widest border-b border-gray-100">
                <th className="px-6 py-5 text-center w-16">SL</th>
                <th className="px-6 py-5 text-center">PO No</th>
                <th className="px-6 py-5">Supplier</th>
                <th className="px-6 py-5 text-center">Type</th>
                <th className="px-6 py-5 text-right">Value</th>
                <th className="px-6 py-5 text-center">Currency</th>
                <th className="px-6 py-5 text-center">Status</th>
                <th className="px-6 py-5 text-center w-24">Action</th>
              </tr>
            </thead>
            <tbody className="text-[11px] font-bold text-gray-600">
              {loading ? (
                <tr><td colSpan={8} className="py-20 text-center uppercase tracking-widest text-gray-400">Syncing orders...</td></tr>
              ) : orders.map((po, index) => (
                <tr key={po.id} className="hover:bg-gray-50 transition-colors border-b border-gray-50">
                  <td className="px-6 py-4 text-center text-gray-400">{index + 1}</td>
                  <td className="px-6 py-4 text-center font-black text-blue-500">{po.po_no}</td>
                  <td className="px-6 py-4 uppercase">{po.supplier_name}</td>
                  <td className="px-6 py-4 text-center">{po.type}</td>
                  <td className="px-6 py-4 text-right font-black">{(po.total_value || 0).toLocaleString()}</td>
                  <td className="px-6 py-4 text-center">{po.currency}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-[9px] font-black uppercase border border-green-100">{po.status}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button onClick={() => handlePrint(po)} className="p-1.5 text-gray-400 hover:text-blue-500 border border-gray-100 rounded transition-all"><Printer size={12} /></button>
                      <button className="p-1.5 text-gray-400 hover:text-blue-500 border border-gray-100 rounded transition-all"><Edit2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrder;