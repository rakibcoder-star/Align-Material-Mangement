
import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CycleCounting from './CycleCounting';
import UserManagement from './UserManagement';
import MoveOrderModal from './MoveOrderModal';
import MOApprovalModal from './MOApprovalModal';
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
import TnxDetailsModal from './TnxDetailsModal';
import LocationTransferModal from './LocationTransferModal';
import { supabase } from '../lib/supabase';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Gauge, 
  ShoppingCart, 
  Warehouse, 
  LayoutGrid, 
  ChevronDown, 
  User as UserIcon,
  Search,
  Menu,
  FileText,
  Bell,
  Home,
  ShoppingBag,
  ShieldAlert,
  Printer,
  PackageSearch,
  MoveHorizontal,
  LogOut as LogOutIcon,
  Loader2,
  X,
  Truck,
  BarChart3,
  ArrowRight,
  ArrowLeft,
  Layers,
  Tag,
  Boxes,
  ArrowUpRight,
  Mail,
  Phone,
  Briefcase,
  IdCard,
  MapPin,
  ClipboardList
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
}> = ({ icon, label, active, hasSubmenu, isOpen, isCollapsed, onClick, children }) => {
  return (
    <div className="w-full px-2 mb-1">
      <button
        onClick={onClick}
        title={isCollapsed ? label : ''}
        className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2 transition-all duration-200 rounded-lg border ${
          active 
            ? 'text-[#2d808e] bg-white border-[#2d808e] font-bold shadow-sm' 
            : 'text-[#5e718d] hover:bg-gray-50 border-transparent font-medium'
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className={`${active ? 'text-[#2d808e]' : 'text-[#8da2c0]'} shrink-0`}>
            {icon && React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 18 }) : icon}
          </div>
          {!isCollapsed && <span className="text-[13px] tracking-tight">{label}</span>}
        </div>
        {!isCollapsed && hasSubmenu && (
          <div className="shrink-0 text-gray-300">
            {isOpen ? <ChevronDown size={12} /> : <ChevronDown size={12} className="opacity-40" />}
          </div>
        )}
      </button>
      {!isCollapsed && isOpen && children && <div className="mt-1 space-y-0.5">{children}</div>}
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
    className={`w-full flex items-center space-x-3 pl-10 pr-4 py-1.5 text-[12px] transition-all duration-200 rounded-md ${
      active 
        ? 'text-[#2d808e] font-bold' 
        : 'text-[#5e718d] hover:text-[#2d808e] hover:bg-gray-50'
    }`}
  >
    <div className={`${active ? 'text-[#2d808e]' : 'text-gray-300'} shrink-0`}>
      {icon && React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 14 }) : icon}
    </div>
    <span className="truncate">{label}</span>
  </button>
);

