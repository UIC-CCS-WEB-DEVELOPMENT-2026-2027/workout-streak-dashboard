//file name: WorkOut.jsx
import { useRef, useState } from "react";
import "./workOut.css";

// Only exercises the camera tracker can score
const EXERCISE_CATALOG = [
  { name: "Jumping jacks", type: "Full body", targetReps: 50 },
  { name: "Squats", type: "Lower body", targetReps: 30 },
  { name: "Bicep Curl", type: "Upper body", targetReps: 20 },
];

const INITIAL_WORKOUTS = [
  { id: 1, ...EXERCISE_CATALOG[0] },
  { id: 2, ...EXERCISE_CATALOG[1] },
];

const clampReps = (value) => Math.min(999, Math.max(1, Math.round(Number(value)) || 1));

function WorkOut({ onNavigate }) {
  const [workouts, setWorkouts] = useState(INITIAL_WORKOUTS);

  // Edit reps
  const [editingId, setEditingId] = useState(null);
  const [draftReps, setDraftReps] = useState("");

  // Add exercise
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState(EXERCISE_CATALOG[0].name);
  const [newReps, setNewReps] = useState(EXERCISE_CATALOG[0].targetReps);

  // Reorder (pointer-based so it works on touch screens too)
  const [dragIndex, setDragIndex] = useState(null);
  const [dropIndex, setDropIndex] = useState(null);
  const rowRefs = useRef([]);

  const startEdit = (w) => {
    setEditingId(w.id);
    setDraftReps(String(w.targetReps));
  };

  const saveEdit = (id) => {
    setWorkouts((list) =>
      list.map((w) => (w.id === id ? { ...w, targetReps: clampReps(draftReps) } : w))
    );
    setEditingId(null);
  };

  const removeWorkout = (id) => {
    setWorkouts((list) => list.filter((w) => w.id !== id));
    setEditingId(null);
  };

  const handleCatalogChange = (name) => {
    const option = EXERCISE_CATALOG.find((e) => e.name === name);
    setNewName(name);
    setNewReps(option.targetReps);
  };

  const addWorkout = () => {
    const option = EXERCISE_CATALOG.find((e) => e.name === newName);
    setWorkouts((list) => [
      ...list,
      { id: Date.now(), name: option.name, type: option.type, targetReps: clampReps(newReps) },
    ]);
    setShowAdd(false);
  };

  const handleHandleDown = (e, index) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragIndex(index);
    setDropIndex(index);
  };

  const handleHandleMove = (e) => {
    if (dragIndex === null) return;
    // Count rows whose midpoint is above the pointer to find the drop slot
    let rowsAbove = 0;
    rowRefs.current.forEach((el) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.top + rect.height / 2 < e.clientY) rowsAbove++;
    });
    setDropIndex(Math.max(0, Math.min(rowsAbove - 1, workouts.length - 1)));
  };

  const handleHandleUp = () => {
    if (dragIndex !== null && dropIndex !== null && dragIndex !== dropIndex) {
      setWorkouts((list) => {
        const next = [...list];
        const [moved] = next.splice(dragIndex, 1);
        next.splice(dropIndex, 0, moved);
        return next;
      });
    }
    setDragIndex(null);
    setDropIndex(null);
  };

  // Full list in order -> camera tracks each exercise in sequence
  const startList = () => onNavigate("WorkOutAct", { isList: true, exercises: workouts });

  // Single exercise -> camera tracks only this one
  const startSingle = (workout) =>
    onNavigate("WorkOutAct", { isList: false, exercises: [workout] });

  return (
    <section className="workout-page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
        <div>
          <h1 className="screen-title">Your workouts</h1>
          <p className="screen-subtitle">Choose a movement and get started.</p>
        </div>
        <button
          className="primary-button"
          aria-label="Add exercise"
          onClick={() => setShowAdd((v) => !v)}
          style={{ width: 44, height: 44, borderRadius: 22, padding: 0, fontSize: 24, lineHeight: 1, flexShrink: 0 }}
        >
          +
        </button>
      </div>

      {showAdd && (
        <div
          className="card"
          style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", padding: 16, marginBottom: 16 }}
        >
          <select value={newName} onChange={(e) => handleCatalogChange(e.target.value)}>
            {EXERCISE_CATALOG.map((e) => (
              <option key={e.name} value={e.name}>{e.name}</option>
            ))}
          </select>
          <input
            type="number"
            min={1}
            max={999}
            value={newReps}
            onChange={(e) => setNewReps(e.target.value)}
            style={{ width: 90 }}
            aria-label="Target reps"
          />
          <span>reps</span>
          <button className="primary-button" onClick={addWorkout}>Add</button>
          <button className="secondary-button" onClick={() => setShowAdd(false)}>Cancel</button>
        </div>
      )}

      <div className="workout-intro">
        <div>
          <span>YOUR NEXT SMALL WIN</span>
          <h2>Ready to move?</h2>
          <p>Every rep counts. Build your routine one workout at a time.</p>
        </div>
        <button className="primary-button" disabled={!workouts.length} onClick={startList}>
          ▶ Start workout
        </button>
      </div>

      <div className="workout-list">
        {workouts.map((workout, index) => {
          const isEditing = editingId === workout.id;
          const isDropTarget = dragIndex !== null && dropIndex === index && dragIndex !== index;

          return (
            <article
              key={workout.id}
              ref={(el) => (rowRefs.current[index] = el)}
              className="card workout-option"
              style={{
                opacity: dragIndex === index ? 0.5 : 1,
                borderTop: isDropTarget ? "2px solid #5b5ce2" : undefined,
              }}
            >
              <div
                onPointerDown={(e) => handleHandleDown(e, index)}
                onPointerMove={handleHandleMove}
                onPointerUp={handleHandleUp}
                onPointerCancel={handleHandleUp}
                aria-label="Drag to reorder"
                style={{
                  cursor: "grab", touchAction: "none", userSelect: "none",
                  padding: "0 6px", fontSize: 20, color: "#8791aa",
                }}
              >
                ☰
              </div>

              <div className="workout-symbol">✳</div>

              <div className="workout-option-info" style={{ flex: 1 }}>
                <h3>{index + 1}. {workout.name}</h3>
                <p>{workout.type} · Goal: {workout.targetReps} reps</p>
              </div>

              {isEditing ? (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    type="number"
                    min={1}
                    max={999}
                    value={draftReps}
                    onChange={(e) => setDraftReps(e.target.value)}
                    style={{ width: 70 }}
                    aria-label="Target reps"
                  />
                  <button className="secondary-button" onClick={() => saveEdit(workout.id)}>Save</button>
                  <button
                    className="secondary-button"
                    onClick={() => removeWorkout(workout.id)}
                    style={{ color: "#ef4444" }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="secondary-button" onClick={() => startEdit(workout)}>Edit</button>
                  <button className="secondary-button" onClick={() => startSingle(workout)}>Start</button>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default WorkOut;