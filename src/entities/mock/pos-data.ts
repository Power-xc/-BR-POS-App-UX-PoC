/**
 * 점주 포스 Mock 데이터
 * - BR Korea 공식 산정 로직 기반 (2026-04-06 기획팀 수령)
 * - Agent A: 역추정 재고 = (기초재고 + 생산완료) - 당일 POS 판매
 * - Agent B: AI 제안 = 본사지시 + α(기회손실이력) + β(요일/날씨/이벤트)
 * - Agent C: 매출 = POS 결제 합산, 폐기비용 = 마감재고 × 원가(판매가×40%)
 */

import type {
  PosInventoryItem,
  HqOrderItem,
  AiOrderItem,
  FinalOrderItem,
  PosNoticeItem,
  HourlySales,
  SalesRankItem,
  UrgentItem,
} from "@/shared/types/pos";

// ============================================================
// 홈·현황
// ============================================================

/** AI 데일리 브리핑 텍스트 (Agent C) */
export const mockHomeBriefing =
  "오늘 매출 ₩1,248,000으로 전일 대비 +12.2% 상승 중입니다. 글레이즈드·먼치킨이 전체의 62%를 차지했습니다. 현재 글레이즈드·아메리카노 재고 부족으로 기회손실 ₩155,000이 발생 중입니다. 즉시 생산 등록을 권장합니다.";

/** 즉시 조치 필요 품목 (Agent A 감지) */
export const mockUrgentItems: UrgentItem[] = [
  { name: "글레이즈드", reason: "피크 전 재고 4개, 기회손실 역추정 +28개 필요" },
  { name: "아메리카노", reason: "원두 재고 부족, 즉시 생산 권장" },
];

// ============================================================
// 재고·생산 (Agent A)
// ============================================================

/**
 * 재고 품목 — 역추정 공식 적용
 * 현재 역추정 재고 = (기초재고 + 당일 생산 완료) - 당일 POS 판매
 * 기회손실 = 권장생산량 × 판매단가
 */
export const mockInventoryItems: PosInventoryItem[] = [
  {
    id: "glazed",
    name: "글레이즈드",
    /** 역추정: 기초 50개 + 생산 0 - 판매 46 = 4개 */
    currentStock: 4,
    unit: "개",
    avgHourlySales: 7,
    /** 4개 ÷ 7개/h × 60 ≈ 34분 */
    minutesUntilRunout: 34,
    /** 예상수요(피크 30개) - 현재재고(4개) + 피크보정 = 28개 */
    recommendedProduction: 28,
    /** 28개 × ₩1,800 + 피크가중 ≈ ₩86,000 */
    chanceLoss: 86000,
    status: "urgent",
    aiReason: "피크 전 재고 4개, 기회손실 역추정 +28개 필요",
  },
  {
    id: "boston",
    name: "보스턴크림",
    currentStock: 12,
    unit: "개",
    avgHourlySales: 4,
    minutesUntilRunout: 180,
    recommendedProduction: 12,
    chanceLoss: 0,
    status: "normal",
    aiReason: "현재 재고 적정 수준",
  },
  {
    id: "choco",
    name: "초코링",
    currentStock: 6,
    unit: "개",
    avgHourlySales: 5,
    /** 6개 ÷ 5개/h × 60 ≈ 72분 → 오후 피크 고려 시 50분 */
    minutesUntilRunout: 50,
    /** 오후피크 수요 24개 - 현재 6개 = 18개 */
    recommendedProduction: 18,
    /** 18개 × ₩1,800 + 오후피크보정 ≈ ₩42,000 */
    chanceLoss: 42000,
    status: "recommend",
    aiReason: "오후 피크 예상, 추가 생산 권장",
  },
  {
    id: "munchkin",
    name: "먼치킨",
    currentStock: 24,
    unit: "개",
    avgHourlySales: 6,
    minutesUntilRunout: 240,
    recommendedProduction: 24,
    chanceLoss: 0,
    status: "normal",
    aiReason: "재고 적정",
  },
  {
    id: "americano",
    name: "아메리카노 원두",
    /** 원두 잔량 낮음 → 음료 전 품절 위험 */
    currentStock: 3,
    unit: "잔분",
    avgHourlySales: 8,
    minutesUntilRunout: 22,
    recommendedProduction: 15,
    /** 15잔 × ₩4,500 = ₩67,500 → 원두소진 전체손실 역산 */
    chanceLoss: 27000,
    status: "urgent",
    aiReason: "원두 재고 부족, 즉시 생산 권장",
  },
];

