"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Minus, Bell, ChevronRight } from "lucide-react";
import { Card, SectionHeader } from "@/shared/ui/Card";
import { Snackbar } from "@/shared/ui/Snackbar";
import { mockBriefing, mockInventory, mockNotifications } from "@/entities/mock/data";
import type { NotificationPriority } from "@/shared/types";

// ============================================================
// AI 브리핑 카드
// ============================================================

function BriefingCard() {
  return (
    <Card className="mb-3">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
          <span className="text-white text-[10px] font-bold">AI</span>
        </div>
        <span className="text-xs font-semibold text-secondary">AI 데일리 브리핑</span>
      </div>

      {/* NLP 텍스트 요약 — 그래프 대신 문장 (UT: 4.2분→28초) */}
      <p className="text-sm text-primary leading-relaxed italic mb-4">
        {mockBriefing.summary}
      </p>

      {/* 핵심 수치 3개 — Hick's Law */}
      <div className="grid grid-cols-3 gap-2">
        {mockBriefing.highlights.map((h) => (
          <div key={h.label} className="bg-surface rounded-xl p-2.5 text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              {h.trend === "up" && <TrendingUp size={12} className="text-success" />}
              {h.trend === "down" && <TrendingDown size={12} className="text-error" />}
              {h.trend === "neutral" && <Minus size={12} className="text-tertiary" />}
              <span className="text-sm font-bold text-primary">{h.value}</span>
            </div>
            <span className="text-[10px] text-secondary">{h.label}</span>
          </div>
        ))}
      </div>

      {/* 발주 승인 CTA — Z-Pattern: 카드 하단 액션 (UT 근거) */}
      <button className="
        w-full mt-4 h-12
        bg-primary text-white text-sm font-semibold
        rounded-xl flex items-center justify-center gap-2
        hover:bg-[#1a1a1a] active:scale-[0.98] transition-all
      ">
        발주 승인 →
      </button>
    </Card>
  );
}

// ============================================================
// 신선도 라이브 보드
// ============================================================

const statusConfig = {
  urgent: { bar: "bg-error", text: "text-error", label: "긴급" },
  warning: { bar: "bg-[#E65100]", text: "text-[#E65100]", label: "주의" },
  normal: { bar: "bg-success", text: "text-success", label: "정상" },
};

function InventoryLiveBoard() {
  return (
    <Card className="mb-3">
      <SectionHeader
        label="신선도 라이브 보드"
        sub="TIME-BASED"
        action={
          <span className="text-xs text-secondary flex items-center gap-0.5">
            전체 <ChevronRight size={12} />
          </span>
        }
      />

      <div className="space-y-3">
        {mockInventory.map((item) => {
          const cfg = statusConfig[item.status];
          /* 잔여 시간 퍼센트 — 시각적 바 */
          const pct =
            item.status === "urgent" ? 20 : item.status === "warning" ? 55 : 85;

          return (
            <div key={item.id}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-semibold ${cfg.text}`}>
                    {cfg.label}
                  </span>
                  <span className="text-sm font-medium text-primary">{item.name}</span>
                  <span className="text-xs text-secondary">
                    {item.currentStock}개
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-primary tabular-nums">
                    {item.remainingTime}
                  </span>
                  <span className="block text-[10px] text-tertiary">
                    소진 예상 {item.estimatedRunout}
                  </span>
                </div>
              </div>
              {/* 시각적 잔여량 바 */}
              <div className="h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${cfg.bar}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ============================================================
// 우선순위 알림 목록
// ============================================================

const priorityConfig: Record<
  NotificationPriority,
  { dot: string; bg: string; label: string }
> = {
  urgent: { dot: "bg-primary", bg: "bg-[#F5F5F7]", label: "긴급" },
  warning: { dot: "bg-warning-neutral", bg: "bg-[#F9F9F9]", label: "주의" },
  info: { dot: "bg-info-neutral", bg: "bg-card", label: "정보" },
};

function NotificationList() {
  const unread = mockNotifications.filter((n) => !n.isRead);

  return (
    <Card>
      <SectionHeader
        label="우선순위 알림"
        sub="신호등"
        action={
          <span className="text-xs text-secondary flex items-center gap-0.5">
            전체 <ChevronRight size={12} />
          </span>
        }
      />

      <div className="space-y-2">
        {unread.map((n) => {
          const cfg = priorityConfig[n.priority];
          return (
            <div
              key={n.id}
              className={`${cfg.bg} rounded-xl p-3 flex items-start gap-3`}
            >
              <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${cfg.dot}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-primary truncate">
                    {n.title}
                  </span>
                  <span className="text-[10px] text-tertiary shrink-0">{n.time}</span>
                </div>
                <p className="text-xs text-secondary leading-relaxed">{n.body}</p>
              </div>
              {n.hasAction && n.actionLabel && (
                <button className="
                  shrink-0 text-[11px] font-semibold text-white
                  bg-primary px-2.5 py-1.5 rounded-lg
                  hover:bg-[#1a1a1a] active:scale-95 transition-all
                ">
                  {n.actionLabel}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ============================================================
// 홈 페이지
// ============================================================

export default function HomePage() {
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const handleProductionRegister = () => {
    setSnackbar("글레이즈드 생산 등록 완료");
  };

  return (
    <div className="h-full overflow-y-auto hide-scrollbar px-4 py-4 pb-20">
      <BriefingCard />
      <InventoryLiveBoard />
      <NotificationList />

      {/* 빈 공간 확보 */}
      <div className="h-4" />

      {snackbar && (
        <Snackbar
          message={snackbar}
          onUndo={() => setSnackbar(null)}
          onDismiss={() => setSnackbar(null)}
        />
      )}
    </div>
  );
}
