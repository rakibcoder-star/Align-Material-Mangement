import React, { useState, useEffect } from 'react';
import { X, Trash2, ChevronDown, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface SelectedItem {
  id: string;
  prNo: string;
  sku: string;
  name: string;
  specification: string;
  reqQty: number;
  poPending: number;
  poQty: number;
  unitPrice: number; // Incoming from PR
  poPrice: number;   // Calculated field
  vatPercent: string;
  remarks: string;
}

interface CreatePODetailsProps {
  items: SelectedItem[];
  onCancel: () => void;
  onSubmit: (finalData: any) => void;
}

const CreatePODetails: React.FC<CreatePODetailsProps> = ({ items: initialItems, onCancel, onSubmit }) => {
  const navigate = useNavigate();
  const [items, setItems] = useState<SelectedItem[]>(
    initialItems.map(item => ({
      ...item,
      poQty: item.reqQty, 
      poPending: item.reqQty, 
      poPrice: item.unitPrice || 0, // 1. PO Price taken from PR price
      vatPercent: '', 
      remarks: '' 
    }))
  );

  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [poNo, setPoNo] = useState('');
  const [poType, setPoType] = useState('Local');
  const [currency, setCurrency] = useState('BDT');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [poNote, setPoNote] = useState('');
  const [deliveryTerms, setDeliveryTerms] = useState(`1. Delivery has to be done within 03 working days after receiving PO by the supplier.
2. Delivery has to be done as per specification of PO and quotation.
3. Incase of failure of work within the given time, supplier will be penalized as per company policy.`);
  const [deliveryLocation, setDeliveryLocation] = useState('Plot- 12/A & 12/B, Block-C, Kaliakoir Hi-Tech Park, Gazipur, Bangladesh, 1750.');
  const [billSubmission, setBillSubmission] = useState('76/B, Khawaja Palace, Road-11 Banani, Dhaka, Bangladesh, 1213.');
  const [documentsRequired, setDocumentsRequired] = useState(`1. Fully signed PO copy accept by supplier.\n2. Delivery challan with receiving sign.\n3. Mushok 6.3.\n4. Price quotation.`);
  const [paymentTerms, setPaymentTerms] = useState(`1. 100% payment will be made within 30 working days.\n2. VAT and AIT applicable.`);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [deliveryTarget, setDeliveryTarget] = useState('');

  useEffect(() => {
    const initData = async () => {
      const { data: supplierData } = await supabase.from('suppliers').select('*').order('name');
      if (supplierData) setSuppliers(supplierData);

      const { data: lastPO } = await supabase
        .from('purchase_orders')
        .select('po_no')
        .order('po_no', { ascending: false })
        .limit(1);

      if (lastPO && lastPO.length > 0) {
        const lastVal = parseInt(lastPO[0].po_no);
        setPoNo((lastVal + 1).toString());
      } else {
        setPoNo('3000000001');
      }
    };
    initData();
  }, []);

  const updateItem = (id: string, field: keyof SelectedItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeItem = (id: string) => {
    if (items.length > 1) setItems(items.filter(item => item.id !== id));
  };

  const handleFinalSubmit = async () => {
    if (!selectedSupplier) return alert("Please select a supplier.");
    if (!deliveryTarget) return alert("Please select a delivery target date.");

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
      // 1. Create the Purchase Order
      const { error: poError } = await supabase.from('purchase_orders').insert([poPayload]);
      if (poError) throw poError;
      
      // 2. Update source Requisitions to 'Ordered' status so they leave the 'NEW' list
      const uniquePrNos = Array.from(new Set(items.map(i => i.prNo)));
      const { error: reqUpdateError } = await supabase
        .from('requisitions')
        .update({ status: 'Ordered' })
        .in('pr_no', uniquePrNos);
      
      if (reqUpdateError) throw reqUpdateError;

      alert(`PO ${poNo} successfully created. Source requisitions have been moved to 'Ordered' status and will no longer appear in the New list.`);
      onSubmit(poPayload);
      navigate('/purchase-order'); // Navigate back to the list
    } catch (err: any) {
      alert("Error creating PO: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen font-sans antialiased text-gray-800">
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 sticky top-0 bg-white z-50">
        <div className="flex items-center space-x-3">
          <button onClick={onCancel} className="p-1 hover:bg-gray-50 rounded">
            <X size={20} className="text-gray-400" />
          </button>
          <h1 className="text-[18px] font-black tracking-tight text-gray-800 uppercase">Make a Purchase Order(PO)</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={onCancel} className="px-10 py-2 text-[13px] font-bold border border-gray-200 rounded text-gray-500 hover:bg-gray-50 transition-all">Cancel</button>
          <button 
            onClick={handleFinalSubmit}
            disabled={isSubmitting}
            className="px-12 py-2 text-[13px] font-black text-white bg-[#2d808e] rounded shadow-xl hover:bg-[#256b78] transition-all flex items-center space-x-2 active:scale-[0.98]"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
            <span>Submit</span>
          </button>
        </div>
      </div>

      <div className="p-6 max-w-[1600px] mx-auto space-y-6">
        <div className="bg-white rounded border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full text-[11px] text-left border-collapse">
            <thead className="bg-[#fcfcfc]">
              <tr className="font-bold text-gray-800 border-b border-gray-100 uppercase">
                <th className="px-4 py-4 text-center w-32 border-r border-gray-50">SKU</th>
                <th className="px-4 py-4 border-r border-gray-50">name</th>
                <th className="px-4 py-4 border-r border-gray-50">Specification</th>
                <th className="px-4 py-4 text-center border-r border-gray-50">Req.Qty</th>
                <th className="px-4 py-4 text-center border-r border-gray-50">PO Qty</th>
                <th className="px-4 py-4 text-center border-r border-gray-50 text-[#2d808e]">PO Price (from PR)</th>
                <th className="px-4 py-4 text-center border-r border-gray-50">% of VAT</th>
                <th className="px-4 py-4 border-r border-gray-50">PO Remarks</th>
                <th className="px-4 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                  <td className="px-4 py-3 text-center border-r border-gray-50">{item.sku}</td>
                  <td className="px-4 py-3 font-bold uppercase border-r border-gray-50 leading-tight">{item.name}</td>
                  <td className="px-4 py-3 border-r border-gray-50">{item.specification}</td>
                  <td className="px-4 py-3 text-center border-r border-gray-50">{item.reqQty}</td>
                  <td className="px-4 py-3 text-center border-r border-gray-50">
                    <input 
                      type="number" 
                      value={item.poQty}
                      onChange={(e) => updateItem(item.id, 'poQty', Number(e.target.value))}
                      className="w-16 px-2 py-1 text-center border border-[#2d808e]/30 rounded outline-none font-bold"
                    />
                  </td>
                  <td className="px-4 py-3 text-center border-r border-gray-50">
                    <input 
                      type="number" 
                      value={item.poPrice}
                      onChange={(e) => updateItem(item.id, 'poPrice', Number(e.target.value))}
                      className="w-24 px-2 py-1 text-center border border-[#2d808e]/30 rounded outline-none font-black text-[#2d808e]"
                    />
                  </td>
                  <td className="px-4 py-3 text-center border-r border-gray-50">
                    <input 
                      type="text" 
                      value={item.vatPercent}
                      placeholder="VAT%"
                      onChange={(e) => updateItem(item.id, 'vatPercent', e.target.value)}
                      className="w-12 px-2 py-1 text-center border border-gray-200 rounded outline-none"
                    />
                  </td>
                  <td className="px-4 py-3 border-r border-gray-50">
                    <input 
                      type="text" 
                      value={item.remarks}
                      onChange={(e) => updateItem(item.id, 'remarks', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 rounded outline-none"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => removeItem(item.id)} className="text-pink-400 hover:text-pink-600">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Supplier</label>
              <div className="relative">
                <select 
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded text-xs font-bold outline-none appearance-none"
                  onChange={(e) => {
                    const s = suppliers.find(sup => sup.id === e.target.value);
                    setSelectedSupplier(s);
                  }}
                >
                  <option value="">Select a Supplier</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Delivery Location</label>
              <textarea 
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value)}
                className="w-full h-24 px-3 py-2 border border-gray-200 rounded text-[11px] leading-relaxed outline-none focus:border-[#2d808e] resize-none"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">PO Type</label>
                <div className="relative">
                  <select 
                    value={poType}
                    onChange={(e) => setPoType(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded text-xs font-bold outline-none appearance-none"
                  >
                    <option value="Local">Local</option>
                    <option value="Import">Import</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Delivery Target</label>
                <input 
                  type="date"
                  value={deliveryTarget}
                  onChange={(e) => setDeliveryTarget(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded text-xs font-bold outline-none text-gray-600"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Payment Terms</label>
              <textarea 
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full h-24 px-3 py-2 border border-gray-200 rounded text-[11px] outline-none focus:border-[#2d808e] resize-none"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Delivery Terms</label>
              <textarea 
                value={deliveryTerms}
                onChange={(e) => setDeliveryTerms(e.target.value)}
                className="w-full h-24 px-3 py-2 border border-gray-200 rounded text-[11px] leading-relaxed outline-none focus:border-[#2d808e] resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">PO Note</label>
              <textarea 
                placeholder="Please enter PO Note..."
                value={poNote}
                onChange={(e) => setPoNote(e.target.value)}
                className="w-full h-24 px-3 py-2 border border-gray-200 rounded text-[11px] outline-none focus:border-[#2d808e] resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePODetails;