import type {
  InventoryItem,
  OrderItem,
  ChatMessage,
  ReviewSentiment,
  NotificationItem,
  QueueItem,
  CartItem,
  DailyBriefing,
  OrderDraft,
} from "@/shared/types";

// ============================================================
// AI 데일리 브리핑 (홈)
// ============================================================

export const mockBriefing: DailyBriefing = {
  summary:
    '"어제보다 오전 매출이 10% 상승했어요. 오후에 비 소식이 있으니 따뜻한 아메리카노 수요 예측이 높습니다."',
  highlights: [
    { label: "오전 매출", value: "+10%", trend: "up" },
    { label: "대기 3건", value: "처리 중", trend: "neutral" },
    { label: "AI ON", value: "활성", trend: "neutral" },
  ],
};

// ============================================================
// 신선도 라이브 보드 (Agent A)
// ============================================================

export const mockInventory: InventoryItem[] = [
  {
    id: "glazed",
    name: "글레이즈드",
    currentStock: 8,
    unit: "개",
    remainingTime: "1시간 32분",
    estimatedRunout: "15:30",
    status: "urgent",
    avgFirst: { time: "07:30", qty: 24 },
    avgSecond: { time: "11:00", qty: 18 },
  },
  {
    id: "boston",
    name: "보스턴 크림",
    currentStock: 22,
    unit: "개",
    remainingTime: "3시간 10분",
    estimatedRunout: "17:08",
    status: "warning",
    avgFirst: { time: "08:00", qty: 20 },
    avgSecond: { time: "12:30", qty: 15 },
  },
  {
    id: "munchkin",
    name: "먼치킨 10개팩",
    currentStock: 45,
    unit: "개",
    remainingTime: "5시간+",
    estimatedRunout: "19:00+",
    status: "normal",
    avgFirst: { time: "08:30", qty: 30 },
    avgSecond: { time: "13:00", qty: 20 },
  },
];

// ============================================================
// AI 발주 아이템 (Agent B)
// ============================================================

export const mockOrderItems: OrderItem[] = [
  {
    id: "glazed",
    name: "글레이즈드 도넛",
    aiScore: 80,
    aiReason: "이번 주말 비 예보 및 인근 학교 행사로 인해 20% 추가 발주를 권장합니다.",
    recommendedQty: 80,
    currentQty: 80,
    lastWeekQty: 72,
    prevWeekQty: 68,
  },
  {
    id: "americano",
    name: "아메리카노",
    aiScore: 72,
    aiReason: "주말 평균 +22% 판매 패턴. 기온 하락으로 따뜻한 음료 수요가 늘 것으로 예상합니다.",
    recommendedQty: 36,
    currentQty: 36,
    lastWeekQty: 30,
    prevWeekQty: 32,
  },
  {
    id: "munchkin",
    name: "먼치킨 10개",
    aiScore: 30,
    aiReason: "오후 간식 시간대 버스 증가 추세. 주말 가족 단위 방문 예상으로 소폭 추가 권장합니다.",
    recommendedQty: 60,
    currentQty: 60,
    lastWeekQty: 55,
    prevWeekQty: 58,
  },
  {
    id: "americano_iced",
    name: "아이스 아메리카노",
    aiScore: 15,
    aiReason: "기온 하락으로 아이스 수요가 낮습니다. 최소 수량 유지를 권장합니다.",
    recommendedQty: 5,
    currentQty: 5,
    lastWeekQty: 20,
    prevWeekQty: 18,
  },
];

// ============================================================
// AI 비서 채팅 (Agent B/C)
// ============================================================

export const mockOrderDraft: OrderDraft = {
  id: "2026-0318",
  items: [
    { name: "글레이즈드", qty: 60 },
    { name: "보스턴 크림", qty: 40 },
    { name: "먼치킨 10개", qty: 25 },
    { name: "아메리카노", qty: 5 },
  ],
  generatedAt: "2026-03-18 14:23",
  totalAmount: 324000,
};

export const mockChatMessages: ChatMessage[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "안녕하세요! 던킨 AI 비서입니다. 자연어로 업무를 지시해 주세요.",
    timestamp: "14:20",
  },
  {
    id: "2",
    role: "user",
    content: "지난주 화요일처럼 주문해줘, 근데 빨대는 빼고.",
    timestamp: "14:23",
  },
  {
    id: "3",
    role: "assistant",
    content: "발주서 초안을 생성했습니다.",
    timestamp: "14:23",
    draft: mockOrderDraft,
  },
];

// ============================================================
// 리뷰 센티먼트 (Agent C)
// ============================================================

