import React from 'react';
import { MoreHorizontal, Plus, MoveDown, MoveUp, ArrowLeftRight } from 'lucide-react';
import { InventoryLog, MealDistribution, Kitchen } from '../types';
import { MealDistributionLog } from './MealDistributionLog';

interface ChartsAndRemindersProps {
  logs: InventoryLog[];
  onAddLog: () => void;
  mealDistributions: MealDistribution[];
  setMealDistributions: React.Dispatch<React.SetStateAction<MealDistribution[]>>;
  kitchens: Kitchen[];
}

export const ChartsAndReminders: React.FC<ChartsAndRemindersProps> = ({
  logs, onAddLog, mealDistributions, setMealDistributions, kitchens
}) => {
  // Build weekly chart from real data
  const today = new Date();
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    const dayNames = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
    const total = mealDistributions
      .filter(d => d.distributionDate === dateStr)
      .reduce((s, d) => s + d.mealsCount, 0);
    return { dateStr, label: dayNames[date.getDay()], total, isToday: i === 6 };
  });
  const weekMax = Math.max(...weeklyData.map(d => d.total), 1);
  const todayTotal = weeklyData[6].total;
  const peakDay = weeklyData.reduce((a, b) => b.total > a.total ? b : a);

  return (
    <div id="analytics-reminders-grid" dir="rtl" className="grid grid-cols-1 md:grid-cols-5 gap-4.5 mb-4.5">
      
      {/* 1. Weekly Meals distribution bar chart (Spans 3 cols) */}
      <div className="md:col-span-3 bg-white border border-slate-200/60 shadow-xs rounded-2.5xl p-5 flex flex-col justify-between min-h-[305px]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-extrabold text-[14.5px] text-slate-800 tracking-wide">النشاط الأسبوعي لتوزيع الوجبات</h3>
            <p className="text-[10px] text-slate-400 font-bold -mt-0.5">
              {todayTotal > 0
                ? `اليوم: ${todayTotal.toLocaleString('ar-SA')} وجبة موزّعة`
                : 'لا توجد توزيعات مسجلة اليوم بعد'}
            </p>
          </div>
          <button className="text-slate-400 hover:text-slate-600 transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Bar Chart from real data */}
        <div className="flex-1 flex items-end justify-between h-42 px-1 pb-1 relative">
          {weeklyData.map((day, idx) => {
            const heightPct = day.total ? Math.max(8, (day.total / weekMax) * 100) : 3;
            const isPeak = day.dateStr === peakDay.dateStr && day.total > 0;
            return (
              <div key={idx} className="flex flex-col items-center flex-1 h-full min-w-8 group relative justify-end">
                {isPeak && day.total > 0 && (
                  <div className="absolute top-[-10px] bg-emerald-800 text-white text-[9.5px] font-black px-2 py-0.5 rounded-md shadow-sm border border-emerald-600 flex flex-col items-center z-10 font-sans">
                    <span>{day.total.toLocaleString('ar-SA')} وجبة</span>
                    <div className="w-1.5 h-1.5 bg-emerald-800 rotate-45 -mb-1 mt-0.5" />
                  </div>
                )}
                <div
                  style={{ height: `${heightPct}%` }}
                  className={`w-6 sm:w-10 rounded-full transition-all duration-300 group-hover:scale-x-105 group-hover:brightness-95 ${
                    day.total === 0
                      ? 'bg-slate-100'
                      : day.isToday
                        ? 'bg-emerald-500'
                        : isPeak
                          ? 'bg-emerald-900'
                          : 'bg-emerald-700'
                  }`}
                  title={`${day.label}: ${day.total} وجبة`}
                >
                  {isPeak && day.total > 0 && (
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white opacity-80" />
                  )}
                </div>
                <span className="text-[10.5px] font-extrabold text-slate-400 mt-2.5 font-sans whitespace-nowrap">{day.label}</span>
              </div>
            );
          })}
        </div>

        {/* No data hint */}
        {mealDistributions.length === 0 && (
          <p className="text-center text-xs text-slate-400 font-bold mt-2">
            سجّل أول توزيع من قسم "سجل التوزيع" لتظهر البيانات هنا
          </p>
        )}
      </div>

      {/* 2. Warehouse Transactions Log ledger (Spans 2 cols) */}
      <div className="md:col-span-2 bg-white border border-slate-200/60 shadow-xs rounded-2.5xl p-5 flex flex-col justify-between min-h-[305px]">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-extrabold text-[14.5px] text-slate-800 tracking-wide">حركة المخزن المركزية</h3>
              <p className="text-[10.5px] text-slate-400 font-bold -mt-0.5">سجل التدقيق للأصناف الصادرة والواردة حالاً</p>
            </div>
            <button
              onClick={onAddLog}
              className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-black text-[9.5px] px-2.5 py-1.5 rounded-md shadow-2xs cursor-pointer transition-all"
            >
              <Plus className="w-2.5 h-2.5 stroke-[3]" />
              <span>تسجيل حركة</span>
            </button>
          </div>
        </div>

        <div className="my-3 flex-1 flex flex-col justify-start space-y-2.5 pr-0.5 max-h-[175px] overflow-y-auto">
          {logs.slice(0, 4).map((log) => {
            const isImport = log.type === 'إضافة';
            const isExport = log.type === 'صرف';
            return (
              <div key={log.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100/40 text-right text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shadow-3xs ${
                    isImport ? 'bg-emerald-100 text-emerald-850' : isExport ? 'bg-rose-100/70 text-rose-700' : 'bg-teal-100/60 text-teal-800'
                  }`}>
                    {isImport ? <MoveDown className="w-3.5 h-3.5" /> : isExport ? <MoveUp className="w-3.5 h-3.5" /> : <ArrowLeftRight className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <h5 className="font-extrabold text-slate-800 leading-none">{log.productName}</h5>
                    <p className="text-[9px] text-slate-400 mt-1">مشغل: {log.user} | {log.date}</p>
                  </div>
                </div>
                <div className="text-left">
                  <span className={`font-black tracking-tight ${isImport ? 'text-emerald-700' : 'text-slate-700'}`}>
                    {isImport ? '+' : '-'} {log.quantity} {log.unit}
                  </span>
                  {log.destination && (
                    <p className="text-[9px] text-slate-400 font-bold truncate max-w-[80px]">{log.destination}</p>
                  )}
                </div>
              </div>
            );
          })}
          {logs.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-xs font-bold">لا يوجد حركات مخزنية مسجلة حتى الآن.</div>
          )}
        </div>

        <div className="text-[9px] text-slate-400 text-center font-bold">
          * يتم تحديث الكميات في سجل المخزون الموحد فور تأكيد أي حركة.
        </div>
      </div>

      {/* 3. Meal Distribution Log — full width */}
      <div className="md:col-span-5 bg-white border border-slate-200/60 shadow-xs rounded-2.5xl p-5">
        <MealDistributionLog
          distributions={mealDistributions}
          setDistributions={setMealDistributions}
          kitchens={kitchens}
        />
      </div>

    </div>
  );
};
