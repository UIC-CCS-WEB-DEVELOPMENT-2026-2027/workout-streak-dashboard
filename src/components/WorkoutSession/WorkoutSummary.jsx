// file name: WorkoutSummary.jsx
import React from "react";
import "./workoutSummary.css";

export default function WorkoutSummary({ onNavigate, selectedWorkout }) {
  const results = selectedWorkout?.results || [];
  
  // Calculate Totals
  const totalTime = results.reduce((sum, item) => sum + item.time, 0);
  const totalReps = results.reduce((sum, item) => sum + item.reps, 0);

  const formatTime = (val) => {
    const m = Math.floor(val / 60).toString().padStart(2, "0");
    const s = (val % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <section className="summary-page">
      <div className="summary-card">
        
        {/* HEADER */}
        <div className="summary-header">
          <span className="summary-label">SESSION COMPLETE</span>
          <h1 className="summary-title">Workout Summary</h1>
          <p className="summary-subtitle">Here is what you accomplished today.</p>
        </div>

        {/* STATS GRID */}
        <div className="summary-stats">
          <div className="stat-box">
            <span className="summary-label">TOTAL TIME</span>
            <strong className="stat-value">{formatTime(totalTime)}</strong>
          </div>
          <div className="stat-box">
            <span className="summary-label">TOTAL REPS</span>
            <strong className="stat-value">{totalReps}</strong>
          </div>
        </div>

        {/* EXERCISE LIST */}
        <div className="summary-list">
          <h3 className="summary-label">EXERCISES RECORDED</h3>
          {results.map((exercise, i) => {
            const isComplete = exercise.reps >= exercise.targetReps;
            return (
              <div key={i} className="summary-item">
                <div className="summary-icon">
                  {isComplete ? "✅" : "⚡"}
                </div>
                <div className="summary-info">
                  <strong className="summary-exercise-name">{exercise.name}</strong>
                  <p className="summary-exercise-time">{formatTime(exercise.time)}</p>
                </div>
                <div className="summary-metrics">
                  <strong className={isComplete ? "text-green" : "text-orange"}>
                    {exercise.reps} <span>/ {exercise.targetReps}</span>
                  </strong>
                  <span className="summary-label">reps</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ACTION */}
        <button 
          className="summary-save-btn" 
          onClick={() => onNavigate("HistoryAct")}
        >
          SAVE TO HISTORY ↗
        </button>

      </div>
    </section>
  );
}