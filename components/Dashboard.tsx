import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import UserManagement from './UserManagement';
import MoveOrderModal from './MoveOrderModal';
import StockStatusModal from './StockStatusModal';
import PurchaseRequisition from './PurchaseRequisition';
import PurchaseOrder from './PurchaseOrder';
import Supplier from './Supplier'; // Added import
import { 
  Gauge, 
  ShoppingCart, 
  Warehouse, 
  LayoutGrid, 
  ChevronDown, 
  ChevronRight, 
  LogOut, 
  User as UserIcon,
  Search,
  ArrowRightLeft,
  Menu,
  FileText,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Bell
} from 'lucide-react';

const SidebarItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean; 
  hasSubmenu?: boolean;
  isOpen?: boolean;
  isCollapsed?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  danger?: boolean;
}> = ({ icon, label, active, hasSubmenu, isOpen, isCollapsed, onClick, children, danger }) => {
  return (
    <div className="w-full">
      <button
        onClick={onClick}
        title={isCollapsed ? label : ''}
        className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-4 py-2.5 text-sm transition-all duration-200 ${
          active 
            ? 'text-[#2d808e] bg-[#d1e0e2] font-semibold border border-[#2d808e] rounded-lg' 
            : danger 
              ? 'text-red-500 hover:bg-red-50' 
              : 'text-gray-600 hover:bg-gray-50'
        } ${active ? 'mx-2 w-[calc(100%-16px)]' : ''}`}
      >
        <div className="flex items-center space-x-3">
          <div className={`${active ? 'text-[#2d808e]' : danger ? 'text-red-400' : 'text-gray-500'}`}>
            {icon}
          </div>
          {!isCollapsed && <span className="text-[13px]">{label}</span>}
        </div>
        {!isCollapsed && hasSubmenu && (
          <div className="text-gray-400">
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
        )}
      </button>
      {!isCollapsed && isOpen && children && <div className="py-1">{children}</div>}
    </div>
  );
};

const SubmenuItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 pl-12 pr-4 py-2 text-[13px] transition-all duration-200 ${
      active 
        ? 'text-[#2d808e] bg-[#d1e0e2] font-semibold border border-[#2d808e] rounded-lg mx-2 w-[calc(100%-16px)]' 
        : 'text-gray-600 hover:bg-gray-50'
    }`}
  >
    <div className={`${active ? 'text-[#2d808e]' : 'text-gray-400'}`}>
      {icon}
    </div>
    <span>{label}</span>
  </button>
);

