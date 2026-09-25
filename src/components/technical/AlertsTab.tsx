"use client";

import { useLocale } from "@/lib/locale";
import { useTelemetry, type AlertSeverity } from "@/lib/telemetry";
import { cn } from "@/lib/utils";

export function AlertsTab() {
  const { t } = useLocale();
  const { alerts, acknowledgeAlert, resolveAlert } = useTelemetry();
  const active = alerts.filter((a) => a.active);
  const critical = alerts.filter((a) => a.severity === "critical" && a.active);

  return (
    <div className="flex-1 p-4 flex flex-col gap-3.5 min-h-0 overflow-y-auto">
      <div className="grid grid-cols-3 gap-3.5 shrink-0">
        <Stat label={t.active_alerts} value={active.length} tone="bad" />
        <Stat label={t.critical_alerts} value={critical.length} tone="warn" />
        <Stat label={t.total_alerts} value={alerts.length} />
      </div>

      <div className="bg-panel border border-panel-border rounded-xl p-4 flex-1 min-h-0 flex flex-col">
        <div className="flex items-center justify-between mb-3 shrink-0">
          <div className="text-[10.5px] font-semibold tracking-[0.08em] text-fg-faint">{t.alertLog.toUpperCase()}</div>
        </div>
        <div className="flex-1 overflow-y-auto flex flex-col gap-2">
          {alerts.length === 0 && (
            <div className="text-sm text-fg-faint py-8 text-center">No alerts yet — they will appear here as the mission runs.</div>
          )}
          {alerts.map((a) => (
            <div key={a.id} className="flex items-center gap-3 py-3 px-1 border-b border-panel-border last:border-0">
              <SeverityDot severity={a.severity} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {a.robotName && <span className="font-semibold">{a.robotName} &middot; </span>}
                  {a.message}
                </div>
                <div className="font-mono text-[11px] text-fg-faint">{a.time}</div>
              </div>
              {a.active ? (
                <>
                  <span className="px-2 py-1 rounded bg-bad-soft text-bad text-[10.5px] font-bold">ACTIVE</span>
                  <button
                    type="button"
                    onClick={() => acknowledgeAlert(a.id)}
                    className="px-3 py-1.5 rounded-md border border-panel-border text-[11px] font-semibold text-fg-muted"
                  >
                    {t.ack}
                  </button>
                  <button
                    type="button"
                    onClick={() => resolveAlert(a.id)}
                    className="px-3 py-1.5 rounded-md border border-good text-good text-[11px] font-semibold"
                  >
                    {t.resolve}
                  </button>
                </>
              ) : (
                <span className="px-2 py-1 rounded bg-good-soft text-good text-[10.5px] font-bold">RESOLVED</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "bad" | "warn" }) {
  return (
    <div className="bg-panel border border-panel-border rounded-xl p-4">
      <div className="text-[10.5px] font-semibold tracking-[0.08em] text-fg-faint mb-2">{label.toUpperCase()}</div>
      <div className={cn("text-3xl font-bold font-mono", tone === "bad" && "text-bad", tone === "warn" && "text-warn")}>
        {value}
      </div>
    </div>
  );
}

function SeverityDot({ severity }: { severity: AlertSeverity }) {
  const color = severity === "critical" ? "bg-bad" : severity === "warning" ? "bg-warn" : "bg-accent";
  return <span className={cn("w-2 h-2 rounded-full shrink-0", color)} />;
}
