"use client";

import { useState } from "react";
import { Sparkles, Shield, ChevronRight, Check, Zap, RotateCcw, Home } from "lucide-react";
import { Stepper } from "@/shared/ui/Stepper";
import { mockHqOrderItems, mockAiOrderItems, mockFinalOrderItems } from "@/entities/mock/pos-data";
import type { OrderStep, FinalOrderItem, PosTab } from "@/shared/types/pos";

// ============================================================
// 3단계 진행 표시기 — connector line 스타일
// ============================================================

const STEPS = ["본사 지시 확인", "AI 검토", "점주 최종 확정"] as const;

function OrderStepper({ currentStep }: { currentStep: 1 | 2 | 3 }) {
  return (
    <div className="card px-6 py-4">
      <div className="flex items-center">
        {STEPS.map((label, idx) => {
          const stepNum = (idx + 1) as 1 | 2 | 3;
          const isDone = currentStep > stepNum;
          const isActive = currentStep === stepNum;

          return (
            <div key={label} className="flex items-center flex-1">
              {/* 스텝 원 + 라벨 */}
              <div className="flex flex-col items-center gap-1.5 min-w-0">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all
                  ${isDone   ? "bg-primary text-white"
                    : isActive ? "bg-primary text-white ring-4 ring-primary/15"
                    : "bg-[#f0f1f3] text-tertiary"}
                `}>
                  {isDone ? <Check size={14} /> : stepNum}
                </div>
                <div className="text-center">
                  <p className={`text-[10px] font-semibold leading-tight ${isActive ? "text-primary" : isDone ? "text-secondary" : "text-tertiary"}`}>
                    {label}
                  </p>
                </div>
              </div>

              {/* connector */}
              {idx < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${isDone ? "bg-primary" : "bg-[#e8e8e8]"}`} />
              )}
            </div>
          );
        })}
      </div>
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

      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-surface flex items-center justify-center">
              <Shield size={13} className="text-secondary" />
            </div>
            <span className="text-sm font-bold text-primary">본사 발주 지시 — 7월 3주차</span>
          </div>
          <span className="text-xs text-tertiary">{dateStr}</span>
        </div>

        <div className="grid grid-cols-[1fr_auto_auto] px-4 py-2 bg-[#f8f8f8] border-b border-border/60">
          <span className="text-xs font-semibold text-secondary">품목</span>
          <span className="text-xs font-semibold text-secondary text-right w-24">본사 지시 수량</span>
          <span className="text-xs font-semibold text-secondary text-right w-20">비고</span>
        </div>

        <div className="divide-y divide-border/50">
          {mockHqOrderItems.map((item, i) => (
            <div key={item.id} className={`grid grid-cols-[1fr_auto_auto] px-4 py-3.5 items-center ${i % 2 === 0 ? "" : "bg-[#fafafa]"}`}>
              <span className="text-sm font-medium text-primary">{item.name}</span>
              <span className="text-sm font-bold text-primary tabular-nums text-right w-24">{item.hqQty}{item.unit}</span>
              <span className="text-xs text-tertiary text-right w-20">{item.note}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onNext}
        className="
          btn-shimmer
          w-full h-12 bg-primary text-white rounded-xl
          flex items-center justify-center gap-2
          text-sm font-bold
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

      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary/8 flex items-center justify-center">
              <Sparkles size={13} className="text-primary" />
            </div>
            <span className="text-sm font-bold text-primary">AI 분석 결과 — 에이전트 B</span>
          </div>
          <span className="text-xs text-tertiary">과거 판매 패턴 + 기회손실 반영</span>
        </div>

        <div className="grid grid-cols-[1fr_80px_100px_1fr] px-4 py-2 bg-[#f8f8f8] border-b border-border/60">
          <span className="text-xs font-semibold text-secondary">품목</span>
          <span className="text-xs font-semibold text-secondary text-center">본사</span>
          <span className="text-xs font-semibold text-secondary text-center">AI 제안</span>
          <span className="text-xs font-semibold text-secondary text-right">변경 이유</span>
        </div>

        <div className="divide-y divide-border/50">
          {mockAiOrderItems.map((item, i) => (
            <div key={item.id} className={`grid grid-cols-[1fr_80px_100px_1fr] px-4 py-3.5 items-center gap-2 ${i % 2 === 0 ? "" : "bg-[#fafafa]"}`}>
              <span className="text-sm font-medium text-primary">{item.name}</span>
              <span className="text-sm text-tertiary text-center tabular-nums">{item.hqQty}{item.unit}</span>
              <div className="flex items-center justify-center gap-1.5">
                <span className={`text-sm font-black tabular-nums ${item.changed ? "text-primary" : "text-secondary"}`}>
                  {item.aiQtyDisplay}
                </span>
                {item.changed && (
                  <span className="text-[9px] font-bold bg-primary text-white px-1.5 py-0.5 rounded">
                    변경
                  </span>
                )}
              </div>
              <span className="text-xs text-secondary text-right leading-relaxed">{item.changeReason}</span>
            </div>
          ))}
        </div>
      </div>

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
            btn-shimmer
            flex-1 h-12 bg-primary text-white rounded-xl
            flex items-center justify-center gap-2
            text-sm font-bold
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

      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-success/10 flex items-center justify-center">
              <Check size={13} className="text-success" />
            </div>
            <span className="text-sm font-bold text-primary">최종 발주 확정</span>
          </div>
          <span className="text-xs text-tertiary">수량 직접 수정 가능</span>
        </div>

        <div className="divide-y divide-border/50">
          {items.map((item, i) => (
            <div key={item.id} className={`px-4 py-3.5 flex items-center gap-3 ${i % 2 === 0 ? "" : "bg-[#fafafa]"}`}>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-primary">{item.name}</p>
                <p className="text-xs text-secondary mt-0.5">{item.changeReason}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Stepper value={item.finalQty} onChange={(v) => onQtyChange(item.id, v)} min={0} max={999} />
                <span className="text-xs text-secondary w-6">{item.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

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
            btn-shimmer
            flex-1 h-12 bg-primary text-white rounded-xl
            flex items-center justify-center gap-2
            text-sm font-bold
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

function OrderComplete({ onRestart, onHome }: { onRestart: () => void; onHome: () => void }) {
  const now = new Date();
  const timeStr = `오늘 ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  return (
    <div className="card p-12 flex flex-col items-center gap-4">
      <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
        <Check size={32} className="text-success" strokeWidth={2.5} />
      </div>
      <div className="text-center">
        <p className="text-xl font-black text-primary">발주 확정 완료</p>
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
      <div className="flex items-center gap-2">
        <h2 className="text-base font-black text-primary">발주 관리</h2>
        <span className="inline-flex items-center gap-1 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          <Sparkles size={9} />
          에이전트 B
        </span>
        <span className="text-xs text-secondary ml-1">3단계 승인 플로우</span>
      </div>

      {step !== "complete" && <OrderStepper currentStep={step} />}

      {step === 1 && <Step1HqInstruction onNext={() => setStep(2)} />}
      {step === 2 && <Step2AiReview onPrev={() => setStep(1)} onNext={() => setStep(3)} />}
      {step === 3 && (
        <Step3FinalConfirm
          items={finalItems}
          onQtyChange={handleQtyChange}
          onPrev={() => setStep(2)}
          onConfirm={() => setStep("complete")}
        />
      )}
      {step === "complete" && (
        <OrderComplete onRestart={handleRestart} onHome={() => onNavigate("home")} />
      )}
    </div>
  );
}
