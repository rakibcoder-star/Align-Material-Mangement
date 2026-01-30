import React, { useState } from 'react';
import { Home, Plus, Edit2, Search, X } from 'lucide-react';

interface CenterItem {
  sl: number;
  name: string;
  department: string;
}

const CostCenter: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [centers, setCenters] = useState<CenterItem[]>([
    { sl: 1, name: 'Maintenance', department: 'Operations' },
    { sl: 2, name: 'Security', department: 'Admin' },
    { sl: 3, name: 'Safety', department: 'EHS' },
    { sl: 4, name: 'QC', department: 'Quality' },
    { sl: 5, name: 'PDI', department: 'Operations' },
    { sl: 6, name: 'Paint Shop', department: 'Production' },
    { sl: 7, name: 'Outbound Logistic', department: 'Supply Chain' },
    { sl: 8, name: 'MMT', department: 'Operations' },
    { sl: 9, name: 'Medical', department: 'HR' },
    { sl: 10, name: 'IT', department: 'Technology' },
    { sl: 11, name: 'HR', department: 'Human Resources' },
    { sl: 12, name: 'Finance', department: 'Accounts' },
    { sl: 13, name: 'Civil', department: 'Maintenance' },
    { sl: 14, name: 'Audit', department: 'Management' },
    { sl: 15, name: 'Assembly', department: 'Production' },
    { sl: 16, name: 'Admin', department: 'Administration' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CenterItem | null>(null);
  const [formData, setFormData] = useState({ name: '', department: '' });

  const filteredCenters = centers.filter(center => 
    center.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    center.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (item?: CenterItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({ name: item.name, department: item.department });
    } else {
      setEditingItem(null);
      setFormData({ name: '', department: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) return;

    if (editingItem) {
      setCenters(centers.map(c => c.sl === editingItem.sl ? { ...c, ...formData } : c));
    } else {
      const nextSl = centers.length > 0 ? Math.max(...centers.map(c => c.sl)) + 1 : 1;
      setCenters([...centers, { sl: nextSl, ...formData }]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-[11px] font-bold text-[#2d808e] uppercase tracking-wider">
          <Home size={14} className="text-gray-400" />
          <span className="text-gray-300">/</span>
          <span className="text-[#2d808e]">COST-CENTER</span>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-[#2d808e] text-white px-6 py-1.5 rounded text-[13px] font-bold shadow-sm hover:bg-[#256b78] transition-all flex items-center gap-2"
        >
          <Plus size={14} /> Add Center
        </button>
      </div>

      <div className="flex items-center justify-between">
        <button className="border border-[#2d808e] text-[#2d808e] px-5 py-1 rounded text-[12px] font-bold hover:bg-gray-50 transition-all">
          Logs
        </button>
        <div className="flex items-center">
          <div className="relative flex">
            <input 
              type="text" 
              placeholder="Search Cost Centers"
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

      <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#fcfcfc]">
              <tr className="text-[11px] font-bold text-gray-800 border-b border-gray-100 uppercase">
                <th className="px-6 py-4 w-16 text-center">SL</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Associated Department</th>
                <th className="px-6 py-4 text-center w-24">Action</th>
              </tr>
            </thead>
            <tbody className="text-[11px] text-gray-600 font-medium">
              {filteredCenters.map((cc) => (
                <tr key={cc.sl} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                  <td className="px-6 py-4 text-center">{cc.sl}</td>
                  <td className="px-6 py-4 font-bold text-[#2d808e]">{cc.name}</td>
                  <td className="px-6 py-4">{cc.department}</td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => handleOpenModal(cc)}
                      className="p-1.5 text-blue-500 hover:bg-blue-50 border border-blue-100 rounded transition-all"
                    >
                      <Edit2 size={12} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCenters.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-gray-400 italic">
                    No matching Cost Centers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">{editingItem ? 'Edit Cost Center' : 'Add Cost Center'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2d808e] uppercase">Center Name</label>
                <input 
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Quality Control"
                  className="w-full px-3 py-2 border border-gray-200 rounded outline-none focus:border-[#2d808e] text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2d808e] uppercase">Department</label>
                <input 
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g., Production"
                  className="w-full px-3 py-2 border border-gray-200 rounded outline-none focus:border-[#2d808e] text-sm"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="bg-[#2d808e] text-white px-8 py-2 rounded text-sm font-bold shadow-sm hover:bg-[#256b78] transition-all"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostCenter;