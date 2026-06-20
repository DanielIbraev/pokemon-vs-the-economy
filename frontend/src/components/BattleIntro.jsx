import { useState, useEffect } from 'react'
import { CharizardIcon } from './CharizardSvg'
import { sfxAppear, sfxAttack } from '../sounds'

const STOCK_COLORS = ['#4a9eff', '#a855f7', '#34d399']

function StockSprite({ color, size = 50 }) {
  return (
    <svg viewBox="0 0 48 48" style={{ width: size, height: size, imageRendering: 'pixelated' }}>
      <rect x="6" y="34" width="8" height="10" fill={color} />
      <rect x="16" y="24" width="8" height="20" fill={color} />
      <rect x="26" y="16" width="8" height="28" fill={color} />
      <rect x="36" y="8" width="8" height="36" fill={color} />
      <rect x="6" y="32" width="8" height="2" fill="#fff" opacity="0.3" />
      <rect x="16" y="22" width="8" height="2" fill="#fff" opacity="0.3" />
      <rect x="26" y="14" width="8" height="2" fill="#fff" opacity="0.3" />
      <rect x="36" y="6" width="8" height="2" fill="#fff" opacity="0.3" />
    </svg>
  )
}

export default function BattleIntro({ tickers, onDone }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => { setStep(1); sfxAppear() }, 400),
      setTimeout(() => { setStep(2); sfxAppear() }, 1200),
      setTimeout(() => { setStep(3); sfxAttack() }, 2200),
      setTimeout(() => setStep(4), 3000),
      setTimeout(() => onDone(), 3800),
    ]
    return () => timers.forEach(clearTimeout)
  }, [onDone])

  return (
    <div style={styles.container}>
      {/* Flash effect */}
      {step === 1 && <div style={styles.flash} />}

      {/* Battle scene */}
      <div style={styles.battleScene}>
        {/* Top section - opponent */}
        <div style={styles.opponentSide}>
          {step >= 2 && (
            <div style={{ animation: 'slideInRight 0.5s steps(6)' }}>
              <div style={styles.opponentInfo}>
                {tickers.map((t, i) => (
                  <div key={t} style={{ ...styles.nameTag, borderColor: STOCK_COLORS[i] }}>
                    {t}
                  </div>
                ))}
                <div style={styles.hpBar}>
                  <div style={styles.hpLabel}>HP</div>
                  <div style={styles.hpTrack}>
                    <div style={styles.hpFill} />
                  </div>
                </div>
              </div>
              <div style={styles.opponentSprites}>
                {tickers.map((t, i) => (
                  <StockSprite key={t} color={STOCK_COLORS[i]} size={45} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Ground line */}
        <div style={styles.groundLine} />

        {/* Bottom section - Charizard */}
        <div style={styles.playerSide}>
          {step >= 2 && (
            <div style={{ animation: 'slideInLeft 0.5s steps(6)' }}>
              <CharizardIcon size={100} />
              <div style={styles.playerInfo}>
                <div style={{ ...styles.nameTag, borderColor: '#f0a030' }}>
                  CHARIZARD
                </div>
                <div style={styles.hpBar}>
                  <div style={styles.hpLabel}>HP</div>
                  <div style={styles.hpTrack}>
                    <div style={{ ...styles.hpFill, background: '#50c878' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Text box */}
      <div style={styles.textBox}>
        {step === 0 && <span style={styles.text}>. . .</span>}
        {step === 1 && <span style={styles.text}>Wild {tickers.join(', ')} appeared!</span>}
        {step === 2 && <span style={styles.text}>Go! CHARIZARD!</span>}
        {step === 3 && <span style={styles.text}>CHARIZARD used BACKTEST!</span>}
        {step >= 4 && <span style={styles.text}>It's super effective!</span>}
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '20px',
    maxWidth: '600px',
    margin: '0 auto',
  },
  flash: {
    position: 'fixed',
    inset: 0,
    background: '#fff',
    zIndex: 50,
    animation: 'battleFlash 0.3s steps(2) forwards',
  },
  battleScene: {
    background: '#1a1a2e',
    border: '4px solid #e8e8e8',
    padding: '20px',
    marginBottom: '0',
    position: 'relative',
    minHeight: '320px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: 'inset -4px -4px 0 0 #888, inset 4px 4px 0 0 #fff',
  },
  opponentSide: {
    display: 'flex',
    justifyContent: 'flex-end',
    minHeight: '100px',
  },
  opponentInfo: {
    marginBottom: '8px',
  },
  opponentSprites: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '4px',
  },
  groundLine: {
    height: '2px',
    background: 'linear-gradient(90deg, transparent 0%, #444 20%, #444 80%, transparent 100%)',
    margin: '10px 0',
  },
  playerSide: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    minHeight: '100px',
    gap: '16px',
  },
  playerInfo: {
    marginTop: '6px',
  },
  nameTag: {
    fontSize: '9px',
    fontFamily: "'Press Start 2P', monospace",
    color: '#e8e8e8',
    padding: '4px 8px',
    border: '2px solid',
    background: '#0a0a14',
    marginBottom: '4px',
    display: 'inline-block',
    marginRight: '4px',
  },
  hpBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '4px',
  },
  hpLabel: {
    fontSize: '7px',
    fontFamily: "'Press Start 2P', monospace",
    color: '#f0a030',
  },
  hpTrack: {
    width: '80px',
    height: '6px',
    background: '#333',
    border: '1px solid #555',
  },
  hpFill: {
    height: '100%',
    width: '100%',
    background: '#50c878',
  },
  textBox: {
    background: '#1a1a2e',
    border: '4px solid #e8e8e8',
    borderTop: 'none',
    padding: '16px 20px',
    minHeight: '60px',
    display: 'flex',
    alignItems: 'center',
    boxShadow: 'inset -4px -4px 0 0 #888, inset 4px 4px 0 0 #fff',
  },
  text: {
    fontSize: '10px',
    fontFamily: "'Press Start 2P', monospace",
    color: '#e8e8e8',
    lineHeight: '1.6',
  },
}
