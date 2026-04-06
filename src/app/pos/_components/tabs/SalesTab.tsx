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

function SalesMetricCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-border p-4">
      <p className="text-sm text-secondary mb-1">{label}</p>
      <p className="text-2xl font-bold text-primary tabular-nums">{value}</p>
      <p className="text-xs text-secondary mt-1">{sub}</p>
    </div>
  );
}

// ============================================================
// 시간대별 판매량 — 순수 CSS 바 차트
// ============================================================

function HourlySalesChart() {
  const maxCount = Math.max(...mockHourlySales.map((h) => h.count));

  return (
    <div className="bg-white rounded-xl border border-border p-4">
      <p className="text-sm font-semibold text-primary mb-4">시간대별 판매량</p>

      <div className="flex items-end gap-1 h-36">
        {mockHourlySales.map((h) => {
          const heightPct = Math.round((h.count / maxCount) * 100);
          return (
            <div key={h.hour} className="flex-1 flex flex-col items-center gap-1">
              {/* 수량 레이블 */}
              <span className="text-[9px] text-tertiary tabular-nums">{h.count}</span>
              {/* 바 */}
              <div
                className={`
                  w-full rounded-t-sm transition-all
                  ${h.isChanceLoss
                    ? "bg-[#FFE0CC]"
                    : "bg-primary/15"
                  }
                `}
                style={{ height: `${heightPct}%` }}
              />
              {/* 시간 레이블 */}
              <span className="text-[9px] text-tertiary tabular-nums">{h.hour}</span>
            </div>
          );
        })}
      </div>

      {/* 범례 */}
      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-primary/15" />
          <span className="text-xs text-secondary">일반</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-[#FFE0CC]" />
          <span className="text-xs text-secondary">기회손실 발생 구간</span>
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

function SalesRankingList() {
  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <p className="text-sm font-semibold text-primary">품목별 매출 상위</p>
      </div>

      <div className="divide-y divide-border">
        {mockSalesRanking.map((item) => (
          <div key={item.rank} className="px-4 py-3 flex items-center gap-3">
            {/* 순위 */}
            <span className={`
              w-5 text-sm font-bold tabular-nums text-center shrink-0
              ${item.rank === 1 ? "text-primary" : "text-secondary"}
            `}>
              {item.rank}
            </span>

            {/* 품목명 */}
            <span className="text-sm font-medium text-primary w-24 shrink-0">{item.name}</span>

            {/* 바 */}
            <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-primary/30 rounded-full transition-all"
                style={{ width: `${item.barPct}%` }}
              />
            </div>

            {/* 수치 */}
            <div className="text-right shrink-0">
              <span className="text-sm font-semibold text-primary tabular-nums">
                {item.count}개
              </span>
              <span className="text-xs text-secondary ml-2 tabular-nums">
                ₩{(item.revenue / 1000).toFixed(0)}K
              </span>
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
      {/* 페이지 헤더 */}
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold text-primary">매출 분석</h2>
        <span className="inline-flex items-center gap-1 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          <Sparkles size={9} />
          에이전트 C
        </span>
        <span className="text-sm text-secondary ml-1">AI 브리핑 + 기회손실 가시화</span>
      </div>

      {/* AI 매출 브리핑 */}
      <div className="bg-primary rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={14} className="text-white/70" />
          <span className="text-sm font-semibold text-white">AI 매출 브리핑</span>
        </div>
        <p className="text-sm text-white/85 leading-relaxed">{mockSalesBriefing}</p>
      </div>

      {/* 3개 메트릭 카드 */}
      <div className="grid grid-cols-3 gap-3">
        <SalesMetricCard
          label="오늘 매출"
          value="₩1,248,000"
          sub="+12.2% vs 전일"
        />
        <SalesMetricCard
          label="기회손실 추정"
          value="₩155,000"
          sub="피크 품절 기준"
        />
        <SalesMetricCard
          label="폐기 비용"
          value="₩34,000"
          sub="-8% vs 전일"
        />
      </div>

      {/* 시간대별 판매량 차트 */}
      <HourlySalesChart />

      {/* 품목별 매출 순위 */}
      <SalesRankingList />
    </div>
  );
}
