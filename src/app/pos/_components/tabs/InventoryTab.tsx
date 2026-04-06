"use client";

import { useState } from "react";
import { Sparkles, Info, ChevronDown, ChevronUp, ChevronRight } from "lucide-react";
import { Snackbar } from "@/shared/ui/Snackbar";
import {
  mockInventoryItems,
  totalChanceLoss,
  urgentProductionCount,
} from "@/entities/mock/pos-data";
import type { PosInventoryItem, ProductionStatus } from "@/shared/types/pos";

// ============================================================
// 상태 뱃지 설정
// ============================================================

const STATUS_CONFIG: Record<
  ProductionStatus,
  { label: string; bg: string; text: string; accentClass: string }
> = {
  urgent:    { label: "즉시 생산", bg: "bg-primary",      text: "text-white",         accentClass: "accent-urgent"  },
  recommend: { label: "생산 권장", bg: "bg-[#FF671F]/12", text: "text-[#FF671F]",     accentClass: "accent-warning" },
  normal:    { label: "적정",      bg: "bg-surface",       text: "text-secondary",     accentClass: "accent-info"    },
};

// ============================================================
// AI 근거 패널
// ============================================================

function AiEvidencePanel() {
  return (
    <div className="card p-4 text-sm text-secondary leading-relaxed space-y-2">
      <p className="font-bold text-primary">역추정 공식 설명</p>
      <p>
        <span className="font-semibold text-primary">현재 재고</span>{" "}
        = (오픈 기초 재고 + 당일 생산 완료) − 당일 POS 판매 수량
      </p>
      <p>
        <span className="font-semibold text-primary">권장 생산량</span>{" "}
        = 해당 시간대 예상 수요 − 현재 역추정 재고
      </p>
      <p>
        <span className="font-semibold text-primary">기회손실</span>{" "}
        = 권장 생산량(부족분) × 판매 단가
      </p>
      <div className="mt-2 p-3 bg-[#f0f1f3] rounded-xl border border-border/50">
        <p className="text-xs font-bold text-primary mb-1.5">글레이즈드 예시</p>
        <p className="text-xs">기초 재고 50개 + 생산 0개 − 판매 46개 = <span className="font-bold">현재 재고 4개</span></p>
        <p className="text-xs">예상 수요(10~11시 피크): 최근 4주 평균 30개</p>
        <p className="text-xs">권장 생산: 30 − 4 + 피크 보정(+2) = <span className="font-bold">28개</span></p>
        <p className="text-xs">기회손실: 28 × ₩1,800 = <span className="font-bold text-[#FF671F]">₩50,400 → 피크 가중 ₩86,000</span></p>
      </div>
      <p className="text-xs text-tertiary">* 리드타임 기준: 1시간 (생산 완료 등록 후 1시간 뒤 재고 반영)</p>
    </div>
  );
}

// ============================================================
// 재고 progress bar
// ============================================================

function StockBar({ current, max }: { current: number; max: number }) {
  const pct = Math.min(Math.round((current / max) * 100), 100);
  const color = pct <= 20 ? "bg-primary" : pct <= 50 ? "bg-[#FF671F]" : "bg-success";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-[#f0f1f3] rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-tertiary tabular-nums w-8 text-right">{pct}%</span>
    </div>
  );
}

// ============================================================
// 품목 카드
// ============================================================

