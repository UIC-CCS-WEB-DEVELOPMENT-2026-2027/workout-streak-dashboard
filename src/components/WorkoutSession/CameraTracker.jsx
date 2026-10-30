//file name: CameraTracker.jsx
import React, { memo, useEffect, useRef, useState } from "react";
import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import "./cameraTracker.css";

// ---------- CONFIG ----------
const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.12/wasm";
const MODEL_URL = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task";

const JOINT_VIS = 0.35;
const DRAW_VISIBILITY = 0.4;
const GESTURE_HOLD_MS = 800;
const GESTURE_COOLDOWN_MS = 1500;
const GESTURE_GRACE_MS = 250; // Added to survive single-frame dropouts

const INFER_INTERVAL_MS = 50;   
const LOW_POWER_MS = 45;        

const SMOOTH_TAU_MS = 60;
const STALE_MS = 400;
const GRACE_MS = 250;
const CONFIRM_MS = 100;
const VISIBLE_ON_MS = 120;
const VISIBLE_OFF_MS = 500;
const LOST_RESET_MS = 1000;

// ---------- MATH ----------
const cosDeg = (deg) => Math.cos((deg * Math.PI) / 180);
const COS_70 = cosDeg(70);
const COS_130 = cosDeg(130); // Added for elbow bend check
const COS_140 = cosDeg(140);

function cosAngle(A, B, C) {
  const abx = A.x - B.x, aby = A.y - B.y;
  const cbx = C.x - B.x, cby = C.y - B.y;
  const denom = Math.sqrt((abx * abx + aby * aby) * (cbx * cbx + cby * cby));
  return denom === 0 ? 1 : (abx * cbx + aby * cby) / denom;
}

const pxDist = (a, b, w, h) => Math.hypot((a.x - b.x) * w, (a.y - b.y) * h);
const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

const ok = (p) =>
  !!p && p.visibility > JOINT_VIS && p.x > 0.005 && p.x < 0.995 && p.y > 0.005 && p.y < 0.995;

// ---------- POSE SELECTION ----------
function pickMainPose(poses, lockCenter) {
  let best = null;
  let bestScore = 0;

  for (const p of poses ?? []) {
    const nose = p[0], ls = p[11], rs = p[12], lh = p[23], rh = p[24];

    if (!(ls.visibility > 0.5 && rs.visibility > 0.5 && nose.visibility > 0.3)) continue;

    const shW = Math.abs(ls.x - rs.x);
    if (shW < 0.05) continue;
    if (Math.abs(ls.y - rs.y) > shW) continue;
    if (nose.y > Math.min(ls.y, rs.y)) continue;

    let vis = (nose.visibility + ls.visibility + rs.visibility) / 3;

    if (lh.visibility > 0.4 && rh.visibility > 0.4) {
      const sh = mid(ls, rs), hip = mid(lh, rh);
      const torso = Math.hypot(sh.x - hip.x, sh.y - hip.y);
      const ratio = torso / shW;
      if (ratio < 0.6 || ratio > 3) continue;
      vis = (vis * 3 + lh.visibility + rh.visibility) / 5;
    }

    const center = mid(ls, rs);
    let score = shW * vis;
    if (lockCenter && Math.hypot(center.x - lockCenter.x, center.y - lockCenter.y) < 0.15) {
      score *= 1.5;
    }

    if (score > bestScore) {
      bestScore = score;
      best = { pose: p, center };
    }
  }
  return best;
}

function smoothPose(prev, curr, dt) {
  if (!prev) return curr.map((p) => ({ ...p }));
  const pc = mid(prev[11], prev[12]);
  const cc = mid(curr[11], curr[12]);
  if (Math.hypot(pc.x - cc.x, pc.y - cc.y) > 0.2) return curr.map((p) => ({ ...p }));
  const a = 1 - Math.exp(-Math.max(dt, 1) / SMOOTH_TAU_MS);
  return curr.map((p, i) => ({
    x: prev[i].x + (p.x - prev[i].x) * a,
    y: prev[i].y + (p.y - prev[i].y) * a,
    z: p.z,
    visibility: p.visibility,
  }));
}

