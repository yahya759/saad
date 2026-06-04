import React from 'react';
import SawaedLogo from '../assets/images/sawaed_logo_1780477096183.png';
import { 
  BarChart3, 
  Settings, 
  CookingPot, 
  ClipboardList, 
  Users, 
  Package,
  LayoutDashboard,
  Coins,
  Inbox,
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingRequestsCount: number;
  internalRequestsCount?: number;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  pendingRequestsCount,
  internalRequestsCount = 0,
  isOpen = false,
  onClose
}) => {
  const menuItems = [
    { id: 'dashboard',          label: 'الرئيسية',           icon: LayoutDashboard, badge: null },
    { id: 'inventory',          label: 'المخزون المركزي',     icon: Package,         badge: null },
    { id: 'kitchens',           label: 'إدارة التكيات',       icon: CookingPot,      badge: null },
    { id: 'requests',           label: 'طلبات التموين',       icon: ClipboardList,   badge: pendingRequestsCount > 0 ? `${pendingRequestsCount}` : null },
    { id: 'internal-requests',  label: 'الطلبات الداخلية',    icon: Inbox,           badge: internalRequestsCount > 0 ? `${internalRequestsCount}` : null },
    { id: 'expenses',           label: 'المصروفات الجانبية',  icon: Coins,           badge: null },
    { id: 'employees',          label: 'إدارة الموظفين',      icon: Users,           badge: null },
    { id: 'reports',            label: 'التقارير والإحصاء',   icon: BarChart3,       badge: null },
  ];

  const generalItems = [
    { id: 'settings', label: 'الصلاحيات والإيجاز', icon: Settings },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (onClose) {
      onClose();
    }
  };

  const sidebarContent = (
    <div 
      className="w-68 bg-white flex flex-col justify-between p-5 min-h-screen select-none relative shadow-sm border-l border-slate-200"
    >
      {/* Brand & Logo block */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <img 
              src={SawaedLogo} 
              alt="شعار سواعد الخير للإغاثة والتنمية" 
              className="w-12 h-12 object-contain rounded-full border border-slate-100 shadow-sm"
              referrerPolicy="no-referrer"
            />
            <div>
              <span className="font-extrabold text-[16px] tracking-tight text-slate-800 block leading-tight">سواعد الخير</span>
              <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block tracking-wide">للإغاثة والتنمية</span>
            </div>
          </div>
          
          {/* Close button for mobile */}
          {onClose && (
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-slate-100 rounded-lg lg:hidden text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              title="إغلاق القائمة"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation lists */}
        <div className="space-y-6">
          <div>
            <span className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase pr-1">بوابات النظام</span>
            <ul className="mt-3.5 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleTabClick(item.id)}
                      className={`w-full flex items-center justify-between py-2.5 px-3.5 rounded-xl transition-all relative cursor-pointer ${
                        isActive 
                          ? 'text-emerald-800 bg-emerald-50/70 font-semibold shadow-2xs border border-emerald-100/30' 
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
                      }`}
                    >
                      {/* Active green indicator line on the RIGHT side of the block for RTL */}
                      {isActive && (
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 w-[4px] h-[22px] bg-emerald-700 rounded-l-lg" />
                      )}
                      
                      <div className="flex items-center gap-3">
                        <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                        <span className="text-sm font-bold">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span className="bg-rose-500 text-white text-[9.5px] font-extrabold px-2 py-0.5 rounded-md min-w-5 text-center shadow-xs">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <span className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase pr-1">الإدارة العامة</span>
            <ul className="mt-3.5 space-y-1 columns-1">
              {generalItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleTabClick(item.id)}
                      className={`w-full flex items-center gap-3 py-2.5 px-3.5 rounded-xl transition-all cursor-pointer ${
                        isActive 
                          ? 'text-emerald-800 bg-emerald-50/60 font-semibold'
                          : 'text-slate-500 hover:text-slate-850 hover:bg-slate-50/50'
                      }`}
                    >
                      <Icon className="w-[18px] h-[18px] text-slate-400" />
                      <span className="text-sm font-bold">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0 relative z-10 w-68">
        {sidebarContent}
      </div>

      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-2xs z-40 transition-opacity"
        />
      )}

      {/* Mobile Sidebar Slide Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 transform lg:hidden transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};
