import "./templateDashboard.css";

function NavDashboard({ currentScreen, onNavigate }) {
  const stats = [
    { title: "Today", value: "0", detail: "Time to make a little move", icon: "⌁" },
    { title: "Yesterday", value: "1", detail: "15 min · 180 reps", icon: "⌁" },
    { title: "This week", value: "4", detail: "45 min · 550 reps", icon: "▦" },
    { title: "This month", value: "18", detail: "216 min · 1,630 reps", icon: "▦" },
  ];

  const navItems = [
    { label: "Overview", screen: "NavDashboard" },
    { label: "Workouts", screen: "WorkOut" },
    { label: "History", screen: "HistoryAct" },
    { label: "Progress", screen: "Progress" },
  ];

  return (
    <>
      <header className="topbar">
        <button
          className="brand"
          onClick={() => onNavigate("NavDashboard")}
          aria-label="Go to Overview"
        >
          <span class="brand-mark">
          <img src="Logo.png" alt="Logo"></img>
          </span>
          Aeroutine
        </button>

        <nav className="nav">
          {navItems.map((item) => (
            <button
              key={item.screen}
              className={
                currentScreen === item.screen ? "nav-link active" : "nav-link"
              }
              onClick={() => onNavigate(item.screen)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="top-right">
          <span className="streak"><img src="streak.png" alt="streak"></img>4 Streak</span>
          <button
            className="icon-button"
            aria-label="Settings"
            onClick={() => onNavigate("Settings")}
          >
             <span className="bell"><img src="bell.png" alt="bell"></img></span>
          </button>
          <button
            className="avatar"
            aria-label="Account settings"
            onClick={() => onNavigate("SignandLog")}
          >
            JL
          </button>
        </div>
      </header>

      {currentScreen === "NavDashboard" && (
        <main className="overview-page">
          <section className="overview-heading">
            <div>
              <h1>Your routine, in motion.</h1>
              <p>
                Friday, October 23, 2026 · A little movement. A stronger
                everyday.
              </p>
            </div>

            <button
              className="start-button"
              onClick={() => onNavigate("WorkOut")}
            >
              ▷ Start workout
            </button>
          </section>

          <section className="overview-grid">
            <article className="welcome-card">
              <div className="eyebrow">YOUR EVERYDAY MOMENTUM</div>
              <h2>
                Hey, Jamie,
                <br />
                keep showing up.
              </h2>
              <p>
                Four days down. Make today your fifth.
                <br />
                Your next small win starts here.
              </p>
              <button
                className="text-action"
                onClick={() => onNavigate("Progress")}
              >
                ♨ Keep your 4-day streak alive ↗
              </button>
              <div className="welcome-figure" aria-hidden="true">
                <img src="person.png" alt="Figure"></img>
              </div>
            </article>

            <div className="stats-grid">
              {stats.map((stat) => (
                <article className="stat-card" key={stat.title}>
                  <span className="stat-label">{stat.title}</span>
                  <div className="stat-value">
                    <strong>{stat.value}</strong>
                    <span>workouts</span>
                    <span className="stat-icon">{stat.icon}</span>
                  </div>
                  <p>{stat.detail}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="overview-grid two-columns">
            <article className="overview-card activity-card">
              <h3>Activity this week</h3>
              <p className="muted">October 19–25 · Workout duration</p>
              <div className="minutes">
                45 <span>minutes</span>
                <span className="growth">+9 min vs. last week</span>
              </div>

              <div className="activity-chart">
                {[10, 12, 8, 15, 0, 0, 0].map((height, index) => (
                  <div className="chart-column" key={index}>
                    <span className="chart-number">
                      {height ? `${height}m` : "–"}
                    </span>
                    <div
                      className={
                        index === 3 ? "chart-bar chart-active" : "chart-bar"
                      }
                      style={{ height: `${height * 4}px` }}
                    />
                    <span className="chart-day">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}
                    </span>
                  </div>
                ))}
              </div>
            </article>

            <article className="overview-card consistency-card">
              <h3>Consistency looks good on you.</h3>
              <p className="muted">
                4 consecutive days · Your best streak is 12 days
              </p>
              <div className="streak-number">
                <span>♧</span>
                <strong>4</strong>
                <span>day streak</span>
                <small>Today is still open</small>
              </div>

              <div className="week-days">
                {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
                  <div className="week-day" key={index}>
                    <span>{day}</span>
                    <strong className={index < 4 ? "done" : index === 4 ? "today" : ""}>
                      {index < 4 ? "✓" : index === 4 ? "23" : 24 + index - 5}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="goal-row">
                <span>Weekly goal</span>
                <span>4 of 5 workouts · 80%</span>
              </div>
              <div className="goal-track">
                <div className="goal-progress" />
              </div>
            </article>
          </section>

          <section className="overview-grid bottom-columns">
            <article className="overview-card latest-card">
              <div className="card-heading">
                <h3>Latest workout</h3>
                <button
                  className="inline-link"
                  onClick={() => onNavigate("HistoryAct")}
                >
                  View history →
                </button>
              </div>
              <div className="latest-workout">
                <div className="workout-symbol">✳</div>
                <div className="latest-description">
                  <strong>Jumping jacks</strong>
                  <p>Thu, Oct 22 · 7:30 AM · Camera tracked</p>
                </div>
                <div className="workout-metrics">
                  <span>15 min</span>
                  <span>3 sets</span>
                  <span>180 reps</span>
                </div>
                <button
                  className="arrow-button"
                  onClick={() => onNavigate("HistoryAct")}
                  aria-label="View workout history"
                >
                  ↗
                </button>
              </div>
            </article>

            <article className="manual-card">
              <h3>▤ &nbsp; Moved without your camera?</h3>
              <p>
                Every effort counts. Add a workout manually to keep your story
                complete.
              </p>
              <button
                className="inline-link"
                onClick={() => onNavigate("WorkoutLog")}
              >
                Add a workout →
              </button>
            </article>
          </section>
        </main>
      )}
    </>
  );
}

export default NavDashboard;

