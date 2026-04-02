"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface CountdownBannerProps {
  /** 배너 레이블 (예: "발주 마감까지") */
  label: string;
  /** 마감 시각 (Date 객체) */
  deadline: Date;
}

/** 남은 초를 mm:ss 로 포맷 */
function formatRemaining(seconds: number): string {
  if (seconds <= 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * 마감 임박 카운트다운 배너 — GCOO 스타일
 * - variant 자동 전환: info → warning(20분) → urgent(5분) + pulse
 * - 전폭 rounded-2xl 컬러 배너
 */
export function CountdownBanner({ label, deadline }: CountdownBannerProps) {
  const [remaining, setRemaining] = useState<number>(() =>
    Math.max(0, Math.floor((deadline.getTime() - Date.now()) / 1000))
  );

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(Math.max(0, Math.floor((deadline.getTime() - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  /* 남은 분 기준으로 variant 결정 */
  const minutes = Math.floor(remaining / 60);
  const variant: "info" | "warning" | "urgent" =
    minutes <= 5 ? "urgent" : minutes <= 20 ? "warning" : "info";

  const styles = {
    info: {
      wrap: "bg-primary/5 text-primary",
      icon: "text-primary/60",
      num: "text-primary",
    },
    warning: {
      wrap: "bg-dunkin/10 text-[#C04F00]",
      icon: "text-dunkin",
      num: "text-dunkin font-bold",
    },
    urgent: {
      wrap: "bg-error/10 text-error",
      icon: "text-error",
      num: "text-error font-bold",
    },
  } as const;

  const s = styles[variant];

  return (
    <div
      className={`
        flex items-center justify-between
        rounded-2xl px-4 py-3
        ${s.wrap}
        ${variant === "urgent" ? "countdown-urgent" : ""}
      `}
    >
      <div className="flex items-center gap-2">
        <Clock size={16} className={s.icon} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      {/* 카운트다운 숫자 — 우측 */}
      <span className={`text-base tabular-nums ${s.num}`}>
        {formatRemaining(remaining)}
      </span>
    </div>
  );
}
