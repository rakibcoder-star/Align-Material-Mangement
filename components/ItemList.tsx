import React, { useState, useRef } from 'react';
import { Home, Search, Filter, ListFilter, FileUp, Plus, Trash2 } from 'lucide-react';
import NewItem from './NewItem';
import ItemHistoryModal from './ItemHistoryModal';
import * as XLSX from 'xlsx';

export interface ItemEntry {
  sl: number;
  code: string;
  sku: string;
  name: string;
  uom: string;
  location: string;
  type: string;
  group: string;
  lastPrice: string;
  avgPrice: string;
  safetyStock: string;
  onHand: string;
}

const ItemList: React.FC = () => {
  const [view, setView] = useState<'list' | 'add'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [historyItem, setHistoryItem] = useState<ItemEntry | null>(null);
  const [items, setItems] = useState<ItemEntry[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const bstr = event.target?.result;
      const workbook = XLSX.read(bstr, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      const mappedItems: ItemEntry[] = data.map((row: any, index: number) => ({
        sl: row['SL'] || index + 1,
        code: String(row['CODE'] || ''),
        sku: String(row['SKU'] || ''),
        name: String(row['NAME'] || ''),
        uom: String(row['UOM'] || ''),
        location: String(row['LOCATION'] || ''),
        type: String(row['TYPE'] || ''),
        group: String(row['GROUP'] || ''),
        lastPrice: String(row['LAST PRICE'] || '0.00'),
        avgPrice: String(row['AVG. PRICE'] || '0.00'),
        safetyStock: String(row['SAFETY STOCK'] || '0'),
        onHand: String(row['ON-HAND STOCK'] || '0')
      }));

      setItems(mappedItems);
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddItem = (newItem: any) => {
    const entry: ItemEntry = {
      sl: items.length + 1,
      code: newItem.code || `100000${2200 + items.length}`,
      sku: newItem.sku || 'NA',
      name: newItem.name,
      uom: newItem.uom || 'Piece',
      location: newItem.location || 'N/A',
      type: newItem.type || 'Consumables',
      group: newItem.group || 'Maintenance Item',
      lastPrice: newItem.lastPrice || '0.00',
      avgPrice: newItem.avgPrice || '0.00',
      safetyStock: newItem.safetyStock || '0',
      onHand: newItem.onHand || '0'
    };
    setItems([entry, ...items]);
    setView('list');
  };

  const clearItems = () => {
    if (window.confirm("Are you sure you want to clear all items?")) {
      setItems([]);
    }
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (view === 'add') {
    return <NewItem onBack={() => setView('list')} onSubmit={handleAddItem} />;
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
            onClick={() => setView('add')}
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
            onClick={clearItems}
            className="border border-red-200 text-red-500 px-5 py-1 rounded text-[12px] font-bold hover:bg-red-50 transition-all flex items-center space-x-2"
          >
            <Trash2 size={12} />
            <span>Clear</span>
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
              <th className="px-3 py-4 border-r border-gray-50 text-center relative group">
                Code
                <Filter size={10} className="inline-block ml-1 text-gray-200" />
              </th>
              <th className="px-3 py-4 border-r border-gray-50 text-center relative group">
                SKU
                <Filter size={10} className="inline-block ml-1 text-gray-200" />
              </th>
              <th className="px-3 py-4 border-r border-gray-50 text-left relative group w-64">
                Name
                <Filter size={10} className="inline-block ml-1 text-gray-200" />
              </th>
              <th className="px-3 py-4 border-r border-gray-50 text-center">UOM</th>
              <th className="px-3 py-4 border-r border-gray-50 text-center">Location</th>
              <th className="px-3 py-4 border-r border-gray-50 text-center relative group">
                Type
                <Filter size={10} className="inline-block ml-1 text-gray-200" />
              </th>
              <th className="px-3 py-4 border-r border-gray-50 text-center relative group">
                Group
                <Filter size={10} className="inline-block ml-1 text-gray-200" />
              </th>
              <th className="px-3 py-4 border-r border-gray-50 text-right">Last Price</th>
              <th className="px-3 py-4 border-r border-gray-50 text-right">Avg. Price</th>
              <th className="px-3 py-4 border-r border-gray-50 text-center">Safety Stock</th>
              <th className="px-3 py-4 border-r border-gray-50 text-center">On-Hand Stock</th>
              <th className="px-3 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="text-[10px] text-gray-600 font-medium">
            {filteredItems.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                <td className="px-3 py-3 text-center border-r border-gray-50">{item.sl}</td>
                <td className="px-3 py-3 text-center border-r border-gray-50 font-bold">{item.code}</td>
                <td className="px-3 py-3 text-center border-r border-gray-50">{item.sku}</td>
                <td className="px-3 py-3 font-bold uppercase text-[10px] leading-tight border-r border-gray-50">{item.name}</td>
                <td className="px-3 py-3 text-center border-r border-gray-50">{item.uom}</td>
                <td className="px-3 py-3 text-center border-r border-gray-50 text-gray-400">{item.location}</td>
                <td className="px-3 py-3 text-center border-r border-gray-50">{item.type}</td>
                <td className="px-3 py-3 text-center border-r border-gray-50">{item.group}</td>
                <td className="px-3 py-3 text-right border-r border-gray-50 font-bold text-gray-700">{item.lastPrice}</td>
                <td className="px-3 py-3 text-right border-r border-gray-50 font-bold text-gray-700">{item.avgPrice}</td>
                <td className="px-3 py-3 text-center border-r border-gray-50 font-bold text-orange-600">{item.safetyStock}</td>
                <td className="px-3 py-3 text-center border-r border-gray-50 font-black text-[#2d808e]">{item.onHand}</td>
                <td className="px-3 py-3 text-center">
                  <button 
                    onClick={() => setHistoryItem(item)}
                    title="View Update History"
                    className="p-1 text-blue-500 hover:bg-blue-50 border border-blue-100 rounded transition-all"
                  >
                    <ListFilter size={12} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
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