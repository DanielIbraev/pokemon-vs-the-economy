import { useState } from 'react'

const PROJECT_INFO = {
  name: 'Pokemon vs Stocks',
  description: 'A full-stack backtesting platform that compares the ROI of a 1st Edition Charizard Pokemon card against any stock ticker.',
  tech: ['React', 'Python / FastAPI', 'Recharts', 'Web Audio API', 'Twelve Data API'],
  features: [
    'Multi-ticker comparison (up to 3)',
    'Dollar-cost averaging simulation',
    'Sharpe ratio, max drawdown, volatility',
    'Monte Carlo simulation (500 runs)',
    'Inflation-adjusted returns via CPI',
    'Retro Pokemon battle animations',
    'Chiptune sound effects',
  ],
  linkedin: 'https://www.linkedin.com/in/daniel-ibraev/',
  github: 'https://github.com/DanielIbraev',
}

function PixelAvatar() {
  return (
    <svg viewBox="0 0 18 16" style={{ width: 32, height: 28, imageRendering: 'pixelated' }}>
      {/* Hair */}
      <rect x="5" y="1" width="6" height="2" fill="#f0a030" />
      {/* Head */}
      <rect x="4" y="3" width="8" height="2" fill="#e8c070" />
      {/* Eyes */}
      <rect x="5" y="3" width="2" height="1" fill="#0a0a14" />
      <rect x="9" y="3" width="2" height="1" fill="#0a0a14" />
      {/* Mouth */}
      <rect x="7" y="4" width="2" height="1" fill="#c09050" />
      {/* Neck */}
      <rect x="6" y="5" width="4" height="1" fill="#e8c070" />
      {/* Shirt */}
      <rect x="4" y="6" width="8" height="4" fill="#4a9eff" />
      {/* Left arm static */}
      <rect x="3" y="6" width="1" height="3" fill="#e8c070" />
      {/* Right arm waving */}
      <rect x="12" y="5" width="1" height="2" fill="#e8c070">
        <animate attributeName="y" dur="0.8s" repeatCount="indefinite" values="5;4;5" calcMode="discrete" />
      </rect>
      <rect x="13" y="4" width="1" height="1" fill="#e8c070">
        <animate attributeName="y" dur="0.8s" repeatCount="indefinite" values="4;3;4" calcMode="discrete" />
      </rect>
      {/* Pants */}
      <rect x="5" y="10" width="6" height="3" fill="#333" />
      {/* Legs */}
      <rect x="5" y="13" width="2" height="2" fill="#555" />
      <rect x="9" y="13" width="2" height="2" fill="#555" />
    </svg>
  )
}

