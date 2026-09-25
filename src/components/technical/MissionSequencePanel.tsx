"use client";

import { useLocale } from "@/lib/locale";
import { useTelemetry, MISSION_STEPS, type MissionStepId } from "@/lib/telemetry";
import { MISSION_STEP_ICONS, PlayIcon, PauseIcon, StepForwardIcon, CheckIcon } from "../icons";
import { cn } from "@/lib/utils";

export function MissionSequencePanel() {
  const { t } = useLocale();
  const telemetry = useTelemetry();
  const { activeIndex, running, stepDetail } = telemetry.mission;

  return (
    <div className="h-full flex flex-col bg-panel">
      <div className="p-4 border-b border-panel-border shrink-0">
        <div className="text-[11px] font-semibold tracking-[0.09em] text-fg-faint mb-3">
          {t.missionSequence.toUpperCase()} &middot; {telemetry.robotName}
        </div>
        <div className="flex gap-2">
          <SeqButton active={running} onClick={() => telemetry.startMission()} icon={<PlayIcon width={12} height={12} />} label={t.start} />
          <SeqButton active={!running} onClick={() => telemetry.pauseMission()} icon={<PauseIcon width={12} height={12} />} label={t.pause} />
          <SeqButton onClick={() => telemetry.stepMission()} icon={<StepForwardIcon width={12} height={12} />} label={t.step} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {MISSION_STEPS.map((id, i) => (
          <StepRow
            key={id}
            id={id}
            label={t[`step_${id}` as keyof typeof t]}
            state={i < activeIndex ? "done" : i === activeIndex ? "active" : "pending"}
            detail={i === activeIndex ? stepDetail : undefined}
          />
        ))}
      </div>
    </div>
  );
}

function SeqButton({
  active,
  onClick,
  icon,
  label,
}: {
  active?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-semibold border",
        active ? "bg-accent-soft border-accent text-accent" : "border-panel-border text-fg-muted"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function StepRow({
  id,
  label,
  state,
  detail,
}: {
  id: MissionStepId;
  label: string;
  state: "done" | "active" | "pending";
  detail?: string;
}) {
  const Icon = MISSION_STEP_ICONS[id];

  return (
    <div
      className={cn(
        "flex items-start gap-2.5 px-4 py-2 border-l-[3px]",
        state === "done" && "border-good",
        state === "active" && "border-accent bg-accent-soft/40",
        state === "pending" && "border-panel-border"
      )}
    >
      <div
        className={cn(
          "w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0 mt-0.5",
          state === "done" && "bg-good-soft border border-good text-good",
          state === "active" && "bg-accent-soft border border-accent text-accent",
          state === "pending" && "bg-bg border border-panel-border text-fg-faint"
        )}
      >
        {state === "done" ? <CheckIcon width={12} height={12} strokeWidth={2.6} /> : <Icon width={12} height={12} />}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className={cn(
            "text-[12.5px]",
            state === "active" && "font-semibold text-fg",
            state === "done" && "text-fg-muted",
            state === "pending" && "text-fg-faint"
          )}
        >
          {label}
        </div>
        {detail && <div className="font-mono text-[11px] text-accent/80 mt-1 leading-relaxed">{detail}</div>}
      </div>
    </div>
  );
}
