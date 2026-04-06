"use client";

import { useState } from "react";
import { Sparkles, Shield, ChevronRight, Check, Zap, RotateCcw, Home } from "lucide-react";
import { Stepper } from "@/shared/ui/Stepper";
import { mockHqOrderItems, mockAiOrderItems, mockFinalOrderItems } from "@/entities/mock/pos-data";
import type { OrderStep, FinalOrderItem, PosTab } from "@/shared/types/pos";

// ============================================================
// 3단계 진행 표시기
// ============================================================

const STEPS = ["본사 지시 확인", "AI 검토", "점주 최종 확정"] as const;

function OrderStepper({ currentStep }: { currentStep: 1 | 2 | 3 }) {
  return (
    <div className="flex items-stretch gap-0">
      {STEPS.map((label, idx) => {
        const stepNum = (idx + 1) as 1 | 2 | 3;
        const isDone = currentStep > stepNum;
        const isActive = currentStep === stepNum;

        return (
          <div key={label} className={`
            flex-1 flex items-center gap-2 px-4 py-3 border
            transition-all
            ${isActive
              ? "bg-primary border-primary text-white"
              : isDone
                ? "bg-white border-border text-secondary"
                : "bg-white border-border text-tertiary"
            }
            ${idx === 0 ? "rounded-l-xl" : ""}
            ${idx === STEPS.length - 1 ? "rounded-r-xl" : ""}
            ${idx > 0 ? "border-l-0" : ""}
          `}>
            {/* 아이콘 */}
            <div className={`
              w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0
              ${isActive
                ? "bg-white text-primary"
                : isDone
                  ? "bg-success text-white"
                  : "bg-border text-tertiary"
              }
            `}>
              {isDone ? <Check size={10} /> : stepNum}
            </div>

            {/* 라벨 */}
            <div className="min-w-0">
              <p className={`text-[11px] ${isActive ? "text-white/70" : "text-tertiary"}`}>
                {stepNum === 1 ? "①" : stepNum === 2 ? "②" : "③"}
              </p>
              <p className={`text-xs font-semibold leading-tight ${isActive ? "text-white" : isDone ? "text-secondary" : "text-tertiary"}`}>
                {label}
              </p>
            </div>

            {/* 완료 표시 */}
            {isDone && (
              <div className="ml-auto">
                <Check size={14} className="text-success" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// Step 1: 본사 지시 확인
// ============================================================

function Step1HqInstruction({ onNext }: { onNext: () => void }) {
  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")} 09:00`;

  return (
    <div className="space-y-4">
      <p className="text-sm text-secondary">본사에서 내린 발주 지시사항을 확인합니다.</p>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {/* 테이블 헤더 */}
        <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-secondary" />
            <span className="text-sm font-semibold text-primary">본사 발주 지시 — 7월 3주차</span>
          </div>
          <span className="text-xs text-tertiary">{dateStr}</span>
        </div>

        {/* 컬럼 헤더 */}
        <div className="grid grid-cols-[1fr_auto_auto] px-4 py-2 bg-surface border-b border-border">
          <span className="text-xs font-medium text-secondary">품목</span>
          <span className="text-xs font-medium text-secondary text-right w-24">본사 지시 수량</span>
          <span className="text-xs font-medium text-secondary text-right w-20">비고</span>
        </div>

        {/* 품목 행 */}
        <div className="divide-y divide-border">
          {mockHqOrderItems.map((item) => (
            <div key={item.id} className="grid grid-cols-[1fr_auto_auto] px-4 py-3.5 items-center">
              <span className="text-sm font-medium text-primary">{item.name}</span>
              <span className="text-sm font-semibold text-primary tabular-nums text-right w-24">
                {item.hqQty}{item.unit}
              </span>
              <span className="text-xs text-tertiary text-right w-20">{item.note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={onNext}
        className="
          w-full h-12 bg-primary text-white rounded-xl
          flex items-center justify-center gap-2
          text-sm font-semibold
          hover:bg-[#1a1a1a] active:bg-[#2a2a2a] active:scale-[0.99]
          focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-1
          transition-all
        "
      >
        확인 — AI 분석으로 넘기기
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

// ============================================================
// Step 2: AI 검토
// ============================================================

function Step2AiReview({ onPrev, onNext }: { onPrev: () => void; onNext: () => void }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-secondary">AI가 판매 데이터를 분석해 발주량을 보정 제안합니다.</p>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {/* 헤더 */}
        <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-primary" />
            <span className="text-sm font-semibold text-primary">AI 분석 결과 — 에이전트 B</span>
          </div>
          <span className="text-xs text-tertiary">과거 판매 패턴 + 기회손실 반영</span>
        </div>

        {/* 컬럼 헤더 */}
        <div className="grid grid-cols-[1fr_80px_100px_1fr] px-4 py-2 bg-surface border-b border-border">
          <span className="text-xs font-medium text-secondary">품목</span>
          <span className="text-xs font-medium text-secondary text-center">본사</span>
          <span className="text-xs font-medium text-secondary text-center">AI 제안</span>
          <span className="text-xs font-medium text-secondary text-right">변경 이유</span>
        </div>

        {/* 품목 행 */}
        <div className="divide-y divide-border">
          {mockAiOrderItems.map((item) => (
            <div key={item.id} className="grid grid-cols-[1fr_80px_100px_1fr] px-4 py-3.5 items-center gap-2">
              <span className="text-sm font-medium text-primary">{item.name}</span>
              <span className="text-sm text-tertiary text-center tabular-nums">
                {item.hqQty}{item.unit}
              </span>
              <div className="flex items-center justify-center gap-1.5">
                <span className={`text-sm font-bold tabular-nums ${item.changed ? "text-primary" : "text-secondary"}`}>
                  {item.aiQtyDisplay}
                </span>
                {item.changed && (
                  <span className="text-[10px] font-bold bg-primary text-white px-1.5 py-0.5 rounded">
                    변경
                  </span>
                )}
              </div>
              <span className="text-xs text-secondary text-right leading-relaxed">{item.changeReason}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="flex gap-2">
        <button
          onClick={onPrev}
          className="
            h-12 px-5 flex items-center gap-1.5 rounded-xl border border-border
            text-sm font-medium text-secondary bg-white
            hover:bg-surface active:bg-[#E8E8E8]
            focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-1
            transition-all
          "
        >
          ← 이전
        </button>
        <button
          onClick={onNext}
          className="
            flex-1 h-12 bg-primary text-white rounded-xl
            flex items-center justify-center gap-2
            text-sm font-semibold
            hover:bg-[#1a1a1a] active:bg-[#2a2a2a] active:scale-[0.99]
            focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-1
            transition-all
          "
        >
          AI 추천 수량으로 최종 확인
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Step 3: 점주 최종 확정
// ============================================================

function Step3FinalConfirm({
  items,
  onQtyChange,
  onPrev,
  onConfirm,
}: {
  items: FinalOrderItem[];
  onQtyChange: (id: string, qty: number) => void;
  onPrev: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-secondary">점주가 수량을 최종 조정하고 발주를 확정합니다.</p>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check size={14} className="text-success" />
            <span className="text-sm font-semibold text-primary">최종 발주 확정 — 점주 조정 가능</span>
          </div>
          <span className="text-xs text-tertiary">수량 직접 수정 가능</span>
        </div>

        <div className="divide-y divide-border">
          {items.map((item) => (
            <div key={item.id} className="px-4 py-3.5 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-primary">{item.name}</p>
                <p className="text-xs text-secondary mt-0.5">{item.changeReason}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Stepper
                  value={item.finalQty}
                  onChange={(v) => onQtyChange(item.id, v)}
                  min={0}
                  max={999}
                />
                <span className="text-xs text-secondary w-6">{item.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="flex gap-2">
        <button
          onClick={onPrev}
          className="
            h-12 px-5 flex items-center gap-1.5 rounded-xl border border-border
            text-sm font-medium text-secondary bg-white
            hover:bg-surface active:bg-[#E8E8E8]
            focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-1
            transition-all
          "
        >
          ← 이전
        </button>
        <button
          onClick={onConfirm}
          className="
            flex-1 h-12 bg-primary text-white rounded-xl
            flex items-center justify-center gap-2
            text-sm font-semibold
            hover:bg-[#1a1a1a] active:bg-[#2a2a2a] active:scale-[0.99]
            focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-1
            transition-all
          "
        >
          <Zap size={15} />
          발주 최종 확정 전송
        </button>
      </div>
    </div>
  );
}

// ============================================================
// 완료 화면
// ============================================================

function OrderComplete({
  onRestart,
  onHome,
}: {
  onRestart: () => void;
  onHome: () => void;
}) {
  const now = new Date();
  const timeStr = `오늘 ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  return (
    <div className="bg-white rounded-xl border border-border p-12 flex flex-col items-center gap-4">
      <div className="w-14 h-14 rounded-full bg-surface flex items-center justify-center">
        <Check size={28} className="text-secondary" strokeWidth={2.5} />
      </div>
      <div className="text-center">
        <p className="text-xl font-bold text-primary">발주 확정 완료</p>
        <p className="text-sm text-secondary mt-1">{timeStr} · 이력 저장됨</p>
      </div>
      <div className="flex gap-2 mt-2">
        <button
          onClick={onHome}
          className="
            h-10 px-4 flex items-center gap-1.5 rounded-lg border border-border
            text-sm font-medium text-secondary bg-white
            hover:bg-surface active:bg-[#E8E8E8]
            focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-1
            transition-all
          "
        >
          <Home size={14} />
          홈으로
        </button>
        <button
          onClick={onRestart}
          className="
            h-10 px-4 flex items-center gap-1.5 rounded-lg border border-border
            text-sm font-medium text-secondary bg-white
            hover:bg-surface active:bg-[#E8E8E8]
            focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-1
            transition-all
          "
        >
          <RotateCcw size={13} />
          새 발주 시작
        </button>
      </div>
    </div>
  );
}

// ============================================================
// 발주 탭 — 3단계 위자드
// ============================================================

interface OrderTabProps {
  onNavigate: (tab: PosTab) => void;
}

export function OrderTab({ onNavigate }: OrderTabProps) {
  const [step, setStep] = useState<OrderStep>(1);
  const [finalItems, setFinalItems] = useState<FinalOrderItem[]>(
    mockFinalOrderItems.map((item) => ({ ...item }))
  );

  const handleQtyChange = (id: string, qty: number) => {
    setFinalItems((prev) =>
      prev.map((item) => item.id === id ? { ...item, finalQty: qty } : item)
    );
  };

  const handleRestart = () => {
    setStep(1);
    setFinalItems(mockFinalOrderItems.map((item) => ({ ...item })));
  };

  return (
    <div className="p-6 space-y-4">
      {/* 페이지 헤더 */}
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold text-primary">발주 관리</h2>
        <span className="inline-flex items-center gap-1 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          <Sparkles size={9} />
          에이전트 B
        </span>
        <span className="text-sm text-secondary ml-1">3단계 승인 플로우</span>
      </div>

      {/* 3단계 스텝 표시 */}
      {step !== "complete" && <OrderStepper currentStep={step} />}

      {/* 단계별 콘텐츠 */}
      {step === 1 && (
        <Step1HqInstruction onNext={() => setStep(2)} />
      )}
      {step === 2 && (
        <Step2AiReview onPrev={() => setStep(1)} onNext={() => setStep(3)} />
      )}
      {step === 3 && (
        <Step3FinalConfirm
          items={finalItems}
          onQtyChange={handleQtyChange}
          onPrev={() => setStep(2)}
          onConfirm={() => setStep("complete")}
        />
      )}
      {step === "complete" && (
        <OrderComplete
          onRestart={handleRestart}
          onHome={() => onNavigate("home")}
        />
      )}
    </div>
  );
}
