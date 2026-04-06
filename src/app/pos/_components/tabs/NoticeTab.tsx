"use client";

import { useState } from "react";
import { Sparkles, ChevronDown, ChevronUp, X, ThumbsUp, FileText } from "lucide-react";
import {
  urgentNotices,
  cautionNotices,
  infoNotices,
} from "@/entities/mock/pos-data";
import type { PosNoticeItem, NoticePriority } from "@/shared/types/pos";

// ============================================================
// 우선순위 설정
// ============================================================

const PRIORITY_CONFIG: Record<
  NoticePriority,
  { label: string; badgeBg: string; badgeText: string; accentClass: string }
> = {
  urgent:  { label: "긴급", badgeBg: "bg-primary",       badgeText: "text-white",      accentClass: "accent-urgent"  },
  caution: { label: "주의", badgeBg: "bg-[#FF671F]/12",  badgeText: "text-[#FF671F]",  accentClass: "accent-warning" },
  info:    { label: "정보", badgeBg: "bg-[#f0f1f3]",     badgeText: "text-secondary",  accentClass: "accent-info"    },
};

// ============================================================
// 원문 보기 모달
// ============================================================

function OriginalModal({ notice, onClose }: { notice: PosNoticeItem; onClose: () => void }) {
  const cfg = PRIORITY_CONFIG[notice.priority];
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-lg mx-4 shadow-float overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border/60">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${cfg.badgeBg} ${cfg.badgeText}`}>
                {cfg.label}
              </span>
              <span className="text-xs text-tertiary">[{notice.tag}]</span>
            </div>
            <p className="text-base font-bold text-primary">{notice.title}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface transition-colors shrink-0"
          >
            <X size={16} className="text-secondary" />
          </button>
        </div>

        <div className="px-5 py-4">
          <p className="text-sm text-secondary leading-relaxed">{notice.body}</p>
          {notice.requiredAction && (
            <div className="mt-3 p-3 bg-[#f0f1f3] rounded-xl border border-border/50">
              <p className="text-xs font-bold text-primary mb-0.5">필요 조치</p>
              <p className="text-sm text-secondary">{notice.requiredAction}</p>
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-border/60 flex justify-end">
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-[#1a1a1a] transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 공지 카드
// ============================================================

function NoticeCard({
  notice,
  defaultOpen,
  isRead,
  onReadToggle,
}: {
  notice: PosNoticeItem;
  defaultOpen: boolean;
  isRead: boolean;
  onReadToggle: (id: string) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [showModal, setShowModal] = useState(false);
  const cfg = PRIORITY_CONFIG[notice.priority];

  return (
    <>
      <div className={`card overflow-hidden ${cfg.accentClass} transition-opacity ${isRead ? "opacity-50" : ""}`}>
        {/* 카드 헤더 */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="
            w-full px-4 py-3.5 pl-5 flex items-center gap-3 text-left
            hover:bg-[#fafafa] active:bg-[#f5f5f5]
            focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-[-2px]
            transition-colors
          "
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cfg.badgeBg} ${cfg.badgeText}`}>
                {cfg.label}
              </span>
              <span className="text-xs text-tertiary">[{notice.tag}]</span>
              {isRead && <span className="text-[10px] text-tertiary ml-auto">읽음</span>}
            </div>
            <p className={`text-sm font-bold ${isRead ? "text-secondary" : "text-primary"}`}>{notice.title}</p>
          </div>
          {open ? <ChevronUp size={15} className="text-secondary shrink-0" /> : <ChevronDown size={15} className="text-secondary shrink-0" />}
        </button>

        {/* 펼침 콘텐츠 */}
        {open && (
          <div className="px-4 pb-4 pl-5 border-t border-border/50">
            <p className="text-sm text-secondary leading-relaxed mt-3">{notice.body}</p>

            {notice.requiredAction && (
              <div className="mt-3 flex items-start gap-1.5">
                <Sparkles size={11} className="text-secondary shrink-0 mt-0.5" />
                <p className="text-sm text-secondary">
                  <span className="font-bold text-primary">필요 조치:</span>{" "}
                  {notice.requiredAction}
                </p>
              </div>
            )}

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => onReadToggle(notice.id)}
                className="
                  btn-shimmer
                  h-8 px-3 flex items-center gap-1.5 rounded-lg
                  bg-primary text-white text-xs font-bold
                  hover:bg-[#1a1a1a] active:scale-[0.97]
                  focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-1
                  transition-all
                "
              >
                <ThumbsUp size={11} />
                {isRead ? "확인 취소" : "확인 완료"}
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="
                  h-8 px-3 flex items-center gap-1.5 rounded-lg border border-border
                  bg-white text-xs font-medium text-secondary
                  hover:bg-surface active:bg-[#E8E8E8]
                  focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-1
                  transition-all
                "
              >
                <FileText size={11} />
                원문 보기
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && <OriginalModal notice={notice} onClose={() => setShowModal(false)} />}
    </>
  );
}

// ============================================================
// 공지·알림 탭
// ============================================================

export function NoticeTab() {
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [showAllInfo, setShowAllInfo] = useState(false);

  const toggleRead = (id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const urgentCount = urgentNotices.filter((n) => !readIds.has(n.id)).length;
  const cautionCount = cautionNotices.filter((n) => !readIds.has(n.id)).length;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-black text-primary">AI 공지 요약</h2>
        <span className="inline-flex items-center gap-1 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          <Sparkles size={9} />
          에이전트 C
        </span>
        <span className="text-xs text-secondary ml-1">하루 10건+ → 3건으로 압축</span>
      </div>

      {/* 요약 인포바 */}
      <div className="card px-4 py-3 flex items-center gap-3">
        <div className="w-5 h-5 rounded-full bg-[#f0f1f3] border border-border flex items-center justify-center shrink-0">
          <span className="text-[9px] font-bold text-secondary">i</span>
        </div>
        <p className="text-sm text-secondary">
          오늘 총 10건 중{" "}
          <span className="font-bold text-primary">즉시 조치 {urgentCount}건</span>,{" "}
          <span className="font-bold text-[#FF671F]">주의 {cautionCount}건</span>을 우선 요약했습니다.
          나머지 {infoNotices.length}건은 정보성 공지.
        </p>
      </div>

      {/* 긴급 공지 */}
      {urgentNotices.map((notice) => (
        <NoticeCard key={notice.id} notice={notice} defaultOpen isRead={readIds.has(notice.id)} onReadToggle={toggleRead} />
      ))}

      {/* 주의 공지 */}
      {cautionNotices.map((notice) => (
        <NoticeCard key={notice.id} notice={notice} defaultOpen={false} isRead={readIds.has(notice.id)} onReadToggle={toggleRead} />
      ))}

      {/* 정보 공지 */}
      {showAllInfo && infoNotices.map((notice) => (
        <NoticeCard key={notice.id} notice={notice} defaultOpen={false} isRead={readIds.has(notice.id)} onReadToggle={toggleRead} />
      ))}

      {!showAllInfo && (
        <button
          onClick={() => setShowAllInfo(true)}
          className="
            card card-hover w-full py-3.5
            text-sm text-secondary font-medium
            focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-1
            transition-all
          "
        >
          정보성 공지 {infoNotices.length}건 더 보기
        </button>
      )}
    </div>
  );
}
