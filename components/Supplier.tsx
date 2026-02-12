
import React, { useState, useEffect } from 'react';
import { Home, Search, Edit2, Filter, ChevronDown, X, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Supplier: React.FC = () => {
  const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Data State
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
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data && !error) setSuppliers(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplierName) return alert("Supplier Name is required");
    
    setIsSubmitting(true);
    
    try {
      // 1. Get last code for auto-increment simulation
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

      // 2. Prepare Payload
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
        
        address_street: formData.officeStreet, // Fixed column name
        address_city: formData.officeCity,
        address_country: formData.officeCountry,
        address_postal: formData.officePostal,
        
        pay_acc_name: formData.accName,
        pay_acc_no: formData.accNumber,
        pay_bank: formData.bankName,
        pay_branch: formData.branchName,
        pay_routing: formData.routingNumber,
        pay_swift: formData.swiftNumber
      };

      const { error } = await supabase.from('suppliers').insert([payload]);
      
      if (error) {
        console.error("Supabase Detailed Error:", error);
        throw new Error(error.message);
      }

      alert(`Supplier ${formData.supplierName} added successfully!`);
      setView('list');
      fetchSuppliers();
      resetForm();
    } catch (err: any) {
      alert("Database Error: " + err.message + "\n\nMake sure to run the latest supabase_schema.sql in your Supabase SQL Editor.");
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

  const ContactCell = ({ type, data, prefix }: { type: string, data: any, prefix: 'email' | 'phone' }) => {
    const office = data[`${prefix}_office`];
    const contact = data[`${prefix}_contact`];
    const alternate = data[`${prefix}_alternate`];

    return (
      <div className="flex flex-col space-y-0.5 text-[10px] py-2">
        <div className="flex space-x-1">
          <span className="text-gray-600 font-bold">Office:</span>
          <span className="text-gray-500 font-medium truncate max-w-[150px]">{office || 'N/A'}</span>
        </div>
        <div className="flex space-x-1">
          <span className="text-gray-600 font-bold">Contact:</span>
          <span className="text-gray-500 font-medium">{contact || 'N/A'}</span>
        </div>
        <div className="flex space-x-1">
          <span className="text-gray-600 font-bold">Alternate:</span>
          <span className="text-gray-500 font-medium">{alternate || 'N/A'}</span>
        </div>
      </div>
    );
  };

  if (view === 'add') {
    return (
      <div className="flex flex-col space-y-4 font-sans antialiased text-gray-800 pb-12">
        <div className="flex items-center space-x-2 text-[10px] font-bold text-[#2d808e] uppercase tracking-wider mb-2">
          <Home size={12} className="text-gray-400" />
          <span className="text-gray-300">/</span>
          <button onClick={() => setView('list')} className="text-gray-400 hover:text-[#2d808e] transition-colors uppercase">SUPPLIER</button>
          <span className="text-gray-300">/</span>
          <span className="text-[#2d808e]">ADD NEW</span>
        </div>

        <div className="text-center py-4">
          <h1 className="text-[24px] font-bold text-[#2d808e] tracking-tight">Add New Supplier</h1>
        </div>

        <form onSubmit={handleFormSubmit} className="bg-white rounded-md shadow-sm border border-gray-100 p-10 space-y-10 max-w-[1400px] mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-[14px] font-bold text-[#2d808e]"><span className="text-red-500 mr-1">*</span>Supplier Name</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Supplier Name" 
                  maxLength={50}
                  value={formData.supplierName} 
                  onChange={e => setFormData({...formData, supplierName: e.target.value})} 
                  className="w-full px-4 py-2.5 border border-[#2d808e]/30 rounded text-sm outline-none focus:border-[#2d808e] placeholder:text-gray-300" 
                  required 
                />
                <span className="absolute right-3 top-2.5 text-[10px] text-gray-400 font-medium">{formData.supplierName.length} / 50</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[14px] font-bold text-[#2d808e]">TIN</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="TIN No" 
                  maxLength={50}
                  value={formData.tin} 
                  onChange={e => setFormData({...formData, tin: e.target.value})} 
                  className="w-full px-4 py-2.5 border border-[#2d808e]/30 rounded text-sm outline-none focus:border-[#2d808e] placeholder:text-gray-300" 
                />
                <span className="absolute right-3 top-2.5 text-[10px] text-gray-400 font-medium">{formData.tin.length} / 50</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[14px] font-bold text-[#2d808e]"><span className="text-red-500 mr-1">*</span>Type</label>
              <div className="relative">
                <select 
                  value={formData.type} 
                  onChange={e => setFormData({...formData, type: e.target.value})} 
                  className="w-full px-4 py-2.5 border border-[#2d808e]/30 rounded text-sm outline-none appearance-none bg-white text-gray-400 font-medium"
                >
                  <option value="Local">Local</option>
                  <option value="Import">Import</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[14px] font-bold text-[#2d808e]">Phone Numbers</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <input type="text" placeholder="Office Phone Number" value={formData.phoneOffice} onChange={e => setFormData({...formData, phoneOffice: e.target.value})} className="w-full px-4 py-2.5 border border-[#2d808e]/30 rounded text-sm outline-none placeholder:text-gray-300" />
              <input type="text" placeholder="Contact Phone Number" value={formData.phoneContact} onChange={e => setFormData({...formData, phoneContact: e.target.value})} className="w-full px-4 py-2.5 border border-[#2d808e]/30 rounded text-sm outline-none placeholder:text-gray-300" />
              <input type="text" placeholder="Alternate Phone Number" value={formData.phoneAlternate} onChange={e => setFormData({...formData, phoneAlternate: e.target.value})} className="w-full px-4 py-2.5 border border-[#2d808e]/30 rounded text-sm outline-none placeholder:text-gray-300" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[14px] font-bold text-[#2d808e]">Email Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <input type="email" placeholder="Office mail address" value={formData.emailOffice} onChange={e => setFormData({...formData, emailOffice: e.target.value})} className="w-full px-4 py-2.5 border border-[#2d808e]/30 rounded text-sm outline-none placeholder:text-gray-300" />
              <input type="email" placeholder="Contact mail address" value={formData.emailContact} onChange={e => setFormData({...formData, emailContact: e.target.value})} className="w-full px-4 py-2.5 border border-[#2d808e]/30 rounded text-sm outline-none placeholder:text-gray-300" />
              <input type="email" placeholder="Alternate mail address" value={formData.emailAlternate} onChange={e => setFormData({...formData, emailAlternate: e.target.value})} className="w-full px-4 py-2.5 border border-[#2d808e]/30 rounded text-sm outline-none placeholder:text-gray-300" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-[14px] font-bold text-[#2d808e]">Tax Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <input type="text" placeholder="Input Name" value={formData.taxName} onChange={e => setFormData({...formData, taxName: e.target.value})} className="w-full px-4 py-2.5 border border-[#2d808e]/30 rounded text-sm outline-none placeholder:text-gray-300" />
              <input type="text" placeholder="Input BIN" value={formData.taxBin} onChange={e => setFormData({...formData, taxBin: e.target.value})} className="w-full px-4 py-2.5 border border-[#2d808e]/30 rounded text-sm outline-none placeholder:text-gray-300" />
              <input type="text" placeholder="Input Address" value={formData.taxAddress} onChange={e => setFormData({...formData, taxAddress: e.target.value})} className="w-full px-4 py-2.5 border border-[#2d808e]/30 rounded text-sm outline-none placeholder:text-gray-300" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[14px] font-bold text-[#2d808e]">Office Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input type="text" placeholder="Office street" value={formData.officeStreet} onChange={e => setFormData({...formData, officeStreet: e.target.value})} className="w-full px-4 py-2.5 border border-[#2d808e]/30 rounded text-sm outline-none placeholder:text-gray-300" />
              <input type="text" placeholder="Office city" value={formData.officeCity} onChange={e => setFormData({...formData, officeCity: e.target.value})} className="w-full px-4 py-2.5 border border-[#2d808e]/30 rounded text-sm outline-none placeholder:text-gray-300" />
              <input type="text" placeholder="Office country" value={formData.officeCountry} onChange={e => setFormData({...formData, officeCountry: e.target.value})} className="w-full px-4 py-2.5 border border-[#2d808e]/30 rounded text-sm outline-none placeholder:text-gray-300" />
              <input type="text" placeholder="Office postal" value={formData.officePostal} onChange={e => setFormData({...formData, officePostal: e.target.value})} className="w-full px-4 py-2.5 border border-[#2d808e]/30 rounded text-sm outline-none placeholder:text-gray-300" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[14px] font-bold text-[#2d808e]">Payment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <input type="text" placeholder="Account name" value={formData.accName} onChange={e => setFormData({...formData, accName: e.target.value})} className="w-full px-4 py-2.5 border border-[#2d808e]/30 rounded text-sm outline-none placeholder:text-gray-300" />
              <input type="text" placeholder="Account number" value={formData.accNumber} onChange={e => setFormData({...formData, accNumber: e.target.value})} className="w-full px-4 py-2.5 border border-[#2d808e]/30 rounded text-sm outline-none placeholder:text-gray-300" />
              <input type="text" placeholder="Bank name" value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} className="w-full px-4 py-2.5 border border-[#2d808e]/30 rounded text-sm outline-none placeholder:text-gray-300" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <input type="text" placeholder="Branch name" value={formData.branchName} onChange={e => setFormData({...formData, branchName: e.target.value})} className="w-full px-4 py-2.5 border border-[#2d808e]/30 rounded text-sm outline-none placeholder:text-gray-300" />
              <input type="text" placeholder="Routing number" value={formData.routingNumber} onChange={e => setFormData({...formData, routingNumber: e.target.value})} className="w-full px-4 py-2.5 border border-[#2d808e]/30 rounded text-sm outline-none placeholder:text-gray-300" />
              <input type="text" placeholder="Swift number" value={formData.swiftNumber} onChange={e => setFormData({...formData, swiftNumber: e.target.value})} className="w-full px-4 py-2.5 border border-[#2d808e]/30 rounded text-sm outline-none placeholder:text-gray-300" />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full py-4 bg-[#247d8c] text-white text-[16px] font-bold rounded-md shadow hover:bg-[#1d6470] transition-all flex items-center justify-center space-x-3 active:scale-[0.99]"
          >
            {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : null}
            <span>{isSubmitting ? 'Processing...' : 'Add Supplier'}</span>
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
          <span className="text-[#2d808e] font-bold">SUPPLIER</span>
        </div>
        <button 
          onClick={() => setView('add')} 
          className="bg-[#247d8c] text-white px-8 py-2.5 rounded text-[12px] font-bold shadow-sm hover:bg-[#1d6470] transition-all uppercase tracking-widest"
        >
          Add Supplier
        </button>
      </div>

      <div className="flex items-center justify-between">
        <button className="px-6 py-1 border border-[#247d8c] text-[#247d8c] rounded text-[11px] font-bold hover:bg-[#247d8c] hover:text-white transition-all">
          Logs
        </button>

        <div className="flex items-center">
          <div className="relative flex">
            <input 
              type="text" 
              placeholder="Search by name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 px-4 py-1.5 border border-gray-200 rounded-l outline-none text-[11px] font-medium text-gray-600 focus:border-[#247d8c]"
            />
            <button className="bg-[#247d8c] text-white px-3.5 rounded-r flex items-center justify-center hover:bg-[#1d6470]">
              <Search size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead className="bg-[#fafbfc]">
              <tr className="text-[10px] font-bold text-gray-700 uppercase tracking-tight border-b border-gray-100">
                <th className="px-6 py-5 text-center w-16 border-r border-gray-50">SL</th>
                <th className="px-6 py-5 text-center border-r border-gray-50 w-32">
                   <div className="flex items-center justify-center space-x-1">
                     <span>Code</span>
                     <Filter size={10} className="text-gray-300" />
                   </div>
                </th>
                <th className="px-6 py-5 border-r border-gray-50">Name</th>
                <th className="px-6 py-5 border-r border-gray-50">Email</th>
                <th className="px-6 py-5 border-r border-gray-50">Phone</th>
                <th className="px-6 py-5 text-center w-24 border-r border-gray-50">Type</th>
                <th className="px-6 py-5 text-center w-24">Action</th>
              </tr>
            </thead>
            <tbody className="text-[11px] font-bold text-gray-600">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-32 text-center text-gray-400 font-bold uppercase tracking-widest">
                    <Loader2 className="animate-spin inline mr-3" /> Syncing Records...
                  </td>
                </tr>
              ) : filteredSuppliers.length > 0 ? filteredSuppliers.map((s, idx) => (
                <tr key={s.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50">
                  <td className="px-6 py-5 text-center text-gray-400">{idx + 1}</td>
                  <td className="px-6 py-5 text-center font-bold text-gray-800">{s.code}</td>
                  <td className="px-6 py-5 font-bold text-[#1a2b3c] leading-tight uppercase w-48">{s.name}</td>
                  <td className="px-6 py-5 border-r border-gray-50">
                    <ContactCell type="Email" data={s} prefix="email" />
                  </td>
                  <td className="px-6 py-5 border-r border-gray-50">
                    <ContactCell type="Phone" data={s} prefix="phone" />
                  </td>
                  <td className="px-6 py-5 text-center border-r border-gray-50">
                    <span className="text-gray-500 font-bold">{s.type}</span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button className="p-1.5 text-blue-500 border border-blue-100 rounded bg-blue-50/50 hover:bg-blue-100 transition-all shadow-sm">
                      <Edit2 size={13} strokeWidth={3} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={7} className="py-32 text-center text-gray-300 font-bold uppercase tracking-[0.2em]">No Records Found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Supplier;
