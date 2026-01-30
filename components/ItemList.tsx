import React, { useState } from 'react';
import { Home, Search, Filter, Eye, ListFilter } from 'lucide-react';
import NewItem from './NewItem';
import ItemHistoryModal from './ItemHistoryModal';

interface ItemEntry {
  sl: number;
  code: string;
  sku: string;
  name: string;
  uom: string;
  type: string;
  group: string;
  lastPrice: string;
  avgPrice: string;
  safetyStock: string;
}

const ItemList: React.FC = () => {
  const [view, setView] = useState<'list' | 'add'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [historyItem, setHistoryItem] = useState<ItemEntry | null>(null);
  
  // Mock data matching the screenshot
  const [items, setItems] = useState<ItemEntry[]>([
    { sl: 1, code: '1000002198', sku: '3000011186', name: 'ROOFING SCREW 0.5 INCH', uom: 'Package', type: 'Spare Parts', group: 'Maintenance Item', lastPrice: '0.00', avgPrice: '0.00', safetyStock: 'NA' },
    { sl: 2, code: '1000002197', sku: '3000011185', name: 'SELF DRILLIN 1.5 INCH, SCREW TYPE', uom: 'Package', type: 'Spare Parts', group: 'Maintenance Item', lastPrice: '0.00', avgPrice: '0.00', safetyStock: 'NA' },
    { sl: 3, code: '1000002196', sku: '3000011184', name: 'GLASS DOOR LOCK ELECTROMAGNETIC DC12/24V', uom: 'Set', type: 'Spare Parts', group: 'Maintenance Item', lastPrice: '0.00', avgPrice: '0.00', safetyStock: 'NA' },
    { sl: 4, code: '1000002195', sku: '3000011183', name: 'GLASS DOOR LOCK CENTER PATCH TYPE', uom: 'Set', type: 'Spare Parts', group: 'Maintenance Item', lastPrice: '0.00', avgPrice: '0.00', safetyStock: 'NA' },
    { sl: 5, code: '1000002194', sku: '3000011182', name: 'GLASS DOOR CLOSER SPRING HYDRAULIC TYPE', uom: 'Set', type: 'Spare Parts', group: 'Maintenance Item', lastPrice: '0.00', avgPrice: '0.00', safetyStock: 'NA' },
    { sl: 6, code: '1000002193', sku: '3000011181', name: 'HYDRAULIC HOSE PIPE,S-1/2" N-1/2"', uom: 'Piece', type: 'Spare Parts', group: 'Maintenance Item', lastPrice: '0.00', avgPrice: '0.00', safetyStock: 'NA' },
    { sl: 7, code: '1000002192', sku: '310001438', name: 'SPIRAL HOSE - 8*5MM', uom: 'Piece', type: 'Consumables', group: 'Paint Item', lastPrice: '2170.44', avgPrice: '2170.44', safetyStock: 'NA' },
    { sl: 8, code: '1000002191', sku: '310001439', name: 'TOUCH UP CUP', uom: 'Piece', type: 'Consumables', group: 'Paint Item', lastPrice: '7769.18', avgPrice: '7769.18', safetyStock: 'NA' },
    { sl: 9, code: '1000002190', sku: '310001436', name: 'BAG FILTER- 150 GRIT (NEW), R-150-NMO-01-ES', uom: 'Piece', type: 'Consumables', group: 'Paint Item', lastPrice: '764.59', avgPrice: '764.59', safetyStock: 'NA' },
  ]);

  const handleAddItem = (newItem: any) => {
    const entry: ItemEntry = {
      sl: items.length + 1,
      code: `100000${2198 + items.length}`,
      sku: newItem.sku || 'NA',
      name: newItem.name,
      uom: newItem.uom || 'Piece',
      type: newItem.type || 'Consumables',
      group: newItem.group || 'Maintenance Item',
      lastPrice: '0.00',
      avgPrice: '0.00',
      safetyStock: 'NA'
    };
    setItems([entry, ...items]);
    setView('list');
  };

  if (view === 'add') {
    return <NewItem onBack={() => setView('list')} onSubmit={handleAddItem} />;
  }

  return (
    <div className="flex flex-col space-y-4">
      {/* Top Breadcrumb & Add Item Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-[11px] font-bold text-[#2d808e] uppercase tracking-wider">
          <Home size={14} className="text-gray-400" />
          <span className="text-gray-300">/</span>
          <span className="text-[#2d808e]">ITEM-LIST</span>
        </div>
        <button 
          onClick={() => setView('add')}
          className="bg-[#2d808e] text-white px-6 py-1.5 rounded text-[13px] font-bold shadow-sm hover:bg-[#256b78] transition-all"
        >
          Add Item
        </button>
      </div>

      {/* Logs and Search Section */}
      <div className="flex items-center justify-between">
        <button className="border border-[#2d808e] text-[#2d808e] px-5 py-1 rounded text-[12px] font-bold hover:bg-gray-50 transition-all">
          Logs
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

      {/* Item Table */}
      <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead className="bg-[#fcfcfc]">
              <tr className="text-[11px] font-bold text-gray-800 border-b border-gray-100 uppercase">
                <th className="px-4 py-4 text-center w-12 border-r border-gray-50">SL</th>
                <th className="px-4 py-4 border-r border-gray-50 text-center relative group">
                  Code
                  <Filter size={10} className="inline-block ml-2 text-gray-200" />
                </th>
                <th className="px-4 py-4 border-r border-gray-50 text-center relative group">
                  SKU
                  <Filter size={10} className="inline-block ml-2 text-gray-200" />
                </th>
                <th className="px-4 py-4 border-r border-gray-50 text-center relative group">
                  Name
                  <Filter size={10} className="inline-block ml-2 text-gray-200" />
                </th>
                <th className="px-4 py-4 border-r border-gray-50 text-center">UOM</th>
                <th className="px-4 py-4 border-r border-gray-50 text-center relative group">
                  Type
                  <Filter size={10} className="inline-block ml-2 text-gray-200" />
                </th>
                <th className="px-4 py-4 border-r border-gray-50 text-center relative group">
                  Group
                  <Filter size={10} className="inline-block ml-2 text-gray-200" />
                </th>
                <th className="px-4 py-4 border-r border-gray-50 text-center">Last Price</th>
                <th className="px-4 py-4 border-r border-gray-50 text-center">Avg. Price</th>
                <th className="px-4 py-4 border-r border-gray-50 text-center">Safety Stock</th>
                <th className="px-4 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="text-[11px] text-gray-600 font-medium">
              {items.map((item) => (
                <tr key={item.sl} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                  <td className="px-4 py-5 text-center">{item.sl}</td>
                  <td className="px-4 py-5 text-center">{item.code}</td>
                  <td className="px-4 py-5 text-center">{item.sku}</td>
                  <td className="px-4 py-5 font-bold uppercase text-[10px] leading-tight max-w-xs">{item.name}</td>
                  <td className="px-4 py-5 text-center">{item.uom}</td>
                  <td className="px-4 py-5 text-center">{item.type}</td>
                  <td className="px-4 py-5 text-center">{item.group}</td>
                  <td className="px-4 py-5 text-center">{item.lastPrice}</td>
                  <td className="px-4 py-5 text-center">{item.avgPrice}</td>
                  <td className="px-4 py-5 text-center">{item.safetyStock}</td>
                  <td className="px-4 py-5 text-center">
                    <button 
                      onClick={() => setHistoryItem(item)}
                      title="View Update History"
                      className="p-1.5 text-blue-500 hover:bg-blue-50 border border-blue-100 rounded transition-all"
                    >
                      <ListFilter size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {historyItem && (
        <ItemHistoryModal item={historyItem} onClose={() => setHistoryItem(null)} />
      )}
    </div>
  );
};

export default ItemList;