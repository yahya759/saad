import React, { useState } from 'react';
import {
  ClipboardCheck, CheckCircle2, XCircle, Clock, Copy,
  Trash2, ChevronDown, AlertTriangle, ArrowDownCircle, Minus,
  Plus, Search, Filter, ExternalLink
} from 'lucide-react';
import { InternalRequest, InternalRequestStatus } from '../types';
import { updateInternalRequestStatus, deleteInternalRequest } from '../lib/supabaseService';

interface Props {
  requests: InternalRequest[];
  setRequests: React.Dispatch<React.SetStateAction<InternalRequest[]>>;
}

const PRIORITY_CONFIG = {
  'عاجل':    { color: 'text-rose-600 bg-rose-50 border-rose-200',    icon: AlertTriangle, dot: 'bg-rose-500' },
  'عادي':    { color: 'text-blue-600 bg-blue-50 border-blue-200',     icon: Minus,         dot: 'bg-blue-500' },
  'منخفض':   { color: 'text-slate-500 bg-slate-50 border-slate-200',  icon: ArrowDownCircle, dot: 'bg-slate-400' },
};

const STATUS_CONFIG = {
  'قيد المراجعة': { color: 'text-amber-700 bg-amber-50 border-amber-200',   icon: Clock,         label: 'قيد المراجعة' },
  'مقبول':        { color: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: CheckCircle2, label: 'مقبول' },
  'مرفوض':        { color: 'text-rose-700 bg-rose-50 border-rose-200',       icon: XCircle,       label: 'مرفوض' },
};

const TYPE_ICONS: Record<string, string> = {
  'طلب مستلزمات': '📦',
  'طلب صيانة':    '🔧',
  'طلب نقل':      '🚗',
  'طلب خدمة':     '🛎️',
  'طلب إجازة':    '📅',
  'أخرى':         '📋',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'الآن';
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `منذ ${hrs} ساعة`;
  const days = Math.floor(hrs / 24);
  return `منذ ${days} يوم`;
}

