"use client";

import { Star, TrendingUp } from "lucide-react";
import { Card, SectionHeader } from "@/shared/ui/Card";
import { mockReviewSentiment } from "@/entities/mock/data";

// ============================================================
// 종합 점수 헤더
// ============================================================

function RatingHeader() {
  const { rating, totalCount } = mockReviewSentiment;

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
            pct: mockReviewSentiment.distribution.positive,
            color: "bg-primary",
          },
          {
            label: "중립",
            pct: mockReviewSentiment.distribution.neutral,
            color: "bg-warning-neutral",
          },
          {
            label: "부정",
            pct: mockReviewSentiment.distribution.negative,
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

function KeywordSection() {
  return (
    <Card className="mb-3">
      <SectionHeader label="주요 긍정 키워드" />
      <div className="flex flex-wrap gap-2 mb-4">
        {mockReviewSentiment.positiveKeywords.map((kw) => (
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
        {mockReviewSentiment.improvementKeywords.map((kw) => (
          <span
            key={kw}
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

function RecentReviews() {
  return (
    <Card>
      <SectionHeader label="최근 리뷰" />
      <div className="space-y-3">
        {mockReviewSentiment.recentReviews.map((review) => (
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
  return (
    <div className="h-full overflow-y-auto hide-scrollbar px-4 py-4 pb-20">
      <div className="mb-4">
        <h1 className="text-lg font-bold text-primary">리뷰 센티먼트 분석</h1>
        <p className="text-xs text-secondary mt-0.5">
          API 고객 피드백을 자동 분류하고 핵심 키워드를 추출합니다.
        </p>
      </div>

      <RatingHeader />
      <KeywordSection />
      <RecentReviews />

      <div className="h-4" />
    </div>
  );
}
