import React, { useState, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { Employee } from '../types';
import { fetchAttendanceByMonth, upsertAttendance, AttendanceRecord } from '../lib/supabaseService';

interface Props { members: Employee[]; }

const STATUS_CYCLE: Record<string, 'حاضر' | 'غائب' | 'إجازة'> = {
  'حاضر': 'غائب',
  'غائب': 'إجازة',
  'إجازة': 'حاضر',
};
const STATUS_STYLE = {
  'حاضر': { bg: 'bg-emerald-500', text: 'text-white',   label: '✓' },
  'غائب': { bg: 'bg-rose-500',    text: 'text-white',   label: '✗' },
  'إجازة': { bg: 'bg-amber-400',  text: 'text-white',   label: '○' },
  'none':  { bg: 'bg-slate-100',  text: 'text-slate-300', label: '·' },
};

const AR_MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const AR_DAYS   = ['ح','ن','ث','ر','خ','ج','س'];

export const AttendancePage: React.FC<Props> = ({ members }) => {
  const now = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [records, setRecords]     = useState<AttendanceRecord[]>([]);
  const [saving,  setSaving]      = useState<string | null>(null); // "empId-date"
  const [loading, setLoading]     = useState(true);

  // Days in month
  const daysInMonth = new Date(year, month, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchAttendanceByMonth(year, month);
    setRecords(data);
    setLoading(false);
  }, [year, month]);

  useEffect(() => { load(); }, [load]);

  const getStatus = (empId: string, day: number): 'حاضر' | 'غائب' | 'إجازة' | 'none' => {
    const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return records.find(r => r.employeeId === empId && r.date === dateStr)?.status ?? 'none';
  };

  const handleClick = async (empId: string, day: number) => {
    const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const key = `${empId}-${dateStr}`;
    const current = getStatus(empId, day);
    const next = current === 'none' ? 'حاضر' : STATUS_CYCLE[current];

    // Optimistic update
    setSaving(key);
    setRecords(prev => {
      const filtered = prev.filter(r => !(r.employeeId === empId && r.date === dateStr));
      return [...filtered, { id: key, employeeId: empId, date: dateStr, status: next }];
    });

    await upsertAttendance(empId, dateStr, next);
    setSaving(null);
  };

  // Per-employee stats
  const getStats = (empId: string) => {
    const empRecs = records.filter(r => r.employeeId === empId);
    return {
      present: empRecs.filter(r => r.status === 'حاضر').length,
      absent:  empRecs.filter(r => r.status === 'غائب').length,
      leave:   empRecs.filter(r => r.status === 'إجازة').length,
    };
  };

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y-1); } else setMonth(m => m-1); };
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y+1); } else setMonth(m => m+1); };

  // Team totals
  const totalPresent = records.filter(r => r.status === 'حاضر').length;
  const totalAbsent  = records.filter(r => r.status === 'غائب').length;
  const totalLeave   = records.filter(r => r.status === 'إجازة').length;

  return (
    <div dir="rtl" className="space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-black text-slate-800">سجل الحضور والغياب</h2>
          <p className="text-[11px] text-slate-400 font-bold mt-0.5">اضغط على الخلية لتغيير الحالة • <span className="text-emerald-600">✓ حاضر</span> → <span className="text-rose-500">✗ غائب</span> → <span className="text-amber-500">○ إجازة</span></p>
        </div>

        {/* Month navigator */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-3 py-2 shadow-xs">
          <button onClick={prevMonth} className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors">
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
          <span className="font-black text-slate-700 text-sm min-w-[110px] text-center">
            {AR_MONTHS[month-1]} {year}
          </span>
          <button onClick={nextMonth} className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors">
            <ChevronLeft className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs font-bold">
        {[
          { color: 'bg-emerald-500', label: 'حاضر (✓)' },
          { color: 'bg-rose-500',    label: 'غائب (✗)' },
          { color: 'bg-amber-400',   label: 'إجازة (○)' },
          { color: 'bg-slate-100 border border-slate-300', label: 'لم يُسجَّل (·)' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className={`w-4 h-4 rounded ${l.color}`} />
            <span className="text-slate-500">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Team totals */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'إجمالي الحضور', count: totalPresent, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
          { label: 'إجمالي الغياب', count: totalAbsent,  color: 'text-rose-600',    bg: 'bg-rose-50 border-rose-200' },
          { label: 'الإجازات',      count: totalLeave,   color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-200' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border rounded-2xl p-3 text-center`}>
            <p className={`text-2xl font-black ${s.color}`}>{s.count}</p>
            <p className="text-[10px] text-slate-500 font-bold">{s.label} — {AR_MONTHS[month-1]}</p>
          </div>
        ))}
      </div>

      {/* Grid */}
      {members.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-100 rounded-2xl text-slate-400 text-xs font-bold">
          لا يوجد موظفون مسجلون. أضف موظفين من صفحة إدارة الموظفين أولاً.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-slate-400 text-sm font-bold">
              <Loader2 className="w-5 h-5 animate-spin" />
              جاري تحميل سجل الحضور...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {/* Employee col */}
                    <th className="sticky right-0 bg-slate-50 z-10 text-right font-extrabold text-slate-600 px-4 py-3 min-w-[140px] border-l border-slate-200">
                      الموظف
                    </th>
                    {/* Day cols */}
                    {days.map(d => {
                      const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
                      const dayOfWeek = new Date(dateStr).getDay();
                      const isToday = dateStr === today;
                      const isWeekend = dayOfWeek === 5 || dayOfWeek === 6; // جمعة وسبت
                      return (
                        <th key={d} className={`text-center font-bold py-2 min-w-[32px] w-8 ${isToday ? 'bg-emerald-100 text-emerald-700' : isWeekend ? 'bg-slate-100 text-slate-400' : 'text-slate-500'}`}>
                          <div>{d}</div>
                          <div className="text-[8px] opacity-60">{AR_DAYS[dayOfWeek]}</div>
                        </th>
                      );
                    })}
                    {/* Stats */}
                    <th className="text-center font-extrabold text-emerald-700 px-3 py-3 min-w-[40px] border-r border-slate-200">✓</th>
                    <th className="text-center font-extrabold text-rose-600 px-3 py-3 min-w-[40px]">✗</th>
                    <th className="text-center font-extrabold text-amber-500 px-3 py-3 min-w-[40px]">○</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((emp, idx) => {
                    const stats = getStats(emp.id);
                    return (
                      <tr key={emp.id} className={`border-b border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
                        {/* Name */}
                        <td className={`sticky right-0 z-10 px-4 py-2 border-l border-slate-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                          <div className="font-extrabold text-slate-800 truncate max-w-[130px]">{emp.name}</div>
                          <div className="text-[9px] text-slate-400 font-bold">{emp.role}</div>
                        </td>
                        {/* Day cells */}
                        {days.map(d => {
                          const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
                          const key = `${emp.id}-${dateStr}`;
                          const status = getStatus(emp.id, d);
                          const style = STATUS_STYLE[status];
                          const isSaving = saving === key;
                          const dayOfWeek = new Date(dateStr).getDay();
                          const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
                          const isToday = dateStr === today;

                          return (
                            <td key={d} className={`text-center p-0.5 ${isToday ? 'bg-emerald-50' : isWeekend ? 'bg-slate-50' : ''}`}>
                              <button
                                onClick={() => handleClick(emp.id, d)}
                                disabled={isSaving}
                                className={`w-7 h-7 rounded-lg font-black text-[11px] transition-all cursor-pointer hover:scale-110 active:scale-95 ${style.bg} ${style.text} ${isSaving ? 'opacity-50' : ''}`}
                                title={`${emp.name} — ${dateStr} — ${status === 'none' ? 'لم يُسجَّل' : status}`}
                              >
                                {isSaving ? '⟳' : style.label}
                              </button>
                            </td>
                          );
                        })}
                        {/* Stats */}
                        <td className="text-center font-black text-emerald-700 px-2 border-r border-slate-200">{stats.present}</td>
                        <td className="text-center font-black text-rose-600 px-2">{stats.absent}</td>
                        <td className="text-center font-black text-amber-500 px-2">{stats.leave}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