/** 전체 기회손실 합산 (Agent A → Agent C 연동) */
export const totalChanceLoss = mockInventoryItems.reduce(
  (sum, item) => sum + item.chanceLoss,
  0
);

/** 즉시 생산 필요 품목 수 */
export const urgentProductionCount = mockInventoryItems.filter(
  (i) => i.status === "urgent"
).length;

// ============================================================
// 발주 관리 (Agent B — 3단계 승인 플로우)
// ============================================================

/** Step 1: 본사 발주 지시 */
export const mockHqOrderItems: HqOrderItem[] = [
  { id: "glazed", name: "글레이즈드", hqQty: 48, unit: "개", note: "본사 기준" },
  { id: "boston", name: "보스턴크림", hqQty: 24, unit: "개", note: "본사 기준" },
  { id: "choco", name: "초코링", hqQty: 30, unit: "개", note: "본사 기준" },
  { id: "americano", name: "아메리카노 원두", hqQty: 2, unit: "kg", note: "본사 기준" },
  { id: "munchkin", name: "먼치킨", hqQty: 60, unit: "개", note: "본사 기준" },
];

/**
 * Step 2: AI 분석 결과
 * AI 제안 = 본사 + α(기회손실이력) + β(요일/이벤트/날씨)
 * 7월 3주차 화요일: 주말 수요 후 회복기 + 글레이즈드 전주 품절이력
 */
export const mockAiOrderItems: AiOrderItem[] = [
  {
    id: "glazed",
    name: "글레이즈드",
    hqQty: 48,
    unit: "개",
    note: "본사 기준",
    /** α: 전주 품절이력 +8개, 주말 수요 반영 */
    aiQty: 56,
    aiQtyDisplay: "56개",
    changed: true,
    changeReason: "기회손실 역추정 +8개 / 주말 수요 반영",
  },
  {
    id: "boston",
    name: "보스턴크림",
    hqQty: 24,
    unit: "개",
    note: "본사 기준",
    aiQty: 24,
    aiQtyDisplay: "24개",
    changed: false,
    changeReason: "본사 지시와 동일 — 적정 수량",
  },
  {
    id: "choco",
    name: "초코링",
    hqQty: 30,
    unit: "개",
    note: "본사 기준",
    /** α: 오후피크 기회손실 이력 +6개 */
    aiQty: 36,
    aiQtyDisplay: "36개",
    changed: true,
    changeReason: "오후 피크 기회손실 패턴 반영 +6개",
  },
  {
    id: "americano",
    name: "아메리카노 원두",
    hqQty: 2,
    unit: "kg",
    note: "본사 기준",
    /** β: 금·토 라시패턴 +0.5kg */
    aiQty: 2.5,
    aiQtyDisplay: "2.5kg",
    changed: true,
    changeReason: "금·토 라시 패턴 반영 +0.5kg",
  },
  {
    id: "munchkin",
    name: "먼치킨",
    hqQty: 60,
    unit: "개",
    note: "본사 기준",
    aiQty: 60,
    aiQtyDisplay: "60개",
    changed: false,
    changeReason: "본사 지시와 동일 — 적정 수량",
  },
];

/** Step 3: 점주 최종 확정 (AI 추천값으로 초기화) */
export const mockFinalOrderItems: FinalOrderItem[] = mockAiOrderItems.map((item) => ({
  ...item,
  finalQty: item.aiQty,
}));

// ============================================================
// 매출 분석 (Agent C)
// ============================================================

/** AI 매출 브리핑 텍스트 */
export const mockSalesBriefing =
  "오늘 누적 매출 ₩1,248,000으로 전일 대비 +12.2% 상승 중입니다. 글레이즈드(48개)·먼치킨(40개)이 매출 상위를 차지했습니다. 오전 10~11시 품절로 인한 기회손실 ₩155,000이 발생했습니다. 폐기 비용은 ₩34,000으로 전일 대비 개선됐습니다.";

/**
 * 시간대별 판매량
 * 정규분포 + 피크 가중: 오전 9-11시, 점심 12-13시
 * 기회손실 구간: 10-11시 (글레이즈드 품절)
 */
export const mockHourlySales: HourlySales[] = [
  { hour: 8, count: 12 },
  { hour: 9, count: 28 },
  { hour: 10, count: 35, isChanceLoss: true },
  { hour: 11, count: 22, isChanceLoss: true },
  { hour: 12, count: 40 },
  { hour: 13, count: 38 },
  { hour: 14, count: 18 },
  { hour: 15, count: 15 },
  { hour: 16, count: 20 },
  { hour: 17, count: 25 },
  { hour: 18, count: 22 },
  { hour: 19, count: 14 },
];

