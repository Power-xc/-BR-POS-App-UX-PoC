"use client";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { Snackbar } from "@/shared/ui/Snackbar";
import { useActionPredictor } from "@/shared/model/useActionPredictor";
import { ACTIONS } from "@/shared/lib/actionPredictor";
import type { ChatMessage, OrderDraft } from "@/shared/types";
import { postPocChat } from "@/shared/api/poc";

// ============================================================
// 발주서 초안 카드 — 채팅 인라인
// ============================================================

function OrderDraftCard({
  draft,
  onApprove,
}: {
  draft: OrderDraft;
  onApprove: () => void;
}) {
  return (
    <div className="bg-surface rounded-xl p-3 mt-2 border border-border">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-primary">
          발주서 초안 #{draft.id}
        </span>
        <span className="text-[10px] text-tertiary">{draft.generatedAt}</span>
      </div>

      <div className="space-y-1.5 mb-3">
        {draft.items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-xs">
            <span className="text-secondary">{item.name}</span>
            <span className="font-medium text-primary tabular-nums">
              {item.qty}개
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-2 mb-3">
        <div className="flex justify-between text-sm font-semibold">
          <span className="text-secondary">총 발주금액</span>
          <span className="text-primary">
            ₩{draft.totalAmount.toLocaleString("ko-KR")}
          </span>
        </div>
      </div>

      {/* 승인 CTA — Fitts's Law */}
      <Button size="lg" fullWidth onClick={onApprove}>
        승인
      </Button>
    </div>
  );
}

// ============================================================
// 채팅 버블
// ============================================================

function ChatBubble({
  msg,
  onDraftApprove,
}: {
  msg: ChatMessage;
  onDraftApprove: (draft: OrderDraft) => void;
}) {
  const isUser = msg.role === "user";
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Hydration mismatch 방지:
    // 서버/클라이언트의 로케일(AM/PM, '오후') 차이로 timestamp 텍스트가 달라질 수 있어
    // timestamp는 클라이언트에서만 렌더링한다. (UI 구조는 유지)
    setIsClient(true);
  }, []);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      {!isUser && (
        <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center shrink-0 mr-2 mt-0.5">
          <span className="text-white text-[9px] font-bold">AI</span>
        </div>
      )}

      <div className={`max-w-[78%] ${isUser ? "" : ""}`}>
        {!isUser && (
          <span className="text-[10px] text-secondary mb-1 block">
            AI AGENT
          </span>
        )}

        <div
          className={`
            rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed
            ${
              isUser
                ? "bg-primary text-white rounded-tr-sm"
                : "bg-card text-primary rounded-tl-sm border border-border"
            }
          `}
        >
          {msg.content}
        </div>

        {/* 발주서 초안 인라인 카드 */}
        {msg.draft && (
          <OrderDraftCard
            draft={msg.draft}
            onApprove={() => onDraftApprove(msg.draft!)}
          />
        )}

        {/* PoC: 백엔드 구조화 블록(표/차트/콜아웃) 렌더링 */}
        {"ui" in (msg as any) && (msg as any).ui?.blocks && (
          <div className="mt-2 space-y-2">
            {(msg as any).ui.blocks.map((b: any, idx: number) => (
              <StructuredBlock key={idx} block={b} />
            ))}
          </div>
        )}

        <span
          className="text-[10px] text-tertiary mt-1 block text-right"
          suppressHydrationWarning
        >
          {isClient ? msg.timestamp : ""}
        </span>
      </div>
    </div>
  );
}

// ============================================================
// 구조화 블록 렌더러 (표/차트/콜아웃)
// ============================================================

function formatCell(v: unknown) {
  if (typeof v === "number") return v.toLocaleString("ko-KR");
  if (v == null) return "—";
  return String(v);
}

