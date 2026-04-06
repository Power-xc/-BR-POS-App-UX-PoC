"use client";

import { useState, useEffect } from "react";
import { Home, Package, Shield, BarChart2, Bell, Sparkles, RefreshCw, X } from "lucide-react";
import type { PosTab } from "@/shared/types/pos";

// ============================================================
// 사이드바 탭 정의
// ============================================================

const TABS: {
  id: PosTab;
  label: string;
  Icon: React.FC<{ size?: number; strokeWidth?: number; className?: string }>;
  agent: "A" | "B" | "C";
}[] = [
  { id: "home", label: "홈·현황", Icon: Home, agent: "C" },
  { id: "inventory", label: "재고·생산", Icon: Package, agent: "A" },
  { id: "order", label: "발주", Icon: Shield, agent: "B" },
  { id: "sales", label: "매출·분석", Icon: BarChart2, agent: "C" },
  { id: "notice", label: "공지·알림", Icon: Bell, agent: "C" },
];

// ============================================================
// 사이드바
// ============================================================

function PosSidebar({
  activeTab,
  onTabChange,
}: {
  activeTab: PosTab;
  onTabChange: (tab: PosTab) => void;
}) {
  const currentAgent = TABS.find((t) => t.id === activeTab)?.agent ?? "C";

  return (
    <aside className="w-16 flex flex-col bg-[#0a0a0a] shrink-0 h-full">
      {/* 탭 목록 */}
      <nav className="flex-1 flex flex-col items-center pt-3 gap-1">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`
                w-12 py-2.5 flex flex-col items-center gap-1 rounded-xl
                transition-all duration-150
                focus-visible:outline-2 focus-visible:outline-white/40 focus-visible:outline-offset-1
                ${isActive
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:text-white/70 hover:bg-white/5 active:bg-white/10"
                }
              `}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
              <span className={`text-[9px] font-medium leading-none ${isActive ? "text-white" : "text-white/40"}`}>
                {label.split("·")[0]}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Agent 뱃지 — 현재 탭의 에이전트 표시 */}
      <div className="flex flex-col items-center pb-4 gap-1">
        <span className="text-[8px] text-white/30 font-medium tracking-widest">AGENT</span>
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
          <span className="text-xs font-bold text-white">{currentAgent}</span>
        </div>
      </div>
    </aside>
  );
}

// ============================================================
// 상단 헤더
// ============================================================

function PosHeader({ onReturn }: { onReturn: () => void }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const day = weekdays[now.getDay()];
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");

  return (
    <header className="h-12 bg-white border-b border-border flex items-center px-4 gap-3 shrink-0">
      {/* 로고 + 브레드크럼 */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Sparkles size={16} className="text-primary shrink-0" strokeWidth={2} />
        <span className="text-base font-bold text-primary">점주 포스</span>
        <div className="flex items-center gap-1.5 text-sm text-secondary ml-1">
          <span>기존 웹 POS</span>
          <span className="text-tertiary">→</span>
          <span>점주 전용 관리</span>
        </div>
      </div>

      {/* 우측: 시각 + 버튼 */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1 text-sm text-secondary">
          <span>{day}요일</span>
          <span className="tabular-nums font-medium text-primary">{hh}:{mm}</span>
        </div>

        <button className="
          h-7 px-2.5 flex items-center gap-1.5 rounded-lg
          bg-surface border border-border text-xs text-secondary
          hover:bg-[#E8E8E8] active:bg-[#DEDEDE]
          focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-1
          transition-colors
        ">
          <RefreshCw size={11} />
          실시간 업데이트
        </button>

        <button
          onClick={onReturn}
          className="
            h-7 px-2.5 flex items-center gap-1.5 rounded-lg
            bg-primary text-white text-xs font-medium
            hover:bg-[#1a1a1a] active:bg-[#2a2a2a]
            focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-1
            transition-colors
          "
        >
          ← 기존 POS 복귀
        </button>
      </div>
    </header>
  );
}

// ============================================================
// 다크 인포 배너 (최초 1회, localStorage 기억)
// ============================================================

const BANNER_KEY = "pos-info-banner-dismissed";

function PosInfoBanner() {
  /* lazy initializer — SSR 안전: typeof window 체크 후 localStorage 읽기 */
  const [visible, setVisible] = useState<boolean>(
    () => typeof window !== "undefined" && !localStorage.getItem(BANNER_KEY)
  );

  const dismiss = () => {
    localStorage.setItem(BANNER_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="bg-primary text-white px-4 py-2.5 flex items-center gap-3 shrink-0">
      <Sparkles size={14} strokeWidth={2} className="shrink-0" />
      <p className="flex-1 text-sm leading-snug">
        <span className="font-semibold">점주 포스</span>
        {" "}— 기존 웹 POS 내 버튼 클릭 시 진입하는 점주 전용 관리 화면입니다.
        주문·결제 없이{" "}
        <span className="font-semibold">AI 기반 생산·발주·매출 관리</span>에 집중합니다.
      </p>
      <button
        onClick={dismiss}
        className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
        aria-label="닫기"
      >
        <X size={13} />
      </button>
    </div>
  );
}

// ============================================================
// PosLayout — 최상위 레이아웃 래퍼
// ============================================================

interface PosLayoutProps {
  activeTab: PosTab;
  onTabChange: (tab: PosTab) => void;
  children: React.ReactNode;
}

export function PosLayout({ activeTab, onTabChange, children }: PosLayoutProps) {
  /** 기존 POS 복귀 — POC에서는 Snackbar 안내 */
  const handleReturn = () => {
    window.alert("기존 POS 화면으로 복귀합니다.\n(POC 데모: 실제 비알코리아 POS URL로 리다이렉트)");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* 좌측 사이드바 */}
      <PosSidebar activeTab={activeTab} onTabChange={onTabChange} />

      {/* 우측 메인 영역 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 헤더 */}
        <PosHeader onReturn={handleReturn} />

        {/* 다크 인포 배너 */}
        <PosInfoBanner />

        {/* 탭 콘텐츠 */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
