import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Employee, Kitchen, MealDistribution } from '../types';
import { Avatar } from './Avatar';

interface BottomGridProps {
  members: Employee[];
  onAddMemberClick: () => void;
  onRemoveMember: (id: string) => void;
  kitchens: Kitchen[];
  mealDistributions: MealDistribution[];
}

// Helper: polar to cartesian for SVG arc
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 180) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

// Draw arc path for a semi-circle gauge (180° total, left→right)
function arcPath(cx: number, cy: number, r: number, startPct: number, endPct: number) {
  const startAngle = startPct * 180;
  const endAngle   = endPct   * 180;
  const s = polarToCartesian(cx, cy, r, startAngle);
  const e = polarToCartesian(cx, cy, r, endAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

export const BottomGrid: React.FC<BottomGridProps> = ({
  members, onAddMemberClick, onRemoveMember, kitchens, mealDistributions,
}) => {
  // ---- حسابات حقيقية ----
  const today = new Date().toISOString().split('T')[0];
  const todayMeals = mealDistributions
    .filter(d => d.distributionDate === today)
    .reduce((s, d) => s + d.mealsCount, 0);

  const totalDailyGoal = kitchens.reduce((s, k) => s + k.dailyMealsGoal, 0);

  // نسبة الموزّع اليوم (تم التوزيع)
  const distributedPct = totalDailyGoal > 0
    ? Math.min(1, todayMeals / totalDailyGoal)
    : 0;

  // نسبة قيد الطبخ = currentMealsToday في التكيات (طُهي لكن لم يُوزّع بعد)
  const cookingMeals = kitchens.reduce((s, k) => s + k.currentMealsToday, 0);
  const cookingPct = totalDailyGoal > 0
    ? Math.min(1 - distributedPct, cookingMeals / totalDailyGoal)
    : 0;

  const displayPct = Math.round(distributedPct * 100);

  // SVG gauge params
  const cx = 50, cy = 50, r = 38, sw = 13;
  const bgPath   = arcPath(cx, cy, r, 0, 1);                                   // كامل الخلفية
  const distPath = arcPath(cx, cy, r, 0, distributedPct);                      // تم التوزيع
  const cookPath = arcPath(cx, cy, r, distributedPct, distributedPct + cookingPct); // قيد الطبخ

  return (
    <div id="team-progress-grid" dir="rtl" className="grid grid-cols-1 md:grid-cols-5 gap-4.5">

      {/* 1. قائمة الكادر */}
      <div className="md:col-span-3 bg-white border border-slate-200/60 shadow-xs rounded-2.5xl p-5 flex flex-col justify-between min-h-[320px]">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-[14.5px] text-slate-800 tracking-wide">الكوادر المناوبة بالتكيات</h3>
              <p className="text-[10px] text-slate-400 font-bold -mt-0.5">الطهاة والمنسقين الميدانيين الفاعلين حالياً</p>
            </div>
            <button
              onClick={onAddMemberClick}
              className="flex items-center gap-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-extrabold text-[10.5px] px-3 py-1.5 rounded-full shadow-2xs cursor-pointer transition-all"
            >
              <Plus className="w-3 h-3 text-emerald-700 stroke-[3]" />
              <span>تسجيل كادر/متطوع</span>
            </button>
          </div>

          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-0.5 pl-1">
            {members.map((member) => (
              <div key={member.id} className="group flex items-center justify-between p-2 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-3">
                  <Avatar seed={member.avatarSeed} size={36} className="shadow-2xs" />
                  <div className="text-right">
                    <h4 className="text-[12.5px] font-extrabold text-slate-800 leading-snug">{member.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold">{member.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => onRemoveMember(member.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {members.length === 0 && (
              <div className="text-center py-10 text-slate-400 text-xs font-bold">لا يوجد كادر مسجل حالياً.</div>
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-bold">
          * إجمالي الكادر: {members.length} موظف في {kitchens.length} تكية
        </div>
      </div>

      {/* 2. Gauge ديناميكي */}
      <div className="md:col-span-2 bg-white border border-slate-200/60 shadow-xs rounded-2.5xl p-5 flex flex-col justify-between min-h-[320px]">
        <div>
          <h3 className="font-extrabold text-[14.5px] text-slate-800 tracking-wide mb-0.5">معدل خدمة الوجبات اليومية</h3>
          <p className="text-[10px] text-slate-400 font-bold pb-2">نسبة ما تم إنجازه وتوزيعه من المستهدف اليومي العام</p>
        </div>

        <div className="relative flex-1 flex flex-col items-center justify-center -mt-2">
          <div className="relative w-48 h-28 flex items-end justify-center overflow-hidden">
            <svg viewBox="0 0 100 55" className="w-48 h-28 absolute bottom-0 left-0">
              <defs>
                <pattern id="gauge-stripes" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <line x1="0" y1="0" x2="0" y2="6" stroke="#e2e8f0" strokeWidth="3" />
                  <line x1="0" y1="0" x2="0" y2="6" stroke="#f8fafc" strokeWidth="4" />
                </pattern>
              </defs>

              {/* خلفية الـ gauge - مواد خام */}
              {totalDailyGoal > 0 ? (
                <path d={bgPath} fill="none" stroke="url(#gauge-stripes)" strokeWidth={sw} strokeLinecap="round" />
              ) : (
                <path d={arcPath(cx, cy, r, 0, 1)} fill="none" stroke="#f1f5f9" strokeWidth={sw} strokeLinecap="round" />
              )}

              {/* قيد الطبخ */}
              {cookingPct > 0.01 && (
                <path d={cookPath} fill="none" stroke="#4ade80" strokeWidth={sw} strokeLinecap="round" />
              )}

              {/* تم التوزيع */}
              {distributedPct > 0.01 && (
                <path d={distPath} fill="none" stroke="#15803d" strokeWidth={sw} strokeLinecap="round" />
              )}
            </svg>

            <div className="relative z-10 flex flex-col items-center pb-1">
              <span className="text-3xl font-black text-slate-800 leading-none">{displayPct}٪</span>
              <span className="text-[10px] font-extrabold text-slate-500 mt-1.5 tracking-wider">
                {totalDailyGoal > 0 ? `${todayMeals.toLocaleString('ar-SA')} من ${totalDailyGoal.toLocaleString('ar-SA')}` : 'لم يُحدَّد هدف'}
              </span>
            </div>
          </div>

          {totalDailyGoal === 0 && (
            <p className="text-[10px] text-slate-400 font-bold text-center mt-2">
              أضف تكية وحدد هدفها اليومي لتفعيل المقياس
            </p>
          )}
        </div>

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
            <span className="w-2.5 h-2.5 rounded-full bg-slate-200 border border-slate-300" />
            <span className="text-slate-500">مواد خام</span>
          </div>
        </div>
      </div>
    </div>
  );
};

