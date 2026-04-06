"use client";

/**
 * 점주 포스 — 메인 진입점
 * - 기존 비알코리아 웹 POS 내부에서 "점주 포스 이동" 버튼 클릭 시 접근
 * - 주문·결제 없음. AI 기반 생산·발주·매출 관리 전용
 * - Agent A (재고생산) / Agent B (발주) / Agent C (홈·매출·공지)
 */

import { useState } from "react";
import { PosLayout } from "./_components/PosLayout";
import { HomeTab } from "./_components/tabs/HomeTab";
import { InventoryTab } from "./_components/tabs/InventoryTab";
import { OrderTab } from "./_components/tabs/OrderTab";
import { SalesTab } from "./_components/tabs/SalesTab";
import { NoticeTab } from "./_components/tabs/NoticeTab";
import type { PosTab } from "@/shared/types/pos";

export default function PosPage() {
  const [activeTab, setActiveTab] = useState<PosTab>("home");

  return (
    <PosLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === "home" && (
        <HomeTab onNavigate={setActiveTab} />
      )}
      {activeTab === "inventory" && (
        <InventoryTab />
      )}
      {activeTab === "order" && (
        <OrderTab onNavigate={setActiveTab} />
      )}
      {activeTab === "sales" && (
        <SalesTab />
      )}
      {activeTab === "notice" && (
        <NoticeTab />
      )}
    </PosLayout>
  );
}
