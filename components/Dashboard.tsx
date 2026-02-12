
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserManagement from './UserManagement';
import MoveOrderModal from './MoveOrderModal';
import StockStatusModal from './StockStatusModal';
import PRPreviewModal from './PRPreviewModal';
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
import { supabase } from '../lib/supabase';
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
  Menu,
  FileText,
  ArrowRight,
  ArrowLeft,
  Bell,
  Layers,
  Tag,
  Boxes,
  Home,
  ClipboardList,
  ShoppingBag,
  Truck,
  BarChart3,
  X,
  Plus,
  ShieldAlert
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
        className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-2 py-2 text-sm transition-all duration-200 ${
          active 
            ? 'text-[#2d808e] bg-[#d1e0e2] font-semibold border border-[#2d808e] rounded-lg' 
            : danger 
              ? 'text-red-500 hover:bg-red-50' 
              : 'text-gray-600 hover:bg-gray-50'
        } ${active ? 'mx-1 w-[calc(100%-8px)]' : ''}`}
      >
        <div className="flex items-center space-x-2">
          <div className={`${active ? 'text-[#2d808e]' : danger ? 'text-red-400' : 'text-gray-500'} shrink-0`}>
            {icon && React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 15 }) : icon}
          </div>
          {!isCollapsed && <span className="text-[11px] leading-tight tracking-tight whitespace-nowrap overflow-hidden">{label}</span>}
        </div>
        {!isCollapsed && hasSubmenu && (
          <div className="text-gray-400 shrink-0 ml-1">
            {isOpen ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
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
  onClick?: ()void;
}> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-2 pl-6 pr-1.5 py-1.5 text-[11px] transition-all duration-200 ${
      active 
        ? 'text-[#2d808e] bg-[#d1e0e2] font-semibold border border-[#2d808e] rounded-lg mx-1 w-[calc(100%-8px)]' 
        : 'text-gray-600 hover:bg-gray-50'
    }`}
  >
    <div className={`${active ? 'text-[#2d808e]' : 'text-gray-400'} shrink-0`}>
      {icon && React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 12 }) : icon}
    </div>
    <span className="truncate tracking-tight">{label}</span>
  </button>
);

const KPICard: React.FC<{ label: string; value: string; subValue?: string }> = ({ label, value, subValue }) => (
  <div className="bg-white p-4 rounded shadow-sm border border-gray-100 flex flex-col justify-center min-h-[90px] hover:shadow-md transition-all">
    <h3 className="text-[11px] text-gray-400 font-bold tracking-tight mb-1">{label}</h3>
    <div className="flex items-baseline space-x-1">
      <p className="text-xl font-black text-gray-700 tracking-tight">{value}</p>
      {subValue && <p className="text-[13px] font-bold text-gray-400">({subValue})</p>}
    </div>
  </div>
);