export default function Watermark() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Floating badge */}
      <button onClick={() => setOpen(true)} style={styles.badge}>
        <PixelAvatar />
        <span style={styles.badgeName}>DANIEL IBRAEV</span>
      </button>

      {/* Modal overlay */}
      {open && (
        <div style={styles.overlay} onClick={() => setOpen(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={styles.modalHeader}>
              <div style={styles.headerLeft}>
                <PixelAvatar />
                <div>
                  <div style={styles.modalName}>DANIEL IBRAEV</div>
                  <div style={styles.modalRole}>Developer</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} style={styles.closeBtn}>X</button>
            </div>

            {/* Divider */}
            <div style={styles.divider} />

            {/* Project info */}
            <div style={styles.section}>
              <div style={styles.sectionTitle}>PROJECT</div>
              <div style={styles.projectName}>{PROJECT_INFO.name}</div>
              <div style={styles.projectDesc}>{PROJECT_INFO.description}</div>
            </div>

            <div style={styles.divider} />

            {/* Tech stack */}
            <div style={styles.section}>
              <div style={styles.sectionTitle}>TECH STACK</div>
              <div style={styles.techGrid}>
                {PROJECT_INFO.tech.map(t => (
                  <span key={t} style={styles.techTag}>{t}</span>
                ))}
              </div>
            </div>

            <div style={styles.divider} />

            {/* Features */}
            <div style={styles.section}>
              <div style={styles.sectionTitle}>FEATURES</div>
              {PROJECT_INFO.features.map(f => (
                <div key={f} style={styles.featureRow}>
                  <span style={styles.featureDot}>►</span>
                  <span style={styles.featureText}>{f}</span>
                </div>
              ))}
            </div>

            <div style={styles.divider} />

            {/* Links */}
            <div style={styles.links}>
              <a href={PROJECT_INFO.linkedin} target="_blank" rel="noopener noreferrer" style={styles.link}>
                LINKEDIN ↗
              </a>
              <a href={PROJECT_INFO.github} target="_blank" rel="noopener noreferrer" style={styles.link}>
                GITHUB ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const styles = {
  badge: {
    position: 'fixed',
    bottom: '16px',
    right: '16px',
    zIndex: 90,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px 6px 6px',
    background: '#0a0a14',
    border: '3px solid #333',
    cursor: 'pointer',
    fontFamily: "'Press Start 2P', monospace",
    animation: 'fadeIn 0.5s steps(6)',
    transition: 'border-color 0.2s',
  },
  badgeName: {
    fontSize: '6px',
    color: '#888',
    letterSpacing: '0.5px',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 300,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    animation: 'fadeIn 0.2s steps(4)',
  },
  modal: {
    background: '#0f0f1a',
    border: '4px solid #e8e8e8',
    boxShadow: 'inset -4px -4px 0 0 #888, inset 4px 4px 0 0 #fff',
    maxWidth: '420px',
    width: '100%',
    maxHeight: '80vh',
    overflowY: 'auto',
    padding: '16px',
    animation: 'fadeIn 0.3s steps(6)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  modalName: {
    fontSize: '10px',
    fontFamily: "'Press Start 2P', monospace",
    color: '#e8e8e8',
  },
  modalRole: {
    fontSize: '7px',
    fontFamily: "'Press Start 2P', monospace",
    color: '#666',
    marginTop: '2px',
  },
  closeBtn: {
    background: '#1a0808',
    border: '2px solid #e04040',
    color: '#e04040',
    fontSize: '9px',
    fontFamily: "'Press Start 2P', monospace",
    padding: '4px 8px',
    cursor: 'pointer',
  },
  divider: {
    height: '2px',
    background: '#222',
    margin: '12px 0',
  },
  section: {
    marginBottom: '4px',
  },
  sectionTitle: {
    fontSize: '7px',
    fontFamily: "'Press Start 2P', monospace",
    color: '#f0a030',
    marginBottom: '8px',
    letterSpacing: '1px',
  },
  projectName: {
    fontSize: '9px',
    fontFamily: "'Press Start 2P', monospace",
    color: '#e8e8e8',
    marginBottom: '6px',
  },
  projectDesc: {
    fontSize: '7px',
    fontFamily: "'Press Start 2P', monospace",
    color: '#888',
    lineHeight: '1.8',
  },
  techGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  techTag: {
    fontSize: '6px',
    fontFamily: "'Press Start 2P', monospace",
    color: '#4a9eff',
    padding: '4px 8px',
    border: '2px solid #4a9eff33',
    background: '#0a0a20',
  },
  featureRow: {
    display: 'flex',
    gap: '6px',
    marginBottom: '4px',
    alignItems: 'flex-start',
  },
  featureDot: {
    fontSize: '6px',
    color: '#50c878',
    fontFamily: "'Press Start 2P', monospace",
    flexShrink: 0,
    marginTop: '2px',
  },
  featureText: {
    fontSize: '6px',
    fontFamily: "'Press Start 2P', monospace",
    color: '#aaa',
    lineHeight: '1.6',
  },
  links: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
  },
  link: {
    fontSize: '7px',
    fontFamily: "'Press Start 2P', monospace",
    color: '#f0a030',
    padding: '8px 14px',
    border: '2px solid #f0a030',
    textDecoration: 'none',
    background: '#0a0a14',
    transition: 'background 0.2s',
  },
}
