import React, { useState, useEffect } from 'react';
import { Home, Search, Edit2, Filter, ChevronLeft, ChevronRight, ChevronDown, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Supplier: React.FC = () => {
  const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<any>({
    supplierName: '',
    tin: '',
    type: 'Local',
    emailOffice: '',
    phoneOffice: ''
  });

  const fetchSuppliers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('suppliers').select('*').order('created_at', { ascending: false });
    if (data && !error) setSuppliers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.supplierName,
      code: `SUP-${Date.now().toString().slice(-6)}`,
      tin: formData.tin,
      type: formData.type,
      email_office: formData.emailOffice,
      phone_office: formData.phoneOffice
    };

    const { error } = await supabase.from('suppliers').insert([payload]);
    if (!error) {
      setView('list');
      fetchSuppliers();
    } else {
      alert("Error: " + error.message);
    }
  };

  if (view === 'add') {
    return (
      <div className="p-8 bg-white rounded shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-[#2d808e] mb-6">Add New Supplier</h2>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <input 
            type="text" placeholder="Supplier Name" 
            className="w-full border p-2 rounded" 
            value={formData.supplierName} onChange={e => setFormData({...formData, supplierName: e.target.value})}
          />
          <input 
            type="text" placeholder="TIN Number" 
            className="w-full border p-2 rounded" 
            value={formData.tin} onChange={e => setFormData({...formData, tin: e.target.value})}
          />
          <select 
            className="w-full border p-2 rounded"
            value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
          >
            <option value="Local">Local</option>
            <option value="Import">Import</option>
          </select>
          <button type="submit" className="w-full bg-[#2d808e] text-white py-2 rounded font-bold">Save Supplier</button>
          <button type="button" onClick={() => setView('list')} className="w-full text-gray-500 py-2">Cancel</button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Suppliers</h2>
        <button onClick={() => setView('add')} className="bg-[#2d808e] text-white px-4 py-2 rounded font-bold">Add Supplier</button>
      </div>
      <div className="bg-white border border-gray-100 rounded overflow-hidden">
        {loading ? (
          <div className="p-10 text-center">Loading...</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase">
              <tr>
                <th className="p-4">Code</th>
                <th className="p-4">Name</th>
                <th className="p-4">Type</th>
                <th className="p-4">TIN</th>
              </tr>
            </thead>
            <tbody className="text-[11px]">
              {suppliers.map(s => (
                <tr key={s.id} className="border-t border-gray-50">
                  <td className="p-4 font-bold text-blue-500">{s.code}</td>
                  <td className="p-4 uppercase font-bold">{s.name}</td>
                  <td className="p-4">{s.type}</td>
                  <td className="p-4">{s.tin || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Supplier;