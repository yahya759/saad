import React from 'react';
import { Plus, UserMinus, CookingPot, Leaf, ArrowUpRight } from 'lucide-react';
import { Employee } from '../types';
import { Avatar } from './Avatar';

interface BottomGridProps {
  members: Employee[];
  onAddMemberClick: () => void;
  onRemoveMember: (id: string) => void;
  percentageAchievements: number;
}

export const BottomGrid: React.FC<BottomGridProps> = ({
  members,
  onAddMemberClick,
  onRemoveMember,
  percentageAchievements = 41
}) => {
  return (
    <div id="team-progress-grid" dir="rtl" className="grid grid-cols-1 md:grid-cols-5 gap-4.5">
      
      {/* 1. Team staffing listing (Spans 3 cols) */}
      <div className="md:col-span-3 bg-white border border-slate-200/60 shadow-xs rounded-2.5xl p-5 flex flex-col justify-between min-h-[320px]">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-[14.5px] text-slate-800 tracking-wide">الكوادر المناوبة بالتكيات</h3>
              <p className="text-[10px] text-slate-400 font-bold -mt-0.5">الطهاة والمنسقين الميدانيين الفاعلين حالياً</p>
            </div>
            
            <button
              onClick={onAddMemberClick}
              className="flex items-center gap-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-extrabold text-[10.5px] px-3 py-1.5 rounded-full shadow-2xs hover:shadow-xs cursor-pointer transition-all"
            >
              <Plus className="w-3 h-3 text-emerald-700 stroke-[3]" />
              <span>تسجيل كادر/متطوع</span>
            </button>
          </div>

          {/* Members Feed */}
          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-0.5 pl-1">
            {members.map((member) => (
              <div
                key={member.id}
                className="group flex items-center justify-between p-2 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <Avatar seed={member.avatarSeed} size={36} className="shadow-2xs" />
                  <div className="text-right">
                    <h4 className="text-[12.5px] font-black text-slate-800 leading-tight">
                      {member.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-bold">
                      الدور بالتكيات: <span className="text-emerald-800 font-extrabold">{member.role}</span> | {member.phone}
                    </p>
                  </div>
                </div>

                {/* Remove Volunteer trigger */}
                <button
                  onClick={() => onRemoveMember(member.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 cursor-pointer transition-all"
                  title={`إلغاء تسجيل ${member.name}`}
                >
                  <UserMinus className="w-4 h-4" />
                </button>
              </div>
            ))}

            {members.length === 0 && (
              <div className="text-center py-10 text-slate-400 text-xs font-bold leading-normal">
                لا يوجد موظفين مسجلين في الوردية الفعالة.<br />انقر على "تسجيل كادر" للبدء بالوردية.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Semicircular Target Achievements gauge widget (Spans 2 cols) */}
      <div className="md:col-span-2 bg-white border border-slate-200/60 shadow-xs rounded-2.5xl p-5 flex flex-col justify-between min-h-[320px]">
        <div>
          <h3 className="font-extrabold text-[14.5px] text-slate-800 tracking-wide mb-0.5">معدل خدمة الوجبات اليومية</h3>
          <p className="text-[10px] text-slate-400 font-bold pb-2">نسبة ما تم إنجازه وتوزيعه من المستهدف اليومي العام</p>
        </div>

        {/* Semi-circular gauge chart drawn precisely to match requested pixel look */}
        <div className="relative flex-1 flex flex-col items-center justify-center -mt-3">
          
          <div className="relative w-44 h-24 mb-1.5 flex items-end justify-center overflow-hidden">
            {/* SVG Arc Progress Gauge with proper calculations */}
            <svg viewBox="0 0 100 50" className="w-44 h-24 absolute bottom-0 left-0 rotate-180">
              <defs>
                {/* Stripe pattern for Pending slice */}
                <pattern id="gauge-stripes-charity" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <line x1="0" y1="0" x2="0" y2="8" stroke="#cbd5e1" strokeWidth="3.5" />
                  <line x1="0" y1="0" x2="0" y2="8" stroke="#f1f5f9" strokeWidth="5" />
                </pattern>
              </defs>

              {/* Entire Arc background (striped representing Remaining raw ingredient phase) */}
              <path 
                d="M 10 50 A 40 40 0 0 1 90 50" 
                fill="none" 
                stroke="url(#gauge-stripes-charity)" 
                strokeWidth="13" 
                strokeLinecap="round" 
              />

              {/* Wedge 1: Fully Finished Meals distributed portion (Up to 41% in light green/emerald) */}
              <path 
                d="M 10 50 A 40 40 0 0 1 48 14" 
                fill="none" 
                stroke="#15803d" 
                strokeWidth="13" 
                strokeLinecap="round" 
              />

              {/* Wedge 2: Active Cooking process portion (Extends to 65% in dark teal) */}
              <path 
                d="M 48 14 A 40 40 0 0 1 65 19" 
                fill="none" 
                stroke="#4ade80" 
                strokeWidth="13" 
                strokeLinecap="round" 
              />
            </svg>

            {/* Indicator overlay */}
            <div className="relative z-10 flex flex-col items-center pb-1">
              <span className="text-3xl font-black text-slate-800 leading-none">{percentageAchievements}٪</span>
              <span className="text-[10px] font-extrabold text-[#475569] mt-1.5 tracking-wider uppercase">حصص الطعام الجاهزة</span>
            </div>
          </div>
        </div>

        {/* Legend block in Arabic */}
        <div className="flex items-center justify-between px-0.5 border-t border-slate-100 pt-3 text-[10px] font-bold">
          
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#15803d]" />
            <span className="text-slate-500">تم التوزيع</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4ade80]" />
            <span className="text-slate-500">قيد الطبخ</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-striped border border-slate-200" />
            <span className="text-slate-500">مواد خام</span>
          </div>

        </div>
      </div>
    </div>
  );
};
