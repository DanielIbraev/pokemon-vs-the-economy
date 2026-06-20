import { useState, useCallback, useRef } from 'react'
import LandingHero from './components/LandingHero'
import InputForm from './components/InputForm'
import BattleIntro from './components/BattleIntro'
import AnimatedChart from './components/AnimatedChart'
import ResultsScreen from './components/ResultsScreen'
import PixelTransition from './components/PixelTransition'
import { runBacktest } from './api'
import { sfxSelect, sfxBattleStart, sfxVictory, sfxDefeat, startBgm, stopBgm } from './sounds'
import './styles.css'

const STOCK_COLORS = ['#4a9eff', '#a855f7', '#34d399']

export default function App() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [phase, setPhase] = useState('input')
  const [transition, setTransition] = useState(null) // null | 'to-battle' | 'to-chart' | 'to-results' | 'to-input'
  const nextPhaseRef = useRef(null)

  const doTransition = (transName, nextPhase) => {
    nextPhaseRef.current = nextPhase
    setTransition(transName)
  }

  const handleTransitionMidpoint = useCallback(() => {
    if (nextPhaseRef.current) {
      setPhase(nextPhaseRef.current)
      nextPhaseRef.current = null
    }
    setTimeout(() => setTransition(null), 600)
  }, [])

  const handleSubmit = async (params) => {
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const data = await runBacktest(params)
      setResult(data)
      sfxSelect()
      setTimeout(() => {
        sfxBattleStart()
        doTransition('to-battle', 'battle-intro')
      }, 200)
    } catch (err) {
      const msg = err.response?.data?.detail || 'Something went wrong. Check ticker and try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleBattleIntroDone = useCallback(() => {
    startBgm()
    doTransition('to-chart', 'chart')
  }, [])

  const handleAnimationEnd = useCallback(() => {
    setTimeout(() => {
      stopBgm()
      doTransition('to-results', 'results')
    }, 1500)
  }, [])

  const handleReplay = useCallback(() => {
    sfxBattleStart()
    doTransition('to-battle', 'battle-intro')
  }, [])

  const handleReset = useCallback(() => {
    sfxSelect()
    doTransition('to-input', 'input')
    setResult(null)
    setError('')
  }, [])

  return (
    <div className="app">
      <div className="scanlines" />

      {transition && (
        <PixelTransition
          key={transition}
          onMidpoint={handleTransitionMidpoint}
          duration={1200}
        />
      )}

      {phase === 'input' && (
        <div className="fade-in">
          <LandingHero />
          <div className="form-container">
            <InputForm onSubmit={handleSubmit} loading={loading} />
            {error && <div className="error-msg">{error}</div>}
          </div>
        </div>
      )}

      {phase === 'battle-intro' && result && (
        <BattleIntro
          tickers={result.tickers}
          onDone={handleBattleIntroDone}
        />
      )}

      {phase === 'chart' && result && (
        <div className="fade-in">
          <div className="chart-view">
            <h2 className="chart-title">
              <span className="gold">CHARIZARD</span>
              <span className="vs-small">VS</span>
              {result.tickers.map((t, i) => (
                <span key={t}>
                  {i > 0 && <span className="vs-small" style={{ margin: '0 2px' }}>/</span>}
                  <span style={{ color: STOCK_COLORS[i] }}>{t}</span>
                </span>
              ))}
            </h2>
            {result.dca > 0 && (
              <p style={{
                textAlign: 'center', color: '#666', fontSize: '7px', margin: '-4px 0 8px',
                fontFamily: "'Press Start 2P', monospace",
              }}>
                DCA: ${result.dca}/MO
              </p>
            )}
            <AnimatedChart
              key={result.tickers.join(',') + result.start}
              data={result.series}
              tickers={result.tickers}
              onAnimationEnd={handleAnimationEnd}
            />
          </div>
        </div>
      )}

      {phase === 'results' && result && (
        <div className="fade-in">
          <ResultsScreen
            result={result}
            onReplay={handleReplay}
            onReset={handleReset}
          />
        </div>
      )}
    </div>
  )
}
