"use client"
import React from "react";
import { SummaryDashboard } from "@/components/analytics/SummaryDashboard";

export default function AnalyticsPageView() {
  return (
    <div>
    <SummaryDashboard timeframe="30days" />
    </div>
  );
}