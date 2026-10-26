
import { useState } from "react";
import "./settings.css";

function Settings() {
  const [reminders, setReminders] = useState(true);
  const [weeklyGoal, setWeeklyGoal] = useState("5");
  const [units, setUnits] = useState("Metric");

  return (
    <section className="settings-page">
      <h1 className="screen-title">Settings</h1>
      <p className="screen-subtitle">
        Adjust your workout preferences.
      </p>

      <section className="card settings-section">
        <h2>Workout preferences</h2>

        <label className="setting-row">
          <span>
            <strong>Workout reminders</strong>
            <small>Enable reminders to stay consistent.</small>
          </span>
          <input
            type="checkbox"
            checked={reminders}
            onChange={(event) => setReminders(event.target.checked)}
          />
        </label>

        <div className="setting-row">
          <span>
            <strong>Weekly workout goal</strong>
            <small>How many workouts you plan to complete.</small>
          </span>
          <select
            value={weeklyGoal}
            onChange={(event) => setWeeklyGoal(event.target.value)}
          >
            <option value="3">3 workouts</option>
            <option value="4">4 workouts</option>
            <option value="5">5 workouts</option>
            <option value="6">6 workouts</option>
            <option value="7">7 workouts</option>
          </select>
        </div>

        <div className="setting-row">
          <span>
            <strong>Measurement units</strong>
            <small>Choose your preferred units.</small>
          </span>
          <select
            value={units}
            onChange={(event) => setUnits(event.target.value)}
          >
            <option>Metric</option>
            <option>Imperial</option>
          </select>
        </div>
      </section>

      <section className="card settings-section">
        <h2>Account</h2>
        <p>
          Account and sign-in features can be connected to a backend when
          you're ready to add real user accounts.
        </p>
      </section>
    </section>
  );
}

export default Settings;