// ---------- DRAWING ----------
function drawSkeleton(ctx, pose, w, h, lowPower) {
  ctx.lineWidth = lowPower ? 3 : 4;
  ctx.strokeStyle = "#00FF00";
  ctx.beginPath();
  for (const { start, end } of PoseLandmarker.POSE_CONNECTIONS) {
    const a = pose[start], b = pose[end];
    if (a.visibility < DRAW_VISIBILITY || b.visibility < DRAW_VISIBILITY) continue;
    ctx.moveTo(a.x * w, a.y * h);
    ctx.lineTo(b.x * w, b.y * h);
  }
  ctx.stroke();

  if (lowPower) return;

  ctx.fillStyle = "#FF0000";
  ctx.beginPath();
  for (const p of pose) {
    if (p.visibility < DRAW_VISIBILITY) continue;
    const x = p.x * w, y = p.y * h;
    ctx.moveTo(x + 5, y);
    ctx.arc(x, y, 5, 0, Math.PI * 2);
  }
  ctx.fill();
}

// ---------- BODY GESTURES ----------
function detectHandGesture(pose, w, h) {
  const ls = pose[11], rs = pose[12];
  const le = pose[13], re = pose[14];
  const lw = pose[15], rw = pose[16];
  const lh = pose[23], rh = pose[24];

  const VIS = 0.25;
  if (![ls, rs, le, re, lw, rw].every((p) => p.visibility > VIS)) return null;

  const shWn = Math.abs(ls.x - rs.x);
  if (shWn < 0.05) return null;

  const midX = (ls.x + rs.x) / 2;
  const shY = (ls.y + rs.y) / 2;
  const dir = Math.sign(ls.x - rs.x);
  const side = (p) => dir * (p.x - midX);

  const hipsVisible = lh.visibility > VIS && rh.visibility > VIS;

  // 1. CROSSED ARMS -> STOP
  const shWy = shWn * (w / h);
  const chestTop = shY - 0.3 * shWy;
  const chestBottom = hipsVisible ? (lh.y + rh.y) / 2 : shY + 1.2 * shWy;
  const inChest = (p) => p.y > chestTop && p.y < chestBottom;
  const margin = 0.15 * shWn;

  if (side(lw) < -margin && side(rw) > margin && inChest(lw) && inChest(rw)) {
    return "STOP";
  }

  // 2. HANDS ON HIPS -> RESUME
  if (!hipsVisible) return null;

  const torso = pxDist(mid(ls, rs), mid(lh, rh), w, h);
  if (torso < 1) return null;

  // Both wrists resting near their hips
  const wristsOnHips =
    pxDist(lw, lh, w, h) < 0.6 * torso &&
    pxDist(rw, rh, w, h) < 0.6 * torso;

  // Elbows flared clearly outside the shoulders, each on its OWN side.
  // The left side is positive in side(), the right side is negative.
  const halfSh = shWn / 2;
  const flare = (e) => Math.abs(e.x - midX) > halfSh * 1.4;
  const leftOut = side(le) > 0 && flare(le);
  const rightOut = side(re) < 0 && flare(re);

  // Elbows bent (hanging arms are ~170 degrees, hands on hips is ~90)
  const bent =
    cosAngle(ls, le, lw) > COS_130 &&
    cosAngle(rs, re, rw) > COS_130;

  if (wristsOnHips && leftOut && rightOut && bent) return "RESUME";

  return null;
}

// ---------- EXERCISE CLASSES ----------
class Exercise {
  static HINT = "Step back; Show your whole body!";
  static check(_lm) { return true; }
  constructor() {
    this.reps = 0;
    this.message = "";
    this._t = {};
  }
  hold(key, cond, ms, now) {
    const s = this._t[key] || (this._t[key] = { since: null, lastTrue: 0 });
    if (cond) {
      if (s.since === null || now - s.lastTrue > GRACE_MS) s.since = now;
      s.lastTrue = now;
      return now - s.since >= ms;
    }
    if (s.since !== null && now - s.lastTrue > GRACE_MS) s.since = null;
    return false;
  }
  resetStreaks() { this._t = {}; }
  update(_lm, _w, _h, _now) { return false; }
}

class BicepCurl extends Exercise {
  static HINT = "Show your arms to the camera";
  static check(lm) {
    return [11, 13, 15].every((i) => ok(lm[i])) || [12, 14, 16].every((i) => ok(lm[i]));
  }
  constructor() {
    super();
    this.stage = "wait";
  }
  update(lm, _w, _h, now) {
    this.message = "";
    let best = null;
    if ([11, 13, 15].every((i) => ok(lm[i]))) best = cosAngle(lm[11], lm[13], lm[15]);
    if ([12, 14, 16].every((i) => ok(lm[i]))) {
      const r = cosAngle(lm[12], lm[14], lm[16]);
      best = best === null ? r : Math.max(best, r);
    }
    if (best === null) return false;

    if (this.hold("ext", best < COS_140, CONFIRM_MS, now)) {
      this.stage = "extended";
      return false;
    }
    if (this.stage === "extended" && best > COS_70) {
      this.stage = "contracted";
      this.reps++;
      return true;
    }
    return false;
  }
}

