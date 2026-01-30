import React, { useState } from 'react';
import { Home, FileSpreadsheet, Filter, Inbox, ChevronDown, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';

const MOReport: React.FC = () => {
  const [dateStart, setDateStart] = useState('2026-01-30');
  const [dateEnd, setDateEnd] = useState('2026-01-30');
  const [itemsFilter, setItemsFilter] = useState('Items');
  const [statusFilter, setStatusFilter] = useState('All');

  // Added mock data to demonstrate the Status column and updating logic
  const [reportData] = useState<any[]>([
    {
      sl: 1,
      date: '2026-01-30',
      moRef: 'REF-12386',
      moNo: '100230',
      sku: '3100000121',
      name: 'AC GAS, R134A',
      uom: 'CYL',
      unitPrice: 16326.19,
      moQty: 1,
      moValue: 16326.19,
      issueQty: 1,
      issueValue: 16326.19,
      status: 'Completed',
      createdBy: 'Md. Rokun Zzaman',
      updatedBy: 'Md. Rokun Zzaman'
    },
    {
      sl: 2,
      date: '2026-01-29',
      moRef: 'REF-13177',
      moNo: '100221',
      sku: '3300000032',
      name: 'TOILET TISSUE',
      uom: 'PACK',
      unitPrice: 145.00,
      moQty: 48,
      moValue: 6960.00,
      issueQty: 0,
      issueValue: 0.00,
      status: 'Pending',
      createdBy: 'Rakibul Hassan',
      updatedBy: 'Admin'
    }
  ]);

  const handleExportExcel = () => {
    try {
      const exportData = reportData.length > 0 ? reportData : [{ Message: "No data found" }];
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "MO Report");
      XLSX.writeFile(workbook, `MO_Report_${dateStart}.xlsx`);
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center space-x-2 text-[10px] font-bold text-[#2d808e] uppercase tracking-wider">
        <Home size={12} className="text-[#2d808e]" />
        <span className="text-gray-300">/</span>
        <span className="text-[#2d808e] cursor-pointer">MO-REPORT</span>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 bg-transparent py-1">
        <div className="relative">
          <select 
            value={itemsFilter}
            onChange={(e) => setItemsFilter(e.target.value)}
            className="appearance-none bg-white border border-gray-200 rounded px-3 py-1.5 text-[11px] text-gray-400 font-medium outline-none focus:border-[#2d808e] transition-all w-[240px]"
          >
            <option value="Items">Items</option>
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
        </div>

        <div className="flex items-center space-x-1">
           <div className="relative">
              <input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} className="appearance-none bg-white border border-gray-200 rounded px-3 py-1.5 text-[11px] text-gray-600 font-medium outline-none focus:border-[#2d808e] w-[140px]" />
           </div>
           <div className="relative">
              <input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} className="appearance-none bg-white border border-gray-200 rounded px-3 py-1.5 text-[11px] text-gray-600 font-medium outline-none focus:border-[#2d808e] w-[140px]" />
           </div>
        </div>

        <div className="relative">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="appearance-none bg-white border border-gray-200 rounded px-3 py-1.5 text-[11px] text-gray-600 font-medium outline-none focus:border-[#2d808e] w-[140px]">
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        <button className="bg-[#2d808e] text-white px-6 py-1.5 rounded text-[11px] font-bold shadow-sm hover:bg-[#256b78] transition-all">
          Find
        </button>
      </div>

      <div className="flex justify-end">
        <button onClick={handleExportExcel} className="flex items-center space-x-1.5 border border-[#2d808e] bg-white px-3 py-1.5 rounded text-[11px] font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
          <FileSpreadsheet size={14} className="text-gray-900" />
          <span>Excel</span>
        </button>
      </div>

      <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1800px]">
            <thead className="bg-white">
              <tr className="text-[10px] font-bold text-gray-800 border-b border-gray-100 uppercase">
                <th className="px-2 py-4 text-center w-12 border-r border-gray-50">SL</th>
                <th className="px-2 py-4 border-r border-gray-50">Date</th>
                <th className="px-2 py-4 border-r border-gray-50 relative">MO Ref<Filter size={10} className="inline-block ml-1 text-gray-200" /></th>
                <th className="px-2 py-4 border-r border-gray-50 relative">MO No<Filter size={10} className="inline-block ml-1 text-gray-200" /></th>
                <th className="px-2 py-4 border-r border-gray-50 relative">SKU<Filter size={10} className="inline-block ml-1 text-gray-200" /></th>
                <th className="px-2 py-4 border-r border-gray-50 relative">Name<Filter size={10} className="inline-block ml-1 text-gray-200" /></th>
                <th className="px-2 py-4 border-r border-gray-50">UOM</th>
                <th className="px-2 py-4 border-r border-gray-50 text-right">Unit Price</th>
                <th className="px-2 py-4 border-r border-gray-50 text-center">MO Qty</th>
                <th className="px-2 py-4 border-r border-gray-50 text-right">MO Value</th>
                <th className="px-2 py-4 border-r border-gray-50 text-center">Issue Qty</th>
                <th className="px-2 py-4 border-r border-gray-50 text-right">Issue Value</th>
                <th className="px-2 py-4 border-r border-gray-50 text-center">Status</th>
                <th className="px-2 py-4 border-r border-gray-50 text-center">Created By</th>
                <th className="px-2 py-4 text-center">Updated By</th>
              </tr>
            </thead>
            <tbody>
              {reportData.length > 0 ? (
                reportData.map((row) => (
                  <tr key={row.sl} className="border-b border-gray-50 text-[10px] hover:bg-gray-50/50">
                    <td className="px-2 py-3 text-center border-r border-gray-50">{row.sl}</td>
                    <td className="px-2 py-3 border-r border-gray-50">{row.date}</td>
                    <td className="px-2 py-3 border-r border-gray-50">{row.moRef}</td>
                    <td className="px-2 py-3 border-r border-gray-50 font-bold text-blue-500">{row.moNo}</td>
                    <td className="px-2 py-3 border-r border-gray-50">{row.sku}</td>
                    <td className="px-2 py-3 border-r border-gray-50 font-bold uppercase">{row.name}</td>
                    <td className="px-2 py-3 border-r border-gray-50 text-center uppercase">{row.uom}</td>
                    <td className="px-2 py-3 border-r border-gray-50 text-right">{row.unitPrice.toFixed(2)}</td>
                    <td className="px-2 py-3 border-r border-gray-50 text-center font-bold">{row.moQty}</td>
                    <td className="px-2 py-3 border-r border-gray-50 text-right font-bold">{row.moValue.toFixed(2)}</td>
                    <td className="px-2 py-3 border-r border-gray-50 text-center font-bold text-blue-600">{row.issueQty}</td>
                    <td className="px-2 py-3 border-r border-gray-50 text-right font-bold text-blue-600">{row.issueValue.toFixed(2)}</td>
                    <td className="px-2 py-3 border-r border-gray-50 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${getStatusStyle(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-2 py-3 border-r border-gray-50 text-center">{row.createdBy}</td>
                    <td className="px-2 py-3 text-center">{row.updatedBy}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={15} className="py-24">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <div className="bg-gray-50 p-4 rounded-full mb-3">
                        <Inbox size={48} strokeWidth={1} />
                      </div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-200">No data</p>
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

export default MOReport;