import "./signandLog.css";
import { useState } from "react";

function SignandLog({ onNavigate }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setMessage(
      "This is a demo sign-in form. Real authentication needs an account service."
    );
  }

  return (
    <section className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <div className="auth-brand">
          <span className="brand-mark"><img src="Logo.png" alt="Logo"></img></span>
          Aeroutine
        </div>

        <h1>Welcome back.</h1>
        <p className="screen-subtitle">
          Sign in to continue your movement journey.
        </p>

        <div className="form-field">
          <label htmlFor="login-email">Email address</label>
          <input
            id="login-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        {message && <p className="auth-message">{message}</p>}

        <button className="primary-button auth-submit" type="submit">
          Sign in
        </button>

        <button
          className="auth-back"
          type="button"
          onClick={() => onNavigate("NavDashboard")}
        >
          Return to Overview
        </button>
      </form>
    </section>
  );
}

export default SignandLog;