function StructuredBlock({ block }: { block: any }) {
  if (block?.type === "callouts") {
    return (
      <div className="bg-surface border border-border rounded-xl p-3">
        <p className="text-xs font-semibold text-primary mb-2">{block.title || "인사이트"}</p>
        <div className="space-y-2">
          {(block.items || []).map((it: any, i: number) => (
            <div key={i} className="bg-card border border-border rounded-lg p-2.5">
              <p className="text-xs font-semibold text-primary">{it.title}</p>
              {it.evidence && <p className="text-[11px] text-secondary mt-0.5">{it.evidence}</p>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (block?.type === "table") {
    return (
      <div className="bg-surface border border-border rounded-xl p-3 overflow-hidden">
        <p className="text-xs font-semibold text-primary mb-2">{block.title || "표"}</p>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="text-tertiary bg-card">
                {(block.columns || []).map((c: any) => (
                  <th
                    key={c.key}
                    className={`
                      font-semibold py-1.5 px-2 whitespace-nowrap
                      ${typeof (block.rows?.[0]?.[c.key]) === "number" ? "text-right" : "text-left"}
                    `}
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-secondary">
              {(block.rows || []).slice(0, 10).map((r: any, i: number) => (
                <tr key={i} className={`border-t border-border/60 ${i % 2 === 1 ? "bg-card/50" : ""}`}>
                  {(block.columns || []).map((c: any) => (
                    <td
                      key={c.key}
                      className={`
                        py-1.5 px-2 whitespace-nowrap
                        ${typeof (r?.[c.key]) === "number" ? "text-right tabular-nums" : "text-left"}
                      `}
                    >
                      {formatCell(r?.[c.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (block?.type === "chart_line") {
    const series = (block.series || []) as any[];
    const xKey = block.xKey || "x";
    const yKey = (block.yKeys || [])[0];
    const vals = series.map((p) => Number(p?.[yKey] || 0));
    const min = Math.min(...vals, 0);
    const max = Math.max(...vals, 1);
    const pts = series
      .map((p, i) => {
        const x = series.length <= 1 ? 0 : (i / (series.length - 1)) * 100;
        const y = 100 - ((Number(p?.[yKey] || 0) - min) / (max - min)) * 100;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(" ");
    const last = series[series.length - 1];

    return (
      <div className="bg-surface border border-border rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-primary">{block.title || "추이"}</p>
          <p className="text-[10px] text-tertiary">
            {last?.[xKey] ? String(last[xKey]).slice(0, 10) : ""}
          </p>
        </div>
        <svg viewBox="0 0 100 100" className="w-full h-20">
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="text-primary"
            points={pts}
          />
        </svg>
        <p className="text-[11px] text-secondary mt-1">
          최신 {yKey}: <span className="font-semibold text-primary">{formatCell(last?.[yKey])}</span>
        </p>
      </div>
    );
  }

  return null;
}

// ============================================================
// AI 비서 페이지
// ============================================================

/** AI 응답 대기 중 dot 애니메이션 */
function AiLoadingDots() {
  return (
    <div className="flex justify-start mb-3">
      <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center shrink-0 mr-2 mt-0.5">
        <span className="text-white text-[9px] font-bold">AI</span>
      </div>
      <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 bg-secondary rounded-full dot-pulse-1" />
        <span className="w-1.5 h-1.5 bg-secondary rounded-full dot-pulse-2" />
        <span className="w-1.5 h-1.5 bg-secondary rounded-full dot-pulse-3" />
      </div>
    </div>
  );
}

/* 퀵 버튼 액션 ID 매핑 */
const QUICK_BUTTONS = [
  { label: "재고 얼마나 남았어?", actionId: ACTIONS.ASSISTANT_QUICK_1 },
  { label: "이번 주 매출 알려줘", actionId: ACTIONS.ASSISTANT_QUICK_2 },
  { label: "발주서 작성해줘", actionId: ACTIONS.ASSISTANT_QUICK_3 },
] as const;

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "안녕하세요! 던킨 AI 비서입니다. 자연어로 업무를 지시해 주세요.",
      timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [sessionId, setSessionId] = useState<string>("");

  const { track, glowClass } = useActionPredictor();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date().toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // PoC 백엔드 연동(실제 AI 실행):
    // - 기존 UI(버블/초안 카드) 구조는 유지하고, 응답만 실제 `/api/poc/chat` 결과로 치환한다.
    // - AI API 키 미설정/네트워크 제한 등으로 실패할 수 있으므로, 에러 버블로 우아하게 처리한다.
    try {
      const res = await postPocChat({
        message: content,
        session_id: sessionId || undefined,
        channel: "full",
        current_page: "/assistant",
      });
      if (!sessionId && res.session_id) setSessionId(res.session_id);

      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: res.answer || "답변을 생성하지 못했습니다.",
        timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
        // PoC: 백엔드가 order_draft를 내려줄 때만 초안 카드 렌더
        draft: res.ui?.order_draft as unknown as OrderDraft | undefined,
      };
      // PoC 확장 필드(ui.blocks): 표/차트 렌더링에 사용 (타 개발자 추적용)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (aiMsg as any).ui = res.ui;
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "잠시 후 다시 시도해 주세요. (네트워크/AI 설정 문제로 응답을 받지 못했어요)",
        timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDraftApprove = (draft: OrderDraft) => {
    // UX 유지: 승인 CTA는 즉시 피드백을 주고,
    // 실제 DB write-back은 주문 화면(발주 탭)에서 확정 처리로 이어지도록 한다.
    setSnackbar(`발주서 #${draft.id} 승인 완료 — ₩${draft.totalAmount.toLocaleString("ko-KR")}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickButton = (
    label: string,
    actionId: (typeof ACTIONS)[keyof typeof ACTIONS],
  ) => {
    track(actionId);
    handleSend(label);
  };

  return (
    <div className="flex flex-col h-full pb-16">
      {/* 페이지 헤더 */}
      <div className="px-4 pt-4 pb-2 shrink-0">
        <h1 className="text-lg font-bold text-primary">AI 업무 비서</h1>
        <p className="text-xs text-secondary mt-0.5">
          자연어 명령 → 설명 가능한 UI 카드 변환
        </p>
      </div>

      {/* 채팅 메시지 영역 */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-2">
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            msg={msg}
            onDraftApprove={handleDraftApprove}
          />
        ))}

        {/* AI 응답 대기 중 dot 애니메이션 */}
        {isLoading && <AiLoadingDots />}

        {/* 예시 퀵 버튼 — glow 예측형 UI 적용 */}
        {!isLoading && (
          <div className="mt-2 mb-4">
            <p className="text-[10px] text-tertiary mb-2">빠른 질문</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_BUTTONS.map(({ label, actionId }) => (
                <button
                  key={label}
                  onClick={() => handleQuickButton(label, actionId)}
                  className={`
                    text-xs text-secondary bg-card border border-border
                    px-3 py-1.5 rounded-full
                    hover:bg-[#F0F0F0] active:scale-95 transition-all
                    ${glowClass(actionId)}
                  `}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <div className="shrink-0 px-4 pb-4 bg-surface border-t border-border pt-3">
        <div className="flex items-end gap-2">
          <div className="flex-1 bg-card border border-border rounded-2xl px-4 py-3 min-h-[44px]">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='예) "재고 얼마나 남았어?"'
              className="
                w-full text-sm text-primary bg-transparent
                resize-none outline-none placeholder:text-tertiary
                max-h-24 leading-relaxed
              "
              rows={1}
            />
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="
              w-11 h-11 bg-primary rounded-xl
              flex items-center justify-center shrink-0
              hover:bg-[#1a1a1a] active:scale-95
              disabled:bg-[#E8E8E8] disabled:cursor-not-allowed
              transition-all
            "
          >
            <Send
              size={16}
              className={input.trim() ? "text-white" : "text-tertiary"}
            />
          </button>
        </div>
      </div>

      {snackbar && (
        <Snackbar message={snackbar} onDismiss={() => setSnackbar(null)} />
      )}
    </div>
  );
}
