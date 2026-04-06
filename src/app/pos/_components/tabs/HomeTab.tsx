"use client";

import { Sparkles, AlertTriangle, ChevronRight, Package, Shield, BarChart2 } from "lucide-react";
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
  highlight,
}: {
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div className={`
      bg-white rounded-xl p-4 border transition-all
      ${highlight
        ? "border-primary/20 ring-1 ring-primary/10"
        : "border-border"
      }
    `}>
      <p className="text-sm text-secondary mb-1">{label}</p>
      <p className="text-2xl font-bold text-primary tabular-nums">{value}</p>
      <p className={`text-xs mt-1 ${highlight ? "text-[#E65100] font-medium" : "text-secondary"}`}>
        {sub}
      </p>
    </div>
  );
}

// ============================================================
// 즉시 조치 필요 섹션
// ============================================================

function UrgentSection({ onNavigate }: { onNavigate: (tab: PosTab) => void }) {
  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle size={15} className="text-[#E65100]" />
          <span className="text-base font-semibold text-primary">즉시 조치 필요</span>
        </div>
        <span className="text-xs text-secondary">에이전트 A 감지</span>
      </div>

      <div className="divide-y divide-border">
        {mockUrgentItems.map((item) => (
          <div key={item.name} className="px-4 py-3.5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-base font-semibold text-primary">{item.name}</p>
              <p className="text-sm text-secondary mt-0.5">{item.reason}</p>
            </div>
            <button
              onClick={() => onNavigate("inventory")}
              className="
                shrink-0 h-8 px-3 flex items-center gap-1.5
                bg-primary text-white text-xs font-semibold rounded-lg
                hover:bg-[#1a1a1a] active:bg-[#2a2a2a] active:scale-[0.97]
                focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-1
                transition-all
              "
            >
              생산 관리
              <ChevronRight size={12} />
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
  onClick,
}: {
  Icon: React.FC<{ size?: number; strokeWidth?: number; className?: string }>;
  label: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="
        bg-white rounded-xl border border-border p-4 text-left
        hover:border-primary/30 hover:shadow-sm
        active:bg-surface active:scale-[0.98]
        focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-1
        transition-all
      "
    >
      <Icon size={22} strokeWidth={1.5} className="text-secondary mb-2.5" />
      <p className="text-sm font-semibold text-primary">{label}</p>
      <p className="text-xs text-secondary mt-0.5">{sub}</p>
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
  const dateStr = `오늘 ${today.getMonth() + 1}월 ${today.getDate()}일 (${["일","월","화","수","목","금","토"][today.getDay()]})`;

  return (
    <div className="p-6 space-y-5">
      {/* AI 데일리 브리핑 */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-lg font-bold text-primary">AI 데일리 브리핑</h2>
          <span className="inline-flex items-center gap-1 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            <Sparkles size={9} />
            에이전트 C
          </span>
          <span className="text-sm text-secondary ml-auto">{dateStr}</span>
        </div>

        <div className="bg-primary rounded-xl p-4">
          <div className="flex items-start gap-2 mb-2">
            <Sparkles size={14} className="text-white/70 shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-white">AI 브리핑 요약</p>
            <button className="ml-auto text-[11px] text-white/50 hover:text-white/80 transition-colors">
              에이전트 C 분석
            </button>
          </div>
          <p className="text-sm text-white/85 leading-relaxed">{mockHomeBriefing}</p>
        </div>
      </section>

      {/* 4개 메트릭 카드 */}
      <section className="grid grid-cols-4 gap-3">
        <MetricCard label="오늘 매출" value="₩125만" sub="+12.2%" />
        <MetricCard
          label="기회손실 추정"
          value={`₩${(totalChanceLoss / 10000).toFixed(1)}만`}
          sub="개선 필요"
          highlight
        />
        <MetricCard label="폐기 비용" value="₩34K" sub="전일 대비 -8%" />
        <MetricCard
          label="즉시 조치 필요"
          value={`${urgentProductionCount}건`}
          sub="생산 부족"
        />
      </section>

      {/* 즉시 조치 필요 */}
      <UrgentSection onNavigate={onNavigate} />

      {/* 퀵 네비 */}
      <section className="grid grid-cols-3 gap-3">
        <QuickNavCard
          Icon={Package}
          label="생산 관리"
          sub={`${urgentProductionCount}건 조치 필요`}
          onClick={() => onNavigate("inventory")}
        />
        <QuickNavCard
          Icon={Shield}
          label="발주 관리"
          sub="3단계 승인 대기"
          onClick={() => onNavigate("order")}
        />
        <QuickNavCard
          Icon={BarChart2}
          label="매출 분석"
          sub="AI 브리핑 보기"
          onClick={() => onNavigate("sales")}
        />
      </section>
    </div>
  );
}
