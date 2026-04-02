"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Stepper } from "@/shared/ui/Stepper";
import { Snackbar } from "@/shared/ui/Snackbar";
import { mockOrderItems } from "@/entities/mock/data";
import type { OrderItem } from "@/shared/types";

// ============================================================
// AI 점수 바 — 시각적 신뢰도 표시
// ============================================================

function AiScoreBar({ score }: { score: number }) {
  const color =
    score >= 70 ? "bg-primary" : score >= 40 ? "bg-warning-neutral" : "bg-info-neutral";

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-bold text-primary tabular-nums w-6 text-right">
        {score}
      </span>
    </div>
  );
}

// ============================================================
// 발주 아이템 카드
// ============================================================

function OrderItemCard({
  item,
  onQtyChange,
}: {
  item: OrderItem;
  onQtyChange: (id: string, qty: number) => void;
}) {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <Card className="mb-3">
      {/* 상품명 + AI 점수 */}
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm font-semibold text-primary">{item.name}</span>
        <span className="text-xs text-secondary">AI 점수</span>
      </div>

      <AiScoreBar score={item.aiScore} />

      {/* AI 근거 — 점주 언어로 변환 (UT 핵심: 기술 언어 금지) */}
      <div
        className="flex items-start gap-2 mt-3 bg-surface rounded-xl p-3 cursor-pointer"
        onClick={() => setShowDetail(!showDetail)}
      >
        <Info size={14} className="text-secondary mt-0.5 shrink-0" />
        <p className="text-xs text-secondary leading-relaxed flex-1">
          {item.aiReason}
        </p>
      </div>

      {/* 전주/전전주 비교 — 상세 토글 */}
      {showDetail && (
        <div className="mt-2 px-3 py-2 bg-[#FAFAFA] rounded-xl">
          <div className="flex justify-between text-xs text-secondary">
            <span>전주 동요일</span>
            <span className="font-medium text-primary">{item.lastWeekQty}개</span>
          </div>
          <div className="flex justify-between text-xs text-secondary mt-1">
            <span>전전주 동요일</span>
            <span className="font-medium text-primary">{item.prevWeekQty}개</span>
          </div>
        </div>
      )}

      {/* 수량 조절 — 수동 조정 (점주 최종 결정권 유지) */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <span className="text-xs text-secondary">수동 조정</span>
        <Stepper
          value={item.currentQty}
          onChange={(qty) => onQtyChange(item.id, qty)}
        />
      </div>
    </Card>
  );
}

// ============================================================
// AI 발주 페이지
// ============================================================

export default function OrderPage() {
  const [items, setItems] = useState<OrderItem[]>(mockOrderItems);
  const [approved, setApproved] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const handleQtyChange = (id: string, qty: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, currentQty: qty } : item))
    );
  };

  const totalQty = items.reduce((sum, item) => sum + item.currentQty, 0);

  const handleApproveAll = () => {
    setApproved(true);
    setSnackbar(`AI 제안 일괄 승인 완료 (총 ${totalQty}개)`);
  };

  const handleUndo = () => {
    setApproved(false);
  };

  return (
    <div className="h-full overflow-y-auto hide-scrollbar px-4 py-4 pb-20">
      {/* 페이지 헤더 */}
      <div className="mb-4">
        <h1 className="text-lg font-bold text-primary">설명 가능한 AI 발주</h1>
        <p className="text-xs text-secondary mt-0.5">
          AI 근거를 설명하고, 수동 조정 시 제게 리스크를 실시간 시뮬레이션합니다.
        </p>
      </div>

      {/* 발주 아이템 목록 */}
      {items.map((item) => (
        <OrderItemCard key={item.id} item={item} onQtyChange={handleQtyChange} />
      ))}

      {/* 일괄 승인 — Fitts's Law: 대형 CTA */}
      <div className="mt-2">
        <Button
          size="lg"
          fullWidth
          onClick={handleApproveAll}
          disabled={approved}
        >
          {approved ? "승인 완료" : `AI 제안 일괄 승인`}
        </Button>
        {approved && (
          <p className="text-xs text-success text-center mt-2 font-medium">
            발주서가 전송됐습니다.
          </p>
        )}
      </div>

      <div className="h-4" />

      {snackbar && (
        <Snackbar
          message={snackbar}
          onUndo={handleUndo}
          onDismiss={() => setSnackbar(null)}
        />
      )}
    </div>
  );
}
