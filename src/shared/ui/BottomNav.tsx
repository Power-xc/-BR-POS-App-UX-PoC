"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingCart, MessageCircle, Star } from "lucide-react";
import { mockNotifications } from "@/entities/mock/data";

const NAV_ITEMS = [
  { href: "/", label: "홈", icon: Home },
  { href: "/order", label: "AI발주", icon: ShoppingCart },
  { href: "/assistant", label: "AI비서", icon: MessageCircle },
  { href: "/review", label: "리뷰", icon: Star },
] as const;

/**
 * 하단 탭 내비게이션
 * - 배지: 24px, 탭 간 색상 반전(흰→검) — UT 피드백 반영
 * - 알림 우선순위별 배지 색상 적용
 */
export function BottomNav() {
  const pathname = usePathname();

  /* 읽지 않은 긴급 알림 수 */
  const urgentCount = mockNotifications.filter(
    (n) => !n.isRead && n.priority === "urgent"
  ).length;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{ boxShadow: "var(--shadow-sheet)" }}
    >
      {/* backdrop-blur + 반투명 배경 */}
      <div className="bg-white/90 backdrop-blur-xl">
        <div className="flex items-stretch h-16 max-w-md mx-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            /* 홈 탭에 긴급 알림 배지 표시 */
            const showBadge = href === "/" && urgentCount > 0;

            return (
              <Link
                key={href}
                href={href}
                className="
                  flex-1 flex flex-col items-center justify-center gap-0.5
                  relative transition-colors duration-150
                  active:bg-black/5
                  focus-visible:outline-none focus-visible:bg-black/5
                "
              >
                <div className="relative">
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    className={isActive ? "text-primary" : "text-tertiary"}
                  />
                  {/* 배지 — 검정 배경 흰 텍스트 (UT 피드백) */}
                  {showBadge && (
                    <span className="
                      absolute -top-1.5 -right-2
                      min-w-[18px] h-[18px] px-1
                      bg-primary text-white
                      text-[10px] font-bold
                      rounded-full flex items-center justify-center
                    ">
                      {urgentCount}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium ${
                    isActive ? "text-primary" : "text-tertiary"
                  }`}
                >
                  {label}
                </span>
                {/* active dot indicator — 아이콘 아래 2px 검정 dot */}
                {isActive && (
                  <span className="absolute bottom-1 w-1 h-1 bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
        {/* iOS 홈 인디케이터 safe area */}
        <div style={{ height: "env(safe-area-inset-bottom, 0px)" }} />
      </div>
    </nav>
  );
}
