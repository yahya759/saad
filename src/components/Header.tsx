import React from 'react';
import { Avatar } from './Avatar';
import { EmployeeRole } from '../types';
import { Menu } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentRole: EmployeeRole;
  setCurrentRole: (role: EmployeeRole) => void;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  currentRole,
  setCurrentRole,
  onToggleSidebar
}) => {
  // Profiles mapped for each role simulator - Amr's profile
  const currentProfile = { 
    name: 'عمرو فريد جودة', 
    avatar: 'yousef' // professional avatar seed
  };

  return (
    <div 
      id="dashboard-header" 
      dir="rtl"
      className="flex flex-row items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-200/50"
    >
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onToggleSidebar}
          className="p-2 -mr-1 hover:bg-slate-100 rounded-lg lg:hidden transition-colors cursor-pointer text-slate-600 block"
          title="افتح القائمة"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <Avatar seed={currentProfile.avatar} size={38} className="ring-2 ring-emerald-500/10 shadow-sm" />
        <div className="text-right">
          <h5 className="text-[14px] font-black text-slate-800 leading-tight">
            {currentProfile.name}
          </h5>
        </div>
      </div>
      
      {/* Empty spacer so the rest of the layout balances perfectly */}
      <div className="hidden md:block text-xs text-slate-400 font-bold">
        سواعد الخير للإغاثة والتنمية • بوابة الإدارة اللوجستية
      </div>
    </div>
  );
};

