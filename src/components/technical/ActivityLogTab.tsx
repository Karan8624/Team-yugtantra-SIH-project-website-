"use client";

import { useLocale } from "@/lib/locale";
import { useTelemetry } from "@/lib/telemetry";
import { cn } from "@/lib/utils";

const ROBOT_DOT_CLASS: Record<string, string> = {
  good: "bg-good",
  accent: "bg-accent",
  warn: "bg-warn",
};

export function ActivityLogTab() {
  const { t } = useLocale();
  const { activityLog, robots } = useTelemetry();
  const robotColor = (id: string) => robots.find((r) => r.id === id)?.color ?? "accent";

  const perRobotCounts = robots.map((r) => ({
    robot: r,
    count: activityLog.filter((a) => a.robotId === r.id).length,
  }));

  return (
    <div className="flex-1 p-4 flex flex-col gap-3.5 min-h-0 overflow-y-auto">
      <div className="grid grid-cols-3 gap-3.5 shrink-0">
        {perRobotCounts.map(({ robot, count }) => (
          <div key={robot.id} className="bg-panel border border-panel-border rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-[10.5px] font-semibold tracking-[0.08em] text-fg-faint mb-2">
              <span className={cn("w-1.5 h-1.5 rounded-full", ROBOT_DOT_CLASS[robot.color])} />
              {robot.name.toUpperCase()}
            </div>
            <div className="text-2xl font-bold font-mono">{count}</div>
            <div className="font-mono text-[10.5px] text-fg-faint mt-1">
              {t.cycle}: {robot.cycle} &middot; {robot.route.from.replace("STN-", "")}&rarr;{robot.route.to.replace("STN-", "")}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-panel border border-panel-border rounded-xl p-4 flex-1 min-h-0 flex flex-col">
        <div className="flex items-center justify-between mb-3 shrink-0">
          <div className="text-[10.5px] font-semibold tracking-[0.08em] text-fg-faint">{t.activityLog.toUpperCase()}</div>
          <span className="font-mono text-[11px] text-fg-faint">{activityLog.length} {t.events}</span>
        </div>
        <div className="flex-1 overflow-y-auto flex flex-col gap-2">
          {activityLog.length === 0 && (
            <div className="text-sm text-fg-faint py-8 text-center">{t.noActivityYet}</div>
          )}
          {activityLog.map((entry) => (
            <div key={entry.id} className="flex items-start gap-3 py-2.5 px-1 border-b border-panel-border last:border-0">
              <span className={cn("w-2 h-2 rounded-full shrink-0 mt-1.5", ROBOT_DOT_CLASS[robotColor(entry.robotId)])} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  <span className="font-semibold">{entry.robotName}</span> &middot; {entry.message}
                </div>
                <div className="font-mono text-[11px] text-fg-faint">{entry.time}</div>
              </div>
              {entry.station && (
                <span className="px-2 py-1 rounded bg-accent-soft text-accent text-[10.5px] font-bold font-mono shrink-0">
                  {entry.station}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
