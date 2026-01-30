import React, { useState, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { Home, FileSpreadsheet, History, Printer, Edit2, Filter, ChevronDown } from 'lucide-react';
import NewPurchaseRequisition from './NewPurchaseRequisition';
import * as XLSX from 'xlsx';

interface PurchaseRequisitionProps {
  requisitions: any[];
  setRequisitions: React.Dispatch<React.SetStateAction<any[]>>;
}

const PrintTemplate: React.FC<{ pr: any }> = ({ pr }) => (
  <div className="p-12 bg-white text-black font-sans leading-relaxed">
    {/* Header */}
    <div className="flex justify-between items-start border-b-4 border-[#2d808e] pb-6 mb-8">
      <div>
        <h1 className="text-4xl font-black text-[#2d808e] tracking-tighter">ALIGN</h1>
        <p className="text-[10px] font-bold text-gray-500 uppercase mt-1 tracking-widest">Enterprise Resource Planning System</p>
      </div>
      <div className="text-right">
        <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">Purchase Requisition</h2>
        <div className="mt-2 text-sm font-bold bg-gray-100 inline-block px-3 py-1 rounded">
          PR No: <span className="text-[#2d808e]">{pr.PR}</span>
        </div>
      </div>
    </div>

    {/* Information Grid */}
    <div className="grid grid-cols-2 gap-8 mb-8">
      <div className="bg-[#f8fafc] p-4 rounded border border-gray-100">
        <h3 className="text-xs font-black uppercase text-[#2d808e] border-b border-gray-200 pb-2 mb-3">Requisition Information</h3>
        <div className="space-y-2 text-xs">
          <p className="flex justify-between border-b border-dashed border-gray-200 pb-1">
            <span className="text-gray-500">Date:</span>
            <span className="font-bold">{pr.createdAt?.split(' ')[0]}</span>
          </p>
          <p className="flex justify-between border-b border-dashed border-gray-200 pb-1">
            <span className="text-gray-500">PR Reference:</span>
            <span className="font-bold">{pr.note || 'None Provided'}</span>
          </p>
          <p className="flex justify-between border-b border-dashed border-gray-200 pb-1">
            <span className="text-gray-500">Supplier Type:</span>
            <span className="font-bold uppercase">{pr.type || 'Local'}</span>
          </p>
          <p className="flex justify-between">
            <span className="text-gray-500">Current Status:</span>
            <span className="font-bold text-[#2d808e] uppercase">{pr.status}</span>
          </p>
        </div>
      </div>
      <div className="bg-[#f8fafc] p-4 rounded border border-gray-100">
        <h3 className="text-xs font-black uppercase text-[#2d808e] border-b border-gray-200 pb-2 mb-3">Requester Details</h3>
        <div className="space-y-2 text-xs">
          <p className="flex justify-between border-b border-dashed border-gray-200 pb-1">
            <span className="text-gray-500">Name:</span>
            <span className="font-bold">{pr.reqBy}</span>
          </p>
          <p className="flex justify-between border-b border-dashed border-gray-200 pb-1">
            <span className="text-gray-500">Department:</span>
            <span className="font-bold">{pr.reqDpt}</span>
          </p>
          <p className="flex justify-between border-b border-dashed border-gray-200 pb-1">
            <span className="text-gray-500">Contact:</span>
            <span className="font-bold">{pr.contact || '+880 1777 702323'}</span>
          </p>
          <p className="flex justify-between">
            <span className="text-gray-500">Email:</span>
            <span className="font-bold lowercase">{pr.email || 'N/A'}</span>
          </p>
        </div>
      </div>
    </div>

    {/* Items Table */}
    <div className="mb-12">
      <h3 className="text-xs font-black uppercase text-[#2d808e] mb-3">Itemized Requirements</h3>
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-[#2d808e] text-white">
            <th className="py-2.5 px-2 text-left w-10">SL</th>
            <th className="py-2.5 px-2 text-left">Description of Materials</th>
            <th className="py-2.5 px-2 text-center w-24">SKU Code</th>
            <th className="py-2.5 px-2 text-center w-16">UOM</th>
            <th className="py-2.5 px-2 text-right w-16">Qty</th>
            <th className="py-2.5 px-2 text-right w-24">Unit Price</th>
            <th className="py-2.5 px-2 text-right w-24">Total</th>
          </tr>
        </thead>
        <tbody>
          {(pr.items || [{ name: pr.name, sku: pr.SKU, spec: pr.spec, UOM: pr.UOM, reqQty: pr.reqQty, PRPrice: pr.PRPrice }]).map((item: any, idx: number) => (
            <tr key={idx} className="border-b border-gray-200">
              <td className="py-4 px-2 align-top">{idx + 1}</td>
              <td className="py-4 px-2 align-top">
                <p className="font-bold uppercase text-gray-800">{item.name}</p>
                <p className="text-[10px] text-gray-500 mt-1">{item.spec || item.specification}</p>
              </td>
              <td className="py-4 px-2 text-center align-top font-mono">{item.sku}</td>
              <td className="py-4 px-2 text-center align-top uppercase">{item.UOM || item.uom}</td>
              <td className="py-4 px-2 text-right font-bold align-top">{item.reqQty}</td>
              <td className="py-4 px-2 text-right align-top">{(Number(item.PRPrice || item.unitPrice)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td className="py-4 px-2 text-right font-bold align-top">{(Number(item.reqQty) * Number(item.PRPrice || item.unitPrice)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-gray-50 border-b-2 border-gray-200 font-black">
            <td colSpan={6} className="py-4 px-2 text-right uppercase text-[#2d808e]">Estimated Total Value (BDT)</td>
            <td className="py-4 px-2 text-right text-lg">
              {(pr.value || (pr.reqQty * pr.PRPrice)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    {/* Notes */}
    {pr.note && (
      <div className="mb-12 p-4 bg-yellow-50/30 border border-yellow-100 rounded">
        <h4 className="text-[10px] font-black uppercase text-gray-500 mb-1">Additional Notes:</h4>
        <p className="text-xs text-gray-700 italic">"{pr.note}"</p>
      </div>
    )}

    {/* Footer Signatures */}
    <div className="grid grid-cols-4 gap-8 mt-24">
      <div className="text-center">
        <div className="border-t-2 border-gray-300 w-full mb-2"></div>
        <p className="text-[10px] font-black uppercase text-gray-800">Requested By</p>
        <p className="text-[9px] text-gray-400">Date: ____/____/____</p>
      </div>
      <div className="text-center">
        <div className="border-t-2 border-gray-300 w-full mb-2"></div>
        <p className="text-[10px] font-black uppercase text-gray-800">Checked By</p>
        <p className="text-[9px] text-gray-400">Date: ____/____/____</p>
      </div>
      <div className="text-center">
        <div className="border-t-2 border-gray-300 w-full mb-2"></div>
        <p className="text-[10px] font-black uppercase text-gray-800">Verified By</p>
        <p className="text-[9px] text-gray-400">Date: ____/____/____</p>
      </div>
      <div className="text-center">
        <div className="border-t-2 border-gray-300 w-full mb-2"></div>
        <p className="text-[10px] font-black uppercase text-gray-800">Authorized Signature</p>
        <p className="text-[9px] text-gray-400">Date: ____/____/____</p>
      </div>
    </div>

    <div className="mt-16 text-center border-t border-gray-100 pt-4">
      <p className="text-[8px] text-gray-400 uppercase tracking-widest">Document Generated via ALIGN ERP on {new Date().toLocaleString()}</p>
    </div>
  </div>
);

const PurchaseRequisition: React.FC<PurchaseRequisitionProps> = ({ requisitions, setRequisitions }) => {
  const [view, setView] = useState<'list' | 'new'>('list');
  const [editingPr, setEditingPr] = useState<any>(null);
  const [filterMonth, setFilterMonth] = useState('2026-01');

  const filteredData = useMemo(() => {
    return requisitions.filter(item => item.createdAt.startsWith(filterMonth));
  }, [filterMonth, requisitions]);

  const handleExportExcel = () => {
    const exportData = filteredData.length > 0 ? filteredData : requisitions;
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchase Requisitions");
    XLSX.writeFile(workbook, `Purchase_Requisition_${filterMonth}.xlsx`);
  };

  const handlePrint = (pr: any) => {
    const printRoot = document.getElementById('print-root');
    if (!printRoot) return;

    // Clear previous print content
    printRoot.innerHTML = '';
    
    // Use React 18 createRoot
    const root = ReactDOM.createRoot(printRoot);
    root.render(<PrintTemplate pr={pr} />);

    // Trigger browser print after a brief delay for rendering
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const months = [
    { value: '2026-01', label: 'January 2026' },
    { value: '2025-12', label: 'December 2025' },
    { value: '2025-11', label: 'November 2025' },
    { value: '2025-10', label: 'October 2025' },
  ];

  const handleEdit = (pr: any) => {
    setEditingPr(pr);
    setView('new');
  };

  const handleCreateNew = () => {
    setEditingPr(null);
    setView('new');
  };

  const handleSubmitNew = (newPR: any) => {
    if (editingPr) {
      setRequisitions(prev => prev.map(r => r.PR === editingPr.PR ? { ...r, ...newPR } : r));
    } else {
      setRequisitions(prev => [newPR, ...prev]);
    }
    setView('list');
    setEditingPr(null);
  };

  if (view === 'new') {
    return (
      <NewPurchaseRequisition 
        onBack={() => { setView('list'); setEditingPr(null); }} 
        onSubmit={handleSubmitNew}
        initialData={editingPr}
      />
    );
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
          className="bg-[#2d808e] text-white px-6 py-1.5 rounded text-[13px] font-bold shadow-sm hover:bg-[#256b78] transition-all active:scale-[0.98]"
        >
          Purchase Requisition
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Filter By Month:</label>
           <div className="relative">
              <select 
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded px-3 py-1 pr-8 text-[12px] font-bold text-gray-600 outline-none focus:border-[#2d808e] transition-all"
              >
                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
           </div>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={handleExportExcel}
            className="flex items-center space-x-1.5 border border-gray-300 bg-white px-3 py-1 rounded text-[12px] font-bold text-gray-700 hover:bg-gray-50 transition-all"
          >
            <FileSpreadsheet size={14} className="text-green-600" />
            <span>Excel</span>
          </button>
          <button className="flex items-center space-x-1.5 border border-gray-300 bg-white px-3 py-1 rounded text-[12px] font-bold text-gray-700 hover:bg-gray-50 transition-all">
            <History size={14} className="text-gray-500" />
            <span>Logs</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#fafbfc]">
              <tr className="text-[11px] font-bold text-gray-700 uppercase tracking-tighter">
                <th className="px-4 py-4 border-b border-gray-100 text-center w-12">SL</th>
                <th className="px-4 py-4 border-b border-gray-100 text-center relative min-w-[120px]">
                  PR No
                  <Filter size={10} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300" />
                </th>
                <th className="px-4 py-4 border-b border-gray-100 text-center relative min-w-[120px]">
                  SKU
                  <Filter size={10} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300" />
                </th>
                <th className="px-4 py-4 border-b border-gray-100 text-center min-w-[180px]">Name</th>
                <th className="px-4 py-4 border-b border-gray-100 text-center w-20">Req. Qty</th>
                <th className="px-4 py-4 border-b border-gray-100 text-center w-20">PO Qty</th>
                <th className="px-4 py-4 border-b border-gray-100 text-center w-20">Rec. Qty</th>
                <th className="px-4 py-4 border-b border-gray-100 text-center">Req. By</th>
                <th className="px-4 py-4 border-b border-gray-100 text-center">Dept.</th>
                <th className="px-4 py-4 border-b border-gray-100 text-center">Status</th>
                <th className="px-4 py-4 border-b border-gray-100 text-center w-24">Action</th>
              </tr>
            </thead>
            <tbody className="text-[11px] text-gray-600 font-medium">
              {filteredData.length > 0 ? filteredData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                  <td className="px-4 py-3.5 text-center">{index + 1}</td>
                  <td className="px-4 py-3.5 text-center text-blue-500 font-bold">{item.PR}</td>
                  <td className="px-4 py-3.5 text-center">{item.SKU}</td>
                  <td className="px-4 py-3.5 font-bold uppercase text-[10px]">{item.name}</td>
                  <td className="px-4 py-3.5 text-center font-bold text-gray-800">{item.reqQty}</td>
                  <td className="px-4 py-3.5 text-center">{item.POQty}</td>
                  <td className="px-4 py-3.5 text-center">{item.recQty}</td>
                  <td className="px-4 py-3.5 text-center whitespace-nowrap">{item.reqBy}</td>
                  <td className="px-4 py-3.5 text-center">{item.reqDpt}</td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      item.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                      item.status === 'Checked' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {item.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button 
                        onClick={() => handlePrint(item)}
                        className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 border border-gray-200 rounded transition-all"
                      >
                        <Printer size={12} />
                      </button>
                      <button 
                        onClick={() => handleEdit(item)}
                        className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 border border-gray-200 rounded transition-all"
                      >
                        <Edit2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={11} className="py-20 text-center text-gray-400 italic">No requisition found for the selected month.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PurchaseRequisition;