"use client";

import { useLocale } from "@/lib/locale";
import { useTelemetry, type RobotState } from "@/lib/telemetry";
import { cn } from "@/lib/utils";

const ROBOT_COLOR_CLASS: Record<RobotState["color"], { fill: string; stroke: string; text: string }> = {
  good: { fill: "fill-good", stroke: "stroke-good", text: "text-good" },
  accent: { fill: "fill-accent", stroke: "stroke-accent", text: "text-accent" },
  warn: { fill: "fill-warn", stroke: "stroke-warn", text: "text-warn" },
};

export function FloorPlan() {
  const { t } = useLocale();
  const { robots, selectedRobotId, selectRobot } = useTelemetry();
  const selected = robots.find((r) => r.id === selectedRobotId) ?? robots[0];

  return (
    <div className="relative bg-panel border border-panel-border rounded-xl p-3.5 flex flex-col min-h-0 flex-1">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10.5px] font-semibold tracking-[0.08em] text-fg-faint">
          {t.warehouseFloorPlan.toUpperCase()}
        </div>
        <div className="font-mono text-[10.5px] text-good">{t.live.toUpperCase()} &middot; 1s</div>
      </div>

      <svg viewBox="0 0 1080 520" className="flex-1 w-full h-full">
        <rect x="0" y="0" width="1080" height="520" className="fill-bg" rx="6" />

        {(
          [
            ["STN-A", 130, 60, 150, 80],
            ["STN-B", 380, 60, 150, 80],
            ["CHG", 620, 60, 140, 80],
            ["STN-C", 860, 60, 150, 80],
          ] as const
        ).map(([label, x, y, w, h]) => (
          <g key={label}>
            <rect x={x} y={y} width={w} height={h} fill="none" className="stroke-accent" strokeWidth={1.5} rx={4} />
            <text x={x + 20} y={y + 46} className="fill-accent" fontFamily="var(--font-sans)" fontWeight={700} fontSize={15}>
              {label}
            </text>
          </g>
        ))}

        {(
          [
            ["R1", 80, 200, 130, 140],
            ["R2", 240, 200, 130, 140],
            ["R3", 400, 200, 130, 140],
            ["R5", 540, 380, 130, 120],
            ["R4", 700, 380, 130, 120],
          ] as const
        ).map(([label, x, y, w, h]) => (
          <g key={label}>
            <rect x={x} y={y} width={w} height={h} className="fill-bg stroke-panel-border" />
            <text x={x + 26} y={y + 76} className="fill-fg-faint" fontFamily="var(--font-mono)" fontSize={13}>
              {label}
            </text>
          </g>
        ))}

        <rect x={60} y={380} width={130} height={120} fill="none" className="stroke-accent" strokeWidth={1.5} rx={4} />
        <text x={90} y={445} className="fill-accent" fontFamily="var(--font-sans)" fontWeight={700} fontSize={15}>
          HOME
        </text>

        {robots.map((robot) => {
          const colors = ROBOT_COLOR_CLASS[robot.color];
          const isSelected = robot.id === selectedRobotId;
          return (
            <g
              key={robot.id}
              onClick={() => selectRobot(robot.id)}
              className="cursor-pointer"
            >
              <circle cx={robot.robotPos.x} cy={robot.robotPos.y} r={10} className={colors.fill} />
              <circle
                cx={robot.robotPos.x}
                cy={robot.robotPos.y}
                r={isSelected ? 20 : 16}
                fill="none"
                className={colors.stroke}
                strokeWidth={isSelected ? 2.5 : 1.5}
                opacity={isSelected ? 0.8 : 0.35}
              />
              <text
                x={robot.robotPos.x}
                y={robot.robotPos.y - 22}
                textAnchor="middle"
                className={cn(colors.text, "font-bold")}
                fontFamily="var(--font-mono)"
                fontSize={12}
              >
                {robot.name.replace("Robot ", "R")}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Simulated dashcam cutout — no camera hardware exists yet, this is a
          stand-in "monitor" panel for the demo. Shows whichever robot is
          selected, styled like a security-cam overlay. */}
      <div className="absolute bottom-6 right-6 w-[168px] h-[112px] rounded-lg overflow-hidden border-2 border-black/60 shadow-lg bg-[#0a0d0f]">
        <svg viewBox="0 0 168 112" className="w-full h-full">
          <defs>
            <linearGradient id="camGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#141b1f" />
              <stop offset="100%" stopColor="#05070a" />
            </linearGradient>
            <pattern id="scanlines" width="4" height="4" patternUnits="userSpaceOnUse">
              <rect width="4" height="2" fill="rgba(255,255,255,0.02)" />
            </pattern>
          </defs>
          <rect width="168" height="112" fill="url(#camGradient)" />
          <rect width="168" height="112" fill="url(#scanlines)" />

          {/* crosshair / HUD reticle */}
          <circle cx="84" cy="56" r="18" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={1} />
          <line x1="84" y1="30" x2="84" y2="42" stroke="rgba(255,255,255,0.25)" strokeWidth={1} />
          <line x1="84" y1="70" x2="84" y2="82" stroke="rgba(255,255,255,0.25)" strokeWidth={1} />
          <line x1="58" y1="56" x2="70" y2="56" stroke="rgba(255,255,255,0.25)" strokeWidth={1} />
          <line x1="98" y1="56" x2="110" y2="56" stroke="rgba(255,255,255,0.25)" strokeWidth={1} />
          <path d="M6 6h14M6 6v14" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} />
          <path d="M162 6h-14M162 6v14" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} />
          <path d="M6 106h14M6 106v-14" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} />
          <path d="M162 106h-14M162 106v-14" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} />

          <circle cx="12" cy="12" r="3" className="fill-bad">
            <animate attributeName="opacity" values="1;0.2;1" dur="1.4s" repeatCount="indefinite" />
          </circle>
          <text x="20" y="15" fill="#ff5555" fontFamily="var(--font-mono)" fontSize="9" fontWeight={700}>
            REC
          </text>

          <text x="84" y="100" textAnchor="middle" fill="rgba(255,255,255,0.55)" fontFamily="var(--font-mono)" fontSize="8">
            {t.simulated.toUpperCase()} FEED
          </text>
        </svg>
        <div className="absolute top-1 right-1.5 font-mono text-[8.5px] font-bold text-white/70">
          {selected.sensors.cameraConfidence.toFixed(0)}%
        </div>
        <div className="absolute bottom-1 left-1.5 font-mono text-[8.5px] font-bold" style={{ color: "rgba(255,255,255,0.7)" }}>
          {t.camera.toUpperCase()} &middot; {selected.name}
        </div>
      </div>
    </div>
  );
}
