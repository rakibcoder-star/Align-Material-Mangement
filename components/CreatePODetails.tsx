import React, { useState } from 'react';
import { X, Trash2, ChevronLeft, ChevronRight, Calendar, ChevronDown } from 'lucide-react';

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
  const [items, setItems] = useState<SelectedItem[]>(initialItems);
  const [supplier, setSupplier] = useState('');
  const [poType, setPoType] = useState('Source');
  const [poNote, setPoNote] = useState('');
  
  // Standard boilerplate terms from the image
  const [deliveryTerms, setDeliveryTerms] = useState(
    "1. Delivery has to be done within 03 working days after receiving PO by the supplier.\n2. Delivery has to be done as per specification of PO and quotation.\n3. Incase of failure of work within the given time, supplier will be penalized as per company policy.\n4. If any damage or problem occurs with the product, the supplier/seller will immediately replace/make arrangements with a new product."
  );
  const [deliveryLocation, setDeliveryLocation] = useState(
    "Contact Person: ZZZ (+8801 222 222 22)\nPlot- 12/A & 12/B, Block-C, Kaliakoir Hi-Tech Park, Gazipur, Bangladesh, 1750."
  );
  const [billSubmission, setBillSubmission] = useState(
    "Contact Person: KKK (+880 111 222 333)\n76/B, Khawaja Palace, Road-11 Banani, Dhaka, Bangladesh, 1213."
  );
  const [documentsRequired, setDocumentsRequired] = useState(
    "1. Fully signed PO copy accept by supplier.\n2. Delivery challan with receiving sign from inventory/warehouse officials.\n3. Mushok 6.3.\n4. Price quotation."
  );
  const [paymentTerms, setPaymentTerms] = useState(
    "1. 100% payment will be made within 30 working days of successful delivery of required .\n2. VAT and AIT applicable as per BD Govt. rules."
  );
  const [paymentMethod, setPaymentMethod] = useState('');
  const [currency, setCurrency] = useState('BDT');
  const [deliveryTarget, setDeliveryTarget] = useState('');

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof SelectedItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleFinalSubmit = () => {
    if (!supplier) {
      alert("Please select a supplier.");
      return;
    }
    onSubmit({
      items,
      supplier,
      poType,
      poNote,
      deliveryTerms,
      deliveryLocation,
      billSubmission,
      documentsRequired,
      paymentTerms,
      paymentMethod,
      currency,
      deliveryTarget
    });
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
          <h2 className="text-[15px] font-bold text-gray-800">Make a Purchase Order(PO)</h2>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={onCancel}
            className="px-8 py-1.5 text-[13px] font-bold text-gray-600 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleFinalSubmit}
            className="px-10 py-1.5 text-[13px] font-bold text-white bg-[#2d808e] rounded hover:bg-[#256b78] transition-all shadow-sm"
          >
            Submit
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Selected Items Table */}
        <div className="bg-[#fcfcfc] rounded border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#f8f9fa]">
              <tr className="text-[11px] font-bold text-gray-500 uppercase">
                <th className="px-4 py-3 w-32 text-center">SKU</th>
                <th className="px-4 py-3 w-64">name</th>
                <th className="px-4 py-3">Specification</th>
                <th className="px-4 py-3 text-center w-20">Req.Qty</th>
                <th className="px-4 py-3 text-center w-24">PO Pending</th>
                <th className="px-4 py-3 text-center w-20">PO Qty</th>
                <th className="px-4 py-3 text-center w-24">PO Price</th>
                <th className="px-4 py-3 text-center w-24">% of VAT</th>
                <th className="px-4 py-3 text-center w-32">PO Remarks</th>
                <th className="px-4 py-3 text-center w-16">Action</th>
              </tr>
            </thead>
            <tbody className="text-[11px] text-gray-700 font-medium">
              {items.map((item) => (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-white transition-colors">
                  <td className="px-4 py-4 text-center">{item.sku}</td>
                  <td className="px-4 py-4 uppercase font-bold text-[10px] leading-tight">{item.name}</td>
                  <td className="px-4 py-4 italic text-gray-400 leading-tight">{item.specification}</td>
                  <td className="px-4 py-4 text-center">{item.reqQty}</td>
                  <td className="px-4 py-4 text-center text-blue-500 font-bold">{item.poPending}</td>
                  <td className="px-4 py-4 text-center">
                    <input 
                      type="number" 
                      value={item.poQty}
                      onChange={(e) => updateItem(item.id, 'poQty', Number(e.target.value))}
                      className="w-16 px-1 py-1 border border-gray-200 rounded text-center focus:border-[#2d808e] outline-none"
                    />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <input 
                      type="number" 
                      value={item.poPrice}
                      onChange={(e) => updateItem(item.id, 'poPrice', Number(e.target.value))}
                      className="w-20 px-1 py-1 border border-gray-200 rounded text-center focus:border-[#2d808e] outline-none"
                    />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <input 
                      type="text" 
                      value={item.vatPercent}
                      onChange={(e) => updateItem(item.id, 'vatPercent', e.target.value)}
                      className="w-16 px-1 py-1 border border-gray-200 rounded text-center focus:border-[#2d808e] outline-none"
                    />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <input 
                      type="text" 
                      placeholder="..."
                      value={item.remarks}
                      onChange={(e) => updateItem(item.id, 'remarks', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:border-[#2d808e] outline-none text-[10px]"
                    />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button onClick={() => removeItem(item.id)} className="text-pink-500 hover:text-pink-700">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Table Pagination Placeholder matching image */}
          <div className="flex items-center justify-end px-4 py-2 bg-white border-t border-gray-50 space-x-2">
            <button className="text-gray-300"><ChevronLeft size={16} /></button>
            <button className="w-6 h-6 flex items-center justify-center border border-[#2d808e] text-[#2d808e] text-[10px] font-bold rounded">1</button>
            <button className="text-gray-300"><ChevronRight size={16} /></button>
          </div>
        </div>

        {/* Detailed Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Row 1 Col 1: Supplier & Type */}
          <div className="lg:col-span-1 space-y-4">
             <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-gray-500">Supplier</label>
                <div className="relative">
                  <select 
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-xs text-gray-400 appearance-none outline-none focus:border-[#2d808e]"
                  >
                    <option value="">Select a Supplier</option>
                    <option value="S1">Supplier A</option>
                    <option value="S2">Supplier B</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                </div>
             </div>
             <div className="space-y-1.5 w-1/2">
                <label className="text-[12px] font-bold text-gray-500">PO Type</label>
                <div className="relative">
                  <select 
                    value={poType}
                    onChange={(e) => setPoType(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-xs text-gray-400 appearance-none outline-none focus:border-[#2d808e]"
                  >
                    <option value="Source">Source</option>
                    <option value="Direct">Direct</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                </div>
             </div>
          </div>

          {/* Row 1 Col 2: PO Note */}
          <div className="lg:col-span-1 space-y-1.5">
            <label className="text-[12px] font-bold text-gray-500">PO Note</label>
            <textarea 
              value={poNote}
              onChange={(e) => setPoNote(e.target.value)}
              placeholder="Please enter PO Note..."
              className="w-full h-32 px-3 py-2 bg-white border border-gray-200 rounded text-[11px] outline-none focus:border-[#2d808e] resize-none"
            />
          </div>

          {/* Row 1 Col 3-4: Delivery Terms */}
          <div className="lg:col-span-2 space-y-1.5">
            <label className="text-[12px] font-bold text-gray-500">Delivery Terms</label>
            <textarea 
              value={deliveryTerms}
              onChange={(e) => setDeliveryTerms(e.target.value)}
              className="w-full h-32 px-3 py-2 bg-white border border-gray-200 rounded text-[11px] leading-relaxed outline-none focus:border-[#2d808e] resize-none"
            />
          </div>

          {/* Row 2 Col 1: Delivery Location */}
          <div className="lg:col-span-1 space-y-1.5">
            <label className="text-[12px] font-bold text-gray-500">Delivery Location</label>
            <textarea 
              value={deliveryLocation}
              onChange={(e) => setDeliveryLocation(e.target.value)}
              className="w-full h-32 px-3 py-2 bg-white border border-gray-200 rounded text-[11px] leading-relaxed outline-none focus:border-[#2d808e] resize-none"
            />
          </div>

          {/* Row 2 Col 2: Bill Submission */}
          <div className="lg:col-span-1 space-y-1.5">
            <label className="text-[12px] font-bold text-gray-500">Bill Submission</label>
            <textarea 
              value={billSubmission}
              onChange={(e) => setBillSubmission(e.target.value)}
              className="w-full h-32 px-3 py-2 bg-white border border-gray-200 rounded text-[11px] leading-relaxed outline-none focus:border-[#2d808e] resize-none"
            />
          </div>

          {/* Row 2 Col 3-4: Documents Required */}
          <div className="lg:col-span-2 space-y-1.5">
            <label className="text-[12px] font-bold text-gray-500">Documents Requied For Billing</label>
            <textarea 
              value={documentsRequired}
              onChange={(e) => setDocumentsRequired(e.target.value)}
              className="w-full h-32 px-3 py-2 bg-white border border-gray-200 rounded text-[11px] leading-relaxed outline-none focus:border-[#2d808e] resize-none"
            />
          </div>

          {/* Row 3 Col 1: Payment Terms */}
          <div className="lg:col-span-1 space-y-1.5">
            <label className="text-[12px] font-bold text-gray-500">Payment Terms</label>
            <textarea 
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              className="w-full h-32 px-3 py-2 bg-white border border-gray-200 rounded text-[11px] leading-relaxed outline-none focus:border-[#2d808e] resize-none"
            />
          </div>

          {/* Row 3 Col 2: Payment Method */}
          <div className="lg:col-span-1 space-y-1.5">
            <label className="text-[12px] font-bold text-gray-500">Supplier Payment Methode</label>
            <textarea 
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              placeholder="Payment methode details..."
              className="w-full h-32 px-3 py-2 bg-white border border-gray-200 rounded text-[11px] outline-none focus:border-[#2d808e] resize-none"
            />
          </div>

          {/* Row 3 Col 3: Currency & Target */}
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-1.5">
               <label className="text-[12px] font-bold text-gray-500">PO Currency</label>
               <input 
                type="text" 
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="BDT/USD/..."
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-xs outline-none focus:border-[#2d808e]"
               />
            </div>
            <div className="space-y-1.5">
               <label className="text-[12px] font-bold text-gray-500">Delivery Target</label>
               <div className="relative">
                  <input 
                    type="date"
                    value={deliveryTarget}
                    onChange={(e) => setDeliveryTarget(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-xs text-gray-400 outline-none focus:border-[#2d808e]"
                  />
                  <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CreatePODetails;