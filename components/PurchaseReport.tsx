import React, { useState } from 'react';
import { Home, FileSpreadsheet, Search, Inbox, Filter, ChevronDown, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';

const PurchaseReport: React.FC = () => {
  const [filterDateStart, setFilterDateStart] = useState('2026-01-30');
  const [filterDateEnd, setFilterDateEnd] = useState('2026-01-30');
  const [itemType, setItemType] = useState('Items');
  const [tnxType, setTnxType] = useState('All');
  const [status, setStatus] = useState('All');
  const [docRef, setDocRef] = useState('');
  
  // Mock data would go here if needed, but the screenshot shows "No data"
  const [reportData] = useState<any[]>([]);

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(reportData.length > 0 ? reportData : [{ Message: "No data found" }]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchase Report");
    XLSX.writeFile(workbook, `Purchase_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Top Header Section */}
      <div className="flex items-center justify-between">
        {/* Breadcrumb Section */}
        <div className="flex items-center space-x-2 text-[10px] font-bold text-[#2d808e] uppercase tracking-wider">
          <Home size={12} className="text-gray-400" />
          <span className="text-gray-300">/</span>
          <span className="text-[#2d808e]">PURCHASE-REPORT</span>
        </div>

        {/* Filter Bar Section - Aligned to the right */}
        <div className="flex items-center gap-2">
          {/* Items Dropdown */}
          <div className="relative min-w-[140px]">
            <select 
              value={itemType}
              onChange={(e) => setItemType(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 rounded px-3 py-1.5 text-[11px] text-gray-400 font-medium outline-none focus:border-[#2d808e] transition-all"
            >
              <option>Items</option>
              <option>Consumables</option>
              <option>Assets</option>
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Date Start */}
          <div className="relative">
            <input 
              type="date" 
              value={filterDateStart}
              onChange={(e) => setFilterDateStart(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded px-3 py-1.5 text-[11px] text-gray-600 font-medium outline-none focus:border-[#2d808e] transition-all pr-8 w-[130px]"
            />
            <Calendar size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Date End */}
          <div className="relative">
            <input 
              type="date" 
              value={filterDateEnd}
              onChange={(e) => setFilterDateEnd(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded px-3 py-1.5 text-[11px] text-gray-600 font-medium outline-none focus:border-[#2d808e] transition-all pr-8 w-[130px]"
            />
            <Calendar size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Tnx Type Dropdown */}
          <div className="relative min-w-[80px]">
            <select 
              value={tnxType}
              onChange={(e) => setTnxType(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 rounded px-3 py-1.5 text-[11px] text-gray-600 font-medium outline-none focus:border-[#2d808e] transition-all"
            >
              <option>All</option>
              <option>Local</option>
              <option>Import</option>
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Status Dropdown */}
          <div className="relative min-w-[80px]">
            <select 
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 rounded px-3 py-1.5 text-[11px] text-gray-600 font-medium outline-none focus:border-[#2d808e] transition-all"
            >
              <option>All</option>
              <option>Pending</option>
              <option>Completed</option>
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Ref Input */}
          <div className="relative">
            <input 
              type="text" 
              placeholder="PR/PO No."
              value={docRef}
              onChange={(e) => setDocRef(e.target.value)}
              className="bg-white border border-gray-200 rounded px-3 py-1.5 text-[11px] text-gray-600 font-medium outline-none focus:border-[#2d808e] transition-all w-32"
            />
          </div>

          {/* Find Button */}
          <button className="bg-[#2d808e] text-white px-5 py-1.5 rounded text-[11px] font-bold shadow-sm hover:bg-[#256b78] transition-all active:scale-[0.98]">
            Find
          </button>
        </div>
      </div>

      {/* Export Button Section */}
      <div className="flex justify-end">
        <button 
          onClick={handleExportExcel}
          className="flex items-center space-x-1.5 border border-[#2d808e] bg-white px-3 py-1 rounded text-[10px] font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
        >
          <FileSpreadsheet size={13} className="text-[#2d808e]" />
          <span>Excel</span>
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1400px]">
            <thead className="bg-[#fcfcfc]">
              <tr className="text-[10px] font-bold text-gray-800 border-b border-gray-100">
                <th className="px-4 py-4 text-center w-12 border-r border-gray-50">SL</th>
                <th className="px-4 py-4 text-left w-32 border-r border-gray-50">Tnx. Date</th>
                <th className="px-4 py-4 text-left w-32 border-r border-gray-50 relative group">
                  Tnx. Type
                  <Filter size={10} className="inline-block ml-1 text-gray-200" />
                </th>
                <th className="px-4 py-4 text-left w-32 border-r border-gray-50 relative group">
                  Doc.Ref
                  <Filter size={10} className="inline-block ml-1 text-gray-200" />
                </th>
                <th className="px-4 py-4 text-left w-32 border-r border-gray-50 relative group">
                  SKU
                  <Filter size={10} className="inline-block ml-1 text-gray-200" />
                </th>
                <th className="px-4 py-4 text-left w-48 border-r border-gray-50 relative group">
                  Name
                  <Filter size={10} className="inline-block ml-1 text-gray-200" />
                </th>
                <th className="px-4 py-4 text-center w-24 border-r border-gray-50">UOM</th>
                <th className="px-4 py-4 text-right w-32 border-r border-gray-50">Unit Price</th>
                <th className="px-4 py-4 text-center w-20 border-r border-gray-50">Qty</th>
                <th className="px-4 py-4 text-right w-32 border-r border-gray-50">Trnx. Value</th>
                <th className="px-4 py-4 text-center w-24 border-r border-gray-50">Status</th>
                <th className="px-4 py-4 text-center w-32 border-r border-gray-50">Created By</th>
                <th className="px-4 py-4 text-center w-32">Updated By</th>
              </tr>
            </thead>
            <tbody>
              {reportData.length > 0 ? (
                reportData.map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-50 text-[10px] hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-center">{idx + 1}</td>
                    {/* Data mapping here */}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={13} className="py-24">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <div className="bg-gray-50 p-4 rounded-full mb-3">
                        <Inbox size={48} strokeWidth={1} />
                      </div>
                      <p className="text-[12px] font-medium">No data</p>
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

export default PurchaseReport;