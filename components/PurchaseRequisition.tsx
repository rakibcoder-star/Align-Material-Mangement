import React, { useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { Home, FileSpreadsheet, History, Printer, Edit2, Filter, ChevronDown } from 'lucide-react';
import NewPurchaseRequisition from './NewPurchaseRequisition';
import * as XLSX from 'xlsx';

interface PurchaseRequisitionProps {
  requisitions: any[];
  setRequisitions: React.Dispatch<React.SetStateAction<any[]>>;
}

const PrintTemplate: React.FC<{ pr: any }> = ({ pr }) => {
  // Ensure we have a list of items to display
  const itemsList = pr.items || [{
    name: pr.name,
    sku: pr.SKU || pr.code,
    specification: pr.spec,
    brand: pr.brand || '',
    uom: pr.UOM,
    reqQty: pr.reqQty,
    unitPrice: pr.PRPrice,
    onHand: pr.onHand || '0',
    remarks: pr.remarks || pr.note || ''
  }];

  const totalQty = itemsList.reduce((acc: number, item: any) => acc + (Number(item.reqQty || 0)), 0);
  const totalValue = itemsList.reduce((acc: number, item: any) => acc + (Number(item.reqQty || 0) * Number(item.unitPrice || 0)), 0);

  return (
    <div className="p-8 bg-white text-black font-sans min-h-screen text-[10px]">
      {/* Header Section */}
      <div className="relative flex flex-col items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Fair Technology Limited</h1>
        <p className="text-[10px] text-gray-600">Plot- 12/A & 12/B, Block-C, Kaliakoir Hi-Tech Park</p>
        <p className="text-[10px] text-gray-600">Gazipur, Bangladesh-1750. +#880 1787-670 786</p>
        <h2 className="text-sm font-bold mt-2 uppercase border-b-2 border-black inline-block px-4">PURCHASE REQUISITION FORM</h2>
        
        {/* QR Code Placeholder */}
        <div className="absolute top-0 right-0 border border-gray-300 p-1 w-16 h-16 flex items-center justify-center">
           <img src="https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=PR-3000000018" alt="QR Code" className="w-full h-full" />
        </div>
      </div>

      {/* Meta Information Grid */}
      <div className="grid grid-cols-3 gap-4 mb-4 border-t border-gray-100 pt-4">
        <div className="space-y-1">
          <p><span className="font-bold">PR No.:</span> {pr.PR} (Local)</p>
          <p><span className="font-bold">Reference:</span> {pr.note || 'Common Consumable'}</p>
          <p><span className="font-bold">Requested By:</span> {pr.reqBy}</p>
        </div>
        <div className="space-y-1">
          <p><span className="font-bold">Department:</span> {pr.reqDpt}</p>
          <p><span className="font-bold">Email:</span> {pr.email || 'sohel.rana@fairtechnology.com.bd'}</p>
          <p><span className="font-bold">Phone No.:</span> {pr.contact || '+880 1773 402954'}</p>
        </div>
        <div className="space-y-1 text-right">
          <p><span className="font-bold">Req. Date:</span> {pr.createdAt?.split(' ')[0] || '26-Jan-2026'}</p>
          <p><span className="font-bold">PR Status:</span> {pr.status}</p>
          <p><span className="font-bold">Update On:</span> {pr.updatedAt?.split(' ')[0] || '26-Jan-2026'}</p>
        </div>
      </div>

      {/* Main Items Table */}
      <div className="mb-4">
        <table className="w-full border-collapse border border-black text-[9px]">
          <thead>
            <tr className="bg-white font-bold">
              <th className="border border-black py-1 px-1 w-6">SL</th>
              <th className="border border-black py-1 px-1">Part Code</th>
              <th className="border border-black py-1 px-2 w-1/4">Name</th>
              <th className="border border-black py-1 px-1">Spec.</th>
              <th className="border border-black py-1 px-1">Brand</th>
              <th className="border border-black py-1 px-1 w-10">UOM</th>
              <th className="border border-black py-1 px-1 text-center w-20">Unit Price (BDT)</th>
              <th className="border border-black py-1 px-1 text-center w-12">Req. Qty</th>
              <th className="border border-black py-1 px-1 text-center w-24">Req. Value (BDT)</th>
              <th className="border border-black py-1 px-1 text-center w-16">On-Hand Stock</th>
              <th className="border border-black py-1 px-1">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {itemsList.map((item: any, idx: number) => (
              <tr key={idx}>
                <td className="border border-black py-1 px-1 text-center">{idx + 1}</td>
                <td className="border border-black py-1 px-1 text-center">{item.sku || 'N/A'}</td>
                <td className="border border-black py-1 px-2 font-bold uppercase">{item.name}</td>
                <td className="border border-black py-1 px-1 italic text-gray-600">{item.specification || item.spec || '-'}</td>
                <td className="border border-black py-1 px-1 text-center">{item.brand || '-'}</td>
                <td className="border border-black py-1 px-1 text-center uppercase">{item.uom || item.UOM}</td>
                <td className="border border-black py-1 px-1 text-right">{(Number(item.unitPrice || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="border border-black py-1 px-1 text-center font-bold">{item.reqQty}</td>
                <td className="border border-black py-1 px-1 text-right font-bold">{(Number(item.reqQty || 0) * Number(item.unitPrice || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="border border-black py-1 px-1 text-center">{item.onHand || '0'}</td>
                <td className="border border-black py-1 px-1 text-[8px]">{item.remarks || '-'}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold">
              <td colSpan={7} className="border border-black py-1 px-1 text-right">Total</td>
              <td className="border border-black py-1 px-1 text-center">{totalQty}</td>
              <td className="border border-black py-1 px-1 text-right bg-gray-50">{totalValue.toLocaleString(undefined, { minimumFractionDigits: 3 })}</td>
              <td colSpan={2} className="border border-black py-1 px-1"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Note Section */}
      <div className="mb-6">
        <div className="flex space-x-4 items-start">
           <div className="flex-1">
              <span className="font-bold block mb-1">Note:</span>
              <div className="border border-gray-300 rounded p-2 h-16 w-full text-gray-400 italic">
                {pr.note || 'No additional notes provided for this requisition.'}
              </div>
           </div>
           <div className="w-24 h-24 border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
              <span className="text-xl">+</span>
              <span className="text-[8px] font-bold">Upload</span>
           </div>
        </div>
      </div>

      {/* Signature Lines */}
      <div className="grid grid-cols-4 gap-4 mt-12 mb-8">
        <div className="text-center border-t border-black pt-1">
          <p className="font-bold">Prepared By</p>
          <p className="text-[8px] text-gray-500">{pr.reqBy}</p>
        </div>
        <div className="text-center border-t border-black pt-1">
          <p className="font-bold">Checked By</p>
          <p className="text-[8px] text-gray-500 opacity-0">Placeholder</p>
        </div>
        <div className="text-center border-t border-black pt-1">
          <p className="font-bold">Confirmed By</p>
          <p className="text-[8px] text-gray-500 opacity-0">Placeholder</p>
        </div>
        <div className="text-center border-t border-black pt-1">
          <p className="font-bold">Approved By</p>
          <p className="text-[8px] text-gray-500 opacity-0">Placeholder</p>
        </div>
      </div>

      {/* Justification Table */}
      <div className="mt-8">
        <h3 className="font-bold mb-2 text-center uppercase tracking-tight">Justification of Purchase Requisition</h3>
        <table className="w-full border-collapse border border-black text-[8px]">
          <thead>
            <tr className="bg-white font-bold">
              <th className="border border-black py-1 px-1 text-center">Item Name</th>
              <th className="border border-black py-1 px-1 text-center w-16">Last 6M Used</th>
              <th className="border border-black py-1 px-1 text-center w-24">Consumption Rate</th>
              <th className="border border-black py-1 px-1 text-center w-20">Stock in Hand [A]</th>
              <th className="border border-black py-1 px-1 text-center w-20">Stock in Store [B]</th>
              <th className="border border-black py-1 px-1 text-center w-20">Ordered Qty [C]</th>
              <th className="border border-black py-1 px-1 text-center w-24">Total [D=A+B+C]</th>
              <th className="border border-black py-1 px-1 text-center">Purpose</th>
              <th className="border border-black py-1 px-1 text-center w-24">Approved Design [Y/N]</th>
            </tr>
          </thead>
          <tbody>
            {itemsList.map((item: any, idx: number) => (
              <tr key={idx}>
                <td className="border border-black py-1 px-1 font-bold">{item.name}</td>
                <td className="border border-black py-1 px-1 text-center">{(Math.random() * 800).toFixed(0)}</td>
                <td className="border border-black py-1 px-1 text-center"></td>
                <td className="border border-black py-1 px-1 text-center">0</td>
                <td className="border border-black py-1 px-1 text-center">{item.onHand || '0'}</td>
                <td className="border border-black py-1 px-1 text-center">0</td>
                <td className="border border-black py-1 px-1 text-center font-bold">{(Number(item.onHand || 0)).toFixed(2)}</td>
                <td className="border border-black py-1 px-1"></td>
                <td className="border border-black py-1 px-1"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Print Page Footer */}
      <div className="mt-8 pt-4 border-t border-gray-100 flex justify-between text-[7px] text-gray-400 font-bold uppercase tracking-widest">
        <span>ALIGN ERP - GENERATED DOCUMENT</span>
        <span>CONFIDENTIAL - FAIR TECHNOLOGY LIMITED</span>
      </div>
    </div>
  );
};

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
    const printSection = document.getElementById('print-section');
    if (!printSection) {
      console.error("Print section container not found in document.");
      return;
    }

    // Clear previous print content
    printSection.innerHTML = '';
    
    // Create root and render Template
    const root = createRoot(printSection);
    root.render(<PrintTemplate pr={pr} />);

    // Short delay to ensure React finishes rendering before print dialog
    setTimeout(() => {
      window.print();
    }, 600);
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