import React, { useState, useEffect } from 'react';
import { Home, Search, Edit2, Filter, ChevronLeft, ChevronRight, ChevronDown, X, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Supplier: React.FC = () => {
  const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Data State matching all UI fields
  const [formData, setFormData] = useState<any>({
    supplierName: '',
    tin: '',
    type: 'Local',
    phoneOffice: '',
    phoneContact: '',
    phoneAlternate: '',
    emailOffice: '',
    emailContact: '',
    emailAlternate: '',
    taxName: '',
    taxBin: '',
    taxAddress: '',
    officeStreet: '',
    officeCity: '',
    officeCountry: '',
    officePostal: '',
    accName: '',
    accNumber: '',
    bankName: '',
    branchName: '',
    routingNumber: '',
    swiftNumber: ''
  });

  const fetchSuppliers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data && !error) setSuppliers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplierName) return alert("Supplier Name is required");
    
    setIsSubmitting(true);
    
    try {
      // Auto-generate code starting from 2000000001
      const { data: lastSupplier } = await supabase
        .from('suppliers')
        .select('code')
        .order('code', { ascending: false })
        .limit(1);

      let nextCode = '2000000001';
      if (lastSupplier && lastSupplier.length > 0) {
        const lastVal = parseInt(lastSupplier[0].code);
        if (!isNaN(lastVal)) {
          nextCode = (lastVal + 1).toString();
        }
      }

      // Payload exactly matching the SQL Schema
      const payload = {
        name: formData.supplierName,
        code: nextCode,
        tin: formData.tin,
        type: formData.type || 'Local',
        phone_office: formData.phoneOffice,
        phone_contact: formData.phoneContact,
        phone_alternate: formData.phoneAlternate,
        email_office: formData.emailOffice,
        email_contact: formData.emailContact,
        email_alternate: formData.emailAlternate,
        tax_name: formData.taxName,
        tax_bin: formData.taxBin,
        tax_address: formData.taxAddress,
        addr_street: formData.officeStreet,
        addr_city: formData.officeCity, 
        addr_country: formData.officeCountry,
        addr_postal: formData.officePostal, // Correctly sending postal code
        pay_acc_name: formData.accName,
        pay_acc_no: formData.accNumber,
        pay_bank: formData.bankName,
        pay_branch: formData.branchName,
        pay_routing: formData.routingNumber,
        pay_swift: formData.swiftNumber
      };

      const { error } = await supabase.from('suppliers').insert([payload]);
      
      if (error) throw error;

      alert(`Supplier ${formData.supplierName} added successfully!`);
      setView('list');
      fetchSuppliers();
      resetForm();
    } catch (err: any) {
      alert("Error Saving Supplier: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      supplierName: '', tin: '', type: 'Local', phoneOffice: '', phoneContact: '', phoneAlternate: '',
      emailOffice: '', emailContact: '', emailAlternate: '', taxName: '', taxBin: '', taxAddress: '',
      officeStreet: '', officeCity: '', officeCountry: '', officePostal: '',
      accName: '', accNumber: '', bankName: '', branchName: '', routingNumber: '', swiftNumber: ''
    });
  };

  const filteredSuppliers = suppliers.filter(s => 
    (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.code || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (view === 'add') {
    return (
      <div className="flex flex-col space-y-4 font-sans antialiased text-gray-800">
        <div className="flex items-center space-x-2 text-[10px] font-bold text-[#2d808e] uppercase tracking-wider">
          <Home size={12} className="text-gray-400" />
          <span className="text-gray-300">/</span>
          <button onClick={() => setView('list')} className="text-gray-400 hover:text-[#2d808e] transition-colors uppercase">SUPPLIER</button>
          <span className="text-gray-300">/</span>
          <span className="text-[#2d808e]">ADD NEW</span>
        </div>

        <div className="text-center py-2">
          <h1 className="text-[20px] font-black text-[#2d808e] tracking-tight uppercase">Add New Supplier</h1>
        </div>

        <form onSubmit={handleFormSubmit} className="bg-white rounded shadow-sm border border-gray-100 p-8 space-y-8 max-w-[1600px] mx-auto w-full transition-all">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-[#2d808e] uppercase tracking-tighter"><span className="text-red-500 mr-1">*</span>Supplier Name</label>
              <div className="relative group">
                <input type="text" maxLength={50} placeholder="Supplier Name" value={formData.supplierName} onChange={e => setFormData({...formData, supplierName: e.target.value})} className="w-full px-4 py-2 border border-cyan-700/20 rounded-lg text-[11px] font-bold outline-none focus:border-[#2d808e] transition-all" required />
                <span className="absolute right-2 top-2.5 text-[8px] font-black text-gray-300">{formData.supplierName.length} / 50</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-[#2d808e] uppercase tracking-tighter"><span className="text-red-500 mr-1">*</span>TIN</label>
              <div className="relative group">
                <input type="text" maxLength={50} placeholder="TIN No" value={formData.tin} onChange={e => setFormData({...formData, tin: e.target.value})} className="w-full px-4 py-2 border border-cyan-700/20 rounded-lg text-[11px] font-bold outline-none focus:border-[#2d808e] transition-all" required />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-[#2d808e] uppercase tracking-tighter"><span className="text-red-500 mr-1">*</span>Type</label>
              <div className="relative">
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-2 border border-cyan-700/20 rounded-lg text-[11px] font-bold outline-none appearance-none bg-white text-gray-700 focus:border-[#2d808e] transition-all" required>
                  <option value="Local">Local</option>
                  <option value="Import">Import</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[11px] font-black text-[#2d808e] uppercase tracking-[0.2em] border-b border-gray-50 pb-2">Phone Numbers</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <input type="text" placeholder="Office Phone Number" value={formData.phoneOffice} onChange={e => setFormData({...formData, phoneOffice: e.target.value})} className="w-full px-4 py-2 border border-cyan-700/20 rounded-lg text-[11px] font-bold outline-none focus:border-[#2d808e] transition-all" />
              <input type="text" placeholder="Contact Phone Number" value={formData.phoneContact} onChange={e => setFormData({...formData, phoneContact: e.target.value})} className="w-full px-4 py-2 border border-cyan-700/20 rounded-lg text-[11px] font-bold outline-none focus:border-[#2d808e] transition-all" />
              <input type="text" placeholder="Alternate Phone Number" value={formData.phoneAlternate} onChange={e => setFormData({...formData, phoneAlternate: e.target.value})} className="w-full px-4 py-2 border border-cyan-700/20 rounded-lg text-[11px] font-bold outline-none focus:border-[#2d808e] transition-all" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[11px] font-black text-[#2d808e] uppercase tracking-[0.2em] border-b border-gray-50 pb-2">Email Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <input type="text" placeholder="Office mail address" value={formData.emailOffice} onChange={e => setFormData({...formData, emailOffice: e.target.value})} className="w-full px-4 py-2 border border-cyan-700/20 rounded-lg text-[11px] font-bold outline-none focus:border-[#2d808e] transition-all" />
              <input type="text" placeholder="Contact mail address" value={formData.emailContact} onChange={e => setFormData({...formData, emailContact: e.target.value})} className="w-full px-4 py-2 border border-cyan-700/20 rounded-lg text-[11px] font-bold outline-none focus:border-[#2d808e] transition-all" />
              <input type="text" placeholder="Alternate mail address" value={formData.emailAlternate} onChange={e => setFormData({...formData, emailAlternate: e.target.value})} className="w-full px-4 py-2 border border-cyan-700/20 rounded-lg text-[11px] font-bold outline-none focus:border-[#2d808e] transition-all" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[11px] font-black text-[#2d808e] uppercase tracking-[0.2em] border-b border-gray-50 pb-2">Office Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input type="text" placeholder="Office street" value={formData.officeStreet} onChange={e => setFormData({...formData, officeStreet: e.target.value})} className="w-full px-4 py-2 border border-cyan-700/20 rounded-lg text-[11px] font-bold outline-none focus:border-[#2d808e] transition-all" />
              <input type="text" placeholder="Office city" value={formData.officeCity} onChange={e => setFormData({...formData, officeCity: e.target.value})} className="w-full px-4 py-2 border border-cyan-700/20 rounded-lg text-[11px] font-bold outline-none focus:border-[#2d808e] transition-all" />
              <input type="text" placeholder="Office country" value={formData.officeCountry} onChange={e => setFormData({...formData, officeCountry: e.target.value})} className="w-full px-4 py-2 border border-cyan-700/20 rounded-lg text-[11px] font-bold outline-none focus:border-[#2d808e] transition-all" />
              <input type="text" placeholder="Office postal" value={formData.officePostal} onChange={e => setFormData({...formData, officePostal: e.target.value})} className="w-full px-4 py-2 border border-cyan-700/20 rounded-lg text-[11px] font-bold outline-none focus:border-[#2d808e] transition-all" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[11px] font-black text-[#2d808e] uppercase tracking-[0.2em] border-b border-gray-50 pb-2">Payment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <input type="text" placeholder="Account name" value={formData.accName} onChange={e => setFormData({...formData, accName: e.target.value})} className="w-full px-4 py-2 border border-cyan-700/20 rounded-lg text-[11px] font-bold outline-none focus:border-[#2d808e] transition-all" />
              <input type="text" placeholder="Account number" value={formData.accNumber} onChange={e => setFormData({...formData, accNumber: e.target.value})} className="w-full px-4 py-2 border border-cyan-700/20 rounded-lg text-[11px] font-bold outline-none focus:border-[#2d808e] transition-all" />
              <input type="text" placeholder="Bank name" value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} className="w-full px-4 py-2 border border-cyan-700/20 rounded-lg text-[11px] font-bold outline-none focus:border-[#2d808e] transition-all" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <input type="text" placeholder="Branch name" value={formData.branchName} onChange={e => setFormData({...formData, branchName: e.target.value})} className="w-full px-4 py-2 border border-cyan-700/20 rounded-lg text-[11px] font-bold outline-none focus:border-[#2d808e] transition-all" />
              <input type="text" placeholder="Routing number" value={formData.routingNumber} onChange={e => setFormData({...formData, routingNumber: e.target.value})} className="w-full px-4 py-2 border border-cyan-700/20 rounded-lg text-[11px] font-bold outline-none focus:border-[#2d808e] transition-all" />
              <input type="text" placeholder="Swift number" value={formData.swiftNumber} onChange={e => setFormData({...formData, swiftNumber: e.target.value})} className="w-full px-4 py-2 border border-cyan-700/20 rounded-lg text-[11px] font-bold outline-none focus:border-[#2d808e] transition-all" />
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-[#2d808e] text-white text-[13px] font-black rounded-xl shadow-xl shadow-cyan-900/10 hover:bg-[#256b78] transition-all uppercase tracking-[0.2em] flex items-center justify-center space-x-3 active:scale-[0.99] disabled:opacity-50">
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : null}
            <span>{isSubmitting ? 'Processing...' : 'Commit Supplier Entry'}</span>
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 font-sans antialiased text-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-[10px] font-bold text-[#2d808e] uppercase tracking-wider">
          <Home size={14} className="text-gray-400" />
          <span className="text-gray-300">/</span>
          <span className="text-[#2d808e] font-black">SUPPLIER</span>
        </div>
        <button onClick={() => setView('add')} className="bg-[#2d808e] text-white px-8 py-2 rounded-lg text-[11px] font-black shadow-lg shadow-cyan-900/10 hover:bg-[#256b78] transition-all uppercase tracking-widest">
          Add Supplier
        </button>
      </div>

      <div className="flex items-center justify-between">
        <button className="border border-[#2d808e] text-[#2d808e] px-6 py-1.5 rounded text-[11px] font-black hover:bg-gray-50 transition-all uppercase tracking-widest">Logs</button>
        <div className="flex items-center">
          <div className="relative flex">
            <input type="text" placeholder="Search by name" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-64 px-4 py-1.5 bg-white border border-gray-100 rounded-l-lg outline-none text-[11px] text-gray-600 focus:border-[#2d808e] transition-all shadow-sm" />
            <button className="bg-[#2d808e] text-white px-4 rounded-r-lg flex items-center justify-center hover:bg-[#256b78] transition-all">
              <Search size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden min-h-[500px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead className="bg-[#fafbfc]">
              <tr className="text-[10px] font-black text-gray-700 uppercase tracking-tight border-b border-gray-100">
                <th className="px-6 py-5 text-center w-16 border-r border-gray-50">SL</th>
                <th className="px-6 py-5 text-center border-r border-gray-50 w-32">
                  Code <Filter size={10} className="inline-block ml-1 text-gray-300" />
                </th>
                <th className="px-6 py-5 border-r border-gray-50">Name</th>
                <th className="px-6 py-5 border-r border-gray-50">Email</th>
                <th className="px-6 py-5 border-r border-gray-50">Phone</th>
                <th className="px-6 py-5 text-center border-r border-gray-50 w-24">Type</th>
                <th className="px-6 py-5 text-center w-24">Action</th>
              </tr>
            </thead>
            <tbody className="text-[11px] font-bold text-gray-600 uppercase tracking-tighter">
              {loading ? (
                <tr><td colSpan={7} className="py-32 text-center text-gray-400 uppercase tracking-[0.2em] font-black"><Loader2 className="animate-spin inline mr-3" /> Syncing Global Records...</td></tr>
              ) : filteredSuppliers.length > 0 ? filteredSuppliers.map((s, idx) => (
                <tr key={s.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50">
                  <td className="px-6 py-5 text-center text-gray-400">{idx + 1}</td>
                  <td className="px-6 py-5 text-center font-black text-gray-800">{s.code}</td>
                  <td className="px-6 py-5 font-black text-[#2d808e] leading-tight w-64">{s.name}</td>
                  <td className="px-6 py-5 space-y-1 lowercase text-gray-400 font-medium">
                    <p><span className="font-black uppercase text-[8px] text-gray-300">Office:</span> {s.email_office || 'N/A'}</p>
                    <p><span className="font-black uppercase text-[8px] text-gray-300">Contact:</span> {s.email_contact || 'N/A'}</p>
                  </td>
                  <td className="px-6 py-5 space-y-1 text-gray-400 font-medium">
                    <p><span className="font-black uppercase text-[8px] text-gray-300">Office:</span> {s.phone_office || 'N/A'}</p>
                    <p><span className="font-black uppercase text-[8px] text-gray-300">Contact:</span> {s.phone_contact || 'N/A'}</p>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-lg text-gray-500 font-black text-[9px]">{s.type}</span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button className="p-2 text-[#2d808e] hover:bg-cyan-50 border border-cyan-100 rounded-lg transition-all shadow-sm">
                      <Edit2 size={14} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={7} className="py-32 text-center text-gray-300 font-black uppercase tracking-[0.2em]">No Database Records Found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-end space-x-4 pt-4">
        <div className="flex items-center space-x-1">
          <button className="p-1.5 text-gray-300 hover:text-[#2d808e]"><ChevronLeft size={18} /></button>
          <button className="w-8 h-8 flex items-center justify-center text-[11px] font-black rounded-lg border border-[#2d808e] bg-white text-[#2d808e] shadow-sm">1</button>
          <button className="p-1.5 text-gray-300 hover:text-[#2d808e]"><ChevronRight size={18} /></button>
        </div>
        <div className="relative">
          <select className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-1.5 text-[11px] font-black text-gray-500 pr-10 outline-none cursor-pointer shadow-sm focus:border-[#2d808e]" defaultValue="10 / page">
            <option>10 / page</option>
            <option>20 / page</option>
            <option>50 / page</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default Supplier;