import React from 'react';
import { Printer } from 'lucide-react';

interface POPrintTemplateProps {
  po: any;
}

const POPrintTemplate: React.FC<POPrintTemplateProps> = ({ po }) => {
  // Use data from the PO object or defaults for the mock/initial view
  const items = po.items || [
    {
      prRef: po.prNo || '3000000016',
      sku: po.sku || po.code || '3300000035',
      name: po.name || 'A4 PAPER',
      spec: po.spec || po.specification || 'Double A',
      remarks: po.remarks || '',
      uom: po.uom || 'REAM',
      price: po.price || 499.50,
      vat: po.vatPercent || 10.00,
      qty: po.qty || po.poQty || 10,
      value: po.value || (Number(po.price || 499.50) * Number(po.qty || po.poQty || 10))
    }
  ];

  const totalValue = items.reduce((acc: number, i: any) => acc + (Number(i.value) || 0), 0);
  const totalVat = items.reduce((acc: number, i: any) => acc + ((Number(i.value) || 0) * (Number(i.vat) || 0) / 100), 0);
  const grandTotal = totalValue + totalVat;

  // Helper for currency formatting
  const formatCurrency = (num: number) => num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="p-10 bg-white text-black font-sans min-h-screen text-[10px]">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1 text-center pl-20">
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Fair Technology Limited</h1>
          <p className="text-[10px] text-gray-600">Plot- 12/A & 12/B, Block-C, Kaliakoir Hi-Tech Park</p>
          <p className="text-[10px] text-gray-600">Gazipur, Bangladesh-1750. +#880 1787-670 786</p>
          <div className="mt-4">
            <h2 className="text-sm font-bold uppercase border-b-2 border-black inline-block px-4">PURCHASE ORDER (PO)</h2>
          </div>
        </div>
        <div className="w-20 h-20 border border-gray-100 flex items-center justify-center">
           <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=75x75&data=PO-${po.poNo || 'TEMP'}`} 
            alt="QR" 
            className="w-[70px] h-[70px]"
           />
        </div>
      </div>

      {/* Meta Grid Section */}
      <div className="grid grid-cols-3 gap-6 mb-4 border-t border-gray-200 pt-4">
        {/* Supplier Details */}
        <div className="space-y-1">
          <p><span className="font-bold">PO No.:</span> {po.poNo || '4000000004'}</p>
          <p><span className="font-bold">Supplier Name:</span> {po.supplier || 'NSR COMPUTER & STATIONERY'}</p>
          <p className="text-[9px]"><span className="font-bold">Supplier Address:</span> {po.supplierAddress || 'Dhaka-1213, Mohakhali, Dhaka, Bangladesh.'}</p>
          <p><span className="font-bold">VAT No.:</span> {po.supplierVat || '002481919-0101'}</p>
          <p><span className="font-bold">TIN No.:</span> {po.supplierTin || '373350321060'}</p>
          <p><span className="font-bold">Email:</span> {po.supplierEmail || 'nsr201218@yahoo.com'}</p>
          <p><span className="font-bold">Contact:</span> {po.supplierContact || '01927963132'}</p>
        </div>
        
        {/* Buyer Details */}
        <div className="space-y-1">
          <p><span className="font-bold">Buyer Name:</span> {po.buyerName || 'Fair Technology Limited'}</p>
          <p className="text-[9px]"><span className="font-bold">Buyer Address:</span> {po.buyerAddress || '76/B, Khawaja Palace, Road-11 Banani, Dhaka, Bangladesh, 1213.'}</p>
          <p><span className="font-bold">Buyer BIN Name:</span> {po.buyerBinName || 'XXXXX'}</p>
          <p><span className="font-bold">Buyer BIN No.:</span> {po.buyerBinNo || 'XXXX'}</p>
          <p><span className="font-bold">Buyer BIN Address:</span> {po.buyerBinAddress || 'XXXX'}</p>
        </div>

        {/* Order Meta */}
        <div className="space-y-1 text-right">
          <p><span className="font-bold">Issue Date:</span> {po.issueDate || '22-Jan-2026'}</p>
          <p><span className="font-bold">Delivery Date:</span> {po.deliveryDate || '22-Jan-2026'}</p>
          <p><span className="font-bold">PO Status:</span> {po.status || 'Approved'}</p>
          <p><span className="font-bold">Currency:</span> {po.currency || 'BDT'}</p>
          <p><span className="font-bold">Requested by:</span> {po.reqBy || 'Sohel Rana'}</p>
          <p><span className="font-bold">Contact No.:</span> {po.reqContact || '+880 1773 402954'}</p>
          <p><span className="font-bold">PO Note:</span> {po.poNote || 'Stationery item.'}</p>
        </div>
      </div>

      {/* Main Table */}
      <table className="w-full border-collapse border border-black mb-1">
        <thead>
          <tr className="bg-white text-[9px] font-bold">
            <th className="border border-black py-1 px-1 text-center w-6">SL</th>
            <th className="border border-black py-1 px-1 text-center">PR Ref.</th>
            <th className="border border-black py-1 px-1 text-center">Part Code</th>
            <th className="border border-black py-1 px-2 text-center w-48">Name</th>
            <th className="border border-black py-1 px-1 text-center">Spec.</th>
            <th className="border border-black py-1 px-1 text-center">Remarks</th>
            <th className="border border-black py-1 px-1 text-center">UOM</th>
            <th className="border border-black py-1 px-1 text-center">Unit Price ({po.currency || 'BDT'})</th>
            <th className="border border-black py-1 px-1 text-center">% of VAT</th>
            <th className="border border-black py-1 px-1 text-center w-12">PO Qty</th>
            <th className="border border-black py-1 px-1 text-center">PO Value ({po.currency || 'BDT'})</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item: any, idx: number) => (
            <tr key={idx} className="text-[9px]">
              <td className="border border-black py-1 px-1 text-center">{idx + 1}</td>
              <td className="border border-black py-1 px-1 text-center">{item.prRef}</td>
              <td className="border border-black py-1 px-1 text-center">{item.sku}</td>
              <td className="border border-black py-1 px-2 font-bold uppercase">{item.name}</td>
              <td className="border border-black py-1 px-1 text-center">{item.spec}</td>
              <td className="border border-black py-1 px-1 text-center">{item.remarks}</td>
              <td className="border border-black py-1 px-1 text-center uppercase">{item.uom}</td>
              <td className="border border-black py-1 px-1 text-right">{formatCurrency(Number(item.price))}</td>
              <td className="border border-black py-1 px-1 text-center">{Number(item.vat).toFixed(2)}</td>
              <td className="border border-black py-1 px-1 text-center font-bold">{item.qty}</td>
              <td className="border border-black py-1 px-1 text-right font-bold">{formatCurrency(Number(item.value))}</td>
            </tr>
          ))}
          {/* Summary Rows */}
          <tr className="font-bold text-[9px]">
            <td colSpan={9} className="border border-black py-1 px-1 text-right">Total</td>
            <td className="border border-black py-1 px-1 text-center">{items.reduce((a: number, b: any) => a + Number(b.qty), 0)}</td>
            <td className="border border-black py-1 px-1 text-right">{formatCurrency(totalValue)}</td>
          </tr>
          <tr className="font-bold text-[9px]">
            <td colSpan={10} className="border border-black py-1 px-1 text-right">VAT Amount</td>
            <td className="border border-black py-1 px-1 text-right">{formatCurrency(totalVat)}</td>
          </tr>
          <tr className="font-bold text-[9px] bg-gray-50">
            <td colSpan={10} className="border border-black py-1 px-1 text-right">Grand Total</td>
            <td className="border border-black py-1 px-1 text-right">{formatCurrency(grandTotal)}</td>
          </tr>
        </tbody>
      </table>

      {/* Amount In Words */}
      <p className="text-[9px] font-bold mb-6 mt-2">
        Total Amount In Word: <span className="uppercase italic">FIVE THOUSAND FOUR HUNDRED NINETY-FOUR POINT FIVE BDT ONLY.</span>
      </p>

      {/* Terms & Conditions Section */}
      <div className="space-y-0 border border-black overflow-hidden mb-8">
        {[
          { label: 'Delivery Terms:', text: po.deliveryTerms || '1. Delivery has to be done within 03 working days after receiving PO by the supplier.\n2. Delivery has to be done as per specification of PO and quotation.\n3. Incase of failure of work within the given time, supplier will be penalized as per company policy.\n4. If any damage or problem occurs with the product, the supplier/seller will immediately replace/make arrangements with a new product.' },
          { label: 'Delivery Location:', text: po.deliveryLocation || 'Contact Person: ZZZ (+8801 222 222 22)\nPlot- 12/A & 12/B, Block-C, Kaliakoir Hi-Tech Park, Gazipur, Bangladesh, 1750.' },
          { label: 'Bill Submission:', text: po.billSubmission || 'Contact Person: KKK (+880 111 222 333)\n76/B, Khawaja Palace, Road-11 Banani, Dhaka, Bangladesh, 1213.' },
          { label: 'Documents to be submitted with the bill:', text: po.documentsRequired || '1. Fully signed PO copy accept by supplier.\n2. Delivery challan with receiving sign from inventory/warehouse officials.\n3. Mushok 6.3.\n4. Price quotation.' },
          { label: 'Payment Terms:', text: po.paymentTerms || '1. 100% payment will be made within 30 working days of successful delivery of required .\n2. VAT and AIT applicable as per BD Govt. rules.' },
          { label: 'Payment Mode:', text: po.paymentMethod || 'Bank A/C Name: N/A\nBank A/C Number: N/A\nBank Name: N/A\nBranch Name: N/A\nRouting No.: N/A\nSwift Code: N/A' },
        ].map((row, i) => (
          <div key={i} className="flex border-b last:border-0 border-black min-h-[40px]">
            <div className="w-64 px-2 py-1.5 font-bold border-r border-black flex items-center bg-gray-50/50">
              {row.label}
            </div>
            <div className="flex-1 px-2 py-1.5 whitespace-pre-wrap leading-tight text-[8px] flex items-center">
              {row.text}
            </div>
          </div>
        ))}
      </div>

      {/* Signature Grid */}
      <div className="grid grid-cols-5 gap-4 mt-16 px-4">
        {[
          { title: 'Prepared By', name: po.reqBy || 'Sohel Rana' },
          { title: 'Checked By', name: 'Sohel Rana' },
          { title: 'Confirmed By', name: 'Sohel Rana' },
          { title: 'Approved By', name: 'Sohel Rana' },
          { title: 'Accepted By', name: po.supplier || 'NSR COMPUTER & STATIONERY' },
        ].map((sig, i) => (
          <div key={i} className="text-center">
            <div className="border-t border-black mb-1 pt-1">
              <p className="font-bold text-[9px] uppercase">{sig.title}</p>
            </div>
            <p className="text-[8px] text-gray-700 font-bold uppercase truncate">{sig.name}</p>
            <p className="text-[7px] text-gray-400">Fair Technology Limited</p>
          </div>
        ))}
      </div>

      {/* Print Footer */}
      <div className="mt-8 flex items-center text-gray-300 text-[8px] font-bold uppercase tracking-widest">
         <Printer size={12} className="mr-2" />
         <span>ALIGN ERP GENERATED DOCUMENT • SYSTEM DATE: {new Date().toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default POPrintTemplate;