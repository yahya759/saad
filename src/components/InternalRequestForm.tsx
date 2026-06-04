import React, { useState } from 'react';
import { CheckCircle2, Send, ClipboardList } from 'lucide-react';
import { InternalRequest, InternalRequestType, InternalRequestPriority } from '../types';
import { insertInternalRequest } from '../lib/supabaseService';
import SawaedLogo from '../assets/images/sawaed_logo_1780477096183.png';

interface Props {
  onClose: () => void;
}

const REQUEST_TYPES: InternalRequestType[] = [
  'طلب مستلزمات', 'طلب صيانة', 'طلب نقل', 'طلب خدمة', 'طلب إجازة', 'أخرى'
];

const DEPARTMENTS = [
  'الإدارة العامة', 'المستودع المركزي', 'التكيات والمطابخ', 'التوزيع والنقل',
  'المالية والمحاسبة', 'الموارد البشرية', 'الصيانة والخدمات', 'أخرى'
];

export const InternalRequestForm: React.FC<Props> = ({ onClose }) => {
  const [form, setForm] = useState({
    requesterName: '',
    requesterDepartment: DEPARTMENTS[0],
    requestType: REQUEST_TYPES[0],
    description: '',
    priority: 'عادي' as InternalRequestPriority,
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!form.requesterName.trim()) { alert('يرجى كتابة اسمك الكامل'); return; }
    if (!form.description.trim() || form.description.trim().length < 10) {
      alert('يرجى كتابة وصف الطلب بشكل واضح (10 أحرف على الأقل)');
      return;
    }
    setLoading(true);
    const result = await insertInternalRequest(form);
    setLoading(false);
    if (result) setSubmitted(true);
  };

  if (submitted) {
    return (
      <div dir="rtl" className="min-h-screen bg-gradient-to-br from-emerald-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">تم إرسال طلبك!</h2>
          <p className="text-slate-500 font-medium mb-6 leading-relaxed">
            تم استلام طلبك بنجاح وسيتم مراجعته من قِبل الإدارة في أقرب وقت ممكن.
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-right mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-medium">الاسم</span>
              <span className="text-slate-700 font-bold">{form.requesterName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-medium">نوع الطلب</span>
              <span className="text-slate-700 font-bold">{form.requestType}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-medium">الأولوية</span>
              <span className={`font-bold ${form.priority === 'عاجل' ? 'text-rose-600' : form.priority === 'منخفض' ? 'text-slate-500' : 'text-blue-600'}`}>
                {form.priority}
              </span>
            </div>
          </div>
          <button
            onClick={() => { setSubmitted(false); setForm({ requesterName: '', requesterDepartment: DEPARTMENTS[0], requestType: REQUEST_TYPES[0], description: '', priority: 'عادي' }); }}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all cursor-pointer"
          >
            تقديم طلب جديد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-l from-emerald-800 to-emerald-700 p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <img src={SawaedLogo} alt="شعار" className="w-10 h-10 rounded-full border-2 border-white/30 object-contain" />
            <div>
              <p className="font-black text-base">سواعد الخير للإغاثة والتنمية</p>
              <p className="text-emerald-200 text-xs font-medium">بوابة الطلبات الداخلية</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-emerald-300" />
            <h1 className="text-xl font-black">نموذج تقديم طلب داخلي</h1>
          </div>
          <p className="text-emerald-200 text-xs mt-1 font-medium">يمكن لجميع أفراد الكادر تقديم طلباتهم عبر هذا النموذج</p>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">

          {/* Name */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">الاسم الكامل <span className="text-rose-500">*</span></label>
            <input
              type="text"
              placeholder="أدخل اسمك الكامل"
              value={form.requesterName}
              onChange={e => setForm(f => ({ ...f, requesterName: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">القسم / الجهة <span className="text-rose-500">*</span></label>
            <select
              value={form.requesterDepartment}
              onChange={e => setForm(f => ({ ...f, requesterDepartment: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-emerald-400 bg-white cursor-pointer"
            >
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Type & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">نوع الطلب <span className="text-rose-500">*</span></label>
              <select
                value={form.requestType}
                onChange={e => setForm(f => ({ ...f, requestType: e.target.value as InternalRequestType }))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-emerald-400 bg-white cursor-pointer"
              >
                {REQUEST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">الأولوية</label>
              <div className="flex gap-1.5">
                {(['عاجل', 'عادي', 'منخفض'] as InternalRequestPriority[]).map(p => (
                  <button
                    key={p}
                    onClick={() => setForm(f => ({ ...f, priority: p }))}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      form.priority === p
                        ? p === 'عاجل'   ? 'bg-rose-600 text-white border-rose-700'
                        : p === 'منخفض' ? 'bg-slate-600 text-white border-slate-700'
                                         : 'bg-blue-600 text-white border-blue-700'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              تفاصيل الطلب <span className="text-rose-500">*</span>
              <span className="text-slate-400 font-normal mr-1">(10 أحرف على الأقل)</span>
            </label>
            <textarea
              rows={4}
              placeholder="اشرح طلبك بوضوح... ماذا تحتاج؟ ولماذا؟"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 resize-none transition-all"
            />
            <p className="text-xs text-slate-400 mt-1 font-medium">{form.description.length} حرف</p>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                جاري الإرسال...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                إرسال الطلب
              </>
            )}
          </button>

          <p className="text-center text-xs text-slate-400 font-medium">
            سيتم مراجعة طلبك من قِبل الإدارة المختصة
          </p>
        </div>
      </div>
    </div>
  );
};
