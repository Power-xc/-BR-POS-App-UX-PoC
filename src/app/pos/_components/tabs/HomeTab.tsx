"use client";

import { Sparkles, AlertTriangle, ChevronRight, Package, Shield, BarChart2, TrendingDown, Zap } from "lucide-react";
import {
  mockHomeBriefing,
  mockUrgentItems,
  totalChanceLoss,
  urgentProductionCount,
} from "@/entities/mock/pos-data";
import type { PosTab } from "@/shared/types/pos";

// ============================================================
// 메트릭 카드
// ============================================================

function MetricCard({
  label,
  value,
  sub,
  trendUp,
  trendDown,
  accent,
  Icon,
}: {
  label: string;
  value: string;
  sub: string;
  trendUp?: boolean;
  trendDown?: boolean;
  accent?: "orange" | "black";
  Icon?: React.FC<{ size?: number; className?: string }>;
}) {
  const subColor = (trendUp || trendDown) ? "text-success" : accent === "orange" ? "text-[#FF671F]" : "text-secondary";
  return (
    <div className={`card p-4 flex flex-col gap-2 ${accent === "orange" ? "metric-top-orange" : accent === "black" ? "metric-top-black" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-secondary leading-snug">{label}</p>
        {Icon && (
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${accent === "orange" ? "bg-[#FF671F]/10" : "bg-surface"}`}>
            <Icon size={14} className={accent === "orange" ? "text-[#FF671F]" : "text-secondary"} />
          </div>
        )}
      </div>
      <p className={`text-2xl font-black tabular-nums leading-none ${accent === "orange" ? "text-[#FF671F]" : "text-primary"}`}>
        {value}
      </p>
      <p className={`text-xs font-medium ${subColor}`}>{sub}</p>
    </div>
  );
}

// ============================================================
// 즉시 조치 필요 섹션
// ============================================================

function UrgentSection({ onNavigate }: { onNavigate: (tab: PosTab) => void }) {
  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#FF671F]/10 flex items-center justify-center">
            <AlertTriangle size={13} className="text-[#FF671F]" />
          </div>
          <span className="text-sm font-bold text-primary">즉시 조치 필요</span>
          <span className="text-[10px] font-bold bg-[#FF671F] text-white px-1.5 py-0.5 rounded-full">
            {urgentProductionCount}건
          </span>
        </div>
        <span className="text-xs text-tertiary">에이전트 A 감지</span>
      </div>

      <div className="divide-y divide-border/50">
        {mockUrgentItems.map((item) => (
          <div key={item.name} className="accent-warning px-4 py-3.5 pl-5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold text-primary">{item.name}</p>
              <p className="text-xs text-secondary mt-0.5">{item.reason}</p>
            </div>
            <button
              onClick={() => onNavigate("inventory")}
              className="
                btn-shimmer
                shrink-0 h-8 px-3.5 flex items-center gap-1.5
                bg-primary text-white text-xs font-bold rounded-lg
                hover:bg-[#1a1a1a] active:bg-[#2a2a2a] active:scale-[0.97]
                focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-1
                transition-all
              "
            >
              <Zap size={11} />
              생산 관리
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 퀵 네비 카드
// ============================================================

function QuickNavCard({
  Icon,
  label,
  sub,
  badge,
  onClick,
}: {
  Icon: React.FC<{ size?: number; strokeWidth?: number; className?: string }>;
  label: string;
  sub: string;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="
        card card-hover p-4 text-left w-full
        focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-1
        transition-all
      "
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="w-10 h-10 rounded-xl bg-[#f0f1f3] flex items-center justify-center">
          <Icon size={20} strokeWidth={1.6} className="text-primary" />
        </div>
        {badge && (
          <span className="text-[10px] font-bold bg-primary text-white px-1.5 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <p className="text-sm font-bold text-primary">{label}</p>
      <div className="flex items-center gap-1 mt-0.5">
        <p className="text-xs text-secondary flex-1">{sub}</p>
        <ChevronRight size={12} className="text-tertiary shrink-0" />
      </div>
    </button>
  );
}

// ============================================================
// 홈 탭
// ============================================================

interface HomeTabProps {
  onNavigate: (tab: PosTab) => void;
}

export function HomeTab({ onNavigate }: HomeTabProps) {
  const today = new Date();
  const dateStr = `${today.getMonth() + 1}월 ${today.getDate()}일 (${["일","월","화","수","목","금","토"][today.getDay()]})`;

  return (
    <div className="p-6 space-y-5">
      {/* AI 데일리 브리핑 */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-base font-black text-primary">AI 데일리 브리핑</h2>
          <span className="inline-flex items-center gap-1 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            <Sparkles size={9} />
            에이전트 C
          </span>
          <span className="text-xs text-secondary ml-auto">{dateStr}</span>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #0d0d0d 0%, #222 100%)" }}>
          <div className="px-5 py-4">
            <div className="flex items-center gap-2 mb-2.5">
              <Sparkles size={12} className="text-white/50 shrink-0" />
              <span className="text-[11px] font-semibold text-white/50 tracking-widest uppercase">AI Briefing</span>
              <button className="ml-auto text-[10px] text-white/30 hover:text-white/55 transition-colors border border-white/10 rounded px-2 py-0.5">
                에이전트 C 분석
              </button>
            </div>
            <p className="text-sm text-white/80 leading-relaxed">{mockHomeBriefing}</p>
          </div>
        </div>
      </section>

      {/* 4개 메트릭 카드 */}
      <section className="grid grid-cols-4 gap-3">
        <MetricCard label="오늘 매출" value="₩125만" sub="+12.2% vs 전일" trendUp Icon={BarChart2} />
        <MetricCard
          label="기회손실 추정"
          value={`₩${(totalChanceLoss / 10000).toFixed(1)}만`}
          sub="즉시 개선 필요"
          accent="orange"
          Icon={AlertTriangle}
        />
        <MetricCard label="폐기 비용" value="₩34K" sub="-8% vs 전일" trendDown Icon={TrendingDown} />
        <MetricCard label="즉시 조치" value={`${urgentProductionCount}건`} sub="생산 부족 품목" accent="black" Icon={Zap} />
      </section>

      {/* 즉시 조치 필요 */}
      <UrgentSection onNavigate={onNavigate} />

      {/* 퀵 네비 */}
      <section>
        <p className="text-[11px] font-bold text-tertiary mb-2.5 tracking-widest uppercase">빠른 이동</p>
        <div className="grid grid-cols-3 gap-3">
          <QuickNavCard
            Icon={Package}
            label="생산 관리"
            sub="재고 역추정 기반"
            badge={urgentProductionCount > 0 ? `${urgentProductionCount}건` : undefined}
            onClick={() => onNavigate("inventory")}
          />
          <QuickNavCard
            Icon={Shield}
            label="발주 관리"
            sub="3단계 승인 플로우"
            badge="대기 중"
            onClick={() => onNavigate("order")}
          />
          <QuickNavCard
            Icon={BarChart2}
            label="매출 분석"
            sub="AI 브리핑 보기"
            onClick={() => onNavigate("sales")}
          />
        </div>
      </section>
    </div>
  );
}
