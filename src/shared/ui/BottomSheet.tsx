"use client";

import { useEffect, type ReactNode } from "react";

interface BottomSheetProps {
  /** 시트 열림 여부 */
  isOpen: boolean;
  /** 닫기 콜백 (dim overlay 탭 or 내부 닫기 버튼) */
  onClose: () => void;
  /** 시트 제목 (선택) */
  title?: string;
  children: ReactNode;
}

/**
 * 바텀시트 컴포넌트 — Flighty 스타일
 * - 하단 슬라이드업 (translateY 300ms ease-out)
 * - 배경 dim overlay (bg-black/40, tap to close)
 * - 상단 drag handle (w-10 h-1 bg-border)
 * - rounded-t-3xl + shadow-sheet
 */
export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  /* 열려있을 때 body 스크롤 잠금 */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    /* dim overlay */
    <div
      className="fixed inset-0 z-50 flex items-end"
      onClick={onClose}
    >
      {/* 반투명 배경 */}
      <div className="absolute inset-0 bg-black/40" />

      {/* 시트 본체 — 클릭 이벤트 버블링 차단 */}
      <div
        className="
          relative w-full max-w-md mx-auto
          bg-card rounded-t-3xl
          pt-3 pb-8 px-5
          animate-[slideup_300ms_ease-out]
        "
        style={{ boxShadow: "var(--shadow-sheet)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* drag handle */}
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 bg-border rounded-full" />
        </div>

        {/* 제목 */}
        {title && (
          <h2 className="text-base font-semibold text-primary mb-4">{title}</h2>
        )}

        {children}
      </div>

      {/* 슬라이드업 애니메이션 keyframe */}
      <style>{`
        @keyframes slideup {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
