import React, { useState } from 'react';
import { Home, Filter, Search, History, Inbox, ChevronLeft, ChevronRight, ChevronDown, Plus, Trash2, Calendar } from 'lucide-react';
import MaterialsMovementForm from './MaterialsMovementForm';
import ManualIssue from './ManualIssue';

interface IssueItem {
  id: string;
  moNo: string;
  refNo: string;
  sku: string;
  name: string;
  moQty: number;
  issueQty: number;
  reqDept: string;
  reqBy: string;
}

const Issue: React.FC = () => {
  const [view, setView] = useState<'list' | 'manual' | 'mo-issue'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pageSize, setPageSize] = useState(10);

  // Mock data matching the screenshot
  const [issues] = useState<IssueItem[]>([
    { id: '1', moNo: '100230', refNo: '12386', sku: '3100000121', name: 'AC GAS, R134A', moQty: 1, issueQty: 0, reqDept: 'Assembly', reqBy: 'Md. Rokun Zzaman Emon' },
    { id: '2', moNo: '100221', refNo: '13177', sku: '3300000032', name: 'TOILET TISSUE', moQty: 48, issueQty: 0, reqDept: 'Admin', reqBy: 'Md. Rokun Zzaman Emon' },
    { id: '3', moNo: '100208', refNo: '11583', sku: '3100000188', name: 'SAND PAPER, 1500 GRIT', moQty: 4, issueQty: 0, reqDept: 'Paint Shop', reqBy: 'Rakibul Hassan' },
  ]);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === issues.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(issues.map(i => i.id)));
  };

  const handleMOIssueSubmit = (data: any) => {
    console.log("MO Issue Submitted:", data);
    alert("Materials Movement completed successfully!");
    setView('list');
    setSelectedIds(new Set());
  };

  const handleManualIssueSubmit = (data: any) => {
    console.log("Manual Issue Submitted:", data);
    alert("Goods Issue successfully recorded!");
    setView('list');
  };

  if (view === 'mo-issue') {
    const selectedItems = issues.filter(i => selectedIds.has(i.id));
    return (
      <MaterialsMovementForm 
        selectedItems={selectedItems}
        onCancel={() => setView('list')}
        onSubmit={handleMOIssueSubmit}
      />
    );
  }

  if (view === 'manual') {
    return (
      <ManualIssue 
        onBack={() => setView('list')} 
        onSubmit={handleManualIssueSubmit} 
      />
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      {/* Breadcrumbs & Top Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-[11px] font-bold text-[#2d808e] uppercase tracking-wider">
          <Home size={14} className="text-gray-400" />
          <span className="text-gray-400">/</span>
          <span>ISSUE</span>
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-1.5 border border-[#2d808e] bg-white px-5 py-1.5 rounded text-[12px] font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
            <span>Logs</span>
          </button>
          <button 
            onClick={() => setView('manual')}
            className="bg-[#2d808e] text-white px-6 py-1.5 rounded text-[13px] font-bold shadow-sm hover:bg-[#256b78] transition-all active:scale-[0.98]"
          >
            Manual Issue
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => setView('mo-issue')}
          disabled={selectedIds.size === 0}
          className={`px-6 py-1.5 rounded text-[12px] font-bold transition-all border ${
            selectedIds.size > 0 
              ? 'bg-[#2d808e] text-white border-[#2d808e] hover:bg-[#256b78] shadow-sm' 
              : 'bg-[#e9ecef] text-gray-300 border-gray-100 cursor-not-allowed'
          }`}
        >
          MO Issue
        </button>

        <div className="flex items-center">
          <div className="relative flex">
            <input 
              type="text" 
              placeholder="Search by name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 px-4 py-1.5 border border-gray-200 rounded-l outline-none text-[12px] text-gray-600 focus:border-[#2d808e]"
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
                <th className="px-6 py-4 w-12 text-center">
                  <div className="flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.size === issues.length && issues.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-[#2d808e] focus:ring-[#2d808e]"
                    />
                  </div>
                </th>
                <th className="px-6 py-4 text-center relative">
                  MO No
                  <Filter size={10} className="inline-block ml-2 text-gray-300" />
                </th>
                <th className="px-6 py-4 text-center relative">
                  Ref.No
                  <Filter size={10} className="inline-block ml-2 text-gray-300" />
                </th>
                <th className="px-6 py-4 text-center relative">
                  SKU
                  <Filter size={10} className="inline-block ml-2 text-gray-300" />
                </th>
                <th className="px-6 py-4 text-left">Name</th>
                <th className="px-6 py-4 text-center w-24">MO Qty</th>
                <th className="px-6 py-4 text-center w-24">Issue Qty</th>
                <th className="px-6 py-4 text-left w-40">Req. Dept.</th>
                <th className="px-6 py-4 text-left w-48">Req. By</th>
              </tr>
            </thead>
            <tbody className="text-[12px] text-gray-700 font-medium">
              {issues.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.has(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        className="w-4 h-4 rounded border-gray-300 text-[#2d808e] focus:ring-[#2d808e]"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="text-blue-500 hover:underline font-bold transition-all">
                      {item.moNo}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">{item.refNo}</td>
                  <td className="px-6 py-4 text-center">{item.sku}</td>
                  <td className="px-6 py-4 font-bold uppercase text-[11px] leading-tight">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 text-center">{item.moQty}</td>
                  <td className="px-6 py-4 text-center">{item.issueQty}</td>
                  <td className="px-6 py-4 text-left whitespace-nowrap">{item.reqDept}</td>
                  <td className="px-6 py-4 text-left whitespace-nowrap">{item.reqBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-end space-x-4 pt-2 pb-6">
        <div className="flex items-center space-x-1">
          <button className="p-1.5 text-gray-300 hover:text-gray-500"><ChevronLeft size={16} /></button>
          <button className="w-7 h-7 flex items-center justify-center text-xs font-bold rounded bg-white border border-[#2d808e] text-[#2d808e]">1</button>
          <button className="p-1.5 text-gray-300 hover:text-gray-500"><ChevronRight size={16} /></button>
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

export default Issue;