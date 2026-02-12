import React, { useState, useEffect } from 'react';
import { X, Trash2, ChevronLeft, ChevronRight, Calendar, ChevronDown, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SelectedItem {
  id: string;
  prNo: string;
  sku: string;
  name: string;
  specification: string;
  reqQty: number;
  poPending: number;
  poQty: number;
  poPrice: number;
  vatPercent: string;
  remarks: string;
}

interface CreatePODetailsProps {
  items: SelectedItem[];
  onCancel: () => void;
  onSubmit: (finalData: any) => void;
}

const CreatePODetails: React.FC<CreatePODetailsProps> = ({ items: initialItems, onCancel, onSubmit }) => {
  const [items, setItems] = useState<SelectedItem[]>(
    initialItems.map(item => ({
      ...item,
      // Default PO Price from PR Unit Price (passed as poPrice in mapping)
      poPrice: item.poPrice || 0,
      vatPercent: '0'
    }))
  );
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [poNo, setPoNo] = useState('');
  const [poType, setPoType] = useState('Local');
  const [poNote, setPoNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [deliveryTerms, setDeliveryTerms] = useState("1. Delivery within 03 working days.\n2. As per specification.\n3. Failure penalized per policy.");
  const [deliveryLocation, setDeliveryLocation] = useState("Kaliakoir Hi-Tech Park, Gazipur.");
  const [billSubmission, setBillSubmission] = useState("76/B, Khawaja Palace, Road-11 Banani, Dhaka.");
  const [documentsRequired, setDocumentsRequired] = useState("1. Signed PO\n2. Delivery Challan\n3. Mushok 6.3");
  const [paymentTerms, setPaymentTerms] = useState("1. 100% payment within 30 days.\n2. VAT/AIT applicable.");
  const [paymentMethod, setPaymentMethod] = useState('');
  const [currency, setCurrency] = useState('BDT');
  const [deliveryTarget, setDeliveryTarget] = useState('');

  // Fetch Suppliers and Generate PO Number
  useEffect(() => {
    const initData = async () => {
      // 1. Fetch real suppliers
      const { data: supplierData } = await supabase.from('suppliers').select('*').order('name');
      if (supplierData) setSuppliers(supplierData);

      // 2. Generate Next PO No (3000000000 series)
      const { data: lastPO } = await supabase
        .from('purchase_orders')
        .select('po_no')
        .order('po_no', { ascending: false })
        .limit(1);

      if (lastPO && lastPO.length > 0) {
        const lastNo = parseInt(lastPO[0].po_no);
        setPoNo((lastNo + 1).toString());
      } else {
        setPoNo('3000000001');
      }
    };
    initData();
  }, []);

  const removeItem = (id: string) => {
    if (items.length > 1) setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof SelectedItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleFinalSubmit = async () => {
    if (!selectedSupplier) {
      alert("Please select a supplier.");
      return;
    }
    if (!deliveryTarget) {
      alert("Please select a delivery target date.");
      return;
    }

    setIsSubmitting(true);
    const totalValue = items.reduce((sum, item) => sum + (Number(item.poQty) * Number(item.poPrice)), 0);

    const poPayload = {
      po_no: poNo,
      type: poType,
      supplier_id: selectedSupplier.id,
      supplier_name: selectedSupplier.name,
      currency: currency,
      total_value: totalValue,
      status: 'Open',
      items: items,
      terms: {
        deliveryTerms,
        deliveryLocation,
        billSubmission,
        documentsRequired,
        paymentTerms,
        paymentMethod,
        deliveryTarget
      },
      note: poNote
    };

    try {
      const { error } = await supabase.from('purchase_orders').insert([poPayload]);
      if (error) throw error;
      
      alert(`PO ${poNo} created successfully! Redirecting to Warehouse Receive.`);
      onSubmit(poPayload);
    } catch (err: any) {
      alert("Error saving PO: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen font-sans">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
          <div>
            <h2 className="text-[15px] font-black text-gray-800 uppercase tracking-tight">Create Purchase Order</h2>
            <p className="text-[10px] font-bold text-[#2d808e] uppercase tracking-widest">PO NO: {poNo || 'Generating...'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={onCancel} className="px-8 py-2 text-[13px] font-bold text-gray-400 hover:text-gray-600 transition-all">Cancel</button>
          <button 
            onClick={handleFinalSubmit}
            disabled={isSubmitting}
            className="px-10 py-2 text-[13px] font-black text-white bg-[#2d808e] rounded shadow-xl hover:bg-[#256b78] transition-all flex items-center space-x-2"
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            <span>COMMIT PURCHASE ORDER</span>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Table Section */}
        <div className="bg-[#fcfcfc] rounded border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#f8f9fa]">
              <tr className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                <th className="px-4 py-4 w-32 text-center">SKU</th>
                <th className="px-4 py-4">Item Name</th>
                <th className="px-4 py-4 text-center w-24">Req. Qty</th>
                <th className="px-4 py-4 text-center w-24">PO Qty</th>
                <th className="px-4 py-4 text-center w-28">PO Price</th>
                <th className="px-4 py-4 text-center w-24">% VAT</th>
                <th className="px-4 py-4 text-center">Total Value</th>
                <th className="px-4 py-4 text-center w-16"></th>
              </tr>
            </thead>
            <tbody className="text-[11px] text-gray-700 font-bold">
              {items.map((item) => (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-white transition-colors">
                  <td className="px-4 py-4 text-center">{item.sku}</td>
                  <td className="px-4 py-4 uppercase leading-tight text-gray-900">{item.name}</td>
                  <td className="px-4 py-4 text-center text-gray-400">{item.reqQty}</td>
                  <td className="px-4 py-4 text-center">
                    <input 
                      type="number" 
                      value={item.poQty}
                      onChange={(e) => updateItem(item.id, 'poQty', Number(e.target.value))}
                      className="w-20 px-2 py-1.5 border border-[#2d808e]/30 rounded text-center outline-none focus:ring-1 focus:ring-[#2d808e]"
                    />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <input 
                      type="number" 
                      value={item.poPrice}
                      onChange={(e) => updateItem(item.id, 'poPrice', Number(e.target.value))}
                      className="w-24 px-2 py-1.5 border border-[#2d808e]/30 rounded text-center outline-none focus:ring-1 focus:ring-[#2d808e] text-[#2d808e]"
                    />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <input 
                      type="number" 
                      value={item.vatPercent}
                      onChange={(e) => updateItem(item.id, 'vatPercent', e.target.value)}
                      placeholder="VAT%"
                      className="w-16 px-2 py-1.5 border border-[#2d808e]/30 rounded text-center outline-none"
                    />
                  </td>
                  <td className="px-4 py-4 text-center font-black">
                    {(Number(item.poQty) * Number(item.poPrice)).toLocaleString()} {currency}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button onClick={() => removeItem(item.id)} className="text-red-300 hover:text-red-500"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Supplier</label>
              <div className="relative">
                <select 
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-xs font-bold outline-none appearance-none"
                  onChange={(e) => {
                    const s = suppliers.find(sup => sup.id === e.target.value);
                    setSelectedSupplier(s);
                  }}
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="space-y-1 flex-1">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">PO Type</label>
                <select 
                  value={poType}
                  onChange={(e) => setPoType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded text-xs font-bold outline-none"
                >
                  <option value="Local">Local</option>
                  <option value="Import">Import</option>
                </select>
              </div>
              <div className="space-y-1 flex-1">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Currency</label>
                <select 
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded text-xs font-bold outline-none text-[#2d808e]"
                >
                  <option value="BDT">BDT</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Delivery Location</label>
            <textarea 
              value={deliveryLocation}
              onChange={(e) => setDeliveryLocation(e.target.value)}
              className="w-full h-32 px-3 py-2 border border-gray-200 rounded text-xs leading-relaxed outline-none focus:border-[#2d808e] resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Delivery Terms</label>
            <textarea 
              value={deliveryTerms}
              onChange={(e) => setDeliveryTerms(e.target.value)}
              className="w-full h-32 px-3 py-2 border border-gray-200 rounded text-xs leading-relaxed outline-none focus:border-[#2d808e] resize-none"
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Delivery Target</label>
              <input 
                type="date"
                value={deliveryTarget}
                onChange={(e) => setDeliveryTarget(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded text-xs font-bold outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Payment Method</label>
              <input 
                type="text"
                placeholder="Bank Transfer / LC / Cash"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded text-xs font-bold outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePODetails;