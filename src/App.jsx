import { useEffect, useState } from "react"
import Jar from "./components/Jar"
import BottomNav from "./components/BottomNav"
import AddGoal from "./components/AddGoal"
import TodoList from "./components/TodoList"
import Calendar from "./components/Calendar"

function App() {
  const [currentPage, setCurrentPage] = useState("home")
  
const [todos, setTodos] = useState(() => {
      try {
        const saved = localStorage.getItem("jarbly-todos")
        return saved ? JSON.parse(saved) : []
      } catch {
        return []
      }
    })

    useEffect(() => {
      try {
        localStorage.setItem("jarbly-todos", JSON.stringify(todos))
      } catch (error) {
        console.error("Failed to save Jarbly data:", error)
      }
    }, [todos])

  const addGoal = (goal) => {
    setTodos((currentTodos) => [
      ...currentTodos,
      {
        ...goal,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
      },
    ])
  }

  const addQuickWin = (goal) => {
    const now = new Date().toISOString()

    setTodos((currentTodos) => [
      ...currentTodos,
      {
        ...goal,
        completed: true,
        createdAt: now,
        completedAt: now,
      },
    ])
  }

  const toggleTodo = (id) => {
    setTodos((currentTodos) =>
      currentTodos.map((todo) => {
        if (todo.id !== id) return todo

        const completing = !todo.completed

        return {
          ...todo,
          completed: completing,
          completedAt: completing
            ? new Date().toISOString()
            : null,
        }
      })
    )
  }

  const wins = todos.filter((todo) => todo.completed)

  return (
    <main className="app">
      
      {currentPage === "home" && (
        <section className="home-page">
          <button
            className="home-calendar-button"
            onClick={() => setCurrentPage("calendar")}
            aria-label="Open calendar"
          >
            <span>▦</span>
          </button>

          <Jar goals={wins} />
        </section>
      )}

      {currentPage === "add-choice" && (
        <section className="add-choice-page">
          <button
            className="back-button"
            onClick={() => setCurrentPage("home")}
          >
            ← Back
          </button>

          <div className="add-choice-content">
            <h1>What would you like to do?</h1>
            <p>Choose your little win ✨</p>

            <button
              className="add-choice-card"
              onClick={() => setCurrentPage("quick-add")}
            >
              <span className="add-choice-icon">✨</span>
              <span className="add-choice-text">
                <strong>Quick Add</strong>
                <small>Put a win in your jar right away</small>
              </span>
              <span className="add-choice-arrow">›</span>
            </button>

            <button
              className="add-choice-card"
              onClick={() => setCurrentPage("task-add")}
            >
              <span className="add-choice-icon">☑</span>
              <span className="add-choice-text">
                <strong>Create a Task</strong>
                <small>Plan something to do later</small>
              </span>
              <span className="add-choice-arrow">›</span>
            </button>
          </div>
        </section>
      )}

      {currentPage === "quick-add" && (
        <AddGoal
          onAdd={addQuickWin}
          onBack={() => setCurrentPage("home")}
        />
      )}

      {currentPage === "task-add" && (
        <AddGoal
          onAdd={addGoal}
          onBack={() => setCurrentPage("tasks")}
        />
      )}

      {currentPage === "calendar" && (
        <Calendar todos={todos} />
      )}

      
      {currentPage === "tasks" && (
        <TodoList
          todos={todos}
          onToggle={toggleTodo}
        />
      )}

      <BottomNav
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />
    </main>
  )
}

export default App