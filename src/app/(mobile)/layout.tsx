import { BottomNav } from "@/shared/ui/BottomNav";

/** 모바일 앱 셸 — 상태바 영역 + 하단 탭 */
export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full max-w-md mx-auto bg-surface relative">
      {/* 상단 상태바 영역 — Flighty 다크 히어로 스타일 */}
      <header className="bg-primary text-white px-5 pt-14 pb-5 shrink-0 rounded-b-3xl">
        <div className="flex items-end justify-between">
          <div>
            {/* 매장명 크게 + 던킨 오렌지 포인트 */}
            <div className="flex items-center gap-2">
              <p className="text-xl font-bold text-white">강남본점</p>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-dunkin/20 text-dunkin">
                DUNKIN
              </span>
            </div>
            {/* 날씨 정보 */}
            <p className="text-xs text-white/50 mt-1">🌧 비 · 18°C</p>
          </div>
          <div className="text-right">
            {/* 현재 시각 */}
            <p className="text-base font-semibold text-white/80">09:41</p>
            <p className="text-[11px] text-white/40 mt-0.5">AM</p>
          </div>
        </div>
      </header>

      {/* 콘텐츠 영역 — overflow-hidden으로 각 페이지가 자체 스크롤 관리 */}
      <main className="flex-1 min-h-0 overflow-hidden">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