class Squat extends Exercise {
  static HINT = "Step back; show your knees!";
  static check(lm) {
    return [11, 12, 23, 24, 25, 26].every((i) => ok(lm[i]));
  }
  constructor() {
    super();
    this.stage = "standing";
    this.baseline = 0;
    this.cal = 0;
  }
  update(lm, w, h, now) {
    this.message = "";
    const sh = mid(lm[11], lm[12]);
    const hip = mid(lm[23], lm[24]);
    const knee = mid(lm[25], lm[26]);
    const torso = pxDist(sh, hip, w, h);
    if (torso < 1) return false;

    const ratio = ((knee.y - hip.y) * h) / torso;

    if (this.cal < 10) {
      this.baseline = (this.baseline * this.cal + ratio) / (this.cal + 1);
      this.cal++;
      this.message = "Stand tall for a moment";
      return false;
    }
    if (this.baseline < 0.25) {
      this.message = "Face the camera and stand tall";
      this.cal = 0;
      this.baseline = 0;
      return false;
    }

    const downNow = ratio < this.baseline * 0.6;
    const upNow = ratio > this.baseline * 0.85;

    if (this.stage === "standing") {
      if (upNow) this.baseline += (ratio - this.baseline) * 0.1;
      if (this.hold("down", downNow, CONFIRM_MS, now)) this.stage = "squatting";
    } else if (upNow) {
      this.stage = "standing";
      this.reps++;
      return true;
    }
    return false;
  }
}

class JumpingJack extends Exercise {
  static HINT = "Step back; Show your whole body!";
  static check(lm) {
    return [11, 12, 15, 16, 23, 24, 27, 28].every((i) => ok(lm[i]));
  }
  constructor() {
    super();
    this.stage = "closed";
  }
  update(lm, _w, _h, now) {
    this.message = "";
    const sh = mid(lm[11], lm[12]);
    const hip = mid(lm[23], lm[24]);
    const torsoV = hip.y - sh.y;
    const shW = Math.abs(lm[11].x - lm[12].x);
    if (torsoV < 0.01 || shW < 0.02) return false;

    const feet = Math.abs(lm[27].x - lm[28].x) / shW;
    const legsWide = feet > 1.4;
    const legsNarrow = feet < 0.9;

    const armsUp = lm[15].y < lm[11].y && lm[16].y < lm[12].y;
    const lowLine = sh.y + 0.4 * torsoV;
    const armsDown = lm[15].y > lowLine && lm[16].y > lowLine;

    if (this.hold("open", armsUp && legsWide, CONFIRM_MS, now)) {
      this.stage = "open";
      return false;
    }
    if (this.stage === "open" && armsDown && legsNarrow) {
      this.stage = "closed";
      this.reps++;
      return true;
    }
    return false;
  }
}

const EXERCISES = {
  "Bicep Curl": BicepCurl,
  "Squat": Squat,
  "Squats": Squat,
  "Jumping jacks": JumpingJack,
};

// ---------- UI HELPERS ----------
const toneOf = (t) => {
  if (t.startsWith("Paused")) return "tone-warn";
  if (t.startsWith("Ready") || t.startsWith("Stand tall") || t.startsWith("Face the camera")) return "tone-info";
  if (t.startsWith("Looking good") || t.startsWith("Nice work")) return "tone-good";
  return "tone-error";
};

