"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus, ChevronRight, Plus } from "lucide-react";
import { Card, SectionHeader } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Snackbar } from "@/shared/ui/Snackbar";
import { BottomSheet } from "@/shared/ui/BottomSheet";
import { useActionPredictor } from "@/shared/model/useActionPredictor";
import { ACTIONS } from "@/shared/lib/actionPredictor";
import { mockBriefing, mockInventory, mockNotifications } from "@/entities/mock/data";
import type { NotificationPriority } from "@/shared/types";
import { getPocMobileHome, type PocMobileHomeResponse } from "@/shared/api/poc";

// ============================================================
// AI 브리핑 카드
// ============================================================

function BriefingCard({
  briefing,
  ctaGlowClass,
  onCtaClick,
}: {
  briefing: PocMobileHomeResponse["briefing"];
  ctaGlowClass: string;
  onCtaClick: () => void;
}) {
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
        {briefing.summary}
      </p>

      {/* 핵심 수치 3개 — Hick's Law */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {briefing.highlights.map((h) => (
          <div key={h.label} className="bg-surface rounded-xl p-2.5 text-center">
            {/* 수치 대형 타이포 — 프리미엄 대시보드 스타일 */}
            <div className="flex items-center justify-center gap-1 mb-0.5">
              {h.trend === "up" && <TrendingUp size={12} className="text-success" />}
              {h.trend === "down" && <TrendingDown size={12} className="text-error" />}
              {/* UX(디자이너 피드백 반영): neutral에 Minus 아이콘을 붙이면 값이 음수로 오해될 수 있어 숨김 */}
              <span className="text-xl font-bold tabular-nums text-primary">{h.value}</span>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-tertiary">
              {h.label}
            </span>
          </div>
        ))}
      </div>

      {/* 발주 승인 CTA — glow 예측형 UI 적용 */}
      <Button
        size="lg"
        fullWidth
        onClick={onCtaClick}
        className={ctaGlowClass}
      >
        발주 승인 →
      </Button>
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

function InventoryLiveBoard({
  items,
  onUrgentItemClick,
}: {
  items: PocMobileHomeResponse["inventory"];
  onUrgentItemClick: (itemName: string) => void;
}) {
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
        {items.map((item) => {
          const cfg = statusConfig[item.status];
          const pct =
            item.status === "urgent" ? 20 : item.status === "warning" ? 55 : 85;
          const isUrgent = item.status === "urgent";

          return (
            /* 긴급 항목 클릭 → 생산 등록 BottomSheet */
            <div
              key={item.id}
              onClick={() => isUrgent && onUrgentItemClick(item.name)}
              className={isUrgent ? "cursor-pointer" : undefined}
            >
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
                <div className="flex items-center gap-2">
                  {isUrgent && (
                    <span className="text-[10px] text-error font-medium">탭하여 등록</span>
                  )}
                  <div className="text-right">
                    <span className="text-xs font-semibold text-primary tabular-nums">
                      {item.remainingTime}
                    </span>
                    <span className="block text-[10px] text-tertiary">
                      소진 예상 {item.estimatedRunout}
                    </span>
                  </div>
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

function NotificationList({ items }: { items: PocMobileHomeResponse["notifications"] }) {
  const unread = items.filter((n) => !n.isRead);

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
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetItemName, setSheetItemName] = useState("");
  const [productionQty, setProductionQty] = useState(12);

  const [homeData, setHomeData] = useState<PocMobileHomeResponse | null>(null);

  const { track, glowClass } = useActionPredictor();

  useEffect(() => {
    // PoC 백엔드 연동: 실패 시 기존 mock으로 자연스럽게 폴백(UX 결 유지).
    // - 와이어프레임 최신본에 맞춰 "브리핑/신선도/알림"을 화면 단위로 묶어 내려받는다.
    // - 백엔드가 아직 준비되지 않은 필드가 있어도 UI는 그대로 동작해야 하므로,
    //   본 파일은 API-first + mock-fallback 패턴으로 유지한다.
    let mounted = true;
    getPocMobileHome()
      .then((d) => {
        if (mounted) setHomeData(d);
      })
      .catch(() => {
        if (!mounted) return;
        setHomeData({
          store_id: "S001",
          biz_date: "mock",
          briefing: mockBriefing,
          inventory: mockInventory,
          notifications: mockNotifications,
        });
      });
    return () => {
      mounted = false;
    };
  }, []);

  /* 발주 승인 CTA */
  const handleOrderCta = () => {
    track(ACTIONS.HOME_ORDER_CTA);
    setSnackbar("발주 페이지로 이동합니다");
  };

  /* 긴급 재고 항목 클릭 → 생산 등록 시트 */
  const handleUrgentItemClick = (itemName: string) => {
    setSheetItemName(itemName);
    setProductionQty(12);
    setSheetOpen(true);
  };

  /* 생산 등록 확정 */
  const handleProductionConfirm = () => {
    setSheetOpen(false);
    setSnackbar(`${sheetItemName} ${productionQty}개 생산 등록 완료`);
  };

  return (
    <div className="h-full overflow-y-auto hide-scrollbar px-4 py-4 pb-20">
      <BriefingCard
        briefing={homeData?.briefing ?? mockBriefing}
        ctaGlowClass={glowClass(ACTIONS.HOME_ORDER_CTA)}
        onCtaClick={handleOrderCta}
      />
      <InventoryLiveBoard
        items={homeData?.inventory ?? mockInventory}
        onUrgentItemClick={handleUrgentItemClick}
      />
      <NotificationList items={homeData?.notifications ?? mockNotifications} />

      <div className="h-4" />

      {/* 긴급 생산 등록 BottomSheet */}
      <BottomSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={`${sheetItemName} 생산 등록`}
      >
        <div className="space-y-4">
          <p className="text-sm text-secondary">
            소진 임박 상품입니다. 생산 수량을 입력하고 등록하세요.
          </p>
          {/* 수량 조절 */}
          <div className="flex items-center justify-between bg-surface rounded-2xl px-4 py-3">
            <span className="text-sm font-medium text-primary">생산 수량</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setProductionQty(Math.max(1, productionQty - 1))}
                className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center text-primary hover:bg-[#E8E8E8] transition-colors text-lg"
              >
                −
              </button>
              <span className="text-2xl font-bold tabular-nums text-primary w-10 text-center">
                {productionQty}
              </span>
              <button
                onClick={() => setProductionQty(productionQty + 1)}
                className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center text-primary hover:bg-[#E8E8E8] transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
          <Button size="lg" fullWidth onClick={handleProductionConfirm}>
            생산 등록 완료
          </Button>
        </div>
      </BottomSheet>

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
