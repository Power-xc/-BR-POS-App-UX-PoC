"use client";

import { useState, useCallback, useEffect } from "react";
import {
  recordAction,
  computePredictions,
  getGlowClass,
  type ActionId,
} from "@/shared/lib/actionPredictor";

/**
 * 예측형 UI Hook
 * - track(id): 액션 기록 + 예측 재계산
 * - glowClass(id): 해당 액션의 현재 glow CSS 클래스
 *
 * 변경 이력: 초기 렌더에서 바로 computePredictions()(localStorage·로컬 시각)를 쓰면
 * SSR과 클라 첫 페인트의 glow 클래스가 달라 Button 등 className hydration 불일치가 났음.
 * predictions 를 null 로 두고 마운트 후에만 계산, 그 전까지 glow-low 고정.
 */
export function useActionPredictor() {
  /**
   * hydration 불일치 방지:
   * - 서버: localStorage 없음, 브라우저: 히스토리 있음 → 첫 DOM이 달라질 수 있음
   * - 서버/클라 Date 타임존 차이도 TIME_DEFAULTS 점수를 바꿈
   * 첫 페인트는 고정 glow-low, 마운트 후에만 localStorage 반영.
   */
  const [predictions, setPredictions] = useState<Record<ActionId, number> | null>(null);

  useEffect(() => {
    setPredictions(computePredictions());
  }, []);

  /** 액션 기록 + 예측 갱신 */
  const track = useCallback((id: ActionId) => {
    recordAction(id);
    setPredictions(computePredictions());
  }, []);

  /** 특정 액션의 glow 클래스 반환 */
  const glowClass = useCallback(
    (id: ActionId): string => {
      if (predictions === null) {
        return "glow-low";
      }
      return getGlowClass(predictions[id] ?? 0);
    },
    [predictions]
  );

  return { track, glowClass };
}
