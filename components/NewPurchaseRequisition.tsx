import React, { useState } from 'react';
import { Home, Plus, ChevronDown, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

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
  const [loadingSku, setLoadingSku] = useState<string | null>(null);
  const [prReference, setPrReference] = useState(initialData?.PR || '');
  const [prNote, setPrNote] = useState(initialData?.note || '');
  const [supplierType, setSupplierType] = useState(initialData?.type || '');
  
  const displayName = user?.email?.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') || 'User';
  const [requesterName, setRequesterName] = useState(initialData?.reqBy || displayName);
  const [contactNumber, setContactNumber] = useState(initialData?.contact || '+880 1700 000000');
  const [emailAddress, setEmailAddress] = useState(initialData?.email || user?.email || '');
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

  const handleSkuLookup = async (id: string, sku: string) => {
    if (!sku) return;
    setLoadingSku(id);
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('sku', sku)
      .maybeSingle();

    if (data && !error) {
      setItems(prev => prev.map(item => item.id === id ? {
        ...item,
        name: data.name,
        uom: data.uom,
        unitPrice: String(data.last_price || '0.00'),
        onHand: String(data.on_hand_stock || '0'),
        specification: data.type || '',
      } : item));
    }
    setLoadingSku(null);
  };

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
      if (window.confirm('Remove this item?')) {
        setItems(items.filter((item) => item.id !== id));
      }
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
    const totalQty = items.reduce((sum, item) => sum + (Number(item.reqQty) || 0), 0);
    const totalValue = items.reduce((sum, item) => sum + (Number(item.reqQty) * Number(item.unitPrice) || 0), 0);
    
    const prNumberBase = 2000000000;
    const randomSuffix = Math.floor(Math.random() * 999999);
    const generatedPRNo = (prNumberBase + randomSuffix).toString();

    onSubmit({
      PR: generatedPRNo,
      items: items, 
      note: prNote,
      type: supplierType,
      value: totalValue,
      reqQty: totalQty,
      reqDpt: costCenter,
      reqBy: requesterName,
      createdAt: new Date().toISOString(),
      status: 'In-Process',
      contact: contactNumber,
      email: emailAddress
    });
  };

  return (
    <div className="flex flex-col space-y-4 md:space-y-6">
      <div className="flex items-center space-x-2 text-[10px] md:text-[11px] font-bold text-[#2d808e] uppercase tracking-wider">
        <Home size={14} className="text-gray-400" />
        <span className="text-gray-400">/</span>
        <button onClick={onBack} className="hover:underline text-gray-400 truncate">Purchase-Requisition</button>
        <span className="text-gray-400">/</span>
        <span>{initialData ? 'Edit' : 'New'}</span>
      </div>

      <div className="text-center">
        <h1 className="text-xl md:text-2xl font-bold text-[#2d808e] tracking-tight uppercase">New Purchase Requisition</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 md:p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-[#2d808e]">PR Referance</label>
            <input type="text" value={prReference} onChange={(e) => setPrReference(e.target.value)} className="w-full px-3 py-2 border border-[#2d808e]/40 rounded text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-[#2d808e]"><span className="text-red-500 mr-1">*</span>Type</label>
            <select value={supplierType} onChange={(e) => setSupplierType(e.target.value)} className="w-full px-3 py-2 border border-[#2d808e]/40 rounded text-sm">
              <option value="">Supplier Type</option>
              <option value="local">Local Supplier</option>
              <option value="foreign">Foreign Supplier</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-[#2d808e]">PR Note</label>
            <input type="text" value={prNote} onChange={(e) => setPrNote(e.target.value)} className="w-full px-3 py-2 border border-[#2d808e]/40 rounded text-sm" />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[#2d808e] border-b border-gray-50 pb-2">Item Details (Input SKU for Auto-Fill)</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="text-[10px] font-bold text-gray-700 text-left uppercase">
                  <th className="pb-3 px-1 w-24">SKU <span className="text-red-500">*</span></th>
                  <th className="pb-3 px-1">Name</th>
                  <th className="pb-3 px-1">Spec.</th>
                  <th className="pb-3 px-1 w-16 text-center">UOM</th>
                  <th className="pb-3 px-1 w-16 text-center">Price</th>
                  <th className="pb-3 px-1 w-16 text-center">On-Hand</th>
                  <th className="pb-3 px-1 w-16 text-center">Req.Qty *</th>
                  <th className="pb-3 px-1">Remarks</th>
                  <th className="pb-3 w-8"></th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-1 px-1">
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="SKU..."
                          className="w-full px-2 py-1.5 border border-[#2d808e]/30 rounded text-xs font-bold outline-none focus:border-[#2d808e]" 
                          value={item.sku} 
                          onChange={(e) => updateItem(item.id, 'sku', e.target.value)}
                          onBlur={(e) => handleSkuLookup(item.id, e.target.value)}
                        />
                        {loadingSku === item.id && <Loader2 size={12} className="absolute right-1 top-2 animate-spin text-gray-400" />}
                      </div>
                    </td>
                    <td className="py-1 px-1">
                      <input type="text" className="w-full px-2 py-1.5 border border-gray-100 bg-gray-50 rounded text-xs font-bold" value={item.name} readOnly />
                    </td>
                    <td className="py-1 px-1">
                      <input type="text" className="w-full px-2 py-1.5 border border-gray-100 rounded text-xs" value={item.specification} onChange={(e) => updateItem(item.id, 'specification', e.target.value)} />
                    </td>
                    <td className="py-1 px-1 text-center">
                      <input type="text" className="w-full px-2 py-1.5 border border-gray-100 bg-gray-50 rounded text-xs text-center" value={item.uom} readOnly />
                    </td>
                    <td className="py-1 px-1">
                      <input type="text" className="w-full px-2 py-1.5 border border-gray-100 rounded text-xs text-center" value={item.unitPrice} onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value)} />
                    </td>
                    <td className="py-1 px-1">
                      <input type="text" className="w-full px-2 py-1.5 border border-gray-100 bg-gray-50 rounded text-xs text-center" value={item.onHand} readOnly />
                    </td>
                    <td className="py-1 px-1">
                      <input type="text" className="w-full px-2 py-1.5 border border-[#2d808e]/30 rounded text-xs text-center font-bold" value={item.reqQty} onChange={(e) => updateItem(item.id, 'reqQty', e.target.value)} />
                    </td>
                    <td className="py-1 px-1">
                      <input type="text" className="w-full px-2 py-1.5 border border-gray-100 rounded text-xs" value={item.remarks} onChange={(e) => updateItem(item.id, 'remarks', e.target.value)} />
                    </td>
                    <td className="py-1 px-1 text-center">
                      <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={addItem} className="w-full py-2 bg-[#2d808e] text-white flex items-center justify-center space-x-2 text-xs font-bold rounded shadow-sm hover:bg-[#256b78] transition-all">
            <Plus size={16} strokeWidth={3} />
            <span>Add Item Row</span>
          </button>
        </div>

        <button onClick={handleFormSubmit} className="w-full py-3 bg-[#2d808e] text-white text-sm font-bold rounded shadow-lg hover:bg-[#256b78] transition-all active:scale-[0.98]">
          Submit Requisition
        </button>
      </div>
    </div>
  );
};

export default NewPurchaseRequisition;