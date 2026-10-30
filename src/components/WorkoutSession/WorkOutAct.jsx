//file name: WorkOutAct.jsx
import "./workoutAct.css";
import { useCallback, useEffect, useState, memo, useMemo, useRef } from "react";
import CameraTracker from "./CameraTracker";

const REST_SECONDS = 15;

const formatTime = (value) => {
  const minutes = Math.floor(value / 60).toString().padStart(2, "0");
  const remainingSeconds = (value % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
};

// Isolated Timer Component with callback
const TimerDisplay = memo(({ running, bodyVisible, locked, completed, onTick }) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!running || !bodyVisible || locked) return;
    const id = setInterval(() => {
      setSeconds((v) => {
        const next = v + 1;
        if (onTick) onTick(next); // Send time up to parent
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, bodyVisible, locked, onTick]);

  const caption = completed
    ? "GOAL REACHED"
    : !bodyVisible
    ? "WAITING FOR FULL BODY"
    : running
    ? "TIME ELAPSED"
    : "PAUSED (hands on hips to resume)";

  return (
    <div style={{ textAlign: "center", width: "100%" }}>
      <div
        style={{
          fontSize: "clamp(3.5rem, 6vw, 5.5rem)",
          fontWeight: 800,
          color: !bodyVisible ? "#9ca3af" : "#292f48",
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {formatTime(seconds)}
      </div>
      <div
        style={{
          fontSize: "1rem",
          fontWeight: 900,
          color: !bodyVisible && !completed ? "#ef4444" : "#8791aa",
          letterSpacing: "1px",
          marginTop: 8,
        }}
      >
        {caption}
      </div>
    </div>
  );
});

function WorkOutAct({ onNavigate, selectedWorkout }) {
  const isList = selectedWorkout?.isList ?? false;
  const queue = selectedWorkout?.exercises?.length
    ? selectedWorkout.exercises
    : [{ name: "Workout", targetReps: 50 }];

  const [currentIndex, setCurrentIndex] = useState(0);
  const activeWorkout = queue[currentIndex];
  const nextWorkout = queue[currentIndex + 1];

  const [running, setRunning] = useState(false);
  const [bodyVisible, setBodyVisible] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [resting, setResting] = useState(false);
  const [restSeconds, setRestSeconds] = useState(REST_SECONDS);
  const [started, setStarted] = useState(false);

  // Session Tracking States
  const [currentReps, setCurrentReps] = useState(0);
  const [sessionLogs, setSessionLogs] = useState([]);
  const secondsRef = useRef(0); // Tracks current exercise time

  const locked = resting || completed;

  useEffect(() => {
    if (!resting) return;

    if (restSeconds > 0) {
      const id = setTimeout(() => setRestSeconds((v) => v - 1), 1000);
      return () => clearTimeout(id);
    }

    setResting(false);
    setRestSeconds(REST_SECONDS);
    setCurrentIndex((i) => i + 1);
    setCurrentReps(0);     // Reset reps for next exercise
    secondsRef.current = 0; // Reset time for next exercise
    setRunning(true);
  }, [resting, restSeconds]);

  // When goal is hit, push current exercise to logs
  const handleGoalReached = useCallback(() => {
    setRunning(false);
    
    setSessionLogs(prev => [...prev, {
      name: activeWorkout.name,
      targetReps: activeWorkout.targetReps,
      reps: currentReps,
      time: secondsRef.current
    }]);

    const isLast = currentIndex >= queue.length - 1;
    if (isList && !isLast) {
      setRestSeconds(REST_SECONDS);
      setResting(true);
    } else {
      setCompleted(true);
    }
  }, [currentIndex, queue.length, isList, activeWorkout, currentReps]);

  const handleGesture = useCallback(
    (gesture) => {
      if (gesture === "STOP") setRunning(false);
      if (gesture === "RESUME" && !locked) setRunning(true);
    },
    [locked]
  );

  // Intercept "Finish" button
  const handleFinish = () => {
    let finalLogs = [...sessionLogs];
    
    // If they didn't finish the last exercise's goal, but got >0 reps, add it manually
    if (!completed && currentReps > 0) {
      finalLogs.push({
        name: activeWorkout.name,
        targetReps: activeWorkout.targetReps,
        reps: currentReps,
        time: secondsRef.current
      });
    }

    // RULE: Filter out exercises where they got 0 reps
    const validLogs = finalLogs.filter(log => log.reps > 0);

    if (validLogs.length === 0) {
      // RULE: If nothing was done, discard silently and go home
      alert("No reps recorded. Workout not saved.");
      onNavigate("NavDashboard");
    } else {
      // RULE: If some (or all) were done, show the summary screen
      onNavigate("WorkoutSummary", { results: validLogs });
    }
  };

  // Memoize nodes
  const timerNode = useMemo(() => (
    <TimerDisplay 
      running={running} 
      bodyVisible={bodyVisible} 
      locked={locked} 
      completed={completed} 
      onTick={(s) => { secondsRef.current = s; }} 
    />
  ), [running, bodyVisible, locked, completed]);

  const actionsNode = useMemo(() => (
    <div style={{ display: "flex", gap: 12, width: "100%" }}>
      <button
        className="secondary-button"
        disabled={completed}
        onClick={() => {
          setStarted(true);
          setRunning((v) => !v);
        }}
        style={{ flex: 1, padding: "14px", fontSize: "1.1rem" }}
      >
        {running ? "Ⅱ Pause" : started ? "▶ Resume" : "▶ Start"}
      </button>
      <button
        className="primary-button"
        onClick={handleFinish}
        style={{ flex: 1, padding: "14px", fontSize: "1.1rem" }}
      >
        Finish workout
      </button>
    </div>
  ), [completed, running, started, onNavigate, sessionLogs, currentReps, activeWorkout, completed]);

  return (
    <section
      className="active-workout-page"
      style={{
        width: "100%",
        minHeight: "calc(100vh - 70px)",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        padding: "8px 0 24px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: 16,
          padding: "0 24px 12px",
          maxWidth: "1500px",
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div style={{ justifySelf: "start" }}>
          <button className="back-link" onClick={() => onNavigate("WorkOut")}>
            ← Cancel workout
          </button>
        </div>

        <div style={{ textAlign: "center" }}>
          <span className="active-label" style={{ fontSize: "0.9rem", letterSpacing: "1px", color: "#5759ef", fontWeight: "bold" }}>
            {isList ? `EXERCISE ${currentIndex + 1} OF ${queue.length}` : "WORKOUT IN PROGRESS"}
          </span>
          <h1 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", margin: "2px 0", color: "#111827" }}>
            {activeWorkout.name}
          </h1>
          <p style={{ margin: 0, fontSize: "1rem", color: "#8791aa" }}>
            Goal: {activeWorkout.targetReps} reps. Move at your own pace.
          </p>
        </div>

        <div />
      </div>

      {resting && (
        <div
          style={{
            flex: 1,
            margin: "0 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            background: "#fff",
            borderRadius: 24,
            padding: "24px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            maxWidth: "1200px",
            width: "100%",
            alignSelf: "center",
          }}
        >
          <span className="active-label" style={{ color: "#0284c7", fontSize: "1.2rem", fontWeight: 800 }}>
            RESTING
          </span>
          <h1 style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", margin: "8px 0" }}>Rest up!</h1>
          <p className="screen-subtitle" style={{ fontSize: "1.5rem", margin: 0 }}>
            Next: {nextWorkout?.name || "Finish"}
          </p>

          <div
            style={{
              color: "#0284c7",
              fontSize: "clamp(140px, 30vh, 320px)",
              fontWeight: 800,
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
              margin: "24px 0 12px",
            }}
          >
            {restSeconds}
          </div>
          <div className="timer-caption" style={{ fontSize: "1.5rem", fontWeight: 700 }}>
            SECONDS REMAINING
          </div>

          <button
            className="primary-button"
            style={{ marginTop: 30, fontSize: "1.2rem", padding: "14px 36px" }}
            onClick={() => setRestSeconds(0)}
          >
            Skip rest
          </button>
        </div>
      )}

      <div 
        style={{ 
          flex: 1, 
          minHeight: 0, 
          display: resting ? "none" : "flex", 
          flexDirection: "column", 
          maxWidth: "1500px", 
          margin: "0 auto", 
          width: "100%" 
        }}
      >
        <CameraTracker
          exerciseName={activeWorkout.name}
          sessionKey={currentIndex}
          targetReps={activeWorkout.targetReps}
          started={started}
          running={running}
          locked={locked}
          completed={completed}
          onGoalReached={handleGoalReached}
          onGesture={handleGesture}
          onRepUpdate={setCurrentReps} // Added this to track live reps
          onVisibilityChange={setBodyVisible}
          timerNode={timerNode}
          actionsNode={actionsNode}
        />
      </div>
    </section>
  );
}

export default WorkOutAct;