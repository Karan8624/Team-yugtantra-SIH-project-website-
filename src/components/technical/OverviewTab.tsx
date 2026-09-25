"use client";

import { useLocale } from "@/lib/locale";
import { useTelemetry, type HealthState } from "@/lib/telemetry";
import { FloorPlan } from "./FloorPlan";
import { cn } from "@/lib/utils";

export function OverviewTab() {
  const { t } = useLocale();
  const telemetry = useTelemetry();
  const { battery, speed, payload, attachment, systemHealth, motorTemp, sensors, engageLift } = telemetry;

  const socRatio = Math.max(0, Math.min(1, battery.soc / 100));
  const dashArray = `${socRatio * 251} 251`;
  const speedRatio = Math.min(1, speed.mps / 1.5);
  const payloadRatio = Math.min(1, payload.current / payload.max);
  const attachRatio = attachment.engaged ? 0.85 : 0.15;

  const healthScore = Math.round(
    (Object.values(systemHealth).filter((v) => v === "normal").length / Object.values(systemHealth).length) * 100
  );

  return (
    <div className="flex-1 p-4 flex flex-col gap-3.5 min-h-0 overflow-y-auto">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 shrink-0">
        {/* Battery */}
        <Card label={t.battery}>
          <div className="flex items-center gap-4">
            <svg viewBox="0 0 100 100" width={70} height={70}>
              <circle cx="50" cy="50" r="40" fill="none" className="stroke-panel-border" strokeWidth={9} />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                className="stroke-good"
                strokeWidth={9}
                strokeLinecap="round"
                strokeDasharray={dashArray}
                transform="rotate(-90 50 50)"
              />
              <text x="50" y="47" textAnchor="middle" className="fill-fg" fontFamily="var(--font-sans)" fontSize="17" fontWeight={700}>
                {Math.round(battery.soc)}%
              </text>
              <text x="50" y="61" textAnchor="middle" className="fill-fg-faint" fontFamily="var(--font-sans)" fontSize="8">
                {t.batterySoc}
              </text>
            </svg>
            <div className="font-mono text-[11px] flex flex-col gap-1.5">
              <Row k={t.soh} v={`${battery.soh.toFixed(1)}%`} tone="good" />
              <Row k={t.voltage} v={`${battery.voltage.toFixed(1)}V`} />
              <Row k={t.temp} v={`${battery.tempC.toFixed(0)}°C`} tone={battery.tempC > 50 ? "warn" : undefined} />
            </div>
          </div>
        </Card>

        {/* Speed / Mode */}
        <Card label={t.speedMode}>
          <div className="font-mono text-[22px] font-bold mb-2">
            {speed.mps.toFixed(1)} <span className="text-xs text-fg-muted">m/s</span>
          </div>
          <Bar value={speedRatio} />
          <div className="font-mono text-[11px] flex flex-col gap-1 mt-2.5">
            <Row k={t.mode} v={speed.mode === "Moving" ? t.moving.toUpperCase() : speed.mode === "Caution" ? t.caution.toUpperCase() : t.idle.toUpperCase()} />
            <Row k={t.status} v={speed.status === "Active" ? t.active.toUpperCase() : t.stopped.toUpperCase()} tone={speed.status === "Active" ? "good" : undefined} />
          </div>
        </Card>

        {/* Payload */}
        <Card label={t.payload}>
          <div className="font-mono text-[22px] font-bold mb-0.5">
            {(payload.current * 1000).toFixed(0)} <span className="text-xs text-fg-muted">g</span>
          </div>
          <div className="font-mono text-[10.5px] text-fg-faint mb-2">
            Max {(payload.max * 1000).toFixed(0)} g &middot; {Math.round(payloadRatio * 100)}%
          </div>
          <Bar value={payloadRatio} tone="good" />
          <div className="font-mono text-[11px] text-good font-semibold mt-2.5">{t.nominal}</div>
        </Card>

        {/* Attachment */}
        <Card label={t.attachment}>
          <div className="text-xl font-bold mb-0.5">{t.lift}</div>
          <div className="font-mono text-[10.5px] text-fg-faint mb-2.5">{t.module}</div>
          <Bar value={attachRatio} />
          <div className="flex gap-2 mt-2.5">
            <button
              type="button"
              onClick={() => engageLift()}
              className={cn(
                "flex-1 text-center py-1.5 rounded-md border text-[10.5px] font-bold tracking-wide",
                attachment.engaged ? "border-accent bg-accent-soft text-accent" : "border-panel-border text-fg-muted"
              )}
            >
              {attachment.engaged ? t.disengage.toUpperCase() : t.engageLift.toUpperCase()}
            </button>
            <div className="px-3 py-1.5 rounded-md bg-bg text-[10.5px] font-bold text-fg-faint">
              {attachment.engaged ? t.active.toUpperCase() : t.idle.toUpperCase()}
            </div>
          </div>
        </Card>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-3.5 min-h-[380px]">
        <FloorPlan />

        <div className="flex flex-col gap-3.5 min-h-0">
          <Card label={t.systemHealth} corner={<HealthBadge score={healthScore} />}>
            <div className="grid grid-cols-2 gap-x-2.5 gap-y-1.5 text-[11px]">
              <HealthRow label={t.driveMotor} state={systemHealth.driveMotor} />
              <HealthRow label={t.battery} state={systemHealth.battery} />
              <HealthRow label={t.liftSystem} state={systemHealth.liftSystem} />
              <HealthRow label={t.rfid} state={systemHealth.rfid} />
              <HealthRow label={t.navigation} state={systemHealth.navigation} />
              <HealthRow label={t.camera} state={systemHealth.camera} />
              <HealthRow label={t.temperature} state={systemHealth.temperature} />
              <HealthRow label={t.load} state={systemHealth.load} />
            </div>
          </Card>

          <Card label={t.motorTempTrend} corner={<span className="font-mono text-[11px] font-bold text-warn">{motorTemp.current.toFixed(1)}&deg;C</span>} className="flex-1">
            <svg viewBox="0 0 280 80" preserveAspectRatio="none" className="w-full h-16">
              <polyline
                points={motorTemp.history
                  .map((v, i) => `${(i / (motorTemp.history.length - 1 || 1)) * 280},${80 - Math.min(70, v)}`)
                  .join(" ")}
                fill="none"
                className="stroke-warn"
                strokeWidth={2}
              />
            </svg>
          </Card>
        </div>
      </div>

      <Card
        label={t.liveSensors}
        corner={
          <span className="flex items-center gap-1.5 font-mono text-[9.5px] font-bold tracking-[0.08em] text-fg-faint">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            {t.simulated.toUpperCase()}
          </span>
        }
        className="shrink-0"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <SensorReadout label={t.ultrasonic} value={sensors.ultrasonicCm.toFixed(0)} unit="cm" warn={sensors.ultrasonicCm < 40} />
          <SensorReadout label={t.imuHeading} value={sensors.imuHeadingDeg.toFixed(1)} unit="°" />
          <SensorReadout label={t.encoderSpeed} value={sensors.encoderSpeedMps.toFixed(2)} unit="m/s" />
          <SensorReadout label={t.cameraConfidence} value={sensors.cameraConfidence.toFixed(0)} unit="%" warn={sensors.cameraConfidence < 80} />
        </div>
      </Card>
    </div>
  );
}

