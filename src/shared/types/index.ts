// ============================================================
// 공유 타입 정의
// ============================================================

/** 알림 우선순위 — UT 기반 신호등 체계 (긴급>주의>정보) */
export type NotificationPriority = "urgent" | "warning" | "info";

/** 재고 상태 */
export type InventoryStatus = "urgent" | "warning" | "normal";

/** POS 주문 상태 */
export type QueueStatus = "making" | "pickup_ready" | "complete";

/** 채팅 발화자 */
export type ChatRole = "user" | "assistant";

// ============================================================
// 재고 / 생산 관리 (Agent A)
// ============================================================

export interface InventoryItem {
  id: string;
  name: string;
  /** 현재 재고 수량 */
  currentStock: number;
  unit: string;
  /** "1시간 32분" */
  remainingTime: string;
  /** "15:30" — 소진 예상 시각 */
  estimatedRunout: string;
  status: InventoryStatus;
  /** 4주 평균 1차 생산 시간 */
  avgFirst: { time: string; qty: number };
  /** 4주 평균 2차 생산 시간 */
  avgSecond: { time: string; qty: number };
}

// ============================================================
// 주문 관리 (Agent B) — AI 발주
// ============================================================

export interface OrderItem {
  id: string;
  name: string;
  /** AI 점수 0-100 */
  aiScore: number;
  /** "내일 비 예보 → 실내 수요↑" — 점주 언어로 변환된 근거 (UT 핵심) */
  aiReason: string;
  recommendedQty: number;
  /** 사용자가 수정 가능한 수량 */
  currentQty: number;
  lastWeekQty: number;
  prevWeekQty: number;
}

export interface OrderDraftItem {
  name: string;
  qty: number;
}

export interface OrderDraft {
  id: string;
  items: OrderDraftItem[];
  generatedAt: string;
  totalAmount: number;
}

// ============================================================
// AI 비서 채팅 (Agent B/C)
// ============================================================

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
  /** 채팅 내 발주서 초안 첨부 */
  draft?: OrderDraft;
}

// ============================================================
// 매출 분석 (Agent C)
// ============================================================

export interface ReviewSentiment {
  rating: number;
  totalCount: number;
  distribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  positiveKeywords: string[];
  improvementKeywords: string[];
  recentReviews: ReviewItem[];
}

export interface ReviewItem {
  id: string;
  content: string;
  rating: number;
  date: string;
  sentiment: "positive" | "neutral" | "negative";
}

// ============================================================
// 알림
// ============================================================

export interface NotificationItem {
  id: string;
  priority: NotificationPriority;
  title: string;
  body: string;
  time: string;
  isRead: boolean;
  /** 원터치 처리 가능 여부 */
  hasAction: boolean;
  actionLabel?: string;
}

// ============================================================
// POS 대기열
// ============================================================

export interface QueueItem {
  id: string;
  orderNumber: number;
  status: QueueStatus;
  /** "제조중 3" | "픽업 대기 2" */
  group: "making" | "pickup";
  items: string[];
  /** "3:42" — 경과 시간 */
  elapsed: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

// ============================================================
// AI 브리핑 (홈 화면)
// ============================================================

export interface DailyBriefing {
  /** NLP 텍스트 요약 — 그래프 대신 문장 (UT 핵심) */
  summary: string;
  highlights: BriefingHighlight[];
}

export interface BriefingHighlight {
  label: string;
  value: string;
  trend: "up" | "down" | "neutral";
}
