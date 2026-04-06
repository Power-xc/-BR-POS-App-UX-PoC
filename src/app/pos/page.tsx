"use client";

import { useState } from "react";
import { ShoppingCart, Clock, Check } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { Snackbar } from "@/shared/ui/Snackbar";
import { useActionPredictor } from "@/shared/model/useActionPredictor";
import { ACTIONS } from "@/shared/lib/actionPredictor";
import {
  mockMenuItems,
  mockMenuCategories,
  mockCartItems,
  mockQueueItems,
} from "@/entities/mock/data";
import type { CartItem, QueueItem } from "@/shared/types";

// ============================================================
// 판매량 순위 → glow 클래스 (OP.GG 스타일 통계 기반 인기 메뉴 강조)
// ============================================================

function getMenuGlowClass(salesRank?: number): string {
  if (!salesRank) return "";
  if (salesRank === 1) return "glow-high";
  if (salesRank <= 3) return "glow-mid";
  if (salesRank <= 5) return "glow-low";
  return "";
}

// ============================================================
// 메뉴 그리드
// ============================================================

function MenuGrid({
  activeCategory,
  onCategoryChange,
  onAddToCart,
}: {
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
  onAddToCart: (item: (typeof mockMenuItems)[number]) => void;
}) {
  const filtered = mockMenuItems.filter((m) => m.category === activeCategory);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* 카테고리 탭 */}
      <div className="flex gap-1.5 px-4 py-3 border-b border-border bg-card shrink-0">
        {mockMenuCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`
              px-4 py-2 rounded-xl text-base font-medium transition-all
              ${activeCategory === cat
                ? "bg-primary text-white"
                : "bg-surface text-secondary hover:bg-[#E8E8E8]"
              }
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 상품 그리드 */}
      <div className="flex-1 overflow-y-auto hide-scrollbar p-4">
        <div className="grid grid-cols-6 gap-2.5">
          {filtered.map((item) => (
            <button
              key={item.id}
              onClick={() => !item.soldOut && onAddToCart(item)}
              disabled={item.soldOut}
              className={`
                bg-card rounded-sm p-3.5 text-left border transition-all
                ${item.soldOut
                  ? "border-border opacity-50 cursor-not-allowed"
                  : "border-border hover:border-primary hover:shadow-sm active:scale-[0.98]"
                }
                ${!item.soldOut ? getMenuGlowClass(item.salesRank) : ""}
              `}
            >
              {/* 인기 순위 배지 — OP.GG 스타일 */}
              {item.salesRank && item.salesRank <= 3 && !item.soldOut && (
                <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-primary mb-1.5">
                  <span className="text-[10px]">🔥</span>
                  {item.salesRank === 1 ? "인기 1위" : `인기 ${item.salesRank}위`}
                </span>
              )}
              <p className="text-base font-semibold text-primary leading-tight mb-1">
                {item.name}
              </p>
              <p className="text-sm text-secondary">
                ₩{item.price.toLocaleString("ko-KR")}
              </p>
              {item.soldOut && (
                <span className="mt-1 inline-block text-xs bg-[#F0F0F0] text-secondary px-1.5 py-0.5 rounded font-medium">
                  품절
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 장바구니
// ============================================================

function CartPanel({
  items,
  onQtyChange,
  onRemove,
  onClearAll,
  onPayment,
  cardGlowClass,
  easyGlowClass,
}: {
  items: CartItem[];
  onQtyChange: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
  onPayment: (type: "card" | "easy") => void;
  cardGlowClass: string;
  easyGlowClass: string;
}) {
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-secondary">
        <ShoppingCart size={36} strokeWidth={1.5} />
        <p className="text-base">장바구니가 비어있습니다</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto hide-scrollbar space-y-2 px-1">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-2 bg-surface rounded-xl px-3 py-2.5"
          >
            <div className="flex-1 min-w-0">
              <p className="text-base font-medium text-primary truncate">{item.name}</p>
              <p className="text-sm text-secondary">
                ₩{item.price.toLocaleString("ko-KR")}
              </p>
            </div>
            {/* 수량 조절 — Fitts's Law: 터치 영역 확보 */}
            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  item.qty <= 1 ? onRemove(item.id) : onQtyChange(item.id, item.qty - 1)
                }
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-card border border-border text-primary hover:bg-[#E8E8E8] transition-colors text-base"
              >
                −
              </button>
              <span className="w-7 text-center text-sm font-semibold tabular-nums">
                {item.qty}
              </span>
              <button
                onClick={() => onQtyChange(item.id, item.qty + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-card border border-border text-primary hover:bg-[#E8E8E8] transition-colors text-base"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 합계 + 결제 */}
      <div className="shrink-0 pt-3 border-t border-border">
        <div className="flex justify-between items-center mb-3">
          <span className="text-lg font-bold text-secondary">합계</span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClearAll}
              className="text-sm text-[#E65100] hover:underline"
            >
              전체 취소
            </button>
            <span className="text-lg font-bold text-primary">₩{total.toLocaleString("ko-KR")}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={() => onPayment("easy")}
            className={easyGlowClass}
          >
            간편결제
          </Button>
          <Button
            size="md"
            fullWidth
            onClick={() => onPayment("card")}
            className={cardGlowClass}
          >
            카드결제
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 대기열
// ============================================================

const queueStatusConfig = {
  making: { label: "제조중", bg: "bg-[#FFF8E1]", text: "text-[#E65100]" },
  pickup_ready: { label: "픽업 대기", bg: "bg-[#E8F5EE]", text: "text-success" },
  complete: { label: "완료", bg: "bg-[#F0F0F0]", text: "text-secondary" },
};

function QueuePanel({
  items,
  onStatusChange,
}: {
  items: QueueItem[];
  onStatusChange: (id: string, status: QueueItem["status"]) => void;
}) {
  const makingItems = items.filter((i) => i.group === "making");
  const pickupItems = items.filter((i) => i.group === "pickup");

  return (
    <div className="flex flex-col h-full overflow-y-auto hide-scrollbar">
      {/* 제조중 그룹 */}
      {makingItems.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2 px-1">
            <span className="text-xs font-semibold text-secondary">제조중</span>
            <span className="bg-[#FFF8E1] text-[#E65100] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {makingItems.length}
            </span>
          </div>
          <div className="space-y-2">
            {makingItems.map((item) => (
              <QueueCard key={item.id} item={item} onStatusChange={onStatusChange} />
            ))}
          </div>
        </div>
      )}

      {/* 픽업 대기 그룹 */}
      {pickupItems.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2 px-1">
            <span className="text-xs font-semibold text-secondary">픽업 대기</span>
            <span className="bg-[#E8F5EE] text-success text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {pickupItems.length}
            </span>
          </div>
          <div className="space-y-2">
            {pickupItems.map((item) => (
              <QueueCard key={item.id} item={item} onStatusChange={onStatusChange} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function QueueCard({
  item,
  onStatusChange,
}: {
  item: QueueItem;
  onStatusChange: (id: string, status: QueueItem["status"]) => void;
}) {
  const cfg = queueStatusConfig[item.status];

  return (
    <div className="bg-card rounded-xl px-3 py-2.5 border border-border">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-primary">#{item.orderNumber}</span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
            {cfg.label}
          </span>
        </div>
        <div className="flex items-center gap-1 text-tertiary">
          <Clock size={11} />
          <span className="text-xs tabular-nums">{item.elapsed}</span>
        </div>
      </div>

      <p className="text-sm text-secondary mb-2.5 leading-relaxed">
        {item.items.join(" · ")}
      </p>

      {/* 원터치 상태 전환 — Undo 연동 */}
      <div className="flex gap-1.5">
        {item.status === "making" && (
          <button
            onClick={() => onStatusChange(item.id, "pickup_ready")}
            className="
              flex-1 h-9 bg-primary text-white text-xs font-semibold
              rounded-lg flex items-center justify-center gap-1.5
              hover:bg-[#1a1a1a] active:scale-[0.98] transition-all
            "
          >
            <Check size={13} />
            픽업+완료
          </button>
        )}
        {item.status === "pickup_ready" && (
          <button
            onClick={() => onStatusChange(item.id, "complete")}
            className="
              flex-1 h-9 bg-success text-white text-xs font-semibold
              rounded-lg flex items-center justify-center gap-1.5
              hover:opacity-90 active:scale-[0.98] transition-all
            "
          >
            <Check size={13} />
            완료
          </button>
        )}
        {item.status === "complete" && (
          <div className="flex-1 h-9 bg-[#F0F0F0] text-secondary text-xs font-medium rounded-lg flex items-center justify-center">
            완료됨
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// POS 메인 페이지
// ============================================================

export default function PosPage() {
  const [activeCategory, setActiveCategory] = useState<string>("도넛");
  const [cartItems, setCartItems] = useState<CartItem[]>(mockCartItems);
  const [queueItems, setQueueItems] = useState<QueueItem[]>(mockQueueItems);
  /* 우측 패널 탭 — V3: [장바구니|대기열] (UT 최종 결과) */
  const [rightPanel, setRightPanel] = useState<"cart" | "queue">("cart");
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<(() => void) | null>(null);

  const { track, glowClass } = useActionPredictor();

  /* 장바구니 추가 */
  const handleAddToCart = (item: (typeof mockMenuItems)[number]) => {
    setCartItems((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, qty: 1 }];
    });
  };

  /* 수량 변경 */
  const handleQtyChange = (id: string, qty: number) => {
    setCartItems((prev) => prev.map((c) => c.id === id ? { ...c, qty } : c));
  };

  /* 항목 제거 */
  const handleRemove = (id: string) => {
    const item = cartItems.find((c) => c.id === id);
    setCartItems((prev) => prev.filter((c) => c.id !== id));
    if (item) {
      setLastAction(() => () =>
        setCartItems((prev) => [...prev, item])
      );
      setSnackbar(`${item.name} 삭제됨`);
    }
  };

  /* 전체 취소 — Undo 연동 */
  const handleClearAll = () => {
    const snapshot = [...cartItems];
    setCartItems([]);
    setLastAction(() => () => setCartItems(snapshot));
    setSnackbar("장바구니 전체 취소");
  };

  /* 결제 — Undo 패턴 + 대기열 자동 추가 + glow 기록 */
  const handlePayment = (type: "card" | "easy") => {
    const actionId = type === "card" ? ACTIONS.POS_PAYMENT_CARD : ACTIONS.POS_PAYMENT_EASY;
    track(actionId);

    const snapshot = [...cartItems];
    const orderNumber = queueItems.length + 1;

    /* 결제 완료 → 장바구니 상품을 대기열에 추가 */
    const newQueueItem: QueueItem = {
      id: `queue-${Date.now()}`,
      orderNumber,
      items: cartItems.map((c) => `${c.name}×${c.qty}`),
      status: "making",
      group: "making",
      elapsed: "0분",
    };

    setCartItems([]);
    setQueueItems((prev) => [...prev, newQueueItem]);
    setRightPanel("queue");
    setLastAction(() => () => {
      setCartItems(snapshot);
      setQueueItems((prev) => prev.filter((q) => q.id !== newQueueItem.id));
      setRightPanel("cart");
    });
    setSnackbar(`결제 완료 — #${orderNumber} 대기열 추가`);
  };

  /* 대기열 상태 전환 — Undo 연동 */
  const handleQueueStatusChange = (id: string, status: QueueItem["status"]) => {
    const prev = queueItems.find((q) => q.id === id);
    setQueueItems((items) =>
      items.map((q) => q.id === id ? { ...q, status, group: status === "pickup_ready" ? "pickup" : q.group } : q)
    );
    if (prev) {
      setLastAction(() => () =>
        setQueueItems((items) => items.map((q) => q.id === id ? prev : q))
      );
      setSnackbar(`#${prev.orderNumber} 상태 변경`);
    }
  };

  const makingCount = queueItems.filter((q) => q.group === "making").length;
  const pickupCount = queueItems.filter((q) => q.group === "pickup").length;

  return (
    <div className="flex flex-col h-screen bg-surface overflow-hidden">
      {/* POS 상단 헤더 */}
      <header className="bg-primary text-white px-5 py-3 flex items-center justify-between shrink-0">
        <div>
          <p className="text-base font-bold">던킨 강남본점</p>
          <p className="text-sm text-white/50">POS v3.0</p>
        </div>
        <div className="text-right">
          <p className="text-base font-bold tabular-nums">09:41</p>
          <p className="text-sm text-white/50">비 · 18°C</p>
        </div>
      </header>

      {/* 메인 콘텐츠 — 좌측(메뉴) + 우측(패널) */}
      <div className="flex flex-1 overflow-hidden">

        {/* 좌측 — 메뉴 그리드 */}
        <div className="flex-1 overflow-hidden border-r border-border">
          <MenuGrid
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            onAddToCart={handleAddToCart}
          />
        </div>

        {/* 우측 패널 — V3 우측 탭 통합 (UT: 시선 이동 85px, 성공률 94%) */}
        <div className="w-72 flex flex-col bg-card overflow-hidden shrink-0">

          {/* 탭 헤더 — [장바구니|대기열] */}
          <div className="flex border-b border-border shrink-0">
            <button
              onClick={() => setRightPanel("cart")}
              className={`
                flex-1 flex items-center justify-center gap-2 py-3.5 text-base font-semibold
                transition-colors relative
                ${rightPanel === "cart"
                  ? "text-primary border-b-2 border-primary -mb-px"
                  : "text-secondary hover:text-primary"
                }
              `}
            >
              장바구니
              {cartItems.length > 0 && (
                /* 탭 배지 — 검정 배경 (UT 피드백) */
                <span className="
                  min-w-[20px] h-[20px] px-1.5
                  bg-primary text-white
                  text-xs font-bold
                  rounded-full flex items-center justify-center
                ">
                  {cartItems.reduce((s, c) => s + c.qty, 0)}
                </span>
              )}
            </button>

            <button
              onClick={() => setRightPanel("queue")}
              className={`
                flex-1 flex items-center justify-center gap-2 py-3.5 text-base font-semibold
                transition-colors relative
                ${rightPanel === "queue"
                  ? "text-primary border-b-2 border-primary -mb-px"
                  : "text-secondary hover:text-primary"
                }
              `}
            >
              대기열
              {/* 배지 — 제조중+픽업 건수 상시 노출 */}
              {(makingCount + pickupCount) > 0 && (
                <span className={`
                  min-w-[20px] h-[20px] px-1.5
                  text-xs font-bold
                  rounded-full flex items-center justify-center
                  ${rightPanel === "queue"
                    ? "bg-primary text-white"
                    : "bg-[#F0F0F0] text-primary"
                  }
                `}>
                  {makingCount + pickupCount}
                </span>
              )}
            </button>
          </div>

          {/* 패널 콘텐츠 */}
          <div className="flex-1 overflow-hidden p-3">
            {rightPanel === "cart" ? (
              <CartPanel
                items={cartItems}
                onQtyChange={handleQtyChange}
                onRemove={handleRemove}
                onClearAll={handleClearAll}
                onPayment={handlePayment}
                cardGlowClass={glowClass(ACTIONS.POS_PAYMENT_CARD)}
                easyGlowClass={glowClass(ACTIONS.POS_PAYMENT_EASY)}
              />
            ) : (
              <QueuePanel items={queueItems} onStatusChange={handleQueueStatusChange} />
            )}
          </div>
        </div>
      </div>

      {/* Undo 스낵바 */}
      {snackbar && (
        <Snackbar
          message={snackbar}
          onUndo={lastAction ?? undefined}
          onDismiss={() => {
            setSnackbar(null);
            setLastAction(null);
          }}
        />
      )}
    </div>
  );
}
