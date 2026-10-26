
import "./progress.css";

function Progress() {
  return (
    <section className="progress-page">
      <h1 className="screen-title">Your progress</h1>
      <p className="screen-subtitle">
        Small steps. Stronger habits. Progress you can see.
      </p>

      <div className="progress-summary">
        <article className="card">
          <span>Total workouts</span>
          <strong>18</strong>
          <small>Completed sessions</small>
        </article>
        <article className="card">
          <span>Active minutes</span>
          <strong>216</strong>
          <small>Time spent moving</small>
        </article>
        <article className="card">
          <span>Current streak</span>
          <strong>4 days</strong>
          <small>Keep the rhythm going</small>
        </article>
      </div>

      <section className="card progress-detail">
        <h2>Weekly goal</h2>
        <p>You've completed 4 out of your 5 planned workouts.</p>
        <div className="progress-track">
          <div className="progress-fill" />
        </div>
        <strong>80% complete</strong>
      </section>

      <section className="card progress-detail">
        <h2>Keep building consistency</h2>
        <p>
          Choose a realistic workout schedule and celebrate every session you
          complete. Consistency matters more than perfection.
        </p>
      </section>
    </section>
  );
}

export default Progress;