export const mockReviewSentiment: ReviewSentiment = {
  rating: 4.8,
  totalCount: 142,
  distribution: {
    positive: 75,
    neutral: 15,
    negative: 10,
  },
  positiveKeywords: ["커피 맛있", "포장이 꼼꼼요", "도넛이 신선해요"],
  improvementKeywords: ["오후에 글레이즈드 없어요", "대기 시간이 길어요"],
  recentReviews: [
    {
      id: "r1",
      content: "커피 맛있고 직원분들이 친절해요. 매일 들러요.",
      rating: 5,
      date: "2026-03-17",
      sentiment: "positive",
    },
    {
      id: "r2",
      content: "오후에 가면 글레이즈드가 항상 없어요. 재고 관리 좀 부탁해요.",
      rating: 3,
      date: "2026-03-16",
      sentiment: "negative",
    },
    {
      id: "r3",
      content: "포장이 꼼꼼하고 도넛이 신선해서 좋아요.",
      rating: 5,
      date: "2026-03-15",
      sentiment: "positive",
    },
  ],
};

// ============================================================
// 알림 (신호등 우선순위)
// ============================================================

export const mockNotifications: NotificationItem[] = [
  {
    id: "n1",
    priority: "urgent",
    title: "글레이즈드 재고 부족",
    body: "1시간 32분 후 소진 예상. 지금 생산 등록이 필요합니다.",
    time: "방금",
    isRead: false,
    hasAction: true,
    actionLabel: "생산 등록",
  },
  {
    id: "n2",
    priority: "urgent",
    title: "발주 마감 20분 전",
    body: "베이커리 그룹 마감이 20분 남았습니다.",
    time: "5분 전",
    isRead: false,
    hasAction: true,
    actionLabel: "발주 확인",
  },
  {
    id: "n3",
    priority: "warning",
    title: "보스턴 크림 주의",
    body: "3시간 10분 후 소진 예상. 오후 생산을 고려하세요.",
    time: "10분 전",
    isRead: false,
    hasAction: false,
  },
  {
    id: "n4",
    priority: "info",
    title: "주간 매출 리포트",
    body: "이번 주 매출 요약이 준비됐습니다.",
    time: "1시간 전",
    isRead: true,
    hasAction: true,
    actionLabel: "보기",
  },
];

// ============================================================
// POS 대기열
// ============================================================

export const mockQueueItems: QueueItem[] = [
  {
    id: "q1",
    orderNumber: 127,
    status: "making",
    group: "making",
    items: ["글레이즈드 2개", "아메리카노 1잔"],
    elapsed: "3:00",
  },
  {
    id: "q2",
    orderNumber: 128,
    status: "making",
    group: "making",
    items: ["먼치킨 10개팩", "카페라떼 1잔"],
    elapsed: "2:00",
  },
  {
    id: "q3",
    orderNumber: 126,
    status: "pickup_ready",
    group: "pickup",
    items: ["보스턴 크림 3개"],
    elapsed: "1:00",
  },
  {
    id: "q4",
    orderNumber: 125,
    status: "pickup_ready",
    group: "pickup",
    items: ["아이스 아메리카노 2잔"],
    elapsed: "4:30",
  },
];

// ============================================================
// POS 장바구니
// ============================================================

export const mockCartItems: CartItem[] = [
  { id: "c1", name: "글레이즈드 도넛", price: 1800, qty: 2 },
  { id: "c2", name: "아메리카노 (HOT)", price: 3200, qty: 1 },
];

// ============================================================
// POS 메뉴 그리드
// ============================================================

export const mockMenuCategories = ["도넛", "음료", "커피", "샌드위치"] as const;

export const mockMenuItems = [
  { id: "m1", name: "글레이즈드", price: 1800, category: "도넛", soldOut: false },
  { id: "m2", name: "보스턴 크림", price: 2000, category: "도넛", soldOut: false },
  { id: "m3", name: "먼치킨 10개", price: 6500, category: "도넛", soldOut: false },
  { id: "m4", name: "초콜릿 프로스팅", price: 2000, category: "도넛", soldOut: true },
  { id: "m5", name: "스트로베리", price: 2000, category: "도넛", soldOut: false },
  { id: "m6", name: "크루아상", price: 3500, category: "도넛", soldOut: false },
  { id: "m7", name: "아메리카노 HOT", price: 3200, category: "커피", soldOut: false },
  { id: "m8", name: "아메리카노 ICE", price: 3400, category: "커피", soldOut: false },
  { id: "m9", name: "카페라떼 HOT", price: 3800, category: "커피", soldOut: false },
  { id: "m10", name: "카페라떼 ICE", price: 4000, category: "커피", soldOut: false },
  { id: "m11", name: "카푸치노", price: 3800, category: "커피", soldOut: false },
  { id: "m12", name: "에스프레소", price: 2800, category: "커피", soldOut: false },
];
