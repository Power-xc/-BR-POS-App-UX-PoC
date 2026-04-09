"use client";

import { Star, TrendingUp } from "lucide-react";
import { Card, SectionHeader } from "@/shared/ui/Card";
import { mockReviewSentiment } from "@/entities/mock/data";
import { useEffect, useState } from "react";
import { getPocReviewSentiment, type PocReviewSentimentResponse } from "@/shared/api/poc";

// ============================================================
// 종합 점수 헤더
// ============================================================

function ActionBanner({ data }: { data: PocReviewSentimentResponse }) {
  const actions = data.recommendedActions || [];
  if (!actions.length) return null;

  const top = actions[0];
  const accent =
    top.priority === "urgent"
      ? "ring-1 ring-primary/20 bg-[#0B0B0C] text-white"
      : "ring-1 ring-border bg-white text-primary";

  return (
    <div className={`rounded-2xl p-4 mb-3 ${accent}`}>
      <p className={`text-[10px] font-bold tracking-widest ${top.priority === "urgent" ? "text-white/60" : "text-tertiary"}`}>
        ACTION FROM REVIEWS
      </p>
      <p className="text-base font-bold mt-1">{top.title}</p>
      <p className={`text-xs mt-1.5 leading-relaxed ${top.priority === "urgent" ? "text-white/70" : "text-secondary"}`}>
        {top.reason}
      </p>
      <div className="mt-3 flex gap-2">
        <a
          href={top.cta.url}
          className={`
            h-10 px-4 rounded-xl inline-flex items-center justify-center
            text-sm font-bold transition-all active:scale-[0.99]
            ${top.priority === "urgent" ? "bg-white text-primary" : "bg-primary text-white"}
          `}
        >
          {top.cta.label}
        </a>
        {actions[1] && (
          <a
            href={actions[1].cta.url}
            className={`
              h-10 px-4 rounded-xl inline-flex items-center justify-center
              text-sm font-bold transition-all active:scale-[0.99]
              ${top.priority === "urgent" ? "bg-white/10 text-white border border-white/20" : "bg-card text-primary border border-border"}
            `}
          >
            {actions[1].cta.label}
          </a>
        )}
      </div>
    </div>
  );
}

function RatingHeader({ data }: { data: PocReviewSentimentResponse }) {
  const { rating, totalCount } = data;

  return (
    <Card className="mb-3">
      <div className="flex items-end gap-3 mb-4">
        <span className="text-5xl font-bold text-primary tabular-nums">{rating}</span>
        <div className="pb-1">
          <span className="text-sm text-secondary">/5.0</span>
          <p className="text-xs text-secondary mt-0.5">최근 {totalCount}건</p>
        </div>
        <div className="ml-auto flex items-center gap-1 text-xs text-success font-medium">
          <TrendingUp size={14} />
          <span>+0.2</span>
        </div>
      </div>

      {/* 분포 바 */}
      <div className="space-y-1.5">
        {[
          {
            label: "긍정",
            pct: data.distribution.positive,
            color: "bg-primary",
          },
          {
            label: "중립",
            pct: data.distribution.neutral,
            color: "bg-warning-neutral",
          },
          {
            label: "부정",
            pct: data.distribution.negative,
            color: "bg-info-neutral",
          },
        ].map(({ label, pct, color }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="text-xs text-secondary w-6">{label}</span>
            <div className="flex-1 h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${color}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs font-medium text-primary tabular-nums w-8 text-right">
              {pct}%
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ============================================================
// 키워드 섹션
// ============================================================

function KeywordSection({ data }: { data: PocReviewSentimentResponse }) {
  return (
    <Card className="mb-3">
      <SectionHeader label="주요 긍정 키워드" />
      <div className="flex flex-wrap gap-2 mb-4">
        {data.positiveKeywords.map((kw) => (
          <span
            key={kw}
            className="bg-[#E8F5EE] text-success text-xs font-medium px-3 py-1.5 rounded-full"
          >
            {kw}
          </span>
        ))}
      </div>

      <SectionHeader label="개선 필요 키워드" />
      <div className="flex flex-wrap gap-2">
        {data.improvementKeywords.map((kw, idx) => (
          <span
            // React key 중복 방지: 동일 문구가 여러 번 올 수 있음(예: "항상 없어요")
            key={`${kw}-${idx}`}
            className="bg-[#FEF3F2] text-error text-xs font-medium px-3 py-1.5 rounded-full"
          >
            {kw}
          </span>
        ))}
      </div>
    </Card>
  );
}

// ============================================================
// 최근 리뷰 목록
// ============================================================

const sentimentStyle = {
  positive: "text-success",
  neutral: "text-secondary",
  negative: "text-error",
};

function RecentReviews({ data }: { data: PocReviewSentimentResponse }) {
  return (
    <Card>
      <SectionHeader label="최근 리뷰" />
      <div className="space-y-3">
        {data.recentReviews.map((review) => (
          <div key={review.id} className="pb-3 border-b border-border last:border-0 last:pb-0">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    className={i < review.rating ? "text-[#FFAB00] fill-[#FFAB00]" : "text-[#E0E0E0]"}
                  />
                ))}
              </div>
              <span className={`text-[10px] font-semibold ${sentimentStyle[review.sentiment]}`}>
                {review.sentiment === "positive"
                  ? "긍정"
                  : review.sentiment === "neutral"
                  ? "중립"
                  : "부정"}
              </span>
              <span className="text-[10px] text-tertiary ml-auto">{review.date}</span>
            </div>
            <p className="text-sm text-secondary leading-relaxed">{review.content}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ============================================================
// 리뷰 페이지
// ============================================================

export default function ReviewPage() {
  const [data, setData] = useState<PocReviewSentimentResponse | null>(null);

  useEffect(() => {
    // PoC 백엔드 연동: 현재 dunkin-pos-ai에 리뷰 원천 테이블이 없어서
    // 백엔드가 매출/품절/공지 기반으로 '설명 가능한 요약'을 합성해 내려준다.
    // 화면/UX는 유지하고 데이터 소스만 교체한다.
    getPocReviewSentiment()
      .then(setData)
      .catch(() => setData(null));
  }, []);

  const sentiment = data ?? {
    ...mockReviewSentiment,
    store_id: "S001",
    biz_date: "mock",
    totalCount: mockReviewSentiment.totalCount,
  };

  return (
    <div className="h-full overflow-y-auto hide-scrollbar px-4 py-4 pb-20">
      <div className="mb-4">
        <h1 className="text-lg font-bold text-primary">리뷰 센티먼트 분석</h1>
        <p className="text-xs text-secondary mt-0.5">
          API 고객 피드백을 자동 분류하고 핵심 키워드를 추출합니다.
        </p>
      </div>

      {/* UX 개선(추적 가능): 리뷰에서 바로 행동으로 연결되는 상단 카드 */}
      <ActionBanner data={sentiment as PocReviewSentimentResponse} />

      <RatingHeader data={sentiment as PocReviewSentimentResponse} />
      <KeywordSection data={sentiment as PocReviewSentimentResponse} />
      <RecentReviews data={sentiment as PocReviewSentimentResponse} />

      <div className="h-4" />
    </div>
  );
}
