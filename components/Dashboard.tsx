
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserManagement from './UserManagement';
import MoveOrderModal from './MoveOrderModal';
import StockStatusModal from './StockStatusModal';
import PRPreviewModal from './PRPreviewModal';
import POPreviewModal from './POPreviewModal';
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
import LabelManagement from './LabelManagement';
import { supabase } from '../lib/supabase';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Gauge, 
  ShoppingCart, 
  Warehouse, 
  LayoutGrid, 
  ChevronDown, 
  ChevronRight, 
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
  ShieldAlert,
  Printer,
  PackageSearch,
  MoveHorizontal,
  LogOut as LogOutIcon,
  Mail,
  Phone,
  Briefcase,
  IdCard
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
    <div className="w-full px-2">
      <button
        onClick={onClick}
        title={isCollapsed ? label : ''}
        className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 py-1.5 text-xs transition-all duration-200 rounded border ${
          active 
            ? 'text-[#2d808e] bg-[#eef6f7] font-bold border-[#2d808e]' 
            : danger 
              ? 'text-red-500 hover:bg-red-50 border-transparent' 
              : 'text-gray-600 hover:bg-gray-50 border-transparent'
        }`}
      >
        <div className="flex items-center space-x-2">
          <div className={`${active ? 'text-[#2d808e]' : danger ? 'text-red-400' : 'text-gray-500'} shrink-0`}>
            {icon && React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 14 }) : icon}
          </div>
          {!isCollapsed && <span className="text-[11px] font-bold leading-tight tracking-tight whitespace-nowrap overflow-hidden text-left">{label}</span>}
        </div>
        {!isCollapsed && hasSubmenu && (
          <div className="text-gray-400 shrink-0 ml-1">
            {isOpen ? <ChevronDown size={8} /> : <ChevronRight size={8} />}
          </div>
        )}
      </button>
      {!isCollapsed && isOpen && children && <div className="py-0.5 space-y-0.5">{children}</div>}
    </div>
  );
};

const SubmenuItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}> = ({ icon, label, active, onClick }) => (
  <div className="px-2">
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-2 pl-6 pr-2 py-1 text-[10px] transition-all duration-200 rounded border ${
        active 
          ? 'text-[#2d808e] font-bold bg-[#eef6f7] border-[#2d808e]' 
          : 'text-gray-500 hover:text-[#2d808e] hover:bg-gray-50 border-transparent'
      }`}
    >
      <div className={`${active ? 'text-[#2d808e]' : 'text-gray-400'} shrink-0`}>
        {icon && React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 12 }) : icon}
      </div>
      <span className="truncate font-bold tracking-tight">{label}</span>
    </button>
  </div>
);

const KPICard: React.FC<{ label: string; value: string; subValue?: string }> = ({ label, value, subValue }) => (
  <div className="bg-white p-3 rounded border border-gray-100 flex flex-col justify-start min-h-[80px] hover:shadow transition-all group">
    <h3 className="text-[10px] text-gray-400 font-bold tracking-tight mb-1 uppercase">{label}</h3>
    <div className="flex items-baseline space-x-1.5">
      <p className="text-2xl font-black text-gray-700 tracking-tight group-hover:text-[#2d808e] transition-colors">{value}</p>
      {subValue && <p className="text-[14px] font-bold text-gray-300">({subValue})</p>}
    </div>
  </div>
);

const LiquidGauge: React.FC<{ label: string; value: number; subLabel: string; color?: string }> = ({ label, value, subLabel, color = "#3b82f6" }) => (
  <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col items-center">
    <h3 className="text-[9px] font-black text-[#2d808e] uppercase tracking-widest mb-3">{label} ({subLabel})</h3>
    <div className="relative w-28 h-28 rounded-full border-2 border-[#3b82f6] p-1 overflow-hidden flex items-center justify-center">
      <div 
        className="absolute bottom-0 left-0 w-[200%] h-[120%] transition-all duration-1000 ease-in-out"
        style={{ transform: `translateY(${100 - value}%)`, left: '-50%' }}
      >
        <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="w-full h-12 opacity-80 animate-wave">
          <path d="M0.00,49.98 C150.00,150.00 349.20,-50.00 500.00,49.98 L500.00,150.00 L0.00,150.00 Z" style={{ fill: color }}></path>
        </svg>
        <div className="w-full h-full" style={{ background: color }}></div>
      </div>
      <span className="relative z-10 text-xl font-black text-gray-800 drop-shadow-sm">{value} %</span>
    </div>
  </div>
);

