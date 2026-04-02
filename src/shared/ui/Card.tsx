import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  /** 긴급 상태 — 빨간 테두리 하이라이트 (UT 디자인) */
  urgent?: boolean;
}

/** 기본 카드 컨테이너 */
export function Card({ children, className = "", onClick, urgent = false }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-card rounded-2xl p-4
        shadow-[var(--shadow-card-sm)]
        transition-shadow duration-200
        ${urgent ? "ring-2 ring-error" : ""}
        ${onClick ? "cursor-pointer active:scale-[0.99] hover:shadow-[var(--shadow-card-md)] transition-all" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

/** 섹션 헤더 — 라벨 + 우측 액션 */
export function SectionHeader({
  label,
  sub,
  action,
}: {
  label: string;
  sub?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div>
        <span className="text-sm font-semibold text-primary">{label}</span>
        {sub && <span className="ml-2 text-xs text-tertiary">{sub}</span>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

/** 구분선 */
export function Divider({ className = "" }: { className?: string }) {
  return <hr className={`border-border ${className}`} />;
}