// ---------- COMPONENT ----------
function CameraTracker({
  exerciseName, sessionKey = 0, targetReps = 50, started = false, running = true, locked = false,
  onRepUpdate, onGoalReached, onGesture, onVisibilityChange, showSkeleton = true,
  timerNode,
  actionsNode,
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const landmarkerRef = useRef(null);
  const exerciseRef = useRef(null);
  const goalFiredRef = useRef(false);

  const onRepRef = useRef(onRepUpdate);
  const onGoalRef = useRef(onGoalReached);
  const onGestureRef = useRef(onGesture);
  const onVisibilityRef = useRef(onVisibilityChange);
  const startedRef = useRef(started);
  const runningRef = useRef(running);
  const lockedRef = useRef(locked);
  const targetRef = useRef(targetReps);
  const skeletonRef = useRef(showSkeleton);

  const lastFeedbackRef = useRef("");
  const lastVisibleRef = useRef(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [reps, setReps] = useState(0);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    onRepRef.current = onRepUpdate;
    onGoalRef.current = onGoalReached;
    onGestureRef.current = onGesture;
    onVisibilityRef.current = onVisibilityChange;
    startedRef.current = started;
    runningRef.current = running;
    lockedRef.current = locked;
    targetRef.current = targetReps;
    skeletonRef.current = showSkeleton;
  }, [onRepUpdate, onGoalReached, onGesture, onVisibilityChange, started, running, locked, targetReps, showSkeleton]);

  useEffect(() => {
    const ExerciseClass = EXERCISES[exerciseName] || BicepCurl;
    exerciseRef.current = new ExerciseClass();
    goalFiredRef.current = false;
    lastFeedbackRef.current = "";
    setReps(0);
    setFeedback("");
  }, [exerciseName, sessionKey]);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });

    let cancelled = false;
    let rafId = 0;
    let vfcId = 0;
    let stream = null;
    let lastTs = 0;
    let lastInferAt = -Infinity;
    let lastFrameAt = 0;
    let lastSeenAt = 0;
    let inferMs = 0;
    let lowPower = false;
    let pendingGesture = null;
    let pendingSince = 0;
    let pendingLastSeen = 0; // Added for gesture grace period
    let lastGestureFire = -Infinity;

    let lockCenter = null;
    let smoothed = null;

    let goodSince = null;
    let badSince = null;
    let stableVisible = false;

    const fb = (t) => {
      if (t !== lastFeedbackRef.current) {
        lastFeedbackRef.current = t;
        setFeedback(t);
      }
    };

    const markVisible = (rawOk, now) => {
      if (rawOk) {
        badSince = null;
        if (goodSince === null) goodSince = now;
        if (!stableVisible && now - goodSince >= VISIBLE_ON_MS) stableVisible = true;
      } else {
        goodSince = null;
        if (badSince === null) badSince = now;
        if (stableVisible && now - badSince >= VISIBLE_OFF_MS) stableVisible = false;
      }
      if (stableVisible !== lastVisibleRef.current) {
        lastVisibleRef.current = stableVisible;
        onVisibilityRef.current?.(stableVisible);
      }
      return stableVisible;
    };

    const processFrame = (now) => {
      const landmarker = landmarkerRef.current;
      const ex = exerciseRef.current;
      if (!landmarker || !ex || video.readyState < 2) return;

      if (now - lastInferAt < INFER_INTERVAL_MS) return;

      const w = video.videoWidth, h = video.videoHeight;
      if (!w || !h) return;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      lastInferAt = now;
      const dt = lastFrameAt ? now - lastFrameAt : 0;
      lastFrameAt = now;
      if (dt > STALE_MS) smoothed = null;

      const ts = Math.max(now, lastTs + 1);
      lastTs = ts;
      const t0 = performance.now();
      const result = landmarker.detectForVideo(video, ts);
      const spent = performance.now() - t0;
      inferMs = inferMs === 0 ? spent : inferMs * 0.8 + spent * 0.2;
      lowPower = inferMs > LOW_POWER_MS;

      ctx.drawImage(video, 0, 0, w, h);
      const main = pickMainPose(result.landmarks, lockCenter);

      if (!main) {
        if (now - lastSeenAt > GRACE_MS) ex.resetStreaks();
        if (now - lastSeenAt > LOST_RESET_MS) {
          lockCenter = null;
          smoothed = null;
        }
        pendingGesture = null;
        const visibleNow = markVisible(false, now);
        if (!visibleNow) fb("I can't see you - step into the frame");
        return;
      }

      lastSeenAt = now;
      lockCenter = main.center;
      smoothed = smoothPose(smoothed, main.pose, dt);
      const pose = smoothed;

      if (skeletonRef.current) drawSkeleton(ctx, pose, w, h, lowPower);

      const rawOk = ex.constructor.check(pose);
      const visible = markVisible(rawOk, now);

      // ✅ FIX: Decoupled gesture check from exercise visibility/rawOk
      const gestureArmed = startedRef.current && !lockedRef.current;
      if (gestureArmed) {
        const gesture = detectHandGesture(pose, w, h);
        
        // ✅ FIX: Added grace period for pending gestures
        if (gesture) {
          if (gesture !== pendingGesture) {
            pendingGesture = gesture;
            pendingSince = now;
          }
          pendingLastSeen = now;
        } else if (pendingGesture && now - pendingLastSeen > GESTURE_GRACE_MS) {
          pendingGesture = null;
        }

        if (
          pendingGesture &&
          now - pendingSince >= GESTURE_HOLD_MS &&
          now - lastGestureFire > GESTURE_COOLDOWN_MS
        ) {
          const shouldFire =
            (pendingGesture === "STOP" && runningRef.current) ||
            (pendingGesture === "RESUME" && !runningRef.current);
          if (shouldFire) {
            lastGestureFire = now;
            const g = pendingGesture;
            pendingGesture = null;
            onGestureRef.current?.(g);
          }
        }
      } else {
        pendingGesture = null;
      }

      if (lockedRef.current) return fb("");
      if (!visible) return fb(ex.constructor.HINT);
      if (!startedRef.current) return fb("Ready when you are - press Start");
      if (!runningRef.current) return fb("Paused - hands on hips to resume");
      if (!rawOk) return;

      const repDone = ex.update(pose, w, h, now);
      fb(ex.message);

      if (repDone) {
        setReps(ex.reps);
        onRepRef.current?.(ex.reps);
        if (ex.reps >= targetRef.current && !goalFiredRef.current) {
          goalFiredRef.current = true;
          onGoalRef.current?.();
        }
      }
    };

    const schedule = () => {
      if (cancelled) return;
      if (typeof video.requestVideoFrameCallback === "function") {
        vfcId = video.requestVideoFrameCallback(onFrame);
      } else {
        rafId = requestAnimationFrame(onFrame);
      }
    };
    const onFrame = () => {
      if (cancelled) return;
      try {
        processFrame(performance.now());
      } catch (e) {
        console.error(e);
      } finally {
        schedule();
      }
    };

    (async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(WASM_URL);
        const create = (delegate) =>
          PoseLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath: MODEL_URL, delegate },
            runningMode: "VIDEO",
            numPoses: 1, 
            minPoseDetectionConfidence: 0.6,
            minPosePresenceConfidence: 0.5,
            minTrackingConfidence: 0.5,
          });

        let landmarker;
        try {
          landmarker = await create("GPU");
        } catch {
          landmarker = await create("CPU");
        }
        if (cancelled) {
          landmarker.close();
          return;
        }
        landmarkerRef.current = landmarker;

        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 },
            frameRate: { ideal: 30 },
          },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        video.srcObject = stream;
        await video.play();
        setIsLoaded(true);
        schedule();
      } catch (err) {
        console.error(err);
        fb("Camera or AI failed to load");
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      if (vfcId && typeof video.cancelVideoFrameCallback === "function") {
        video.cancelVideoFrameCallback(vfcId);
      }
      stream?.getTracks().forEach((t) => t.stop());
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
    };
  }, []);

  const displayText = feedback || (locked ? "Nice work!" : "Looking good - keep going!");
  const goalReached = reps >= targetReps;

  return (
    <div className="ct-container">
      <div className="ct-left-col">
        <div className="ct-camera-wrapper">
          <video ref={videoRef} className="ct-video-hidden" playsInline muted />
          {!isLoaded && <div className="ct-loading-text">Loading AI Camera...</div>}
          <canvas ref={canvasRef} className="ct-canvas" style={{ display: isLoaded ? "block" : "none" }} />
        </div>

        {timerNode && <div className="ct-timer-container">{timerNode}</div>}
      </div>

      <div className="ct-right-col">
        <span className="ct-goal-label">Goal</span>
        <div className={`ct-goal-number${goalReached ? " reached" : ""}`}>{reps}</div>
        <span className="ct-goal-total">/ {targetReps}</span>

        <div className={`ct-warning-box ${toneOf(displayText)}`}>{displayText}</div>

        {actionsNode && <div className="ct-actions-wrapper">{actionsNode}</div>}
      </div>
    </div>
  );
}

// for ensuring the timer does not trigger re-renders
export default memo(CameraTracker, (prevProps, nextProps) => {
  return (
    prevProps.exerciseName === nextProps.exerciseName &&
    prevProps.sessionKey === nextProps.sessionKey &&
    prevProps.targetReps === nextProps.targetReps &&
    prevProps.started === nextProps.started &&
    prevProps.running === nextProps.running &&
    prevProps.locked === nextProps.locked &&
    prevProps.timerNode === nextProps.timerNode &&
    prevProps.actionsNode === nextProps.actionsNode
  );
});