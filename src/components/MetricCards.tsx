import React from 'react';
import { ArrowUpLeft, CookingPot, Utensils, AlertCircle, PackageOpen } from 'lucide-react';

interface MetricCardsProps {
  totalInventoryCount: number;
  activeKitchensCount: number;
  pendingRequestsCount: number;
  mealsDistributedCount: number;
  onCardClick?: (metricId: string) => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  totalInventoryCount,
  activeKitchensCount,
  pendingRequestsCount,
  mealsDistributedCount,
  onCardClick
}) => {
  const cards = [
    {
      id: 'inventoryStore',
      title: 'إجمالي أصناف المستودع',
      value: `${totalInventoryCount} مادة`,
      subtext: 'مخزنة في المستودع المركزي',
      badge: 'مؤمنة',
      isAccent: true,
      icon: PackageOpen,
    },
    {
      id: 'activeKitchens',
      title: 'التكيات والمطابخ النشطة',
      value: `${activeKitchensCount} تكية`,
      subtext: 'موزعة جغرافياً في المحافظات',
      badge: 'نشط',
      isAccent: false,
      icon: CookingPot,
    },
    {
      id: 'pendingRequests',
      title: 'طلبات تموين قيد التدقيق',
      value: `${pendingRequestsCount} طلبات`,
      subtext: 'بانتظار موافقة أمين المستودع',
      badge: pendingRequestsCount > 0 ? 'انتباه' : 'منخفضة',
      isAccent: false,
      icon: AlertCircle,
    },
    {
      id: 'mealsToday',
      title: 'الوجبات الموزعة (تراكمي)',
      value: `${mealsDistributedCount.toLocaleString('ar-EG')} وجبة`,
      subtext: 'مقدمة للعائلات المستفيدة',
      badge: 'اليوم',
      isAccent: false,
      icon: Utensils,
    },
  ];

  return (
    <div id="metric-cards-row" dir="rtl" className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-5">
      {cards.map((card) => {
        const isAccent = card.isAccent;
        const Icon = card.icon;
        const isAlert = card.id === 'pendingRequests' && pendingRequestsCount > 0;
        return (
          <div
            key={card.id}
            onClick={() => onCardClick?.(card.id)}
            className={`cursor-pointer group flex flex-col justify-between p-3.5 md:p-4.5 rounded-2xl md:rounded-2.5xl transition-all relative min-h-[130px] md:min-h-[138px] select-none ${
              isAccent
                ? 'bg-emerald-800 text-white shadow-sm hover:bg-emerald-900 border border-emerald-950/20'
                : isAlert
                  ? 'bg-rose-50/70 text-slate-800 border border-rose-200/80 hover:bg-rose-50'
                  : 'bg-white border border-slate-200/60 shadow-xs hover:shadow-sm'
            }`}
          >
            {/* Top Row: Title & Icon */}
            <div className="flex items-start justify-between gap-2">
              <span className={`text-[11.5px] md:text-[12.5px] font-extrabold tracking-wide leading-snug ${
                isAccent ? 'text-emerald-100' : 'text-slate-500 font-bold'
              }`}>
                {card.title}
              </span>
              <div className={`w-7 h-7 md:w-8 md:h-8 shrink-0 rounded-xl flex items-center justify-center transition-all ${
                isAccent 
                  ? 'bg-white/10 text-white' 
                  : isAlert 
                    ? 'bg-rose-100 text-rose-600' 
                    : 'bg-slate-50 border border-slate-200/50 text-emerald-700'
              }`}>
                <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </div>
            </div>

            {/* Middle Row: Value */}
            <div className="my-1.5">
              <span className="text-xl md:text-2xl font-black tracking-tight font-sans leading-tight">
                {card.value}
              </span>
            </div>

            {/* Bottom Row: Badge & Subtext */}
            <div className="flex items-center gap-1.5 md:gap-2 mt-auto flex-wrap">
              {card.badge ? (
                <div className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-extrabold tracking-wide shrink-0 ${
                  isAccent 
                    ? 'bg-white/15 text-white border border-white/20' 
                    : isAlert
                      ? 'bg-rose-500 text-white'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                }`}>
                  <span>{card.badge}</span>
                </div>
              ) : null}
              <span className={`text-[10px] md:text-[10.5px] font-bold leading-snug ${
                isAccent 
                  ? 'text-emerald-200' 
                  : isAlert 
                    ? 'text-rose-600' 
                    : 'text-slate-400'
              }`}>
                {card.subtext}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
