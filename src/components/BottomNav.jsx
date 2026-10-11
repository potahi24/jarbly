
import { useState } from "react"

function BottomNav({ currentPage, onNavigate }) {
  const [expanded, setExpanded] = useState(false)

  const chooseOption = (page) => {
    setExpanded(false)
    onNavigate(page)
  }

  return (
    <nav className="bottom-nav">
      <button
        className={
          currentPage === "home"
            ? "nav-item active"
            : "nav-item"
        }
        onClick={() => {
          setExpanded(false)
          onNavigate("home")
        }}
      >
        <span className="nav-icon">⌂</span>
        <span>Home</span>
      </button>
      

      <div className={`add-menu ${expanded ? "expanded" : ""}`}>
        <div className="add-menu-options">
          <button
            className="add-menu-option quick-option"
            onClick={() => chooseOption("quick-add")}
            tabIndex={expanded ? 0 : -1}
          >
            <span className="option-icon">✨</span>
            <span>Quick Add</span>
          </button>

          <button
            className="add-menu-option task-option"
            onClick={() => chooseOption("task-add")}
            tabIndex={expanded ? 0 : -1}
          >
            <span className="option-icon">☑</span>
            <span>Create a Task</span>
          </button>
        </div>

        <button
          className={`nav-item add-button ${expanded ? "rotated" : ""}`}
          onClick={() => setExpanded((value) => !value)}
          aria-label={expanded ? "Close add menu" : "Open add menu"}
          aria-expanded={expanded}
        >
          <span className="plus-icon">+</span>
        </button>
      </div>

      <button
        className={
          currentPage === "tasks"
            ? "nav-item active"
            : "nav-item"
        }
        onClick={() => {
          setExpanded(false)
          onNavigate("tasks")
        }}
      >
        <span className="nav-icon">☑</span>
        <span>Tasks</span>
      </button>
    </nav>
  )
}

export default BottomNav