
import React, { useState } from 'react';
import { Home, FileSpreadsheet, Inbox, Filter, ChevronDown, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';

interface PurchaseReportEntry {
  sl: number;
  tnxDate: string;
  tnxType: string;
  docRef: string;
  sku: string;
  name: string;
  uom: string;
  unitPrice: number;
  qty: number;
  tnxValue: number;
  status: string;
  createdBy: string;
  updatedBy: string;
}

const PurchaseReport: React.FC = () => {
  const [filterDateStart, setFilterDateStart] = useState('2026-01-30');
  const [filterDateEnd, setFilterDateEnd] = useState('2026-01-30');
  const [itemType, setItemType] = useState('Items');
  const [tnxType, setTnxType] = useState('All');
  const [status, setStatus] = useState('All');
  const [docRef, setDocRef] = useState('');
  
  const [reportData] = useState<PurchaseReportEntry[]>([]);

  const handleExportExcel = () => {
    try {
      const exportData = reportData.length > 0 ? reportData : [{ Message: "No data found" }];
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Purchase Report");
      XLSX.writeFile(workbook, `Purchase_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  return (
    <div className="flex flex-col space-y-4 font-sans antialiased">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-[10px] font-bold text-[#2d808e] uppercase tracking-wider">
          <Home size={12} className="text-gray-400" />
          <span className="text-gray-300">/</span>
          <span>PURCHASE-REPORT</span>
        </div>

        {/* Filters - Responsive Grid/Flex */}
        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          <div className="relative flex-1 min-w-[120px] md:flex-initial">
            <select 
              value={itemType}
              onChange={(e) => setItemType(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 rounded px-3 py-1.5 text-[11px] text-gray-400 font-medium outline-none focus:border-[#2d808e] transition-all"
            >
              <option>Items</option>
              <option>Consumables</option>
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
          </div>

          <div className="relative flex-1 min-w-[130px] md:flex-initial">
            <input 
              type="date" 
              value={filterDateStart}
              onChange={(e) => setFilterDateStart(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 rounded px-2 py-1.5 text-[11px] text-gray-600 font-medium outline-none focus:border-[#2d808e] transition-all"
            />
          </div>

          <div className="relative flex-1 min-w-[130px] md:flex-initial">
            <input 
              type="date" 
              value={filterDateEnd}
              onChange={(e) => setFilterDateEnd(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 rounded px-2 py-1.5 text-[11px] text-gray-600 font-medium outline-none focus:border-[#2d808e] transition-all"
            />
          </div>

          <div className="relative flex-1 min-w-[80px] md:flex-initial">
            <select 
              value={tnxType}
              onChange={(e) => setTnxType(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 rounded px-3 py-1.5 text-[11px] text-gray-600 font-medium outline-none focus:border-[#2d808e] transition-all"
            >
              <option>All</option>
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
          </div>

          <input 
            type="text" 
            placeholder="PR/PO No."
            value={docRef}
            onChange={(e) => setDocRef(e.target.value)}
            className="flex-1 md:flex-initial bg-white border border-gray-200 rounded px-3 py-1.5 text-[11px] text-gray-600 font-medium outline-none focus:border-[#2d808e] transition-all md:w-[110px]"
          />

          <button className="bg-[#2d808e] text-white px-5 py-1.5 rounded text-[11px] font-bold shadow-sm hover:bg-[#256b78] transition-all whitespace-nowrap">
            Find
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={handleExportExcel}
          className="flex items-center space-x-1.5 border border-[#2d808e] bg-white px-3 py-1 rounded text-[10px] font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
        >
          <FileSpreadsheet size={13} className="text-gray-900" />
          <span>Excel</span>
        </button>
      </div>

      <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left border-collapse min-w-[1400px]">
            <thead className="bg-[#fcfcfc]">
              <tr className="text-[10px] font-bold text-gray-800 border-b border-gray-100 uppercase tracking-tighter">
                <th className="px-4 py-4 text-center w-12 border-r border-gray-50">SL</th>
                <th className="px-4 py-4 text-left border-r border-gray-50">Tnx. Date</th>
                <th className="px-4 py-4 text-left border-r border-gray-50 relative group">
                  Tnx. Type <Filter size={10} className="inline-block ml-1 text-gray-300" />
                </th>
                <th className="px-4 py-4 text-left border-r border-gray-50 relative group">
                  Doc.Ref <Filter size={10} className="inline-block ml-1 text-gray-300" />
                </th>
                <th className="px-4 py-4 text-left border-r border-gray-50 relative group">
                  SKU <Filter size={10} className="inline-block ml-1 text-gray-300" />
                </th>
                <th className="px-4 py-4 text-left border-r border-gray-50 relative group">
                  Name <Filter size={10} className="inline-block ml-1 text-gray-300" />
                </th>
                <th className="px-4 py-4 text-center border-r border-gray-50">UOM</th>
                <th className="px-4 py-4 text-right border-r border-gray-50">Unit Price</th>
                <th className="px-4 py-4 text-center border-r border-gray-50">Qty</th>
                <th className="px-4 py-4 text-right border-r border-gray-50">Trnx. Value</th>
                <th className="px-4 py-4 text-center border-r border-gray-50">Status</th>
                <th className="px-4 py-4 text-center border-r border-gray-50">Created By</th>
                <th className="px-4 py-4 text-center">Updated By</th>
              </tr>
            </thead>
            <tbody>
              {reportData.length > 0 ? (
                reportData.map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-50 text-[10px] hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-center">{idx + 1}</td>
                    <td className="px-4 py-3">{row.tnxDate}</td>
                    <td className="px-4 py-3">{row.tnxType}</td>
                    <td className="px-4 py-3 text-blue-500 font-bold">{row.docRef}</td>
                    <td className="px-4 py-3">{row.sku}</td>
                    <td className="px-4 py-3 font-bold uppercase">{row.name}</td>
                    <td className="px-4 py-3 text-center">{row.uom}</td>
                    <td className="px-4 py-3 text-right">{row.unitPrice.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center font-bold">{row.qty}</td>
                    <td className="px-4 py-3 text-right font-bold">{row.tnxValue.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">{row.status}</td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">{row.createdBy}</td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">{row.updatedBy}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={13} className="py-28">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <div className="bg-gray-50/50 p-4 rounded-full mb-3">
                        <Inbox size={56} strokeWidth={1} className="text-gray-200" />
                      </div>
                      <p className="text-[12px] font-medium text-gray-300">No data</p>
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
