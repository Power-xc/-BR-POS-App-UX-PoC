"use client";

import { useState, useEffect } from "react";
import {
  Home, Package, Shield, BarChart2, Bell,
  Sparkles, RefreshCw, X, ChevronRight,
} from "lucide-react";
import type { PosTab } from "@/shared/types/pos";

// ============================================================
// 사이드바 탭 정의
// ============================================================

const TABS: {
  id: PosTab;
  label: string;
  sub: string;
  Icon: React.FC<{ size?: number; strokeWidth?: number; className?: string }>;
  agent: "A" | "B" | "C";
}[] = [
  { id: "home",      label: "홈",   sub: "현황",   Icon: Home,     agent: "C" },
  { id: "inventory", label: "생산", sub: "재고",   Icon: Package,  agent: "A" },
  { id: "order",     label: "발주", sub: "관리",   Icon: Shield,   agent: "B" },
  { id: "sales",     label: "매출", sub: "분석",   Icon: BarChart2, agent: "C" },
  { id: "notice",    label: "공지", sub: "알림",   Icon: Bell,     agent: "C" },
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
    <aside className="w-[72px] flex flex-col bg-[#0d0d0d] shrink-0 h-full">
      {/* 브랜드 마크 */}
      <div className="flex flex-col items-center pt-4 pb-3 border-b border-white/8">
        <div className="w-9 h-9 rounded-xl bg-[#FF671F] flex items-center justify-center shadow-lg">
          <span className="text-white font-black text-sm leading-none">D</span>
        </div>
      </div>

      {/* 탭 목록 */}
      <nav className="flex-1 flex flex-col items-center pt-2 pb-2 gap-0.5">
        {TABS.map(({ id, label, sub, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`
                w-14 py-2.5 flex flex-col items-center gap-1.5 rounded-xl
                transition-all duration-150
                focus-visible:outline-2 focus-visible:outline-white/40 focus-visible:outline-offset-1
                ${isActive
                  ? "bg-white text-[#0d0d0d]"
                  : "text-white/35 hover:text-white/65 hover:bg-white/8 active:bg-white/12"
                }
              `}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                size={17}
                strokeWidth={isActive ? 2.2 : 1.6}
                className={isActive ? "text-[#0d0d0d]" : "text-white/40"}
              />
              <span className={`text-[9px] font-bold leading-none tracking-wide ${isActive ? "text-[#0d0d0d]" : "text-white/35"}`}>
                {label}
              </span>
              {isActive && (
                <span className="text-[7px] font-medium text-[#0d0d0d]/50 leading-none -mt-0.5">
                  {sub}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Agent 뱃지 */}
      <div className="flex flex-col items-center pb-4 gap-1.5 border-t border-white/8 pt-3">
        <span className="text-[7px] text-white/25 font-semibold tracking-widest uppercase">Agent</span>
        <div className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex flex-col items-center justify-center gap-0">
          <Sparkles size={10} className="text-white/50" />
          <span className="text-[10px] font-bold text-white leading-none">{currentAgent}</span>
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
    <header className="h-13 bg-white border-b border-border flex items-center px-5 gap-4 shrink-0">
      {/* 왼쪽: 브레드크럼 */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-sm text-secondary">기존 웹 POS</span>
        <ChevronRight size={13} className="text-tertiary shrink-0" />
        <div className="flex items-center gap-1.5">
          <Sparkles size={13} className="text-primary shrink-0" strokeWidth={2} />
          <span className="text-sm font-bold text-primary">점주 전용 관리</span>
        </div>
        {/* 매장명 컨텍스트 */}
        <span className="ml-2 text-xs font-medium text-white bg-primary px-2 py-0.5 rounded-full">
          강남역점
        </span>
      </div>

      {/* 오른쪽: 시각 + 버튼 */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* 실시간 상태 도트 + 시각 */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse shrink-0" />
          <span className="text-xs text-secondary tabular-nums">
            {day}요일 <span className="font-semibold text-primary">{hh}:{mm}</span>
          </span>
        </div>

        <button className="
          h-8 px-3 flex items-center gap-1.5 rounded-lg
          bg-surface border border-border text-xs text-secondary
          hover:bg-[#E8E8E8] active:bg-[#DEDEDE]
          focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-1
          transition-colors
        ">
          <RefreshCw size={11} />
          실시간
        </button>

        <button
          onClick={onReturn}
          className="
            h-8 px-3.5 flex items-center gap-1.5 rounded-lg
            bg-primary text-white text-xs font-semibold
            hover:bg-[#1a1a1a] active:bg-[#2a2a2a]
            focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-1
            transition-colors
          "
        >
          ← 기존 POS
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
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!localStorage.getItem(BANNER_KEY)) setVisible(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(BANNER_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="bg-[#0d0d0d] text-white px-5 py-2.5 flex items-center gap-3 shrink-0">
      <div className="flex items-center gap-2 shrink-0">
        <Sparkles size={12} strokeWidth={2} className="text-white/60" />
        <span className="text-xs font-semibold text-white/80">AI 점주 포스</span>
      </div>
      <p className="flex-1 text-xs text-white/55 leading-snug">
        주문·결제 없이 <span className="text-white/80 font-medium">생산·발주·매출을 AI가 분석</span>합니다. 데이터는 기존 POS에서 자동 연동됩니다.
      </p>
      <button
        onClick={dismiss}
        className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
        aria-label="닫기"
      >
        <X size={11} />
      </button>
    </div>
  );
}

// ============================================================
// PosLayout
// ============================================================

interface PosLayoutProps {
  activeTab: PosTab;
  onTabChange: (tab: PosTab) => void;
  children: React.ReactNode;
}

export function PosLayout({ activeTab, onTabChange, children }: PosLayoutProps) {
  const handleReturn = () => {
    window.alert("기존 POS 화면으로 복귀합니다.\n(POC 데모: 실제 비알코리아 POS URL로 리다이렉트)");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f0f1f3]">
      <PosSidebar activeTab={activeTab} onTabChange={onTabChange} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <PosHeader onReturn={handleReturn} />
        <PosInfoBanner />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
