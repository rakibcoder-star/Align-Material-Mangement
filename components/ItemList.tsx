import React, { useState, useRef, useEffect } from 'react';
import { Home, Search, Filter, Edit2, FileUp, Plus, Trash2, Loader2, ListFilter } from 'lucide-react';
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
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false });
    
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
        code: String(row['CODE'] || ''),
        sku: String(row['SKU'] || ''),
        name: String(row['NAME'] || ''),
        uom: String(row['UOM'] || ''),
        location: String(row['LOCATION'] || ''),
        type: String(row['TYPE'] || ''),
        group_name: String(row['GROUP'] || ''),
        last_price: parseFloat(row['LAST PRICE']) || 0,
        avg_price: parseFloat(row['AVG. PRICE']) || 0,
        safety_stock: parseInt(row['SAFETY STOCK']) || 0,
        on_hand_stock: parseInt(row['ON-HAND STOCK']) || 0
      })).filter(item => item.name && item.code);

      if (mappedItems.length > 0) {
        setLoading(true);
        const { error } = await supabase.from('items').upsert(mappedItems, { onConflict: 'code' });
        if (error) {
          alert("Error uploading CSV: " + error.message);
        } else {
          alert(`Successfully processed ${mappedItems.length} items.`);
          fetchItems();
        }
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to permanently delete "${name}"?`)) {
      const { error } = await supabase.from('items').delete().eq('id', id);
      if (error) {
        alert("Error deleting item: " + error.message);
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
            className="bg-white text-[#2d808e] border border-[#2d808e] px-4 py-1.5 rounded text-[13px] font-bold shadow-sm hover:bg-cyan-50 transition-all flex items-center space-x-2"
          >
            <FileUp size={14} />
            <span>Import CSV</span>
          </button>
          <button 
            onClick={handleAddItem}
            className="bg-[#2d808e] text-white px-6 py-1.5 rounded text-[13px] font-bold shadow-sm hover:bg-[#256b78] transition-all flex items-center space-x-2"
          >
            <Plus size={14} />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button className="border border-[#2d808e] text-[#2d808e] px-5 py-1 rounded text-[12px] font-bold hover:bg-gray-50 transition-all">
            Logs
          </button>
          <button 
            onClick={fetchItems}
            className="border border-gray-200 text-gray-500 px-5 py-1 rounded text-[12px] font-bold hover:bg-gray-50 transition-all flex items-center space-x-2"
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <span>Refresh</span>}
          </button>
        </div>
        <div className="flex items-center">
          <div className="relative flex">
            <input 
              type="text" 
              placeholder="Search by name, SKU or code"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-80 px-4 py-1.5 border border-gray-200 rounded-l outline-none text-[12px] text-gray-600 focus:border-[#2d808e]"
            />
            <button className="bg-[#2d808e] text-white px-3 rounded-r flex items-center justify-center hover:bg-[#256b78]">
              <Search size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded shadow-sm border border-gray-100 overflow-x-auto scrollbar-thin">
        <table className="w-full text-left border-collapse min-w-[1600px]">
          <thead className="bg-[#fcfcfc] sticky top-0 z-10">
            <tr className="text-[10px] font-black text-gray-700 border-b border-gray-100 uppercase tracking-tighter">
              <th className="px-3 py-4 text-center w-12 border-r border-gray-50">SL</th>
              <th className="px-3 py-4 border-r border-gray-50 text-center">Code</th>
              <th className="px-3 py-4 border-r border-gray-50 text-center">SKU</th>
              <th className="px-3 py-4 border-r border-gray-50 text-left w-64">Name</th>
              <th className="px-3 py-4 border-r border-gray-50 text-center">UOM</th>
              <th className="px-3 py-4 border-r border-gray-50 text-center">Location</th>
              <th className="px-3 py-4 border-r border-gray-50 text-center">Type</th>
              <th className="px-3 py-4 border-r border-gray-50 text-center">Group</th>
              <th className="px-3 py-4 border-r border-gray-50 text-right">Last Price</th>
              <th className="px-3 py-4 border-r border-gray-50 text-right">Avg. Price</th>
              <th className="px-3 py-4 border-r border-gray-50 text-center">Safety Stock</th>
              <th className="px-3 py-4 border-r border-gray-50 text-center">On-Hand Stock</th>
              <th className="px-3 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="text-[10px] text-gray-600 font-medium">
            {loading ? (
              <tr>
                <td colSpan={13} className="py-20 text-center text-gray-400">
                  <Loader2 className="animate-spin inline mr-2" /> Loading database items...
                </td>
              </tr>
            ) : filteredItems.map((item, idx) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                <td className="px-3 py-3 text-center border-r border-gray-50">{item.sl}</td>
                <td className="px-3 py-3 text-center border-r border-gray-50 font-bold">{item.code}</td>
                <td className="px-3 py-3 text-center border-r border-gray-50">{item.sku}</td>
                <td className="px-3 py-3 font-bold uppercase text-[10px] leading-tight border-r border-gray-50">{item.name}</td>
                <td className="px-3 py-3 text-center border-r border-gray-50">{item.uom}</td>
                <td className="px-3 py-3 text-center border-r border-gray-50 text-gray-400">{item.location}</td>
                <td className="px-3 py-3 text-center border-r border-gray-50">{item.type}</td>
                <td className="px-3 py-3 text-center border-r border-gray-50">{item.group_name}</td>
                <td className="px-3 py-3 text-right border-r border-gray-50 font-bold text-gray-700">{item.last_price}</td>
                <td className="px-3 py-3 text-right border-r border-gray-50 font-bold text-gray-700">{item.avg_price}</td>
                <td className="px-3 py-3 text-center border-r border-gray-50 font-bold text-orange-600">{item.safety_stock}</td>
                <td className="px-3 py-3 text-center border-r border-gray-50 font-black text-[#2d808e]">{item.on_hand_stock}</td>
                <td className="px-3 py-3 text-center">
                  <div className="flex items-center justify-center space-x-1.5">
                    <button 
                      onClick={() => handleEdit(item)}
                      title="Edit Item"
                      className="p-1 text-teal-600 hover:bg-teal-50 border border-teal-100 rounded transition-all"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id!, item.name)}
                      title="Delete Item"
                      className="p-1 text-red-500 hover:bg-red-50 border border-red-100 rounded transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                    <button 
                      onClick={() => setHistoryItem(item)}
                      title="View Update History"
                      className="p-1 text-blue-500 hover:bg-blue-50 border border-blue-100 rounded transition-all"
                    >
                      <ListFilter size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && filteredItems.length === 0 && (
              <tr>
                <td colSpan={13} className="py-20 text-center text-gray-300 uppercase font-black tracking-widest">
                  No Items found. Import a CSV or add manually.
                </td>
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