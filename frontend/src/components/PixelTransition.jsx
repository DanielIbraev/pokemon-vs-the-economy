import { useState, useEffect } from 'react'

export default function PixelTransition({ onMidpoint, duration = 1200 }) {
  const [phase, setPhase] = useState('in') // in | hold | out | done
  const gridSize = 12
  const cells = []

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      cells.push({ x, y, delay: (x + y) * 20 })
    }
  }

  useEffect(() => {
    const t1 = setTimeout(() => {
      setPhase('hold')
      onMidpoint?.()
    }, duration / 2)
    const t2 = setTimeout(() => setPhase('out'), duration / 2 + 200)
    const t3 = setTimeout(() => setPhase('done'), duration)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [duration, onMidpoint])

  if (phase === 'done') return null

  return (
    <div style={styles.overlay}>
      {cells.map((cell, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${(cell.x / gridSize) * 100}%`,
          top: `${(cell.y / gridSize) * 100}%`,
          width: `${100 / gridSize + 0.5}%`,
          height: `${100 / gridSize + 0.5}%`,
          background: '#0f0f1a',
          animation: phase === 'in'
            ? `pixelIn 0.4s steps(1) ${cell.delay}ms both`
            : phase === 'out'
            ? `pixelOut 0.4s steps(1) ${cell.delay}ms both`
            : 'none',
          opacity: phase === 'hold' ? 1 : undefined,
        }} />
      ))}
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 200,
    pointerEvents: 'none',
  },
}
