import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import UserManagement from './UserManagement';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Warehouse, 
  Box, 
  ChevronDown, 
  ChevronRight, 
  LogOut, 
  User as UserIcon,
  Search,
  ArrowRightLeft
} from 'lucide-react';

const SidebarItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean; 
  hasSubmenu?: boolean;
  isOpen?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}> = ({ icon, label, active, hasSubmenu, isOpen, onClick, children }) => {
  return (
    <div>
      <button
        onClick={onClick}
        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
          active ? 'text-[#2d808e] font-semibold' : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center space-x-3">
          {icon}
          <span>{label}</span>
        </div>
        {hasSubmenu && (isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
      </button>
      {isOpen && children && <div className="pl-12 py-1 space-y-1">{children}</div>}
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { user, logout, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users'>('overview');
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    purchase: true,
    warehouse: false,
    itemMaster: false
  });

  const toggleMenu = (menu: string) => {
    setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-[#f1f3f4] overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full overflow-y-auto">
        <div className="p-6 flex flex-col items-center border-b border-gray-100">
          <div className="w-16 h-16 rounded-full bg-cyan-50 flex items-center justify-center border-2 border-[#2d808e] p-1 mb-3">
             <div className="w-full h-full rounded-full bg-cyan-100 flex items-center justify-center text-[#2d808e]">
                <UserIcon size={32} />
             </div>
          </div>
          <span className="text-xs font-semibold text-[#2d808e] mb-1">Md Azizul Hakim</span>
        </div>

        <nav className="flex-1 py-4">
          <SidebarItem 
            icon={<LayoutDashboard size={18} />} 
            label="Dashboard" 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')}
          />
          
          <SidebarItem 
            icon={<ShoppingCart size={18} />} 
            label="Purchase" 
            hasSubmenu 
            isOpen={openMenus.purchase}
            onClick={() => toggleMenu('purchase')}
          >
            <div className="text-xs text-gray-500 space-y-2.5">
              <p className="hover:text-[#2d808e] cursor-pointer flex items-center"><ArrowRightLeft size={12} className="mr-2"/> Requisition</p>
              <p className="hover:text-[#2d808e] cursor-pointer flex items-center"><ArrowRightLeft size={12} className="mr-2"/> Order</p>
              <p className="hover:text-[#2d808e] cursor-pointer flex items-center"><ArrowRightLeft size={12} className="mr-2"/> Supplier</p>
              <p className="hover:text-[#2d808e] cursor-pointer flex items-center"><ArrowRightLeft size={12} className="mr-2"/> Report</p>
            </div>
          </SidebarItem>

          <SidebarItem 
            icon={<Warehouse size={18} />} 
            label="Warehouse" 
            hasSubmenu 
            isOpen={openMenus.warehouse}
            onClick={() => toggleMenu('warehouse')}
          >
            <div className="text-xs text-gray-500 space-y-2.5">
              <p className="hover:text-[#2d808e] cursor-pointer">Inventory</p>
              <p className="hover:text-[#2d808e] cursor-pointer">Receive</p>
              <p className="hover:text-[#2d808e] cursor-pointer">Issue</p>
              <p className="hover:text-[#2d808e] cursor-pointer">Tnx-Report</p>
              <p className="hover:text-[#2d808e] cursor-pointer">MO-Report</p>
            </div>
          </SidebarItem>

          <SidebarItem 
            icon={<Box size={18} />} 
            label="Item Master" 
            hasSubmenu 
            isOpen={openMenus.itemMaster}
            onClick={() => toggleMenu('itemMaster')}
          >
            <div className="text-xs text-gray-500 space-y-2.5">
              <p className="hover:text-[#2d808e] cursor-pointer">Item List</p>
              <p className="hover:text-[#2d808e] cursor-pointer">Item Details</p>
            </div>
          </SidebarItem>

          {hasPermission('manage_users') && (
            <SidebarItem 
              icon={<UserIcon size={18} />} 
              label="User Management" 
              active={activeTab === 'users'} 
              onClick={() => setActiveTab('users')}
            />
          )}
        </nav>

        <div className="mt-auto border-t border-gray-100 py-4">
           <SidebarItem icon={<UserIcon size={18} />} label="Profile" />
           <SidebarItem icon={<LogOut size={18} />} label="Logout" onClick={logout} />
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-6">
        {activeTab === 'users' ? (
          <UserManagement />
        ) : (
          <div className="max-w-[1600px] mx-auto space-y-6">
            {/* Header Area */}
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-4">
                <button className="text-gray-600"><Search size={20} /></button>
                <h1 className="text-2xl font-bold text-gray-800 tracking-tight">ALIGN</h1>
              </div>
              <div className="flex items-center space-x-3">
                 <button className="flex items-center px-4 py-1.5 bg-[#2d808e] text-white text-xs font-medium rounded hover:bg-[#256b78] transition-colors">
                   <Box size={14} className="mr-2" /> Check Stock
                 </button>
                 <button className="flex items-center px-4 py-1.5 bg-[#17a2b8] text-white text-xs font-medium rounded hover:bg-[#138496] transition-colors">
                   <ArrowRightLeft size={14} className="mr-2" /> Move Order
                 </button>
              </div>
            </div>

            <div className="mb-4">
               <h2 className="text-xl font-bold text-gray-800">Hi, Md Azizul Hakim!</h2>
               <p className="text-xs text-gray-400">January 30, 2026 4:20 PM</p>
            </div>

            {/* Row 1: Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Today Order(Qty)', value: '0 (0)', color: 'text-red-500' },
                { label: 'Lastday Order(Qty)', value: '338.3K (380)', color: 'text-red-500' },
                { label: 'Weekly Order(Qty)', value: '1.2M (2.0K)', color: 'text-red-500' },
                { label: 'Monthly Order(Qty)', value: '5.7M (8.5K)', color: 'text-red-500' },
                { label: 'Weekly PR(Qty)', value: '94.0K (1.7K)', color: 'text-red-500' },
                { label: 'Monthly PR(Qty)', value: '578.2K (3.3K)', color: 'text-red-500' },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-4 rounded shadow-sm border border-gray-50 flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold text-gray-400 mb-2">{stat.label}</span>
                  <span className={`text-lg font-bold ${stat.color}`}>{stat.value}</span>
                </div>
              ))}
            </div>

            {/* Row 2: Tables and Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <div className="xl:col-span-3">
                <div className="bg-white p-5 rounded shadow-sm border border-gray-50 h-full">
                  <h3 className="text-sm font-bold text-[#2d808e] mb-4">PR Approval</h3>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-gray-400 border-b border-gray-50">
                        <th className="pb-2 text-left font-semibold">Date</th>
                        <th className="pb-2 text-left font-semibold">Ref.No</th>
                        <th className="pb-2 text-right font-semibold">Value</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600">
                      <tr>
                        <td className="py-3">24-Jan-26</td>
                        <td className="py-3 text-blue-500">3000000017</td>
                        <td className="py-3 text-right">18500</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="xl:col-span-4">
                <div className="bg-white p-5 rounded shadow-sm border border-gray-50 h-full">
                  <h3 className="text-sm font-bold text-[#2d808e] mb-6">Weekly Order</h3>
                  <div className="h-48 w-full flex items-end justify-between space-x-2">
                    {/* Mock Bars */}
                    {[15, 45, 10, 20, 100, 60, 5].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center">
                         <div style={{ height: `${h}%` }} className={`w-full ${i === 4 ? 'bg-[#0f172a]' : i === 5 ? 'bg-[#22d3ee]' : 'bg-[#ecfccb]'} rounded-sm relative group`}>
                            <div className="absolute -top-1 left-0 right-0 h-0.5 bg-orange-400 opacity-50"></div>
                         </div>
                         <span className="text-[8px] mt-2 text-gray-400">2{i+4}-Sat</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="xl:col-span-5">
                <div className="bg-white p-5 rounded shadow-sm border border-gray-50 h-full">
                  <h3 className="text-sm font-bold text-[#2d808e] mb-6">Monthly Order</h3>
                  <div className="h-48 w-full relative">
                    {/* Mock Line Chart SVG */}
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path d="M 0 5 L 10 90 L 100 90" fill="none" stroke="#22d3ee" strokeWidth="1" />
                      <circle cx="10" cy="5" r="1" fill="#22d3ee" />
                      {Array.from({length: 12}).map((_, i) => (
                        <circle key={i} cx={10 + i * 8} cy="90" r="1" fill="#22d3ee" />
                      ))}
                    </svg>
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[8px] text-gray-400">
                      {['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'].map(m => <span key={m}>{m}</span>)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 3: Gauges & Pie */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded shadow-sm border border-gray-50 flex flex-col items-center justify-center">
                 <h4 className="text-[10px] font-bold text-[#2d808e] uppercase mb-6 tracking-widest">DIESEL (4918)</h4>
                 <div className="relative w-40 h-40 rounded-full border-2 border-blue-500 p-1">
                    <div className="w-full h-full rounded-full bg-white relative overflow-hidden">
                       <div className="absolute bottom-0 left-0 right-0 bg-blue-500 h-[45%]" style={{borderRadius: '0 0 50% 50%'}}></div>
                       <div className="absolute inset-0 flex items-center justify-center font-bold text-xl text-[#2d808e] z-10">45 %</div>
                    </div>
                 </div>
              </div>
              <div className="bg-white p-8 rounded shadow-sm border border-gray-50 flex flex-col items-center justify-center">
                 <h4 className="text-[10px] font-bold text-[#2d808e] uppercase mb-6 tracking-widest">OCTANE (3141)</h4>
                 <div className="relative w-40 h-40 rounded-full border-2 border-blue-500 p-1">
                    <div className="w-full h-full rounded-full bg-white relative overflow-hidden">
                       <div className="absolute bottom-0 left-0 right-0 bg-blue-500 h-[57%]" style={{borderRadius: '0 0 50% 50%'}}></div>
                       <div className="absolute inset-0 flex items-center justify-center font-bold text-xl text-[#2d808e] z-10">57 %</div>
                    </div>
                 </div>
              </div>
              <div className="bg-white p-5 rounded shadow-sm border border-gray-50">
                 <div className="flex flex-col items-center">
                    <div className="relative w-48 h-48 mb-6">
                       <svg viewBox="0 0 36 36" className="w-full h-full">
                          <path className="text-blue-500" strokeDasharray="25, 100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          <path className="text-teal-400" strokeDasharray="15, 100" strokeDashoffset="-25" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          <path className="text-orange-400" strokeDasharray="10, 100" strokeDashoffset="-40" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          <path className="text-purple-400" strokeDasharray="20, 100" strokeDashoffset="-50" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          <path className="text-green-400" strokeDasharray="30, 100" strokeDashoffset="-70" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                       </svg>
                       <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-sm font-bold text-gray-800">Stock</span>
                          <span className="text-sm font-bold text-gray-800">Types</span>
                       </div>
                    </div>
                    <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-[8px] text-gray-500 uppercase font-semibold">
                       <div className="flex items-center"><span className="w-2 h-2 bg-blue-500 mr-1"></span> Uniform</div>
                       <div className="flex items-center"><span className="w-2 h-2 bg-teal-400 mr-1"></span> Machineries</div>
                       <div className="flex items-center"><span className="w-2 h-2 bg-orange-400 mr-1"></span> PPE</div>
                       <div className="flex items-center"><span className="w-2 h-2 bg-gray-400 mr-1"></span> Fixed Asset</div>
                       <div className="flex items-center"><span className="w-2 h-2 bg-purple-400 mr-1"></span> Tools & Equipment</div>
                       <div className="flex items-center"><span className="w-2 h-2 bg-blue-300 mr-1"></span> Consumables</div>
                       <div className="flex items-center"><span className="w-2 h-2 bg-green-400 mr-1"></span> Stationary</div>
                       <div className="flex items-center"><span className="w-2 h-2 bg-pink-400 mr-1"></span> Paint Sub-Materials</div>
                       <div className="flex items-center"><span className="w-2 h-2 bg-cyan-700 mr-1"></span> Spare Parts</div>
                    </div>
                 </div>
              </div>
            </div>

            {/* Row 4: Final Tables */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="bg-white p-5 rounded shadow-sm border border-gray-50">
                 <h3 className="text-sm font-bold text-[#2d808e] mb-4 uppercase tracking-wider">Latest orders</h3>
                 <div className="overflow-x-auto">
                    <table className="w-full text-[10px]">
                       <thead className="bg-gray-50 text-gray-400 uppercase">
                          <tr>
                             <th className="p-2 text-left">#</th>
                             <th className="p-2 text-left">Date</th>
                             <th className="p-2 text-left">Tnx.No</th>
                             <th className="p-2 text-left">Item Name</th>
                             <th className="p-2 text-right">Qty</th>
                             <th className="p-2 text-right">Value</th>
                          </tr>
                       </thead>
                       <tbody className="text-gray-600">
                          {[
                             { id: 10385, name: 'PAINT BODY(WHITE CREAM)TT6635 WC9(s),16L', qty: 32, val: 119187 },
                             { id: 10385, name: 'THINNER; 0608 ; 1L/PACK', qty: 20, val: 23442 },
                             { id: 10385, name: 'PLASTIC PRIMER (RP2143 WHITE) 16L', qty: 16, val: 39489 },
                             { id: 10384, name: 'DIESEL', qty: 20, val: 2034 },
                             { id: 10384, name: 'DIESEL', qty: 20, val: 2034 },
                             { id: 10384, name: 'DIESEL', qty: 20, val: 2034 },
                             { id: 10384, name: 'DIESEL', qty: 20, val: 2034 },
                             { id: 10383, name: 'A4 PAPER', qty: 3, val: 1545 },
                             { id: 10383, name: 'LAMINATING PAPER, A4', qty: 100, val: 76500 },
                             { id: 10382, name: 'BALL PEN', qty: 2, val: 9 }
                          ].map((item, idx) => (
                             <tr key={idx} className="border-b border-gray-50">
                                <td className="p-2">{idx+1}</td>
                                <td className="p-2">29-Jan-26</td>
                                <td className="p-2 text-blue-500">{item.id}</td>
                                <td className="p-2 uppercase">{item.name}</td>
                                <td className="p-2 text-right">{item.qty}</td>
                                <td className="p-2 text-right">{item.val}</td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>

              <div className="bg-white p-5 rounded shadow-sm border border-gray-50">
                 <h3 className="text-sm font-bold text-[#2d808e] mb-4 uppercase tracking-wider">Latest PR</h3>
                 <div className="overflow-x-auto">
                    <table className="w-full text-[10px]">
                       <thead className="bg-gray-50 text-gray-400 uppercase">
                          <tr>
                             <th className="p-2 text-left">#</th>
                             <th className="p-2 text-left">Date</th>
                             <th className="p-2 text-left">PR No</th>
                             <th className="p-2 text-left">Requested By</th>
                             <th className="p-2 text-right">Qty</th>
                             <th className="p-2 text-right">Value</th>
                          </tr>
                       </thead>
                       <tbody className="text-gray-600">
                          {[
                             { id: 3000000018, user: 'Sohel Rana', qty: 1702, val: 75465 },
                             { id: 3000000017, user: 'Md. Jahangir Alam', qty: 1, val: 18500 },
                             { id: 3000000016, user: 'Mr. Nahidul Hassan', qty: 10, val: 4995 },
                             { id: 3000000015, user: 'Md. Jahangir Alam', qty: 72, val: 188469 },
                             { id: 3000000014, user: 'Motiur Rahman Riat', qty: 17, val: 0 },
                             { id: 3000000013, user: 'Md. Jahangir Alam', qty: 5, val: 2500 },
                             { id: 3000000012, user: 'Md. Jahangir Alam', qty: 1145, val: 35920 },
                             { id: 3000000011, user: 'Moktadir', qty: 252, val: 96516 },
                             { id: 3000000010, user: 'Moktadir', qty: 2, val: 37800 },
                             { id: 3000000009, user: 'Mr Rajat Kumar', qty: 8, val: 102700 }
                          ].map((item, idx) => (
                             <tr key={idx} className="border-b border-gray-50">
                                <td className="p-2">{idx+1}</td>
                                <td className="p-2">26-Jan-26</td>
                                <td className="p-2 text-blue-500">{item.id}</td>
                                <td className="p-2">{item.user}</td>
                                <td className="p-2 text-right">{item.qty}</td>
                                <td className="p-2 text-right">{item.val}</td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
            </div>

            <footer className="text-center py-8 text-[10px] text-gray-400">
               All rights Reserved ©ALIGN 2026 | Developed by <span className="text-blue-400">Al Amin ET</span>
            </footer>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;