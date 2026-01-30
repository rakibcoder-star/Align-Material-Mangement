import React, { useState } from 'react';
import { Home, Search, History, Edit2, Filter, ChevronLeft, ChevronRight, ChevronDown, X } from 'lucide-react';

interface SupplierData {
  id: string;
  code: string;
  name: string;
  email: {
    office: string;
    contact: string;
    alternate: string;
  };
  phone: {
    office: string;
    contact: string;
    alternate: string;
  };
  type: 'Local' | 'Import';
  tin?: string;
  taxName?: string;
  taxBin?: string;
  taxAddress?: string;
  officeStreet?: string;
  officeCity?: string;
  officeCountry?: string;
  officePostal?: string;
  accountName?: string;
  accountNumber?: string;
  bankName?: string;
  branchName?: string;
  routingNumber?: string;
  swiftNumber?: string;
}

const Supplier: React.FC = () => {
  const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(10);

  // Form State
  const [formData, setFormData] = useState({
    supplierName: '',
    tin: '',
    type: '',
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
    accountName: '',
    accountNumber: '',
    bankName: '',
    branchName: '',
    routingNumber: '',
    swiftNumber: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock data matching the screenshot
  const [suppliers, setSuppliers] = useState<SupplierData[]>([
    {
      id: '1',
      code: '2000000004',
      name: 'NSR COMPUTER & STATIONERY',
      email: {
        office: 'nsr201218@yahoo.com',
        contact: 'nsr201218@yahoo.com',
        alternate: 'N/A'
      },
      phone: {
        office: '01927963132',
        contact: 'N/A',
        alternate: '01644402650'
      },
      type: 'Local',
      tin: '373350321060'
    },
    {
      id: '2',
      code: '2000000003',
      name: 'M/S SHIFA ENTERPRISE',
      email: {
        office: 'shifaenterprise567@gmail.com',
        contact: 'N/A',
        alternate: 'N/A'
      },
      phone: {
        office: '01319567649',
        contact: 'N/A',
        alternate: 'N/A'
      },
      type: 'Local'
    },
    {
      id: '3',
      code: '2000000002',
      name: 'TALUS MACHINANERY CO. LIMITED',
      email: {
        office: 'sofia@talusmachinery.com',
        contact: 'N/A',
        alternate: 'N/A'
      },
      phone: {
        office: '+8618957960072',
        contact: 'N/A',
        alternate: 'N/A'
      },
      type: 'Import'
    },
    {
      id: '4',
      code: '2000000001',
      name: 'YOUNGSAN GLONET CORPORATION',
      email: {
        office: 'N/A',
        contact: 'N/A',
        alternate: 'N/A'
      },
      phone: {
        office: '+82221831278',
        contact: 'N/A',
        alternate: 'N/A'
      },
      type: 'Import'
    }
  ]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.supplierName) newErrors.supplierName = 'Supplier Name is required';
    if (!formData.tin) newErrors.tin = 'TIN is required';
    if (!formData.type) newErrors.type = 'Type is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditClick = (supplier: SupplierData) => {
    setEditingSupplierId(supplier.id);
    setFormData({
      supplierName: supplier.name,
      tin: supplier.tin || '',
      type: supplier.type,
      phoneOffice: supplier.phone.office !== 'N/A' ? supplier.phone.office : '',
      phoneContact: supplier.phone.contact !== 'N/A' ? supplier.phone.contact : '',
      phoneAlternate: supplier.phone.alternate !== 'N/A' ? supplier.phone.alternate : '',
      emailOffice: supplier.email.office !== 'N/A' ? supplier.email.office : '',
      emailContact: supplier.email.contact !== 'N/A' ? supplier.email.contact : '',
      emailAlternate: supplier.email.alternate !== 'N/A' ? supplier.email.alternate : '',
      taxName: supplier.taxName || '',
      taxBin: supplier.taxBin || '',
      taxAddress: supplier.taxAddress || '',
      officeStreet: supplier.officeStreet || '',
      officeCity: supplier.officeCity || '',
      officeCountry: supplier.officeCountry || '',
      officePostal: supplier.officePostal || '',
      accountName: supplier.accountName || '',
      accountNumber: supplier.accountNumber || '',
      bankName: supplier.bankName || '',
      branchName: supplier.branchName || '',
      routingNumber: supplier.routingNumber || '',
      swiftNumber: supplier.swiftNumber || ''
    });
    setView('edit');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (view === 'edit' && editingSupplierId) {
      setSuppliers(prev => prev.map(s => s.id === editingSupplierId ? {
        ...s,
        name: formData.supplierName,
        tin: formData.tin,
        type: formData.type as 'Local' | 'Import',
        email: {
          office: formData.emailOffice || 'N/A',
          contact: formData.emailContact || 'N/A',
          alternate: formData.emailAlternate || 'N/A'
        },
        phone: {
          office: formData.phoneOffice || 'N/A',
          contact: formData.phoneContact || 'N/A',
          alternate: formData.phoneAlternate || 'N/A'
        },
        taxName: formData.taxName,
        taxBin: formData.taxBin,
        taxAddress: formData.taxAddress,
        officeStreet: formData.officeStreet,
        officeCity: formData.officeCity,
        officeCountry: formData.officeCountry,
        officePostal: formData.officePostal,
        accountName: formData.accountName,
        accountNumber: formData.accountNumber,
        bankName: formData.bankName,
        branchName: formData.branchName,
        routingNumber: formData.routingNumber,
        swiftNumber: formData.swiftNumber,
      } : s));
    } else {
      const newSupplier: SupplierData = {
        id: Date.now().toString(),
        code: (2000000000 + suppliers.length + 1).toString(),
        name: formData.supplierName,
        email: {
          office: formData.emailOffice || 'N/A',
          contact: formData.emailContact || 'N/A',
          alternate: formData.emailAlternate || 'N/A'
        },
        phone: {
          office: formData.phoneOffice || 'N/A',
          contact: formData.phoneContact || 'N/A',
          alternate: formData.phoneAlternate || 'N/A'
        },
        type: formData.type as 'Local' | 'Import',
        tin: formData.tin,
        taxName: formData.taxName,
        taxBin: formData.taxBin,
        taxAddress: formData.taxAddress,
        officeStreet: formData.officeStreet,
        officeCity: formData.officeCity,
        officeCountry: formData.officeCountry,
        officePostal: formData.officePostal,
        accountName: formData.accountName,
        accountNumber: formData.accountNumber,
        bankName: formData.bankName,
        branchName: formData.branchName,
        routingNumber: formData.routingNumber,
        swiftNumber: formData.swiftNumber,
      };
      setSuppliers(prev => [newSupplier, ...prev]);
    }

    resetForm();
  };

  const resetForm = () => {
    setView('list');
    setEditingSupplierId(null);
    setFormData({
      supplierName: '',
      tin: '',
      type: '',
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
      accountName: '',
      accountNumber: '',
      bankName: '',
      branchName: '',
      routingNumber: '',
      swiftNumber: ''
    });
    setErrors({});
  };

  if (view === 'add' || view === 'edit') {
    return (
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[11px] font-bold text-[#2d808e] uppercase tracking-wider">
            <Home size={14} className="text-gray-400" />
            <span className="text-gray-400">/</span>
            <button onClick={resetForm} className="text-gray-400 hover:text-[#2d808e]">Supplier</button>
            <span className="text-gray-400">/</span>
            <span>{view === 'add' ? 'Add New' : 'Update'}</span>
          </div>
          <button onClick={resetForm} className="text-gray-400 hover:text-red-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#2d808e] tracking-tight">
            {view === 'add' ? 'Add New Supplier' : 'Update Existing Supplier'}
          </h1>
        </div>

        <form onSubmit={handleFormSubmit} className="bg-white rounded shadow-sm border border-gray-100 p-8 space-y-8 max-w-[1400px] mx-auto w-full">
          {/* Main Info Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            <div className="md:col-span-5 space-y-1.5">
              <label className="text-sm font-bold text-[#2d808e]">
                <span className="text-red-500 mr-1">*</span>Supplier Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={50}
                  value={formData.supplierName}
                  onChange={(e) => handleInputChange('supplierName', e.target.value)}
                  placeholder="Supplier Name"
                  className={`w-full px-3 py-2 bg-white border ${errors.supplierName ? 'border-red-400' : 'border-[#2d808e]'} rounded focus:ring-1 focus:ring-[#2d808e] outline-none text-sm placeholder-gray-300 transition-all`}
                />
                <span className="absolute right-3 top-2 text-[10px] text-gray-400 font-bold">
                  {formData.supplierName.length} / 50
                </span>
              </div>
            </div>

            <div className="md:col-span-4 space-y-1.5">
              <label className="text-sm font-bold text-[#2d808e]">
                <span className="text-red-500 mr-1">*</span>TIN
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={50}
                  value={formData.tin}
                  onChange={(e) => handleInputChange('tin', e.target.value)}
                  placeholder="TIN No"
                  className={`w-full px-3 py-2 bg-white border ${errors.tin ? 'border-red-400' : 'border-[#2d808e]'} rounded focus:ring-1 focus:ring-[#2d808e] outline-none text-sm placeholder-gray-300 transition-all`}
                />
                <span className="absolute right-3 top-2 text-[10px] text-gray-400 font-bold">
                  {formData.tin.length} / 50
                </span>
              </div>
            </div>

            <div className="md:col-span-3 space-y-1.5">
              <label className="text-sm font-bold text-[#2d808e]">
                <span className="text-red-500 mr-1">*</span>Type
              </label>
              <div className="relative">
                <select 
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className={`w-full px-3 py-2 bg-white border ${errors.type ? 'border-red-400' : 'border-[#2d808e]'} rounded text-sm text-gray-400 appearance-none outline-none transition-all focus:ring-1 focus:ring-[#2d808e]`}
                >
                  <option value="">Supplier Type</option>
                  <option value="Local">Local</option>
                  <option value="Import">Import</option>
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Phone Numbers */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#2d808e]">Phone Numbers</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input type="text" placeholder="Office Phone Number" value={formData.phoneOffice} onChange={(e) => handleInputChange('phoneOffice', e.target.value)} className="w-full px-3 py-2 bg-white border border-[#2d808e] rounded text-sm placeholder-gray-300 outline-none" />
              <input type="text" placeholder="Contact Phone Number" value={formData.phoneContact} onChange={(e) => handleInputChange('phoneContact', e.target.value)} className="w-full px-3 py-2 bg-white border border-[#2d808e] rounded text-sm placeholder-gray-300 outline-none" />
              <input type="text" placeholder="Alternate Phone Number" value={formData.phoneAlternate} onChange={(e) => handleInputChange('phoneAlternate', e.target.value)} className="w-full px-3 py-2 bg-white border border-[#2d808e] rounded text-sm placeholder-gray-300 outline-none" />
            </div>
          </div>

          {/* Section: Email Address */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#2d808e]">Email Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input type="text" placeholder="Office mail address" value={formData.emailOffice} onChange={(e) => handleInputChange('emailOffice', e.target.value)} className="w-full px-3 py-2 bg-white border border-[#2d808e] rounded text-sm placeholder-gray-300 outline-none" />
              <input type="text" placeholder="Contact mail address" value={formData.emailContact} onChange={(e) => handleInputChange('emailContact', e.target.value)} className="w-full px-3 py-2 bg-white border border-[#2d808e] rounded text-sm placeholder-gray-300 outline-none" />
              <input type="text" placeholder="Alternate mail address" value={formData.emailAlternate} onChange={(e) => handleInputChange('emailAlternate', e.target.value)} className="w-full px-3 py-2 bg-white border border-[#2d808e] rounded text-sm placeholder-gray-300 outline-none" />
            </div>
          </div>

          {/* Section: Tax Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#2d808e]">Tax Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input type="text" placeholder="Input Name" value={formData.taxName} onChange={(e) => handleInputChange('taxName', e.target.value)} className="w-full px-3 py-2 bg-white border border-[#2d808e] rounded text-sm placeholder-gray-300 outline-none" />
              <input type="text" placeholder="Input BIN" value={formData.taxBin} onChange={(e) => handleInputChange('taxBin', e.target.value)} className="w-full px-3 py-2 bg-white border border-[#2d808e] rounded text-sm placeholder-gray-300 outline-none" />
              <input type="text" placeholder="Input Address" value={formData.taxAddress} onChange={(e) => handleInputChange('taxAddress', e.target.value)} className="w-full px-3 py-2 bg-white border border-[#2d808e] rounded text-sm placeholder-gray-300 outline-none" />
            </div>
          </div>

          {/* Section: Office Address */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#2d808e]">Office Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input type="text" placeholder="Office street" value={formData.officeStreet} onChange={(e) => handleInputChange('officeStreet', e.target.value)} className="w-full px-3 py-2 bg-white border border-[#2d808e] rounded text-sm placeholder-gray-300 outline-none" />
              <input type="text" placeholder="Office city" value={formData.officeCity} onChange={(e) => handleInputChange('officeCity', e.target.value)} className="w-full px-3 py-2 bg-white border border-[#2d808e] rounded text-sm placeholder-gray-300 outline-none" />
              <input type="text" placeholder="Office country" value={formData.officeCountry} onChange={(e) => handleInputChange('officeCountry', e.target.value)} className="w-full px-3 py-2 bg-white border border-[#2d808e] rounded text-sm placeholder-gray-300 outline-none" />
              <input type="text" placeholder="Office postal" value={formData.officePostal} onChange={(e) => handleInputChange('officePostal', e.target.value)} className="w-full px-3 py-2 bg-white border border-[#2d808e] rounded text-sm placeholder-gray-300 outline-none" />
            </div>
          </div>

          {/* Section: Payment Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#2d808e]">Payment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input type="text" placeholder="Account name" value={formData.accountName} onChange={(e) => handleInputChange('accountName', e.target.value)} className="w-full px-3 py-2 bg-white border border-[#2d808e] rounded text-sm placeholder-gray-300 outline-none" />
              <input type="text" placeholder="Account number" value={formData.accountNumber} onChange={(e) => handleInputChange('accountNumber', e.target.value)} className="w-full px-3 py-2 bg-white border border-[#2d808e] rounded text-sm placeholder-gray-300 outline-none" />
              <input type="text" placeholder="Bank name" value={formData.bankName} onChange={(e) => handleInputChange('bankName', e.target.value)} className="w-full px-3 py-2 bg-white border border-[#2d808e] rounded text-sm placeholder-gray-300 outline-none" />
              <input type="text" placeholder="Branch name" value={formData.branchName} onChange={(e) => handleInputChange('branchName', e.target.value)} className="w-full px-3 py-2 bg-white border border-[#2d808e] rounded text-sm placeholder-gray-300 outline-none" />
              <input type="text" placeholder="Routing number" value={formData.routingNumber} onChange={(e) => handleInputChange('routingNumber', e.target.value)} className="w-full px-3 py-2 bg-white border border-[#2d808e] rounded text-sm placeholder-gray-300 outline-none" />
              <input type="text" placeholder="Swift number" value={formData.swiftNumber} onChange={(e) => handleInputChange('swiftNumber', e.target.value)} className="w-full px-3 py-2 bg-white border border-[#2d808e] rounded text-sm placeholder-gray-300 outline-none" />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-2.5 bg-[#2d808e] text-white text-sm font-bold rounded shadow-lg hover:bg-[#256b78] transition-all active:scale-[0.99]"
            >
              {view === 'add' ? 'Add Supplier' : 'Update Supplier'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      {/* Top Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-[11px] font-bold text-[#2d808e] uppercase tracking-wider">
          <Home size={14} className="text-gray-400" />
          <span className="text-gray-400">/</span>
          <span>Supplier</span>
        </div>
        <button 
          onClick={() => setView('add')}
          className="bg-[#2d808e] text-white px-6 py-1.5 rounded text-[13px] font-bold shadow-sm hover:bg-[#256b78] transition-all active:scale-[0.98]"
        >
          Add Supplier
        </button>
      </div>

      {/* Action Buttons Bar */}
      <div className="flex items-center justify-between">
        <button className="flex items-center space-x-1.5 border border-[#2d808e] bg-white px-5 py-1 rounded text-[12px] font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
          <span>Logs</span>
        </button>
        
        <div className="flex items-center">
          <div className="relative flex">
            <input 
              type="text" 
              placeholder="Search by name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 px-3 py-1.5 border border-gray-300 rounded-l outline-none text-xs text-gray-600 focus:border-[#2d808e]"
            />
            <button className="bg-[#2d808e] text-white px-3 rounded-r flex items-center justify-center hover:bg-[#256b78]">
              <Search size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-[#fafbfc]">
              <tr className="text-[11px] font-bold text-gray-700 uppercase border-b border-gray-100">
                <th className="px-6 py-4 text-center w-16">SL</th>
                <th className="px-6 py-4 text-center relative w-32">
                  Code
                  <Filter size={10} className="inline-block ml-2 text-gray-300" />
                </th>
                <th className="px-6 py-4 text-left w-64">Name</th>
                <th className="px-6 py-4 text-left">Email</th>
                <th className="px-6 py-4 text-left">Phone</th>
                <th className="px-6 py-4 text-center w-24">Type</th>
                <th className="px-6 py-4 text-center w-24">Action</th>
              </tr>
            </thead>
            <tbody className="text-[11px] text-gray-600">
              {suppliers.map((supplier, index) => (
                <tr key={supplier.id} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                  <td className="px-6 py-5 text-center font-medium">{index + 1}</td>
                  <td className="px-6 py-5 text-center">{supplier.code}</td>
                  <td className="px-6 py-5 font-bold uppercase text-[10px] text-gray-700 leading-tight">
                    {supplier.name}
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <div><span className="text-gray-400">Office:</span> {supplier.email.office}</div>
                      <div><span className="text-gray-400">Contact:</span> {supplier.email.contact}</div>
                      <div><span className="text-gray-400">Alternate:</span> {supplier.email.alternate}</div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <div><span className="text-gray-400">Office:</span> {supplier.phone.office}</div>
                      <div><span className="text-gray-400">Contact:</span> {supplier.phone.contact}</div>
                      <div><span className="text-gray-400">Alternate:</span> {supplier.phone.alternate}</div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    {supplier.type}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button 
                      onClick={() => handleEditClick(supplier)}
                      className="p-1.5 text-blue-500 hover:bg-blue-50 border border-blue-100 rounded transition-all"
                    >
                      <Edit2 size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-end space-x-4 pt-2">
        <div className="flex items-center space-x-2">
          <button className="text-gray-300 cursor-not-allowed hover:text-gray-400 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <div className="w-6 h-6 flex items-center justify-center border border-[#2d808e] text-[#2d808e] text-[10px] font-bold rounded">
            1
          </div>
          <button className="text-gray-300 cursor-not-allowed hover:text-gray-400 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
        
        <div className="flex items-center space-x-2 border border-gray-200 rounded bg-white px-2 py-1">
          <select 
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="text-[11px] font-bold text-gray-600 outline-none appearance-none pr-4 bg-transparent cursor-pointer"
          >
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>
          <ChevronDown size={12} className="text-gray-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default Supplier;