
import { useState } from "react";
import "./workoutlog.css";

function WorkoutLog({ onNavigate }) {
  const [name, setName] = useState("Jumping jacks");
  const [duration, setDuration] = useState("15");
  const [reps, setReps] = useState("180");
  const [date, setDate] = useState("2026-10-26");
  const [saved, setSaved] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setSaved(true);
  }

  return (
    <section className="log-page">
      <button className="back-link" onClick={() => onNavigate("HistoryAct")}>
        ← Back to history
      </button>

      <h1 className="screen-title">Log a workout</h1>
      <p className="screen-subtitle">
        Record a workout you completed outside the app.
      </p>

      <form className="card log-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="workout-name">Workout name</label>
          <input
            id="workout-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="workout-date">Date</label>
          <input
            id="workout-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="workout-duration">Duration (minutes)</label>
          <input
            id="workout-duration"
            type="number"
            min="1"
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="workout-reps">Repetitions</label>
          <input
            id="workout-reps"
            type="number"
            min="0"
            value={reps}
            onChange={(event) => setReps(event.target.value)}
            required
          />
        </div>

        {saved && (
          <p className="log-success">
            Workout details submitted in this demo. They are not saved to a
            database.
          </p>
        )}

        <div className="log-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => onNavigate("HistoryAct")}
          >
            Cancel
          </button>
          <button type="submit" className="primary-button">
            Save workout
          </button>
        </div>
      </form>
    </section>
  );
}

export default WorkoutLog;
