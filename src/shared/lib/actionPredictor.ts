/**
 * 예측형 UI — 행동 패턴 학습 엔진
 * - localStorage 기반, 서버 통신 없음
 * - 알고리즘: 시퀀스 패턴(50%) + 시간대 빈도(30%) + 전체 빈도(20%)
 */

/** 추적 가능한 액션 ID */
export const ACTIONS = {
  NAV_HOME: "nav-home",
  NAV_ORDER: "nav-order",
  NAV_ASSISTANT: "nav-assistant",
  NAV_REVIEW: "nav-review",
  HOME_ORDER_CTA: "home-order-cta",
  ORDER_APPROVE_ALL: "order-approve-all",
  ASSISTANT_QUICK_1: "assistant-quick-1",
  ASSISTANT_QUICK_2: "assistant-quick-2",
  ASSISTANT_QUICK_3: "assistant-quick-3",
  POS_PAYMENT_CARD: "pos-payment-card",
  POS_PAYMENT_EASY: "pos-payment-easy",
} as const;

export type ActionId = (typeof ACTIONS)[keyof typeof ACTIONS];

interface ActionRecord {
  id: ActionId;
  /** Unix timestamp (ms) */
  ts: number;
}

const STORAGE_KEY = "dunkin_action_history";
const MAX_HISTORY = 200;

/** localStorage에서 히스토리 로드 */
function loadHistory(): ActionRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ActionRecord[]) : [];
  } catch {
    return [];
  }
}

/** 히스토리를 localStorage에 저장 */
function saveHistory(history: ActionRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    /* 저장 실패 시 무시 */
  }
}

/** 현재 시간대 슬롯 (0-3) */
function getTimeSlot(date: Date): number {
  const h = date.getHours();
  if (h >= 6 && h < 10) return 0;  // 오전
  if (h >= 10 && h < 14) return 1; // 점심
  if (h >= 14 && h < 18) return 2; // 오후
  return 3;                         // 저녁/야간
}

/**
 * 시간대별 기본 가중치 — 히스토리 없어도 동작
 * 키: `${timeSlot}-${actionId}`
 */
const TIME_DEFAULTS: Record<string, number> = {
  "0-nav-order": 0.4,          // 오전: 발주 탭
  "0-home-order-cta": 0.35,
  "0-order-approve-all": 0.3,
  "1-pos-payment-card": 0.45,  // 점심: 결제
  "1-pos-payment-easy": 0.35,
  "3-nav-home": 0.3,           // 저녁: 홈 (마감)
};

/** 특정 액션을 기록 */
export function recordAction(id: ActionId): void {
  const history = loadHistory();
  history.push({ id, ts: Date.now() });
  /* 최대 200개 유지 */
  if (history.length > MAX_HISTORY) history.splice(0, history.length - MAX_HISTORY);
  saveHistory(history);
}

/**
 * 모든 액션의 예측 확신도(0-1)를 계산
 * @returns Record<ActionId, number>
 */
export function computePredictions(): Record<ActionId, number> {
  const history = loadHistory();
  const allActions = Object.values(ACTIONS) as ActionId[];
  const now = new Date();
  const slot = getTimeSlot(now);
  const result: Record<ActionId, number> = {} as Record<ActionId, number>;

  const total = history.length;

  for (const actionId of allActions) {
    let score = 0;

    /* ① 시간대 기본값 */
    score += TIME_DEFAULTS[`${slot}-${actionId}`] ?? 0;

    if (total > 0) {
      /* ② 시퀀스 패턴 (50%) — 직전 액션 다음에 이 액션이 나온 빈도 */
      const last = history[total - 1];
      if (last) {
        const followCount = history.slice(0, -1).filter((r, i) => {
          return r.id === last.id && history[i + 1]?.id === actionId;
        }).length;
        const lastIdCount = history.filter((r) => r.id === last.id).length;
        const seqScore = lastIdCount > 0 ? followCount / lastIdCount : 0;
        score += seqScore * 0.5;
      }

      /* ③ 시간대 빈도 (30%) — 같은 시간대에 이 액션 비율 */
      const sameSlotTotal = history.filter((r) => getTimeSlot(new Date(r.ts)) === slot).length;
      const sameSlotHit = history.filter(
        (r) => r.id === actionId && getTimeSlot(new Date(r.ts)) === slot
      ).length;
      const timeScore = sameSlotTotal > 0 ? sameSlotHit / sameSlotTotal : 0;
      score += timeScore * 0.3;

      /* ④ 전체 빈도 (20%) */
      const freq = history.filter((r) => r.id === actionId).length / total;
      score += freq * 0.2;
    }

    /* 0-1 클램핑 */
    result[actionId] = Math.min(1, score);
  }

  return result;
}

/**
 * 확신도 → glow CSS 클래스
 * - 25% 미만: ""
 * - 25-45%: "glow-low"
 * - 45-75%: "glow-mid"
 * - 75%+:   "glow-high"
 */
export function getGlowClass(confidence: number): string {
  if (confidence >= 0.75) return "glow-high";
  if (confidence >= 0.45) return "glow-mid";
  if (confidence >= 0.25) return "glow-low";
  return "";
}
