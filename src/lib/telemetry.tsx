"use client";

/**
 * Telemetry Layer
 * -----------------------------------------------------------------------
 * This is the single source of "robot state" for the whole app. Every
 * screen (Operator view, Technical view, Mission Sequence panel) reads
 * from this context instead of inventing its own numbers, so they always
 * agree with each other.
 *
 * TODAY: state is produced by a mock simulation (setInterval ticks below),
 * modeling a small FLEET of 3 robots, each running its own independent
 * 12-step mission cycle and patrolling between warehouse stations.
 *
 * LATER, once the team has picked a microcontroller + communication
 * protocol: replace the body of the tick effects (and the action
 * functions) with real reads/writes to that hardware — one feed per
 * robot. Everything that reads this context (components/*, app/**\/*)
 * does not need to change — that's the point of this layer. Search this
 * file for "HARDWARE TODO" for every place a real integration plugs in.
 * -----------------------------------------------------------------------
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type HealthState = "normal" | "warning" | "critical";

export type MissionStepId =
  | "power"
  | "task"
  | "nav"
  | "obstacle"
  | "pickup"
  | "bindetect"
  | "lift"
  | "security"
  | "transport"
  | "destination"
  | "placement"
  | "return";

export const MISSION_STEPS: MissionStepId[] = [
  "power",
  "task",
  "nav",
  "obstacle",
  "pickup",
  "bindetect",
  "lift",
  "security",
  "transport",
  "destination",
  "placement",
  "return",
];

export type AlertSeverity = "info" | "warning" | "critical";

export interface AlertEntry {
  id: string;
  severity: AlertSeverity;
  message: string;
  time: string;
  active: boolean;
  robotId?: string;
  robotName?: string;
}

export interface ActivityEntry {
  id: string;
  time: string;
  robotId: string;
  robotName: string;
  message: string;
  station?: StationId;
}

export interface TaskEntry {
  id: string;
  type: "Lift" | "Inspection" | "Maintenance";
  from: string;
  to: string;
  priority: "Low" | "Normal" | "High" | "Critical";
  status: "Queued" | "In Progress";
  assignedRobotId?: string;
  assignedRobotName?: string;
}

// Pickup/drop-off points a robot can be routed between. HOME and CHG are
// parking/charging points, not task endpoints.
export type StationId = "STN-A" | "STN-B" | "STN-C" | "CHG" | "HOME";

export const STATION_LABELS: Record<StationId, string> = {
  "STN-A": "Station A",
  "STN-B": "Station B",
  "STN-C": "Station C",
  CHG: "Charging Bay",
  HOME: "Home Base",
};

// Task-assignable stations (excludes HOME, which is a parking point).
export const TASK_STATIONS: StationId[] = ["STN-A", "STN-B", "STN-C", "CHG"];

export const STATION_POS: Record<StationId, { x: number; y: number }> = {
  "STN-A": { x: 205, y: 100 },
  "STN-B": { x: 455, y: 100 },
  "STN-C": { x: 935, y: 100 },
  CHG: { x: 690, y: 100 },
  HOME: { x: 125, y: 440 },
};

export interface RobotState {
  id: string;
  name: string;
  color: "good" | "accent" | "warn";
  battery: { soc: number; soh: number; voltage: number; tempC: number };
  speed: {
    mps: number;
    mode: "Idle" | "Moving" | "Caution";
    status: "Active" | "Stopped";
  };
  payload: { current: number; max: number };
  attachment: { name: string; engaged: boolean };
  systemHealth: Record<
    "driveMotor" | "battery" | "liftSystem" | "rfid" | "navigation" | "camera" | "temperature" | "load",
    HealthState
  >;
  motorTemp: { current: number; history: number[] };
  // Proxy sensor readings — stand in for the real HC-SR04 / MPU6050 /
  // wheel-encoder / camera feed until hardware exists. Randomized (with
  // realistic bounds, not pure noise) every second in the background tick
  // below, purely to make the dashboard feel alive during a demo.
  sensors: {
    ultrasonicCm: number;
    imuHeadingDeg: number;
    encoderSpeedMps: number;
    cameraConfidence: number;
  };
  robotPos: { x: number; y: number };
  mission: {
    running: boolean;
    activeIndex: number;
    stepDetail: string;
  };
  route: { from: StationId; to: StationId };
  cycle: number;
}

export interface TelemetryState {
  linked: boolean;
  robots: RobotState[];
  selectedRobotId: string;
  alerts: AlertEntry[];
  activityLog: ActivityEntry[];
  tasks: TaskEntry[];
  uptimeSeconds: number;
}

interface TelemetryActions {
  selectRobot: (id: string) => void;
  startMission: (robotId?: string) => void;
  pauseMission: (robotId?: string) => void;
  stepMission: (robotId?: string) => void;
  emergencyStop: () => void;
  engageLift: (robotId?: string) => void;
  goHome: (robotId?: string) => void;
  returnToCharge: (robotId?: string) => void;
  dispatchTask: (task: Omit<TaskEntry, "id" | "status">) => void;
  acknowledgeAlert: (id: string) => void;
  resolveAlert: (id: string) => void;
}

// Convenience view of whichever robot is currently selected, spread onto
// the context value so screens that only ever cared about "the robot"
// (Operator view, the stat cards, the mission sequence panel) don't need
// to change now that there's a fleet — they just always read the
// selected one.
interface SelectedRobotView {
  battery: RobotState["battery"];
  speed: RobotState["speed"];
  payload: RobotState["payload"];
  attachment: RobotState["attachment"];
  systemHealth: RobotState["systemHealth"];
  motorTemp: RobotState["motorTemp"];
  sensors: RobotState["sensors"];
  robotPos: RobotState["robotPos"];
  mission: RobotState["mission"];
  cycle: number;
  robotName: string;
  robotColor: RobotState["color"];
}

const STEP_DESCRIPTIONS: Record<MissionStepId, (from: string, to: string) => string> = {
  power: () => "Controller and sensors initialized",
  task: (from, to) => `Pickup at ${from}, drop at ${to}`,
  nav: (from) => `Following waypoint · heading toward ${from}`,
  obstacle: () => "Ultrasonic sensor triggered — reducing speed",
  pickup: (from) => `Aligned with ${from}`,
  bindetect: () => "Camera confirming bin position",
  lift: () => "Attachment engaging — payload rising",
  security: () => "Part B camera monitoring load area",
  transport: (_from, to) => `En route to ${to}, monitoring active`,
  destination: (_from, to) => `Aligned with ${to}`,
  placement: () => "Lowering and releasing bin",
  return: () => "Returning to base for next task",
};

function nowLabel() {
  return new Date().toLocaleTimeString("en-GB", { hour12: false });
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

// Small random walk rather than pure noise — each reading nudges from its
// last value instead of jumping randomly, which is what makes it read as
// a live sensor rather than a random-number generator.
function jitter(value: number, step: number, min: number, max: number) {
  return clamp(value + (Math.random() * 2 - 1) * step, min, max);
}

function midpoint(a: { x: number; y: number }, b: { x: number; y: number }) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function makeRobot(id: string, name: string, color: RobotState["color"], route: RobotState["route"], homeOffset: { x: number; y: number }): RobotState {
  return {
    id,
    name,
    color,
    battery: { soc: 70 + Math.random() * 20, soh: 92 + Math.random() * 6, voltage: 47.5 + Math.random(), tempC: 40 },
    speed: { mps: 0, mode: "Idle", status: "Stopped" },
    payload: { current: 0, max: 1.2 },
    attachment: { name: "Lift Module", engaged: false },
    systemHealth: {
      driveMotor: "normal",
      battery: "normal",
      liftSystem: "normal",
      rfid: "normal",
      navigation: "normal",
      camera: "normal",
      temperature: "normal",
      load: "normal",
    },
    motorTemp: { current: 41, history: [39, 40, 41, 40, 41] },
    sensors: { ultrasonicCm: 180, imuHeadingDeg: 0, encoderSpeedMps: 0, cameraConfidence: 92 },
    robotPos: { x: STATION_POS.HOME.x + homeOffset.x, y: STATION_POS.HOME.y + homeOffset.y },
    mission: { running: false, activeIndex: 0, stepDetail: STEP_DESCRIPTIONS.power("", "") },
    route,
    cycle: 0,
  };
}

function initialState(): TelemetryState {
  const robots: RobotState[] = [
    makeRobot("r1", "Robot 1", "good", { from: "STN-A", to: "STN-B" }, { x: -40, y: -30 }),
    makeRobot("r2", "Robot 2", "accent", { from: "STN-B", to: "STN-C" }, { x: 10, y: 10 }),
    makeRobot("r3", "Robot 3", "warn", { from: "STN-C", to: "STN-A" }, { x: 60, y: -20 }),
  ];
  return {
    linked: true,
    robots,
    selectedRobotId: robots[0].id,
    alerts: [],
    activityLog: [],
    tasks: [
      { id: "t1", type: "Lift", from: "Station A", to: "Station B", priority: "High", status: "Queued" },
    ],
    uptimeSeconds: 0,
  };
}

function intervalMsFor(robotId: string) {
  // Slightly different cadence per robot so they don't step in lockstep —
  // reads as three independent units, not one animation looping 3 times.
  const bases: Record<string, number> = { r1: 3500, r2: 3900, r3: 4300 };
  return bases[robotId] ?? 4000;
}

// Pure state transition: advances one robot to mission step `index`,
// updating its own fields plus the fleet-wide alerts/activity log. Used
// both by the manual "Step" button and the auto-advance interval so they
// can never disagree about what a step does.
function applyStepToState(s: TelemetryState, robotId: string, index: number): TelemetryState {
  const robot = s.robots.find((r) => r.id === robotId);
  if (!robot) return s;

  const stepId = MISSION_STEPS[index];
  const fromLabel = STATION_LABELS[robot.route.from];
  const toLabel = STATION_LABELS[robot.route.to];
  const fromPos = STATION_POS[robot.route.from];
  const toPos = STATION_POS[robot.route.to];

  const next: RobotState = {
    ...robot,
    mission: { ...robot.mission, activeIndex: index, stepDetail: STEP_DESCRIPTIONS[stepId](fromLabel, toLabel) },
  };

  let newAlert: AlertEntry | null = null;
  let newActivity: ActivityEntry | null = null;

  switch (stepId) {
    case "power":
      next.speed = { mps: 0, mode: "Idle", status: "Stopped" };
      break;
    case "task":
      next.speed = { mps: 0, mode: "Idle", status: "Stopped" };
      break;
    case "nav":
      next.speed = { mps: 0.8, mode: "Moving", status: "Active" };
      next.robotPos = midpoint(robot.robotPos, fromPos);
      break;
    case "obstacle":
      next.speed = { mps: 0.3, mode: "Caution", status: "Active" };
      newAlert = {
        id: `a-${Date.now()}-${robotId}`,
        severity: "warning",
        message: "Obstacle detected — reducing speed",
        time: nowLabel(),
        active: true,
        robotId: robot.id,
        robotName: robot.name,
      };
      break;
    case "pickup":
      next.speed = { mps: 0, mode: "Idle", status: "Stopped" };
      next.robotPos = fromPos;
      newActivity = {
        id: `act-${Date.now()}-${robotId}`,
        time: nowLabel(),
        robotId: robot.id,
        robotName: robot.name,
        message: `Picked up load at ${fromLabel}`,
        station: robot.route.from,
      };
      break;
    case "bindetect":
      next.systemHealth = { ...robot.systemHealth, camera: "normal" };
      break;
    case "lift":
      next.attachment = { ...robot.attachment, engaged: true };
      next.payload = { ...robot.payload, current: robot.payload.max * 0.5 };
      break;
    case "security":
      // Part B monitoring badge — surfaced via attachment.engaged + this step being active.
      break;
    case "transport":
      next.speed = { mps: 0.8, mode: "Moving", status: "Active" };
      next.robotPos = midpoint(fromPos, toPos);
      break;
    case "destination":
      next.speed = { mps: 0, mode: "Idle", status: "Stopped" };
      next.robotPos = toPos;
      break;
    case "placement":
      next.payload = { ...robot.payload, current: 0 };
      next.attachment = { ...robot.attachment, engaged: false };
      newActivity = {
        id: `act-${Date.now()}-${robotId}-drop`,
        time: nowLabel(),
        robotId: robot.id,
        robotName: robot.name,
        message: `Arrived at ${toLabel} — dropped load`,
        station: robot.route.to,
      };
      break;
    case "return":
      next.cycle = robot.cycle + 1;
      next.robotPos = { x: STATION_POS.HOME.x, y: STATION_POS.HOME.y };
      // Swap direction for next cycle so the fleet keeps circulating
      // between all three stations rather than repeating one leg forever.
      next.route = { from: robot.route.to, to: robot.route.from };
      newActivity = {
        id: `act-${Date.now()}-${robotId}-return`,
        time: nowLabel(),
        robotId: robot.id,
        robotName: robot.name,
        message: "Returning to Home Base for next task",
        station: "HOME",
      };
      break;
  }

  return {
    ...s,
    robots: s.robots.map((r) => (r.id === robotId ? next : r)),
    alerts: newAlert ? [newAlert, ...s.alerts].slice(0, 40) : s.alerts,
    activityLog: newActivity ? [newActivity, ...s.activityLog].slice(0, 60) : s.activityLog,
  };
}

const TelemetryContext = createContext<(TelemetryState & TelemetryActions & SelectedRobotView) | null>(null);

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TelemetryState>(initialState);
  const missionTimers = useRef<Record<string, ReturnType<typeof setInterval> | null>>({});
  const selectedRobotIdRef = useRef(state.selectedRobotId);
  useEffect(() => {
    selectedRobotIdRef.current = state.selectedRobotId;
  }, [state.selectedRobotId]);

  // Background tick: battery drift, uptime, motor temp, proxy sensor
  // readings — always running, once per second, for every robot in the
  // fleet independently.
  // HARDWARE TODO: once the microcontroller + protocol are chosen, replace
  // this whole effect with a subscription to the real telemetry feed per
  // robot (e.g. an MQTT topic or a WebSocket/HTTP poll to each robot's
  // ESP32 or a shared gateway) and call setState with the parsed real
  // values instead.
  useEffect(() => {
    const id = setInterval(() => {
      setState((s) => ({
        ...s,
        uptimeSeconds: s.uptimeSeconds + 1,
        robots: s.robots.map((r) => {
          const moving = r.speed.status === "Active";
          const obstacleStep = MISSION_STEPS[r.mission.activeIndex] === "obstacle";

          const motorTarget = moving ? 54 : 40;
          const nextMotorTemp = jitter(r.motorTemp.current + (motorTarget - r.motorTemp.current) * 0.08, 0.6, 32, 70);

          const ultrasonicTarget = obstacleStep ? 25 : 180;
          const nextUltrasonic = jitter(r.sensors.ultrasonicCm + (ultrasonicTarget - r.sensors.ultrasonicCm) * 0.25, 6, 8, 220);

          const nextHeading = ((jitter(r.sensors.imuHeadingDeg, moving ? 4 : 0.3, -180, 540) + 180) % 360) - 180;

          const nextEncoderSpeed = jitter(r.speed.mps, moving ? 0.05 : 0.01, 0, 2.5);

          const cameraTarget = obstacleStep ? 74 : 92;
          const nextCameraConfidence = jitter(
            r.sensors.cameraConfidence + (cameraTarget - r.sensors.cameraConfidence) * 0.2,
            3,
            55,
            99
          );

          return {
            ...r,
            battery: {
              ...r.battery,
              soc: Math.max(0, r.battery.soc - (moving ? 0.02 : 0.002)),
            },
            motorTemp: {
              current: nextMotorTemp,
              history: [...r.motorTemp.history.slice(-19), nextMotorTemp],
            },
            sensors: {
              ultrasonicCm: nextUltrasonic,
              imuHeadingDeg: nextHeading,
              encoderSpeedMps: nextEncoderSpeed,
              cameraConfidence: nextCameraConfidence,
            },
          };
        }),
      }));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const selectRobot = useCallback((id: string) => {
    setState((s) => (s.robots.some((r) => r.id === id) ? { ...s, selectedRobotId: id } : s));
  }, []);

  const stepMission = useCallback((robotId?: string) => {
    setState((s) => {
      const id = robotId ?? s.selectedRobotId;
      const robot = s.robots.find((r) => r.id === id);
      if (!robot) return s;
      const nextIndex = (robot.mission.activeIndex + 1) % MISSION_STEPS.length;
      return applyStepToState(s, id, nextIndex);
    });
  }, []);

  // HARDWARE TODO: this interval is what stands in for "the robot reporting
  // it has reached the next stage of its operating sequence." Once real
  // hardware exists, this whole timer goes away — `applyStepToState` (or
  // something like it) should instead be called when the real feed
  // reports a stage change for that robot, not on a fixed clock.
  const startMission = useCallback((robotId?: string) => {
    const id = robotId ?? selectedRobotIdRef.current;
    setState((s) => ({
      ...s,
      robots: s.robots.map((r) => (r.id === id ? { ...r, mission: { ...r.mission, running: true } } : r)),
    }));
    if (missionTimers.current[id]) clearInterval(missionTimers.current[id]!);
    missionTimers.current[id] = setInterval(() => {
      setState((s2) => {
        const robot = s2.robots.find((r) => r.id === id);
        if (!robot) return s2;
        const nextIndex = (robot.mission.activeIndex + 1) % MISSION_STEPS.length;
        return applyStepToState(s2, id, nextIndex);
      });
    }, intervalMsFor(id));
  }, []);

  const pauseMission = useCallback((robotId?: string) => {
    setState((s) => {
      const id = robotId ?? s.selectedRobotId;
      if (missionTimers.current[id]) {
        clearInterval(missionTimers.current[id]!);
        missionTimers.current[id] = null;
      }
      return {
        ...s,
        robots: s.robots.map((r) => (r.id === id ? { ...r, mission: { ...r.mission, running: false } } : r)),
      };
    });
  }, []);

  useEffect(() => {
    return () => {
      Object.values(missionTimers.current).forEach((t) => t && clearInterval(t));
    };
  }, []);

  // HARDWARE TODO: this only updates the on-screen state. Once there's a
  // real fleet, this function must also send an actual stop command down
  // to every robot (over whatever protocol gets chosen) — treat that as
  // the safety-critical half of this function, not an afterthought. It is
  // deliberately fleet-wide: an emergency stop halts every unit, not just
  // whichever one happens to be selected on screen.
  const emergencyStop = useCallback(() => {
    Object.entries(missionTimers.current).forEach(([, t]) => t && clearInterval(t));
    missionTimers.current = {};
    setState((s) => ({
      ...s,
      robots: s.robots.map((r) => ({
        ...r,
        mission: { ...r.mission, running: false },
        speed: { mps: 0, mode: "Idle", status: "Stopped" },
      })),
      alerts: [
        {
          id: `a-${Date.now()}-estop`,
          severity: "critical",
          message: "Emergency stop triggered by operator — all units halted",
          time: nowLabel(),
          active: true,
        },
        ...s.alerts,
      ],
    }));
  }, []);

  const engageLift = useCallback((robotId?: string) => {
    setState((s) => {
      const id = robotId ?? s.selectedRobotId;
      return {
        ...s,
        robots: s.robots.map((r) =>
          r.id === id
            ? {
                ...r,
                attachment: { ...r.attachment, engaged: !r.attachment.engaged },
                payload: { ...r.payload, current: r.attachment.engaged ? 0 : r.payload.max * 0.5 },
              }
            : r
        ),
      };
    });
  }, []);

  const goHome = useCallback((robotId?: string) => {
    setState((s) => {
      const id = robotId ?? s.selectedRobotId;
      return {
        ...s,
        robots: s.robots.map((r) =>
          r.id === id
            ? { ...r, robotPos: { x: STATION_POS.HOME.x, y: STATION_POS.HOME.y }, speed: { mps: 0.8, mode: "Moving", status: "Active" } }
            : r
        ),
      };
    });
  }, []);

  const returnToCharge = useCallback((robotId?: string) => {
    setState((s) => {
      const id = robotId ?? s.selectedRobotId;
      return {
        ...s,
        robots: s.robots.map((r) =>
          r.id === id
            ? { ...r, robotPos: { x: STATION_POS.CHG.x, y: STATION_POS.CHG.y }, speed: { mps: 0.8, mode: "Moving", status: "Active" } }
            : r
        ),
      };
    });
  }, []);

  const dispatchTask = useCallback((task: Omit<TaskEntry, "id" | "status">) => {
    setState((s) => ({
      ...s,
      tasks: [...s.tasks, { ...task, id: `t-${Date.now()}`, status: "Queued" }],
    }));
  }, []);

  const acknowledgeAlert = useCallback((id: string) => {
    setState((s) => ({ ...s, alerts: s.alerts.map((a) => (a.id === id ? { ...a, active: a.active } : a)) }));
  }, []);

  const resolveAlert = useCallback((id: string) => {
    setState((s) => ({ ...s, alerts: s.alerts.map((a) => (a.id === id ? { ...a, active: false } : a)) }));
  }, []);

  const selectedRobot = useMemo(
    () => state.robots.find((r) => r.id === state.selectedRobotId) ?? state.robots[0],
    [state.robots, state.selectedRobotId]
  );

  const value = useMemo(
    () => ({
      ...state,
      battery: selectedRobot.battery,
      speed: selectedRobot.speed,
      payload: selectedRobot.payload,
      attachment: selectedRobot.attachment,
      systemHealth: selectedRobot.systemHealth,
      motorTemp: selectedRobot.motorTemp,
      sensors: selectedRobot.sensors,
      robotPos: selectedRobot.robotPos,
      mission: selectedRobot.mission,
      cycle: selectedRobot.cycle,
      robotName: selectedRobot.name,
      robotColor: selectedRobot.color,
      selectRobot,
      startMission,
      pauseMission,
      stepMission,
      emergencyStop,
      engageLift,
      goHome,
      returnToCharge,
      dispatchTask,
      acknowledgeAlert,
      resolveAlert,
    }),
    [
      state,
      selectedRobot,
      selectRobot,
      startMission,
      pauseMission,
      stepMission,
      emergencyStop,
      engageLift,
      goHome,
      returnToCharge,
      dispatchTask,
      acknowledgeAlert,
      resolveAlert,
    ]
  );

  return <TelemetryContext.Provider value={value}>{children}</TelemetryContext.Provider>;
}

export function useTelemetry() {
  const ctx = useContext(TelemetryContext);
  if (!ctx) throw new Error("useTelemetry must be used within a TelemetryProvider");
  return ctx;
}
