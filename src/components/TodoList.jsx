
function TodoList({ todos, onToggle }) {
  const activeTodos = todos.filter((todo) => !todo.completed)
  const completedTodos = todos.filter((todo) => todo.completed)

  return (
    <section className="todo-page">
      <div className="todo-header">
        <h1>My Tasks</h1>
        <p>Little steps, little wins ✨</p>
      </div>

      <section className="todo-section">
        <h2>To do · {activeTodos.length}</h2>

        {activeTodos.length === 0 ? (
          <p className="todo-empty">
            Nothing here yet. Enjoy the moment 🌷
          </p>
        ) : (
          activeTodos.map((todo) => (
            <label className="todo-item" key={todo.id}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => onToggle(todo.id)}
              />

              <span className="todo-emoji">{todo.emoji}</span>

              <span className="todo-title">
                {todo.title}
                <small>
                  {todo.size} · {todo.period}
                </small>
              </span>
            </label>
          ))
        )}
      </section>

      {completedTodos.length > 0 && (
        <section className="todo-section completed-section">
          <h2>Completed · {completedTodos.length}</h2>

          {completedTodos.map((todo) => (
            <label className="todo-item completed-item" key={todo.id}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => onToggle(todo.id)}
              />

              <span className="todo-emoji">{todo.emoji}</span>

              <span className="todo-title">
                {todo.title}
                <small>Added to your wins ✨</small>
              </span>
            </label>
          ))}
        </section>
      )}
    </section>
  )
}

export default TodoList