const KPICard: React.FC<{ label: string; value: string; subValue?: string }> = ({ label, value, subValue }) => (
  <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group border-b-4 border-b-[#2d808e]/10 hover:border-b-[#2d808e]">
    <h3 className="text-xs text-gray-400 font-bold tracking-wider uppercase mb-2">{label}</h3>
    <div className="flex items-baseline space-x-2">
      <p className="text-2xl font-black text-gray-800 tracking-tight group-hover:text-[#2d808e] transition-colors">{value}</p>
      {subValue && <p className="text-sm font-bold text-gray-300">({subValue})</p>}
    </div>
  </div>
);

const LiquidGauge: React.FC<{ label: string; value: number; subLabel: string; color?: string; colorLight?: string }> = ({ label, value, subLabel, color = "#2589ff", colorLight = "#60a5fa" }) => {
  return (
    <div className="bg-white p-8 rounded-2xl border border-gray-100 flex flex-col items-center transition-all hover:shadow-lg">
      <h3 className="text-[12px] font-black text-[#2d808e] uppercase tracking-widest mb-10">{label} ({subLabel})</h3>
      <div className="relative w-48 h-48 rounded-full border-[6px] border-[#f0f4f8] overflow-hidden flex items-center justify-center bg-white shadow-inner">
        {/* Waving Liquid */}
        <div 
          className="absolute bottom-0 left-0 w-full transition-all duration-1000 ease-in-out z-10"
          style={{ height: `${value}%` }}
        >
          {/* Back Wave */}
          <div className="absolute top-0 left-0 w-[200%] h-20 -translate-y-1/2 opacity-30 animate-water-back" style={{ fill: colorLight }}>
            <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="w-full h-full">
              <path d="M0,50 C150,0 350,100 500,50 C650,0 850,100 1000,50 L1000,100 L0,100 Z" />
            </svg>
          </div>
          {/* Front Wave */}
          <div className="absolute top-0 left-0 w-[200%] h-20 -translate-y-1/2 opacity-80 animate-water-front" style={{ fill: color }}>
            <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="w-full h-full">
              <path d="M0,50 C150,100 350,0 500,50 C650,100 850,0 1000,50 L1000,100 L0,100 Z" />
            </svg>
          </div>
          {/* Solid Liquid Fill */}
          <div className="w-full h-full" style={{ backgroundColor: color }}></div>
        </div>
        
        {/* Reflection Highlight */}
        <div className="absolute inset-0 rounded-full pointer-events-none z-20 shadow-[inset_0_10px_20px_rgba(255,255,255,0.3)]"></div>
        
        {/* Percentage Text */}
        <div className="relative z-30 flex flex-col items-center">
          <span className="text-5xl font-black text-gray-800 drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)] tracking-tighter">
            {value}%
          </span>
        </div>
      </div>
    </div>
  );
};

const DashboardOverview: React.FC<{ 
  onCheckStock: () => void; 
  onMoveOrder: () => void; 
  onLocTransfer: () => void;
  onPreviewPr: (pr: any) => void; 
  onPreviewPo: (po: any) => void; 
  onPreviewMo: (mo: any) => void; 
  onPreviewTnx: (tnx: any) => void 
}> = ({ onCheckStock, onMoveOrder, onPreviewPr, onPreviewPo, onPreviewMo, onPreviewTnx, onLocTransfer }) => {
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
      const { data: prApprovals } = await supabase.from('requisitions').select('*').eq('status', 'Pending').order('created_at', { ascending: false }).limit(5);
      if (prApprovals) setPendingPrs(prApprovals);
      const { data: poApprovals } = await supabase.from('purchase_orders').select('*').eq('status', 'Pending').order('created_at', { ascending: false }).limit(5);
      if (poApprovals) setPendingPos(poApprovals);
      const { data: moApprovals } = await supabase.from('move_orders').select('*').eq('status', 'Pending').order('created_at', { ascending: false }).limit(5);
      if (moApprovals) setPendingMos(moApprovals);
      const { data: prLogs } = await supabase.from('requisitions').select('*').order('created_at', { ascending: false }).limit(5);
      if (prLogs) setLatestPRs(prLogs);
      const { data: moLogs } = await supabase.from('move_orders').select('*').order('created_at', { ascending: false }).limit(5);
      if (moLogs) setLatestMOs(moLogs);

      const { data: items } = await supabase.from('items').select('*');
      if (items) {
        const types: Record<string, number> = {};
        items.forEach(item => { const type = item.type || 'Other'; types[type] = (types[type] || 0) + 1; });
        setStockTypes(Object.entries(types).map(([name, value]) => ({ name, value })));
        const dieselItem = items.find(i => i.sku === '4492' || i.sku === '4457');
        const octaneItem = items.find(i => i.sku === '3121');
        if (dieselItem) setDieselStock(Math.min(100, Math.round((dieselItem.on_hand_stock / 10000) * 100)));
        if (octaneItem) setOctaneStock(Math.min(100, Math.round((octaneItem.on_hand_stock / 10000) * 100)));
      }

      const { data: moveOrders } = await supabase.from('move_orders').select('*').order('created_at', { ascending: true });
      if (moveOrders) {
        const weeklyAgg: any[] = [];
        const todayObj = new Date();
        for (let i = 6; i >= 0; i--) {
          const d = new Date(todayObj); d.setDate(d.getDate() - i);
          const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
          const dayOrders = moveOrders.filter(mo => new Date(mo.created_at).toDateString() === d.toDateString());
          const qty = dayOrders.reduce((acc, mo) => acc + (mo.items?.reduce((iAcc: number, item: any) => iAcc + (Number(item.reqQty) || 0), 0) || 0), 0);
          const value = dayOrders.reduce((acc, mo) => acc + (Number(mo.total_value) || 0), 0);
          weeklyAgg.push({ name: dateStr, qty, value });
        }
        setWeeklyData(weeklyAgg);
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        setMonthlyData(months.map((month, idx) => {
          const value = moveOrders.filter(mo => new Date(mo.created_at).getMonth() === idx).reduce((acc, mo) => acc + (Number(mo.total_value) || 0), 0);
          return { name: month, value };
        }));
      }

      const today = new Date(); today.setHours(0,0,0,0);
      const { data: allPo } = await supabase.from('purchase_orders').select('items, created_at');
      const { data: allPr } = await supabase.from('requisitions').select('items, created_at');
      const sumQty = (list: any[], dateLimit: Date) => {
        let qty = 0; let count = 0;
        list?.filter(entry => new Date(entry.created_at) >= dateLimit).forEach(entry => {
          count++; (entry.items || []).forEach((item: any) => qty += Number(item.poQty || item.reqQty || 0));
        });
        return { qty: qty > 1000 ? (qty/1000).toFixed(1) + 'K' : qty.toString(), count: count.toString() };
      };
      setStats({
        todayOrderQty: sumQty(allPo || [], today).qty, todayOrderCount: sumQty(allPo || [], today).count,
        lastDayOrderQty: sumQty(allPo || [], new Date(today.getTime() - 86400000)).qty, lastDayOrderCount: sumQty(allPo || [], new Date(today.getTime() - 86400000)).count,
        weeklyOrderQty: sumQty(allPo || [], new Date(today.getTime() - 7*86400000)).qty, weeklyOrderCount: sumQty(allPo || [], new Date(today.getTime() - 7*86400000)).count,
        monthlyOrderQty: sumQty(allPo || [], new Date(today.getTime() - 30*86400000)).qty, monthlyOrderCount: sumQty(allPo || [], new Date(today.getTime() - 30*86400000)).count,
        weeklyPrQty: sumQty(allPr || [], new Date(today.getTime() - 7*86400000)).qty, weeklyPrCount: sumQty(allPr || [], new Date(today.getTime() - 7*86400000)).count,
        monthlyPrQty: sumQty(allPr || [], new Date(today.getTime() - 30*86400000)).qty, monthlyPrCount: sumQty(allPr || [], new Date(today.getTime() - 30*86400000)).count
      });
    };
    fetchDashboardData();
    return () => clearInterval(timer);
  }, []);

  const COLORS = ['#2d808e', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ff7300', '#3b82f6', '#1e293b'];

  const formatDateShort = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
  };

  const formatCurrency = (val: number) => {
    return (val || 0).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 });
  };

  return (
    <div className="space-y-6 animate-slide-up pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h1 className="text-2xl font-black text-gray-800 tracking-tight leading-none">Welcome, {user?.fullName?.split(' ')[0] || 'Admin'}</h1>
          <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-[0.2em]">{dateTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => navigate('/label')} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-xs font-black rounded-xl shadow-sm hover:bg-gray-50 uppercase tracking-widest transition-all flex items-center gap-2"><Printer size={16} /><span>Print Labels</span></button>
          <button onClick={onCheckStock} className="px-5 py-2.5 bg-[#2d808e] text-white text-xs font-black rounded-xl shadow-lg shadow-[#2d808e]/10 hover:bg-[#256b78] uppercase tracking-widest transition-all flex items-center gap-2"><PackageSearch size={16} /><span>Check Stock</span></button>
          <button onClick={onMoveOrder} className="px-5 py-2.5 bg-emerald-600 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-900/10 hover:bg-emerald-700 uppercase tracking-widest transition-all flex items-center gap-2"><MoveHorizontal size={16} /><span>Move Order</span></button>
          <button onClick={onLocTransfer} className="px-5 py-2.5 bg-[#2d808e] text-white text-xs font-black rounded-xl shadow-lg shadow-[#2d808e]/10 hover:bg-[#256b78] uppercase tracking-widest transition-all flex items-center gap-2"><MapPin size={16} /><span>Loc. Transfer</span></button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard label="Today Orders" value={stats.todayOrderQty} subValue={stats.todayOrderCount} />
        <KPICard label="Last Day Orders" value={stats.lastDayOrderQty} subValue={stats.lastDayOrderCount} />
        <KPICard label="Weekly Orders" value={stats.weeklyOrderQty} subValue={stats.weeklyOrderCount} />
        <KPICard label="Monthly Orders" value={stats.monthlyOrderQty} subValue={stats.monthlyOrderCount} />
        <KPICard label="Weekly PR" value={stats.weeklyPrQty} subValue={stats.weeklyPrCount} />
        <KPICard label="Monthly PR" value={stats.monthlyPrQty} subValue={stats.monthlyPrCount} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between"><h3 className="text-xs font-black text-gray-800 uppercase tracking-widest">PR Approvals</h3><span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[10px] font-black rounded-full uppercase">{pendingPrs.length} Pending</span></div>
          <div className="overflow-y-auto max-h-[220px] scrollbar-thin">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/50 sticky top-0"><tr className="text-[10px] font-bold text-gray-400 uppercase border-b border-gray-50"><th className="px-5 py-3">Date</th><th className="px-5 py-3">Reference</th><th className="px-5 py-3 text-right">Value</th></tr></thead>
              <tbody className="text-xs font-medium text-gray-600">
                {pendingPrs.map((pr) => (
                  <tr key={pr.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                    <td className="px-5 py-3">{new Date(pr.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3"><button onClick={() => onPreviewPr(pr)} className="text-blue-500 font-bold hover:underline">{pr.pr_no}</button></td>
                    <td className="px-5 py-3 text-right font-black text-gray-800">{(pr.total_value || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between"><h3 className="text-xs font-black text-gray-800 uppercase tracking-widest">PO Approvals</h3><span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full uppercase">{pendingPos.length} Pending</span></div>
          <div className="overflow-y-auto max-h-[220px] scrollbar-thin">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/50 sticky top-0"><tr className="text-[10px] font-bold text-gray-400 uppercase border-b border-gray-50"><th className="px-5 py-3">Date</th><th className="px-5 py-3">Order No</th><th className="px-5 py-3 text-right">Value</th></tr></thead>
              <tbody className="text-xs font-medium text-gray-600">
                {pendingPos.map((po) => (
                  <tr key={po.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                    <td className="px-5 py-3">{new Date(po.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3"><button onClick={() => onPreviewPo(po)} className="text-blue-500 font-bold hover:underline">{po.po_no}</button></td>
                    <td className="px-5 py-3 text-right font-black text-gray-800">{(po.total_value || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between"><h3 className="text-xs font-black text-gray-800 uppercase tracking-widest">MO Approvals</h3><span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full uppercase">{pendingMos.length} Pending</span></div>
          <div className="overflow-y-auto max-h-[220px] scrollbar-thin">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/50 sticky top-0"><tr className="text-[10px] font-bold text-gray-400 uppercase border-b border-gray-50"><th className="px-5 py-3">Date</th><th className="px-5 py-3">Ref ID</th><th className="px-5 py-3 text-right">Value</th></tr></thead>
              <tbody className="text-xs font-medium text-gray-600">
                {pendingMos.map((mo) => (
                  <tr key={mo.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                    <td className="px-5 py-3 whitespace-nowrap">{new Date(mo.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3"><button onClick={() => onPreviewMo(mo)} className="text-blue-500 font-bold hover:underline">{mo.mo_no}</button></td>
                    <td className="px-5 py-3 text-right font-black text-gray-800">{(mo.total_value || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest mb-6">Weekly Movement Analytics</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%"><BarChart data={weeklyData}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} /><YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} /><YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} /><Tooltip contentStyle={{ fontSize: '12px', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} /><Bar yAxisId="left" dataKey="qty" fill="#2d808e" radius={[4, 4, 0, 0]} barSize={24} /><Line yAxisId="right" type="monotone" dataKey="value" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316', r: 4 }} /></BarChart></ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest mb-6">Annual Valuation Trend</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%"><LineChart data={monthlyData}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} /><YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} /><Tooltip contentStyle={{ fontSize: '12px', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} /><Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 6, strokeWidth: 2, stroke: '#fff' }} /></LineChart></ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <LiquidGauge label="DIESEL" value={dieselStock} subLabel="4457" color="#2d808e" colorLight="#60a5fa" />
        <LiquidGauge label="OCTANE" value={octaneStock} subLabel="3121" color="#2589ff" colorLight="#8ebfff" />
        <div className="bg-white p-6 rounded-2xl border border-gray-100 flex flex-col shadow-sm">
          <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest mb-6 text-center">Stock Segmentation</h3>
          <div className="flex flex-1 items-center justify-around gap-4">
            <div className="h-40 w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stockTypes} innerRadius={40} outerRadius={60} paddingAngle={4} dataKey="value">
                    {stockTypes.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 flex flex-col space-y-2 overflow-y-auto max-h-[160px] scrollbar-thin pr-2">
              {stockTypes.map((type, index) => { 
                const total = stockTypes.reduce((acc, curr) => acc + curr.value, 0); 
                const percent = total > 0 ? ((type.value / total) * 100).toFixed(0) : 0; 
                return (
                  <div key={index} className="flex items-center justify-between group hover:bg-gray-50 p-2 rounded-lg transition-colors">
                    <div className="flex items-center space-x-2 overflow-hidden">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase truncate leading-none">{type.name}</span>
                    </div>
                    <span className="text-[10px] font-black text-gray-800 ml-2">{percent}%</span>
                  </div>
                ); 
              })}
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm flex flex-col min-h-[400px]">
          <h2 className="text-xl font-black text-[#2d808e] mb-6 tracking-tight">Latest Move orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-black text-gray-400 border-b border-gray-50 uppercase tracking-wider">
                  <th className="px-2 py-4 text-center w-12 border-r border-gray-50">#</th>
                  <th className="px-4 py-4 text-center border-r border-gray-50">DATE</th>
                  <th className="px-4 py-4 text-center border-r border-gray-50">TNX.NO</th>
                  <th className="px-4 py-4 border-r border-gray-50">ITEM NAME</th>
                  <th className="px-4 py-4 text-center border-r border-gray-50">QTY</th>
                  <th className="px-4 py-4 text-right">VALUE</th>
                </tr>
              </thead>
              <tbody className="text-[12px] font-medium">
                {latestMOs.map((mo, idx) => {
                  const firstItem = mo.items?.[0] || {};
                  const itemNameDisplay = mo.items?.length > 1 
                    ? `${firstItem.name || 'N/A'} (+${mo.items.length - 1})`
                    : (firstItem.name || 'N/A');
                  const totalQty = mo.items?.reduce((acc: number, i: any) => acc + (Number(i.reqQty) || 0), 0);

                  return (
                    <tr key={mo.id} className="hover:bg-gray-50/40 transition-colors">
                      <td className="px-2 py-4 text-center text-gray-400 border-r border-gray-50">{idx + 1}</td>
                      <td className="px-4 py-4 text-center border-r border-gray-50 whitespace-nowrap text-gray-600">{formatDateShort(mo.created_at)}</td>
                      <td className="px-4 py-4 text-center border-r border-gray-50">
                        <button onClick={() => onPreviewTnx(mo)} className="text-blue-500 font-bold hover:underline transition-all">{mo.mo_no}</button>
                      </td>
                      <td className="px-4 py-4 uppercase truncate max-w-[200px] font-bold text-gray-700 border-r border-gray-50" title={itemNameDisplay}>{itemNameDisplay}</td>
                      <td className="px-4 py-4 text-center font-black text-gray-800 border-r border-gray-50">{totalQty}</td>
                      <td className="px-4 py-4 text-right font-black text-gray-800">{formatCurrency(mo.total_value)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm flex flex-col min-h-[400px]">
          <h2 className="text-xl font-black text-[#2d808e] mb-6 tracking-tight">Latest PR</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-black text-gray-400 border-b border-gray-50 uppercase tracking-wider">
                  <th className="px-2 py-4 text-center w-12 border-r border-gray-50">#</th>
                  <th className="px-4 py-4 text-center border-r border-gray-50">DATE</th>
                  <th className="px-4 py-4 text-center border-r border-gray-50">PR NO</th>
                  <th className="px-4 py-4 border-r border-gray-50">REQUESTED BY</th>
                  <th className="px-4 py-4 text-center border-r border-gray-50">QTY</th>
                  <th className="px-4 py-4 text-right">VALUE</th>
                </tr>
              </thead>
              <tbody className="text-[12px] font-medium">
                {latestPRs.map((pr, idx) => {
                  const totalQty = pr.items?.reduce((acc: number, i: any) => acc + (Number(i.reqQty) || 0), 0);
                  
                  return (
                    <tr key={pr.id} className="hover:bg-gray-50/40 transition-colors">
                      <td className="px-2 py-4 text-center text-gray-400 border-r border-gray-50">{idx + 1}</td>
                      <td className="px-4 py-4 text-center border-r border-gray-50 whitespace-nowrap text-gray-600">{formatDateShort(pr.created_at)}</td>
                      <td className="px-4 py-4 text-center border-r border-gray-50">
                        <button onClick={() => onPreviewPr(pr)} className="text-blue-500 font-bold hover:underline transition-all">{pr.pr_no}</button>
                      </td>
                      <td className="px-4 py-4 uppercase truncate max-w-[150px] font-bold text-gray-700 border-r border-gray-50">{pr.req_by_name || 'N/A'}</td>
                      <td className="px-4 py-4 text-center font-black text-gray-800 border-r border-gray-50">{totalQty}</td>
                      <td className="px-4 py-4 text-right font-black text-gray-800">{formatCurrency(pr.total_value)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileModal: React.FC<{ user: any, isOpen: boolean, onClose: () => void, logout: () => void }> = ({ user, isOpen, onClose, logout }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors z-20">
          <X size={24} />
        </button>
        <div className="bg-[#2d808e] p-10 flex flex-col items-center justify-center text-white text-center relative overflow-hidden">
           <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute -top-10 -left-10 w-40 h-40 border-8 border-white rounded-full"></div>
              <div className="absolute -bottom-10 -right-10 w-60 h-60 border-4 border-white rounded-full"></div>
           </div>
           <div className="w-24 h-24 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center mb-6 shadow-xl backdrop-blur-sm z-10">
             <UserIcon size={56} className="text-white" />
           </div>
           <h2 className="text-2xl font-black uppercase tracking-tighter mb-1 z-10">SYSTEM ADMINISTRATOR</h2>
           <p className="text-[10px] font-black text-white/60 uppercase tracking-widest z-10">NODE ID: {user?.id?.substring(0,8).toUpperCase() || 'N/A'}</p>
        </div>
        <div className="p-10 space-y-6">
          {[
            { icon: <Briefcase size={20} />, label: 'DESIGNATION', value: user?.role || 'Administrator' },
            { icon: <Mail size={20} />, label: 'EMAIL NODE', value: user?.email || 'identity@fairtechnology.com' },
            { icon: <Phone size={20} />, label: 'CONTACT TERMINAL', value: '+880 1XXX-XXXXXX' },
            { icon: <IdCard size={20} />, label: 'UNIQUE ID', value: 'PROPRIETARY-ID' }
          ].map((field, idx) => (
            <div key={idx} className="flex items-start gap-5 group">
              <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-[#2d808e] group-hover:bg-[#2d808e] group-hover:text-white transition-all duration-300">
                {field.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">{field.label}</span>
                <span className="text-base font-black text-gray-700 tracking-tight">{field.value}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="px-10 pb-10">
          <button 
            onClick={logout}
            className="w-full py-4 border border-red-100 rounded-2xl flex items-center justify-center gap-3 text-red-500 font-black text-sm uppercase tracking-widest hover:bg-red-50 transition-all active:scale-[0.98]"
          >
            <LogOutIcon size={18} />
            <span>TERMINATE SESSION</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const SearchResults: React.FC<{ 
  results: {pr: any[], po: any[], mo: any[], items: any[]}, 
  onNavigate: (type: string, obj: any) => void
}> = ({ results, onNavigate }) => {
  const hasResults = results.pr.length > 0 || results.po.length > 0 || results.mo.length > 0 || results.items.length > 0;
  return (
    <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-[80vh] overflow-y-auto z-[2000] scrollbar-thin">
      {!hasResults ? (
        <div className="p-10 text-center text-gray-400">
          <Search size={32} className="mx-auto mb-2 opacity-20" />
          <p className="text-xs font-bold uppercase tracking-widest">No matching records found in system</p>
        </div>
      ) : (
        <div className="p-2 space-y-4">
          {results.items.length > 0 && (
            <div className="space-y-1">
              <h4 className="px-3 py-1 text-[9px] font-black text-[#2d808e] uppercase tracking-widest border-b border-gray-50">Master Items</h4>
              {results.items.map(i => (
                <button key={i.id} onClick={() => onNavigate('item', i)} className="w-full text-left px-4 py-2 hover:bg-[#2d808e]/5 rounded-lg flex items-center justify-between group transition-colors">
                  <div className="flex flex-col">
                    <span className="text-[13px] font-black text-gray-800 uppercase tracking-tight">{i.name}</span>
                    <span className="text-[10px] font-bold text-gray-400">SKU: {i.sku} | Loc: {i.location || 'N/A'}</span>
                  </div>
                  <ArrowUpRight size={14} className="text-gray-200 group-hover:text-[#2d808e] transition-colors" />
                </button>
              ))}
            </div>
          )}
          {results.pr.length > 0 && (
            <div className="space-y-1">
              <h4 className="px-3 py-1 text-[9px] font-black text-orange-500 uppercase tracking-widest border-b border-gray-50">Purchase Requisitions</h4>
              {results.pr.map(r => (
                <button key={r.id} onClick={() => onNavigate('pr', r)} className="w-full text-left px-4 py-2 hover:bg-orange-50 rounded-lg flex items-center justify-between group transition-colors">
                  <div className="flex flex-col">
                    <span className="text-[13px] font-black text-gray-800">PR-{r.pr_no}</span>
                    <span className="text-[10px] font-bold text-gray-400">Ref: {r.reference} | Value: {r.total_value}</span>
                  </div>
                  <ArrowUpRight size={14} className="text-gray-200 group-hover:text-orange-500 transition-colors" />
                </button>
              ))}
            </div>
          )}
          {results.po.length > 0 && (
            <div className="space-y-1">
              <h4 className="px-3 py-1 text-[9px] font-black text-blue-500 uppercase tracking-widest border-b border-gray-50">Purchase Orders</h4>
              {results.po.map(o => (
                <button key={o.id} onClick={() => onNavigate('po', o)} className="w-full text-left px-4 py-2 hover:bg-blue-50 rounded-lg flex items-center justify-between group transition-colors">
                  <div className="flex flex-col">
                    <span className="text-[13px] font-black text-gray-800">PO-{o.po_no}</span>
                    <span className="text-[10px] font-bold text-gray-400">Supplier: {o.supplier_name} | Total: {o.total_value}</span>
                  </div>
                  <ArrowUpRight size={14} className="text-gray-200 group-hover:text-blue-500 transition-colors" />
                </button>
              ))}
            </div>
          )}
          {results.mo.length > 0 && (
            <div className="space-y-1">
              <h4 className="px-3 py-1 text-[9px] font-black text-emerald-500 uppercase tracking-widest border-b border-gray-50">Move Orders</h4>
              {results.mo.map(m => (
                <button key={m.id} onClick={() => onNavigate('mo', m)} className="w-full text-left px-4 py-2 hover:bg-emerald-50 rounded-lg flex items-center justify-between group transition-colors">
                  <div className="flex flex-col">
                    <span className="text-[13px] font-black text-gray-800">MO-{m.mo_no}</span>
                    <span className="text-[10px] font-bold text-gray-400">Dept: {m.department} | Status: {m.status}</span>
                  </div>
                  <ArrowUpRight size={14} className="text-gray-200 group-hover:text-emerald-500 transition-colors" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname.substring(1) || 'overview';
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 768);

  const menuNavigate = (path: string) => {
    navigate(path);
    if (window.innerWidth < 768) setIsSidebarCollapsed(true);
  };
  const [isMoveOrderModalOpen, setIsMoveOrderModalOpen] = useState(false);
  const [isLocationTransferModalOpen, setIsLocationTransferModalOpen] = useState(false);
  const [isStockStatusModalOpen, setIsStockStatusModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [previewPr, setPreviewPr] = useState<any>(null);
  const [previewPo, setPreviewPo] = useState<any>(null);
  const [previewMo, setPreviewMo] = useState<any>(null);
  const [previewTnx, setPreviewTnx] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{pr: any[], po: any[], mo: any[], items: any[]}>({ pr: [], po: [], mo: [], items: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSearch = async () => {
      if (!searchQuery || searchQuery.length < 2) {
        setSearchResults({ pr: [], po: [], mo: [], items: [] });
        return;
      }
      setIsSearching(true);
      try {
        const [prRes, poRes, moRes, itemRes] = await Promise.all([
          supabase.from('requisitions').select('*').or(`pr_no.ilike.%${searchQuery}%,reference.ilike.%${searchQuery}%`).limit(5),
          supabase.from('purchase_orders').select('*').or(`po_no.ilike.%${searchQuery}%,supplier_name.ilike.%${searchQuery}%`).limit(5),
          supabase.from('move_orders').select('*').or(`mo_no.ilike.%${searchQuery}%,reference.ilike.%${searchQuery}%`).limit(5),
          supabase.from('items').select('*').or(`sku.ilike.%${searchQuery}%,name.ilike.%${searchQuery}%`).limit(5)
        ]);
        setSearchResults({
          pr: prRes.data || [],
          po: poRes.data || [],
          mo: moRes.data || [],
          items: itemRes.data || []
        });
        setShowSearchResults(true);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    };
    const timeoutId = setTimeout(handleSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchResultNavigation = (type: string, obj: any) => {
    setShowSearchResults(false);
    setSearchQuery('');
    if (type === 'pr') setPreviewPr(obj);
    if (type === 'po') setPreviewPo(obj);
    if (type === 'mo') setPreviewMo(obj);
    if (type === 'item') navigate('/item-list');
  };

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    purchase: location.pathname.includes('requisition') || location.pathname.includes('purchase-order') || location.pathname.includes('supplier') || location.pathname.includes('purchase-report'),
    warehouse: location.pathname.includes('inventory') || location.pathname.includes('receive') || location.pathname.includes('issue') || location.pathname.includes('tnx-report') || location.pathname.includes('mo-report'),
    itemMaster: location.pathname.includes('item-list') || location.pathname.includes('item-uom') || location.pathname.includes('item-group') || location.pathname.includes('item-type') || location.pathname.includes('cost-center'),
    admin: location.pathname.includes('users')
  });

  return (
    <div className="flex h-screen bg-[#f3f4f6] overflow-hidden font-sans no-print">
      <aside className={`relative z-50 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-16 md:w-20' : 'w-[240px]'} bg-white flex flex-col h-full shadow-2xl shrink-0 border-r border-gray-100`}>
        <div className="p-6 flex flex-col items-center border-b border-gray-50 mb-4">
          <div className="w-16 h-16 rounded-full bg-[#f0f9fa] flex items-center justify-center mb-3 shadow-inner">
            <UserIcon size={32} className="text-[#2d808e]" />
          </div>
          {!isSidebarCollapsed && (
            <>
              <h3 className="text-[13px] font-black text-gray-800 uppercase tracking-tight">SYSTEM ADMIN</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">ADMINISTRATOR</p>
            </>
          )}
        </div>
        <div className="flex-1 py-2 overflow-y-auto overflow-x-hidden space-y-1 scrollbar-thin scrollbar-thumb-gray-200">
          <SidebarItem 
            icon={<Gauge />} 
            label="Dashboard" 
            active={activeTab === 'overview'} 
            isCollapsed={isSidebarCollapsed} 
            onClick={() => {
              if (isSidebarCollapsed) setIsSidebarCollapsed(false);
              menuNavigate('/overview');
            }} 
          />
          <SidebarItem 
            icon={<ShoppingCart />} 
            label="Purchase" 
            hasSubmenu 
            isOpen={openMenus.purchase} 
            onClick={() => {
              if (isSidebarCollapsed) setIsSidebarCollapsed(false);
              setOpenMenus({...openMenus, purchase: !openMenus.purchase});
            }} 
            isCollapsed={isSidebarCollapsed}
          >
            <SubmenuItem icon={<FileText />} label="Requisition" active={activeTab === 'requisition'} onClick={() => menuNavigate('/requisition')} />
            <SubmenuItem icon={<ShoppingBag />} label="Order" active={activeTab === 'purchase-order'} onClick={() => menuNavigate('/purchase-order')} />
            <SubmenuItem icon={<Truck />} label="Supplier" active={activeTab === 'supplier'} onClick={() => menuNavigate('/supplier')} />
            <SubmenuItem icon={<BarChart3 />} label="Report" active={activeTab === 'purchase-report'} onClick={() => menuNavigate('/purchase-report')} />
          </SidebarItem>
          <SidebarItem 
            icon={<Warehouse />} 
            label="Warehouse" 
            hasSubmenu 
            isOpen={openMenus.warehouse} 
            onClick={() => {
              if (isSidebarCollapsed) setIsSidebarCollapsed(false);
              setOpenMenus({...openMenus, warehouse: !openMenus.warehouse});
            }} 
            isCollapsed={isSidebarCollapsed}
          >
            <SubmenuItem icon={<LayoutGrid />} label="Inventory" active={activeTab === 'inventory'} onClick={() => menuNavigate('/inventory')} />
            <SubmenuItem icon={<ArrowRight />} label="Receive" active={activeTab === 'receive'} onClick={() => menuNavigate('/receive')} />
            <SubmenuItem icon={<ArrowLeft />} label="Issue" active={activeTab === 'issue'} onClick={() => menuNavigate('/issue')} />
            <SubmenuItem icon={<FileText />} label="Tnx-Report" active={activeTab === 'tnx-report'} onClick={() => menuNavigate('/tnx-report')} />
            <SubmenuItem icon={<FileText />} label="MO-Report" active={activeTab === 'mo-report'} onClick={() => menuNavigate('/mo-report')} />
            <SubmenuItem icon={<ClipboardList />} label="Cycle Counting" active={activeTab === 'cycle-counting'} onClick={() => menuNavigate('/cycle-counting')} />
          </SidebarItem>
          <SidebarItem 
            icon={<LayoutGrid />} 
            label="Item Master" 
            hasSubmenu 
            isOpen={openMenus.itemMaster} 
            onClick={() => {
              if (isSidebarCollapsed) setIsSidebarCollapsed(false);
              setOpenMenus({...openMenus, itemMaster: !openMenus.itemMaster});
            }} 
            isCollapsed={isSidebarCollapsed}
          >
            <SubmenuItem icon={<FileText />} label="Item List" active={activeTab === 'item-list'} onClick={() => menuNavigate('/item-list')} />
            <SubmenuItem icon={<Boxes />} label="Item UOM" active={activeTab === 'item-uom'} onClick={() => menuNavigate('/item-uom')} />
            <SubmenuItem icon={<Layers />} label="Item Group" active={activeTab === 'item-group'} onClick={() => menuNavigate('/item-group')} />
            <SubmenuItem icon={<Tag />} label="Item Type" active={activeTab === 'item-type'} onClick={() => menuNavigate('/item-type')} />
            <SubmenuItem icon={<Home />} label="Cost Center" active={activeTab === 'cost-center'} onClick={() => menuNavigate('/cost-center')} />
          </SidebarItem>
          <SidebarItem 
            icon={<ShieldAlert />} 
            label="Admin" 
            active={activeTab === 'users'} 
            hasSubmenu 
            isOpen={openMenus.admin} 
            onClick={() => {
              if (isSidebarCollapsed) setIsSidebarCollapsed(false);
              setOpenMenus({...openMenus, admin: !openMenus.admin});
            }} 
            isCollapsed={isSidebarCollapsed}
          >
            <SubmenuItem icon={<UserIcon />} label="Users" active={activeTab === 'users'} onClick={() => menuNavigate('/users')} />
          </SidebarItem>
        </div>
        <div className="p-4 border-t border-gray-50">
          <button onClick={logout} className="w-full flex items-center space-x-3 px-3 py-2 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-50 rounded-lg transition-all"><LogOutIcon size={18} />{!isSidebarCollapsed && <span>EXIT</span>}</button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-30 shrink-0">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="p-2 hover:bg-gray-50 rounded-xl text-[#2d808e] transition-all"><Menu size={24} /></button>
            <div onClick={() => navigate('/overview')} className="text-2xl font-black text-gray-800 tracking-tighter cursor-pointer select-none">ALIGN</div>
          </div>
          <div ref={searchContainerRef} className="flex-1 max-w-[600px] mx-10 relative">
            <div className="bg-[#f8f9fa] rounded-2xl flex items-center px-4 py-1.5 border border-transparent focus-within:border-[#2d808e]/30 focus-within:bg-white focus-within:shadow-lg transition-all">
              <Search size={20} className="text-gray-300" />
              <input 
                type="text" 
                placeholder="Search PR, PO, MO, SKU, Item..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                className="flex-1 bg-transparent border-none outline-none px-4 text-sm font-bold text-gray-700 placeholder:text-gray-300 placeholder:font-medium"
              />
              {isSearching ? (
                <Loader2 size={18} className="animate-spin text-[#2d808e] mr-2" />
              ) : null}
              <button className="w-10 h-10 bg-[#2d808e] rounded-xl flex items-center justify-center text-white shadow-lg shadow-cyan-900/20 hover:bg-[#256b78] transition-all active:scale-95">
                <ArrowUpRight size={20} />
              </button>
            </div>
            {showSearchResults && <SearchResults results={searchResults} onNavigate={handleSearchResultNavigation} />}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsNotificationOpen(!isNotificationOpen)} className="relative p-2.5 hover:bg-gray-50 rounded-xl text-[#2d808e] transition-all group">
              <Bell size={24} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
            </button>
            <div className="h-8 w-px bg-gray-100 mx-2"></div>
            <button onClick={() => setIsProfileOpen(true)} className="w-11 h-11 rounded-xl bg-[#f0f9fa] border border-gray-100 flex items-center justify-center text-[#2d808e] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group">
              <UserIcon size={24} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#f9fafb] pb-12 scrollbar-thin">
          <div className="max-w-[1600px] mx-auto w-full">
            <Routes>
              <Route path="/overview" element={<DashboardOverview onCheckStock={() => setIsStockStatusModalOpen(true)} onMoveOrder={() => setIsMoveOrderModalOpen(true)} onLocTransfer={() => setIsLocationTransferModalOpen(true)} onPreviewPr={setPreviewPr} onPreviewPo={setPreviewPo} onPreviewMo={setPreviewMo} onPreviewTnx={setPreviewTnx} />} />
              <Route path="/users" element={<UserManagement />} /><Route path="/requisition" element={<PurchaseRequisition />} /><Route path="/purchase-order" element={<PurchaseOrder />} /><Route path="/supplier" element={<Supplier />} /><Route path="/purchase-report" element={<PurchaseReport />} /><Route path="/inventory" element={<Inventory />} /><Route path="/receive" element={<Receive />} /><Route path="/issue" element={<Issue />} /><Route path="/tnx-report" element={<TnxReport />} /><Route path="/mo-report" element={<MOReport />} /><Route path="/item-list" element={<ItemList />} /><Route path="/item-uom" element={<ItemUOM />} /><Route path="/item-group" element={<ItemGroup />} /><Route path="/item-type" element={<ItemType />} /><Route path="/cost-center" element={<CostCenter />} /><Route path="/label" element={<LabelManagement />} /><Route path="/cycle-counting" element={<CycleCounting />} /><Route path="/" element={<Navigate to="/overview" replace />} />
            </Routes>
          </div>
        </main>
      </div>
      <MoveOrderModal isOpen={isMoveOrderModalOpen} onClose={() => setIsMoveOrderModalOpen(false)} />
      <LocationTransferModal isOpen={isLocationTransferModalOpen} onClose={() => setIsLocationTransferModalOpen(false)} />
      <StockStatusModal isOpen={isStockStatusModalOpen} onClose={() => setIsStockStatusModalOpen(false)} />
      {previewPr && <PRPreviewModal pr={previewPr} onClose={() => setPreviewPr(null)} />}
      {previewPo && <POPreviewModal po={previewPo} onClose={() => setPreviewPo(null)} />}
      {previewMo && <MOApprovalModal mo={previewMo} isOpen={!!previewMo} onClose={() => setPreviewMo(null)} />}
      {previewTnx && <TnxDetailsModal tnx={previewTnx} onClose={() => setPreviewTnx(null)} />}
      <ProfileModal user={user} isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} logout={logout} />
      {isNotificationOpen && (
        <div className="absolute top-16 right-20 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[1001] animate-in fade-in slide-in-from-top-2">
           <div className="p-4 border-b border-gray-50 flex items-center justify-between">
              <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest">Notifications</h4>
              <button onClick={() => setIsNotificationOpen(false)} className="text-gray-300 hover:text-gray-500"><X size={16} /></button>
           </div>
           <div className="max-h-[400px] overflow-y-auto p-2 space-y-1">
              <div className="p-3 bg-[#2d808e]/5 rounded-xl border border-[#2d808e]/10">
                 <p className="text-[11px] font-black text-gray-800 leading-tight">New PR Waiting Approval</p>
                 <p className="text-[10px] text-gray-400 mt-1 font-bold">2000000001 requires your attention.</p>
                 <span className="text-[8px] font-black text-[#2d808e] uppercase mt-2 block">10 mins ago</span>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
