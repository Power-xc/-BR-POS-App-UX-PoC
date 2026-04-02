import { type ReactNode } from "react";
import { Info, AlertTriangle, Calendar } from "lucide-react";

interface InfoBannerProps {
  /** 배너 유형 */
  variant?: "notice" | "event" | "alert";
  /** 제목 (선택) */
  title?: string;
  /** 본문 내용 */
  children: ReactNode;
  className?: string;
}

/**
 * 정보 배너 컴포넌트 — Skip 스타일
 * - 컬러 배경 (bg-[color]/10) + 좌측 컬러 border
 * - variant: notice(파랑) | event(보라) | alert(주황)
 * - 특이사항 카드, 이벤트 알림에 사용
 */
export function InfoBanner({
  variant = "notice",
  title,
  children,
  className = "",
}: InfoBannerProps) {
  const styles = {
    notice: {
      wrap: "bg-blue-50 border-l-2 border-blue-400",
      icon: <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />,
      title: "text-blue-700",
    },
    event: {
      wrap: "bg-purple-50 border-l-2 border-purple-400",
      icon: <Calendar size={14} className="text-purple-500 shrink-0 mt-0.5" />,
      title: "text-purple-700",
    },
    alert: {
      wrap: "bg-dunkin/8 border-l-2 border-dunkin",
      icon: <AlertTriangle size={14} className="text-dunkin shrink-0 mt-0.5" />,
      title: "text-[#C04F00]",
    },
  } as const;

  const s = styles[variant];

  return (
    <div className={`rounded-xl px-3 py-2.5 ${s.wrap} ${className}`}>
      <div className="flex gap-2 items-start">
        {s.icon}
        <div className="flex-1 min-w-0">
          {title && (
            <p className={`text-xs font-semibold mb-0.5 ${s.title}`}>{title}</p>
          )}
          <div className="text-xs text-secondary leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
}
