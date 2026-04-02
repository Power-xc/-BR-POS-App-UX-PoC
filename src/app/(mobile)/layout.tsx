import { BottomNav } from "@/shared/ui/BottomNav";

/** 모바일 앱 셸 — 상태바 영역 + 하단 탭 */
export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full max-w-md mx-auto bg-surface relative">
      {/* 상단 상태바 영역 */}
      <header className="bg-primary text-white px-5 pt-14 pb-4 shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-white/60 font-medium">던킨 강남본점</p>
            <p className="text-[11px] text-white/40 mt-0.5">비 · 기온 18°C</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/60">09:41</p>
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
