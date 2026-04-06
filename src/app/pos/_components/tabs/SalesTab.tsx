"use client";

import { Sparkles } from "lucide-react";
import {
  mockSalesBriefing,
  mockHourlySales,
  mockSalesRanking,
} from "@/entities/mock/pos-data";

// ============================================================
// 메트릭 카드
// ============================================================

function SalesMetricCard({ label, value, sub, accent }: {
  label: string;
  value: string;
  sub: string;
  accent?: "orange";
}) {
  return (
    <div className={`card p-4 ${accent === "orange" ? "metric-top-orange" : ""}`}>
      <p className="text-xs text-secondary mb-1">{label}</p>
      <p className={`text-2xl font-black tabular-nums leading-none ${accent === "orange" ? "text-[#FF671F]" : "text-primary"}`}>
        {value}
      </p>
      <p className={`text-xs mt-1.5 font-medium ${accent === "orange" ? "text-[#FF671F]" : "text-secondary"}`}>
        {sub}
      </p>
    </div>
  );
}

// ============================================================
// 시간대별 판매량 — CSS 바 차트
// ============================================================

function HourlySalesChart() {
  const maxCount = Math.max(...mockHourlySales.map((h) => h.count));

  return (
    <div className="card p-5">
      <p className="text-sm font-bold text-primary mb-4">시간대별 판매량</p>

      <div className="flex items-end gap-1.5 h-36">
        {mockHourlySales.map((h) => {
          const heightPct = Math.round((h.count / maxCount) * 100);
          return (
            <div key={h.hour} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[9px] text-tertiary tabular-nums font-medium">{h.count}</span>
              <div
                className={`w-full rounded-t-lg transition-all ${h.isChanceLoss ? "bg-[#FF671F]/25" : "bg-primary/12"}`}
                style={{ height: `${heightPct}%` }}
              />
              <span className="text-[9px] text-tertiary tabular-nums">{h.hour}</span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-5 mt-3 pt-3 border-t border-border/50">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-primary/12" />
          <span className="text-xs text-secondary">일반</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-[#FF671F]/25" />
          <span className="text-xs text-secondary">기회손실 구간</span>
        </div>
      </div>

      <p className="text-xs text-tertiary mt-2">
        * 10~11시 글레이즈드 품절로 인한 기회손실 발생 구간
      </p>
    </div>
  );
}

// ============================================================
// 품목별 매출 순위
// ============================================================

const MEDAL_COLORS = ["text-[#F5A623]", "text-[#9B9B9B]", "text-[#C87941]"];

function SalesRankingList() {
  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 border-b border-border/60">
        <p className="text-sm font-bold text-primary">품목별 매출 상위</p>
      </div>

      <div className="divide-y divide-border/50">
        {mockSalesRanking.map((item) => (
          <div key={item.rank} className={`px-4 py-3.5 flex items-center gap-3 ${item.rank % 2 === 0 ? "bg-[#fafafa]" : ""}`}>
            {/* 순위 */}
            <span className={`w-5 text-sm font-black tabular-nums text-center shrink-0 ${MEDAL_COLORS[item.rank - 1] ?? "text-secondary"}`}>
              {item.rank}
            </span>

            {/* 품목명 */}
            <span className="text-sm font-semibold text-primary w-24 shrink-0">{item.name}</span>

            {/* 바 */}
            <div className="flex-1 h-2 bg-[#f0f1f3] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${item.rank === 1 ? "bg-primary" : item.rank === 2 ? "bg-primary/50" : "bg-primary/25"}`}
                style={{ width: `${item.barPct}%` }}
              />
            </div>

            {/* 수치 */}
            <div className="text-right shrink-0">
              <span className="text-sm font-black text-primary tabular-nums">{item.count}개</span>
              <span className="text-xs text-secondary ml-2 tabular-nums">₩{(item.revenue / 1000).toFixed(0)}K</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 매출 분석 탭
// ============================================================

export function SalesTab() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-black text-primary">매출 분석</h2>
        <span className="inline-flex items-center gap-1 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          <Sparkles size={9} />
          에이전트 C
        </span>
        <span className="text-xs text-secondary ml-1">AI 브리핑 + 기회손실 가시화</span>
      </div>

      {/* AI 매출 브리핑 */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #0d0d0d 0%, #222 100%)" }}>
        <div className="px-5 py-4">
          <div className="flex items-center gap-2 mb-2.5">
            <Sparkles size={12} className="text-white/50 shrink-0" />
            <span className="text-[11px] font-semibold text-white/50 tracking-widest uppercase">AI 매출 브리핑</span>
          </div>
          <p className="text-sm text-white/80 leading-relaxed">{mockSalesBriefing}</p>
        </div>
      </div>

      {/* 3개 메트릭 카드 */}
      <div className="grid grid-cols-3 gap-3">
        <SalesMetricCard label="오늘 매출" value="₩1,248,000" sub="+12.2% vs 전일" />
        <SalesMetricCard label="기회손실 추정" value="₩155,000" sub="피크 품절 기준" accent="orange" />
        <SalesMetricCard label="폐기 비용" value="₩34,000" sub="-8% vs 전일" />
      </div>

      {/* 시간대별 판매량 차트 */}
      <HourlySalesChart />

      {/* 품목별 매출 순위 */}
      <SalesRankingList />
    </div>
  );
}
