import React, { useState } from 'react';
import { Home, Inbox, Filter, ChevronDown, Search, Plus } from 'lucide-react';
import ManualGRN from './ManualGRN';

const Receive: React.FC = () => {
  const [view, setView] = useState<'list' | 'manual'>('list');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  
  // Mock data would go here; currently showing empty state as per screenshot
  const [receiveData] = useState<any[]>([]);

  const handleManualGRNSubmit = (data: any) => {
    console.log("Manual GRN Submitted:", data);
    alert("Goods Receive Note created successfully!");
    setView('list');
  };

  if (view === 'manual') {
    return <ManualGRN onBack={() => setView('list')} onSubmit={handleManualGRNSubmit} />;
  }

  return (
    <div className="flex flex-col space-y-4">
      {/* Top Header Section with Manual GRN Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-[11px] font-bold text-[#2d808e] uppercase tracking-wider">
          <Home size={14} className="text-gray-400" />
          <span className="text-gray-400">/</span>
          <span className="border border-[#2d808e] rounded px-2 py-0.5">RECEIVE</span>
        </div>
        <button 
          onClick={() => setView('manual')}
          className="bg-[#2d808e] text-white px-6 py-1.5 rounded text-[13px] font-bold shadow-sm hover:bg-[#256b78] transition-all active:scale-[0.98]"
        >
          Manual GRN
        </button>
      </div>

      {/* Action Bar with Make GRN Button */}
      <div className="flex items-center space-x-2">
        <button 
          disabled={selectedItems.size === 0}
          className={`px-6 py-1.5 rounded text-[13px] font-bold transition-all border ${
            selectedItems.size > 0 
              ? 'bg-[#2d808e] text-white border-[#2d808e] hover:bg-[#256b78]' 
              : 'bg-[#e9ecef] text-gray-400 border-gray-200 cursor-not-allowed'
          }`}
        >
          Make GRN
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-white">
              <tr className="text-[12px] font-bold text-gray-800 border-b border-gray-100">
                <th className="px-6 py-4 w-12 text-center">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-gray-300 text-[#2d808e] focus:ring-[#2d808e]"
                  />
                </th>
                <th className="px-6 py-4 text-center relative w-48">
                  PO No
                  <Filter size={10} className="inline-block ml-2 text-gray-300" />
                </th>
                <th className="px-6 py-4 text-center relative w-48">
                  SKU
                  <Filter size={10} className="inline-block ml-2 text-gray-300" />
                </th>
                <th className="px-6 py-4 text-left">Name</th>
                <th className="px-6 py-4 text-center w-32">PO Qty</th>
                <th className="px-6 py-4 text-center w-32">GRN Qty</th>
                <th className="px-6 py-4 text-right w-48">Req. By</th>
              </tr>
            </thead>
            <tbody>
              {receiveData.length > 0 ? (
                receiveData.map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-50 text-[12px]">
                    {/* Data would be rendered here */}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-24">
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

export default Receive;