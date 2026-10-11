import { useState } from "react"

function AddGoal({ onAdd, onBack }) {
  const [title, setTitle] = useState("")
  const [emoji, setEmoji] = useState("✨")
  const [size, setSize] = useState("small")
  const [period, setPeriod] = useState("today")

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!title.trim()) return

    onAdd({
      id: Date.now(),
      title: title.trim(),
      emoji,
      size,
      period,
      completed: false,
    })

    onBack()
  }

  return (
    <section className="add-goal-page">
      <button className="back-button" onClick={onBack}>
        ← Back
      </button>

      <div className="add-goal-card">
        <h1>Add a little win ✨</h1>
        <p className="add-goal-subtitle">
          What do you want to put in your jar?
        </p>

        <form onSubmit={handleSubmit}>
          <label>Goal</label>

          <input
            type="text"
            placeholder="e.g. Read 20 pages"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />

          <label>Emoji</label>

          <div className="emoji-picker">
            {["✨", "📚", "🍓", "🦷", "🧪", "🏃", "🎨", "🎓"].map(
              (item) => (
                <button
                  type="button"
                  key={item}
                  className={emoji === item ? "emoji-option selected" : "emoji-option"}
                  onClick={() => setEmoji(item)}
                >
                  {item}
                </button>
              )
            )}
          </div>

          <label>Size</label>

          <div className="choice-row">
            {[
              ["small", "Small"],
              ["medium", "Medium"],
              ["large", "Big"],
            ].map(([value, label]) => (
              <button
                type="button"
                key={value}
                className={size === value ? "choice selected" : "choice"}
                onClick={() => setSize(value)}
              >
                {label}
              </button>
            ))}
          </div>

          <label>When?</label>

          <div className="choice-row">
            {[
              ["today", "Today"],
              ["week", "This Week"],
              ["month", "This Month"],
            ].map(([value, label]) => (
              <button
                type="button"
                key={value}
                className={period === value ? "choice selected" : "choice"}
                onClick={() => setPeriod(value)}
              >
                {label}
              </button>
            ))}
          </div>

          <button className="submit-goal" type="submit">
            Add to Jar 🫙
          </button>
        </form>
      </div>
    </section>
  )
}

export default AddGoal