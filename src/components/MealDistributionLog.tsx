import React, { useState } from 'react';
import { UtensilsCrossed, Plus, Trash2, TrendingUp, Calendar, MapPin, ChefHat, X } from 'lucide-react';
import { MealDistribution, Kitchen } from '../types';
import { insertMealDistribution, deleteMealDistribution } from '../lib/supabaseService';

interface Props {
  distributions: MealDistribution[];
  setDistributions: React.Dispatch<React.SetStateAction<MealDistribution[]>>;
  kitchens: Kitchen[];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ar-SA', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
}

export const MealDistributionLog: React.FC<Props> = ({ distributions, setDistributions, kitchens }) => {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    kitchenId: kitchens[0]?.id ?? '',
    mealsCount: '',
    area: '',
    notes: '',
    distributionDate: new Date().toISOString().split('T')[0],
  });

  // ---- Stats ----
  const today = new Date().toISOString().split('T')[0];
  const todayDists = distributions.filter(d => d.distributionDate === today);
  const todayTotal = todayDists.reduce((s, d) => s + d.mealsCount, 0);
  const totalAll = distributions.reduce((s, d) => s + d.mealsCount, 0);

  // Weekly totals (last 7 days)
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    const total = distributions.filter(d => d.distributionDate === dateStr).reduce((s, d) => s + d.mealsCount, 0);
    return { date: dateStr, label: date.toLocaleDateString('ar-SA', { weekday: 'short' }), total };
  });
  const weekMax = Math.max(...weeklyData.map(d => d.total), 1);

  const handleSubmit = async () => {
    if (!form.kitchenId) { alert('اختر التكية'); return; }
    const meals = parseInt(form.mealsCount);
    if (!meals || meals <= 0) { alert('أدخل عدد الوجبات'); return; }
    if (!form.area.trim()) { alert('أدخل المنطقة المستهدفة'); return; }

    setLoading(true);
    const kitchen = kitchens.find(k => k.id === form.kitchenId);
    const result = await insertMealDistribution({
      kitchenId: form.kitchenId,
      kitchenName: kitchen?.name ?? '',
      mealsCount: meals,
      area: form.area.trim(),
      notes: form.notes.trim() || undefined,
      distributionDate: form.distributionDate,
    });
    setLoading(false);
    if (!result) return;
    setDistributions(prev => [result, ...prev]);
    setForm(f => ({ ...f, mealsCount: '', area: '', notes: '' }));
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('حذف سجل التوزيع هذا؟')) return;
    const ok = await deleteMealDistribution(id);
    if (ok) setDistributions(prev => prev.filter(d => d.id !== id));
  };

  return (
    <div className="space-y-5">

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-emerald-700 text-white rounded-2xl p-4 text-center shadow-sm">
          <p className="text-3xl font-black">{todayTotal.toLocaleString('ar-SA')}</p>
          <p className="text-emerald-200 text-xs font-bold mt-1">وجبات اليوم</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-xs">
          <p className="text-3xl font-black text-slate-800">{weeklyData.reduce((s,d) => s+d.total,0).toLocaleString('ar-SA')}</p>
          <p className="text-slate-400 text-xs font-bold mt-1">وجبات الأسبوع</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-xs">
          <p className="text-3xl font-black text-slate-800">{totalAll.toLocaleString('ar-SA')}</p>
          <p className="text-slate-400 text-xs font-bold mt-1">إجمالي تراكمي</p>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-extrabold text-slate-700 text-sm">النشاط الأسبوعي</p>
            <p className="text-slate-400 text-xs">توزيع الوجبات آخر 7 أيام</p>
          </div>
          <TrendingUp className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="flex items-end gap-1.5 h-20">
          {weeklyData.map(day => (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end justify-center" style={{ height: '60px' }}>
                <div
                  className={`w-full rounded-t-lg transition-all ${day.date === today ? 'bg-emerald-600' : 'bg-emerald-200'}`}
                  style={{ height: `${day.total ? Math.max(8, (day.total / weekMax) * 60) : 3}px` }}
                  title={`${day.total} وجبة`}
                />
              </div>
              <span className="text-[9px] text-slate-400 font-bold">{day.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Header + Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-extrabold text-slate-700 text-sm">سجل التوزيع اليومي</p>
          <p className="text-slate-400 text-xs">{distributions.length} عملية توزيع مسجلة</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          تسجيل توزيع
        </button>
      </div>

      {/* Add Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4"
            onClick={e => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <UtensilsCrossed className="w-4 h-4 text-emerald-700" />
                </div>
                <p className="font-black text-slate-800">تسجيل توزيع وجبات</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Kitchen */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                <ChefHat className="w-3.5 h-3.5 inline ml-1" />التكية / المطبخ
              </label>
              <select
                value={form.kitchenId}
                onChange={e => setForm(f => ({ ...f, kitchenId: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-emerald-400 bg-white"
              >
                {kitchens.length === 0
                  ? <option value="">لا توجد تكيات مسجلة</option>
                  : kitchens.map(k => <option key={k.id} value={k.id}>{k.name} — {k.location}</option>)
                }
              </select>
            </div>

            {/* Meals Count + Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  <UtensilsCrossed className="w-3.5 h-3.5 inline ml-1" />عدد الوجبات
                </label>
                <input
                  type="number" min="1"
                  placeholder="مثال: 250"
                  value={form.mealsCount}
                  onChange={e => setForm(f => ({ ...f, mealsCount: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  <Calendar className="w-3.5 h-3.5 inline ml-1" />تاريخ التوزيع
                </label>
                <input
                  type="date"
                  value={form.distributionDate}
                  onChange={e => setForm(f => ({ ...f, distributionDate: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            {/* Area */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                <MapPin className="w-3.5 h-3.5 inline ml-1" />المنطقة المستهدفة
              </label>
              <input
                type="text"
                placeholder="مثال: حي السلام — المخيم الشمالي"
                value={form.area}
                onChange={e => setForm(f => ({ ...f, area: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-emerald-400"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">ملاحظات (اختياري)</label>
              <textarea
                rows={2}
                placeholder="أي تفاصيل إضافية..."
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-emerald-400 resize-none"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-black py-2.5 rounded-xl text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                {loading ? 'جاري الحفظ...' : 'حفظ التوزيع'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Distribution Records */}
      {distributions.length === 0 ? (
        <div className="text-center py-10 bg-white border border-slate-200 rounded-2xl">
          <UtensilsCrossed className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500 font-bold text-sm">لا توجد سجلات توزيع بعد</p>
          <p className="text-slate-400 text-xs mt-1">اضغط "تسجيل توزيع" لبدء الإحصاء</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {distributions.slice(0, 30).map(d => (
            <div key={d.id} className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center gap-3 shadow-xs group">
              <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                <UtensilsCrossed className="w-4.5 h-4.5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-black text-emerald-700 text-base">{d.mealsCount.toLocaleString('ar-SA')}</span>
                  <span className="text-slate-400 text-xs font-medium">وجبة</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-600 text-xs font-bold truncate">{d.kitchenName}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="text-slate-500 text-xs font-medium truncate">{d.area}</span>
                  <span className="text-slate-300 text-xs">|</span>
                  <span className="text-slate-400 text-xs">{formatDate(d.distributionDate)}</span>
                </div>
                {d.notes && <p className="text-slate-400 text-xs mt-0.5 truncate">{d.notes}</p>}
              </div>
              <button
                onClick={() => handleDelete(d.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
