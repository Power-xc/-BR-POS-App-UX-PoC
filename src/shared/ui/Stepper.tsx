"use client";

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
export function Stepper({ value, onChange, min = 0, max = 999, aiScore }: StepperProps) {
  const handleDecrement = () => {
    if (value > min) onChange(value - 1);
  };

  const handleIncrement = () => {
    if (value < max) onChange(value + 1);
  };

  return (
    <div className="flex items-center gap-2">
      {aiScore !== undefined && (
        <span className="text-xs font-semibold text-secondary mr-1">
          AI점수 <span className="text-primary">{aiScore}</span>
        </span>
      )}
      <div className="flex items-center gap-1 bg-surface rounded-lg p-0.5">
        <button
          onClick={handleDecrement}
          disabled={value <= min}
          aria-label="수량 감소"
          className="
            w-10 h-10 flex items-center justify-center
            rounded-md text-lg font-medium text-primary
            hover:bg-[#E8E8E8] active:scale-95
            disabled:text-tertiary disabled:cursor-not-allowed
            transition-all duration-100
          "
        >
          −
        </button>
        <span className="w-10 text-center text-base font-semibold text-primary tabular-nums">
          {value}
        </span>
        <button
          onClick={handleIncrement}
          disabled={value >= max}
          aria-label="수량 증가"
          className="
            w-10 h-10 flex items-center justify-center
            rounded-md text-lg font-medium text-primary
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
