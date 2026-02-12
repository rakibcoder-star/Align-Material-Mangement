import React from 'react';
import { Plus, X } from 'lucide-react';

interface PRPrintTemplateProps {
  pr: any;
  justificationData: any[];
  onJustificationChange: (index: number, field: string, value: any) => void;
  images: string[];
  onImagesChange: (newImages: string[]) => void;
}

const PRPrintTemplate: React.FC<PRPrintTemplateProps> = ({ 
  pr, 
  justificationData, 
  onJustificationChange,
  images,
  onImagesChange
}) => {
  const items = pr.items || [];
  
  const totalQty = items.reduce((acc: number, i: any) => acc + (Number(i.reqQty) || 0), 0);
  const totalValue = items.reduce((acc: number, i: any) => acc + ((Number(i.reqQty) || 0) * (Number(i.unitPrice) || 0)), 0);

  const formatCurrency = (num: number) => num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  const formatDate = (dateStr: string) => {
    if (!dateStr) return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImagesChange([...images, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesChange(newImages);
  };

  return (
    <div className="bg-white text-black font-sans p-6 md:p-10 max-w-[1200px] mx-auto overflow-hidden print:p-0">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 leading-tight">Fair Technology Limited</h1>
          <p className="text-[10px] text-gray-600 mt-0.5">Plot- 12/A & 12/B, Block-C, Kaliakoir Hi-Tech Park</p>
          <p className="text-[10px] text-gray-600">Gazipur, Bangladesh-1750. +#880 1787-670 786</p>
          <div className="mt-4">
            <h2 className="text-sm font-bold uppercase border-b-2 border-black inline-block px-8 py-0.5 tracking-wider">PURCHASE REQUISITION FORM</h2>
          </div>
        </div>
        <div className="w-20 h-20 flex items-center justify-center border border-gray-100 p-1">
           <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=PR-${pr.pr_no || pr.PR}`} 
            alt="QR Code" 
            className="w-full h-full"
           />
        </div>
      </div>

      {/* Meta Grid Section - Exact layout from Image */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-10 mb-6 text-[10px]">
        <div className="space-y-1">
          <p><span className="font-bold">PR No.:</span> {pr.pr_no} ({pr.type === 'foreign' ? 'Foreign' : 'Local'})</p>
          <p><span className="font-bold">Reference:</span> {pr.reference || 'N/A'}</p>
          <p><span className="font-bold">Requested By:</span> {pr.req_by_name || 'Md. Jahangir Alam'}</p>
        </div>
        
        <div className="space-y-1">
          <p><span className="font-bold">Department:</span> {pr.reqDpt || 'Maintenance'}</p>
          <p><span className="font-bold">Email:</span> {pr.email || 'user@fairtechnology.com.bd'}</p>
          <p><span className="font-bold">Phone No.:</span> {pr.contact || '+880 1322 858992'}</p>
        </div>

        <div className="space-y-1 md:text-right">
          <p><span className="font-bold">Req. Date:</span> {formatDate(pr.created_at)}</p>
          <p><span className="font-bold">PR Status:</span> {pr.status || 'Checked'}</p>
          <p><span className="font-bold">Update On:</span> {formatDate(pr.updated_at || pr.created_at)}</p>
        </div>
      </div>

      {/* Main Items Table - Matching Red Marked Area 1 */}
      <div className="mb-4 overflow-x-auto">
        <table className="w-full border-collapse border border-black">
          <thead className="bg-[#fcfcfc] text-[9px] font-black uppercase">
            <tr>
              <th className="border border-black py-1.5 px-1 text-center w-8">SL</th>
              <th className="border border-black py-1.5 px-1 text-center w-24">Part Code</th>
              <th className="border border-black py-1.5 px-2 text-center">Name</th>
              <th className="border border-black py-1.5 px-1 text-center w-20">Spec.</th>
              <th className="border border-black py-1.5 px-1 text-center w-20">Brand</th>
              <th className="border border-black py-1.5 px-1 text-center w-14">UOM</th>
              <th className="border border-black py-1.5 px-1 text-center w-24">Unit Price (BDT)</th>
              <th className="border border-black py-1.5 px-1 text-center w-16">Req. Qty</th>
              <th className="border border-black py-1.5 px-1 text-center w-24">Req. Value (BDT)</th>
              <th className="border border-black py-1.5 px-1 text-center w-24">On-Hand Stock</th>
              <th className="border border-black py-1.5 px-1 text-center w-24">Remarks</th>
            </tr>
          </thead>
          <tbody className="text-[9px]">
            {items.map((item: any, idx: number) => (
              <tr key={idx} className="hover:bg-gray-50/50">
                <td className="border border-black py-1.5 px-1 text-center">{idx + 1}</td>
                <td className="border border-black py-1.5 px-1 text-center">{item.sku || 'N/A'}</td>
                <td className="border border-black py-1.5 px-2 font-bold uppercase">{item.name || 'N/A'}</td>
                <td className="border border-black py-1.5 px-1 text-center uppercase">{item.specification || ''}</td>
                <td className="border border-black py-1.5 px-1 text-center uppercase">{item.brand || ''}</td>
                <td className="border border-black py-1.5 px-1 text-center uppercase">{item.uom || 'SET'}</td>
                <td className="border border-black py-1.5 px-1 text-right">{formatCurrency(Number(item.unitPrice || 0))}</td>
                <td className="border border-black py-1.5 px-1 text-center font-black">{item.reqQty || 0}</td>
                <td className="border border-black py-1.5 px-1 text-right font-black">
                  {formatCurrency(Number(item.reqQty || 0) * Number(item.unitPrice || 0))}
                </td>
                <td className="border border-black py-1.5 px-1 text-center font-bold text-[#2d808e]">{item.onHand || '0'}</td>
                <td className="border border-black py-1.5 px-1 text-left italic text-gray-400">{item.remarks || ''}</td>
              </tr>
            ))}
            <tr className="font-bold text-[9px] bg-[#fcfcfc]">
              <td colSpan={7} className="border border-black py-2 px-2 text-right uppercase tracking-widest">Total</td>
              <td className="border border-black py-2 px-1 text-center font-black">{totalQty}</td>
              <td className="border border-black py-2 px-1 text-right font-black">{formatCurrency(totalValue)}</td>
              <td className="border border-black py-2 px-1"></td>
              <td className="border border-black py-2 px-1"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Note & Upload Section */}
      <div className="flex flex-col items-center mb-10">
        <p className="text-[10px] font-bold text-gray-700 mb-2 self-start flex items-center">
          <span className="mr-2">Note:</span> 
          <span className="font-medium text-gray-500 italic min-w-[300px] border-b border-gray-100">{pr.note || ''}</span>
        </p>
        <div className="flex flex-wrap gap-2 justify-center py-6">
             {images.map((img, idx) => (
               <div key={idx} className="relative group w-24 h-24 border border-gray-100 rounded-lg overflow-hidden shadow-sm">
                  <img src={img} alt="item" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => removeImage(idx)}
                    className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl opacity-0 group-hover:opacity-100 transition-opacity no-print"
                  >
                    <X size={12} />
                  </button>
               </div>
             ))}
             <label className="w-24 h-24 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-300 hover:border-[#2d808e] hover:text-[#2d808e] transition-all cursor-pointer no-print group">
                <Plus size={24} className="group-hover:scale-110 transition-transform" strokeWidth={3} />
                <span className="text-[10px] font-black uppercase tracking-tighter mt-2">Upload</span>
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
             </label>
           </div>
      </div>

      {/* Signatures */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-10 pt-4">
        {[
          { label: 'Prepared By', name: pr.req_by_name || 'Md. Jahangir Alam' },
          { label: 'Checked By', name: pr.req_by_name || 'Md. Jahangir Alam' },
          { label: 'Confirmed By', name: '' },
          { label: 'Approved By', name: '' },
        ].map((sig, i) => (
          <div key={i} className="text-center">
            <div className="border-t border-black mb-1.5 pt-1.5">
              <p className="font-black text-[10px] uppercase tracking-tighter">{sig.label}</p>
            </div>
            <p className="text-[9px] font-bold text-gray-600 uppercase truncate">{sig.name}</p>
          </div>
        ))}
      </div>

      {/* Justification Table - Matching Red Marked Area 2 */}
      <div className="space-y-0">
        <h3 className="bg-[#fcfcfc] border border-black border-b-0 py-2 text-center text-[10px] font-black uppercase tracking-widest">
          Justification of Purchase Requisition
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-black text-[9px]">
            <thead>
              <tr className="bg-white font-black text-center uppercase tracking-tighter">
                <th className="border border-black py-2 px-2">Item Name</th>
                <th className="border border-black py-2 px-1 w-20">Last 6M Used</th>
                <th className="border border-black py-2 px-1 w-32">Consumption Rate</th>
                <th className="border border-black py-2 px-1 w-24">Stock in Hand [A]</th>
                <th className="border border-black py-2 px-1 w-24">Stock in Store [B]</th>
                <th className="border border-black py-2 px-1 w-24">Ordered Qty [C]</th>
                <th className="border border-black py-2 px-1 w-24">Total [D=A+B+C]</th>
                <th className="border border-black py-2 px-2">Purpose</th>
                <th className="border border-black py-2 px-1 w-32 text-[8px]">Approved Design [Y/N]</th>
              </tr>
            </thead>
            <tbody className="font-bold">
              {justificationData.map((row, idx) => (
                <tr key={idx} className="text-center group min-h-[40px]">
                  <td className="border border-black py-2 px-2 text-left uppercase truncate max-w-[200px]">{row.name}</td>
                  <td className="border border-black py-2 px-1">
                    <input 
                      type="number" 
                      className="w-full bg-transparent text-center focus:bg-yellow-50 outline-none border-none p-0" 
                      value={row.last6m} 
                      onChange={(e) => onJustificationChange(idx, 'last6m', e.target.value)}
                    />
                  </td>
                  <td className="border border-black py-2 px-1">
                    <input 
                      type="text" 
                      className="w-full bg-transparent text-center focus:bg-yellow-50 outline-none border-none p-0" 
                      value={row.consumptionRate} 
                      onChange={(e) => onJustificationChange(idx, 'consumptionRate', e.target.value)}
                    />
                  </td>
                  <td className="border border-black py-2 px-1 font-black text-[#2d808e]">{row.stockHand}</td>
                  <td className="border border-black py-2 px-1">
                    <input 
                      type="number" 
                      className="w-full bg-transparent text-center focus:bg-yellow-50 outline-none border-none p-0" 
                      value={row.stockStore} 
                      onChange={(e) => onJustificationChange(idx, 'stockStore', e.target.value)}
                    />
                  </td>
                  <td className="border border-black py-2 px-1">
                    <input 
                      type="number" 
                      className="w-full bg-transparent text-center focus:bg-yellow-50 outline-none border-none p-0" 
                      value={row.orderedQty} 
                      onChange={(e) => onJustificationChange(idx, 'orderedQty', e.target.value)}
                    />
                  </td>
                  <td className="border border-black py-2 px-1 font-black">
                    {(Number(row.stockHand || 0) + Number(row.stockStore || 0) + Number(row.orderedQty || 0)).toFixed(2)}
                  </td>
                  <td className="border border-black py-2 px-2">
                    <input 
                      type="text" 
                      className="w-full bg-transparent text-left focus:bg-yellow-50 outline-none border-none p-0 px-1 uppercase" 
                      value={row.purpose} 
                      onChange={(e) => onJustificationChange(idx, 'purpose', e.target.value)}
                    />
                  </td>
                  <td className="border border-black py-2 px-1">
                    <select 
                      className="w-full bg-transparent text-center focus:bg-yellow-50 outline-none appearance-none border-none p-0 font-black" 
                      value={row.approvedDesign} 
                      onChange={(e) => onJustificationChange(idx, 'approvedDesign', e.target.value)}
                    >
                      <option value=""></option>
                      <option value="Y">Y</option>
                      <option value="N">N</option>
                    </select>
                  </td>
                </tr>
              ))}
              {justificationData.length < 2 && (
                <tr className="h-12"><td colSpan={9} className="border border-black bg-gray-50/20"></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="mt-12 pt-4 border-t border-gray-100 flex items-center justify-center text-[7px] font-black text-gray-300 uppercase tracking-[0.4em]">
        Align ERP • Document ID: PR-{pr.pr_no || pr.PR} • Generated: {new Date().toLocaleString()}
      </div>
    </div>
  );
};

export default PRPrintTemplate;