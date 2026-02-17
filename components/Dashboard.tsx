
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
  PieChart, Pie, Cell
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
  IdCard,
  CheckCircle2
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
    <div className="w-full px-1">
      <button
        onClick={onClick}
        title={isCollapsed ? label : ''}
        className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-2 py-1 text-[11px] transition-all duration-200 rounded border ${
          active 
            ? 'text-[#2d808e] bg-[#eef6f7] font-bold border-[#2d808e]' 
            : danger 
              ? 'text-red-500 hover:bg-red-50 border-transparent' 
              : 'text-gray-600 hover:bg-gray-50 border-transparent'
        }`}
      >
        <div className="flex items-center space-x-1.5">
          <div className={`${active ? 'text-[#2d808e]' : danger ? 'text-red-400' : 'text-gray-400'} shrink-0`}>
            {icon && React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 14 }) : icon}
          </div>
          {!isCollapsed && <span className="font-medium leading-tight whitespace-nowrap overflow-hidden text-left">{label}</span>}
        </div>
        {!isCollapsed && hasSubmenu && (
          <div className="text-gray-300 shrink-0">
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
  <div className="px-1">
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-1.5 pl-5 pr-2 py-0.5 text-[10px] transition-all duration-200 rounded border ${
        active 
          ? 'text-[#2d808e] font-bold bg-[#eef6f7] border-[#2d808e]' 
          : 'text-gray-500 hover:text-[#2d808e] hover:bg-gray-50 border-transparent'
      }`}
    >
      <div className={`${active ? 'text-[#2d808e]' : 'text-gray-300'} shrink-0`}>
        {icon && React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 12 }) : icon}
      </div>
      <span className="truncate font-medium">{label}</span>
    </button>
  </div>
);

const KPICard: React.FC<{ label: string; value: string; subValue?: string }> = ({ label, value, subValue }) => (
  <div className="bg-white p-2.5 rounded border border-gray-100 flex flex-col justify-start min-h-[64px] hover:shadow-sm transition-all group">
    <h3 className="text-[9px] text-gray-400 font-bold tracking-tight mb-0.5 uppercase">{label}</h3>
    <div className="flex items-baseline space-x-1">
      <p className="text-xl font-black text-gray-700 tracking-tight group-hover:text-[#2d808e] transition-colors">{value}</p>
      {subValue && <p className="text-[12px] font-bold text-gray-300">({subValue})</p>}
    </div>
  </div>
);

