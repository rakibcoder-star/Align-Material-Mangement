
import React, { useState, useEffect } from 'react';
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
  BarChart3,
  X
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
        className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-2.5 py-2 text-sm transition-all duration-200 ${
          active 
            ? 'text-[#2d808e] bg-[#d1e0e2] font-semibold border border-[#2d808e] rounded-lg' 
            : danger 
              ? 'text-red-500 hover:bg-red-50' 
              : 'text-gray-600 hover:bg-gray-50'
        } ${active ? 'mx-1.5 w-[calc(100%-12px)]' : ''}`}
      >
        <div className="flex items-center space-x-2">
          <div className={`${active ? 'text-[#2d808e]' : danger ? 'text-red-400' : 'text-gray-500'} shrink-0`}>
            {React.cloneElement(icon as React.ReactElement, { size: 16 })}
          </div>
          {!isCollapsed && <span className="text-[11.5px] leading-tight tracking-tight whitespace-nowrap overflow-hidden">{label}</span>}
        </div>
        {!isCollapsed && hasSubmenu && (
          <div className="text-gray-400 shrink-0 ml-1">
            {isOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
          </div>
        )}
      </button>
      {!isCollapsed && isOpen && children && <div className="py-0.5">{children}</div>}
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
    className={`w-full flex items-center space-x-2 pl-7 pr-2 py-1.5 text-[11.5px] transition-all duration-200 ${
      active 
        ? 'text-[#2d808e] bg-[#d1e0e2] font-semibold border border-[#2d808e] rounded-lg mx-1.5 w-[calc(100%-12px)]' 
        : 'text-gray-600 hover:bg-gray-50'
    }`}
  >
    <div className={`${active ? 'text-[#2d808e]' : 'text-gray-400'} shrink-0`}>
      {React.cloneElement(icon as React.ReactElement, { size: 13 })}
    </div>
    <span className="truncate tracking-tight">{label}</span>
  </button>
);

const Dashboard: React.FC = () => {
  const { user, logout, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoveOrderModalOpen, setIsMoveOrderModalOpen] = useState(false);
  const [isStockStatusModalOpen, setIsStockStatusModalOpen] = useState(false);
  
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    purchase: false,
    warehouse: false,
    itemMaster: false
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMenu = (menu: string) => {
    if (isSidebarCollapsed) {
      setIsSidebarCollapsed(false);
      setOpenMenus(prev => ({ ...prev, [menu]: true }));
    } else {
      setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (window.innerWidth < 768) {
      setIsMobileMenuOpen(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-[#f1f3f4] overflow-hidden font-['Inter'] no-print">
      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR - Width reduced further to md:w-44 from md:w-52 */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 transform md:relative md:translate-x-0 transition-all duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0 w-[200px]' : '-translate-x-full md:translate-x-0'}
        ${isSidebarCollapsed && !isMobileMenuOpen ? 'md:w-16' : 'md:w-44'}
        bg-white border-r border-gray-200 flex flex-col h-full shadow-sm shrink-0
      `}>
        <div className="flex justify-between items-center p-3 md:hidden border-b border-gray-100 mb-2">
          <button onClick={() => handleTabChange('overview')} className="text-lg font-black text-[#2d808e] tracking-tighter">ALIGN</button>
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600 focus:outline-none">
            <X size={18} />
          </button>
        </div>

        <div className={`pt-4 pb-3 px-2 flex flex-col items-center space-y-2 ${isSidebarCollapsed && !isMobileMenuOpen ? 'md:px-0' : ''}`}>
          <div className={`${isSidebarCollapsed && !isMobileMenuOpen ? 'w-9 h-9' : 'w-14 h-14'} rounded-full bg-[#e2eff1] flex items-center justify-center transition-all duration-300 shadow-inner shrink-0`}>
            <UserIcon size={isSidebarCollapsed && !isMobileMenuOpen ? 16 : 28} className="text-[#2d808e]" strokeWidth={1.5} />
          </div>
          {(!isSidebarCollapsed || isMobileMenuOpen) && (
            <div className="text-center overflow-hidden w-full px-1">
              <span className="text-[11px] font-bold text-[#2d808e] block truncate uppercase tracking-tight">{user.email.split('@')[0]}</span>
              <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">{user.role}</span>
            </div>
          )}
        </div>

        <div className="flex-1 py-2 overflow-y-auto overflow-x-hidden space-y-0.5 scrollbar-thin">
          <SidebarItem icon={<Gauge />} label="Dashboard" active={activeTab === 'overview'} isCollapsed={isSidebarCollapsed && !isMobileMenuOpen} onClick={() => handleTabChange('overview')} />

          <SidebarItem icon={<ShoppingCart />} label="Purchase" hasSubmenu isCollapsed={isSidebarCollapsed && !isMobileMenuOpen} isOpen={openMenus.purchase} onClick={() => toggleMenu('purchase')}>
            <div className="space-y-0.5">
              <SubmenuItem icon={<ClipboardList />} label="Requisition" active={activeTab === 'requisition'} onClick={() => handleTabChange('requisition')} />
              <SubmenuItem icon={<ShoppingBag />} label="Order" active={activeTab === 'purchase-order'} onClick={() => handleTabChange('purchase-order')} />
              <SubmenuItem icon={<Truck />} label="Supplier" active={activeTab === 'supplier'} onClick={() => handleTabChange('supplier')} />
              <SubmenuItem icon={<BarChart3 />} label="Report" active={activeTab === 'purchase-report'} onClick={() => handleTabChange('purchase-report')} />
            </div>
          </SidebarItem>

          <SidebarItem icon={<Warehouse />} label="Warehouse" hasSubmenu isCollapsed={isSidebarCollapsed && !isMobileMenuOpen} isOpen={openMenus.warehouse} onClick={() => toggleMenu('warehouse')}>
            <div className="space-y-0.5">
              <SubmenuItem icon={<LayoutGrid />} label="Inventory" active={activeTab === 'inventory'} onClick={() => handleTabChange('inventory')} />
              <SubmenuItem icon={<ArrowRight />} label="Receive" active={activeTab === 'receive'} onClick={() => handleTabChange('receive')} />
              <SubmenuItem icon={<ArrowLeft />} label="Issue" active={activeTab === 'issue'} onClick={() => handleTabChange('issue')} />
              <SubmenuItem icon={<FileText />} label="Tnx-Report" active={activeTab === 'tnx-report'} onClick={() => handleTabChange('tnx-report')} />
              <SubmenuItem icon={<FileText />} label="MO-Report" active={activeTab === 'mo-report'} onClick={() => handleTabChange('mo-report')} />
            </div>
          </SidebarItem>

          <SidebarItem icon={<LayoutGrid />} label="Item Master" hasSubmenu isCollapsed={isSidebarCollapsed && !isMobileMenuOpen} isOpen={openMenus.itemMaster} onClick={() => toggleMenu('itemMaster')}>
            <div className="space-y-0.5">
              <SubmenuItem icon={<FileText />} label="Item List" active={activeTab === 'item-list'} onClick={() => handleTabChange('item-list')} />
              <SubmenuItem icon={<Boxes />} label="Item UOM" active={activeTab === 'item-uom'} onClick={() => handleTabChange('item-uom')} />
              <SubmenuItem icon={<Layers />} label="Item Group" active={activeTab === 'item-group'} onClick={() => handleTabChange('item-group')} />
              <SubmenuItem icon={<Tag />} label="Item Type" active={activeTab === 'item-type'} onClick={() => handleTabChange('item-type')} />
              <SubmenuItem icon={<Home />} label="Cost Center" active={activeTab === 'cost-center'} onClick={() => handleTabChange('cost-center')} />
            </div>
          </SidebarItem>

          {hasPermission('manage_users') && (
            <SidebarItem icon={<UserIcon />} label="Users" active={activeTab === 'users'} isCollapsed={isSidebarCollapsed && !isMobileMenuOpen} onClick={() => handleTabChange('users')} />
          )}
        </div>

        <div className="border-t border-gray-100 py-1.5">
          <SidebarItem icon={<LogOut />} label="Logout" danger isCollapsed={isSidebarCollapsed && !isMobileMenuOpen} onClick={logout} />
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-14 md:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-3 md:px-6 z-30 shrink-0">
          <div className="flex items-center space-x-1.5 md:space-x-4">
            <button onClick={() => window.innerWidth < 768 ? setIsMobileMenuOpen(true) : setIsSidebarCollapsed(!isSidebarCollapsed)} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-[#2d808e] focus:outline-none">
              <Menu size={18} />
            </button>
            <button onClick={() => handleTabChange('overview')} className="text-lg md:text-2xl font-black text-gray-800 tracking-tighter hover:text-[#2d808e] transition-colors">ALIGN</button>
          </div>
          
          <div className="flex-1 max-w-xs px-2 hidden lg:block">
            <div className="relative group">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2d808e]" />
              <input type="text" placeholder="Quick search..." className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-transparent focus:border-[#2d808e] focus:bg-white rounded-lg outline-none text-[11px] transition-all" />
            </div>
          </div>

          <div className="flex items-center space-x-1.5 md:space-x-3">
             <button className="p-1.5 text-gray-400 hover:text-[#2d808e] transition-colors"><Bell size={16} /></button>
             
             <div className="flex space-x-1">
               <button onClick={() => setIsStockStatusModalOpen(true)} className="flex items-center p-1.5 md:px-2.5 md:py-1.5 bg-[#2d808e] text-white text-[9px] md:text-[10px] font-bold rounded shadow-sm hover:bg-[#256b78] transition-all">
                  <CheckCircle2 size={12} className="md:mr-1 shrink-0" /> 
                  <span className="hidden md:inline">Stock</span>
               </button>
               <button onClick={() => setIsMoveOrderModalOpen(true)} className="flex items-center p-1.5 md:px-2.5 md:py-1.5 bg-[#17a2b8] text-white text-[9px] md:text-[10px] font-bold rounded shadow-sm hover:bg-[#138496] transition-all">
                 <ArrowRightLeft size={12} className="md:mr-1 shrink-0" /> 
                 <span className="hidden md:inline">Move</span>
               </button>
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-3 md:p-6 bg-[#f1f3f4] pb-24">
          <div className="max-w-[1600px] mx-auto w-full">
            {activeTab === 'users' ? (
              <UserManagement />
            ) : activeTab === 'requisition' ? (
              <PurchaseRequisition requisitions={[]} setRequisitions={() => {}} />
            ) : activeTab === 'purchase-order' ? (
              <PurchaseOrder orders={[]} />
            ) : activeTab === 'supplier' ? (
              <Supplier />
            ) : activeTab === 'purchase-report' ? (
              <PurchaseReport />
            ) : activeTab === 'inventory' ? (
              <Inventory />
            ) : activeTab === 'receive' ? (
              <Receive />
            ) : activeTab === 'issue' ? (
              <Issue />
            ) : activeTab === 'tnx-report' ? (
              <TnxReport />
            ) : activeTab === 'mo-report' ? (
              <MOReport />
            ) : activeTab === 'item-list' ? (
              <ItemList />
            ) : activeTab === 'item-uom' ? (
              <ItemUOM />
            ) : activeTab === 'item-group' ? (
              <ItemGroup />
            ) : activeTab === 'item-type' ? (
              <ItemType />
            ) : activeTab === 'cost-center' ? (
              <CostCenter />
            ) : activeTab === 'overview' ? (
              <div className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-2 md:gap-4">
                  {[
                    { label: 'Today Order', value: '0' },
                    { label: 'Lastday Order', value: '338K' },
                    { label: 'Weekly Order', value: '1.2M' },
                    { label: 'Monthly Order', value: '5.7M' },
                    { label: 'Weekly PR', value: '94K' },
                    { label: 'Monthly PR', value: '578K' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-center transition-all hover:shadow-md">
                      <span className="text-[8px] md:text-[9px] text-gray-400 font-bold uppercase mb-1">{stat.label}</span>
                      <span className="text-sm md:text-xl font-bold text-red-500 tracking-tight">{stat.value}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-white p-8 md:p-24 rounded-lg shadow-sm border border-gray-100 text-center text-gray-400 flex flex-col items-center">
                  <Gauge size={40} className="mb-4 text-[#2d808e]/20" />
                  <h3 className="text-sm md:text-lg font-bold text-gray-800 mb-2">System Dashboard Overview</h3>
                  <p className="text-[10px] md:text-sm max-w-sm">Navigate through the left menu to manage Purchase Requisitions, Orders, Inventory, and view analytical reports.</p>
                </div>
              </div>
            ) : (
               <div className="flex flex-col items-center justify-center h-64 text-gray-300">
                  <FileText size={48} strokeWidth={1} />
                  <p className="mt-4 text-[11px] font-bold uppercase tracking-widest">{activeTab.replace('-', ' ')} module</p>
               </div>
            )}
          </div>
        </main>

        <footer className="h-12 md:h-16 border-t border-gray-200 flex flex-col md:flex-row items-center justify-center bg-white px-4 shrink-0 sticky bottom-0 z-10">
           <div className="flex flex-col md:flex-row items-center md:space-x-4 text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-center">
              <p className="text-gray-500">All rights Reserved © ALIGN 2026</p>
              <div className="hidden md:block w-1 h-1 bg-[#2d808e]/20 rounded-full"></div>
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
