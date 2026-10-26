import "./workOut.css";

function WorkOut({ onNavigate }) {
  const workouts = [
    { name: "Jumping jacks", type: "Full body", duration: "15 min", reps: "180 reps" },
    { name: "Squats", type: "Lower body", duration: "10 min", reps: "60 reps" },
    { name: "Push-ups", type: "Upper body", duration: "10 min", reps: "40 reps" },
    { name: "High knees", type: "Cardio", duration: "8 min", reps: "120 reps" },
  ];

  return (
    <section className="workout-page">
      <h1 className="screen-title">Your workouts</h1>
      <p className="screen-subtitle">Choose a movement and get started.</p>

      <div className="workout-intro">
        <div>
          <span>YOUR NEXT SMALL WIN</span>
          <h2>Ready to move?</h2>
          <p>Every rep counts. Build your routine one workout at a time.</p>
        </div>
        <button
          className="primary-button"
          onClick={() => onNavigate("WorkOutAct")}
        >
          ▶ Start workout
        </button>
      </div>

      <div className="workout-list">
        {workouts.map((workout) => (
          <article className="card workout-option" key={workout.name}>
            <div className="workout-symbol">✳</div>
            <div className="workout-option-info">
              <h3>{workout.name}</h3>
              <p>{workout.type} · {workout.duration} · {workout.reps}</p>
            </div>
            <button
              className="secondary-button"
              onClick={() => onNavigate("WorkOutAct")}
            >
              Start
            </button>
          </article>
        ))}
      </div>

      <button
        className="manual-workout-link"
        onClick={() => onNavigate("WorkoutLog")}
      >
        + Log a workout manually
      </button>
    </section>
  );
}

export default WorkOut;
