import React, { useState } from 'react';
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
  Eye
} from 'lucide-react';
import * as XLSX from 'xlsx';
import NewPurchaseOrder from './NewPurchaseOrder';
import CreatePODetails from './CreatePODetails';
import POPrintTemplate from './POPrintTemplate';

interface PurchaseOrderProps {
  orders: any[];
}

const PurchaseOrder: React.FC<PurchaseOrderProps> = ({ orders }) => {
  const [view, setView] = useState<'list' | 'select-items' | 'create-details'>('list');
  const [selectedPRItems, setSelectedPRItems] = useState<any[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(orders);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchase Orders");
    XLSX.writeFile(workbook, "Purchase_Orders.xlsx");
  };

  const handlePrint = (po: any) => {
    const printSection = document.getElementById('print-section');
    if (!printSection) return;
    
    // Clear previous print content
    printSection.innerHTML = '';
    
    // Render the template to the hidden print section
    const root = createRoot(printSection);
    root.render(<POPrintTemplate po={po} />);
    
    // Trigger print after a short delay for rendering
    setTimeout(() => {
      window.print();
    }, 600);
  };

  const handleSelectItemsSubmit = (selectedItems: any[]) => {
    const mappedItems = selectedItems.map(item => ({
      id: item.id,
      prNo: item.prNo,
      sku: item.sku,
      name: item.name,
      specification: item.specification,
      reqQty: item.reqQty,
      poPending: item.reqQty,
      poQty: item.reqQty,
      poPrice: 0,
      vatPercent: '10',
      remarks: ''
    }));
    
    setSelectedPRItems(mappedItems);
    setView('create-details');
  };

  const handleFinalPOSubmit = (finalData: any) => {
    console.log("Final Purchase Order Created:", finalData);
    alert("Purchase Order created successfully!");
    setView('list');
    setSelectedPRItems([]);
  };

  if (view === 'select-items') {
    return <NewPurchaseOrder onBack={() => setView('list')} onSubmit={handleSelectItemsSubmit} />;
  }

  if (view === 'create-details') {
    return <CreatePODetails items={selectedPRItems} onCancel={() => setView('select-items')} onSubmit={handleFinalPOSubmit} />;
  }

  return (
    <div className="flex flex-col space-y-4">
      {/* Top Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-[11px] font-bold text-[#2d808e] uppercase tracking-wider">
          <Home size={14} className="text-gray-400" />
          <span className="text-gray-400">/</span>
          <span>Purchase-Order</span>
        </div>
        <button 
          onClick={() => setView('select-items')}
          className="bg-[#2d808e] text-white px-6 py-1.5 rounded text-[13px] font-bold shadow-sm hover:bg-[#256b78] transition-all active:scale-[0.98]"
        >
          Make Purchase Order
        </button>
      </div>

      {/* Action Buttons Bar */}
      <div className="flex justify-end space-x-2">
        <button 
          onClick={handleExportExcel}
          className="flex items-center space-x-1.5 border border-gray-300 bg-white px-4 py-1.5 rounded text-[12px] font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
        >
          <FileSpreadsheet size={14} className="text-green-600" />
          <span>Excel</span>
        </button>
        <button className="flex items-center space-x-1.5 border border-gray-300 bg-white px-4 py-1.5 rounded text-[12px] font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
          <History size={14} className="text-gray-500" />
          <span>Logs</span>
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead className="bg-[#fafbfc]">
              <tr className="text-[10px] font-bold text-gray-700 uppercase tracking-tight border-b border-gray-100">
                <th className="px-3 py-4 text-center w-12">SL</th>
                <th className="px-3 py-4 text-center relative">
                  PO No
                  <Filter size={10} className="inline-block ml-1 text-gray-300" />
                </th>
                <th className="px-3 py-4 text-center relative">
                  PR No
                  <Filter size={10} className="inline-block ml-1 text-gray-300" />
                </th>
                <th className="px-3 py-4 text-center relative">
                  SKU
                  <Filter size={10} className="inline-block ml-1 text-gray-300" />
                </th>
                <th className="px-3 py-4 text-left">Name</th>
                <th className="px-3 py-4 text-center">PO Price</th>
                <th className="px-3 py-4 text-center">PO Qty</th>
                <th className="px-3 py-4 text-center">PO Value</th>
                <th className="px-3 py-4 text-center">GRN Qty</th>
                <th className="px-3 py-4 text-center">Req. By</th>
                <th className="px-3 py-4 text-center">Supplier</th>
                <th className="px-3 py-4 text-center w-24">Action</th>
              </tr>
            </thead>
            <tbody className="text-[10px] text-gray-600 font-medium">
              {orders.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                  <td className="px-3 py-4 text-center">{index + 1}</td>
                  <td className="px-3 py-4 text-center">{item.poNo}</td>
                  <td className="px-3 py-4 text-center">{item.prNo}</td>
                  <td className="px-3 py-4 text-center">{item.sku}</td>
                  <td className="px-3 py-4 font-bold uppercase">{item.name}</td>
                  <td className="px-3 py-4 text-center">{item.price}</td>
                  <td className="px-3 py-4 text-center font-bold text-gray-800">{item.qty}</td>
                  <td className="px-3 py-4 text-center">{Number(item.value).toFixed(2)}</td>
                  <td className="px-3 py-4 text-center">{item.grnQty}</td>
                  <td className="px-3 py-4 text-center whitespace-nowrap">{item.reqBy}</td>
                  <td className="px-3 py-4 text-center uppercase text-[9px]">{item.supplier}</td>
                  <td className="px-3 py-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button 
                        onClick={() => handlePrint(item)}
                        title="Print Purchase Order"
                        className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 border border-gray-200 rounded transition-all"
                      >
                        <Printer size={12} />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 border border-gray-200 rounded transition-all">
                        <Edit2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer Section */}
      <div className="flex items-center justify-end space-x-4 pt-2 pb-6">
        <div className="flex items-center space-x-1">
          <button className="p-1.5 text-gray-300 cursor-not-allowed"><ChevronLeft size={16} /></button>
          <button className="w-7 h-7 flex items-center justify-center bg-[#2d808e] text-white text-xs font-bold rounded">1</button>
          <button className="p-1.5 text-gray-400 hover:text-[#2d808e]"><ChevronRight size={16} /></button>
        </div>
        
        <div className="flex items-center space-x-2 border border-gray-200 rounded bg-white px-2 py-1">
          <select 
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="text-[11px] font-bold text-gray-600 outline-none appearance-none pr-4 bg-transparent cursor-pointer"
          >
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>
          <ChevronDown size={12} className="text-gray-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrder;