import React, { useState, useEffect } from 'react';
import { Home, FileSpreadsheet, Search, List, ChevronLeft, ChevronRight, ChevronDown, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabase';
import ColumnFilter from './ColumnFilter';

interface InventoryItem {
  id: string;
  code: string;
  sku: string;
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
  const [pageSize, setPageSize] = useState(10000);
  const [currentPage, setCurrentPage] = useState(1);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

  const fetchInventory = React.useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('items')
        .select('*', { count: 'exact' });

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%`);
      }

      // Apply column filters
      Object.entries(columnFilters).forEach(([column, value]) => {
        if (value) {
          if (column === 'code' || column === 'sku' || column === 'name' || column === 'uom' || column === 'type' || column === 'group_name') {
            query = query.ilike(column, `%${value}%`);
          } else if (column === 'received_qty' || column === 'issued_qty' || column === 'on_hand_stock' || column === 'safety_stock') {
            query = query.eq(column, parseInt(value) || 0);
          }
        }
      });

      const { data, count, error } = await query
        .order('name', { ascending: true })
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

      if (error) throw error;

      if (data) {
        const mapped: InventoryItem[] = data.map(item => ({
          id: item.id,
          code: item.code || 'N/A',
          sku: item.sku || 'N/A',
          name: item.name,
          uom: item.uom || 'N/A',
          receivedQty: item.received_qty || 0,
          issuedQty: item.issued_qty || 0,
          onHandQty: item.on_hand_stock || 0,
          safetyStock: item.safety_stock || 0,
          itemType: item.type || 'N/A',
          itemDetails: item.group_name || 'N/A'
        }));
        setInventory(mapped);
        setTotalCount(count || 0);
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, columnFilters, currentPage, pageSize]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleColumnFilter = (column: string, value: string) => {
    setColumnFilters(prev => ({ ...prev, [column]: value }));
    setCurrentPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchInventory();
  };

  const columnSuggestions = React.useMemo(() => {
    const suggestions: Record<string, string[]> = {};
    const columns = ['code', 'sku', 'name', 'uom', 'type', 'group_name'];
    
    columns.forEach(col => {
      const key = col === 'type' ? 'itemType' : col === 'group_name' ? 'itemDetails' : col;
      const uniqueValues = Array.from(new Set(inventory.map(item => String((item as any)[key] || ''))))
        .filter(val => val && val !== 'N/A')
        .sort();
      suggestions[col] = uniqueValues;
    });
    
    return suggestions;
  }, [inventory]);

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
          <form onSubmit={handleSearch} className="relative flex">
            <input 
              type="text" 
              placeholder="Search by Name or Code"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 px-4 py-1.5 border border-gray-200 rounded-l outline-none text-xs text-gray-600 focus:border-[#2d808e]"
            />
            <button type="submit" className="bg-[#2d808e] text-white px-3 rounded-r flex items-center justify-center hover:bg-[#256b78]">
              <Search size={14} />
            </button>
          </form>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead className="bg-[#fcfcfc]">
              <tr className="text-[12px] font-bold text-gray-800 border-b border-gray-100">
                <th className="px-6 py-4 text-left w-32">
                  <div className="flex items-center">
                    <span>Code</span>
                    <ColumnFilter columnName="Code" currentValue={columnFilters.code || ''} onFilter={(val) => handleColumnFilter('code', val)} suggestions={columnSuggestions.code} />
                  </div>
                </th>
                <th className="px-6 py-4 text-left w-32">
                  <div className="flex items-center">
                    <span>SKU</span>
                    <ColumnFilter columnName="SKU" currentValue={columnFilters.sku || ''} onFilter={(val) => handleColumnFilter('sku', val)} suggestions={columnSuggestions.sku} />
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center">
                    <span>Name</span>
                    <ColumnFilter columnName="Name" currentValue={columnFilters.name || ''} onFilter={(val) => handleColumnFilter('name', val)} suggestions={columnSuggestions.name} />
                  </div>
                </th>
                <th className="px-6 py-4 text-center w-20">
                  <div className="flex items-center justify-center">
                    <span>UOM</span>
                    <ColumnFilter columnName="UOM" currentValue={columnFilters.uom || ''} onFilter={(val) => handleColumnFilter('uom', val)} suggestions={columnSuggestions.uom} />
                  </div>
                </th>
                <th className="px-6 py-4 text-center w-32">
                  <div className="flex items-center justify-center">
                    <span>Received Qty</span>
                    <ColumnFilter columnName="Received Qty" currentValue={columnFilters.received_qty || ''} onFilter={(val) => handleColumnFilter('received_qty', val)} />
                  </div>
                </th>
                <th className="px-6 py-4 text-center w-32">
                  <div className="flex items-center justify-center">
                    <span>Issued Qty</span>
                    <ColumnFilter columnName="Issued Qty" currentValue={columnFilters.issued_qty || ''} onFilter={(val) => handleColumnFilter('issued_qty', val)} />
                  </div>
                </th>
                <th className="px-6 py-4 text-center w-32">
                  <div className="flex items-center justify-center">
                    <span>On-Hand Qty</span>
                    <ColumnFilter columnName="On-Hand" currentValue={columnFilters.on_hand_stock || ''} onFilter={(val) => handleColumnFilter('on_hand_stock', val)} />
                  </div>
                </th>
                <th className="px-6 py-4 text-center w-32">
                  <div className="flex items-center justify-center">
                    <span>Safety Stock</span>
                    <ColumnFilter columnName="Safety" currentValue={columnFilters.safety_stock || ''} onFilter={(val) => handleColumnFilter('safety_stock', val)} />
                  </div>
                </th>
                <th className="px-6 py-4 text-left w-40">
                  <div className="flex items-center">
                    <span>Item Type</span>
                    <ColumnFilter columnName="Type" currentValue={columnFilters.type || ''} onFilter={(val) => handleColumnFilter('type', val)} suggestions={columnSuggestions.type} />
                  </div>
                </th>
                <th className="px-6 py-4 text-left w-40">
                  <div className="flex items-center">
                    <span>Item Details</span>
                    <ColumnFilter columnName="Group" currentValue={columnFilters.group_name || ''} onFilter={(val) => handleColumnFilter('group_name', val)} suggestions={columnSuggestions.group_name} />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="text-[12px] text-gray-700 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-400 uppercase tracking-widest">
                    <div className="flex flex-col items-center space-y-2">
                      <Loader2 size={24} className="animate-spin text-[#2d808e]" />
                      <span>Loading Inventory...</span>
                    </div>
                  </td>
                </tr>
              ) : inventory.length > 0 ? (
                inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                    <td className="px-6 py-4 text-left">{item.code}</td>
                    <td className="px-6 py-4 text-left font-mono text-xs">{item.sku}</td>
                    <td className="px-6 py-4 font-bold uppercase">{item.name}</td>
                    <td className="px-6 py-4 text-center">{item.uom}</td>
                    <td className="px-6 py-4 text-center">{item.receivedQty}</td>
                    <td className="px-6 py-4 text-center">{item.issuedQty}</td>
                    <td className="px-6 py-4 text-center font-bold text-[#2d808e]">{item.onHandQty}</td>
                    <td className="px-6 py-4 text-center">{item.safetyStock}</td>
                    <td className="px-6 py-4 text-left whitespace-nowrap">{item.itemType}</td>
                    <td className="px-6 py-4 text-left whitespace-nowrap">{item.itemDetails}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-400 uppercase tracking-widest">
                    No items found in inventory
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer Section - Hidden as all items are shown on one page */}
      {totalCount > pageSize && (
        <div className="flex items-center justify-end space-x-4 pt-2 pb-6">
          <div className="flex items-center space-x-1">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 text-gray-300 hover:text-gray-500 disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>
            
            <div className="flex items-center space-x-1">
              <span className="text-xs font-bold text-gray-500 px-2">
                Page {currentPage} of {Math.ceil(totalCount / pageSize) || 1}
              </span>
            </div>

            <button 
              onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalCount / pageSize), prev + 1))}
              disabled={currentPage >= Math.ceil(totalCount / pageSize)}
              className="p-1.5 text-gray-400 hover:text-[#2d808e] disabled:opacity-50"
            >
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
              <option value={10000}>All</option>
            </select>
            <ChevronDown size={12} className="text-gray-400 pointer-events-none" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;