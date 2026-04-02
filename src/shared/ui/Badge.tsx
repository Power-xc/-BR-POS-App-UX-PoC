import type { NotificationPriority } from "@/shared/types";

interface BadgeProps {
  priority: NotificationPriority;
  count?: number;
  /** 탭 배지 모드 — UT 근거: 24px, 지면 간 색상 반전 */
  tabMode?: boolean;
}

/** 알림 우선순위 배지 — 신호등 체계 (검정>회색>연회색) */
export function Badge({ priority, count, tabMode = false }: BadgeProps) {
  const styles: Record<NotificationPriority, string> = {
    urgent: "bg-primary text-white",
    warning: "bg-warning-neutral text-white",
    info: "bg-info-neutral text-primary",
  };

  if (tabMode && count !== undefined) {
    return (
      <span
        className={`
          inline-flex items-center justify-center
          min-w-[24px] h-[24px] px-1.5
          rounded-full text-xs font-semibold
          ${styles[priority]}
        `}
      >
        {count > 99 ? "99+" : count}
      </span>
    );
  }

  const dotStyles: Record<NotificationPriority, string> = {
    urgent: "bg-primary",
    warning: "bg-warning-neutral",
    info: "bg-info-neutral",
  };

  return <span className={`inline-block w-2 h-2 rounded-full ${dotStyles[priority]}`} />;
}

/** 상태 텍스트 배지 (품절/판매중) */
export function StatusBadge({
  label,
  variant,
}: {
  label: string;
  variant: "sold-out" | "active" | "warning";
}) {
  const variants = {
    "sold-out": "bg-[#F0F0F0] text-secondary text-xs px-2 py-0.5 rounded font-medium",
    active: "bg-[#E8F5EE] text-success text-xs px-2 py-0.5 rounded font-medium",
    warning: "bg-[#FFF3E0] text-[#E65100] text-xs px-2 py-0.5 rounded font-medium",
  };
  return <span className={variants[variant]}>{label}</span>;
}
