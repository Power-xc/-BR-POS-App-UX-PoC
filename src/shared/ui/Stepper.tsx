"use client";

import { useState, useEffect } from "react";

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /** AI 점수 표시 여부 */
  aiScore?: number;
}

/**
 * 수량 스테퍼
 * Fitts's Law: 버튼 최소 44px (시니어 오조작 방지)
 */
export function Stepper({
  value,
  onChange,
  min = 0,
  max = 999,
  aiScore,
}: StepperProps) {
  // 입력 중간 상태를 문자열로 관리 (스테퍼 중앙값 기준)
  const [inputVal, setInputVal] = useState(String(value));

  // 외부 value가 바뀌면(+/- 또는 부모 제어) 동기화
  useEffect(() => {
    setInputVal(String(value));
  }, [value]);

  const clamp = (n: number) => Math.max(min, Math.min(max, n));

  const commitInput = () => {
    const parsed = parseInt(inputVal, 10);
    if (!isNaN(parsed)) {
      onChange(clamp(parsed));
    } else {
      setInputVal(String(value));
    }
  };

  const handleDecrement = () => {
    const base = parseInt(inputVal, 10);
    const next = clamp((isNaN(base) ? value : base) - 1);
    onChange(next);
    setInputVal(String(next));
  };

  const handleIncrement = () => {
    const base = parseInt(inputVal, 10);
    const next = clamp((isNaN(base) ? value : base) + 1);
    onChange(next);
    setInputVal(String(next));
  };

  return (
    <div className="flex items-center gap-2">
      {aiScore !== undefined && (
        <span className="text-xs font-semibold text-secondary mr-1">
          AI점수
        </span>
      )}
      <div className="flex items-center gap-1 bg-surface rounded-lg p-0.5">
        <button
          onClick={handleDecrement}
          disabled={value <= min}
          aria-label="수량 감소"
          className="
            w-10 h-8 flex items-center justify-center
            rounded-xl text-lg font-medium text-primary
            hover:bg-[#E8E8E8] active:scale-95
            disabled:text-tertiary disabled:cursor-not-allowed
            transition-all duration-100
          "
        >
          −
        </button>
        <input
          className="w-10 text-center text-base font-semibold text-primary tabular-nums bg-transparent focus:outline-none"
          value={inputVal}
          inputMode="numeric"
          pattern="[0-9]*"
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9]/g, "");
            setInputVal(raw);
          }}
          onBlur={commitInput}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
        />
        <button
          onClick={handleIncrement}
          disabled={value >= max}
          aria-label="수량 증가"
          className="
            w-10 h-8 flex items-center justify-center
            rounded-xl text-lg font-medium text-primary
            hover:bg-[#E8E8E8] active:scale-95
            disabled:text-tertiary disabled:cursor-not-allowed
            transition-all duration-100
          "
        >
          +
        </button>
      </div>
    </div>
  );
}
