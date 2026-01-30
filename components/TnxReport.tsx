import React, { useState } from 'react';
import { Home, FileSpreadsheet, Filter, Inbox, ChevronDown, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';

const TnxReport: React.FC = () => {
  const [dateStart, setDateStart] = useState('2026-01-30');
  const [dateEnd, setDateEnd] = useState('2026-01-30');
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('All');

  const handleExportExcel = () => {
    // Generate dummy sheet for export
    const worksheet = XLSX.utils.json_to_sheet([{ Message: "No transaction data found for the selected period." }]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tnx Report");
    XLSX.writeFile(workbook, `Tnx_Report_${dateStart}.xlsx`);
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Breadcrumbs matching image */}
      <div className="flex items-center space-x-2 text-[10px] font-bold text-[#2d808e] uppercase tracking-wider">
        <Home size={12} className="text-[#2d808e]" />
        <span className="text-gray-300">/</span>
        <span className="text-[#2d808e] cursor-pointer">TNX-REPORT</span>
      </div>

      {/* Filter Header Section - Compact Right Aligned */}
      <div className="flex flex-wrap items-center justify-end gap-2 bg-transparent py-1">
        {/* Name Dropdown */}
        <div className="relative">
          <select 
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            className="appearance-none bg-white border border-gray-200 rounded px-3 py-1.5 text-[11px] text-gray-400 font-medium outline-none focus:border-[#2d808e] transition-all w-[220px]"
          >
            <option value="">name</option>
            <option value="item1">Item 1</option>
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
        </div>

        {/* Date Pickers */}
        <div className="flex items-center space-x-1">
           <div className="relative">
              <input 
                type="date" 
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded px-3 py-1.5 text-[11px] text-gray-600 font-medium outline-none focus:border-[#2d808e] transition-all pr-8 w-[140px]"
              />
              <Calendar size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
           </div>
           <div className="relative">
              <input 
                type="date" 
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded px-3 py-1.5 text-[11px] text-gray-600 font-medium outline-none focus:border-[#2d808e] transition-all pr-8 w-[140px]"
              />
              <Calendar size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
           </div>
        </div>

        {/* Category Dropdown */}
        <div className="relative">
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="appearance-none bg-white border border-gray-200 rounded px-3 py-1.5 text-[11px] text-gray-600 font-medium outline-none focus:border-[#2d808e] transition-all w-[120px]"
          >
            <option>All</option>
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        {/* Find Button */}
        <button className="bg-[#2d808e] text-white px-6 py-1.5 rounded text-[11px] font-bold shadow-sm hover:bg-[#256b78] transition-all active:scale-[0.98]">
          Find
        </button>
      </div>

      {/* Action Row - Excel Button Aligned Right */}
      <div className="flex justify-end">
        <button 
          onClick={handleExportExcel}
          className="flex items-center space-x-1.5 border border-[#2d808e] bg-white px-3 py-1.5 rounded text-[11px] font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
        >
          <FileSpreadsheet size={14} className="text-gray-900" />
          <span>Excel</span>
        </button>
      </div>

      {/* Table Section - Exact 17 Columns with Filter Icons */}
      <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[2400px]">
            <thead className="bg-white">
              <tr className="text-[10px] font-bold text-gray-800 border-b border-gray-100 uppercase">
                <th className="px-2 py-4 text-center w-12 border-r border-gray-50">SL</th>
                <th className="px-2 py-4 border-r border-gray-50">Tnx. Date</th>
                <th className="px-2 py-4 border-r border-gray-50">Doc. Date</th>
                <th className="px-2 py-4 border-r border-gray-50 relative">
                  Tnx. ref.
                  <Filter size={10} className="inline-block ml-1 text-gray-200" />
                </th>
                <th className="px-2 py-4 border-r border-gray-50 relative">
                  Tnx. Type
                  <Filter size={10} className="inline-block ml-1 text-gray-200" />
                </th>
                <th className="px-2 py-4 border-r border-gray-50 relative">
                  Doc. ref
                  <Filter size={10} className="inline-block ml-1 text-gray-200" />
                </th>
                <th className="px-2 py-4 border-r border-gray-50 relative">
                  Code
                  <Filter size={10} className="inline-block ml-1 text-gray-200" />
                </th>
                <th className="px-2 py-4 border-r border-gray-50 relative">
                  SKU
                  <Filter size={10} className="inline-block ml-1 text-gray-200" />
                </th>
                <th className="px-2 py-4 border-r border-gray-50 relative">
                  Name
                  <Filter size={10} className="inline-block ml-1 text-gray-200" />
                </th>
                <th className="px-2 py-4 border-r border-gray-50 relative">
                  UOM
                  <Filter size={10} className="inline-block ml-1 text-gray-200" />
                </th>
                <th className="px-2 py-4 border-r border-gray-50 text-right">Unit Price</th>
                <th className="px-2 py-4 border-r border-gray-50 text-center">Tnx. Qty</th>
                <th className="px-2 py-4 border-r border-gray-50 text-right">Tnx. Value</th>
                <th className="px-2 py-4 border-r border-gray-50 text-center">Location</th>
                <th className="px-2 py-4 border-r border-gray-50 text-left">Remarks</th>
                <th className="px-2 py-4 border-r border-gray-50 relative">
                  Used On
                  <Filter size={10} className="inline-block ml-1 text-gray-200" />
                </th>
                <th className="px-2 py-4 text-center">Tnx. By</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={17} className="py-24">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <div className="bg-gray-50 p-4 rounded-full mb-3">
                      <Inbox size={48} strokeWidth={1} />
                    </div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-gray-200">No data</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TnxReport;