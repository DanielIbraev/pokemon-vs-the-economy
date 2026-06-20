import { useRef, useState, useEffect } from 'react'
import { CharizardWin, CharizardLoss } from './CharizardSvg'
import { sfxVictory, sfxDefeat } from '../sounds'

const STOCK_COLORS = ['#4a9eff', '#a855f7', '#34d399']

function formatMoney(val) {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`
  if (val >= 1000) return `$${(val / 1000).toFixed(2)}K`
  return `$${val.toFixed(2)}`
}

function MetricRow({ label, value }) {
  return (
    <div style={metricStyles.row}>
      <span style={metricStyles.label}>{label}</span>
      <span style={metricStyles.value}>{value}</span>
    </div>
  )
}

const metricStyles = {
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '4px 0',
    borderBottom: '1px dashed #333',
  },
  label: { fontSize: '7px', color: '#888', fontFamily: "'Press Start 2P', monospace" },
  value: { fontSize: '7px', color: '#ccc', fontFamily: "'Press Start 2P', monospace" },
}

function AssetCard({ asset, color, isWinner, index }) {
  const m = asset.metrics
  return (
    <div style={{
      ...cardStyles.card,
      borderColor: isWinner ? color : '#444',
      animation: `fadeIn 0.3s steps(4) ${0.3 + index * 0.2}s both`,
    }}>
      <div style={{ ...cardStyles.dot, background: color }} />
      <div style={cardStyles.name}>{asset.label}</div>
      <div style={cardStyles.value}>{formatMoney(asset.final_value)}</div>
      <div style={{
        ...cardStyles.returnPct,
        color: asset.return_pct >= 0 ? '#50c878' : '#e04040',
      }}>
        {asset.return_pct >= 0 ? '+' : ''}{asset.return_pct.toFixed(1)}%
      </div>
      <div style={cardStyles.metrics}>
        <MetricRow label="SHARPE" value={m.sharpe} />
        <MetricRow label="MAX DD" value={`${m.max_drawdown}%`} />
        <MetricRow label="VOL" value={`${m.volatility}%`} />
        <MetricRow label="BEST MO" value={`+${m.best_month}%`} />
        <MetricRow label="WORST MO" value={`${m.worst_month}%`} />
      </div>
    </div>
  )
}

const cardStyles = {
  card: {
    background: '#0a0a14',
    border: '3px solid',
    padding: '12px',
    flex: 1,
    minWidth: 0,
  },
  dot: {
    width: '8px',
    height: '8px',
    marginBottom: '8px',
  },
  name: {
    fontSize: '8px',
    color: '#888',
    fontFamily: "'Press Start 2P', monospace",
    marginBottom: '6px',
  },
  value: {
    fontSize: '14px',
    color: '#e8e8e8',
    fontFamily: "'Press Start 2P', monospace",
  },
  returnPct: {
    fontSize: '9px',
    fontFamily: "'Press Start 2P', monospace",
    marginTop: '2px',
    marginBottom: '10px',
  },
  metrics: {
    borderTop: '2px solid #333',
    paddingTop: '6px',
  },
}

export default function ResultsScreen({ result, onReplay, onReset }) {
  const cardRef = useRef(null)
  const { assets, winner, tickers, amount, total_invested, dca } = result
  const charizardWins = winner === 'charizard'
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    if (charizardWins) sfxVictory()
    else sfxDefeat()
    const t = setTimeout(() => setShowContent(true), 1200)
    return () => clearTimeout(t)
  }, [])

  const handleShare = async () => {
    try {
      const el = cardRef.current
      if (!el) return
      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(el, { backgroundColor: '#0f0f1a', scale: 2 })
      canvas.toBlob((blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `charizard-vs-${tickers.join('-')}.png`
        a.click()
        URL.revokeObjectURL(url)
      })
    } catch {}
  }

  return (
    <div style={styles.container}>
      <div style={styles.content} ref={cardRef}>
        {/* Victory / defeat banner */}
        <div style={styles.victoryBox}>
          {charizardWins ? (
            <>
              <div style={{ animation: 'victoryBounce 0.6s steps(4) infinite' }}>
                <CharizardWin size={140} />
              </div>
              <div style={styles.victoryText}>
                ★ CHARIZARD WINS! ★
              </div>
              <div style={styles.expText}>
                CHARIZARD gained {Math.round(assets.charizard.return_pct)} EXP. Points!
              </div>
            </>
          ) : (
            <>
              <CharizardLoss size={100} />
              <div style={{ ...styles.victoryText, color: '#4a9eff' }}>
                {winner} WINS!
              </div>
              <div style={styles.expText}>
                CHARIZARD fainted!
              </div>
            </>
          )}
        </div>

        {showContent && (
          <div style={{ animation: 'fadeIn 0.4s steps(6)' }}>
            <div style={styles.investedInfo}>
              {formatMoney(amount)} initial{dca > 0 ? ` + ${formatMoney(dca)}/mo` : ''}
              {dca > 0 ? ` = ${formatMoney(total_invested)} total` : ''}
            </div>

            <div style={styles.cards}>
              <AssetCard
                asset={assets.charizard}
                color="#f0a030"
                isWinner={winner === 'charizard'}
                index={0}
              />
              {tickers.map((t, i) => (
                <AssetCard
                  key={t}
                  asset={assets[t]}
                  color={STOCK_COLORS[i]}
                  isWinner={winner === t}
                  index={i + 1}
                />
              ))}
            </div>

            <div style={styles.buttons}>
              <button onClick={onReplay} style={styles.btn}>REPLAY</button>
              <button onClick={handleShare} style={styles.btn}>SAVE</button>
              <button onClick={onReset} style={{ ...styles.btn, borderColor: '#f0a030', color: '#f0a030' }}>
                NEW BATTLE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  content: {
    maxWidth: '680px',
    width: '100%',
  },
  victoryBox: {
    textAlign: 'center',
    padding: '24px',
    background: '#1a1a2e',
    border: '4px solid #e8e8e8',
    marginBottom: '12px',
    boxShadow: 'inset -4px -4px 0 0 #888, inset 4px 4px 0 0 #fff',
  },
  victoryText: {
    fontSize: '16px',
    fontFamily: "'Press Start 2P', monospace",
    color: '#f0a030',
    textShadow: '3px 3px 0 #604010',
    marginTop: '12px',
    animation: 'blink 1s steps(1) 3',
  },
  expText: {
    fontSize: '8px',
    fontFamily: "'Press Start 2P', monospace",
    color: '#888',
    marginTop: '8px',
  },
  investedInfo: {
    fontSize: '7px',
    fontFamily: "'Press Start 2P', monospace",
    color: '#666',
    textAlign: 'center',
    marginBottom: '12px',
  },
  cards: {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px',
  },
  buttons: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
  },
  btn: {
    padding: '10px 20px',
    background: '#0a0a14',
    border: '3px solid #444',
    color: '#888',
    fontSize: '8px',
    fontFamily: "'Press Start 2P', monospace",
    cursor: 'pointer',
  },
}
