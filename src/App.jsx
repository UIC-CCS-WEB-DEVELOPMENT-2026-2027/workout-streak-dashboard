
import { useState } from "react"; // For Screen selector
import "./index.css";


import NavDashboard from "./components/DashboardOverview/NavDashboard";
import BodyDashboard from "./components/DashboardOverview/BodyDashboard";
import SignandLog from "./components/authentication/SignandLog";
import WorkOut from "./components/WorkoutSelection/WorkOut";
import WorkOutAct from "./components/WorkoutSession/WorkOutAct";
import HistoryAct from "./components/WorkoutHistory/HistoryAct";
import WorkoutLog from "./components/WorkoutLogging/WorkoutLog";
import Progress from "./components/Progress/Progress";
import Settings from "./components/Settings/Settings";
import WorkoutSummary from "./components/WorkoutSession/WorkoutSummary";

function App() {
  // Sets Navdashboard as the main screen.
  const [currentScreen, setCurrentScreen] = useState("NavDashboard");
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  const navigate = (screen, data = null) => {
    if (data) {
      setSelectedWorkout(data);
    }
    setCurrentScreen(screen);
  };

  //Screen connector to components
  const screenComponents = {
    NavDashboard,
    BodyDashboard,
    SignandLog,
    WorkOut,
    WorkOutAct,
    WorkoutSummary,
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
            selectedWorkout={selectedWorkout}
          />
        </main>
      )}
    </div>
  );
}

export default App;
