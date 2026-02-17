
import React, { useState, useRef, useEffect } from 'react';
import { Home, Search, Filter, Edit2, FileUp, Plus, Trash2, Loader2, ListFilter, RefreshCw } from 'lucide-react';
import NewItem from './NewItem';
import ItemHistoryModal from './ItemHistoryModal';
import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabase';

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
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchItems = async () => {
    setLoading(true);
    // INCREASED LIMIT: Increased limit from default to 5000 to handle larger CSV datasets
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5000); 
    
    if (data && !error) {
      setItems(data.map((item, index) => ({
        ...item,
        sl: index + 1
      })));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

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

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
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

      <div className="flex items-center justify-between bg-white p-3 rounded border border-gray-100 shadow-sm">
        <div className="flex items-center space-x-2">
          <button onClick={fetchItems} className="p-2 text-gray-400 hover:text-[#2d808e] transition-colors" title="Refresh Database">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <div className="h-6 w-px bg-gray-100 mx-2"></div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            {filteredItems.length} Items found
          </span>
        </div>
        <div className="flex items-center">
          <div className="relative flex">
            <input 
              type="text" 
              placeholder="Search by name, SKU or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-96 px-4 py-2 bg-gray-50 border border-gray-100 rounded-l outline-none text-[12px] font-medium text-gray-600 focus:border-[#2d808e] focus:bg-white transition-all"
            />
            <button className="bg-[#2d808e] text-white px-4 rounded-r flex items-center justify-center hover:bg-[#256b78]">
              <Search size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto scrollbar-thin">
        <table className="w-full text-left border-collapse min-w-[1600px]">
          <thead className="bg-[#fcfcfc] sticky top-0 z-10">
            <tr className="text-[10px] font-black text-gray-500 border-b border-gray-100 uppercase tracking-widest">
              <th className="px-4 py-5 text-center w-16 border-r border-gray-50">SL</th>
              <th className="px-4 py-5 border-r border-gray-50 text-center">Code</th>
              <th className="px-4 py-5 border-r border-gray-50 text-center">SKU</th>
              <th className="px-4 py-5 border-r border-gray-50 text-left w-80">Item Name</th>
              <th className="px-4 py-5 border-r border-gray-50 text-center">UOM</th>
              <th className="px-4 py-5 border-r border-gray-50 text-center">Location</th>
              <th className="px-4 py-5 border-r border-gray-50 text-center">Type</th>
              <th className="px-4 py-5 border-r border-gray-50 text-center">Group</th>
              <th className="px-4 py-5 border-r border-gray-50 text-right">Last Price</th>
              <th className="px-4 py-5 border-r border-gray-50 text-right">Avg. Price</th>
              <th className="px-4 py-5 border-r border-gray-50 text-center">Safety</th>
              <th className="px-4 py-5 border-r border-gray-50 text-center">On-Hand</th>
              <th className="px-4 py-5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-[11px] text-gray-600 font-medium">
            {loading ? (
              <tr>
                <td colSpan={13} className="py-32 text-center text-gray-400">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="animate-spin text-[#2d808e]" size={32} />
                    <span className="font-black uppercase tracking-widest text-[10px]">Syncing with Database...</span>
                  </div>
                </td>
              </tr>
            ) : filteredItems.map((item, idx) => (
              <tr key={item.id} className="hover:bg-cyan-50/20 transition-colors border-b border-gray-50 last:border-0 group">
                <td className="px-4 py-4 text-center border-r border-gray-50 text-gray-400">{item.sl}</td>
                <td className="px-4 py-4 text-center border-r border-gray-50 font-black text-gray-800">{item.code}</td>
                <td className="px-4 py-4 text-center border-r border-gray-50 text-gray-500">{item.sku}</td>
                <td className="px-4 py-4 font-black uppercase text-[11px] leading-tight border-r border-gray-50 text-[#2d808e]">{item.name}</td>
                <td className="px-4 py-4 text-center border-r border-gray-50"><span className="px-2 py-1 bg-gray-100 rounded text-[9px] font-black">{item.uom}</span></td>
                <td className="px-4 py-4 text-center border-r border-gray-50 text-gray-400">{item.location}</td>
                <td className="px-4 py-4 text-center border-r border-gray-50">{item.type}</td>
                <td className="px-4 py-4 text-center border-r border-gray-50">{item.group_name}</td>
                <td className="px-4 py-4 text-right border-r border-gray-50 font-bold text-gray-700">{Number(item.last_price).toFixed(2)}</td>
                <td className="px-4 py-4 text-right border-r border-gray-50 font-bold text-gray-700">{Number(item.avg_price).toFixed(2)}</td>
                <td className="px-4 py-4 text-center border-r border-gray-50 font-black text-orange-600">{item.safety_stock}</td>
                <td className="px-4 py-4 text-center border-r border-gray-50 font-black text-[#2d808e] text-[13px]">{item.on_hand_stock}</td>
                <td className="px-4 py-4 text-center">
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
                      className="p-2 text-blue-500 hover:bg-blue-500 hover:text-white border border-blue-100 rounded-md transition-all shadow-sm"
                    >
                      <ListFilter size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
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
