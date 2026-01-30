import React, { useState } from 'react';
import { Home, FileSpreadsheet, Search, List, Package, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import * as XLSX from 'xlsx';

interface InventoryItem {
  id: string;
  code: string;
  name: string;
  uom: string;
  receivedQty: number;
  issuedQty: number;
  onHandQty: number;
  safetyStock: number;
  itemType: string;
  itemDetails: string;
}

const Inventory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Mock data matching the screenshot
  const [inventory] = useState<InventoryItem[]>([
    { id: '1', code: '3100001439', name: 'TOUCH UP CUP', uom: 'PC', receivedQty: 6, issuedQty: 0, onHandQty: 6, safetyStock: 0, itemType: 'Consumables', itemDetails: 'Paint I' },
    { id: '2', code: '3100001447', name: 'PTFE DIAPHRAGM REPAIR KIT SET (245065)', uom: 'SET', receivedQty: 8, issuedQty: 6, onHandQty: 2, safetyStock: 0, itemType: 'Spare Parts', itemDetails: 'Mainte Item' },
    { id: '3', code: '3000011180', name: 'PADDLE AIR SUPPLY CONTROL JOINT5 OUTLET', uom: 'SET', receivedQty: 4, issuedQty: 0, onHandQty: 4, safetyStock: 0, itemType: 'Spare Parts', itemDetails: 'Mainte Item' },
    { id: '4', code: '3000011178', name: 'VACUUM PAD SET', uom: 'SET', receivedQty: 8, issuedQty: 4, onHandQty: 4, safetyStock: 0, itemType: 'Spare Parts', itemDetails: 'Mainte Item' },
    { id: '5', code: '3400000631', name: 'DRUM(200 LTR)', uom: 'PC', receivedQty: 5, issuedQty: 0, onHandQty: 5, safetyStock: 0, itemType: 'Stationary', itemDetails: 'Admir' },
    { id: '6', code: '3400000625', name: 'TIN CUTTER 12 INCH', uom: 'PC', receivedQty: 3, issuedQty: 0, onHandQty: 3, safetyStock: 0, itemType: 'Tools & Equipment', itemDetails: 'Mainte Item' },
    { id: '7', code: '3400000621', name: 'WOOD CUTTING DISC, 4 INCH', uom: 'PC', receivedQty: 4, issuedQty: 0, onHandQty: 4, safetyStock: 0, itemType: 'Spare Parts', itemDetails: 'Mainte Item' },
    { id: '8', code: '3400000624', name: 'RATCHAT SPANNER, 17 MM', uom: 'PC', receivedQty: 1, issuedQty: 0, onHandQty: 1, safetyStock: 0, itemType: 'Tools & Equipment', itemDetails: 'Mainte Item' },
    { id: '9', code: '3400000620', name: 'RECHARGEABLE IMPACT GUN', uom: 'SET', receivedQty: 1, issuedQty: 0, onHandQty: 1, safetyStock: 0, itemType: 'Tools & Equipment', itemDetails: 'Mainte Item' },
    { id: '10', code: '3400000609', name: 'TOREX BIT, T40', uom: 'PC', receivedQty: 5, issuedQty: 0, onHandQty: 5, safetyStock: 4, itemType: 'Spare Parts', itemDetails: 'Mainte Item' },
  ]);

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(inventory);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
    XLSX.writeFile(workbook, `Inventory_Status_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Breadcrumb Section */}
      <div className="flex items-center space-x-2 text-[11px] font-bold text-[#2d808e] uppercase tracking-wider">
        <Home size={14} className="text-gray-400" />
        <span className="text-gray-400">/</span>
        <span>INVENTORY</span>
      </div>

      {/* Header Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-1.5 bg-[#2d808e] text-white px-4 py-1.5 rounded text-[12px] font-bold shadow-sm">
            <span>Stock</span>
          </button>
          <button className="flex items-center space-x-1.5 border border-[#2d808e] bg-white px-4 py-1.5 rounded text-[12px] font-bold text-[#2d808e] hover:bg-gray-50 transition-all shadow-sm">
            <List size={14} />
            <span>Listview</span>
          </button>
          <button 
            onClick={handleExportExcel}
            className="flex items-center space-x-1.5 border border-gray-300 bg-white px-4 py-1.5 rounded text-[12px] font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
          >
            <FileSpreadsheet size={14} className="text-gray-500" />
            <span>Excel</span>
          </button>
        </div>

        <div className="flex items-center">
          <div className="relative flex">
            <input 
              type="text" 
              placeholder="Search by Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 px-4 py-1.5 border border-gray-200 rounded-l outline-none text-xs text-gray-600 focus:border-[#2d808e]"
            />
            <button className="bg-[#2d808e] text-white px-3 rounded-r flex items-center justify-center hover:bg-[#256b78]">
              <Search size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead className="bg-[#fcfcfc]">
              <tr className="text-[12px] font-bold text-gray-800 border-b border-gray-100">
                <th className="px-6 py-4 text-left w-32">Code</th>
                <th className="px-6 py-4 text-left">Name</th>
                <th className="px-6 py-4 text-center w-20">UOM</th>
                <th className="px-6 py-4 text-center w-32">Received Qty</th>
                <th className="px-6 py-4 text-center w-32">Issued Qty</th>
                <th className="px-6 py-4 text-center w-32">On-Hand Qty</th>
                <th className="px-6 py-4 text-center w-32">Safety Stock</th>
                <th className="px-6 py-4 text-left w-40">Item Type</th>
                <th className="px-6 py-4 text-left w-40">Item Details</th>
              </tr>
            </thead>
            <tbody className="text-[12px] text-gray-700 font-medium">
              {inventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                  <td className="px-6 py-4 text-left">{item.code}</td>
                  <td className="px-6 py-4 font-bold uppercase">{item.name}</td>
                  <td className="px-6 py-4 text-center">{item.uom}</td>
                  <td className="px-6 py-4 text-center">{item.receivedQty}</td>
                  <td className="px-6 py-4 text-center">{item.issuedQty}</td>
                  <td className="px-6 py-4 text-center font-bold text-[#2d808e]">{item.onHandQty}</td>
                  <td className="px-6 py-4 text-center">{item.safetyStock}</td>
                  <td className="px-6 py-4 text-left whitespace-nowrap">{item.itemType}</td>
                  <td className="px-6 py-4 text-left whitespace-nowrap">{item.itemDetails}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer Section */}
      <div className="flex items-center justify-end space-x-4 pt-2 pb-6">
        <div className="flex items-center space-x-1">
          <button className="p-1.5 text-gray-300 hover:text-gray-500"><ChevronLeft size={16} /></button>
          {[1, 2, 3, 4, 5].map(page => (
            <button 
              key={page} 
              onClick={() => setCurrentPage(page)}
              className={`w-7 h-7 flex items-center justify-center text-xs font-bold rounded ${currentPage === page ? 'bg-white border border-[#2d808e] text-[#2d808e]' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              {page}
            </button>
          ))}
          <span className="text-gray-400 px-1">...</span>
          <button className="w-7 h-7 flex items-center justify-center text-xs font-bold text-gray-500 hover:bg-gray-50 rounded">124</button>
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

export default Inventory;