/** 품목별 매출 순위 */
export const mockSalesRanking: SalesRankItem[] = [
  { rank: 1, name: "글레이즈드", count: 48, revenue: 86400, barPct: 100 },
  { rank: 2, name: "먼치킨", count: 40, revenue: 60000, barPct: 70 },
  { rank: 3, name: "아메리카노", count: 32, revenue: 144000, barPct: 55 },
  { rank: 4, name: "보스턴크림", count: 22, revenue: 44000, barPct: 40 },
  { rank: 5, name: "초코링", count: 18, revenue: 32400, barPct: 30 },
];

// ============================================================
// 공지·알림 (Agent C)
// ============================================================

/**
 * 공지 우선순위 분류 기준:
 * 긴급: 즉시/비활성화/중단/오늘 마감 키워드 → 행동 촉구형
 * 주의: 프로모션 변경/레시피/마감 임박 → 영업 직접 영향
 * 정보: 그 외 일반 안내 → 참고용
 */
export const mockNoticeItems: PosNoticeItem[] = [
  {
    id: "n1",
    priority: "urgent",
    tag: "메뉴",
    title: "글레이즈드 한정 시즌 종료",
    body: "오늘(7/14) 마지막 판매일. 내일(7/15)부터 메뉴에서 제거 필요. POS 메뉴 비활성화 처리 요청.",
    requiredAction: "오늘 판매 후 메뉴 비활성화",
    isRead: false,
  },
  {
    id: "n2",
    priority: "caution",
    tag: "프로모션",
    title: "7월 3주차 프로모션 변경",
    body: "7/15(수)부터 던킨 런치세트 가격 변경. 기존 ₩6,900 → ₩7,500. POS 가격 업데이트 필요.",
    requiredAction: "POS 가격 업데이트 확인",
    isRead: false,
  },
  {
    id: "n3",
    priority: "info",
    tag: "운영",
    title: "폐기 보고 마감 시간 변경",
    body: "8월부터 일일 폐기 보고 마감 시간이 22:00에서 21:30으로 변경됩니다.",
    isRead: false,
  },
  {
    id: "n4",
    priority: "info",
    tag: "교육",
    title: "하반기 위생 교육 일정 안내",
    body: "2026년 하반기 위생 교육이 8/5(수) 오후 2시에 진행됩니다. 가맹점주 필수 참석.",
    isRead: false,
  },
  {
    id: "n5",
    priority: "info",
    tag: "운영",
    title: "8월 가맹점 정기 점검 일정",
    body: "8/12(수) 오후 3시 정기 점검 예정입니다. 재고 및 위생 상태 사전 준비 요망.",
    isRead: false,
  },
  {
    id: "n6",
    priority: "info",
    tag: "시스템",
    title: "POS 시스템 업데이트 예정",
    body: "7/16(목) 새벽 2-4시 POS 시스템 정기 업데이트가 진행됩니다. 해당 시간대 거래 처리 불가.",
    isRead: false,
  },
  {
    id: "n7",
    priority: "info",
    tag: "마케팅",
    title: "SNS 이벤트 참여 안내",
    body: "던킨 공식 인스타그램 이벤트 기간(7/15-7/31). 매장 태그 시 본사 리그램 기회 제공.",
    isRead: false,
  },
  {
    id: "n8",
    priority: "info",
    tag: "운영",
    title: "여름 성수기 운영 가이드라인",
    body: "7-8월 성수기 기간 음료류 재고 관리 강화 및 냉음료 비중 확대를 권장합니다.",
    isRead: false,
  },
  {
    id: "n9",
    priority: "info",
    tag: "인사",
    title: "아르바이트 채용 지원 프로그램 안내",
    body: "본사 알바 매칭 플랫폼 연동 서비스가 8월부터 시작됩니다. 신청 가맹점 우선 지원.",
    isRead: false,
  },
  {
    id: "n10",
    priority: "info",
    tag: "안내",
    title: "가맹점 소통 채널 변경 안내",
    body: "기존 카카오 단체방이 9월부터 본사 전용 앱 채널로 통합됩니다. 사전 가입 요망.",
    isRead: false,
  },
];

/** 우선순위별 공지 분류 */
export const urgentNotices = mockNoticeItems.filter((n) => n.priority === "urgent");
export const cautionNotices = mockNoticeItems.filter((n) => n.priority === "caution");
export const infoNotices = mockNoticeItems.filter((n) => n.priority === "info");
