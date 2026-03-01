
import React, { useState, useRef, useEffect } from 'react';
import { Home, Search, Edit2, FileUp, Plus, Trash2, Loader2, ListFilter, RefreshCw } from 'lucide-react';
import NewItem from './NewItem';
import ItemHistoryModal from './ItemHistoryModal';
import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabase';
import ColumnFilter from './ColumnFilter';

export interface ItemEntry {
  id?: string;
  sl?: number;
  code: string;
  sku: string;
  name: string;
  uom: string;
  location: string;
  type: string;
  group_name: string;
  last_price: string | number;
  avg_price: string | number;
  safety_stock: string | number;
  on_hand_stock: string | number;
}

const ItemList: React.FC = () => {
  const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [historyItem, setHistoryItem] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [items, setItems] = useState<ItemEntry[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const pageSize = 10000;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchItems = async () => {
    setLoading(true);
    
    try {
      // 1. Get total count for pagination
      let countQuery = supabase.from('items').select('*', { count: 'exact', head: true });
      if (searchTerm) {
        countQuery = countQuery.or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%`);
      }

      // Apply column filters
      Object.entries(columnFilters).forEach(([column, value]) => {
        if (value) {
          if (['code', 'sku', 'name', 'uom', 'location', 'type', 'group_name'].includes(column)) {
            countQuery = countQuery.ilike(column, `%${value}%`);
          } else if (['last_price', 'avg_price', 'safety_stock', 'on_hand_stock'].includes(column)) {
            countQuery = countQuery.eq(column, parseFloat(value) || 0);
          }
        }
      });

      const { count } = await countQuery;
      setTotalCount(count || 0);

      // 2. Fetch paginated data
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      let dataQuery = supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (searchTerm) {
        dataQuery = dataQuery.or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%`);
      }

      // Apply column filters to data query too
      Object.entries(columnFilters).forEach(([column, value]) => {
        if (value) {
          if (['code', 'sku', 'name', 'uom', 'location', 'type', 'group_name'].includes(column)) {
            dataQuery = dataQuery.ilike(column, `%${value}%`);
          } else if (['last_price', 'avg_price', 'safety_stock', 'on_hand_stock'].includes(column)) {
            dataQuery = dataQuery.eq(column, parseFloat(value) || 0);
          }
        }
      });

      const { data, error } = await dataQuery;
      
      if (data && !error) {
        setItems(data.map((item, index) => ({
          ...item,
          sl: from + index + 1
        })));
      }
    } catch (err) {
      console.error("Fetch items error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [currentPage, searchTerm, columnFilters]);

  const handleColumnFilter = (column: string, value: string) => {
    setColumnFilters(prev => ({ ...prev, [column]: value }));
    setCurrentPage(1);
  };

  const columnSuggestions = React.useMemo(() => {
    const suggestions: Record<string, string[]> = {};
    const columns = ['code', 'sku', 'name', 'uom', 'location', 'type', 'group_name'];
    
    columns.forEach(col => {
      const uniqueValues = Array.from(new Set(items.map(item => String((item as any)[col] || ''))))
        .filter(val => val && val !== 'N/A')
        .sort();
      suggestions[col] = uniqueValues;
    });
    
    return suggestions;
  }, [items]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchItems();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const bstr = event.target?.result;
      const workbook = XLSX.read(bstr, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      const mappedItems = data.map((row: any) => ({
        code: String(row['CODE'] || row['code'] || '').trim(),
        sku: String(row['SKU'] || row['sku'] || 'N/A').trim(),
        name: String(row['NAME'] || row['name'] || '').trim(),
        uom: String(row['UOM'] || row['uom'] || '').trim(),
        location: String(row['LOCATION'] || row['location'] || 'N/A').trim(),
        type: String(row['TYPE'] || row['type'] || '').trim(),
        group_name: String(row['GROUP'] || row['group'] || '').trim(),
        last_price: parseFloat(row['LAST PRICE'] || row['last_price']) || 0,
        avg_price: parseFloat(row['AVG. PRICE'] || row['avg_price']) || 0,
        safety_stock: parseInt(row['SAFETY STOCK'] || row['safety_stock']) || 0,
        on_hand_stock: parseInt(row['ON-HAND STOCK'] || row['on_hand_stock']) || 0
      })).filter(item => item.name && item.code);

      if (mappedItems.length > 0) {
        setLoading(true);
        const { error } = await supabase.from('items').upsert(mappedItems, { onConflict: 'code' });
        
        if (error) {
          console.error("Supabase Error:", error);
          alert("Database Error: " + error.message);
        } else {
          alert(`Success! Processed ${mappedItems.length} items to database.`);
          fetchItems();
        }
      } else {
        alert("No valid items found in CSV.");
      }
      setLoading(false);
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`PERMANENTLY DELETE item "${name}" from database?`)) {
      const { error } = await supabase.from('items').delete().eq('id', id);
      if (error) {
        alert("Delete failed: " + error.message);
      } else {
        fetchItems();
      }
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setView('edit');
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setView('add');
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === items.length && items.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map(item => item.id!)));
    }
  };

  if (view === 'add' || view === 'edit') {
    return (
      <NewItem 
        onBack={() => setView('list')} 
        onSuccess={() => {
          setView('list');
          fetchItems();
        }} 
        initialData={editingItem}
      />
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] space-y-4">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2 text-[11px] font-bold text-[#2d808e] uppercase tracking-wider">
          <Home size={14} className="text-gray-400" />
          <span className="text-gray-300">/</span>
          <span className="text-[#2d808e]">ITEM-MASTER</span>
          <span className="text-gray-300">/</span>
          <span className="text-[#2d808e]">ITEM-LIST</span>
        </div>
        <div className="flex items-center space-x-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-white text-[#2d808e] border border-[#2d808e] px-5 py-2 rounded text-[13px] font-black shadow-sm hover:bg-cyan-50 transition-all flex items-center space-x-2 uppercase tracking-tight"
          >
            <FileUp size={16} strokeWidth={3} />
            <span>Upload CSV</span>
          </button>
          <button 
            onClick={handleAddItem}
            className="bg-[#2d808e] text-white px-6 py-2 rounded text-[13px] font-black shadow-lg shadow-cyan-900/10 hover:bg-[#256b78] transition-all flex items-center space-x-2 uppercase tracking-tight"
          >
            <Plus size={16} strokeWidth={3} />
            <span>Add Item Manually</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between bg-white p-3 rounded border border-gray-100 shadow-sm shrink-0">
        <div className="flex items-center space-x-2">
          <button onClick={fetchItems} className="p-2 text-gray-400 hover:text-[#2d808e] transition-colors" title="Refresh Database">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <div className="h-6 w-px bg-gray-100 mx-2"></div>
          {selectedIds.size > 0 && (
            <span className="text-[10px] font-black text-[#2d808e] uppercase bg-[#e2eff1] px-3 py-1 rounded-full animate-in fade-in zoom-in duration-200">
              {selectedIds.size} Selected
            </span>
          )}
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-4">
            Total Items: <span className="text-[#2d808e] font-black">{totalCount.toLocaleString()}</span>
          </div>
        </div>
        <div className="flex items-center">
          <div className="relative flex">
            <input 
              type="text" 
              placeholder="Search by name, SKU or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-96 px-4 py-2 bg-gray-50 border border-gray-100 rounded-l outline-none text-[12px] font-medium text-gray-600 focus:border-[#2d808e] focus:bg-white transition-all"
            />
            <button 
              onClick={handleSearch}
              className="bg-[#2d808e] text-white px-4 rounded-r flex items-center justify-center hover:bg-[#256b78]"
            >
              <Search size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-100 overflow-auto scrollbar-thin relative">
        <table className="w-full text-left border-collapse min-w-[1600px]">
          <thead className="bg-[#fcfcfc] sticky top-0 z-10 shadow-[0_1px_0_rgba(0,0,0,0.05)]">
            <tr className="text-[10px] font-black text-gray-500 border-b border-gray-100 uppercase tracking-widest">
              <th className="px-4 py-5 text-center w-12 border-r border-gray-50">
                <div className="flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.size === items.length && items.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 accent-[#2d808e]"
                  />
                </div>
              </th>
              <th className="px-4 py-5 text-center w-16 border-r border-gray-50">SL</th>
              <th className="px-4 py-5 border-r border-gray-50 text-center">
                <div className="flex items-center justify-center">
                  <span>Code</span>
                  <ColumnFilter columnName="Code" currentValue={columnFilters.code || ''} onFilter={(val) => handleColumnFilter('code', val)} suggestions={columnSuggestions.code} />
                </div>
              </th>
              <th className="px-4 py-5 border-r border-gray-50 text-center">
                <div className="flex items-center justify-center">
                  <span>SKU</span>
                  <ColumnFilter columnName="SKU" currentValue={columnFilters.sku || ''} onFilter={(val) => handleColumnFilter('sku', val)} suggestions={columnSuggestions.sku} />
                </div>
              </th>
              <th className="px-4 py-5 border-r border-gray-50 text-left w-80">
                <div className="flex items-center">
                  <span>Item Name</span>
                  <ColumnFilter columnName="Name" currentValue={columnFilters.name || ''} onFilter={(val) => handleColumnFilter('name', val)} suggestions={columnSuggestions.name} />
                </div>
              </th>
              <th className="px-4 py-5 border-r border-gray-50 text-center">
                <div className="flex items-center justify-center">
                  <span>UOM</span>
                  <ColumnFilter columnName="UOM" currentValue={columnFilters.uom || ''} onFilter={(val) => handleColumnFilter('uom', val)} suggestions={columnSuggestions.uom} />
                </div>
              </th>
              <th className="px-4 py-5 border-r border-gray-50 text-center">
                <div className="flex items-center justify-center">
                  <span>Location</span>
                  <ColumnFilter columnName="Location" currentValue={columnFilters.location || ''} onFilter={(val) => handleColumnFilter('location', val)} suggestions={columnSuggestions.location} />
                </div>
              </th>
              <th className="px-4 py-5 border-r border-gray-50 text-center">
                <div className="flex items-center justify-center">
                  <span>Type</span>
                  <ColumnFilter columnName="Type" currentValue={columnFilters.type || ''} onFilter={(val) => handleColumnFilter('type', val)} suggestions={columnSuggestions.type} />
                </div>
              </th>
              <th className="px-4 py-5 border-r border-gray-50 text-center">
                <div className="flex items-center justify-center">
                  <span>Group</span>
                  <ColumnFilter columnName="Group" currentValue={columnFilters.group_name || ''} onFilter={(val) => handleColumnFilter('group_name', val)} suggestions={columnSuggestions.group_name} />
                </div>
              </th>
              <th className="px-4 py-5 border-r border-gray-50 text-right">
                <div className="flex items-center justify-end">
                  <span>Last Price</span>
                  <ColumnFilter columnName="Price" currentValue={columnFilters.last_price || ''} onFilter={(val) => handleColumnFilter('last_price', val)} />
                </div>
              </th>
              <th className="px-4 py-5 border-r border-gray-50 text-right">
                <div className="flex items-center justify-end">
                  <span>Avg. Price</span>
                  <ColumnFilter columnName="Avg Price" currentValue={columnFilters.avg_price || ''} onFilter={(val) => handleColumnFilter('avg_price', val)} />
                </div>
              </th>
              <th className="px-4 py-5 border-r border-gray-50 text-center">
                <div className="flex items-center justify-center">
                  <span>Safety</span>
                  <ColumnFilter columnName="Safety" currentValue={columnFilters.safety_stock || ''} onFilter={(val) => handleColumnFilter('safety_stock', val)} />
                </div>
              </th>
              <th className="px-4 py-5 border-r border-gray-50 text-center">
                <div className="flex items-center justify-center">
                  <span>On-Hand</span>
                  <ColumnFilter columnName="Stock" currentValue={columnFilters.on_hand_stock || ''} onFilter={(val) => handleColumnFilter('on_hand_stock', val)} />
                </div>
              </th>
              <th className="px-4 py-5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-[11px] text-gray-600 font-medium">
            {loading ? (
              <tr>
                <td colSpan={14} className="py-32 text-center text-gray-400">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="animate-spin text-[#2d808e]" size={32} />
                    <span className="font-black uppercase tracking-widest text-[10px]">Querying Database...</span>
                  </div>
                </td>
              </tr>
            ) : items.map((item, idx) => (
              <tr 
                key={item.id} 
                className={`hover:bg-cyan-50/20 transition-colors border-b border-gray-50 last:border-0 group ${selectedIds.has(item.id!) ? 'bg-cyan-50/40' : ''}`}
                onClick={() => toggleSelect(item.id!)}
              >
                <td className="px-4 py-4 text-center border-r border-gray-50" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.has(item.id!)}
                      onChange={() => toggleSelect(item.id!)}
                      className="w-4 h-4 rounded border-gray-300 accent-[#2d808e]"
                    />
                  </div>
                </td>
                <td className="px-4 py-4 text-center border-r border-gray-50 text-gray-400">{item.sl}</td>
                <td className="px-4 py-4 text-center border-r border-gray-50 font-black text-gray-800">{item.code}</td>
                <td className="px-4 py-4 text-center border-r border-gray-50 text-gray-400">{item.sku}</td>
                <td className="px-4 py-4 font-black uppercase text-[11px] leading-tight border-r border-gray-50 text-[#2d808e]">{item.name}</td>
                <td className="px-4 py-4 text-center border-r border-gray-50"><span className="px-2 py-1 bg-gray-100 rounded text-[9px] font-black">{item.uom}</span></td>
                <td className="px-4 py-4 text-center border-r border-gray-50 text-gray-400">{item.location}</td>
                <td className="px-4 py-4 text-center border-r border-gray-50">{item.type}</td>
                <td className="px-4 py-4 text-center border-r border-gray-50">{item.group_name}</td>
                <td className="px-4 py-4 text-right border-r border-gray-50 font-bold text-gray-700">{Number(item.last_price).toFixed(2)}</td>
                <td className="px-4 py-4 text-right border-r border-gray-50 font-bold text-gray-700">{Number(item.avg_price).toFixed(2)}</td>
                <td className="px-4 py-4 text-center border-r border-gray-50 font-black text-orange-600">{item.safety_stock}</td>
                <td className="px-4 py-4 text-center border-r border-gray-50 font-black text-[#2d808e] text-[13px]">{item.on_hand_stock}</td>
                <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-center space-x-2">
                    <button 
                      onClick={() => handleEdit(item)}
                      title="Edit Item Data"
                      className="p-2 text-teal-600 hover:bg-teal-600 hover:text-white border border-teal-100 rounded-md transition-all shadow-sm"
                    >
                      <Edit2 size={14} strokeWidth={2.5} />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id!, item.name)}
                      title="Delete Permanently"
                      className="p-2 text-red-500 hover:bg-red-500 hover:text-white border border-red-100 rounded-md transition-all shadow-sm"
                    >
                      <Trash2 size={14} strokeWidth={2.5} />
                    </button>
                    <button 
                      onClick={() => setHistoryItem(item)}
                      title="View Update History"
                      className="p-2 text-blue-500 hover:bg-blue-50 hover:text-white border border-blue-100 rounded-md transition-all shadow-sm"
                    >
                      <ListFilter size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={14} className="py-32 text-center text-gray-300 uppercase font-black tracking-widest">No matching items found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {historyItem && (
        <ItemHistoryModal item={historyItem} onClose={() => setHistoryItem(null)} />
      )}
    </div>
  );
};

export default ItemList;
