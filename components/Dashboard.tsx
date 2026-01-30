
import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import UserManagement from './UserManagement';
import MoveOrderModal from './MoveOrderModal';
import StockStatusModal from './StockStatusModal';
import PurchaseRequisition from './PurchaseRequisition';
import PurchaseOrder from './PurchaseOrder';
import Supplier from './Supplier';
import PurchaseReport from './PurchaseReport';
import Inventory from './Inventory';
import Receive from './Receive';
import Issue from './Issue';
import TnxReport from './TnxReport';
import MOReport from './MOReport';
import ItemList from './ItemList';
import ItemUOM from './ItemUOM';
import ItemGroup from './ItemGroup';
import ItemType from './ItemType';
import CostCenter from './CostCenter';
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
  Bell,
  Layers,
  Tag,
  Boxes,
  Home,
  ClipboardList,
  ShoppingBag,
  Truck,
  BarChart3
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
      createdAt: '2026-01-26 12:05', updateBy: 'Sohel Rana', updatedAt: '2026-01-26 12:05', status: 'In-Process', value: 18601.2
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
            <div className="text-center overflow-hidden w-full px-2">
              <span className="text-[13px] font-bold text-[#2d808e] block truncate uppercase tracking-tight">{user.email.split('@')[0]}</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{user.role}</span>
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
              <SubmenuItem icon={<ClipboardList size={16} />} label="Requisition" active={activeTab === 'requisition'} onClick={() => setActiveTab('requisition')} />
              <SubmenuItem icon={<ShoppingBag size={16} />} label="Order" active={activeTab === 'purchase-order'} onClick={() => setActiveTab('purchase-order')} />
              <SubmenuItem icon={<Truck size={16} />} label="Supplier" active={activeTab === 'supplier'} onClick={() => setActiveTab('supplier')} />
              <SubmenuItem icon={<BarChart3 size={16} />} label="Report" active={activeTab === 'purchase-report'} onClick={() => setActiveTab('purchase-report')} />
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
              <SubmenuItem icon={<Boxes size={16} />} label="Item UOM" active={activeTab === 'item-uom'} onClick={() => setActiveTab('item-uom')} />
              <SubmenuItem icon={<Layers size={16} />} label="Item Group" active={activeTab === 'item-group'} onClick={() => setActiveTab('item-group')} />
              <SubmenuItem icon={<Tag size={16} />} label="Item Type" active={activeTab === 'item-type'} onClick={() => setActiveTab('item-type')} />
              <SubmenuItem icon={<Home size={16} />} label="Cost Center" active={activeTab === 'cost-center'} onClick={() => setActiveTab('cost-center')} />
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
             <button className="flex items-center space-x-2 mr-4 text-gray-400 hover:text-[#2d808e] transition-colors">
                <Bell size={20} />
             </button>
             
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
              <PurchaseRequisition requisitions={requisitions} setRequisitions={setRequisitions} />
            </div>
          ) : activeTab === 'purchase-order' ? (
            <div className="max-w-[1600px] mx-auto">
              <PurchaseOrder orders={purchaseOrders} />
            </div>
          ) : activeTab === 'supplier' ? (
            <div className="max-w-[1600px] mx-auto">
              <Supplier />
            </div>
          ) : activeTab === 'purchase-report' ? (
            <div className="max-w-[1600px] mx-auto">
              <PurchaseReport />
            </div>
          ) : activeTab === 'inventory' ? (
            <div className="max-w-[1600px] mx-auto">
              <Inventory />
            </div>
          ) : activeTab === 'receive' ? (
            <div className="max-w-[1600px] mx-auto">
              <Receive />
            </div>
          ) : activeTab === 'issue' ? (
            <div className="max-w-[1600px] mx-auto">
              <Issue />
            </div>
          ) : activeTab === 'tnx-report' ? (
            <div className="max-w-[1600px] mx-auto">
              <TnxReport />
            </div>
          ) : activeTab === 'mo-report' ? (
            <div className="max-w-[1600px] mx-auto">
              <MOReport />
            </div>
          ) : activeTab === 'item-list' ? (
            <div className="max-w-[1600px] mx-auto">
              <ItemList />
            </div>
          ) : activeTab === 'item-uom' ? (
            <div className="max-w-[1600px] mx-auto">
              <ItemUOM />
            </div>
          ) : activeTab === 'item-group' ? (
            <div className="max-w-[1600px] mx-auto">
              <ItemGroup />
            </div>
          ) : activeTab === 'item-type' ? (
            <div className="max-w-[1600px] mx-auto">
              <ItemType />
            </div>
          ) : activeTab === 'cost-center' ? (
            <div className="max-w-[1600px] mx-auto">
              <CostCenter />
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
              {/* Simplified overview for clarity */}
              <div className="bg-white p-8 rounded shadow-sm border border-gray-100 text-center py-20 text-gray-400">
                <Gauge size={48} className="mx-auto mb-4" />
                <p>Welcome to ALIGN ERP Dashboard. Use the sidebar to navigate through modules.</p>
              </div>
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <FileText size={48} strokeWidth={1} />
                <p className="mt-4 text-sm font-medium capitalize">{activeTab.replace('-', ' ')} module content here</p>
             </div>
          )}
        </main>

        {/* FIXED FOOTER */}
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
