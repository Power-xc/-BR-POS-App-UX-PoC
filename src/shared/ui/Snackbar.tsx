"use client";

import { useEffect, useState } from "react";

interface SnackbarProps {
  message: string;
  /** Undo 스낵바 — UT 근거: 5초→8초, 탭 시 연장 가능 */
  onUndo?: () => void;
  onDismiss: () => void;
  /** 기본 8초 (UT 피드백 반영) */
  duration?: number;
}

/**
 * Undo 스낵바 — "Not Confirm" 패턴
 * UT 결과: 확인 팝업 반복은 피크타임 운영 속도 저해
 * "일단 실행, 8초 내 Undo" → 안정감 + 속도 동시 확보
 *
 * 변경 이력: 타이머 만료 시 onDismiss 를 setRemaining 업데이터 내부에서 직접 호출하면
 * 부모(예: HomePage) setState 가 자식 업데이트 중에 실행되어 React 19 hydration 경고가 난다.
 * queueMicrotask(onDismiss) 로 같은 틱 밖으로 미룸.
 */
export function Snackbar({
  message,
  onUndo,
  onDismiss,
  duration = 8000,
}: SnackbarProps) {
  const [remaining, setRemaining] = useState(duration);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 100) {
          clearInterval(interval);
          // 부모 setState는 자식 setState 업데이터 안에서 호출하면 안 됨 (React 19)
          queueMicrotask(onDismiss);
          return 0;
        }
        return prev - 100;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [duration, onDismiss]);

  /** 탭 시 타이머 연장 (UT 피드백 반영) */
  const handleExtend = () => {
    setRemaining(duration);
  };

  const progressPct = (remaining / duration) * 100;

  return (
    <div
      className="fixed bottom-24 left-4 right-4 z-50 snackbar-enter"
      onClick={handleExtend}
    >
      {/* relative 기준점 — absolute progress bar를 위해 필요 */}
      <div className="relative bg-primary text-white rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg overflow-hidden">
        {/* 타이머 프로그레스 바 */}
        <div className="absolute bottom-0 left-0 h-0.5 bg-white/30 transition-all duration-100"
          style={{ width: `${progressPct}%` }}
        />

        <span className="flex-1 text-sm font-medium">{message}</span>

        {onUndo && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUndo();
              onDismiss();
            }}
            className="text-sm font-bold text-white/90 hover:text-white underline underline-offset-2 shrink-0"
          >
            실행 취소
          </button>
        )}
      </div>
    </div>
  );
}
