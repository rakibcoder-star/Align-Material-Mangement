import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
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
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
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
  X,
  TrendingUp,
  AlertTriangle,
  Package,
  Activity,
  Plus,
  History
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
  onClick?: () => void;
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

const KPICard: React.FC<{ label: string; value: string; icon: React.ReactNode; trend?: string; trendUp?: boolean; color: string }> = ({ label, value, icon, trend, trendUp, color }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-2">
      <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
        {icon && React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 20 }) : icon}
      </div>
      {trend && (
        <span className={`text-[10px] font-bold flex items-center ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
          {trendUp ? <TrendingUp size={10} className="mr-0.5" /> : null}
          {trend}
        </span>
      )}
    </div>
    <div>
      <h3 className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{label}</h3>
      <p className="text-xl font-black text-gray-800 tracking-tight">{value}</p>
    </div>
  </div>
);

const DashboardOverview: React.FC = () => {
  const purchaseData = [
    { month: 'Jan', value: 450000 },
    { month: 'Feb', value: 380000 },
    { month: 'Mar', value: 520000 },
    { month: 'Apr', value: 480000 },
    { month: 'May', value: 610000 },
    { month: 'Jun', value: 750000 },
  ];

  const categoryData = [
    { name: 'Spare Parts', value: 400 },
    { name: 'Consumables', value: 300 },
    { name: 'Admin Supplies', value: 150 },
    { name: 'Tools', value: 100 },
  ];

  const flowData = [
    { day: '01', pr: 12, po: 8 },
    { day: '05', pr: 18, po: 14 },
    { day: '10', pr: 15, po: 15 },
    { day: '15', pr: 22, po: 18 },
    { day: '20', pr: 30, po: 25 },
    { day: '25', pr: 25, po: 22 },
    { day: '30', pr: 28, po: 26 },
  ];

  const PIE_COLORS = ['#2d808e', '#17a2b8', '#6c757d', '#dc3545'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Open Requisitions" value="42" icon={<ClipboardList />} trend="+12%" trendUp color="bg-blue-500" />
        <KPICard label="PO Value (MTD)" value="৳750,000" icon={<ShoppingBag />} trend="+8.5%" trendUp color="bg-emerald-500" />
        <KPICard label="Low Stock Alerts" value="15" icon={<AlertTriangle />} trend="-3" trendUp={false} color="bg-red-500" />
        <KPICard label="Active Suppliers" value="128" icon={<Truck />} color="bg-indigo-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-gray-700 flex items-center">
              <BarChart3 size={16} className="mr-2 text-[#2d808e]" />
              Monthly Procurement Spend (BDT)
            </h3>
            <select className="text-[10px] font-bold border rounded p-1 outline-none text-gray-400">
              <option>Last 6 Months</option>
              <option>Full Year</option>
            </select>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={purchaseData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600 }} tickFormatter={(val: number) => `${val/1000}k`} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Bar dataKey="value" fill="#2d808e" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-gray-700 mb-6 flex items-center">
            <Layers size={16} className="mr-2 text-[#2d808e]" />
            Item Composition
          </h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {categoryData.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-[10px]">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: PIE_COLORS[i] }}></div>
                  <span className="text-gray-500 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-gray-800">{item.value} units</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-gray-700 mb-6 flex items-center">
            <Activity size={16} className="mr-2 text-[#2d808e]" />
            PR vs. PO Fulfillment Trend
          </h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={flowData}>
                <defs>
                  <linearGradient id="colorPr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2d808e" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2d808e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Area type="monotone" dataKey="pr" stroke="#2d808e" fillOpacity={1} fill="url(#colorPr)" strokeWidth={3} />
                <Area type="monotone" dataKey="po" stroke="#17a2b8" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-6 mt-4">
            <div className="flex items-center text-[10px] font-bold text-gray-500">
              <div className="w-3 h-0.5 bg-[#2d808e] mr-2"></div>
              Requisitions Created
            </div>
            <div className="flex items-center text-[10px] font-bold text-gray-500">
              <div className="w-3 h-0.5 bg-[#17a2b8] border-dashed border-t mr-2"></div>
              Orders Fulfilled
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center">
            <History size={16} className="mr-2 text-[#2d808e]" />
            Recent Platform Activity
          </h3>
          <div className="flex-1 space-y-4 overflow-y-auto pr-2 scrollbar-thin">
            {[
              { user: 'Rakib H', action: 'Approved PO-400012', time: '12 mins ago', icon: <CheckCircle2 className="text-green-500" /> },
              { user: 'Azizul H', action: 'Received Stock for SKU-310', time: '45 mins ago', icon: <Package className="text-blue-500" /> },
              { user: 'Sohel Rana', action: 'Created PR-300055', time: '2 hours ago', icon: <Plus className="text-[#2d808e]" /> },
              { user: 'System', action: 'Low stock alert for A4 Paper', time: '5 hours ago', icon: <AlertTriangle className="text-red-500" /> },
              { user: 'Rakib H', action: 'New Supplier Added: NSR Ltd', time: '1 day ago', icon: <Truck className="text-indigo-500" /> },
            ].map((activity, i) => (
              <div key={i} className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border-l-4 border-transparent hover:border-[#2d808e]">
                <div className="mr-4 bg-white p-2 rounded-full shadow-sm border border-gray-50">
                  {activity.icon && React.isValidElement(activity.icon) ? React.cloneElement(activity.icon as React.ReactElement<any>, { size: 14 }) : null}
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-bold text-gray-800">{activity.action}</p>
                  <p className="text-[9px] text-gray-400 uppercase tracking-tighter">{activity.user} • {activity.time}</p>
                </div>
                <ChevronRight size={14} className="text-gray-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
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
  
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    purchase: location.pathname.includes('requisition') || location.pathname.includes('purchase-order') || location.pathname.includes('supplier') || location.pathname.includes('purchase-report'),
    warehouse: location.pathname.includes('inventory') || location.pathname.includes('receive') || location.pathname.includes('issue') || location.pathname.includes('tnx-report') || location.pathname.includes('mo-report'),
    itemMaster: location.pathname.includes('item-list') || location.pathname.includes('item-uom') || location.pathname.includes('item-group') || location.pathname.includes('item-type') || location.pathname.includes('cost-center')
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

        <div className="flex-1 py-1.5 overflow-y-auto overflow-x-hidden space-y-0.5 scrollbar-thin">
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
            <SidebarItem icon={<UserIcon />} label="Users" active={activeTab === 'users'} isCollapsed={isSidebarCollapsed && !isMobileMenuOpen} onClick={() => handleNav('/users')} />
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

        <main className="flex-1 overflow-y-auto p-3 md:p-6 bg-[#f1f3f4] pb-10">
          <div className="max-w-[1600px] mx-auto w-full">
            <Routes>
              <Route path="/overview" element={<DashboardOverview />} />
              <Route path="/users" element={hasPermission('manage_users') ? <UserManagement /> : <Navigate to="/overview" />} />
              <Route path="/requisition" element={<PurchaseRequisition />} />
              <Route path="/purchase-order" element={<PurchaseOrder orders={[]} />} />
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
    </div>
  );
};

export default Dashboard;