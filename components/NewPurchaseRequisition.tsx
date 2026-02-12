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
  const [prReference, setPrReference] = useState(initialData?.reference || '');
  const [prNote, setPrNote] = useState(initialData?.note || '');
  const [supplierType, setSupplierType] = useState(initialData?.type || '');
  
  const displayName = user?.email?.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') || 'User';
  const [requesterName, setRequesterName] = useState(initialData?.req_by_name || initialData?.reqBy || displayName);
  const [contactNumber, setContactNumber] = useState(initialData?.contact || '+880 1322 858992');
  const [emailAddress, setEmailAddress] = useState(initialData?.email || user?.email || 'user@fairtechnology.com.bd');
  const [costCenter, setCostCenter] = useState(initialData?.reqDpt || 'Maintenance');

  const [items, setItems] = useState<RequisitionItem[]>(
    initialData?.items || [
      {
        id: '1',
        name: '',
        sku: '',
        specification: '',
        brand: '',
        uom: '',
        unitPrice: '',
        onHand: '',
        reqQty: '',
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
        brand: data.brand || '',
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

  const handleFormSubmit = async () => {
    if (!supplierType) {
      alert('Please select a Supplier Type.');
      return;
    }
    
    const totalQty = items.reduce((sum, item) => sum + (Number(item.reqQty) || 0), 0);
    const totalValue = items.reduce((sum, item) => sum + (Number(item.reqQty) * Number(item.unitPrice) || 0), 0);
    
    // Generate PR Number if it doesn't exist
    const generatedPRNo = initialData?.pr_no || (3000000000 + Math.floor(Math.random() * 999999)).toString();

    const prPayload = {
      pr_no: generatedPRNo,
      reference: prReference,
      note: prNote,
      type: supplierType,
      status: 'Checked',
      req_by_name: requesterName,
      reqDpt: costCenter,
      contact: contactNumber,
      email: emailAddress,
      total_value: totalValue,
      items: items // Store full item array in JSONB or related table
    };

    const { error } = await supabase.from('requisitions').upsert([prPayload]);

    if (!error) {
      onSubmit(prPayload);
    } else {
      alert("Error saving PR: " + error.message);
    }
  };

  return (
    <div className="flex flex-col space-y-4 md:space-y-6">
      <div className="flex items-center space-x-2 text-[10px] md:text-[11px] font-bold text-[#2d808e] uppercase tracking-wider">
        <Home size={14} className="text-gray-400" />
        <span className="text-gray-400">/</span>
        <button onClick={onBack} className="hover:underline text-gray-400 truncate">Purchase-Requisition</button>
        <span className="text-gray-400">/</span>
        <span>{initialData ? 'EDIT' : 'NEW'}</span>
      </div>

      <div className="text-center">
        <h1 className="text-xl md:text-2xl font-black text-[#2d808e] tracking-tight uppercase">New Purchase Requisition</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 md:p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-[#2d808e] uppercase tracking-tighter">PR Referance</label>
            <input type="text" value={prReference} onChange={(e) => setPrReference(e.target.value)} className="w-full px-3 py-2 border border-[#2d808e]/40 rounded text-sm font-bold outline-none focus:border-[#2d808e]" placeholder="e.g. Water Dispenser Repair" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black text-[#2d808e] uppercase tracking-tighter"><span className="text-red-500 mr-1">*</span>Type</label>
            <select value={supplierType} onChange={(e) => setSupplierType(e.target.value)} className="w-full px-3 py-2 border border-[#2d808e]/40 rounded text-sm font-bold outline-none focus:border-[#2d808e]">
              <option value="">Supplier Type</option>
              <option value="local">Local Supplier</option>
              <option value="foreign">Foreign Supplier</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black text-[#2d808e] uppercase tracking-tighter">PR Note</label>
            <input type="text" value={prNote} onChange={(e) => setPrNote(e.target.value)} className="w-full px-3 py-2 border border-[#2d808e]/40 rounded text-sm font-bold outline-none focus:border-[#2d808e]" placeholder="Additional info..." />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">Item Details Selection</h3>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="text-[10px] font-black text-gray-700 text-left uppercase tracking-tighter">
                  <th className="pb-3 px-1 w-32">Part Code *</th>
                  <th className="pb-3 px-1">Name</th>
                  <th className="pb-3 px-1 w-24 text-center">Spec.</th>
                  <th className="pb-3 px-1 w-24 text-center">Brand</th>
                  <th className="pb-3 px-1 w-16 text-center">UOM</th>
                  <th className="pb-3 px-1 w-20 text-center">Price</th>
                  <th className="pb-3 px-1 w-20 text-center">On-Hand</th>
                  <th className="pb-3 px-1 w-20 text-center">Req.Qty *</th>
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
                          className="w-full px-2 py-1.5 border border-[#2d808e]/30 rounded text-[10px] font-black outline-none focus:border-[#2d808e]" 
                          value={item.sku} 
                          onChange={(e) => updateItem(item.id, 'sku', e.target.value)}
                          onBlur={(e) => handleSkuLookup(item.id, e.target.value)}
                        />
                        {loadingSku === item.id && <Loader2 size={12} className="absolute right-1 top-2 animate-spin text-gray-400" />}
                      </div>
                    </td>
                    <td className="py-1 px-1">
                      <input type="text" className="w-full px-2 py-1.5 border border-gray-100 bg-gray-50 rounded text-[10px] font-black uppercase" value={item.name} readOnly />
                    </td>
                    <td className="py-1 px-1">
                      <input type="text" className="w-full px-2 py-1.5 border border-gray-100 rounded text-[10px] text-center" value={item.specification} onChange={(e) => updateItem(item.id, 'specification', e.target.value)} />
                    </td>
                    <td className="py-1 px-1">
                      <input type="text" className="w-full px-2 py-1.5 border border-gray-100 rounded text-[10px] text-center" value={item.brand} onChange={(e) => updateItem(item.id, 'brand', e.target.value)} />
                    </td>
                    <td className="py-1 px-1 text-center">
                      <input type="text" className="w-full px-2 py-1.5 border border-gray-100 bg-gray-50 rounded text-[10px] text-center font-bold" value={item.uom} readOnly />
                    </td>
                    <td className="py-1 px-1">
                      <input type="text" className="w-full px-2 py-1.5 border border-gray-100 rounded text-[10px] text-center font-bold" value={item.unitPrice} onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value)} />
                    </td>
                    <td className="py-1 px-1">
                      <input type="text" className="w-full px-2 py-1.5 border border-gray-100 bg-gray-50 rounded text-[10px] text-center font-bold" value={item.onHand} readOnly />
                    </td>
                    <td className="py-1 px-1">
                      <input type="text" className="w-full px-2 py-1.5 border border-[#2d808e]/30 rounded text-[10px] text-center font-black" value={item.reqQty} onChange={(e) => updateItem(item.id, 'reqQty', e.target.value)} />
                    </td>
                    <td className="py-1 px-1">
                      <input type="text" className="w-full px-2 py-1.5 border border-gray-100 rounded text-[10px]" value={item.remarks} onChange={(e) => updateItem(item.id, 'remarks', e.target.value)} />
                    </td>
                    <td className="py-1 px-1 text-center">
                      <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={addItem} className="w-full py-2 bg-gray-50 text-[#2d808e] border border-dashed border-[#2d808e]/30 flex items-center justify-center space-x-2 text-[10px] font-black rounded shadow-sm hover:bg-white transition-all uppercase tracking-widest">
            <Plus size={14} strokeWidth={3} />
            <span>Add Item Row</span>
          </button>
        </div>

        <button onClick={handleFormSubmit} className="w-full py-4 bg-[#2d808e] text-white text-[14px] font-black rounded-lg shadow-xl shadow-cyan-900/10 hover:bg-[#256b78] transition-all active:scale-[0.99] uppercase tracking-[0.2em]">
          Submit Requisition
        </button>
      </div>
    </div>
  );
};

export default NewPurchaseRequisition;