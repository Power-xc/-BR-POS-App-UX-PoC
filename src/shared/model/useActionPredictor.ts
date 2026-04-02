"use client";

import { useState, useEffect, useCallback } from "react";
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
 */
export function useActionPredictor() {
  const [predictions, setPredictions] = useState<Record<ActionId, number>>(
    () => ({} as Record<ActionId, number>)
  );

  /* 마운트 시 최초 예측 계산 */
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
      return getGlowClass(predictions[id] ?? 0);
    },
    [predictions]
  );

  return { track, glowClass };
}
