import "./templateDashboard.css";

function NavDashboard() {
  return (
    <div className="Top-navigation">
      <div className="brandImgContainer">
        <img src="" alt="Aeroutine Logo" className="brandImg" />
      </div>
      <h6 className="brandName">Aeroutine</h6>
      <div className="NavLinks">
        <button className="navItem">Overview</button>
        <button className="navItem">Workouts</button>
        <button className="navItem">History</button>
        <button className="navItem">Progress</button>
      </div>
      <div className="accountControls">
        <div className="streakContainer">
          <div className="streakImgContainer">
            <img src="" alt="" className="streakImg" />
          </div>
          <h6 className="label">- Day Streak</h6>
        </div>
      </div>
      <div className="bellImgContainer">
        <img src="" alt="" className="bellImg" />
      </div>
      <a href="" className="pfpContainer">
        <img src="" alt="" className="pfp" />
      </a>
    </div>
  );
}

export default NavDashboard;
