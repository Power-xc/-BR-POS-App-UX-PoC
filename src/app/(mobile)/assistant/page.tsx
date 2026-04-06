"use client";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { Snackbar } from "@/shared/ui/Snackbar";
import { useActionPredictor } from "@/shared/model/useActionPredictor";
import { ACTIONS } from "@/shared/lib/actionPredictor";
import { mockChatMessages } from "@/entities/mock/data";
import type { ChatMessage, OrderDraft } from "@/shared/types";

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

        <span className="text-[10px] text-tertiary mt-1 block text-right">
          {msg.timestamp}
        </span>
      </div>
    </div>
  );
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
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { track, glowClass } = useActionPredictor();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = (text?: string) => {
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

    /* Mock AI 응답 — dot 애니메이션 후 메시지 */
    setTimeout(() => {
      setIsLoading(false);
      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "확인했습니다. 잠시 후 발주서를 생성하겠습니다.",
        timestamp: new Date().toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 1200);
  };

  const handleDraftApprove = (draft: OrderDraft) => {
    setSnackbar(
      `발주서 #${draft.id} 승인 완료 — ₩${draft.totalAmount.toLocaleString("ko-KR")}`,
    );
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
