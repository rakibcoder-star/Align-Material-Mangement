
import React, { useState, useEffect } from 'react';
import { Home, FileSpreadsheet, Filter, Inbox, ChevronDown, Search, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabase';

const TnxReport: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];
  const [dateStart, setDateStart] = useState(today);
  const [dateEnd, setDateEnd] = useState(today);
  const [searchQuery, setSearchQuery] = useState('');
  const [tnxType, setTnxType] = useState('All');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      let combinedData: any[] = [];
      let sl = 1;

      // 1. Fetch Purchase Orders (PO & GRN)
      if (tnxType === 'All' || tnxType === 'PO' || tnxType === 'GRN') {
        let poQuery = supabase.from('purchase_orders').select('*');
        
        if (dateStart && dateEnd) {
          poQuery = poQuery.gte('created_at', `${dateStart}T00:00:00`).lte('created_at', `${dateEnd}T23:59:59`);
        }

        const { data: pos } = await poQuery;

        if (pos) {
          pos.forEach(po => {
            const items = po.items || [];
            items.forEach((item: any) => {
              const matchesSearch = !searchQuery || 
                item.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                item.sku?.toLowerCase().includes(searchQuery.toLowerCase());

              if (!matchesSearch) return;

              // Add PO record
              if (tnxType === 'All' || tnxType === 'PO') {
                combinedData.push({
                  sl: sl++,
                  tnxDate: new Date(po.created_at).toLocaleDateString(),
                  docDate: new Date(po.created_at).toLocaleDateString(),
                  tnxRef: po.po_no,
                  tnxType: 'PO',
                  docRef: po.po_no,
                  sku: item.sku || 'N/A',
                  name: item.name || 'N/A',
                  uom: item.uom || 'N/A',
                  unitPrice: Number(item.poPrice) || 0,
                  tnxQty: Number(item.poQty) || 0,
                  tnxValue: (Number(item.poQty) || 0) * (Number(item.poPrice) || 0),
                  location: 'N/A',
                  remarks: po.note || '',
                  usedOn: po.supplier_name,
                  status: po.status,
                  tnxBy: 'System'
                });
              }

              // Add GRN record if received_qty exists
              if ((tnxType === 'All' || tnxType === 'GRN') && (item.receivedQty > 0)) {
                combinedData.push({
                  sl: sl++,
                  tnxDate: new Date(po.updated_at || po.created_at).toLocaleDateString(),
                  docDate: new Date(po.updated_at || po.created_at).toLocaleDateString(),
                  tnxRef: `GRN-${po.po_no}`,
                  tnxType: 'GRN',
                  docRef: po.po_no,
                  sku: item.sku || 'N/A',
                  name: item.name || 'N/A',
                  uom: item.uom || 'N/A',
                  unitPrice: Number(item.poPrice) || 0,
                  tnxQty: Number(item.receivedQty) || 0,
                  tnxValue: (Number(item.receivedQty) || 0) * (Number(item.poPrice) || 0),
                  location: 'WH-01',
                  remarks: 'PO Received',
                  usedOn: po.supplier_name,
                  status: 'Completed',
                  tnxBy: 'System'
                });
              }
            });
          });
        }
      }

      // 2. Fetch Move Orders
      if (tnxType === 'All' || tnxType === 'Move Order') {
        let moQuery = supabase.from('move_orders').select('*');
        
        if (dateStart && dateEnd) {
          moQuery = moQuery.gte('created_at', `${dateStart}T00:00:00`).lte('created_at', `${dateEnd}T23:59:59`);
        }

        const { data: mos } = await moQuery;

        if (mos) {
          mos.forEach(mo => {
            const items = mo.items || [];
            items.forEach((item: any) => {
              const matchesSearch = !searchQuery || 
                item.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                item.sku?.toLowerCase().includes(searchQuery.toLowerCase());

              if (!matchesSearch) return;

              combinedData.push({
                sl: sl++,
                tnxDate: new Date(mo.created_at).toLocaleDateString(),
                docDate: new Date(mo.created_at).toLocaleDateString(),
                tnxRef: mo.mo_no,
                tnxType: 'Move Order',
                docRef: mo.reference || mo.mo_no,
                sku: item.sku || 'N/A',
                name: item.name || 'N/A',
                uom: item.uom || 'N/A',
                unitPrice: Number(item.unitPrice) || 0,
                tnxQty: Number(item.reqQty) || 0,
                tnxValue: (Number(item.reqQty) || 0) * (Number(item.unitPrice) || 0),
                location: item.location || 'N/A',
                remarks: item.remarks || '',
                usedOn: mo.department,
                status: mo.status,
                tnxBy: mo.requested_by || 'System'
              });
            });
          });
        }
      }

      setReportData(combinedData);
    } catch (err) {
      console.error("Error fetching transaction report:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    try {
      const exportData = reportData.length > 0 ? reportData : [{ Message: "No data found" }];
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Tnx Report");
      XLSX.writeFile(workbook, `Tnx_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-50 text-green-700 border-green-200';
      case 'approved': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'pending': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center space-x-2 text-[10px] font-bold text-[#2d808e] uppercase tracking-wider">
        <Home size={12} className="text-[#2d808e]" />
        <span className="text-gray-300">/</span>
        <span className="text-[#2d808e] cursor-pointer">TNX-REPORT</span>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-end gap-3 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
        <div className="relative min-w-[200px]">
          <input 
            type="text" 
            placeholder="Search Name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-md text-[11px] text-gray-700 font-medium outline-none focus:border-[#2d808e] transition-all"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        <div className="flex items-center space-x-2">
          <input 
            type="date" 
            value={dateStart} 
            onChange={(e) => setDateStart(e.target.value)} 
            className="bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-[11px] text-gray-600 font-medium outline-none focus:border-[#2d808e] w-[130px]" 
          />
          <span className="text-gray-300">to</span>
          <input 
            type="date" 
            value={dateEnd} 
            onChange={(e) => setDateEnd(e.target.value)} 
            className="bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-[11px] text-gray-600 font-medium outline-none focus:border-[#2d808e] w-[130px]" 
          />
        </div>

        <div className="relative min-w-[150px]">
          <select 
            value={tnxType} 
            onChange={(e) => setTnxType(e.target.value)} 
            className="w-full appearance-none bg-gray-50 border border-gray-200 rounded px-3 py-1.5 text-[11px] text-gray-700 font-bold outline-none focus:border-[#2d808e]"
          >
            <option value="All">All Transactions</option>
            <option value="PO">PO (Purchase Order)</option>
            <option value="GRN">GRN (Goods Receive)</option>
            <option value="Move Order">Move Order</option>
            <option value="Initial Balance">Initial Balance</option>
            <option value="Other">Other</option>
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        <button 
          onClick={fetchReport}
          disabled={loading}
          className="bg-[#2d808e] text-white px-8 py-1.5 rounded text-[11px] font-black shadow-sm hover:bg-[#256b78] transition-all flex items-center gap-2 uppercase tracking-widest disabled:opacity-50"
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : null}
          Find
        </button>
      </div>

      <div className="flex justify-end">
        <button onClick={handleExportExcel} className="flex items-center space-x-1.5 border border-[#2d808e] bg-white px-4 py-1.5 rounded text-[11px] font-bold text-[#2d808e] hover:bg-cyan-50 transition-all shadow-sm uppercase tracking-tight">
          <FileSpreadsheet size={14} />
          <span>Export Excel</span>
        </button>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left border-collapse min-w-[2000px]">
            <thead className="bg-[#fcfcfc] sticky top-0 z-10">
              <tr className="text-[10px] font-black text-gray-500 border-b border-gray-100 uppercase tracking-widest">
                <th className="px-4 py-4 text-center w-12 border-r border-gray-50">SL</th>
                <th className="px-4 py-4 border-r border-gray-50">Tnx. Date</th>
                <th className="px-4 py-4 border-r border-gray-50">Doc. Date</th>
                <th className="px-4 py-4 border-r border-gray-50 relative">Tnx. Ref.</th>
                <th className="px-4 py-4 border-r border-gray-50 relative">Tnx. Type</th>
                <th className="px-4 py-4 border-r border-gray-50 relative">Doc. Ref.</th>
                <th className="px-4 py-4 border-r border-gray-50 relative">SKU</th>
                <th className="px-4 py-4 border-r border-gray-50 relative">Name</th>
                <th className="px-4 py-4 border-r border-gray-50 relative text-center">UOM</th>
                <th className="px-4 py-4 border-r border-gray-50 text-right">Unit Price</th>
                <th className="px-4 py-4 border-r border-gray-50 text-center">Tnx. Qty</th>
                <th className="px-4 py-4 border-r border-gray-50 text-right">Tnx. Value</th>
                <th className="px-4 py-4 border-r border-gray-50 text-center">Location</th>
                <th className="px-4 py-4 border-r border-gray-50 text-left">Remarks</th>
                <th className="px-4 py-4 border-r border-gray-50 relative">Used On / Supplier</th>
                <th className="px-4 py-4 border-r border-gray-50 text-center">Status</th>
                <th className="px-4 py-4 text-center">Tnx. By</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={17} className="py-32 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <Loader2 className="animate-spin text-[#2d808e]" size={32} />
                      <span className="font-black uppercase tracking-widest text-[10px]">Filtering Transaction Node...</span>
                    </div>
                  </td>
                </tr>
              ) : reportData.length > 0 ? (
                reportData.map((row) => (
                  <tr key={row.sl} className="border-b border-gray-50 text-[10px] hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-center border-r border-gray-50 text-gray-400">{row.sl}</td>
                    <td className="px-4 py-3 border-r border-gray-50 font-medium whitespace-nowrap">{row.tnxDate}</td>
                    <td className="px-4 py-3 border-r border-gray-50 font-medium whitespace-nowrap">{row.docDate}</td>
                    <td className="px-4 py-3 border-r border-gray-50 font-black text-blue-500 uppercase">{row.tnxRef}</td>
                    <td className="px-4 py-3 border-r border-gray-50 font-black text-[#2d808e] uppercase">{row.tnxType}</td>
                    <td className="px-4 py-3 border-r border-gray-50 uppercase text-gray-500 font-bold">{row.docRef}</td>
                    <td className="px-4 py-3 border-r border-gray-50 text-gray-600 font-black">{row.sku}</td>
                    <td className="px-4 py-3 border-r border-gray-50 font-black uppercase text-gray-800 leading-tight">{row.name}</td>
                    <td className="px-4 py-3 border-r border-gray-50 text-center uppercase font-bold text-gray-400">{row.uom}</td>
                    <td className="px-4 py-3 border-r border-gray-50 text-right font-bold text-gray-700">{row.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 border-r border-gray-50 text-center font-black text-gray-800">{row.tnxQty}</td>
                    <td className="px-4 py-3 border-r border-gray-50 text-right font-black text-[#2d808e]">{row.tnxValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 border-r border-gray-50 text-center uppercase text-gray-400 font-bold">{row.location}</td>
                    <td className="px-4 py-3 border-r border-gray-50 text-left truncate max-w-[200px] text-gray-400 italic">{row.remarks}</td>
                    <td className="px-4 py-3 border-r border-gray-50 uppercase font-bold text-gray-500">{row.usedOn}</td>
                    <td className="px-4 py-3 border-r border-gray-50 text-center">
                      <span className={`px-3 py-0.5 rounded-full text-[8px] font-black uppercase border shadow-sm ${getStatusStyle(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap text-gray-400 uppercase font-black">{row.tnxBy}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={17} className="py-40">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <div className="bg-gray-50 p-6 rounded-full mb-4 ring-1 ring-gray-100">
                        <Inbox size={64} strokeWidth={1} className="text-gray-200" />
                      </div>
                      <p className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-300">Repository link empty</p>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-gray-200 mt-2">Click find to scan database</p>
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
