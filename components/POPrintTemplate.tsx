
import React from 'react';

interface POPrintTemplateProps {
  po: any;
}

const POPrintTemplate: React.FC<POPrintTemplateProps> = ({ po }) => {
  const items = po.items || [];
  const terms = po.terms || {};

  const totalValue = items.reduce((acc: number, i: any) => acc + (Number(i.poQty || 0) * Number(i.poPrice || 0)), 0);
  const totalVat = items.reduce((acc: number, i: any) => acc + ((Number(i.poQty || 0) * Number(i.poPrice || 0)) * (Number(i.vatPercent || 0) / 100)), 0);
  const grandTotal = totalValue + totalVat;

  const formatCurrency = (num: number) => num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Strictly map status for visualization: only Approved or Pending
  const displayStatus = (po.status === 'Approved' || po.status === 'Open') ? 'Approved' : 'Pending';

  return (
    <div className="p-10 bg-white text-black font-sans min-h-screen text-[10px]">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1 text-center">
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Fair Technology Limited</h1>
          <p className="text-[10px] text-gray-600">Plot- 12/A & 12/B, Block-C, Kaliakoir Hi-Tech Park</p>
          <p className="text-[10px] text-gray-600">Gazipur, Bangladesh-1750. +#880 1787-670 786</p>
          <div className="mt-4">
            <h2 className="text-sm font-bold uppercase border-b-2 border-black inline-block px-4">PURCHASE ORDER (PO)</h2>
          </div>
        </div>
      </div>

      {/* Meta Grid Section - Strictly dynamic based on PO data */}
      <div className="grid grid-cols-3 gap-8 mb-6 border-t border-gray-100 pt-6">
        {/* Left Column: Supplier Details */}
        <div className="space-y-1.5">
          <p className="flex"><span className="font-bold w-28 shrink-0">PO No.:</span> <span className="font-black">{po.po_no}</span></p>
          <p className="flex"><span className="font-bold w-28 shrink-0">Supplier Name:</span> <span className="uppercase">{po.supplier_name}</span></p>
          <p className="flex text-[9px]"><span className="font-bold w-28 shrink-0">Supplier Address:</span> <span>{po.supplier_address || 'N/A'}</span></p>
          <p className="flex"><span className="font-bold w-28 shrink-0">VAT No.:</span> {po.supplier_vat || 'N/A'}</p>
          <p className="flex"><span className="font-bold w-28 shrink-0">TIN No.:</span> {po.supplier_tin || 'N/A'}</p>
          <p className="flex"><span className="font-bold w-28 shrink-0">Email:</span> {po.supplier_email || 'N/A'}</p>
          <p className="flex"><span className="font-bold w-28 shrink-0">Contact:</span> {po.supplier_contact || 'N/A'}</p>
        </div>
        
        {/* Middle Column: Buyer Details */}
        <div className="space-y-1.5">
          <p className="flex"><span className="font-bold w-28 shrink-0">Buyer Name:</span> Fair Technology Limited</p>
          <p className="flex text-[9px]"><span className="font-bold w-28 shrink-0">Buyer Address:</span> 76/B, Khawaja Palace, Road-11 Banani, Dhaka, Bangladesh, 1213.</p>
          <p className="flex"><span className="font-bold w-28 shrink-0">Buyer BIN Name:</span> XXXXX</p>
          <p className="flex"><span className="font-bold w-28 shrink-0">Buyer BIN No.:</span> XXXX</p>
          <p className="flex"><span className="font-bold w-28 shrink-0">Buyer BIN Address:</span> XXXX</p>
        </div>

        {/* Right Column: Metadata */}
        <div className="space-y-1.5">
          <p className="flex"><span className="font-bold w-28 shrink-0">Issue Date:</span> {new Date(po.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
          <p className="flex"><span className="font-bold w-28 shrink-0">Delivery Date:</span> {terms.deliveryTarget || 'N/A'}</p>
          <p className="flex">
            <span className="font-bold w-28 shrink-0">PO Status:</span> 
            <span className={`font-black uppercase ${displayStatus === 'Approved' ? 'text-green-600' : 'text-orange-600'}`}>
              {displayStatus}
            </span>
          </p>
          <p className="flex"><span className="font-bold w-28 shrink-0">Currency:</span> {po.currency || 'BDT'}</p>
          <p className="flex"><span className="font-bold w-28 shrink-0">Requested by:</span> {po.requested_by || 'Sohel Rana'}</p>
          <p className="flex"><span className="font-bold w-28 shrink-0">Contact No.:</span> {po.requested_contact || '+880 1773 402954'}</p>
          <p className="flex"><span className="font-bold w-28 shrink-0">PO Note:</span> {po.note || 'N/A'}</p>
        </div>
      </div>

      {/* Main Items Table */}
      <table className="w-full border-collapse border border-black mb-1">
        <thead>
          <tr className="bg-gray-50 text-[9px] font-bold">
            <th className="border border-black py-2 px-1 text-center w-8">SL</th>
            <th className="border border-black py-2 px-1 text-center">PR Ref.</th>
            <th className="border border-black py-2 px-1 text-center">Part Code</th>
            <th className="border border-black py-2 px-2 text-left">Name</th>
            <th className="border border-black py-2 px-1 text-center">Spec.</th>
            <th className="border border-black py-2 px-1 text-center">UOM</th>
            <th className="border border-black py-2 px-1 text-right">Unit Price</th>
            <th className="border border-black py-2 px-1 text-center">% of VAT</th>
            <th className="border border-black py-2 px-1 text-center w-14">PO Qty</th>
            <th className="border border-black py-2 px-1 text-right">PO Value</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item: any, idx: number) => (
            <tr key={idx} className="text-[9px]">
              <td className="border border-black py-2 px-1 text-center">{idx + 1}</td>
              <td className="border border-black py-2 px-1 text-center">{item.prNo}</td>
              <td className="border border-black py-2 px-1 text-center">{item.sku}</td>
              <td className="border border-black py-2 px-2 font-bold uppercase">{item.name}</td>
              <td className="border border-black py-2 px-1 text-center">{item.specification}</td>
              <td className="border border-black py-2 px-1 text-center uppercase">{item.uom || 'SET'}</td>
              <td className="border border-black py-2 px-1 text-right">{formatCurrency(Number(item.poPrice))}</td>
              <td className="border border-black py-2 px-1 text-center">{Number(item.vatPercent || 0).toFixed(2)}</td>
              <td className="border border-black py-2 px-1 text-center font-bold">{item.poQty}</td>
              <td className="border border-black py-2 px-1 text-right font-bold">{formatCurrency(Number(item.poQty) * Number(item.poPrice))}</td>
            </tr>
          ))}
          <tr className="font-bold text-[9px]">
            <td colSpan={8} className="border border-black py-2 px-2 text-right">Total</td>
            <td className="border border-black py-2 px-1 text-center">{items.reduce((a: number, b: any) => a + Number(b.poQty), 0)}</td>
            <td className="border border-black py-2 px-1 text-right">{formatCurrency(totalValue)}</td>
          </tr>
          <tr className="font-bold text-[9px]">
            <td colSpan={9} className="border border-black py-2 px-2 text-right">VAT Amount</td>
            <td className="border border-black py-2 px-1 text-right">{formatCurrency(totalVat)}</td>
          </tr>
          <tr className="font-bold text-[9px] bg-gray-50">
            <td colSpan={9} className="border border-black py-2 px-2 text-right">Grand Total</td>
            <td className="border border-black py-2 px-1 text-right">{formatCurrency(grandTotal)}</td>
          </tr>
        </tbody>
      </table>

      {/* Amount In Words */}
      <p className="text-[9px] font-bold mb-8 mt-4 uppercase italic">
        Total Amount In Word: {grandTotal.toLocaleString()} {po.currency || 'BDT'} ONLY.
      </p>

      {/* Terms & Conditions Section */}
      <div className="border border-black mb-12 overflow-hidden">
        {[
          { label: 'Delivery Terms:', text: terms.deliveryTerms || 'N/A' },
          { label: 'Delivery Location:', text: terms.deliveryLocation || 'N/A' },
          { label: 'Bill Submission:', text: terms.billSubmission || 'N/A' },
          { label: 'Documents to be submitted with the bill:', text: terms.documentsRequired || 'N/A' },
          { label: 'Payment Terms:', text: terms.paymentTerms || 'N/A' },
          { label: 'Payment Mode:', text: terms.paymentMethod || 'Bank A/C Name: N/A\nBank A/C Number: N/A\nBank Name: N/A\nBranch Name: N/A\nRouting No.: N/A\nSwift Code: N/A' },
        ].map((row, i) => (
          <div key={i} className="flex border-b last:border-0 border-black min-h-[50px]">
            <div className="w-64 px-4 py-3 font-bold border-r border-black flex items-center bg-gray-50/30">
              {row.label}
            </div>
            <div className="flex-1 px-4 py-3 whitespace-pre-wrap leading-relaxed text-[8px] flex items-center">
              {row.text}
            </div>
          </div>
        ))}
      </div>

      {/* Signature Grid */}
      <div className="grid grid-cols-5 gap-4 mt-16 px-4">
        {[
          { title: 'PREPARED BY', name: 'SOHEL RANA', company: 'Fair Technology Limited' },
          { title: 'CHECKED BY', name: 'SOHEL RANA', company: 'Fair Technology Limited' },
          { title: 'CONFIRMED BY', name: 'SOHEL RANA', company: 'Fair Technology Limited' },
          { title: 'APPROVED BY', name: 'SOHEL RANA', company: 'Fair Technology Limited' },
          { title: 'ACCEPTED BY', name: po.supplier_name || 'NSR COMPUTER & STATIO...', company: 'Fair Technology Limited' },
        ].map((sig, i) => (
          <div key={i} className="text-center flex flex-col">
            <div className="border-t-[1.5px] border-black pt-2 mb-1">
              <p className="font-black text-[9px] uppercase tracking-wider">{sig.title}</p>
            </div>
            <p className="text-[8px] font-bold uppercase truncate px-1 text-gray-800">{sig.name}</p>
            <p className="text-[7px] text-gray-400 font-medium">{sig.company}</p>
          </div>
        ))}
      </div>

      {/* Footer Branding */}
      <div className="mt-12 text-center text-gray-300 text-[8px] font-black uppercase tracking-[0.3em]">
        ALIGN ERP GENERATED DOCUMENT • SYSTEM DATE: {new Date().toLocaleDateString()}
      </div>
    </div>
  );
};

export default POPrintTemplate;