const Dashboard: React.FC = () => {
  const { user, logout, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMoveOrderModalOpen, setIsMoveOrderModalOpen] = useState(false);
  const [isStockStatusModalOpen, setIsStockStatusModalOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    purchase: true,
    warehouse: true,
    itemMaster: true
  });

  // Requisition State
  const [requisitions, setRequisitions] = useState([
    { 
      PR: '3000000018', code: '1000000280', SKU: '3100000117', name: 'ARM GUARD', spec: 'JA Brand, Black', UOM: 'PAIR', 
      PRPrice: 310.02, reqQty: 60, POQty: 0, recQty: 0, reqDpt: 'MMT', reqBy: 'Sohel Rana', 
      createdAt: '2026-01-26 12:05', updateBy: 'Sohel Rana', updatedAt: '2026-01-26 12:05', status: 'In-Process', value: 75465
    },
    { 
      PR: '3000000017', code: 'NA', SKU: 'non-storage', name: 'Servicing Charge', spec: 'SVSD & Serial No.', UOM: 'JOB', 
      PRPrice: 18500, reqQty: 1, POQty: 0, recQty: 0, reqDpt: 'Maintenance', reqBy: 'Md. Jahangir Alam', 
      createdAt: '2026-01-24 16:21', updateBy: 'Sohel Rana', updatedAt: '2026-01-24 16:21', status: 'Checked', value: 18500
    },
    { 
      PR: '3000000016', code: '1000001573', SKU: '3300000035', name: 'A4 PAPER', spec: 'Double A', UOM: 'REAM', 
      PRPrice: 499.5, reqQty: 10, POQty: 10, recQty: 10, reqDpt: 'Admin', reqBy: 'Mr. Nahidul Hassan', 
      createdAt: '2026-01-22 10:01', updateBy: 'Sohel Rana', updatedAt: '2026-01-22 10:17', status: 'Approved', value: 4995
    }
  ]);

  // Purchase Order State
  const [purchaseOrders] = useState([
    { poNo: '4000000004', prNo: '3000000016', sku: '3300000035', name: 'A4 PAPER', price: '499.5', qty: 10, value: 4995.00, grnQty: 10, reqBy: 'Sohel Rana', supplier: 'NSR COMPUTER & STATIONERY' },
    { poNo: '4000000003', prNo: '3000000011', sku: '3100000198', name: 'COOLANT PREMIXED, RED, 4 LTR', price: '383', qty: 252, value: 96516.00, grnQty: 252, reqBy: 'Sohel Rana', supplier: 'M/S SHIFA ENTERPRISE' },
    { poNo: '4000000002', prNo: '3000000010', sku: '3100000121', name: 'AC GAS, R134A', price: '18900', qty: 2, value: 37800.00, grnQty: 2, reqBy: 'Sohel Rana', supplier: 'M/S SHIFA ENTERPRISE' },
    { poNo: '4000000001', prNo: '3000000009', sku: '3100001447', name: 'PTFE DIAPHRAGM REPAIR KIT SET (245065)', price: '12837.5', qty: 8, value: 102700.00, grnQty: 8, reqBy: 'Sohel Rana', supplier: 'TALUS MACHINANERY CO. LIMITED' }
  ]);

  const toggleMenu = (menu: string) => {
    if (isSidebarCollapsed) {
      setIsSidebarCollapsed(false);
      setOpenMenus(prev => ({ ...prev, [menu]: true }));
    } else {
      setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
    }
  };

  const pendingApprovals = useMemo(() => {
    return requisitions.filter(r => r.status === 'In-Process' || r.status === 'Checked');
  }, [requisitions]);

  if (!user) return null;

  return (
    <div className="flex h-screen bg-[#f1f3f4] overflow-hidden font-['Inter'] no-print">
      {/* SIDEBAR */}
      <aside className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 flex flex-col h-full transition-all duration-300 ease-in-out z-20 shadow-sm shrink-0`}>
        <div className={`pt-8 pb-6 px-4 flex flex-col items-center space-y-4 ${isSidebarCollapsed ? 'px-0' : ''}`}>
          <div className={`${isSidebarCollapsed ? 'w-10 h-10' : 'w-24 h-24'} rounded-full bg-[#e2eff1] flex items-center justify-center transition-all duration-300`}>
            <UserIcon size={isSidebarCollapsed ? 20 : 48} className="text-[#2d808e]" strokeWidth={1.5} />
          </div>
          {!isSidebarCollapsed && (
            <div className="text-center overflow-hidden w-full">
              <span className="text-[15px] font-medium text-[#2d808e] block truncate">Md Azizul Hakim</span>
            </div>
          )}
        </div>

        <div className="flex-1 py-4 overflow-y-auto overflow-x-hidden space-y-1">
          <SidebarItem 
            icon={<Gauge size={18} />} 
            label="Dashboard" 
            active={activeTab === 'overview'} 
            isCollapsed={isSidebarCollapsed} 
            onClick={() => setActiveTab('overview')} 
          />

          <SidebarItem 
            icon={<ShoppingCart size={18} />} 
            label="Purchase" 
            hasSubmenu 
            isCollapsed={isSidebarCollapsed} 
            isOpen={openMenus.purchase} 
            onClick={() => toggleMenu('purchase')}
          >
            <div className="space-y-1 mt-1">
              <SubmenuItem icon={<FileText size={16} />} label="Requisition" active={activeTab === 'requisition'} onClick={() => setActiveTab('requisition')} />
              <SubmenuItem icon={<FileText size={16} />} label="Order" active={activeTab === 'purchase-order'} onClick={() => setActiveTab('purchase-order')} />
              <SubmenuItem icon={<FileText size={16} />} label="Supplier" active={activeTab === 'supplier'} onClick={() => setActiveTab('supplier')} />
              <SubmenuItem icon={<FileText size={16} />} label="Report" active={activeTab === 'purchase-report'} onClick={() => setActiveTab('purchase-report')} />
            </div>
          </SidebarItem>

          <SidebarItem 
            icon={<Warehouse size={18} />} 
            label="Warehouse" 
            hasSubmenu 
            isCollapsed={isSidebarCollapsed} 
            isOpen={openMenus.warehouse} 
            onClick={() => toggleMenu('warehouse')}
          >
            <div className="space-y-1 mt-1">
              <SubmenuItem icon={<LayoutGrid size={16} />} label="Inventory" active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} />
              <SubmenuItem icon={<ArrowRight size={16} />} label="Receive" active={activeTab === 'receive'} onClick={() => setActiveTab('receive')} />
              <SubmenuItem icon={<ArrowLeft size={16} />} label="Issue" active={activeTab === 'issue'} onClick={() => setActiveTab('issue')} />
              <SubmenuItem icon={<FileText size={16} />} label="Tnx-Report" active={activeTab === 'tnx-report'} onClick={() => setActiveTab('tnx-report')} />
              <SubmenuItem icon={<FileText size={16} />} label="MO-Report" active={activeTab === 'mo-report'} onClick={() => setActiveTab('mo-report')} />
            </div>
          </SidebarItem>

          <SidebarItem 
            icon={<LayoutGrid size={18} />} 
            label="Item Master" 
            hasSubmenu 
            isCollapsed={isSidebarCollapsed} 
            isOpen={openMenus.itemMaster} 
            onClick={() => toggleMenu('itemMaster')}
          >
            <div className="space-y-1 mt-1">
              <SubmenuItem icon={<FileText size={16} />} label="Item List" active={activeTab === 'item-list'} onClick={() => setActiveTab('item-list')} />
              <SubmenuItem icon={<FileText size={16} />} label="Item Details" active={activeTab === 'item-details'} onClick={() => setActiveTab('item-details')} />
            </div>
          </SidebarItem>

          {hasPermission('manage_users') && (
            <SidebarItem 
              icon={<UserIcon size={18} />} 
              label="User Management" 
              active={activeTab === 'users'} 
              isCollapsed={isSidebarCollapsed} 
              onClick={() => setActiveTab('users')} 
            />
          )}
        </div>

        <div className="border-t border-gray-100 py-2">
          <SidebarItem icon={<UserIcon size={18} />} label="Profile" isCollapsed={isSidebarCollapsed} onClick={() => {}} />
          <SidebarItem icon={<LogOut size={18} />} label="Logout" danger isCollapsed={isSidebarCollapsed} onClick={logout} />
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center space-x-6">
            <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-600"><Menu size={24} /></button>
            <h1 className="text-2xl font-black text-gray-800 tracking-tighter">ALIGN</h1>
          </div>
          <div className="flex-1 max-w-2xl px-8">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search size={18} className="text-gray-400 group-focus-within:text-[#2d808e]" /></div>
              <input type="text" placeholder="Search resources..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-transparent focus:border-[#2d808e] focus:bg-white rounded-lg outline-none text-sm transition-all" />
            </div>
          </div>
          <div className="flex items-center space-x-4">
             <div className="flex items-center space-x-2 mr-4 text-gray-400">
                <Bell size={20} />
             </div>
             <button 
                onClick={() => setIsStockStatusModalOpen(true)}
                className="flex items-center px-4 py-2 bg-[#2d808e] text-white text-xs font-bold rounded shadow-sm hover:bg-[#256b78] transition-all"
              >
                <CheckCircle2 size={14} className="mr-2" /> Check Stock
             </button>
             <button 
                onClick={() => setIsMoveOrderModalOpen(true)}
                className="flex items-center px-4 py-2 bg-[#17a2b8] text-white text-xs font-bold rounded shadow-sm hover:bg-[#138496] transition-all"
              >
               <ArrowRightLeft size={14} className="mr-2" /> Move Order
             </button>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#f1f3f4] pb-24">
          {activeTab === 'users' ? (
            <div className="max-w-6xl mx-auto"><UserManagement /></div>
          ) : activeTab === 'requisition' ? (
            <div className="max-w-[1600px] mx-auto">
              <PurchaseRequisition 
                requisitions={requisitions} 
                setRequisitions={setRequisitions} 
              />
            </div>
          ) : activeTab === 'purchase-order' ? (
            <div className="max-w-[1600px] mx-auto">
              <PurchaseOrder orders={purchaseOrders} />
            </div>
          ) : activeTab === 'supplier' ? (
            <div className="max-w-[1600px] mx-auto">
              <Supplier />
            </div>
          ) : activeTab === 'overview' ? (
            <div className="max-w-[1600px] mx-auto space-y-6">
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { label: 'Today Order(Qty)', value: '0 (0)' },
                  { label: 'Lastday Order(Qty)', value: '338.3K (380)' },
                  { label: 'Weekly Order(Qty)', value: '1.2M (2.0K)' },
                  { label: 'Monthly Order(Qty)', value: '5.7M (8.5K)' },
                  { label: 'Weekly PR(Qty)', value: '94.0K (1.7K)' },
                  { label: 'Monthly PR(Qty)', value: '578.2K (3.3K)' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-center">
                    <span className="text-[10px] text-gray-400 font-bold uppercase mb-2">{stat.label}</span>
                    <span className="text-lg font-bold text-red-500">{stat.value}</span>
                  </div>
                ))}
              </div>

              <div className="bg-white p-6 rounded shadow-sm border border-gray-100 max-w-sm">
                <h3 className="text-base font-bold text-[#2d808e] mb-4 uppercase tracking-tighter">PR Approval</h3>
                <div className="overflow-hidden border rounded border-gray-100">
                  <table className="w-full text-[10px] text-left">
                    <thead className="bg-gray-50 text-gray-500 font-black uppercase">
                      <tr>
                        <th className="px-4 py-3 border-b border-gray-100 tracking-tighter">Date</th>
                        <th className="px-4 py-3 border-b border-gray-100 tracking-tighter">Ref.No</th>
                        <th className="px-4 py-3 border-b border-gray-100 text-right tracking-tighter">Value</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600 font-bold">
                      {pendingApprovals.map((pr, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4">{pr.createdAt.split(' ')[0]}</td>
                          <td className="px-4 py-4 text-blue-500 hover:underline cursor-pointer">{pr.PR}</td>
                          <td className="px-4 py-4 text-right">{pr.value || 0}</td>
                        </tr>
                      ))}
                      {pendingApprovals.length === 0 && (
                        <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400 italic">No PRs pending approval</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded shadow-sm border border-gray-100">
                   <h3 className="text-lg font-bold text-[#2d808e] mb-8">Weekly Order</h3>
                   <div className="h-64 relative flex items-end justify-between px-12">
                      <div className="absolute -left-2 top-0 bottom-8 flex flex-col justify-between text-[9px] text-gray-400 font-bold">
                        {[700, 600, 500, 400, 300, 200, 100, 0].map(v => <span key={v}>{v}</span>)}
                      </div>
                      <div className="absolute inset-0 bottom-8 pointer-events-none flex flex-col justify-between px-12">
                         {[1,2,3,4,5,6,7].map(i => <div key={i} className="w-full border-t border-gray-100 border-dashed"></div>)}
                      </div>
                      {['24-Sat', '25-Sun', '26-Mon', '27-Tue', '28-Wed', '29-Thu', '30-Fri'].map((day, i) => {
                        const heights = [12, 18, 0, 0, 95, 52, 0];
                        const colors = ['bg-[#e3f9a6]', 'bg-[#e3f9a6]', 'bg-gray-200', 'bg-gray-200', 'bg-[#0f172a]', 'bg-[#43a9bc]', 'bg-gray-200'];
                        return (
                          <div key={day} className="flex-1 flex flex-col items-center relative z-10 mx-2">
                            <div style={{ height: `${heights[i]}%` }} className={`w-10 rounded-t-sm ${colors[i]}`}></div>
                            <span className="text-[9px] mt-4 font-bold text-gray-400 whitespace-nowrap">{day}</span>
                          </div>
                        );
                      })}
                   </div>
                </div>

                <div className="bg-white p-8 rounded shadow-sm border border-gray-100">
                   <h3 className="text-lg font-bold text-[#2d808e] mb-8">Monthly Order</h3>
                   <div className="h-64 relative px-12">
                      <div className="absolute -left-2 top-0 bottom-8 flex flex-col justify-between text-[9px] text-gray-400 font-bold">
                        {[6000000, 5000000, 4000000, 3000000, 2000000, 1000000, 0].map(v => <span key={v}>{v} -</span>)}
                      </div>
                      <div className="absolute inset-0 bottom-8 pointer-events-none flex flex-col justify-between px-12">
                         {[1,2,3,4,5,6].map(i => <div key={i} className="w-full border-t border-gray-100 border-dashed"></div>)}
                      </div>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded shadow-sm border border-gray-100">
                   <h3 className="text-lg font-bold text-[#2d808e] mb-6">Latest orders</h3>
                   <div className="overflow-x-auto">
                      <table className="w-full text-[11px] text-left">
                         <thead className="bg-gray-50 text-gray-500 font-black uppercase">
                            <tr className="border-b border-gray-100">
                               <th className="px-3 py-3">#</th>
                               <th className="px-3 py-3">Date</th>
                               <th className="px-3 py-3">Tnx.No</th>
                               <th className="px-3 py-3">Item Name</th>
                               <th className="px-3 py-3 text-right">Qty</th>
                            </tr>
                         </thead>
                         <tbody className="text-gray-600 font-medium">
                            <tr className="border-b border-gray-50 hover:bg-gray-50/50">
                               <td className="px-3 py-3">1</td>
                               <td className="px-3 py-3">29-Jan-26</td>
                               <td className="px-3 py-3 text-blue-500 font-bold">10385</td>
                               <td className="px-3 py-3 uppercase text-[9px]">DIESEL</td>
                               <td className="px-3 py-3 text-right">32</td>
                            </tr>
                         </tbody>
                      </table>
                   </div>
                </div>

                <div className="bg-white p-6 rounded shadow-sm border border-gray-100">
                   <h3 className="text-lg font-bold text-[#2d808e] mb-6">Latest PR</h3>
                   <div className="overflow-x-auto">
                      <table className="w-full text-[11px] text-left">
                         <thead className="bg-gray-50 text-gray-500 font-black uppercase">
                            <tr className="border-b border-gray-100">
                               <th className="px-3 py-3">#</th>
                               <th className="px-3 py-3">Date</th>
                               <th className="px-3 py-3">PR No</th>
                               <th className="px-3 py-3">Requested By</th>
                               <th className="px-3 py-3 text-right">Qty</th>
                               <th className="px-3 py-3 text-right">Value</th>
                            </tr>
                         </thead>
                         <tbody className="text-gray-600 font-medium">
                            {requisitions.slice(0, 10).map((row, idx) => (
                               <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50">
                                  <td className="px-3 py-3">{idx + 1}</td>
                                  <td className="px-3 py-3 whitespace-nowrap">{row.createdAt.split(' ')[0]}</td>
                                  <td className="px-3 py-3 text-blue-500 font-bold">{row.PR}</td>
                                  <td className="px-3 py-3 font-bold uppercase text-[9px]">{row.reqBy}</td>
                                  <td className="px-3 py-3 text-right">{row.reqQty}</td>
                                  <td className="px-3 py-3 text-right">{row.value || 0}</td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>
              </div>
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <FileText size={48} strokeWidth={1} />
                <p className="mt-4 text-sm font-medium capitalize">{activeTab.replace('-', ' ')} module content here</p>
             </div>
          )}
        </main>

        {/* FIXED FOOTER - STICKY AT BOTTOM */}
        <footer className="h-16 border-t border-gray-200 flex items-center justify-center bg-white px-6 shrink-0 sticky bottom-0 z-10">
           <div className="flex items-center space-x-6 text-[10px] uppercase font-bold tracking-[0.2em]">
              <p className="text-gray-500">All rights Reserved © ALIGN 2026</p>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <p className="text-gray-400">Developed by <span className="text-[#2d808e] font-black">Al Amin ET</span></p>
           </div>
        </footer>
      </div>

      <MoveOrderModal isOpen={isMoveOrderModalOpen} onClose={() => setIsMoveOrderModalOpen(false)} />
      <StockStatusModal isOpen={isStockStatusModalOpen} onClose={() => setIsStockStatusModalOpen(false)} />
    </div>
  );
};

export default Dashboard;