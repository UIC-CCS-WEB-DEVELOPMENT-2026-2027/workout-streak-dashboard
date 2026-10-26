import "./bodyDashboard.css";

function BodyDashboard({ onNavigate }) {
  return (
    <section className="body-dashboard">
      <h1 className="screen-title">Your dashboard</h1>
      <p className="screen-subtitle">
        A quick look at your routine and recent activity.
      </p>

      <div className="body-dashboard-grid">
        <article className="card">
          <span className="body-dashboard-icon">♨</span>
          <h2>4-day streak</h2>
          <p>You've been building a consistent routine. Keep going!</p>
        </article>

        <article className="card">
          <span className="body-dashboard-icon">◷</span>
          <h2>216 minutes</h2>
          <p>Your recorded workout time this month.</p>
        </article>
      </div>

      <button
        className="primary-button"
        onClick={() => onNavigate("NavDashboard")}
      >
        Return to Overview
      </button>
    </section>
  );
}

export default BodyDashboard;
