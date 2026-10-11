
import { useEffect, useRef, useState } from "react"
import Matter from "matter-js"

function Jar({ goals }) {
  const [tiltEnabled, setTiltEnabled] = useState(false)


  const sceneRef = useRef(null)
  const engineRef = useRef(null)
  const runnerRef = useRef(null)
  const bodiesRef = useRef(new Map())
  const elementsRef = useRef(new Map())
  const settleTimerRef = useRef(null)

  // Physics world and jar-shaped collision walls
  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return

    const engine = Matter.Engine.create()
    engine.gravity.x = 0
    engine.gravity.y = 1.1
    engine.enableSleeping = true
    engineRef.current = engine

    // Coordinates follow the inside of the jam jar.
    // The top is closed so goals remain inside when inverted.
    const outline = [
      { x: 112, y: 10 },
      { x: 228, y: 10 },
      { x: 230, y: 28 },
      { x: 250, y: 35 },
      { x: 276, y: 55 },
      { x: 300, y: 83 },
      { x: 317, y: 119 },
      { x: 324, y: 160 },
      { x: 320, y: 207 },
      { x: 306, y: 245 },
      { x: 281, y: 271 },
      { x: 251, y: 286 },
      { x: 89, y: 286 },
      { x: 59, y: 271 },
      { x: 34, y: 245 },
      { x: 20, y: 207 },
      { x: 16, y: 160 },
      { x: 23, y: 119 },
      { x: 40, y: 83 },
      { x: 64, y: 55 },
      { x: 90, y: 35 },
      { x: 110, y: 28 },
    ]

    const walls = []

    for (let i = 0; i < outline.length; i++) {
      const a = outline[i]
      const b = outline[(i + 1) % outline.length]
      const dx = b.x - a.x
      const dy = b.y - a.y
      const length = Math.hypot(dx, dy)
      const angle = Math.atan2(dy, dx)

      const wall = Matter.Bodies.rectangle(
        (a.x + b.x) / 2,
        (a.y + b.y) / 2,
        length + 8,
        9,
        {
          isStatic: true,
          angle,
          restitution: 0.05,
          friction: 0.3,
          frictionStatic: 0.45,
        }
      )

      walls.push(wall)
    }

    Matter.World.add(engine.world, walls)

    const update = () => {
      bodiesRef.current.forEach((body, id) => {
        const element = elementsRef.current.get(id)
        if (!element) return

        element.style.left = `${body.position.x}px`
        element.style.top = `${body.position.y}px`
        element.style.transform =
          `translate(-50%, -50%) rotate(${body.angle}rad)`
      })

      let settled = true

      bodiesRef.current.forEach((body) => {
        if (
          Matter.Vector.magnitude(body.velocity) > 0.08 ||
          Math.abs(body.angularVelocity) > 0.015
        ) {
          settled = false
        }
      })

      if (settled && bodiesRef.current.size > 0) {
        if (!settleTimerRef.current) {
          settleTimerRef.current = setTimeout(() => {
            bodiesRef.current.forEach((body) => {
              Matter.Sleeping.set(body, true)
            })
            settleTimerRef.current = null
          }, 400)
        }
      } else if (settleTimerRef.current) {
        clearTimeout(settleTimerRef.current)
        settleTimerRef.current = null
      }
    }

    Matter.Events.on(engine, "afterUpdate", update)

    const runner = Matter.Runner.create()
    runnerRef.current = runner
    Matter.Runner.run(runner, engine)

    return () => {
      Matter.Events.off(engine, "afterUpdate", update)
      Matter.Runner.stop(runner)

      if (settleTimerRef.current) {
        clearTimeout(settleTimerRef.current)
        settleTimerRef.current = null
      }

      elementsRef.current.forEach((element) => element.remove())
      elementsRef.current.clear()
      bodiesRef.current.clear()

      Matter.World.clear(engine.world, false)
      Matter.Engine.clear(engine)

      engineRef.current = null
      runnerRef.current = null
    }
  }, [])

  // Device tilt
  useEffect(() => {
    if (!tiltEnabled) return

    const handleTilt = (event) => {
      const beta = event.beta ?? 0
      const gamma = event.gamma ?? 0

      const x = Math.max(-1, Math.min(1, gamma / 45))
      const y = Math.max(-1, Math.min(1, beta / 45))
      const engine = engineRef.current

      if (engine) {
        engine.gravity.x = x * 1.8
        engine.gravity.y = y * 1.8

        bodiesRef.current.forEach((body) => {
          Matter.Sleeping.set(body, false)
        })
      }

      setTiltDebug({
        beta,
        gamma,
        gravityY: engine?.gravity.y ?? 1.1,
      })
    }

    window.addEventListener("deviceorientation", handleTilt)

    return () => {
      window.removeEventListener("deviceorientation", handleTilt)

      if (engineRef.current) {
        engineRef.current.gravity.x = 0
        engineRef.current.gravity.y = 1.1
      }
    }
  }, [tiltEnabled])

  // Add new completed goals to the jar
  useEffect(() => {
    const scene = sceneRef.current
    const engine = engineRef.current
    if (!scene || !engine) return

    const sizeMap = {
      small: { radius: 15, fontSize: 30 },
      medium: { radius: 21, fontSize: 43 },
      large: { radius: 27, fontSize: 55 },
    }

    goals.forEach((goal) => {
      if (bodiesRef.current.has(goal.id)) return

      const size = sizeMap[goal.size] || sizeMap.medium
      const startX = 75 + Math.random() * 190
      const startY = 100 + Math.random() * 35

      const body = Matter.Bodies.circle(
        startX,
        startY,
        size.radius,
        {
          restitution: 0.22,
          friction: 0.2,
          frictionStatic: 0.35,
          frictionAir: 0.012,
          density: 0.0015,
          sleepThreshold: 60,
        }
      )

      Matter.Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 2.8,
        y: 1 + Math.random() * 1.5,
      })

      Matter.Body.setAngularVelocity(
        body,
        (Math.random() - 0.5) * 0.12
      )

      Matter.World.add(engine.world, body)

      const element = document.createElement("div")
      element.className = `physics-item ${goal.size || "medium"}`
      element.textContent = goal.emoji
      element.style.fontSize = `${size.fontSize}px`
      scene.appendChild(element)

      bodiesRef.current.set(goal.id, body)
      elementsRef.current.set(goal.id, element)
    })
  }, [goals])

  const enableTilt = async () => {
    try {
      if (
        typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function"
      ) {
        const permission =
          await DeviceOrientationEvent.requestPermission()

        if (permission !== "granted") {
          alert("Motion permission was not granted.")
          return
        }
      }

      setTiltEnabled(true)
    } catch (error) {
      console.error(error)
      alert("Could not access motion sensors.")
    }
  }

  return (
    <div className="jar-wrapper">

      <button
        className={`tilt-button ${tiltEnabled ? "enabled" : ""}`}
        onClick={enableTilt}
      >
        {tiltEnabled ? "Tilt on" : "Tilt jar"}
      </button>

      <div className="jar-neck" aria-hidden="true" />

      <div className="jar">
        <div className="jar-glow" />
        <div className="jar-bottom-glow" />
        <div className="physics-scene" ref={sceneRef} />
      </div>

      <div className="jar-lid" aria-hidden="true">
        <div className="cork" />
        <div className="twine-wrap" />
        <div className="twine-bow">
          <span className="bow-loop bow-loop-left" />
          <span className="bow-knot" />
          <span className="bow-loop bow-loop-right" />
          <span className="bow-tail bow-tail-left" />
          <span className="bow-tail bow-tail-right" />
        </div>
      </div>
    </div>
  )
}

export default Jar