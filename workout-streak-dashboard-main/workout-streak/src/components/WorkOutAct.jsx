import "./workoutAct.css"
import { useEffect, useState } from "react";

function WorkOutAct({ onNavigate }) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [reps, setReps] = useState(0);

  useEffect(() => {
    if (!running) return;

    const timer = setInterval(() => {
      setSeconds((value) => value + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [running]);

  const formatTime = (value) => {
    const minutes = Math.floor(value / 60).toString().padStart(2, "0");
    const remainingSeconds = (value % 60).toString().padStart(2, "0");
    return `${minutes}:${remainingSeconds}`;
  };

  const finishWorkout = () => {
    setRunning(false);
    onNavigate("WorkoutLog");
  };

  return (
    <section className="active-workout-page">
      <button
        className="back-link"
        onClick={() => onNavigate("WorkOut")}
      >
        ← Back to workouts
      </button>

      <div className="active-workout-card">
        <span className="active-label">WORKOUT IN PROGRESS</span>
        <h1>Jumping jacks</h1>
        <p className="screen-subtitle">Move at your own pace. You've got this.</p>

        <div className="exercise-figure">🏃🏻‍♀️</div>

        <div className="timer-display">{formatTime(seconds)}</div>
        <span className="timer-caption">TIME ELAPSED</span>

        <div className="rep-counter">
          <button
            className="counter-button"
            onClick={() => setReps((value) => Math.max(0, value - 1))}
            aria-label="Decrease repetitions"
          >
            −
          </button>
          <div>
            <strong>{reps}</strong>
            <span>repetitions</span>
          </div>
          <button
            className="counter-button"
            onClick={() => setReps((value) => value + 1)}
            aria-label="Add repetition"
          >
            +
          </button>
        </div>

        <div className="active-workout-actions">
          <button
            className="secondary-button"
            onClick={() => setRunning((value) => !value)}
          >
            {running ? "Ⅱ Pause" : "▶ " + (seconds ? "Resume" : "Start")}
          </button>
          <button className="primary-button" onClick={finishWorkout}>
            Finish workout
          </button>
        </div>
      </div>
    </section>
  );
}

export default WorkOutAct;
