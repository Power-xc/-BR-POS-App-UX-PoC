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
// 우선순위 뱃지 설정
// ============================================================

const PRIORITY_CONFIG: Record<
  NoticePriority,
  { label: string; bg: string; text: string; border: string }
> = {
  urgent: {
    label: "긴급",
    bg: "bg-primary",
    text: "text-white",
    border: "border-primary/20",
  },
  caution: {
    label: "주의",
    bg: "bg-[#FFF3E0]",
    text: "text-[#E65100]",
    border: "border-[#FFD54F]/50",
  },
  info: {
    label: "정보",
    bg: "bg-surface",
    text: "text-secondary",
    border: "border-border",
  },
};

// ============================================================
// 원문 보기 모달
// ============================================================

function OriginalModal({
  notice,
  onClose,
}: {
  notice: PosNoticeItem;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg mx-4 shadow-float overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`
                text-[11px] font-bold px-1.5 py-0.5 rounded
                ${PRIORITY_CONFIG[notice.priority].bg}
                ${PRIORITY_CONFIG[notice.priority].text}
              `}>
                {PRIORITY_CONFIG[notice.priority].label}
              </span>
              <span className="text-xs text-tertiary">[{notice.tag}]</span>
            </div>
            <p className="text-base font-semibold text-primary">{notice.title}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface transition-colors shrink-0"
          >
            <X size={16} className="text-secondary" />
          </button>
        </div>

        {/* 본문 */}
        <div className="px-5 py-4">
          <p className="text-sm text-secondary leading-relaxed">{notice.body}</p>
          {notice.requiredAction && (
            <div className="mt-3 p-3 bg-surface rounded-lg border border-border">
              <p className="text-xs font-semibold text-primary mb-0.5">필요 조치</p>
              <p className="text-sm text-secondary">{notice.requiredAction}</p>
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="px-5 py-3 border-t border-border flex justify-end">
          <button
            onClick={onClose}
            className="
              h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium
              hover:bg-[#1a1a1a] transition-colors
            "
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
  onReadToggle,
}: {
  notice: PosNoticeItem;
  defaultOpen: boolean;
  onReadToggle: (id: string) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [showModal, setShowModal] = useState(false);
  const cfg = PRIORITY_CONFIG[notice.priority];

  return (
    <>
      <div className={`bg-white rounded-xl border overflow-hidden ${cfg.border}`}>
        {/* 카드 헤더 (항상 보임) */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="
            w-full px-4 py-3.5 flex items-center gap-3 text-left
            hover:bg-surface active:bg-[#EEEEEE]
            focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-[-2px]
            transition-colors
          "
        >
          {/* 우선순위 뱃지 + 태그 + 제목 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                {cfg.label}
              </span>
              <span className="text-xs text-tertiary">[{notice.tag}]</span>
            </div>
            <p className="text-sm font-semibold text-primary">{notice.title}</p>
          </div>
          {open
            ? <ChevronUp size={16} className="text-secondary shrink-0" />
            : <ChevronDown size={16} className="text-secondary shrink-0" />
          }
        </button>

        {/* 펼침 콘텐츠 */}
        {open && (
          <div className="px-4 pb-4 border-t border-border">
            <p className="text-sm text-secondary leading-relaxed mt-3">{notice.body}</p>

            {/* 필요 조치 (긴급 건) */}
            {notice.requiredAction && (
              <div className="mt-3 flex items-start gap-1.5">
                <Sparkles size={11} className="text-secondary shrink-0 mt-0.5" />
                <p className="text-sm text-secondary">
                  <span className="font-medium text-primary">필요 조치:</span>{" "}
                  {notice.requiredAction}
                </p>
              </div>
            )}

            {/* 액션 버튼 */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => onReadToggle(notice.id)}
                className="
                  h-8 px-3 flex items-center gap-1.5 rounded-lg
                  bg-primary text-white text-xs font-semibold
                  hover:bg-[#1a1a1a] active:scale-[0.97]
                  focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-1
                  transition-all
                "
              >
                <ThumbsUp size={11} />
                확인 완료
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

      {/* 원문 보기 모달 */}
      {showModal && (
        <OriginalModal notice={notice} onClose={() => setShowModal(false)} />
      )}
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
      {/* 페이지 헤더 */}
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold text-primary">AI 공지 요약</h2>
        <span className="inline-flex items-center gap-1 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          <Sparkles size={9} />
          에이전트 C
        </span>
        <span className="text-sm text-secondary ml-1">하루 10건+ → 3건으로 압축</span>
      </div>

      {/* 요약 인포바 */}
      <div className="bg-surface rounded-xl border border-border px-4 py-3 flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-border flex items-center justify-center shrink-0">
          <span className="text-[10px] font-bold text-secondary">i</span>
        </div>
        <p className="text-sm text-secondary">
          오늘 총 10건의 공지 중{" "}
          <span className="font-semibold text-primary">즉시 조치 필요 {urgentCount}건</span>,{" "}
          <span className="font-semibold text-primary">주의 {cautionCount}건</span>을 우선 요약했습니다.
          나머지 {infoNotices.length}건은 정보성 공지로 분류됩니다.
        </p>
      </div>

      {/* 긴급 공지 */}
      {urgentNotices.map((notice) => (
        <NoticeCard
          key={notice.id}
          notice={notice}
          defaultOpen
          onReadToggle={toggleRead}
        />
      ))}

      {/* 주의 공지 */}
      {cautionNotices.map((notice) => (
        <NoticeCard
          key={notice.id}
          notice={notice}
          defaultOpen={false}
          onReadToggle={toggleRead}
        />
      ))}

      {/* 정보 공지 (기본 숨김) */}
      {showAllInfo && infoNotices.map((notice) => (
        <NoticeCard
          key={notice.id}
          notice={notice}
          defaultOpen={false}
          onReadToggle={toggleRead}
        />
      ))}

      {/* 정보성 공지 더 보기 */}
      {!showAllInfo && (
        <button
          onClick={() => setShowAllInfo(true)}
          className="
            w-full py-3.5 rounded-xl border border-border bg-white
            text-sm text-secondary font-medium
            hover:bg-surface active:bg-[#E8E8E8]
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