const DashboardOverview: React.FC<{ onCheckStock: () => void; onMoveOrder: () => void; onPreviewPr: (pr: any) => void; onPreviewPo: (po: any) => void }> = ({ onCheckStock, onMoveOrder, onPreviewPr, onPreviewPo }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dateTime, setDateTime] = useState(new Date());
  
  const [pendingPrs, setPendingPrs] = useState<any[]>([]);
  const [pendingPos, setPendingPos] = useState<any[]>([]);
  const [pendingMos, setPendingMos] = useState<any[]>([]);
  
  const [latestPRs, setLatestPRs] = useState<any[]>([]);
  const [latestMOs, setLatestMOs] = useState<any[]>([]);
  
  const [stockTypes, setStockTypes] = useState<any[]>([]);
  const [dieselStock, setDieselStock] = useState(41);
  const [octaneStock, setOctaneStock] = useState(57);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    todayOrderQty: '0', todayOrderCount: '0',
    lastDayOrderQty: '0', lastDayOrderCount: '0',
    weeklyOrderQty: '0', weeklyOrderCount: '0',
    monthlyOrderQty: '0', monthlyOrderCount: '0',
    weeklyPrQty: '0', weeklyPrCount: '0',
    monthlyPrQty: '0', monthlyPrCount: '0'
  });

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    const fetchDashboardData = async () => {
      setLoading(true);
      const { data: prApprovals } = await supabase.from('requisitions').select('*').eq('status', 'Pending').order('created_at', { ascending: false }).limit(5);
      if (prApprovals) setPendingPrs(prApprovals);
      const { data: poApprovals } = await supabase.from('purchase_orders').select('*').eq('status', 'Pending').order('created_at', { ascending: false }).limit(5);
      if (poApprovals) setPendingPos(poApprovals);
      const { data: moApprovals } = await supabase.from('move_orders').select('*').eq('status', 'Pending').order('created_at', { ascending: false }).limit(5);
      if (moApprovals) setPendingMos(moApprovals);
      const { data: prLogs } = await supabase.from('requisitions').select('*').order('created_at', { ascending: false }).limit(10);
      if (prLogs) setLatestPRs(prLogs);
      const { data: items } = await supabase.from('items').select('*');
      if (items) {
        const types: Record<string, number> = {};
        items.forEach(item => {
          const type = item.type || 'Other';
          types[type] = (types[type] || 0) + 1;
        });
        setStockTypes(Object.entries(types).map(([name, value]) => ({ name, value })));
        const dieselItem = items.find(i => i.sku === '4492');
        const octaneItem = items.find(i => i.sku === '3121');
        if (dieselItem) setDieselStock(Math.min(100, Math.round((dieselItem.on_hand_stock / 10000) * 100)));
        if (octaneItem) setOctaneStock(Math.min(100, Math.round((octaneItem.on_hand_stock / 10000) * 100)));
      }
      setWeeklyData([
        { name: '08-Sun', qty: 0, value: 0 },
        { name: '09-Mon', qty: 126, value: 20914 },
        { name: '10-Tue', qty: 0, value: 0 },
        { name: '11-Wed', qty: 0, value: 0 },
        { name: '12-Thu', qty: 0, value: 0 },
        { name: '13-Fri', qty: 0, value: 0 },
        { name: '14-Sat', qty: 0, value: 0 },
      ]);
      setMonthlyData([
        { name: 'JAN', value: 5700000 },
        { name: 'FEB', value: 300000 },
        { name: 'MAR', value: 10000 },
        { name: 'APR', value: 0 }, { name: 'MAY', value: 0 }, { name: 'JUN', value: 0 }, { name: 'JUL', value: 0 }, { name: 'AUG', value: 0 }, { name: 'SEP', value: 0 }, { name: 'OCT', value: 0 }, { name: 'NOV', value: 0 }, { name: 'DEC', value: 0 },
      ]);
      setLatestMOs([
        { sl: 1, date: '09-Feb-26', tnx: '10404', name: 'GROOVE WHEEL-V, 2 INCH (SS)', qty: 4, value: 4200 }
      ]);
      const today = new Date(); today.setHours(0,0,0,0);
      const { data: allPo } = await supabase.from('purchase_orders').select('items, created_at');
      const { data: allPr } = await supabase.from('requisitions').select('items, created_at');
      const sumQty = (list: any[], dateLimit: Date) => {
        let qty = 0; let count = 0;
        list?.filter(entry => new Date(entry.created_at) >= dateLimit).forEach(entry => {
          count++;
          (entry.items || []).forEach((item: any) => qty += Number(item.poQty || item.reqQty || 0));
        });
        return { qty: qty > 1000 ? (qty/1000).toFixed(1) + 'K' : qty.toString(), count: count.toString() };
      };
      const lastWeek = new Date(today); lastWeek.setDate(today.getDate() - 7);
      const lastMonth = new Date(today); lastMonth.setMonth(today.getMonth() - 1);
      setStats({
        todayOrderQty: sumQty(allPo || [], today).qty, todayOrderCount: sumQty(allPo || [], today).count,
        lastDayOrderQty: sumQty(allPo || [], new Date(today.getTime() - 86400000)).qty, lastDayOrderCount: sumQty(allPo || [], new Date(today.getTime() - 86400000)).count,
        weeklyOrderQty: sumQty(allPo || [], lastWeek).qty, weeklyOrderCount: sumQty(allPo || [], lastWeek).count,
        monthlyOrderQty: sumQty(allPo || [], lastMonth).qty, monthlyOrderCount: sumQty(allPo || [], lastMonth).count,
        weeklyPrQty: sumQty(allPr || [], lastWeek).qty, weeklyPrCount: sumQty(allPr || [], lastWeek).count,
        monthlyPrQty: sumQty(allPr || [], lastMonth).qty, monthlyPrCount: sumQty(allPr || [], lastMonth).count
      });
      setLoading(false);
    };
    fetchDashboardData();
    return () => clearInterval(timer);
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ff7300', '#2d808e', '#1e293b'];

  return (
    <div className="space-y-6 animate-slide-up pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div className="flex flex-col">
          <h1 className="text-xl font-black text-[#2d808e] tracking-tight uppercase leading-none italic">
            {user?.fullName ? `${user.fullName}'S DASHBOARD` : 'DASHBOARD ANALYTICS'}
          </h1>
          <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{dateTime.toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true })}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => navigate('/label')} className="px-4 py-2 bg-[#2d808e] text-white text-[10px] font-black rounded shadow-sm hover:bg-[#256b78] uppercase tracking-wider transition-all flex items-center gap-1.5">
            <Printer size={14} />
            <span>Code Print</span>
          </button>
          <button onClick={onCheckStock} className="px-4 py-2 bg-[#2d808e] text-white text-[10px] font-black rounded shadow-sm hover:bg-[#256b78] uppercase tracking-wider transition-all flex items-center gap-1.5">
            <PackageSearch size={14} />
            <span>Check Stock</span>
          </button>
          <button onClick={onMoveOrder} className="px-4 py-2 bg-[#2d808e] text-white text-[10px] font-black rounded shadow-sm hover:bg-[#256b78] uppercase tracking-wider transition-all flex items-center gap-1.5">
            <MoveHorizontal size={14} />
            <span>Move Order</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPICard label="Today Order(Qty)" value={stats.todayOrderQty} subValue={stats.todayOrderCount} />
        <KPICard label="Lastday Order(Qty)" value={stats.lastDayOrderQty} subValue={stats.lastDayOrderCount} />
        <KPICard label="Weekly Order(Qty)" value={stats.weeklyOrderQty} subValue={stats.weeklyOrderCount} />
        <KPICard label="Monthly Order(Qty)" value={stats.monthlyOrderQty} subValue={stats.monthlyOrderCount} />
        <KPICard label="Weekly PR(Qty)" value={stats.weeklyPrQty} subValue={stats.weeklyPrCount} />
        <KPICard label="Monthly PR(Qty)" value={stats.monthlyPrQty} subValue={stats.monthlyPrCount} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded border border-gray-100">
          <h3 className="text-[11px] font-black text-[#2d808e] uppercase tracking-tighter mb-4">Weekly Move Order</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar yAxisId="left" dataKey="qty" fill="#1e293b" radius={[2, 2, 0, 0]} barSize={24} />
                <Line yAxisId="right" type="monotone" dataKey="value" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316', r: 3 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-4 rounded border border-gray-100">
          <h3 className="text-[11px] font-black text-[#2d808e] uppercase tracking-tighter mb-4">Monthly Move Order</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ fontSize: '10px' }} />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <LiquidGauge label="DIESEL" value={dieselStock} subLabel="4492" color="#3b82f6" />
        <LiquidGauge label="OCTANE" value={octaneStock} subLabel="3121" color="#0ea5e9" />
        <div className="bg-white p-4 rounded border border-gray-100 flex flex-col items-center">
          <h3 className="text-[9px] font-black text-[#2d808e] uppercase tracking-widest mb-1">Stock Types</h3>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stockTypes} innerRadius={35} outerRadius={50} paddingAngle={4} dataKey="value">
                  {stockTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded border border-gray-100 overflow-hidden flex flex-col">
          <div className="px-4 py-2 border-b border-gray-100 bg-[#fafbfc]">
             <h3 className="text-[11px] font-black text-[#2d808e] uppercase tracking-tighter">PR Approval</h3>
          </div>
          <div className="overflow-y-auto max-h-[200px]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/50 sticky top-0">
                <tr className="text-[9px] font-bold text-gray-400 uppercase border-b border-gray-50">
                  <th className="px-4 py-2 text-center">Date</th>
                  <th className="px-4 py-2 text-center">Ref.No</th>
                  <th className="px-4 py-2 text-right">Value</th>
                </tr>
              </thead>
              <tbody className="text-[10px] font-medium text-gray-600">
                {pendingPrs.map((pr) => (
                  <tr key={pr.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                    <td className="px-4 py-2 text-center">{new Date(pr.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                    <td className="px-4 py-2 text-center">
                      <button onClick={() => onPreviewPr(pr)} className="text-blue-500 font-bold border border-blue-100 rounded px-2 py-0.5 hover:bg-blue-50 transition-all">{pr.pr_no}</button>
                    </td>
                    <td className="px-4 py-2 text-right font-black">{(pr.total_value || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded border border-gray-100 overflow-hidden flex flex-col">
          <div className="px-4 py-2 border-b border-gray-100 bg-[#fafbfc]">
             <h3 className="text-[11px] font-black text-[#2d808e] uppercase tracking-tighter">PO Approval</h3>
          </div>
          <div className="overflow-y-auto max-h-[200px]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/50 sticky top-0">
                <tr className="text-[9px] font-bold text-gray-400 uppercase border-b border-gray-50">
                  <th className="px-4 py-2 text-center">Date</th>
                  <th className="px-4 py-2 text-center">Ref.No</th>
                  <th className="px-4 py-2 text-right">Value</th>
                </tr>
              </thead>
              <tbody className="text-[10px] font-medium text-gray-600">
                {pendingPos.map((po) => (
                  <tr key={po.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                    <td className="px-4 py-2 text-center">{new Date(po.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                    <td className="px-4 py-2 text-center">
                      <button onClick={() => onPreviewPo(po)} className="text-blue-500 font-bold border border-blue-100 rounded px-2 py-0.5 hover:bg-blue-50 transition-all">{po.po_no}</button>
                    </td>
                    <td className="px-4 py-2 text-right font-black">{(po.total_value || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded border border-gray-100 overflow-hidden flex flex-col">
          <div className="px-4 py-2 border-b border-gray-100 bg-[#fafbfc]">
             <h3 className="text-[11px] font-black text-[#2d808e] uppercase tracking-tighter">MO Approval</h3>
          </div>
          <div className="overflow-y-auto max-h-[200px]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/50 sticky top-0">
                <tr className="text-[9px] font-bold text-gray-400 uppercase border-b border-gray-50">
                  <th className="px-4 py-2 text-center">Date</th>
                  <th className="px-4 py-2 text-center">Ref.No</th>
                  <th className="px-4 py-2 text-right">Value</th>
                </tr>
              </thead>
              <tbody className="text-[10px] font-medium text-gray-600">
                {pendingMos.map((mo) => (
                  <tr key={mo.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                    <td className="px-4 py-2 text-center whitespace-nowrap">{new Date(mo.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                    <td className="px-4 py-2 text-center">
                      <button className="text-blue-500 font-bold border border-blue-50 rounded px-2 py-0.5 hover:bg-blue-50 transition-all">{mo.mo_no}</button>
                    </td>
                    <td className="px-4 py-2 text-right font-black">{(mo.total_value || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname.substring(1) || 'overview';

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoveOrderModalOpen, setIsMoveOrderModalOpen] = useState(false);
  const [isStockStatusModalOpen, setIsStockStatusModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [previewPr, setPreviewPr] = useState<any>(null);
  const [previewPo, setPreviewPo] = useState<any>(null);
  
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

  return (
    <div className="flex h-screen bg-[#f8fafb] overflow-hidden font-sans no-print" style={{ fontFamily: 'var(--ant-font-family)' }}>
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 transform md:relative md:translate-x-0 transition-all duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0 w-[180px]' : '-translate-x-full md:translate-x-0'}
        ${isSidebarCollapsed && !isMobileMenuOpen ? 'md:w-12' : 'md:w-[180px]'}
        bg-white border-r border-gray-100 flex flex-col h-full shadow-sm shrink-0
      `}>
        <div className="flex justify-end items-center p-4 border-b border-gray-50 shrink-0 h-14">
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-1 text-gray-400 hover:text-gray-600 focus:outline-none">
            <X size={16} />
          </button>
        </div>

        <div className={`pt-4 pb-3 px-3 flex flex-col items-center space-y-3 shrink-0 ${isSidebarCollapsed && !isMobileMenuOpen ? 'md:px-1' : ''}`}>
          <div className={`${isSidebarCollapsed && !isMobileMenuOpen ? 'w-8 h-8' : 'w-14 h-14'} rounded-full bg-[#eef6f7] flex items-center justify-center transition-all duration-500 shadow-inner border border-white ring-2 ring-[#eef6f7]/50`}>
            <UserIcon size={isSidebarCollapsed && !isMobileMenuOpen ? 16 : 24} className="text-[#2d808e]" strokeWidth={1} />
          </div>
          {(!isSidebarCollapsed || isMobileMenuOpen) && (
            <div className="text-center overflow-hidden w-full space-y-0.5">
              <span className="text-[11px] font-black text-gray-800 block truncate uppercase tracking-tight">
                {user?.fullName || 'SYSTEM ADMIN'}
              </span>
              <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider block">
                {user?.role || 'ADMINISTRATOR'}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 py-2 overflow-y-auto overflow-x-hidden space-y-1 scrollbar-thin">
          <SidebarItem icon={<Gauge />} label="Dashboard" active={activeTab === 'overview'} isCollapsed={isSidebarCollapsed && !isMobileMenuOpen} onClick={() => handleNav('/overview')} />

          <SidebarItem icon={<ShoppingCart />} label="Purchase" hasSubmenu isCollapsed={isSidebarCollapsed && !isMobileMenuOpen} isOpen={openMenus.purchase} onClick={() => toggleMenu('purchase')}>
            <SubmenuItem icon={<ClipboardList />} label="Requisition" active={activeTab === 'requisition'} onClick={() => handleNav('/requisition')} />
            <SubmenuItem icon={<ShoppingBag />} label="Order" active={activeTab === 'purchase-order'} onClick={() => handleNav('/purchase-order')} />
            <SubmenuItem icon={<Truck />} label="Supplier" active={activeTab === 'supplier'} onClick={() => handleNav('/supplier')} />
            <SubmenuItem icon={<BarChart3 />} label="Report" active={activeTab === 'purchase-report'} onClick={() => handleNav('/purchase-report')} />
          </SidebarItem>

          <SidebarItem icon={<Warehouse />} label="Warehouse" hasSubmenu isCollapsed={isSidebarCollapsed && !isMobileMenuOpen} isOpen={openMenus.warehouse} onClick={() => toggleMenu('warehouse')}>
            <SubmenuItem icon={<LayoutGrid />} label="Inventory" active={activeTab === 'inventory'} onClick={() => handleNav('/inventory')} />
            <SubmenuItem icon={<ArrowRight />} label="Receive" active={activeTab === 'receive'} onClick={() => handleNav('/receive')} />
            <SubmenuItem icon={<ArrowLeft />} label="Issue" active={activeTab === 'issue'} onClick={() => handleNav('/issue')} />
            <SubmenuItem icon={<FileText />} label="Tnx-Report" active={activeTab === 'tnx-report'} onClick={() => handleNav('/tnx-report')} />
            <SubmenuItem icon={<FileText />} label="MO-Report" active={activeTab === 'mo-report'} onClick={() => handleNav('/mo-report')} />
          </SidebarItem>

          <SidebarItem icon={<LayoutGrid />} label="Item Master" hasSubmenu isCollapsed={isSidebarCollapsed && !isMobileMenuOpen} isOpen={openMenus.itemMaster} onClick={() => toggleMenu('itemMaster')}>
            <SubmenuItem icon={<FileText />} label="Item List" active={activeTab === 'item-list'} onClick={() => handleNav('/item-list')} />
            <SubmenuItem icon={<Boxes />} label="Item UOM" active={activeTab === 'item-uom'} onClick={() => handleNav('/item-uom')} />
            <SubmenuItem icon={<Layers />} label="Item Group" active={activeTab === 'item-group'} onClick={() => handleNav('/item-group')} />
            <SubmenuItem icon={<Tag />} label="Item Type" active={activeTab === 'item-type'} onClick={() => handleNav('/item-type')} />
            <SubmenuItem icon={<Home />} label="Cost Center" active={activeTab === 'cost-center'} onClick={() => handleNav('/cost-center')} />
          </SidebarItem>

          <SidebarItem icon={<ShieldAlert />} label="Admin" hasSubmenu isCollapsed={isSidebarCollapsed && !isMobileMenuOpen} isOpen={openMenus.admin} onClick={() => toggleMenu('admin')}>
            <SubmenuItem icon={<UserIcon />} label="Users" active={activeTab === 'users'} onClick={() => handleNav('/users')} />
          </SidebarItem>
        </div>

        <div className="p-2 border-t border-gray-50 shrink-0">
          <button 
            onClick={logout}
            className={`w-full flex items-center ${isSidebarCollapsed && !isMobileMenuOpen ? 'justify-center' : 'space-x-2 px-3'} py-2 text-red-500 hover:bg-red-50 transition-all rounded group`}
          >
            <LogOutIcon size={16} className="group-hover:scale-110 transition-transform" />
            {(!isSidebarCollapsed || isMobileMenuOpen) && <span className="text-[10px] font-black uppercase tracking-widest">Sign Out</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-12 md:h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6 z-30 shrink-0 relative">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => window.innerWidth < 768 ? setIsMobileMenuOpen(true) : setIsSidebarCollapsed(!isSidebarCollapsed)} 
              className="p-1.5 hover:bg-[#eef6f7] rounded-lg transition-all text-[#2d808e] focus:outline-none"
            >
              <Menu size={18} />
            </button>
            <div 
              onClick={() => handleNav('/overview')} 
              className="text-lg font-black text-gray-800 tracking-tighter hover:text-[#2d808e] transition-colors cursor-pointer select-none"
            >
              ALIGN
            </div>
          </div>

          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-full max-w-[320px]">
            <div className="relative w-full group">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#2d808e] transition-colors" />
              <input 
                type="text" 
                placeholder="Terminal Search..." 
                className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-transparent focus:border-[#2d808e]/20 focus:bg-white rounded-lg outline-none text-[10px] font-bold text-gray-600 transition-all shadow-inner" 
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
             <button 
              onClick={() => setIsNotificationOpen(true)}
              className="p-1.5 text-gray-400 hover:text-[#2d808e] bg-gray-50 rounded-lg transition-all relative"
             >
               <Bell size={16} />
               <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full border-2 border-white"></span>
             </button>
             <div className="w-px h-5 bg-gray-100"></div>
             <div className="flex items-center pl-1">
                <button 
                  onClick={() => setIsProfileOpen(true)}
                  className="w-8 h-8 rounded-lg bg-[#eef6f7] flex items-center justify-center border border-white shadow-sm ring-1 ring-[#eef6f7] hover:ring-[#2d808e] transition-all"
                >
                  <UserIcon size={16} className="text-[#2d808e]" />
                </button>
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#f8fafb] pb-10">
          <div className="max-w-[1400px] mx-auto w-full">
            <Routes>
              <Route path="/overview" element={<DashboardOverview onCheckStock={() => setIsStockStatusModalOpen(true)} onMoveOrder={() => setIsMoveOrderModalOpen(true)} onPreviewPr={(pr) => setPreviewPr(pr)} onPreviewPo={(po) => setPreviewPo(po)} />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/requisition" element={<PurchaseRequisition />} />
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
              <Route path="/label" element={<LabelManagement />} />
              <Route path="/" element={<Navigate to="/overview" replace />} />
            </Routes>
          </div>
        </main>

        <footer className="h-10 border-t border-gray-50 flex items-center justify-center bg-white/80 backdrop-blur px-6 shrink-0 sticky bottom-0 z-20">
           <div className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-300">
             &copy; 2026 ALIGN - Proprietary Node
           </div>
        </footer>
      </div>

      <MoveOrderModal isOpen={isMoveOrderModalOpen} onClose={() => setIsMoveOrderModalOpen(false)} />
      <StockStatusModal isOpen={isStockStatusModalOpen} onClose={() => setIsStockStatusModalOpen(false)} />
      {previewPr && <PRPreviewModal pr={previewPr} onClose={() => setPreviewPr(null)} />}
      {previewPo && <POPreviewModal po={previewPo} onClose={() => { setPreviewPo(null); }} />}

      {/* Notifications Modal */}
      {isNotificationOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-black text-gray-800 uppercase tracking-tight text-sm">System Notifications</h3>
              <button onClick={() => setIsNotificationOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[400px] overflow-y-auto p-2">
              <div className="p-4 bg-[#eef6f7] border border-[#2d808e]/10 rounded-xl mb-2">
                <p className="text-[11px] font-bold text-gray-800">Welcome to ALIGN Node</p>
                <p className="text-[10px] text-gray-500 mt-1">Terminal connection established successfully.</p>
                <span className="text-[8px] text-gray-400 mt-2 block font-black">Just now</span>
              </div>
              <div className="p-4 bg-white border border-gray-100 rounded-xl mb-2">
                <p className="text-[11px] font-bold text-gray-800">New PR Submitted</p>
                <p className="text-[10px] text-gray-500 mt-1">PR-2000000018 requires your approval.</p>
                <span className="text-[8px] text-gray-400 mt-2 block font-black">10 mins ago</span>
              </div>
            </div>
            <div className="p-4 bg-gray-50 text-center">
              <button className="text-[10px] font-black text-[#2d808e] uppercase tracking-widest">Clear All</button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#2d808e] p-8 text-center relative">
              <button onClick={() => setIsProfileOpen(false)} className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors">
                <X size={20} />
              </button>
              <div className="w-20 h-20 bg-white/20 rounded-2xl mx-auto flex items-center justify-center border border-white/30 backdrop-blur shadow-xl mb-4">
                <UserIcon size={32} className="text-white" />
              </div>
              <h3 className="text-white font-black text-xl tracking-tight uppercase">{user?.fullName || 'System Administrator'}</h3>
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-1">ID: {user?.id?.substring(0, 8) || 'N/A'}</p>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex items-center space-x-4 group">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:border-[#2d808e]/30 transition-all">
                  <Briefcase size={18} className="text-gray-400 group-hover:text-[#2d808e]" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Designation</p>
                  <p className="text-sm font-bold text-gray-700">{user?.role || 'Administrator'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 group">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:border-[#2d808e]/30 transition-all">
                  <Mail size={18} className="text-gray-400 group-hover:text-[#2d808e]" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Email Node</p>
                  <p className="text-sm font-bold text-gray-700">{user?.email || 'identity@fairtechnology.com'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 group">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:border-[#2d808e]/30 transition-all">
                  <Phone size={18} className="text-gray-400 group-hover:text-[#2d808e]" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Contact Terminal</p>
                  <p className="text-sm font-bold text-gray-700">{user?.lastLogin ? 'Internal Node Connected' : '+880 1XXX-XXXXXX'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 group">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:border-[#2d808e]/30 transition-all">
                  <IdCard size={18} className="text-gray-400 group-hover:text-[#2d808e]" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Unique ID</p>
                  <p className="text-sm font-bold text-gray-700">{user?.id || 'PROPRIETARY-ID'}</p>
                </div>
              </div>
            </div>
            <div className="px-8 py-6 bg-gray-50 flex justify-center space-x-4">
               <button onClick={logout} className="w-full py-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-100 transition-all flex items-center justify-center gap-2">
                 <LogOutIcon size={14} />
                 <span>Terminate Session</span>
               </button>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes wave {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-wave {
          animation: wave 4s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