export const InternalRequestsPage: React.FC<Props> = ({ requests, setRequests }) => {
  const [filterStatus, setFilterStatus] = useState<InternalRequestStatus | 'الكل'>('الكل');
  const [searchTerm, setSearchTerm] = useState('');
  const [rejectingId, setRejectingId]   = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [copied, setCopied] = useState(false);

  // Public form link
  const formLink = `${window.location.origin}${window.location.pathname}?form=internal-request`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(formLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Filter
  const filtered = requests.filter(r => {
    const matchStatus = filterStatus === 'الكل' || r.status === filterStatus;
    const matchSearch = !searchTerm || r.requesterName.includes(searchTerm) || r.description.includes(searchTerm) || r.requesterDepartment.includes(searchTerm);
    return matchStatus && matchSearch;
  });

  const counts = {
    all: requests.length,
    pending: requests.filter(r => r.status === 'قيد المراجعة').length,
    accepted: requests.filter(r => r.status === 'مقبول').length,
    rejected: requests.filter(r => r.status === 'مرفوض').length,
  };

  const handleAccept = async (id: string) => {
    const ok = await updateInternalRequestStatus(id, 'مقبول');
    if (ok) setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'مقبول', rejectionReason: undefined } : r));
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) { alert('يرجى كتابة سبب الرفض'); return; }
    const ok = await updateInternalRequestStatus(id, 'مرفوض', rejectReason.trim());
    if (ok) {
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'مرفوض', rejectionReason: rejectReason.trim() } : r));
      setRejectingId(null);
      setRejectReason('');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الطلب نهائياً؟')) return;
    const ok = await deleteInternalRequest(id);
    if (ok) setRequests(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div dir="rtl" className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">الطلبات الداخلية</h1>
          <p className="text-slate-400 text-sm font-medium mt-0.5">إدارة طلبات الكادر الداخلي ومتابعة حالتها</p>
        </div>

        {/* Share Link Button */}
        <button
          onClick={handleCopyLink}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all border cursor-pointer ${
            copied
              ? 'bg-emerald-600 text-white border-emerald-700'
              : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
          }`}
        >
          {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'تم النسخ!' : 'نسخ رابط نموذج الطلب'}</span>
          {!copied && <ExternalLink className="w-3.5 h-3.5 opacity-60" />}
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'إجمالي الطلبات', value: counts.all,      color: 'text-slate-700', bg: 'bg-white' },
          { label: 'قيد المراجعة',   value: counts.pending,  color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'مقبولة',          value: counts.accepted, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'مرفوضة',          value: counts.rejected, color: 'text-rose-600',   bg: 'bg-rose-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border border-slate-200/70 rounded-2xl p-4 text-center shadow-xs`}>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 font-bold mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="بحث بالاسم أو القسم أو الوصف..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pr-9 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-emerald-400 bg-white"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 flex-wrap">
          {(['الكل', 'قيد المراجعة', 'مقبول', 'مرفوض'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                filterStatus === s
                  ? 'bg-emerald-700 text-white border-emerald-800'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {s} {s !== 'الكل' && s === 'قيد المراجعة' && counts.pending > 0 && (
                <span className="mr-1 bg-amber-500 text-white rounded-md px-1 text-[9px]">{counts.pending}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <ClipboardCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-bold text-base">لا توجد طلبات</p>
          <p className="text-slate-400 text-sm mt-1">شارك رابط النموذج مع الكادر لبدء استقبال الطلبات</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(req => {
            const statusCfg = STATUS_CONFIG[req.status];
            const priorityCfg = PRIORITY_CONFIG[req.priority];
            const StatusIcon = statusCfg.icon;
            const PriorityIcon = priorityCfg.icon;
            const isRejecting = rejectingId === req.id;

            return (
              <div key={req.id} className="bg-white border border-slate-200/70 rounded-2xl shadow-xs overflow-hidden">
                <div className="p-4 md:p-5">
                  <div className="flex items-start gap-3">

                    {/* Type Emoji */}
                    <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-xl shrink-0 mt-0.5">
                      {TYPE_ICONS[req.requestType] ?? '📋'}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-black text-slate-800 text-base">{req.requesterName}</span>
                        <span className="text-slate-400 text-xs font-medium">•</span>
                        <span className="text-slate-500 text-xs font-bold">{req.requesterDepartment}</span>
                        <span className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg border ${priorityCfg.color}`}>
                          <PriorityIcon className="w-3 h-3" />
                          {req.priority}
                        </span>
                      </div>

                      <p className="text-sm font-bold text-emerald-700 mb-1">{req.requestType}</p>
                      <p className="text-sm text-slate-600 leading-relaxed">{req.description}</p>

                      {req.rejectionReason && (
                        <div className="mt-2 px-3 py-2 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                          <span className="font-bold">سبب الرفض: </span>{req.rejectionReason}
                        </div>
                      )}

                      <div className="flex items-center gap-3 mt-2.5">
                        <span className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border ${statusCfg.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusCfg.label}
                        </span>
                        <span className="text-slate-400 text-xs">{timeAgo(req.createdAt)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {req.status === 'قيد المراجعة' && (
                        <>
                          <button
                            onClick={() => handleAccept(req.id)}
                            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            قبول
                          </button>
                          <button
                            onClick={() => { setRejectingId(req.id); setRejectReason(''); }}
                            className="flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            رفض
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(req.id)}
                        className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Rejection Reason Input */}
                  {isRejecting && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex gap-2">
                      <input
                        autoFocus
                        type="text"
                        placeholder="اكتب سبب الرفض..."
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleReject(req.id)}
                        className="flex-1 px-3 py-2 text-sm rounded-lg border border-rose-200 outline-none focus:border-rose-400 font-medium"
                      />
                      <button
                        onClick={() => handleReject(req.id)}
                        className="bg-rose-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-rose-700 cursor-pointer"
                      >
                        تأكيد الرفض
                      </button>
                      <button
                        onClick={() => { setRejectingId(null); setRejectReason(''); }}
                        className="text-slate-400 hover:text-slate-600 text-xs font-bold px-3 py-2 rounded-lg border border-slate-200 cursor-pointer"
                      >
                        إلغاء
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
