import React, { useState, useEffect } from 'react';
import { Home, Plus, ChevronDown, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface RequisitionItem {
  id: string;
  name: string;
  sku: string;
  specification: string;
  brand: string;
  uom: string;
  unitPrice: string;
  onHand: string;
  reqQty: string;
  remarks: string;
}

interface NewPurchaseRequisitionProps {
  onBack: () => void;
  onSubmit: (newPR: any) => void;
  initialData?: any;
}

const NewPurchaseRequisition: React.FC<NewPurchaseRequisitionProps> = ({ onBack, onSubmit, initialData }) => {
  const { user } = useAuth();
  const [prReference, setPrReference] = useState(initialData?.PR || '');
  const [prNote, setPrNote] = useState(initialData?.note || '');
  const [supplierType, setSupplierType] = useState(initialData?.type || '');
  
  // Requester Details State
  const [requesterName, setRequesterName] = useState(initialData?.reqBy || 'Md Azizul Hakim');
  const [contactNumber, setContactNumber] = useState(initialData?.contact || '+880 1777 702323');
  const [emailAddress, setEmailAddress] = useState(initialData?.email || user?.email || 'azizul.hakim@fairtechnology.com.bd');
  const [costCenter, setCostCenter] = useState(initialData?.reqDpt || 'MMT');

  const [items, setItems] = useState<RequisitionItem[]>(
    initialData?.items || [
      {
        id: '1',
        name: initialData?.name || '',
        sku: initialData?.SKU || '',
        specification: initialData?.spec || '',
        brand: '',
        uom: initialData?.UOM || '',
        unitPrice: initialData?.PRPrice || '',
        onHand: '',
        reqQty: initialData?.reqQty || '',
        remarks: '',
      }
    ]
  );

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        name: '',
        sku: '',
        specification: '',
        brand: '',
        uom: '',
        unitPrice: '',
        onHand: '',
        reqQty: '',
        remarks: '',
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      if (window.confirm('Are you sure you want to remove this item from the requisition?')) {
        setItems(items.filter((item) => item.id !== id));
      }
    } else {
      alert('A requisition must have at least one item.');
    }
  };

  const updateItem = (id: string, field: keyof RequisitionItem, value: string) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleFormSubmit = () => {
    if (!supplierType) {
      alert('Please select a Supplier Type.');
      return;
    }

    const hasIncompleteItems = items.some(item => !item.name || !item.uom || !item.reqQty);
    if (hasIncompleteItems) {
      alert('Please fill in all required item fields (Name, UOM, and Req. Qty).');
      return;
    }

    // Generate new PR object
    const totalQty = items.reduce((sum, item) => sum + (Number(item.reqQty) || 0), 0);
    const totalValue = items.reduce((sum, item) => sum + (Number(item.reqQty) * Number(item.unitPrice) || 0), 0);
    
    const newPR = {
      PR: prReference || (initialData?.PR || `3000000${Math.floor(Math.random() * 900) + 100}`),
      code: items[0]?.sku || 'NA',
      SKU: items[0]?.sku || 'NA',
      name: items[0]?.name || 'NEW REQUISITION',
      spec: items[0]?.specification || '',
      UOM: items[0]?.uom || 'PC',
      PRPrice: Number(items[0]?.unitPrice) || 0,
      reqQty: totalQty,
      POQty: initialData?.POQty || 0,
      recQty: initialData?.recQty || 0,
      reqDpt: costCenter,
      reqBy: requesterName,
      createdAt: initialData?.createdAt || new Date().toISOString().slice(0, 16).replace('T', ' '),
      updateBy: 'Sohel Rana',
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      status: initialData?.status || 'In-Process',
      value: totalValue,
      items: items, // Persist full item list for re-editing
      note: prNote,
      type: supplierType,
      contact: contactNumber,
      email: emailAddress
    };

    onSubmit(newPR);
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-[11px] font-bold text-[#2d808e] uppercase tracking-wider">
        <Home size={14} className="text-gray-400" />
        <span className="text-gray-400">/</span>
        <button onClick={onBack} className="hover:underline transition-all text-gray-400">Purchase-Requisition</button>
        <span className="text-gray-400">/</span>
        <span>{initialData ? 'Edit' : 'New'}</span>
      </div>

      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#2d808e] tracking-tight">
          {initialData ? `Edit Requisition: ${initialData.PR}` : 'New Purchase Requisition'}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 space-y-8">
        {/* Top Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-[#2d808e]">PR Referance</label>
            <div className="relative">
              <input
                type="text"
                maxLength={30}
                value={prReference}
                onChange={(e) => setPrReference(e.target.value)}
                placeholder="PR Referance"
                className="w-full px-3 py-2 bg-white border border-[#2d808e]/40 rounded focus:border-[#2d808e] outline-none text-sm placeholder-gray-300 transition-all"
              />
              <span className="absolute right-3 top-2 text-[10px] text-gray-400 font-bold">
                {prReference.length} / 30
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-[#2d808e]">
              <span className="text-red-500 mr-1">*</span>Type
            </label>
            <div className="relative">
              <select 
                value={supplierType}
                onChange={(e) => setSupplierType(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#2d808e]/40 rounded focus:border-[#2d808e] outline-none text-sm text-gray-400 appearance-none transition-all"
              >
                <option value="">Supplier Type</option>
                <option value="local">Local Supplier</option>
                <option value="foreign">Foreign Supplier</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                <ChevronDown size={14} />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-[#2d808e]">PR Note</label>
            <div className="relative">
              <input
                type="text"
                maxLength={50}
                value={prNote}
                onChange={(e) => setPrNote(e.target.value)}
                placeholder="PR Referance"
                className="w-full px-3 py-2 bg-white border border-[#2d808e]/40 rounded focus:border-[#2d808e] outline-none text-sm placeholder-gray-300 transition-all"
              />
              <span className="absolute right-3 top-2 text-[10px] text-gray-400 font-bold">
                {prNote.length} / 50
              </span>
            </div>
          </div>
        </div>

        {/* Requester Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[#2d808e]">Requester Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Requester Name"
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#2d808e] rounded text-sm text-gray-700 outline-none placeholder-[#c4dee3] transition-all focus:ring-1 focus:ring-[#2d808e]"
              />
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Contact Number"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#2d808e] rounded text-sm text-gray-700 outline-none placeholder-[#c4dee3] transition-all focus:ring-1 focus:ring-[#2d808e]"
              />
            </div>
            <div className="relative">
              <input
                type="email"
                placeholder="Email Address"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#2d808e] rounded text-sm text-gray-700 outline-none placeholder-[#c4dee3] transition-all focus:ring-1 focus:ring-[#2d808e]"
              />
            </div>
            <div className="relative">
              <select 
                value={costCenter}
                onChange={(e) => setCostCenter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#2d808e] rounded text-sm text-gray-700 appearance-none outline-none transition-all focus:ring-1 focus:ring-[#2d808e]"
              >
                <option value="MMT">MMT</option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="FINANCE">FINANCE</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                <ChevronDown size={14} />
              </div>
            </div>
          </div>
        </div>

        {/* Item Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[#2d808e]">Item Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-[11px] font-bold text-gray-700 text-left">
                  <th className="pb-3 px-1">Name <span className="text-red-500">*</span></th>
                  <th className="pb-3 px-1">SKU/Code</th>
                  <th className="pb-3 px-1 text-center">Specification</th>
                  <th className="pb-3 px-1 text-center">Brand</th>
                  <th className="pb-3 px-1 text-center">UOM <span className="text-red-500">*</span></th>
                  <th className="pb-3 px-1 text-center">Unit Price</th>
                  <th className="pb-3 px-1 text-center">On-Hand Qty</th>
                  <th className="pb-3 px-1 text-center">Req. Qty <span className="text-red-500">*</span></th>
                  <th className="pb-3 px-1">Remarks</th>
                  {items.length > 0 && <th className="pb-3 w-8"></th>}
                </tr>
              </thead>
              <tbody className="space-y-2">
                {items.map((item) => (
                  <tr key={item.id} className="group">
                    <td className="py-1 px-1 min-w-[180px]">
                      <input
                        type="text"
                        placeholder="Item Name"
                        className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-xs focus:border-[#2d808e] focus:ring-1 focus:ring-[#2d808e]/20 outline-none transition-all"
                        value={item.name}
                        onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                      />
                    </td>
                    <td className="py-1 px-1 w-28">
                      <input
                        type="text"
                        placeholder="SKU"
                        className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-xs focus:border-[#2d808e] focus:ring-1 focus:ring-[#2d808e]/20 outline-none transition-all text-center"
                        value={item.sku}
                        onChange={(e) => updateItem(item.id, 'sku', e.target.value)}
                      />
                    </td>
                    <td className="py-1 px-1">
                      <input
                        type="text"
                        placeholder="Spec"
                        className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-xs focus:border-[#2d808e] focus:ring-1 focus:ring-[#2d808e]/20 outline-none transition-all text-center"
                        value={item.specification}
                        onChange={(e) => updateItem(item.id, 'specification', e.target.value)}
                      />
                    </td>
                    <td className="py-1 px-1">
                      <input
                        type="text"
                        placeholder="Brand"
                        className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-xs focus:border-[#2d808e] focus:ring-1 focus:ring-[#2d808e]/20 outline-none transition-all text-center"
                        value={item.brand}
                        onChange={(e) => updateItem(item.id, 'brand', e.target.value)}
                      />
                    </td>
                    <td className="py-1 px-1 w-20">
                      <input
                        type="text"
                        placeholder="UOM"
                        className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-xs focus:border-[#2d808e] focus:ring-1 focus:ring-[#2d808e]/20 outline-none transition-all text-center"
                        value={item.uom}
                        onChange={(e) => updateItem(item.id, 'uom', e.target.value)}
                      />
                    </td>
                    <td className="py-1 px-1 w-24">
                      <input
                        type="text"
                        placeholder="0.00"
                        className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-xs focus:border-[#2d808e] focus:ring-1 focus:ring-[#2d808e]/20 outline-none transition-all text-center"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value)}
                      />
                    </td>
                    <td className="py-1 px-1 w-24">
                      <input
                        type="text"
                        placeholder="0"
                        className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-xs focus:border-[#2d808e] focus:ring-1 focus:ring-[#2d808e]/20 outline-none transition-all text-center"
                        value={item.onHand}
                        onChange={(e) => updateItem(item.id, 'onHand', e.target.value)}
                      />
                    </td>
                    <td className="py-1 px-1 w-24">
                      <input
                        type="text"
                        placeholder="0"
                        className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-xs focus:border-[#2d808e] focus:ring-1 focus:ring-[#2d808e]/20 outline-none transition-all text-center"
                        value={item.reqQty}
                        onChange={(e) => updateItem(item.id, 'reqQty', e.target.value)}
                      />
                    </td>
                    <td className="py-1 px-1">
                      <input
                        type="text"
                        placeholder="Remarks"
                        className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-xs focus:border-[#2d808e] focus:ring-1 focus:ring-[#2d808e]/20 outline-none transition-all"
                        value={item.remarks}
                        onChange={(e) => updateItem(item.id, 'remarks', e.target.value)}
                      />
                    </td>
                    <td className="py-1 px-1 text-center">
                      <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 transition-colors p-1 hover:bg-red-50 rounded">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={addItem}
            className="w-full py-2 bg-[#2d808e] text-white flex items-center justify-center space-x-2 text-sm font-bold rounded hover:bg-[#256b78] transition-all shadow-sm active:scale-[0.99]"
          >
            <Plus size={16} strokeWidth={3} />
            <span>Add Item</span>
          </button>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button 
            onClick={handleFormSubmit}
            className="w-full py-2.5 bg-[#2d808e] text-white text-sm font-bold rounded shadow-lg hover:bg-[#256b78] transition-all active:scale-[0.98]"
          >
            {initialData ? 'Update Requisition' : 'Submit Requisition'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewPurchaseRequisition;