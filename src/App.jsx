
import { useState } from "react"; // For Screen selector
import "./index.css";

import NavDashboard from "./components/NavDashboard";
import BodyDashboard from "./components/BodyDashboard";
import SignandLog from "./components/SignandLog";
import WorkOut from "./components/WorkOut";
import WorkOutAct from "./components/WorkOutAct";
import HistoryAct from "./components/HistoryAct";
import WorkoutLog from "./components/WorkoutLog";
import Progress from "./components/Progress";
import Settings from "./components/Settings";

function App() {
  // Sets Navdashboard as the main screen.
  const [currentScreen, setCurrentScreen] = useState("NavDashboard");

  // Screen changer(navigation)
  const navigate = (screen) => {
    setCurrentScreen(screen);
  };

  //Screen connector to components
  const screenComponents = {
    NavDashboard,
    BodyDashboard,
    SignandLog,
    WorkOut,
    WorkOutAct,
    HistoryAct,
    WorkoutLog,
    Progress,
    Settings,
  };

  const Screen = screenComponents[currentScreen];

  return (
    <div className="app">
      <NavDashboard //Main Nav Header(Visible-to-all-components)
        currentScreen={currentScreen}
        onNavigate={navigate}
      />

      {currentScreen !== "NavDashboard" && ( //Other Components screen display
        <main className="screen-content">
          <Screen
            onNavigate={navigate}
            currentScreen={currentScreen}
          />
        </main>
      )}
    </div>
  );
}

export default App;
