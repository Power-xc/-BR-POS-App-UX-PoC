import { fetchJson } from "./http";

export type PocMobileHomeResponse = {
  store_id: string;
  biz_date: string;
  briefing: {
    summary: string;
    highlights: Array<{ label: string; value: string; trend: "up" | "down" | "neutral" }>;
  };
  inventory: Array<{
    id: string;
    name: string;
    currentStock: number;
    unit: string;
    remainingTime: string;
    estimatedRunout: string;
    status: "urgent" | "warning" | "normal";
    avgFirst: { time: string; qty: number };
    avgSecond: { time: string; qty: number };
  }>;
  notifications: Array<{
    id: string;
    priority: "urgent" | "warning" | "info";
    title: string;
    body: string;
    time: string;
    isRead: boolean;
    hasAction: boolean;
    actionLabel?: string;
  }>;
};

export async function getPocMobileHome(storeId?: string) {
  return fetchJson<PocMobileHomeResponse>("/api/poc/mobile/home", {
    headers: storeId ? { "X-Store-Id": storeId } : undefined,
  });
}

export type PocChatResponse = {
  session_id: string;
  type: string;
  answer: string;
  actions?: Array<{ type: string; title?: string; url?: string }>;
  ui?: {
    blocks?: Array<
      | {
          type: "callouts";
          title?: string;
          items: Array<{ title: string; evidence?: string; action?: { type: string; title?: string; url?: string } }>;
        }
      | {
          type: "table";
          title?: string;
          columns: Array<{ key: string; label: string }>;
          rows: Array<Record<string, unknown>>;
        }
      | {
          type: "chart_line";
          title?: string;
          series: Array<Record<string, unknown>>;
          xKey: string;
          yKeys: string[];
        }
    >;
    order_draft?: {
      id: string;
      items: Array<{ name: string; qty: number }>;
      generatedAt: string;
      totalAmount: number;
    };
    [k: string]: unknown;
  } | null;
  sql_executed?: string | null;
  rows?: unknown[] | null;
  request_id?: string;
};

export async function postPocChat(input: {
  message: string;
  session_id?: string;
  channel?: "full" | "mini";
  current_page?: string;
  store_id?: string;
}) {
  const { store_id, ...body } = input;
  return fetchJson<PocChatResponse>("/api/poc/chat", {
    method: "POST",
    body: JSON.stringify(body),
    headers: store_id ? { "X-Store-Id": store_id } : undefined,
  });
}

export type PocOrderOptionsResponse = {
  store_id: string;
  ref_inventory_date: string | null;
  principle: string;
  order_groups: Array<{ group_id: string; group_name: string; deadline_time: string }>;
  products: Array<{
    product_id: string;
    product_name: string;
    current_stock: number;
    stockout_minutes: number;
    options: Array<{
      code: string;
      label: string;
      ref_biz_date: string;
      recommended_order_qty: number;
      rationale: string;
    }>;
    default_recommended_qty: number;
  }>;
};

export async function getPocOrderOptions(storeId?: string) {
  return fetchJson<PocOrderOptionsResponse>("/api/poc/order/recommend-options", {
    headers: storeId ? { "X-Store-Id": storeId } : undefined,
  });
}

export async function postPocOrderConfirm(input: {
  draft_id?: string;
  items: Array<{ name: string; qty: number }>;
  total_amount?: number;
  store_id?: string;
}) {
  const { store_id, ...body } = input;
  return fetchJson<{ ok: boolean; order_id: string; status: string; total_est: number }>(
    "/api/poc/order/confirm",
    {
      method: "POST",
      body: JSON.stringify(body),
      headers: store_id ? { "X-Store-Id": store_id } : undefined,
    }
  );
}

export type PocReviewSentimentResponse = {
  store_id: string;
  biz_date: string;
  rating: number;
  totalCount: number;
  distribution: { positive: number; neutral: number; negative: number };
  positiveKeywords: string[];
  improvementKeywords: string[];
  recommendedActions?: Array<{
    id: string;
    title: string;
    reason: string;
    cta: { label: string; url: string };
    priority: "urgent" | "warning" | "info";
  }>;
  recentReviews: Array<{
    id: string;
    content: string;
    rating: number;
    date: string;
    sentiment: "positive" | "neutral" | "negative";
  }>;
};

export async function getPocReviewSentiment(storeId?: string) {
  return fetchJson<PocReviewSentimentResponse>("/api/poc/review/sentiment", {
    headers: storeId ? { "X-Store-Id": storeId } : undefined,
  });
}

