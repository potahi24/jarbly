import { useEffect, useRef, useState } from "react"
import Matter from "matter-js"


function Jar({ goals }) {
  const [tiltEnabled, setTiltEnabled] = useState(false)
  const [tiltDebug, setTiltDebug] = useState({
          beta: null,
          gamma: null,
          gravityY: null,
        })
  const sceneRef = useRef(null)

  const engineRef = useRef(null)
  const runnerRef = useRef(null)

  const bodiesRef = useRef(new Map())
  const elementsRef = useRef(new Map())

  const settleTimerRef = useRef(null)

  // Physics world 생성
  useEffect(() => {
    const scene = sceneRef.current

    if (!scene) return

    const engine = Matter.Engine.create()

    engine.gravity.y = 1.1
    engine.gravity.x = 0
    

    engineRef.current = engine

    const width = 340
    const height = 300

    const walls = []

    /*
      =========================
      Jar collision boundaries
      =========================

      위쪽은 열어두고,
      아래쪽으로 갈수록 Jar 안쪽을 감싸도록 구성.
    */

    // Jar 바닥
    
    // Jar 입구 위쪽 안전벽
    walls.push(
      Matter.Bodies.rectangle(
        width / 2,
        155,
        240,
        12,
        {
          isStatic: true,
          restitution: 0.25,
          friction: 0.8,
        }
      )
    )
    // 왼쪽 아래 벽
    walls.push(
    Matter.Bodies.rectangle(
        42,
        230,
        18,
        145,
        {
        isStatic: true,
        angle: -0.12,
        restitution: 0.3,
        friction: 0.6,
        }
    )
    )

    // 오른쪽 아래 벽
    walls.push(
    Matter.Bodies.rectangle(
        width - 42,
        230,
        18,
        145,
        {
        isStatic: true,
        angle: 0.12,
        restitution: 0.3,
        friction: 0.6,
        }
    )
    )

    // Jar 바닥
    walls.push(
    Matter.Bodies.rectangle(
        width / 2,
        height - 12,
        300,
        24,
        {
        isStatic: true,
        restitution: 0.25,
        friction: 0.8,
        }
    )
    )

    const safetyLeft = Matter.Bodies.rectangle(
      -5,
      height / 2,
      10,
      height,
      {
        isStatic: true,
        restitution: 0.2,
      }
    )

    const safetyRight = Matter.Bodies.rectangle(
      width + 5,
      height / 2,
      10,
      height,
      {
        isStatic: true,
        restitution: 0.2,
      }
    )

    Matter.World.add(engine.world, [
      ...walls,
      safetyLeft,
      safetyRight,
    ])

    /*
      =========================
      Physics → DOM synchronization
      =========================
    */

    const update = () => {
      bodiesRef.current.forEach((body, id) => {
        const element = elementsRef.current.get(id)

        if (!element) return

        element.style.left = `${body.position.x}px`
        element.style.top = `${body.position.y}px`

        element.style.transform =
          `translate(-50%, -50%) rotate(${body.angle}rad)`
      })

      /*
        거의 움직이지 않는 상태가 일정 시간
        유지되면 body를 완전히 sleep시킴.

        덕분에 Goal이 많이 쌓여도
        마지막에 계속 부들부들 떨지 않음.
      */

      let allSettled = true

      bodiesRef.current.forEach((body) => {
        const speed = Matter.Vector.magnitude(body.velocity)
        const rotationSpeed = Math.abs(body.angularVelocity)

        if (speed > 0.08 || rotationSpeed > 0.01) {
          allSettled = false
        }
      })

      if (allSettled && bodiesRef.current.size > 0) {
        if (!settleTimerRef.current) {
          settleTimerRef.current = setTimeout(() => {
            bodiesRef.current.forEach((body) => {
              Matter.Sleeping.set(body, true)
            })

            settleTimerRef.current = null
          }, 250)
        }
      } else {
        if (settleTimerRef.current) {
          clearTimeout(settleTimerRef.current)
          settleTimerRef.current = null
        }
      }
    }

    Matter.Events.on(
      engine,
      "afterUpdate",
      update
    )

    /*
      =========================
      Matter runner
      =========================
    */

    const runner = Matter.Runner.create()

    runnerRef.current = runner

    Matter.Runner.run(
      runner,
      engine
    )

    /*
      =========================
      Cleanup
      =========================
    */

    return () => {

      Matter.Events.off(
        engine,
        "afterUpdate",
        update
      )

      Matter.Runner.stop(runner)

      if (settleTimerRef.current) {
        clearTimeout(
          settleTimerRef.current
        )

        settleTimerRef.current = null
      }

      // 실제 화면의 아이콘 제거
      elementsRef.current.forEach(
        (element) => {
          element.remove()
        }
      )

      elementsRef.current.clear()
      bodiesRef.current.clear()

      Matter.World.clear(
        engine.world,
        false
      )

      Matter.Engine.clear(engine)

      engineRef.current = null
      runnerRef.current = null
    }
  }, [])

  useEffect(() => {
  if (!tiltEnabled) return

 
  
const handleTilt = (event) => {
  const gamma = event.gamma ?? 0
  const beta = event.beta ?? 0

  const x = Math.max(-1, Math.min(1, gamma / 45))
  const y = Math.max(-1, Math.min(1, beta / 45))

  if (engineRef.current) {
    engineRef.current.gravity.x = x * 1.8
    engineRef.current.gravity.y = Math.max(
      -1.2,
      Math.min(1.8, 1.1 + y * 2.0)
    )

    setTiltDebug({
      beta,
      gamma,
      gravityY: engineRef.current.gravity.y,
    })

    bodiesRef.current.forEach((body) => {
      Matter.Sleeping.set(body, false)
    })
  }
}

  window.addEventListener(
    "deviceorientation",
    handleTilt
  )

  return () => {
    window.removeEventListener(
      "deviceorientation",
      handleTilt
    )

    if (engineRef.current) {
      engineRef.current.gravity.x = 0
    }
  }
}, [tiltEnabled])

  /*
    =========================
    새로운 Goal만 Physics world에 추가
    =========================
  */

  useEffect(() => {
    const scene = sceneRef.current
    const engine = engineRef.current

    if (!scene || !engine) return

    const sizeMap = {
      small: 17,
      medium: 23,
      large: 31,
    }

    goals.forEach((goal) => {
      /*
        이미 Physics world에 존재하는 Goal이면
        절대로 다시 만들지 않음.

        → ghost icon 방지
      */

      if (bodiesRef.current.has(goal.id)) {
        return
      }

      const radius =
        sizeMap[goal.size] || 23

      /*
        Jar 입구 위에서 랜덤한 위치로 시작
      */

      
      const startX =
        65 + Math.random() * 210

      const startY =
        190 + Math.random() * 30

      /*
        Goal의 물리 body
      */

      const body =
        Matter.Bodies.circle(
          startX,
          startY,
          radius,
          {
            restitution: 0.65,
            friction: 0.35,
            frictionAir: 0.005,
            density: 0.002,

            // 충분히 안정되면 Matter가
            // body를 자동으로 sleep시킬 수 있음
            sleepThreshold: 30,
          }
        )

      /*
        각각 조금씩 다른 방향과 속도로 떨어짐
        → 여러 Goal이 동시에 추가됐을 때
           자연스럽게 흩어져서 떨어짐
      */

      Matter.Body.setVelocity(
        body,
        {
          x:
            (Math.random() - 0.5) * 4,

          y:
            1 + Math.random() * 2,
        }
      )

      /*
        떨어지면서 살짝 회전
      */

      Matter.Body.setAngularVelocity(
        body,
        (Math.random() - 0.5) * 0.16
      )

      /*
        Physics world에 추가
      */

      Matter.World.add(
        engine.world,
        body
      )

      /*
        실제 화면에 표시할 Emoji element
      */

      const element =
        document.createElement("div")

      element.className =
        `physics-item ${goal.size}`

      element.textContent =
        goal.emoji

      scene.appendChild(element)

      /*
        Goal ID와 Physics body / DOM element 연결
      */

      bodiesRef.current.set(
        goal.id,
        body
      )

      elementsRef.current.set(
        goal.id,
        element
      )
    })
  }, [goals])

  /*
    =========================
    Visual Jar
    =========================
  */

  return (
    <div className="jar-wrapper"> 
    
    <div
      style={{
        position: "absolute",
        top: "8px",
        left: "8px",
        zIndex: 9999,
        padding: "8px 12px",
        borderRadius: "10px",
        background: "#fff",
        color: "#5c4033",
        fontSize: "13px",
      }}
    >
      <div>Beta: {tiltDebug.beta?.toFixed(1) ?? "Waiting..."}</div>
      <div>Gamma: {tiltDebug.gamma?.toFixed(1) ?? "Waiting..."}</div>
      <div>Gravity Y: {tiltDebug.gravityY?.toFixed(2) ?? "Waiting..."}</div>
    </div> 
      <div
        style={{
          position: "absolute",
          top: "8px",
          left: "8px",
          zIndex: 9999,
          padding: "8px 12px",
          borderRadius: "10px",
          background: "#fff",
          color: "#5c4033",
          fontSize: "13px",
        }}
      >
        <div>Beta: {tiltDebug.beta?.toFixed(1) ?? "Waiting..."}</div>
        <div>Gamma: {tiltDebug.gamma?.toFixed(1) ?? "Waiting..."}</div>
      </div>
       <button
        className={`tilt-button ${tiltEnabled ? "enabled" : ""}`}
        onClick={async () => {
        try {
            if (
            typeof DeviceOrientationEvent !== "undefined" &&
            typeof DeviceOrientationEvent.requestPermission === "function"
            ) {
            const permission =
                await DeviceOrientationEvent.requestPermission()

            console.log("Motion permission:", permission)

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
        }}
        >
        {tiltEnabled ? "Tilt on" : "Tilt jar"}
        </button>
      <div className="jar">
        <div className="jar-glow" />

        <div className="jar-bottom-glow" />

        <div
          className="physics-scene"
          ref={sceneRef}
        />
      </div>

      <div className="jar-lid">
        <div className="cork" />
      </div>
    </div>
  )
}

export default Jar