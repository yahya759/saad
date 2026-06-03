import React from 'react';
import { Plus, Trash2, CookingPot, MapPin } from 'lucide-react';
import { Kitchen } from '../types';

interface RightPanelProps {
  kitchens: Kitchen[];
  onAddKitchenClick: () => void;
  onRemoveKitchen: (id: string) => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  kitchens,
  onAddKitchenClick,
  onRemoveKitchen
}) => {
  return (
    <div id="right-column-container" dir="rtl" className="flex flex-col gap-4.5 h-full select-none text-right">
      
      {/* 1. Community Kitchens Listing (Takiya) */}
      <div className="bg-white border border-slate-200/60 shadow-xs rounded-2.5xl p-5 flex-1 flex flex-col justify-between min-h-[480px]">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-[14.5px] text-slate-800 tracking-wide">مطابخ وتكيات الغذاء</h3>
              <p className="text-[10px] text-slate-400 font-bold -mt-0.5">التوزيع الميداني لمراكز الطبخ والوجبات</p>
            </div>
            
            <button
              onClick={onAddKitchenClick}
              className="flex items-center gap-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-extrabold text-[10px] px-3 py-1.5 rounded-full shadow-2xs hover:shadow-xs cursor-pointer transition-all"
            >
              <Plus className="w-3 h-3 text-emerald-800 stroke-[3]" />
              <span>+ إضافة</span>
            </button>
          </div>

          {/* Kitchen list items */}
          <div className="space-y-3.5 pr-0.5 max-h-[420px] overflow-y-auto">
            {kitchens.map((kitchen) => (
              <div 
                key={kitchen.id}
                className="group flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50/75 border border-slate-100 hover:border-slate-200/60 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-100 shadow-3xs">
                    <CookingPot className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-[12.5px] font-black text-slate-800 leading-snug tracking-wide">
                      {kitchen.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-0.5">
                      <MapPin className="w-2.5 h-2.5 text-emerald-600" />
                      <span>{kitchen.location} | مسؤول: {kitchen.manager}</span>
                    </p>
                  </div>
                </div>

                {/* KPI metrics and delete button */}
                <div className="flex items-center gap-2">
                  <div className="text-left font-sans text-xs">
                    <span className="font-black text-emerald-800 block text-left leading-none">{kitchen.currentMealsToday}</span>
                    <span className="text-[8.5px] text-slate-405 block text-left leading-none mt-1">/ {kitchen.dailyMealsGoal} وجبة</span>
                  </div>

                  <button
                    onClick={() => onRemoveKitchen(kitchen.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 cursor-pointer transition-all"
                    title="حذف التكية"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {kitchens.length === 0 && (
              <div className="text-center py-12 text-slate-405 text-xs font-bold leading-relaxed">
                لا يوجد تكيات مسجلة حالياً.<br />انقر على "إضافة" لتسجيل مركز طهي جديد.
              </div>
            )}
          </div>
        </div>

        {/* Informative advice */}
        <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-bold">
          * تلتزم كافة التكيات بالشروط الصحية ومعايير السلامة عند الطهي والتوزيع.
        </div>
      </div>

    </div>
  );
};
