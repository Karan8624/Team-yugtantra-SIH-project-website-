// Shared inline icon set — stroke-based, 24x24 viewBox, matches the look
// established in the approved mockups. Kept as plain SVG (not an icon
// package) so every icon is trivially recolorable via `currentColor` /
// the `color` CSS prop.

import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  viewBox: "0 0 24 24",
  width: 20,
  height: 20,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...props,
});

export function RobotIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="4" y="7" width="16" height="11" rx="1.5" />
      <circle cx="8.5" cy="18" r="1.5" />
      <circle cx="15.5" cy="18" r="1.5" />
      <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  );
}

export function BatteryIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3.5" y="7.5" width="15" height="9" rx="1.8" />
      <path d="M18.5 10.5h2v3h-2" />
      <rect x="6" y="9.5" width="7" height="5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SpeedIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 15a8 8 0 0116 0" />
      <path d="M12 15l4.5-5" />
      <circle cx="12" cy="15" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PayloadIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3.5 8.5L12 4l8.5 4.5L12 13z" />
      <path d="M3.5 8.5V16L12 20.5 20.5 16V8.5" />
      <path d="M12 13v7.5" />
    </svg>
  );
}

export function ConnectionIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M8.5 8.5a5 5 0 017 0" />
      <path d="M5.8 5.8a9 9 0 0112.4 0" />
      <circle cx="12" cy="15" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function GlobeIcon(props: IconProps) {
  return (
    <svg {...base(props)} strokeWidth={1.8}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 010 18" />
      <path d="M12 3a14 14 0 000 18" />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...base(props)} strokeWidth={2.2}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <svg {...base(props)} strokeWidth={2}>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 3v2.2M12 18.8V21M4.2 12H2M22 12h-2.2M5.5 5.5l1.6 1.6M17 17l1.6 1.6M5.5 18.5l1.6-1.6M17 7l1.6-1.6" />
    </svg>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <svg {...base(props)} strokeWidth={2}>
      <path d="M20 14.5A8 8 0 1110 3.2a6.3 6.3 0 0010 11.3z" />
    </svg>
  );
}

export function PlayIcon(props: IconProps) {
  return (
    <svg {...base(props)} fill="currentColor" stroke="none">
      <path d="M7 4l14 8-14 8z" />
    </svg>
  );
}

export function PauseIcon(props: IconProps) {
  return (
    <svg {...base(props)} fill="currentColor" stroke="none">
      <rect x="6" y="5" width="4.5" height="14" rx="1" />
      <rect x="13.5" y="5" width="4.5" height="14" rx="1" />
    </svg>
  );
}

export function StepForwardIcon(props: IconProps) {
  return (
    <svg {...base(props)} strokeWidth={2}>
      <path d="M5 5l7 7-7 7" />
      <path d="M15 5l7 7-7 7" />
    </svg>
  );
}

export function StopOctagonIcon(props: IconProps) {
  return (
    <svg {...base(props)} strokeWidth={2}>
      <path d="M8 3h8l5 5v8l-5 5H8l-5-5V8z" />
      <path d="M9 9l6 6M15 9l-6 6" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base(props)} strokeWidth={2.4}>
      <path d="M4 12l5 5L20 6" />
    </svg>
  );
}

export function LayoutTechnicalIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="4" y="4.5" width="16" height="14" rx="2" />
      <path d="M4 9.5h16" />
      <path d="M9 4.5v14" />
    </svg>
  );
}

export function WifiIcon(props: IconProps) {
  return (
    <svg {...base(props)} strokeWidth={2}>
      <path d="M2 8.5a15 15 0 0120 0" />
      <path d="M5.5 12a10 10 0 0113 0" />
      <path d="M9 15.5a5 5 0 016 0" />
      <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function OverviewTabIcon(props: IconProps) {
  return (
    <svg {...base(props)} strokeWidth={2}>
      <path d="M3 17l5-6 4 3 5-7 4 5" />
    </svg>
  );
}

export function AlertsTabIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3a6 6 0 00-6 6v3l-2 4h16l-2-4V9a6 6 0 00-6-6z" />
      <path d="M9.5 20a2.5 2.5 0 005 0" />
    </svg>
  );
}