const DashboardOverview: React.FC<{ onCheckStock: () => void; onMoveOrder: () => void; onPreviewPr: (pr: any) => void }> = ({ onCheckStock, onMoveOrder, onPreviewPr }) => {
  const { user } = useAuth();
  const [dateTime, setDateTime] = useState(new Date());
  const [recentPrs, setRecentPrs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    const fetchDashboardData = async () => {
      const { data } = await supabase
        .from('requisitions')
        .select('*')
        .eq('status', 'Pending')
        .order('created_at', { ascending: false })
        .limit(10);
      if (data) setRecentPrs(data);
      setLoading(false);
    };
    fetchDashboardData();
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) + 
           ' ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
  };

  const displayName = user?.email?.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') || 'User';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#2d808e] tracking-tight uppercase">Hi, {displayName}!</h1>
          <p className="text-[11px] font-bold text-gray-400 mt-0.5">{formatDate(dateTime)}</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center px-4 py-2 bg-[#2d808e] text-white text-[11px] font-bold rounded shadow-sm hover:bg-[#256b78] transition-all">
             <Menu size={14} className="mr-2" /> Code Print
          </button>
          <button onClick={onCheckStock} className="flex items-center px-4 py-2 bg-[#2d808e] text-white text-[11px] font-bold rounded shadow-sm hover:bg-[#256b78] transition-all">
             <LayoutGrid size={14} className="mr-2" /> Check Stock
          </button>
          <button onClick={onMoveOrder} className="flex items-center px-4 py-2 bg-[#2d808e] text-white text-[11px] font-bold rounded shadow-sm hover:bg-[#256b78] transition-all">
             <Plus size={14} className="mr-2" /> Move Order
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <KPICard label="Today Order(Qty)" value="0" subValue="0" />
        <KPICard label="Lastday Order(Qty)" value="20.9K" subValue="126" />
        <KPICard label="Weekly Order(Qty)" value="63.5K" subValue="502" />
        <KPICard label="Monthly Order(Qty)" value="296.2K" subValue="577" />
        <KPICard label="Weekly PR(Qty)" value="32.1K" subValue="539" />
        <KPICard label="Monthly PR(Qty)" value="32.1K" subValue="539" />
      </div>

      {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
        <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden flex flex-col w-full max-w-md">
          <div className="px-5 py-4 border-b border-gray-100 bg-[#fafbfc]">
            <h3 className="text-sm font-black text-[#2d808e] uppercase tracking-tighter">PR Approval Queue</h3>
          </div>
          <div className="overflow-y-auto max-h-[400px] scrollbar-thin">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr className="text-[10px] font-bold text-gray-500 uppercase">
                  <th className="px-5 py-3 text-center">Date</th>
                  <th className="px-5 py-3 text-center">Ref.No (PR)</th>
                  <th className="px-5 py-3 text-right">Value</th>
                </tr>
              </thead>
              <tbody className="text-[11px] font-medium">
                {loading ? (
                  <tr><td colSpan={3} className="py-10 text-center text-gray-400">Syncing...</td></tr>
                ) : recentPrs.length > 0 ? (
                  recentPrs.map((pr) => (
                    <tr key={pr.id} className="border-b border-gray-50 hover:bg-cyan-50/10 transition-colors">
                      <td className="px-5 py-3 text-center whitespace-nowrap text-gray-500">
                        {new Date(pr.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <button 
                          onClick={() => onPreviewPr(pr)}
                          className="text-[#2d808e] font-black hover:underline transition-all"
                        >
                          {pr.pr_no}
                        </button>
                      </td>
                      <td className="px-5 py-3 text-right font-black text-gray-800">
                        {pr.total_value ? Number(pr.total_value).toLocaleString() : '0'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={3} className="py-10 text-center text-gray-400 uppercase font-bold tracking-widest text-[9px]">No pending approvals</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname.substring(1) || 'overview';

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoveOrderModalOpen, setIsMoveOrderModalOpen] = useState(false);
  const [isStockStatusModalOpen, setIsStockStatusModalOpen] = useState(false);
  const [previewPr, setPreviewPr] = useState<any>(null);
  
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    purchase: location.pathname.includes('requisition') || location.pathname.includes('purchase-order') || location.pathname.includes('supplier') || location.pathname.includes('purchase-report'),
    warehouse: location.pathname.includes('inventory') || location.pathname.includes('receive') || location.pathname.includes('issue') || location.pathname.includes('tnx-report') || location.pathname.includes('mo-report'),
    itemMaster: location.pathname.includes('item-list') || location.pathname.includes('item-uom') || location.pathname.includes('item-group') || location.pathname.includes('item-type') || location.pathname.includes('cost-center'),
    admin: location.pathname.includes('users')
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

  const handleNav = (path: string) => {
    navigate(path);
    if (window.innerWidth < 768) {
      setIsMobileMenuOpen(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-[#f1f3f4] overflow-hidden font-['Inter'] no-print">
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 transform md:relative md:translate-x-0 transition-all duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0 w-[190px]' : '-translate-x-full md:translate-x-0'}
        ${isSidebarCollapsed && !isMobileMenuOpen ? 'md:w-16' : 'md:w-40'}
        bg-white border-r border-gray-200 flex flex-col h-full shadow-sm shrink-0
      `}>
        <div className="flex justify-between items-center p-3 md:hidden border-b border-gray-100 mb-2">
          <button onClick={() => handleNav('/overview')} className="text-lg font-black text-[#2d808e] tracking-tighter">ALIGN</button>
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600 focus:outline-none">
            <X size={18} />
          </button>
        </div>

        <div className={`pt-4 pb-3 px-2 flex flex-col items-center space-y-2 ${isSidebarCollapsed && !isMobileMenuOpen ? 'md:px-0' : ''}`}>
          <div className={`${isSidebarCollapsed && !isMobileMenuOpen ? 'w-9 h-9' : 'w-12 h-12'} rounded-full bg-[#e2eff1] flex items-center justify-center transition-all duration-300 shadow-inner shrink-0`}>
            <UserIcon size={isSidebarCollapsed && !isMobileMenuOpen ? 16 : 24} className="text-[#2d808e]" strokeWidth={1.5} />
          </div>
          {(!isSidebarCollapsed || isMobileMenuOpen) && (
            <div className="text-center overflow-hidden w-full px-1">
              <span className="text-[10px] font-bold text-[#2d808e] block truncate uppercase tracking-tight">{user.email.split('@')[0]}</span>
              <span className="text-[7px] text-gray-400 font-bold uppercase tracking-widest">{user.role}</span>
            </div>
          )}
        </div>

        <div className="flex-1 py-1.5 overflow-y-auto overflow-x-hidden space-y-0.5 scrollbar-thin text-center">
          <SidebarItem icon={<Gauge />} label="Dashboard" active={activeTab === 'overview'} isCollapsed={isSidebarCollapsed && !isMobileMenuOpen} onClick={() => handleNav('/overview')} />

          <SidebarItem icon={<ShoppingCart />} label="Purchase" hasSubmenu isCollapsed={isSidebarCollapsed && !isMobileMenuOpen} isOpen={openMenus.purchase} onClick={() => toggleMenu('purchase')}>
            <div className="space-y-0.5">
              <SubmenuItem icon={<ClipboardList />} label="Requisition" active={activeTab === 'requisition'} onClick={() => handleNav('/requisition')} />
              <SubmenuItem icon={<ShoppingBag />} label="Order" active={activeTab === 'purchase-order'} onClick={() => handleNav('/purchase-order')} />
              <SubmenuItem icon={<Truck />} label="Supplier" active={activeTab === 'supplier'} onClick={() => handleNav('/supplier')} />
              <SubmenuItem icon={<BarChart3 />} label="Report" active={activeTab === 'purchase-report'} onClick={() => handleNav('/purchase-report')} />
            </div>
          </SidebarItem>

          <SidebarItem icon={<Warehouse />} label="Warehouse" hasSubmenu isCollapsed={isSidebarCollapsed && !isMobileMenuOpen} isOpen={openMenus.warehouse} onClick={() => toggleMenu('warehouse')}>
            <div className="space-y-0.5">
              <SubmenuItem icon={<LayoutGrid />} label="Inventory" active={activeTab === 'inventory'} onClick={() => handleNav('/inventory')} />
              <SubmenuItem icon={<ArrowRight />} label="Receive" active={activeTab === 'receive'} onClick={() => handleNav('/receive')} />
              <SubmenuItem icon={<ArrowLeft />} label="Issue" active={activeTab === 'issue'} onClick={() => handleNav('/issue')} />
              <SubmenuItem icon={<FileText />} label="Tnx-Report" active={activeTab === 'tnx-report'} onClick={() => handleNav('/tnx-report')} />
              <SubmenuItem icon={<FileText />} label="MO-Report" active={activeTab === 'mo-report'} onClick={() => handleNav('/mo-report')} />
            </div>
          </SidebarItem>

          <SidebarItem icon={<LayoutGrid />} label="Item Master" hasSubmenu isCollapsed={isSidebarCollapsed && !isMobileMenuOpen} isOpen={openMenus.itemMaster} onClick={() => toggleMenu('itemMaster')}>
            <div className="space-y-0.5">
              <SubmenuItem icon={<FileText />} label="Item List" active={activeTab === 'item-list'} onClick={() => handleNav('/item-list')} />
              <SubmenuItem icon={<Boxes />} label="Item UOM" active={activeTab === 'item-uom'} onClick={() => handleNav('/item-uom')} />
              <SubmenuItem icon={<Layers />} label="Item Group" active={activeTab === 'item-group'} onClick={() => handleNav('/item-group')} />
              <SubmenuItem icon={<Tag />} label="Item Type" active={activeTab === 'item-type'} onClick={() => handleNav('/item-type')} />
              <SubmenuItem icon={<Home />} label="Cost Center" active={activeTab === 'cost-center'} onClick={() => handleNav('/cost-center')} />
            </div>
          </SidebarItem>

          {hasPermission('manage_users') && (
            <SidebarItem icon={<ShieldAlert />} label="Admin" hasSubmenu isCollapsed={isSidebarCollapsed && !isMobileMenuOpen} isOpen={openMenus.admin} onClick={() => toggleMenu('admin')}>
              <div className="space-y-0.5">
                <SubmenuItem icon={<UserIcon />} label="Users" active={activeTab === 'users'} onClick={() => handleNav('/users')} />
              </div>
            </SidebarItem>
          )}
        </div>

        <div className="border-t border-gray-100 py-1.5">
          <SidebarItem icon={<LogOut />} label="Logout" danger isCollapsed={isSidebarCollapsed && !isMobileMenuOpen} onClick={logout} />
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-14 md:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-3 md:px-6 z-30 shrink-0">
          <div className="flex items-center space-x-1.5 md:space-x-4">
            <button onClick={() => window.innerWidth < 768 ? setIsMobileMenuOpen(true) : setIsSidebarCollapsed(!isSidebarCollapsed)} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-[#2d808e] focus:outline-none">
              <Menu size={18} />
            </button>
            <button onClick={() => handleNav('/overview')} className="text-lg md:text-2xl font-black text-gray-800 tracking-tighter hover:text-[#2d808e] transition-colors">ALIGN</button>
          </div>
          
          <div className="flex-1 max-w-xs px-2 hidden lg:block">
            <div className="relative group">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2d808e]" />
              <input type="text" placeholder="Quick search..." className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-transparent focus:border-[#2d808e] focus:bg-white rounded-lg outline-none text-[11px] transition-all" />
            </div>
          </div>

          <div className="flex items-center space-x-1.5 md:space-x-3">
             <button className="p-1.5 text-gray-400 hover:text-[#2d808e] transition-colors"><Bell size={16} /></button>
             <div className="w-8 h-8 rounded-full bg-[#e2eff1] flex items-center justify-center border border-gray-100">
               <UserIcon size={16} className="text-[#2d808e]" />
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-3 md:p-6 bg-[#f1f3f4] pb-10">
          <div className="max-w-[1600px] mx-auto w-full">
            <Routes>
              <Route path="/overview" element={<DashboardOverview onCheckStock={() => setIsStockStatusModalOpen(true)} onMoveOrder={() => setIsMoveOrderModalOpen(true)} onPreviewPr={(pr) => setPreviewPr(pr)} />} />
              <Route path="/users" element={hasPermission('manage_users') ? <UserManagement /> : <Navigate to="/overview" />} />
              <Route path="/requisition" element={<PurchaseRequisition />} />
              {/* Fix: Property 'orders' does not exist on PurchaseOrder */}
              <Route path="/purchase-order" element={<PurchaseOrder />} />
              <Route path="/supplier" element={<Supplier />} />
              <Route path="/purchase-report" element={<PurchaseReport />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/receive" element={<Receive />} />
              <Route path="/issue" element={<Issue />} />
              <Route path="/tnx-report" element={<TnxReport />} />
              <Route path="/mo-report" element={<MOReport />} />
              <Route path="/item-list" element={<ItemList />} />
              <Route path="/item-uom" element={<ItemUOM />} />
              <Route path="/item-group" element={<ItemGroup />} />
              <Route path="/item-type" element={<ItemType />} />
              <Route path="/cost-center" element={<CostCenter />} />
              <Route path="/" element={<Navigate to="/overview" replace />} />
            </Routes>
          </div>
        </main>

        <footer className="h-12 md:h-16 border-t border-gray-200 flex flex-col md:flex-row items-center justify-center bg-white px-4 shrink-0 sticky bottom-0 z-10">
           <div className="flex flex-col md:flex-row items-center md:space-x-4 text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-center">
              <p className="text-gray-500">All rights Reserved © ALIGN 2026</p>
              <div className="hidden md:block w-1 h-1 bg-[#2d808e]/20 rounded-full"></div>
              <p className="text-gray-400">Developed by <a href="https://github.com/rakibcoder-star" target="_blank" rel="noopener noreferrer" className="text-[#2d808e] font-black hover:underline transition-all">RAKIB H SHUVO</a></p>
           </div>
        </footer>
      </div>

      <MoveOrderModal isOpen={isMoveOrderModalOpen} onClose={() => setIsMoveOrderModalOpen(false)} />
      <StockStatusModal isOpen={isStockStatusModalOpen} onClose={() => setIsStockStatusModalOpen(false)} />
      {previewPr && <PRPreviewModal pr={previewPr} onClose={() => setPreviewPr(null)} />}
    </div>
  );
};

export default Dashboard;