const LiquidGauge: React.FC<{ label: string; value: number; subLabel: string; color?: string; colorLight?: string }> = ({ label, value, subLabel, color = "#3b82f6", colorLight = "#93c5fd" }) => (
  <div className="bg-white p-3 rounded-lg border border-gray-100 flex flex-col items-center">
    <h3 className="text-[8px] font-black text-[#2d808e] uppercase tracking-widest mb-2">{label} ({subLabel})</h3>
    <div className="relative w-24 h-24 rounded-full border-2 border-gray-100 p-1 overflow-hidden flex items-center justify-center bg-gray-50 shadow-inner">
      <div 
        className="absolute bottom-0 left-0 w-[400%] h-full transition-all duration-1000 ease-in-out z-0"
        style={{ transform: `translateY(${100 - value}%)` }}
      >
        {/* Secondary Wave (Back) */}
        <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="absolute top-0 left-0 w-full h-10 opacity-30 animate-wave-slow" style={{ transform: 'translateY(-100%)' }}>
          <path d="M0,70 C150,150 350,0 500,70 L500,150 L0,150 Z" style={{ fill: colorLight }}></path>
        </svg>
        {/* Main Wave (Front) */}
        <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="absolute top-0 left-0 w-full h-10 opacity-80 animate-wave" style={{ transform: 'translateY(-100%)' }}>
          <path d="M0,70 C150,150 350,0 500,70 L500,150 L0,150 Z" style={{ fill: color }}></path>
        </svg>
        <div className="w-full h-full" style={{ background: `linear-gradient(to bottom, ${color}, ${color}dd)` }}></div>
      </div>
      <div className="relative z-10 flex flex-col items-center">
        <span className="text-lg font-black text-gray-800 drop-shadow-[0_2px_2px_rgba(255,255,255,0.8)]">{value}%</span>
      </div>
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
      
      const { data: items } = await supabase.from('items').select('*');
      if (items) {
        const types: Record<string, number> = {};
        items.forEach(item => {
          const type = item.type || 'Other';
          types[type] = (types[type] || 0) + 1;
        });
        const mappedTypes = Object.entries(types).map(([name, value]) => ({ name, value }));
        setStockTypes(mappedTypes);
        
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
    <div className="space-y-4 animate-slide-up pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1.5">
        <div className="flex flex-col">
          <h1 className="text-xl font-black text-[#2d808e] tracking-tight leading-none">
            Hi {user?.fullName?.split(' ')[0] || 'Administrator'}!
          </h1>
          <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{dateTime.toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button onClick={() => navigate('/label')} className="px-3 py-1.5 bg-[#2d808e] text-white text-[9px] font-black rounded shadow-sm hover:bg-[#256b78] uppercase tracking-wider transition-all flex items-center gap-1">
            <Printer size={12} />
            <span>Code Print</span>
          </button>
          <button onClick={onCheckStock} className="px-3 py-1.5 bg-[#2d808e] text-white text-[9px] font-black rounded shadow-sm hover:bg-[#256b78] uppercase tracking-wider transition-all flex items-center gap-1">
            <PackageSearch size={12} />
            <span>Check Stock</span>
          </button>
          <button onClick={onMoveOrder} className="px-3 py-1.5 bg-[#2d808e] text-white text-[9px] font-black rounded shadow-sm hover:bg-[#256b78] uppercase tracking-wider transition-all flex items-center gap-1">
            <MoveHorizontal size={12} />
            <span>Move Order</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        <KPICard label="Today Order" value={stats.todayOrderQty} subValue={stats.todayOrderCount} />
        <KPICard label="Lastday Order" value={stats.lastDayOrderQty} subValue={stats.lastDayOrderCount} />
        <KPICard label="Weekly Order" value={stats.weeklyOrderQty} subValue={stats.weeklyOrderCount} />
        <KPICard label="Monthly Order" value={stats.monthlyOrderQty} subValue={stats.monthlyOrderCount} />
        <KPICard label="Weekly PR" value={stats.weeklyPrQty} subValue={stats.weeklyPrCount} />
        <KPICard label="Monthly PR" value={stats.monthlyPrQty} subValue={stats.monthlyPrCount} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white p-3 rounded border border-gray-100">
          <h3 className="text-[10px] font-black text-[#2d808e] uppercase tracking-tighter mb-3">Weekly Move Order</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: '#94a3b8' }} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: '#94a3b8' }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ fontSize: '8px', borderRadius: '4px', border: 'none', boxShadow: '0 2px 4px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar yAxisId="left" dataKey="qty" fill="#1e293b" radius={[1, 1, 0, 0]} barSize={16} />
                <Line yAxisId="right" type="monotone" dataKey="value" stroke="#f97316" strokeWidth={1.5} dot={{ fill: '#f97316', r: 2 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-3 rounded border border-gray-100">
          <h3 className="text-[10px] font-black text-[#2d808e] uppercase tracking-tighter mb-3">Monthly Move Order</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ fontSize: '8px' }} />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={1.5} dot={{ fill: '#3b82f6', r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <LiquidGauge label="DIESEL" value={dieselStock} subLabel="4492" color="#3b82f6" colorLight="#93c5fd" />
        <LiquidGauge label="OCTANE" value={octaneStock} subLabel="3121" color="#0ea5e9" colorLight="#7dd3fc" />
        
        {/* Stock Types with Side Breakdown List */}
        <div className="bg-white p-3 rounded border border-gray-100 flex flex-col">
          <h3 className="text-[8px] font-black text-[#2d808e] uppercase tracking-widest mb-2 text-center">Stock Types Distribution</h3>
          <div className="flex flex-1 items-center">
            <div className="h-28 w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stockTypes} innerRadius={22} outerRadius={35} paddingAngle={3} dataKey="value">
                    {stockTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 flex flex-col space-y-1 pl-2 border-l border-gray-50 overflow-y-auto max-h-[110px] scrollbar-thin">
              {stockTypes.map((type, index) => {
                const total = stockTypes.reduce((acc, curr) => acc + curr.value, 0);
                const percent = ((type.value / total) * 100).toFixed(0);
                return (
                  <div key={index} className="flex items-center justify-between group hover:bg-gray-50 p-1 rounded transition-colors">
                    <div className="flex items-center space-x-1.5 overflow-hidden">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="text-[8px] font-bold text-gray-500 uppercase truncate leading-none">{type.name}</span>
                    </div>
                    <span className="text-[8px] font-black text-[#2d808e] ml-1">{percent}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="bg-white rounded border border-gray-100 overflow-hidden flex flex-col">
          <div className="px-3 py-1.5 border-b border-gray-100 bg-[#fafbfc]">
             <h3 className="text-[10px] font-black text-[#2d808e] uppercase tracking-tighter">PR Approval</h3>
          </div>
          <div className="overflow-y-auto max-h-[160px]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/50 sticky top-0">
                <tr className="text-[8px] font-bold text-gray-400 uppercase border-b border-gray-50">
                  <th className="px-3 py-1.5 text-center">Date</th>
                  <th className="px-3 py-1.5 text-center">Ref.No</th>
                  <th className="px-3 py-1.5 text-right">Value</th>
                </tr>
              </thead>
              <tbody className="text-[9px] font-medium text-gray-600">
                {pendingPrs.map((pr) => (
                  <tr key={pr.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                    <td className="px-3 py-1.5 text-center">{new Date(pr.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                    <td className="px-3 py-1.5 text-center">
                      <button onClick={() => onPreviewPr(pr)} className="text-blue-500 font-bold border border-blue-50 rounded px-1.5 py-0.5 hover:bg-blue-50 transition-all">{pr.pr_no}</button>
                    </td>
                    <td className="px-3 py-1.5 text-right font-black">{(pr.total_value || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded border border-gray-100 overflow-hidden flex flex-col">
          <div className="px-3 py-1.5 border-b border-gray-100 bg-[#fafbfc]">
             <h3 className="text-[10px] font-black text-[#2d808e] uppercase tracking-tighter">PO Approval</h3>
          </div>
          <div className="overflow-y-auto max-h-[160px]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/50 sticky top-0">
                <tr className="text-[8px] font-bold text-gray-400 uppercase border-b border-gray-50">
                  <th className="px-3 py-1.5 text-center">Date</th>
                  <th className="px-3 py-1.5 text-center">Ref.No</th>
                  <th className="px-3 py-1.5 text-right">Value</th>
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
          <div className="px-3 py-1.5 border-b border-gray-100 bg-[#fafbfc]">
             <h3 className="text-[10px] font-black text-[#2d808e] uppercase tracking-tighter">MO Approval</h3>
          </div>
          <div className="overflow-y-auto max-h-[160px]">
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

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Session Authenticated', desc: 'Secure node link established.', time: 'Just now', unread: true },
    { id: 2, title: 'Approval Required', desc: 'PR-2000000018 waiting for signature.', time: '12m ago', unread: true },
    { id: 3, title: 'Database Sync', desc: 'Master SKU list updated (124 items).', time: '1h ago', unread: false }
  ]);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

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

      {/* LEFT SIDEBAR - COMPACT */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 transform md:relative md:translate-x-0 transition-all duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0 w-[170px]' : '-translate-x-full md:translate-x-0'}
        ${isSidebarCollapsed && !isMobileMenuOpen ? 'md:w-10' : 'md:w-[170px]'}
        bg-white border-r border-gray-100 flex flex-col h-full shadow-sm shrink-0
      `}>
        <div className="flex justify-end items-center px-3 border-b border-gray-50 shrink-0 h-10">
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-1 text-gray-400 hover:text-gray-600 focus:outline-none">
            <X size={14} />
          </button>
        </div>

        <div className={`pt-3 pb-2 px-2 flex flex-col items-center space-y-2 shrink-0 ${isSidebarCollapsed && !isMobileMenuOpen ? 'md:px-0.5' : ''}`}>
          <div className={`${isSidebarCollapsed && !isMobileMenuOpen ? 'w-6 h-6' : 'w-12 h-12'} rounded-full bg-[#eef6f7] flex items-center justify-center transition-all duration-500 shadow-inner border border-white ring-1 ring-[#eef6f7]/50`}>
            <UserIcon size={isSidebarCollapsed && !isMobileMenuOpen ? 12 : 20} className="text-[#2d808e]" strokeWidth={1.5} />
          </div>
          {(!isSidebarCollapsed || isMobileMenuOpen) && (
            <div className="text-center overflow-hidden w-full space-y-0.5">
              <span className="text-[10px] font-black text-gray-800 block truncate uppercase tracking-tight">
                {user?.fullName || 'SYSTEM ADMIN'}
              </span>
              <span className="text-[7px] text-gray-400 font-bold uppercase tracking-widest block">
                {user?.role || 'ADMINISTRATOR'}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 py-1 overflow-y-auto overflow-x-hidden space-y-0.5 scrollbar-thin">
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

        <div className="p-1 border-t border-gray-50 shrink-0">
          <button 
            onClick={logout}
            className={`w-full flex items-center ${isSidebarCollapsed && !isMobileMenuOpen ? 'justify-center' : 'space-x-1.5 px-2'} py-1.5 text-red-500 hover:bg-red-50 transition-all rounded group`}
          >
            <LogOutIcon size={14} className="group-hover:scale-110 transition-transform" />
            {(!isSidebarCollapsed || isMobileMenuOpen) && <span className="text-[9px] font-black uppercase tracking-widest">Exit</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* ULTRA COMPACT HEADER: h-9 md:h-10 */}
        <header className="h-9 md:h-10 bg-white border-b border-gray-100 flex items-center justify-between px-3 md:px-5 z-30 shrink-0 relative">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => window.innerWidth < 768 ? setIsMobileMenuOpen(true) : setIsSidebarCollapsed(!isSidebarCollapsed)} 
              className="p-1 hover:bg-[#eef6f7] rounded-md transition-all text-[#2d808e] focus:outline-none"
            >
              <Menu size={16} />
            </button>
            <div 
              onClick={() => handleNav('/overview')} 
              className="text-sm font-black text-gray-800 tracking-tighter hover:text-[#2d808e] transition-colors cursor-pointer select-none"
            >
              ALIGN
            </div>
          </div>

          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-full max-w-[280px]">
            <div className="relative w-full group">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#2d808e] transition-colors" />
              <input 
                type="text" 
                placeholder="Terminal Search..." 
                className="w-full pl-8 pr-2.5 py-1 bg-gray-50 border border-transparent focus:border-[#2d808e]/20 focus:bg-white rounded-md outline-none text-[9px] font-bold text-gray-600 transition-all shadow-inner" 
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
             <button 
              onClick={() => setIsNotificationOpen(true)}
              className="p-1 text-gray-400 hover:text-[#2d808e] bg-gray-50 rounded-md transition-all relative"
             >
               <Bell size={14} />
               {notifications.some(n => n.unread) && (
                 <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full border-2 border-white"></span>
               )}
             </button>
             <div className="w-px h-4 bg-gray-100"></div>
             <div className="flex items-center pl-0.5">
                <button 
                  onClick={() => setIsProfileOpen(true)}
                  className="w-7 h-7 rounded-md bg-[#eef6f7] flex items-center justify-center border border-white shadow-sm ring-1 ring-[#eef6f7] hover:ring-[#2d808e] transition-all overflow-hidden"
                >
                  <UserIcon size={14} className="text-[#2d808e]" />
                </button>
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-3 md:p-5 bg-[#f8fafb] pb-6">
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

        {/* ULTRA COMPACT FOOTER: h-7 */}
        <footer className="h-7 border-t border-gray-50 flex items-center justify-center bg-white/90 backdrop-blur px-5 shrink-0 sticky bottom-0 z-20">
           <div className="text-[7px] font-black uppercase tracking-[0.4em] text-gray-300">
             &copy; 2026 ALIGN Proprietary Node
           </div>
        </footer>
      </div>

      <MoveOrderModal isOpen={isMoveOrderModalOpen} onClose={() => setIsMoveOrderModalOpen(false)} />
      <StockStatusModal isOpen={isStockStatusModalOpen} onClose={() => setIsStockStatusModalOpen(false)} />
      {previewPr && <PRPreviewModal pr={previewPr} onClose={() => setPreviewPr(null)} />}
      {previewPo && <POPreviewModal po={previewPo} onClose={() => { setPreviewPo(null); }} />}

      {/* Notifications Modal - Dynamic Reader */}
      {isNotificationOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-black text-gray-800 uppercase tracking-tight text-[11px]">Recent Terminal Logs</h3>
              <button onClick={() => setIsNotificationOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
            <div className="max-h-[350px] overflow-y-auto p-2 space-y-1">
              {notifications.map(n => (
                <div key={n.id} className={`p-3 border rounded-lg transition-all ${n.unread ? 'bg-[#eef6f7] border-[#2d808e]/10' : 'bg-white border-gray-50'}`}>
                  <div className="flex justify-between items-start">
                    <p className="text-[10px] font-black text-gray-800 uppercase">{n.title}</p>
                    <span className="text-[7px] text-gray-400 font-bold uppercase">{n.time}</span>
                  </div>
                  <p className="text-[9px] text-gray-500 mt-1 leading-tight">{n.desc}</p>
                </div>
              ))}
            </div>
            <div className="p-3 bg-white border-t border-gray-50 flex items-center justify-between">
              <button onClick={markAllRead} className="text-[8px] font-black text-[#2d808e] uppercase tracking-widest hover:underline flex items-center gap-1">
                <CheckCircle2 size={10} />
                Mark all as read
              </button>
              <button onClick={() => setIsNotificationOpen(false)} className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#2d808e] p-6 text-center relative">
              <button onClick={() => setIsProfileOpen(false)} className="absolute top-3 right-3 text-white/60 hover:text-white transition-colors">
                <X size={18} />
              </button>
              <div className="w-16 h-16 bg-white/20 rounded-2xl mx-auto flex items-center justify-center border border-white/30 backdrop-blur shadow-xl mb-3">
                <UserIcon size={28} className="text-white" />
              </div>
              <h3 className="text-white font-black text-lg tracking-tight uppercase leading-none">{user?.fullName || 'System Administrator'}</h3>
              <p className="text-white/60 text-[8px] font-bold uppercase tracking-widest mt-1">Node ID: {user?.id?.substring(0, 8) || 'N/A'}</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-3 group">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:border-[#2d808e]/30 transition-all">
                  <Briefcase size={14} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Designation</p>
                  <p className="text-xs font-bold text-gray-700">{user?.role || 'Administrator'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 group">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:border-[#2d808e]/30 transition-all">
                  <Mail size={14} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Email Node</p>
                  <p className="text-xs font-bold text-gray-700">{user?.email || 'identity@fairtechnology.com'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 group">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:border-[#2d808e]/30 transition-all">
                  <Phone size={14} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Contact Terminal</p>
                  <p className="text-xs font-bold text-gray-700">{user?.lastLogin ? 'Internal Node Connected' : '+880 1XXX-XXXXXX'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 group">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:border-[#2d808e]/30 transition-all">
                  <IdCard size={14} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Unique ID</p>
                  <p className="text-xs font-bold text-gray-700">{user?.id || 'PROPRIETARY-ID'}</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-center">
               <button onClick={logout} className="w-full py-2.5 bg-white text-red-600 border border-red-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2 shadow-sm">
                 <LogOutIcon size={12} />
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
        @keyframes wave-slow {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
        .animate-wave {
          animation: wave 3s linear infinite;
        }
        .animate-wave-slow {
          animation: wave-slow 6s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
