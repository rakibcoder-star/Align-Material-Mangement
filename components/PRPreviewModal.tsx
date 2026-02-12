import React, { useState, useEffect } from 'react';
import { X, Printer, FileSpreadsheet, FileText, CheckCircle2, Edit2 } from 'lucide-react';
import PRPrintTemplate from './PRPrintTemplate';
import * as XLSX from 'xlsx';

interface PRPreviewModalProps {
  pr: any;
  onClose: () => void;
}

const PRPreviewModal: React.FC<PRPreviewModalProps> = ({ pr, onClose }) => {
  const [justificationData, setJustificationData] = useState<any[]>([]);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    // Initialize justification data from PR items
    if (pr.items) {
      setJustificationData(pr.items.map((item: any) => ({
        name: item.name || 'N/A',
        last6m: item.last6m || (Math.floor(Math.random() * 2)), // Mock or fetch if available
        consumptionRate: item.consumptionRate || '',
        stockHand: item.onHand || 0,
        stockStore: 0,
        orderedQty: 0,
        purpose: '',
        approvedDesign: ''
      })));
    }
  }, [pr]);

  const handleJustificationChange = (index: number, field: string, value: any) => {
    const updated = [...justificationData];
    updated[index][field] = value;
    setJustificationData(updated);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    const mainItems = pr.items.map((item: any, idx: number) => ({
      SL: idx + 1,
      'Part Code': item.sku || 'N/A',
      Name: item.name || 'N/A',
      Spec: item.specification || '',
      Brand: item.brand || '',
      UOM: item.uom || 'SET',
      'Unit Price (BDT)': item.unitPrice || 0,
      'Req Qty': item.reqQty || 0,
      'Value (BDT)': Number(item.reqQty || 0) * Number(item.unitPrice || 0),
      'On Hand': item.onHand || 0,
      'Remarks': item.remarks || ''
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(mainItems);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchase Requisition");
    
    // Add Justification Sheet
    const justificationExport = justificationData.map(row => ({
      'Item Name': row.name,
      'Last 6M Used': row.last6m,
      'Consumption Rate': row.consumptionRate,
      'Stock Hand [A]': row.stockHand,
      'Stock Store [B]': row.stockStore,
      'Ordered Qty [C]': row.orderedQty,
      'Total [D=A+B+C]': Number(row.stockHand) + Number(row.stockStore) + Number(row.orderedQty),
      'Purpose': row.purpose,
      'Approved Design (Y/N)': row.approvedDesign
    }));
    const worksheet2 = XLSX.utils.json_to_sheet(justificationExport);
    XLSX.utils.book_append_sheet(workbook, worksheet2, "Justification");

    XLSX.writeFile(workbook, `PR_${pr.pr_no}.xlsx`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto no-print">
      <div className="bg-[#f8f9fa] w-full max-w-[1300px] rounded-2xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in-95 duration-300 flex flex-col my-auto max-h-[96vh]">
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-xl transition-colors">
              <X size={20} />
            </button>
            <div className="flex flex-col">
              <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Document Preview</h2>
              <p className="text-sm font-black text-gray-800 tracking-tight uppercase">PR NO: {pr.pr_no}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
             <button className="p-2.5 text-blue-500 hover:bg-blue-50 border border-blue-100 rounded-xl transition-all" title="Edit Data">
               <Edit2 size={18} />
             </button>
             <button onClick={handlePrint} className="p-2.5 text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all" title="Print to PDF">
               <Printer size={18} />
             </button>
             <button onClick={handleExportExcel} className="p-2.5 text-green-600 hover:bg-green-50 border border-green-100 rounded-xl transition-all" title="Export Excel">
               <FileSpreadsheet size={18} />
             </button>
             <button onClick={handlePrint} className="p-2.5 text-red-600 hover:bg-red-50 border border-red-100 rounded-xl transition-all" title="Download PDF">
               <FileText size={18} />
             </button>
             <div className="h-8 w-px bg-gray-200 mx-2"></div>
             <button 
               onClick={onClose}
               className="bg-[#2d808e] text-white px-8 py-2.5 rounded-xl text-xs font-black shadow-xl shadow-cyan-900/10 hover:bg-[#256b78] flex items-center space-x-3 uppercase tracking-widest active:scale-95 transition-all"
             >
                <CheckCircle2 size={18} />
                <span>Confirmed</span>
             </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 scrollbar-thin bg-gray-100/50">
           <div className="bg-white shadow-2xl border border-gray-200 rounded-sm ring-1 ring-black/5">
             <PRPrintTemplate 
                pr={pr} 
                justificationData={justificationData}
                onJustificationChange={handleJustificationChange}
                images={images}
                onImagesChange={setImages}
             />
           </div>
        </div>
      </div>
    </div>
  );
};

export default PRPreviewModal;