import React, { useState } from 'react';
import { Home, FileSpreadsheet, Filter, Inbox, ChevronDown, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';

const TnxReport: React.FC = () => {
  const [dateStart, setDateStart] = useState('2026-01-30');
  const [dateEnd, setDateEnd] = useState('2026-01-30');
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('All');

  // Added mock data to demonstrate the Status column and updating logic
  const [reportData] = useState<any[]>([
    {
      sl: 1,
      tnxDate: '2026-01-30',
      docDate: '2026-01-30',
      tnxRef: 'TNX-88012',
      tnxType: 'Issue',
      docRef: 'MO-100230',
      code: '1000002191',
      sku: '3100000121',
      name: 'AC GAS, R134A',
      uom: 'CYL',
      unitPrice: 16326.19,
      tnxQty: 1,
      tnxValue: 16326.19,
      location: 'WH-01',
      remarks: 'Production issue',
      usedOn: 'Assembly',
      status: 'Completed',
      tnxBy: 'Md. Rokun Zzaman'
    },
    {
      sl: 2,
      tnxDate: '2026-01-29',
      docDate: '2026-01-29',
      tnxRef: 'TNX-88005',
      tnxType: 'Receive',
      docRef: 'GRN-200021',
      code: '1000001573',
      sku: '3300000035',
      name: 'A4 PAPER, DOUBLE A',
      uom: 'REAM',
      unitPrice: 499.50,
      tnxQty: 50,
      tnxValue: 24975.00,
      location: 'OFFICE-S1',
      remarks: 'Stock refill',
      usedOn: 'Admin',
      status: 'Pending',
      tnxBy: 'Sohel Rana'
    }
  ]);

  const handleExportExcel = () => {
    try {
      const exportData = reportData.length > 0 ? reportData : [{ Message: "No data found" }];
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Tnx Report");
      XLSX.writeFile(workbook, `Tnx_Report_${dateStart}.xlsx`);
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center space-x-2 text-[10px] font-bold text-[#2d808e] uppercase tracking-wider">
        <Home size={12} className="text-[#2d808e]" />
        <span className="text-gray-300">/</span>
        <span className="text-[#2d808e] cursor-pointer">TNX-REPORT</span>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 bg-transparent py-1">
        <div className="relative">
          <select 
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            className="appearance-none bg-white border border-gray-200 rounded px-3 py-1.5 text-[11px] text-gray-400 font-medium outline-none focus:border-[#2d808e] transition-all w-[220px]"
          >
            <option value="">name</option>
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
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="appearance-none bg-white border border-gray-200 rounded px-3 py-1.5 text-[11px] text-gray-600 font-medium outline-none focus:border-[#2d808e] w-[120px]">
            <option>All</option>
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
          <table className="w-full text-left border-collapse min-w-[2600px]">
            <thead className="bg-white">
              <tr className="text-[10px] font-bold text-gray-800 border-b border-gray-100 uppercase">
                <th className="px-2 py-4 text-center w-12 border-r border-gray-50">SL</th>
                <th className="px-2 py-4 border-r border-gray-50">Tnx. Date</th>
                <th className="px-2 py-4 border-r border-gray-50">Doc. Date</th>
                <th className="px-2 py-4 border-r border-gray-50 relative">Tnx. ref.<Filter size={10} className="inline-block ml-1 text-gray-200" /></th>
                <th className="px-2 py-4 border-r border-gray-50 relative">Tnx. Type<Filter size={10} className="inline-block ml-1 text-gray-200" /></th>
                <th className="px-2 py-4 border-r border-gray-50 relative">Doc. ref<Filter size={10} className="inline-block ml-1 text-gray-200" /></th>
                <th className="px-2 py-4 border-r border-gray-50 relative">Code<Filter size={10} className="inline-block ml-1 text-gray-200" /></th>
                <th className="px-2 py-4 border-r border-gray-50 relative">SKU<Filter size={10} className="inline-block ml-1 text-gray-200" /></th>
                <th className="px-2 py-4 border-r border-gray-50 relative">Name<Filter size={10} className="inline-block ml-1 text-gray-200" /></th>
                <th className="px-2 py-4 border-r border-gray-50 relative">UOM<Filter size={10} className="inline-block ml-1 text-gray-200" /></th>
                <th className="px-2 py-4 border-r border-gray-50 text-right">Unit Price</th>
                <th className="px-2 py-4 border-r border-gray-50 text-center">Tnx. Qty</th>
                <th className="px-2 py-4 border-r border-gray-50 text-right">Tnx. Value</th>
                <th className="px-2 py-4 border-r border-gray-50 text-center">Location</th>
                <th className="px-2 py-4 border-r border-gray-50 text-left">Remarks</th>
                <th className="px-2 py-4 border-r border-gray-50 relative">Used On<Filter size={10} className="inline-block ml-1 text-gray-200" /></th>
                <th className="px-2 py-4 border-r border-gray-50 text-center">Status</th>
                <th className="px-2 py-4 text-center">Tnx. By</th>
              </tr>
            </thead>
            <tbody>
              {reportData.length > 0 ? (
                reportData.map((row) => (
                  <tr key={row.sl} className="border-b border-gray-50 text-[10px] hover:bg-gray-50/50">
                    <td className="px-2 py-3 text-center border-r border-gray-50">{row.sl}</td>
                    <td className="px-2 py-3 border-r border-gray-50">{row.tnxDate}</td>
                    <td className="px-2 py-3 border-r border-gray-50">{row.docDate}</td>
                    <td className="px-2 py-3 border-r border-gray-50 font-bold text-blue-500">{row.tnxRef}</td>
                    <td className="px-2 py-3 border-r border-gray-50">{row.tnxType}</td>
                    <td className="px-2 py-3 border-r border-gray-50">{row.docRef}</td>
                    <td className="px-2 py-3 border-r border-gray-50">{row.code}</td>
                    <td className="px-2 py-3 border-r border-gray-50">{row.sku}</td>
                    <td className="px-2 py-3 border-r border-gray-50 font-bold uppercase">{row.name}</td>
                    <td className="px-2 py-3 border-r border-gray-50 text-center uppercase">{row.uom}</td>
                    <td className="px-2 py-3 border-r border-gray-50 text-right">{row.unitPrice.toFixed(2)}</td>
                    <td className="px-2 py-3 border-r border-gray-50 text-center font-bold">{row.tnxQty}</td>
                    <td className="px-2 py-3 border-r border-gray-50 text-right font-bold">{row.tnxValue.toFixed(2)}</td>
                    <td className="px-2 py-3 border-r border-gray-50 text-center">{row.location}</td>
                    <td className="px-2 py-3 border-r border-gray-50 text-left truncate max-w-[150px]">{row.remarks}</td>
                    <td className="px-2 py-3 border-r border-gray-50">{row.usedOn}</td>
                    <td className="px-2 py-3 border-r border-gray-50 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${getStatusStyle(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-center">{row.tnxBy}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={18} className="py-24">
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

export default TnxReport;