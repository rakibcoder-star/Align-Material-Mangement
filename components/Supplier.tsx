import React, { useState } from 'react';
import { Home, Search, History, Edit2, Filter, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

interface SupplierData {
  id: string;
  code: string;
  name: string;
  email: {
    office: string;
    contact: string;
    alternate: string;
  };
  phone: {
    office: string;
    contact: string;
    alternate: string;
  };
  type: 'Local' | 'Import';
}

const Supplier: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(10);

  // Mock data matching the screenshot
  const [suppliers] = useState<SupplierData[]>([
    {
      id: '1',
      code: '2000000004',
      name: 'NSR COMPUTER & STATIONERY',
      email: {
        office: 'nsr201218@yahoo.com',
        contact: 'nsr201218@yahoo.com',
        alternate: 'N/A'
      },
      phone: {
        office: '01927963132',
        contact: 'N/A',
        alternate: '01644402650'
      },
      type: 'Local'
    },
    {
      id: '2',
      code: '2000000003',
      name: 'M/S SHIFA ENTERPRISE',
      email: {
        office: 'shifaenterprise567@gmail.com',
        contact: 'N/A',
        alternate: 'N/A'
      },
      phone: {
        office: '01319567649',
        contact: 'N/A',
        alternate: 'N/A'
      },
      type: 'Local'
    },
    {
      id: '3',
      code: '2000000002',
      name: 'TALUS MACHINANERY CO. LIMITED',
      email: {
        office: 'sofia@talusmachinery.com',
        contact: 'N/A',
        alternate: 'N/A'
      },
      phone: {
        office: '+8618957960072',
        contact: 'N/A',
        alternate: 'N/A'
      },
      type: 'Import'
    },
    {
      id: '4',
      code: '2000000001',
      name: 'YOUNGSAN GLONET CORPORATION',
      email: {
        office: 'N/A',
        contact: 'N/A',
        alternate: 'N/A'
      },
      phone: {
        office: '+82221831278',
        contact: 'N/A',
        alternate: 'N/A'
      },
      type: 'Import'
    }
  ]);

  return (
    <div className="flex flex-col space-y-4">
      {/* Top Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-[11px] font-bold text-[#2d808e] uppercase tracking-wider">
          <Home size={14} className="text-gray-400" />
          <span className="text-gray-400">/</span>
          <span>Supplier</span>
        </div>
        <button 
          className="bg-[#2d808e] text-white px-6 py-1.5 rounded text-[13px] font-bold shadow-sm hover:bg-[#256b78] transition-all active:scale-[0.98]"
        >
          Add Supplier
        </button>
      </div>

      {/* Action Buttons Bar */}
      <div className="flex items-center justify-between">
        <button className="flex items-center space-x-1.5 border border-[#2d808e] bg-white px-5 py-1 rounded text-[12px] font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
          <span>Logs</span>
        </button>
        
        <div className="flex items-center">
          <div className="relative flex">
            <input 
              type="text" 
              placeholder="Search by name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 px-3 py-1.5 border border-gray-300 rounded-l outline-none text-xs text-gray-600 focus:border-[#2d808e]"
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
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-[#fafbfc]">
              <tr className="text-[11px] font-bold text-gray-700 uppercase border-b border-gray-100">
                <th className="px-6 py-4 text-center w-16">SL</th>
                <th className="px-6 py-4 text-center relative w-32">
                  Code
                  <Filter size={10} className="inline-block ml-2 text-gray-300" />
                </th>
                <th className="px-6 py-4 text-left w-64">Name</th>
                <th className="px-6 py-4 text-left">Email</th>
                <th className="px-6 py-4 text-left">Phone</th>
                <th className="px-6 py-4 text-center w-24">Type</th>
                <th className="px-6 py-4 text-center w-24">Action</th>
              </tr>
            </thead>
            <tbody className="text-[11px] text-gray-600">
              {suppliers.map((supplier, index) => (
                <tr key={supplier.id} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                  <td className="px-6 py-5 text-center font-medium">{index + 1}</td>
                  <td className="px-6 py-5 text-center">{supplier.code}</td>
                  <td className="px-6 py-5 font-bold uppercase text-[10px] text-gray-700 leading-tight">
                    {supplier.name}
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <div><span className="text-gray-400">Office:</span> {supplier.email.office}</div>
                      <div><span className="text-gray-400">Contact:</span> {supplier.email.contact}</div>
                      <div><span className="text-gray-400">Alternate:</span> {supplier.email.alternate}</div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <div><span className="text-gray-400">Office:</span> {supplier.phone.office}</div>
                      <div><span className="text-gray-400">Contact:</span> {supplier.phone.contact}</div>
                      <div><span className="text-gray-400">Alternate:</span> {supplier.phone.alternate}</div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    {supplier.type}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button className="p-1.5 text-blue-500 hover:bg-blue-50 border border-blue-100 rounded transition-all">
                      <Edit2 size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-end space-x-4 pt-2">
        <div className="flex items-center space-x-2">
          <button className="text-gray-300 cursor-not-allowed hover:text-gray-400 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <div className="w-6 h-6 flex items-center justify-center border border-[#2d808e] text-[#2d808e] text-[10px] font-bold rounded">
            1
          </div>
          <button className="text-gray-300 cursor-not-allowed hover:text-gray-400 transition-colors">
            <ChevronRight size={16} />
          </button>
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

export default Supplier;