export function MissionTabIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3l2.5 5 5.5.8-4 4 1 5.5L12 16l-5 2.3 1-5.5-4-4 5.5-.8z" />
    </svg>
  );
}

export function ActivityLogIcon(props: IconProps) {
  return (
    <svg {...base(props)} strokeWidth={2}>
      <rect x="4" y="3.5" width="16" height="17" rx="1.5" />
      <path d="M8 8.5h8M8 12h8M8 15.5h5" />
    </svg>
  );
}

export function WarningTriangleIcon(props: IconProps) {
  return (
    <svg {...base(props)} strokeWidth={2}>
      <path d="M12 9v4" />
      <circle cx="12" cy="16.5" r="0.6" fill="currentColor" stroke="none" />
      <path d="M10.3 4.5L2.9 18a1.5 1.5 0 001.3 2.2h15.6a1.5 1.5 0 001.3-2.2L13.7 4.5a1.5 1.5 0 00-2.6 0z" />
    </svg>
  );
}

// --- 12 Mission Sequence step icons -------------------------------------

export function StepPowerIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 2v6" />
      <path d="M18.4 6.6a9 9 0 1 1-12.8 0" />
    </svg>
  );
}
export function StepTaskIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="6" y="4" width="12" height="16" rx="1.5" />
      <path d="M9 4V3a1 1 0 011-1h4a1 1 0 011 1v1" />
      <path d="M9 10h6M9 14h6" />
    </svg>
  );
}
export function StepNavIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 20V4" />
      <path d="M12 4l-4 4" />
      <path d="M12 4l4 4" />
    </svg>
  );
}
export function StepObstacleIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 12a3 3 0 100-6 3 3 0 000 6z" />
      <path d="M6.5 12a5.5 5.5 0 0111 0" />
      <path d="M3.5 12a8.5 8.5 0 0117 0" />
    </svg>
  );
}
export function StepPickupIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 21s7-6.3 7-11a7 7 0 10-14 0c0 4.7 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.1" />
    </svg>
  );
}
export function StepScanIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 8V5.5a1 1 0 011-1h2.5" />
      <path d="M20 8V5.5a1 1 0 00-1-1h-2.5" />
      <path d="M4 16v2.5a1 1 0 001 1h2.5" />
      <path d="M20 16v2.5a1 1 0 01-1 1h-2.5" />
      <circle cx="12" cy="12" r="2.3" />
    </svg>
  );
}
export function StepLiftUpIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="4.5" y="12.5" width="15" height="7" rx="1" />
      <path d="M12 10.5V3" />
      <path d="M12 3l-2.6 2.6" />
      <path d="M12 3l2.6 2.6" />
    </svg>
  );
}
export function StepShieldIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3l7 3.2v4.6c0 4.7-3.2 8-7 9.2-3.8-1.2-7-4.5-7-9.2V6.2z" />
      <path d="M9.2 12l1.9 1.9L15 10" />
    </svg>
  );
}
export function StepTransportIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4.5 12h13" />
      <path d="M13 6.5l6 5.5-6 5.5" />
    </svg>
  );
}
export function StepFlagIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6.5 21V4" />
      <path d="M6.5 4.5h10.5l-3 3.8 3 3.7H6.5" />
    </svg>
  );
}
export function StepLiftDownIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="4.5" y="12.5" width="15" height="7" rx="1" />
      <path d="M12 10.5V2.5" />
      <path d="M12 10.5l-2.6-2.6" />
      <path d="M12 10.5l2.6-2.6" />
    </svg>
  );
}
export function StepRefreshIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 12a8 8 0 0114-5.3L21 9" />
      <path d="M21 4.5V9h-4.5" />
      <path d="M20 12a8 8 0 01-14 5.3L3 15" />
      <path d="M3 19.5V15h4.5" />
    </svg>
  );
}

export const MISSION_STEP_ICONS = {
  power: StepPowerIcon,
  task: StepTaskIcon,
  nav: StepNavIcon,
  obstacle: StepObstacleIcon,
  pickup: StepPickupIcon,
  bindetect: StepScanIcon,
  lift: StepLiftUpIcon,
  security: StepShieldIcon,
  transport: StepTransportIcon,
  destination: StepFlagIcon,
  placement: StepLiftDownIcon,
  return: StepRefreshIcon,
} as const;