function SensorReadout({
  label,
  value,
  unit,
  warn,
}: {
  label: string;
  value: string;
  unit: string;
  warn?: boolean;
}) {
  return (
    <div className="rounded-lg bg-bg border border-panel-border px-3 py-2.5">
      <div className="text-[10px] text-fg-faint mb-1 truncate">{label}</div>
      <div className={cn("font-mono text-[17px] font-bold", warn ? "text-warn" : "text-fg")}>
        {value} <span className="text-[11px] font-normal text-fg-muted">{unit}</span>
      </div>
    </div>
  );
}

function Card({
  label,
  children,
  corner,
  className,
}: {
  label: string;
  children: React.ReactNode;
  corner?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("bg-panel border border-panel-border rounded-xl p-4", className)}>
      <div className="flex items-center justify-between mb-2.5">
        <div className="text-[10.5px] font-semibold tracking-[0.08em] text-fg-faint">{label.toUpperCase()}</div>
        {corner}
      </div>
      {children}
    </div>
  );
}

function Row({ k, v, tone }: { k: string; v: string; tone?: "good" | "warn" }) {
  return (
    <div className="flex justify-between gap-3.5">
      <span className="text-fg-faint">{k}</span>
      <span className={cn("font-semibold", tone === "good" && "text-good", tone === "warn" && "text-warn", !tone && "text-fg")}>{v}</span>
    </div>
  );
}

function Bar({ value, tone = "accent" }: { value: number; tone?: "accent" | "good" }) {
  return (
    <div className="h-1.5 rounded-full bg-bg overflow-hidden">
      <div
        className={cn("h-full", tone === "good" ? "bg-good" : "bg-accent")}
        style={{ width: `${Math.round(value * 100)}%` }}
      />
    </div>
  );
}

function HealthBadge({ score }: { score: number }) {
  const tone = score >= 90 ? "good" : score >= 60 ? "warn" : "bad";
  return (
    <div
      className={cn(
        "w-6 h-6 rounded-full flex items-center justify-center font-mono text-[11px] font-bold",
        tone === "good" && "bg-good-soft text-good",
        tone === "warn" && "bg-warn-soft text-warn",
        tone === "bad" && "bg-bad-soft text-bad"
      )}
    >
      {score}
    </div>
  );
}

function HealthRow({ label, state }: { label: string; state: HealthState }) {
  const dot = state === "normal" ? "bg-good" : state === "warning" ? "bg-warn" : "bg-bad";
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dot)} />
      <span className="text-fg-muted truncate">{label}</span>
    </div>
  );
}
