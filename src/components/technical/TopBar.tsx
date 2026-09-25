"use client";

import Link from "next/link";
import { useLocale } from "@/lib/locale";
import { useTelemetry } from "@/lib/telemetry";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { ThemeToggle } from "../ThemeToggle";
import {
  RobotIcon,
  WifiIcon,
  OverviewTabIcon,
  AlertsTabIcon,
  MissionTabIcon,
  ActivityLogIcon,
  LayoutTechnicalIcon,
} from "../icons";
import { cn } from "@/lib/utils";

export type TechTab = "overview" | "alerts" | "mission" | "activity";

const ROBOT_DOT_CLASS: Record<string, string> = {
  good: "bg-good",
  accent: "bg-accent",
  warn: "bg-warn",
};

export function TopBar({ tab, onTab }: { tab: TechTab; onTab: (t: TechTab) => void }) {
  const { t } = useLocale();
  const telemetry = useTelemetry();
  const activeAlerts = telemetry.alerts.filter((a) => a.active).length;

  return (
    <div className="shrink-0">
      <div className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-panel-border bg-panel gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-[34px] h-[34px] rounded-lg bg-accent-soft border border-accent flex items-center justify-center text-accent">
            <RobotIcon width={18} height={18} />
          </div>
          <div>
            <div className="font-bold text-[15px] leading-tight tracking-wide">{t.appName.toUpperCase()}</div>
            <div className="font-mono text-[10.5px] text-fg-faint">FLEET &middot; 3 UNITS &middot; SCADA v2.1</div>
          </div>
        </div>

        {/* Robot picker — switches which robot the stat cards / mission
            control / activity log focus on. */}
        <div className="flex items-center gap-0.5 bg-bg rounded-lg p-1">
          {telemetry.robots.map((robot) => (
            <button
              key={robot.id}
              type="button"
              onClick={() => telemetry.selectRobot(robot.id)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11.5px] font-semibold whitespace-nowrap",
                robot.id === telemetry.selectedRobotId ? "bg-panel shadow-sm text-fg" : "text-fg-muted"
              )}
            >
              <span className={cn("w-1.5 h-1.5 rounded-full", ROBOT_DOT_CLASS[robot.color])} />
              {robot.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <Pill icon={<WifiIcon width={12} height={12} className="text-fg-muted" />} tone="neutral">
            LINK OK
          </Pill>
          <Pill tone="good">
            <span className="w-1.5 h-1.5 rounded-full bg-good inline-block mr-1.5" />
            {telemetry.speed.status === "Active" ? t.moving.toUpperCase() : t.idle.toUpperCase()}
          </Pill>
          <Pill tone="neutral">
            {t.batterySoc} <span className="font-bold text-fg ml-1">{Math.round(telemetry.battery.soc)}%</span>
          </Pill>

          <div className="hidden md:flex gap-0.5 bg-bg rounded-lg p-1 ml-2">
            <TabButton active={tab === "overview"} onClick={() => onTab("overview")} icon={<OverviewTabIcon width={13} height={13} />}>
              {t.overview}
            </TabButton>
            <TabButton active={tab === "alerts"} onClick={() => onTab("alerts")} icon={<AlertsTabIcon width={13} height={13} />} badge={activeAlerts || undefined}>
              {t.alerts}
            </TabButton>
            <TabButton active={tab === "mission"} onClick={() => onTab("mission")} icon={<MissionTabIcon width={13} height={13} />}>
              {t.missionControl}
            </TabButton>
            <TabButton active={tab === "activity"} onClick={() => onTab("activity")} icon={<ActivityLogIcon width={13} height={13} />}>
              {t.activityLog}
            </TabButton>
          </div>
        </div>
      </div>

      {/* mobile tabs */}
      <div className="flex md:hidden gap-0.5 bg-bg p-1 border-b border-panel-border overflow-x-auto">
        <TabButton active={tab === "overview"} onClick={() => onTab("overview")} icon={<OverviewTabIcon width={13} height={13} />} full>
          {t.overview}
        </TabButton>
        <TabButton active={tab === "alerts"} onClick={() => onTab("alerts")} icon={<AlertsTabIcon width={13} height={13} />} badge={activeAlerts || undefined} full>
          {t.alerts}
        </TabButton>
        <TabButton active={tab === "mission"} onClick={() => onTab("mission")} icon={<MissionTabIcon width={13} height={13} />} full>
          {t.missionControl}
        </TabButton>
        <TabButton active={tab === "activity"} onClick={() => onTab("activity")} icon={<ActivityLogIcon width={13} height={13} />} full>
          {t.activityLog}
        </TabButton>
      </div>

      {/* compact controls strip */}
      <div className="h-[38px] flex items-center justify-end gap-2.5 px-4 sm:px-6 bg-bg border-b border-panel-border">
        <Link href="/" className="flex items-center gap-1.5 text-[11.5px] text-fg-muted">
          <LayoutTechnicalIcon width={12} height={12} />
          {t.simpleView}
        </Link>
        <div className="w-px h-3.5 bg-panel-border" />
        <LanguageSwitcher compact />
        <div className="w-px h-3.5 bg-panel-border" />
        <ThemeToggle compact />
      </div>
    </div>
  );
}

function Pill({
  children,
  icon,
  tone,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  tone: "neutral" | "good";
}) {
  return (
    <div
      className={cn(
        "hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono",
        tone === "good" ? "bg-good-soft text-good font-semibold" : "bg-bg border border-panel-border text-fg-muted"
      )}
    >
      {icon}
      {children}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  badge,
  full,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  badge?: number;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-md text-[12.5px] font-semibold whitespace-nowrap",
        full && "flex-1",
        active ? "bg-panel text-fg shadow-sm" : "text-fg-muted"
      )}
    >
      {icon}
      {children}
      {badge ? (
        <span className="bg-bad text-white text-[9.5px] font-bold rounded-full px-1.5 py-0.5 leading-none">
          {badge}
        </span>
      ) : null}
    </button>
  );
}
