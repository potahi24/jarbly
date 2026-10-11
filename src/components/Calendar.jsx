
import { useState } from "react"

function getDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function Calendar({ todos }) {
  const today = new Date()

  const [selectedDate, setSelectedDate] = useState(
    getDateKey(today)
  )

  const [displayMonth, setDisplayMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  )

  const year = displayMonth.getFullYear()
  const month = displayMonth.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const completedTodos = todos.filter(
    (todo) => todo.completed && todo.completedAt
  )

  const getWinsForDate = (dateKey) =>
    completedTodos.filter(
      (todo) =>
        getDateKey(new Date(todo.completedAt)) === dateKey
    )

  const selectedWins = getWinsForDate(selectedDate)

  const changeMonth = (amount) => {
    setDisplayMonth(new Date(year, month + amount, 1))
  }

  const monthName = displayMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  return (
    <section className="calendar-page">
      <header className="calendar-header">
        <h1>My Memories 🫙</h1>
        <p>Every little win deserves to be remembered.</p>
      </header>

      <section className="calendar-card">
        <div className="calendar-month">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            aria-label="Previous month"
          >
            ‹
          </button>

          <h2>{monthName}</h2>

          <button
            type="button"
            onClick={() => changeMonth(1)}
            aria-label="Next month"
          >
            ›
          </button>
        </div>

        <div className="calendar-grid">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
            (day) => (
              <div className="calendar-weekday" key={day}>
                {day}
              </div>
            )
          )}

          {Array.from({ length: firstDay }, (_, index) => (
            <div className="calendar-empty" key={`empty-${index}`} />
          ))}

          {Array.from({ length: daysInMonth }, (_, index) => {
            const day = index + 1
            const dateKey = getDateKey(
              new Date(year, month, day)
            )
            const winCount = getWinsForDate(dateKey).length
            const isSelected = selectedDate === dateKey
            const isToday = getDateKey(today) === dateKey

            return (
              <button
                type="button"
                key={dateKey}
                className={[
                  "calendar-day",
                  isSelected ? "selected" : "",
                  isToday ? "today" : "",
                  winCount > 0 ? "has-wins" : "",
                ].filter(Boolean).join(" ")}
                onClick={() => setSelectedDate(dateKey)}
                aria-pressed={isSelected}
                aria-label={`${dateKey}, ${winCount} completed wins`}
              >
                <span>{day}</span>
                {winCount > 0 && (
                  <span className="calendar-day-dot">
                    {winCount > 9 ? "9+" : winCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div className="calendar-legend">
          <span className="legend-dot" />
          Days with little wins ✨
        </div>
      </section>

      <section className="day-memories">
        <div className="day-memories-header">
          <div>
            <h2>
              {new Date(`${selectedDate}T12:00:00`).toLocaleDateString(
                "en-US",
                {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }
              )}
            </h2>
            <p>
              {selectedWins.length === 0
                ? "Every day is a fresh start 🌱"
                : `${selectedWins.length} little ${
                    selectedWins.length === 1 ? "win" : "wins"
                  } collected ✨`}
            </p>
          </div>
        </div>

        <div className="memory-jar" aria-label="Wins from this day">
          {selectedWins.length === 0 ? (
            <div className="memory-empty">
              <span>🫙</span>
              <p>No wins collected on this day yet.</p>
            </div>
          ) : (
            <div className="memory-emoji-list">
              {selectedWins.map((win) => (
                <span
                  className={`memory-emoji size-${win.size || "small"}`}
                  key={win.id}
                  title={win.title}
                >
                  {win.emoji}
                </span>
              ))}
            </div>
          )}
        </div>

        {selectedWins.length > 0 && (
          <div className="memory-list">
            {selectedWins.map((win) => (
              <article className="memory-item" key={win.id}>
                <span className="memory-item-emoji">
                  {win.emoji}
                </span>
                <div>
                  <strong>{win.title}</strong>
                  <small>
                    {new Date(win.completedAt).toLocaleTimeString(
                      "en-US",
                      {
                        hour: "numeric",
                        minute: "2-digit",
                      }
                    )}
                  </small>
                </div>
                <span className="memory-check">✓</span>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  )
}

export default Calendar