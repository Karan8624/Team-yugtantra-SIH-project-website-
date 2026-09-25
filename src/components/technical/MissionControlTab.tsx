"use client";

import { useState } from "react";
import { useLocale } from "@/lib/locale";
import { useTelemetry, type TaskEntry, TASK_STATIONS, STATION_LABELS } from "@/lib/telemetry";
import { StopOctagonIcon, RobotIcon } from "../icons";
import { MissionSequencePanel } from "./MissionSequencePanel";
import { cn } from "@/lib/utils";

const TASK_TYPES: TaskEntry["type"][] = ["Lift", "Inspection", "Maintenance"];
const PRIORITIES: TaskEntry["priority"][] = ["Low", "Normal", "High", "Critical"];
const STATIONS = TASK_STATIONS.map((id) => STATION_LABELS[id]);
const UNASSIGNED = "unassigned";

export function MissionControlTab() {
  const { t } = useLocale();
  const telemetry = useTelemetry();
  const [type, setType] = useState<TaskEntry["type"]>("Lift");
  const [from, setFrom] = useState(STATIONS[0]);
  const [to, setTo] = useState(STATIONS[1]);
  const [priority, setPriority] = useState<TaskEntry["priority"]>("Normal");
  const [assignedRobot, setAssignedRobot] = useState<string>(UNASSIGNED);

  return (
    <div className="flex-1 flex flex-col xl:flex-row min-h-0">
      <div className="flex-1 p-4 flex flex-col gap-3.5 min-h-0 overflow-y-auto">
        <div className="bg-panel border border-panel-border rounded-xl p-4 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10.5px] font-semibold tracking-[0.08em] text-fg-faint">{t.robotControls.toUpperCase()}</div>
            <span className="font-mono text-[10.5px] text-accent font-semibold">{telemetry.robotName.toUpperCase()}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ControlButton icon={<StopOctagonIcon width={20} height={20} />} label="E-STOP" onClick={telemetry.emergencyStop} danger />
            <ControlButton label={t.returnToCharge} onClick={() => telemetry.returnToCharge()} />
            <ControlButton icon={<RobotIcon width={18} height={18} />} label={t.goToHome} onClick={() => telemetry.goHome()} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 flex-1 min-h-0">
          <div className="bg-panel border border-panel-border rounded-xl p-4">
            <div className="text-[10.5px] font-semibold tracking-[0.08em] text-fg-faint mb-3">{t.createTask.toUpperCase()}</div>

            <FieldLabel>{t.taskType}</FieldLabel>
            <SegmentGroup options={TASK_TYPES} value={type} onChange={setType} labels={{ Lift: t.lift, Inspection: t.inspection, Maintenance: t.maintenance }} />

            <div className="grid grid-cols-2 gap-3 mt-3.5">
              <div>
                <FieldLabel>{t.fromZone}</FieldLabel>
                <Select value={from} onChange={setFrom} options={STATIONS} />
              </div>
              <div>
                <FieldLabel>{t.toZone}</FieldLabel>
                <Select value={to} onChange={setTo} options={STATIONS} />
              </div>
            </div>

            <FieldLabel className="mt-3.5">{t.priority}</FieldLabel>
            <SegmentGroup
              options={PRIORITIES}
              value={priority}
              onChange={setPriority}
              labels={{ Low: t.low_priority, Normal: t.normal_priority, High: t.high_priority, Critical: t.critical_priority }}
            />

            <FieldLabel className="mt-3.5">{t.assignTo}</FieldLabel>
            <Select
              value={assignedRobot}
              onChange={setAssignedRobot}
              options={[UNASSIGNED, ...telemetry.robots.map((r) => r.id)]}
              renderLabel={(v) => (v === UNASSIGNED ? t.unassigned : telemetry.robots.find((r) => r.id === v)?.name ?? v)}
            />

            <button
              type="button"
              onClick={() => {
                const robot = telemetry.robots.find((r) => r.id === assignedRobot);
                telemetry.dispatchTask({
                  type,
                  from,
                  to,
                  priority,
                  assignedRobotId: robot?.id,
                  assignedRobotName: robot?.name,
                });
              }}
              className="w-full mt-4 py-2.5 rounded-lg bg-accent text-white font-semibold text-sm"
            >
              + {t.dispatchTask}
            </button>
          </div>

          <div className="bg-panel border border-panel-border rounded-xl p-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="text-[10.5px] font-semibold tracking-[0.08em] text-fg-faint">{t.taskQueue.toUpperCase()}</div>
              <span className="font-mono text-[11px] text-fg-faint">{telemetry.tasks.length} {telemetry.tasks.length === 1 ? "task" : "tasks"}</span>
            </div>
            <div className="flex-1 overflow-y-auto flex flex-col gap-2">
              {telemetry.tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between py-2.5 border-b border-panel-border last:border-0">
                  <div>
                    <div className="text-sm font-semibold">{task.type}</div>
                    <div className="font-mono text-[11.5px] text-fg-muted">{task.from} &rarr; <span className="text-fg font-semibold">{task.to}</span></div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10.5px] text-warn font-semibold">{task.priority.toUpperCase()}</span>
                      {task.assignedRobotName && (
                        <span className="text-[10.5px] text-accent font-semibold">&middot; {task.assignedRobotName}</span>
                      )}
                    </div>
                  </div>
                  <span className={cn("text-[10.5px] font-semibold flex items-center gap-1.5", task.status === "In Progress" ? "text-warn" : "text-accent")}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", task.status === "In Progress" ? "bg-warn" : "bg-accent")} />
                    {task.status === "In Progress" ? t.inProgress.toUpperCase() : t.queued.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full xl:w-[360px] shrink-0 border-t xl:border-t-0 xl:border-l border-panel-border">
        <MissionSequencePanel />
      </div>
    </div>
  );
}

function FieldLabel({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn("text-[10.5px] font-semibold tracking-[0.06em] text-fg-faint mb-1.5", className)}>
      {children.toUpperCase()}
    </div>
  );
}

function Select<T extends string>({
  value,
  onChange,
  options,
  renderLabel,
}: {
  value: T;
  onChange: (v: T) => void;
  options: readonly T[];
  renderLabel?: (v: T) => string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="w-full px-3 py-2 rounded-lg border border-panel-border bg-bg text-sm text-fg"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {renderLabel ? renderLabel(o) : o}
        </option>
      ))}
    </select>
  );
}

function SegmentGroup<T extends string>({
  options,
  value,
  onChange,
  labels,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  labels: Record<T, string>;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={cn(
            "px-3.5 py-2 rounded-lg text-[13px] font-semibold border",
            value === o ? "bg-accent-soft border-accent text-accent" : "border-panel-border text-fg-muted"
          )}
        >
          {labels[o]}
        </button>
      ))}
    </div>
  );
}

function ControlButton({
  icon,
  label,
  onClick,
  danger,
}: {
  icon?: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl border text-[12.5px] font-bold tracking-wide",
        danger ? "border-bad text-bad" : "border-panel-border text-fg"
      )}
    >
      {icon}
      {label.toUpperCase()}
    </button>
  );
}
