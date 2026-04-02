import { type ButtonHTMLAttributes, type ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  children: ReactNode;
}

/**
 * 버튼 컴포넌트
 * - primary: 블랙 CTA (결제, 승인 등 핵심 액션)
 * - Fitts's Law: lg 사이즈가 기본 주요 액션 크기 (UT 근거)
 * - 인터랙티브 상태 5가지 전부 구현
 */
export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 select-none";

  const variants = {
    primary:
      "bg-primary text-white hover:bg-[#1a1a1a] active:scale-[0.98] active:bg-[#333] disabled:bg-[#C7C7C7] disabled:text-[#9E9E9E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
    secondary:
      "bg-card text-primary border border-border hover:bg-[#F0F0F0] active:scale-[0.98] active:bg-[#E8E8E8] disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
    ghost:
      "bg-transparent text-secondary hover:bg-[#F0F0F0] active:bg-[#E8E8E8] disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary",
    danger:
      "bg-error text-white hover:bg-[#b91c1c] active:scale-[0.98] disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error",
  };

  /* Fitts's Law — 주요 버튼(lg)은 최소 56px 높이로 터치 영역 확보 */
  const sizes = {
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-5 text-sm",
    lg: "h-14 px-6 text-base",
  };

  return (
    <button
      disabled={disabled}
      className={`
        ${base}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