function InventoryItemCard({
  item,
  onRegister,
}: {
  item: PosInventoryItem;
  onRegister: (id: string) => void;
}) {
  const cfg = STATUS_CONFIG[item.status];
  const showAction = item.status !== "normal";
  /* 재고 시각화: 권장생산량 기준으로 최대치 설정 */
  const maxForBar = item.currentStock + item.recommendedProduction;

  return (
    <div className={`card overflow-hidden ${cfg.accentClass}`}>
      <div className="p-4 pl-5">
        {/* 품목명 + 뱃지 + 버튼 */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base font-bold text-primary">{item.name}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                {cfg.label}
              </span>
            </div>
            <div className="flex items-center gap-1 text-secondary">
              <Info size={11} className="shrink-0" />
              <p className="text-xs">{item.aiReason}</p>
            </div>
          </div>

          {showAction && (
            <button
              onClick={() => onRegister(item.id)}
              className="
                btn-shimmer
                shrink-0 h-8 px-3 bg-primary text-white text-xs font-bold rounded-lg
                hover:bg-[#1a1a1a] active:bg-[#2a2a2a] active:scale-[0.97]
                focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-1
                transition-all
              "
            >
              생산 완료 등록
            </button>
          )}
        </div>

        {/* 재고 수치 */}
        <div className="flex items-center gap-2 text-sm mb-2">
          <span className="text-secondary text-xs">현재 재고</span>
          <span className="font-bold text-primary tabular-nums">{item.currentStock}{item.unit}</span>
          <ChevronRight size={12} className="text-tertiary" />
          <span className="text-secondary text-xs">권장 생산</span>
          <span className={`font-black tabular-nums ${item.status !== "normal" ? "text-primary" : "text-secondary"}`}>
            {item.recommendedProduction}{item.unit}
          </span>
          {item.chanceLoss > 0 && (
            <span className="ml-auto text-xs font-bold text-[#FF671F]">
              손실 ₩{item.chanceLoss.toLocaleString("ko-KR")}
            </span>
          )}
        </div>

        {/* 재고 progress bar */}
        <StockBar current={item.currentStock} max={maxForBar} />
      </div>
    </div>
  );
}

// ============================================================
// 재고·생산 탭
// ============================================================

export function InventoryTab() {
  const [showEvidence, setShowEvidence] = useState(false);
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());
  const [snackbar, setSnackbar] = useState<{ message: string; undoId: string } | null>(null);

  const handleRegister = (id: string) => {
    const item = mockInventoryItems.find((i) => i.id === id);
    if (!item) return;
    setRegisteredIds((prev) => new Set([...prev, id]));
    setSnackbar({ message: `${item.name} 생산 완료 등록됨 · 1시간 후 재고 반영`, undoId: id });
  };

  const handleUndo = () => {
    if (!snackbar) return;
    setRegisteredIds((prev) => {
      const next = new Set(prev);
      next.delete(snackbar.undoId);
      return next;
    });
    setSnackbar(null);
  };

  const displayItems = mockInventoryItems.map((item) =>
    registeredIds.has(item.id)
      ? { ...item, status: "normal" as ProductionStatus, chanceLoss: 0, aiReason: "생산 완료 등록됨 — 1시간 후 재고 반영" }
      : item
  );

  const currentChanceLoss = displayItems.reduce((sum, i) => sum + i.chanceLoss, 0);
  const currentUrgentCount = displayItems.filter((i) => i.status === "urgent").length;

  void totalChanceLoss;
  void urgentProductionCount;

  return (
    <div className="p-6 space-y-4">
      {/* 페이지 헤더 */}
      <div className="flex items-center gap-2">
        <h2 className="text-base font-black text-primary">생산 관리</h2>
        <span className="inline-flex items-center gap-1 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          <Sparkles size={9} />
          에이전트 A
        </span>
        <span className="text-xs text-secondary ml-1">기회손실 역추정 기반 생산 관리</span>
      </div>

      {/* 상단 3개 요약 카드 */}
      <div className="grid grid-cols-3 gap-3">
        {/* 기회손실 합산 */}
        <div className={`card p-4 ${currentChanceLoss > 0 ? "metric-top-orange" : ""}`}>
          <p className="text-xs text-secondary mb-1">현재 기회손실 추정</p>
          <p className={`text-2xl font-black tabular-nums leading-none ${currentChanceLoss > 0 ? "text-[#FF671F]" : "text-primary"}`}>
            {currentChanceLoss > 0 ? `₩${(currentChanceLoss / 10000).toFixed(1)}만` : "₩0"}
          </p>
          <p className="text-xs text-secondary mt-1.5">역추정 기준 (리드타임 1h)</p>
        </div>

        {/* 즉시 생산 필요 */}
        <div className={`card p-4 ${currentUrgentCount > 0 ? "metric-top-black" : ""}`}>
          <p className="text-xs text-secondary mb-1">즉시 생산 필요</p>
          <p className="text-2xl font-black text-primary tabular-nums leading-none">
            {currentUrgentCount > 0 ? `${currentUrgentCount}개 품목` : "없음"}
          </p>
          <p className="text-xs text-secondary mt-1.5">에이전트 A 감지</p>
        </div>

        {/* AI 근거 토글 */}
        <button
          onClick={() => setShowEvidence((v) => !v)}
          className="card card-hover p-4 text-left focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-1 transition-all"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles size={12} className="text-secondary" />
            <p className="text-xs text-secondary flex-1">AI 근거 보기</p>
            {showEvidence ? <ChevronUp size={13} className="text-secondary" /> : <ChevronDown size={13} className="text-secondary" />}
          </div>
          <p className="text-sm font-bold text-primary">역추정 공식</p>
        </button>
      </div>

      {/* AI 근거 패널 */}
      {showEvidence && <AiEvidencePanel />}

      {/* 품목 카드 리스트 */}
      <div className="space-y-3">
        {displayItems.map((item) => (
          <InventoryItemCard key={item.id} item={item} onRegister={handleRegister} />
        ))}
      </div>

      {/* Snackbar */}
      {snackbar && (
        <Snackbar message={snackbar.message} onUndo={handleUndo} onDismiss={() => setSnackbar(null)} />
      )}
    </div>
  );
}
