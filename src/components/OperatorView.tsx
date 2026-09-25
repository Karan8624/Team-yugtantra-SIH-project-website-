"use client";

import Link from "next/link";
import { useLocale } from "@/lib/locale";
import { useTelemetry, MISSION_STEPS } from "@/lib/telemetry";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import {
  RobotIcon,
  BatteryIcon,
  SpeedIcon,
  PayloadIcon,
  ConnectionIcon,
  LayoutTechnicalIcon,
  PlayIcon,
  PauseIcon,
  StopOctagonIcon,
} from "./icons";
import { cn } from "@/lib/utils";

export function OperatorView() {
  const { t } = useLocale();
  const telemetry = useTelemetry();

  const batteryWord = telemetry.battery.soc > 30 ? t.good : t.low;
  const speedWord =
    telemetry.speed.mode === "Moving" ? t.moving : telemetry.speed.mode === "Caution" ? t.caution : t.idle;
  const payloadWord = telemetry.payload.current > 0 ? undefined : t.empty;
  const activeStepId = MISSION_STEPS[telemetry.mission.activeIndex];
  const activeStepLabel = t[`step_${activeStepId}` as keyof typeof t];

  return (
    <div className="flex flex-col min-h-screen bg-bg text-fg">
      {/* Top bar */}
      <div className="h-[76px] shrink-0 flex items-center justify-between px-6 md:px-8 bg-panel border-b border-panel-border">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-[9px] bg-accent flex items-center justify-center text-white">
            <RobotIcon width={20} height={20} />
          </div>
          <div>
            <div className="font-bold text-[17px] leading-tight">{t.appName}</div>
            <div className="text-xs text-fg-faint">{t.simpleView}</div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3.5">
          <Link
            href="/technical"
            className="flex items-center gap-1.5 px-4 py-2 rounded-[9px] border-[1.5px] border-panel-border text-[13.5px] font-semibold text-fg"
          >
            <LayoutTechnicalIcon width={15} height={15} />
            {t.technicalView}
          </Link>
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </div>

      {/* Mobile controls row */}
      <div className="flex sm:hidden items-center justify-end gap-2 px-4 py-2 bg-panel border-b border-panel-border">
        <Link href="/technical" className="text-[12px] font-semibold text-fg-muted flex items-center gap-1">
          <LayoutTechnicalIcon width={13} height={13} />
          {t.technicalView}
        </Link>
        <ThemeToggle compact />
        <LanguageSwitcher compact />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col items-center px-5 sm:px-10 py-8 gap-6">
        <div className="w-full max-w-[1180px] flex flex-col gap-6">
          {/* Hero status */}
          <div className="bg-panel border border-panel-border rounded-2xl p-6 sm:p-8 flex flex-wrap items-center gap-6">
            <div className="w-[72px] h-[72px] sm:w-[86px] sm:h-[86px] rounded-full bg-accent-soft flex items-center justify-center shrink-0 text-accent">
              <RobotIcon width={38} height={38} strokeWidth={1.6} />
            </div>
            <div className="flex-1 min-w-[220px]">
              <div className="text-xs font-bold tracking-[0.09em] text-fg-faint mb-1.5">
                {t.robotStatus.toUpperCase()}
              </div>
              <div className="text-2xl sm:text-[29px] font-bold leading-tight">
                {telemetry.mission.stepDetail}
              </div>
              <div className="text-sm text-fg-muted mt-1.5">
                {activeStepLabel} &middot; {speedWord}
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-good-soft shrink-0">
              <span className="w-2 h-2 rounded-full bg-good animate-pulse" />
              <span className="text-xs font-bold text-good">{t.live.toUpperCase()}</span>
            </div>
          </div>

          {/* Tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <Tile
              icon={<BatteryIcon width={22} height={22} />}
              label={t.battery.toUpperCase()}
              value={`${Math.round(telemetry.battery.soc)}%`}
              sub={batteryWord}
              subClass={telemetry.battery.soc > 30 ? "text-good" : "text-bad"}
            />
            <Tile
              icon={<SpeedIcon width={22} height={22} />}
              label={t.speed.toUpperCase()}
              value={speedWord}
              sub={`${telemetry.speed.mps.toFixed(1)} m/s`}
              mono
            />
            <Tile
              icon={<PayloadIcon width={22} height={22} />}
              label={t.payload.toUpperCase()}
              value={payloadWord ?? `${telemetry.payload.current.toFixed(1)} kg`}
              sub={`${telemetry.payload.current.toFixed(1)} / ${telemetry.payload.max} kg`}
              mono
            />
            <Tile
              icon={<ConnectionIcon width={22} height={22} />}
              label={t.connection.toUpperCase()}
              value={t.connected}
              sub={t.signalStrong}
              subClass="text-good"
            />
          </div>

          {/* Big actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <ActionButton
              icon={<PlayIcon width={22} height={22} />}
              label={t.startNextTask}
              onClick={() => telemetry.startMission()}
              className="bg-good text-white"
            />
            <ActionButton
              icon={<PauseIcon width={20} height={20} className="text-fg" />}
              label={t.pause}
              onClick={() => telemetry.pauseMission()}
              className="bg-panel border-2 border-panel-border text-fg"
            />
            <ActionButton
              icon={<StopOctagonIcon width={22} height={22} />}
              label={t.emergencyStop}
              onClick={telemetry.emergencyStop}
              className="bg-bad text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Tile({
  icon,
  label,
  value,
  sub,
  subClass = "text-fg-muted",
  mono = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  subClass?: string;
  mono?: boolean;
}) {
  return (
    <div className="bg-panel border border-panel-border rounded-2xl p-5 flex flex-col gap-3">
      <div className="w-11 h-11 rounded-[11px] bg-accent-soft flex items-center justify-center text-accent">
        {icon}
      </div>
      <div className="text-[11px] font-bold tracking-[0.07em] text-fg-faint">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className={cn("text-[13px] font-semibold", mono && "font-mono", subClass)}>{sub}</div>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 h-[80px] sm:h-[92px] rounded-2xl flex items-center justify-center gap-3 text-lg font-bold active:scale-[0.99] transition-transform",
        className
      )}
    >
      {icon}
      {label}
    </button>
  );
}
