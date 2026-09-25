"use client";

import { useState } from "react";
import { useTelemetry } from "@/lib/telemetry";
import { TopBar, type TechTab } from "./TopBar";
import { OverviewTab } from "./OverviewTab";
import { AlertsTab } from "./AlertsTab";
import { MissionControlTab } from "./MissionControlTab";
import { ActivityLogTab } from "./ActivityLogTab";

function formatUptime(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

export function TechnicalDashboard() {
  const [tab, setTab] = useState<TechTab>("overview");
  const telemetry = useTelemetry();

  return (
    <div className="flex flex-col h-screen bg-bg text-fg">
      <TopBar tab={tab} onTab={setTab} />

      <div className="flex-1 flex flex-col min-h-0">
        {tab === "overview" && <OverviewTab />}
        {tab === "alerts" && <AlertsTab />}
        {tab === "mission" && <MissionControlTab />}
        {tab === "activity" && <ActivityLogTab />}
      </div>

      <div className="h-[26px] shrink-0 flex items-center justify-between px-5 border-t border-panel-border bg-panel font-mono text-[10px] text-fg-faint">
        <div className="flex gap-4">
          <span className="text-good">&#9679; SYSTEM ONLINE</span>
          <span>UPTIME: {formatUptime(telemetry.uptimeSeconds)}</span>
          <span>{telemetry.robotName.toUpperCase()} CYCLE: {telemetry.cycle}</span>
        </div>
        <div className="flex gap-4">
          <span>
            POS: {Math.round(telemetry.robotPos.x)}, {Math.round(telemetry.robotPos.y)}
          </span>
        </div>
      </div>
    </div>
  );
}
