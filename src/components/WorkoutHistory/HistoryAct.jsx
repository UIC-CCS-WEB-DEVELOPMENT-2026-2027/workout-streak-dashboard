import "./historyAct.css";

function HistoryAct({ onNavigate }) {
  const workouts = [
    { name: "Jumping jacks", date: "Oct 22, 2026", time: "7:30 AM", duration: "15 min", reps: "180 reps" },
    { name: "Squats", date: "Oct 21, 2026", time: "6:15 PM", duration: "10 min", reps: "60 reps" },
    { name: "High knees", date: "Oct 20, 2026", time: "8:00 AM", duration: "8 min", reps: "120 reps" },
    { name: "Push-ups", date: "Oct 19, 2026", time: "5:45 PM", duration: "12 min", reps: "40 reps" },
  ];

  return (
    <section className="history-page">
      <div className="history-heading">
        <div>
          <h1 className="screen-title">Workout history</h1>
          <p className="screen-subtitle">Every little effort adds up.</p>
        </div>
        <button
          className="primary-button"
          onClick={() => onNavigate("WorkoutLog")}
        >
          + Log workout
        </button>
      </div>

      <div className="history-summary">
        <article className="card">
          <span>Total workouts</span>
          <strong>18</strong>
        </article>
        <article className="card">
          <span>Total minutes</span>
          <strong>216</strong>
        </article>
        <article className="card">
          <span>Total repetitions</span>
          <strong>1,630</strong>
        </article>
      </div>

      <section className="card history-list">
        <h2>Recent activity</h2>

        {workouts.map((workout) => (
          <article className="history-item" key={workout.name}>
            <div className="history-icon">✳</div>
            <div className="history-info">
              <strong>{workout.name}</strong>
              <p>{workout.date} · {workout.time}</p>
            </div>
            <div className="history-metric">
              <strong>{workout.duration}</strong>
              <span>{workout.reps}</span>
            </div>
          </article>
        ))}
      </section>
    </section>
  );
}

export default HistoryAct;
