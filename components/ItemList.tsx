
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
  location: string;
  uom: string;
  source: string;
  department: string;
  type: string;
  opening_stock: number;
  received_qty: number;
  issued_qty: number;
  on_hand_stock: number;
  safety_stock: number;
  last_issued: string;
  last_received: string;
  group_name?: string;
  last_price?: string | number;
  avg_price?: string | number;
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
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchItems = React.useCallback(async () => {
    setLoading(true);
    
    try {
      let allData: any[] = [];
      let from = 0;
      const step = 1000;
      let hasMore = true;

      while (hasMore) {
        let dataQuery = supabase
          .from('items')
          .select('*');

        if (searchTerm) {
          dataQuery = dataQuery.or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%`);
        }

        // Apply column filters
        Object.entries(columnFilters).forEach(([column, value]) => {
          if (value) {
            if (['code', 'sku', 'name', 'uom', 'location', 'type', 'group_name', 'source', 'department'].includes(column)) {
              dataQuery = dataQuery.ilike(column, `%${value}%`);
            } else if (['last_price', 'avg_price', 'safety_stock', 'on_hand_stock', 'opening_stock', 'received_qty', 'issued_qty'].includes(column)) {
              dataQuery = dataQuery.eq(column, parseFloat(value) || 0);
            }
          }
        });

        const { data, error } = await dataQuery
          .order('created_at', { ascending: false })
          .range(from, from + step - 1);

        if (error) throw error;

        if (data && data.length > 0) {
          allData = [...allData, ...data];
          if (data.length < step) {
            hasMore = false;
          } else {
            from += step;
          }
        } else {
          hasMore = false;
        }

        // Safety break
        if (from > 20000) hasMore = false;
      }
      
      setTotalCount(allData.length);
      setItems(allData.map((item, index) => ({
        ...item,
        sl: index + 1
      })));
    } catch (err) {
      console.error("Fetch items error:", err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, columnFilters]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleColumnFilter = (column: string, value: string) => {
    setColumnFilters(prev => ({ ...prev, [column]: value }));
  };

  const columnSuggestions = React.useMemo(() => {
    const suggestions: Record<string, string[]> = {};
    const columns = ['code', 'sku', 'name', 'uom', 'location', 'type', 'group_name', 'source', 'department'];
    
    columns.forEach(col => {
      const uniqueValues = Array.from(new Set(items.map(item => String((item as any)[col] || ''))))
        .filter(val => val && val !== 'N/A')
        .sort();
      suggestions[col] = uniqueValues;
    });
    
    return suggestions;
  }, [items]);

  const handleSearch = () => {
    fetchItems();
  };

  const handleDownloadExcel = () => {
    const exportData = items.map(item => ({
      'SL': item.sl,
      'Code': item.code,
      'SKU': item.sku,
      'Item Name': item.name,
      'LOCATION': item.location,
      'UOM': item.uom,
      'Source': item.source || 'N/A',
      'Department': item.department || 'N/A',
      'Types': item.type,
      'Opening stock': item.opening_stock || 0,
      'Rcv_Qty.': item.received_qty || 0,
      'Total_Stock Qty.': (Number(item.opening_stock) || 0) + (Number(item.received_qty) || 0),
      'Issue_Qty.': item.issued_qty || 0,
      'Closing_Stock': item.on_hand_stock || 0,
      'Safety Stock Qty.': item.safety_stock || 0,
      'Last Issued': item.last_issued ? new Date(item.last_issued).toLocaleString() : 'N/A',
      'Last Received': item.last_received ? new Date(item.last_received).toLocaleString() : 'N/A'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Items");
    XLSX.writeFile(workbook, "Item_Master_List.xlsx");
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
        code: String(row['CODE'] || row['code'] || row['Code'] || '').trim(),
        sku: String(row['SKU'] || row['sku'] || 'N/A').trim(),
        name: String(row['NAME'] || row['name'] || row['Item Name'] || '').trim(),
        uom: String(row['UOM'] || row['uom'] || '').trim(),
        location: String(row['LOCATION'] || row['location'] || row['Location'] || 'N/A').trim(),
        source: String(row['SOURCE'] || row['source'] || row['Source'] || 'N/A').trim(),
        department: String(row['DEPARTMENT'] || row['department'] || row['Department'] || 'N/A').trim(),
        type: String(row['TYPE'] || row['type'] || row['Types'] || '').trim(),
        group_name: String(row['GROUP'] || row['group'] || '').trim(),
        opening_stock: parseInt(row['OPENING STOCK'] || row['opening_stock'] || row['Opening stock']) || 0,
        received_qty: parseInt(row['RECEIVED QTY'] || row['received_qty'] || row['Rcv_Qty.']) || 0,
        issued_qty: parseInt(row['ISSUED QTY'] || row['issued_qty'] || row['Issue_Qty.']) || 0,
        on_hand_stock: parseInt(row['ON-HAND STOCK'] || row['on_hand_stock'] || row['Closing_Stock']) || 0,
        safety_stock: parseInt(row['SAFETY STOCK'] || row['safety_stock'] || row['Safety Stock Qty.']) || 0,
        last_price: parseFloat(row['LAST PRICE'] || row['last_price']) || 0,
        avg_price: parseFloat(row['AVG. PRICE'] || row['avg_price']) || 0
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
    <div className="flex flex-col h-[calc(100vh-120px)] space-y-4">
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
            onClick={handleDownloadExcel}
            className="bg-white text-emerald-600 border border-emerald-600 px-5 py-2 rounded text-[13px] font-black shadow-sm hover:bg-emerald-50 transition-all flex items-center space-x-2 uppercase tracking-tight"
          >
            <FileUp size={16} strokeWidth={3} className="rotate-180" />
            <span>Download Excel</span>
          </button>
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
        <table className="w-full text-left border-collapse min-w-[2200px]">
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
                  <span>LOCATION</span>
                  <ColumnFilter columnName="Location" currentValue={columnFilters.location || ''} onFilter={(val) => handleColumnFilter('location', val)} suggestions={columnSuggestions.location} />
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
                  <span>Source</span>
                  <ColumnFilter columnName="Source" currentValue={columnFilters.source || ''} onFilter={(val) => handleColumnFilter('source', val)} suggestions={columnSuggestions.source} />
                </div>
              </th>
              <th className="px-4 py-5 border-r border-gray-50 text-center">
                <div className="flex items-center justify-center">
                  <span>Department</span>
                  <ColumnFilter columnName="Department" currentValue={columnFilters.department || ''} onFilter={(val) => handleColumnFilter('department', val)} suggestions={columnSuggestions.department} />
                </div>
              </th>
              <th className="px-4 py-5 border-r border-gray-50 text-center">
                <div className="flex items-center justify-center">
                  <span>Types</span>
                  <ColumnFilter columnName="Type" currentValue={columnFilters.type || ''} onFilter={(val) => handleColumnFilter('type', val)} suggestions={columnSuggestions.type} />
                </div>
              </th>
              <th className="px-4 py-5 border-r border-gray-50 text-center">
                <div className="flex items-center justify-center">
                  <span>Opening stock</span>
                  <ColumnFilter columnName="Opening" currentValue={columnFilters.opening_stock || ''} onFilter={(val) => handleColumnFilter('opening_stock', val)} />
                </div>
              </th>
              <th className="px-4 py-5 border-r border-gray-50 text-center">
                <div className="flex items-center justify-center">
                  <span>Rcv_Qty.</span>
                  <ColumnFilter columnName="Received" currentValue={columnFilters.received_qty || ''} onFilter={(val) => handleColumnFilter('received_qty', val)} />
                </div>
              </th>
              <th className="px-4 py-5 border-r border-gray-50 text-center">
                <div className="flex items-center justify-center">
                  <span>Total_Stock Qty.</span>
                </div>
              </th>
              <th className="px-4 py-5 border-r border-gray-50 text-center">
                <div className="flex items-center justify-center">
                  <span>Issue_Qty.</span>
                  <ColumnFilter columnName="Issued" currentValue={columnFilters.issued_qty || ''} onFilter={(val) => handleColumnFilter('issued_qty', val)} />
                </div>
              </th>
              <th className="px-4 py-5 border-r border-gray-50 text-center">
                <div className="flex items-center justify-center">
                  <span>Closing_Stock</span>
                  <ColumnFilter columnName="Stock" currentValue={columnFilters.on_hand_stock || ''} onFilter={(val) => handleColumnFilter('on_hand_stock', val)} />
                </div>
              </th>
              <th className="px-4 py-5 border-r border-gray-50 text-center">
                <div className="flex items-center justify-center">
                  <span>Safety Stock Qty.</span>
                  <ColumnFilter columnName="Safety" currentValue={columnFilters.safety_stock || ''} onFilter={(val) => handleColumnFilter('safety_stock', val)} />
                </div>
              </th>
              <th className="px-4 py-5 border-r border-gray-50 text-center">
                <div className="flex items-center justify-center">
                  <span>Last Issued</span>
                </div>
              </th>
              <th className="px-4 py-5 border-r border-gray-50 text-center">
                <div className="flex items-center justify-center">
                  <span>Last Received</span>
                </div>
              </th>
              <th className="px-4 py-5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-[11px] text-gray-600 font-medium">
            {loading ? (
              <tr>
                <td colSpan={19} className="py-32 text-center text-gray-400">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="animate-spin text-[#2d808e]" size={32} />
                    <span className="font-black uppercase tracking-widest text-[10px]">Querying Database...</span>
                  </div>
                </td>
              </tr>
            ) : items.map((item) => (
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
                <td className="px-4 py-4 text-center border-r border-gray-50 text-gray-400">{item.location}</td>
                <td className="px-4 py-4 text-center border-r border-gray-50"><span className="px-2 py-1 bg-gray-100 rounded text-[9px] font-black">{item.uom}</span></td>
                <td className="px-4 py-4 text-center border-r border-gray-50 text-gray-400">{item.source || 'N/A'}</td>
                <td className="px-4 py-4 text-center border-r border-gray-50 text-gray-400">{item.department || 'N/A'}</td>
                <td className="px-4 py-4 text-center border-r border-gray-50">{item.type}</td>
                <td className="px-4 py-4 text-center border-r border-gray-50 font-bold text-gray-700">{item.opening_stock || 0}</td>
                <td className="px-4 py-4 text-center border-r border-gray-50 font-bold text-gray-700">{item.received_qty || 0}</td>
                <td className="px-4 py-4 text-center border-r border-gray-50 font-black text-blue-600">{(Number(item.opening_stock) || 0) + (Number(item.received_qty) || 0)}</td>
                <td className="px-4 py-4 text-center border-r border-gray-50 font-bold text-gray-700">{item.issued_qty || 0}</td>
                <td className="px-4 py-4 text-center border-r border-gray-50 font-black text-[#2d808e] text-[13px]">{item.on_hand_stock}</td>
                <td className="px-4 py-4 text-center border-r border-gray-50 font-black text-orange-600">{item.safety_stock}</td>
                <td className="px-4 py-4 text-center border-r border-gray-50 text-gray-400">{item.last_issued ? new Date(item.last_issued).toLocaleString() : 'N/A'}</td>
                <td className="px-4 py-4 text-center border-r border-gray-50 text-gray-400">{item.last_received ? new Date(item.last_received).toLocaleString() : 'N/A'}</td>
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
                <td colSpan={19} className="py-32 text-center text-gray-300 uppercase font-black tracking-widest">No matching items found</td>
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
