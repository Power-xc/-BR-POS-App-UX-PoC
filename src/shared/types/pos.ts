/** 점주 포스 전용 타입 정의 */

/** 점주 포스 탭 */
export type PosTab = "home" | "inventory" | "order" | "sales" | "notice";

/** 생산 상태 뱃지 */
export type ProductionStatus = "urgent" | "recommend" | "normal";

/** 발주 단계 (1=본사 확인, 2=AI 검토, 3=최종 확정, complete=완료) */
export type OrderStep = 1 | 2 | 3 | "complete";

/** 공지 우선순위 */
export type NoticePriority = "urgent" | "caution" | "info";

/** 시간대별 판매량 */
export interface HourlySales {
  hour: number;
  count: number;
  /** 기회손실 발생 구간 표시 여부 */
  isChanceLoss?: boolean;
}

/** 재고·생산 품목 — Agent A 역추정 기반 */
export interface PosInventoryItem {
  id: string;
  name: string;
  /** 역추정 현재 재고 */
  currentStock: number;
  unit: string;
  /** 시간당 평균 판매량 */
  avgHourlySales: number;
  /** 소진 예정 (분) */
  minutesUntilRunout: number;
  /** AI 권장 생산량 */
  recommendedProduction: number;
  /** 기회손실 추정 금액 (원) */
  chanceLoss: number;
  status: ProductionStatus;
  /** AI 이유 텍스트 */
  aiReason: string;
}

/** 발주 품목 (본사 지시 — Step 1) */
export interface HqOrderItem {
  id: string;
  name: string;
  hqQty: number;
  unit: string;
  note: string;
}

/** 발주 품목 (AI 검토 결과 — Step 2) */
export interface AiOrderItem extends HqOrderItem {
  aiQty: number;
  /** 화면에 표시할 AI 수량 문자열 (단위 포함) */
  aiQtyDisplay: string;
  changed: boolean;
  changeReason: string;
}

/** 점주 최종 발주 품목 (Step 3) */
export interface FinalOrderItem extends AiOrderItem {
  finalQty: number;
}

/** 공지 항목 */
export interface PosNoticeItem {
  id: string;
  priority: NoticePriority;
  /** 태그 (메뉴/프로모션/운영 등) */
  tag: string;
  title: string;
  body: string;
  /** 필요 조치 텍스트 (긴급 건에만 표시) */
  requiredAction?: string;
  isRead: boolean;
}

/** 품목별 매출 순위 */
export interface SalesRankItem {
  rank: number;
  name: string;
  count: number;
  revenue: number;
  /** 바 차트 너비 비율 (0~100) */
  barPct: number;
}

/** 즉시 조치 필요 품목 */
export interface UrgentItem {
  name: string;
  reason: string;
}
