const O = '#d87830', D = '#b05818', B = '#f0d080', W = '#38a098', Wd = '#287870'
const F = '#f0a030', Fb = '#f05020', Fy = '#f8e848', E = '#1a1a2e', C = '#f0e0a0', T = '#e8e8f0'

// Venusaur colors
const VG = '#48a848', VD = '#306830', VF = '#e05060', VB = '#70c870', VS = '#58b858'

// Blastoise colors
const BL = '#5888c0', BD = '#3860a0', BB = '#e8d8a0', BC = '#78a8d8', BN = '#a06830'

const K = '#222' // outline color

function PixelGrid({ pixels, viewBox, size, glow, style = {} }) {
  const filled = new Set(pixels.map(p => `${p.x},${p.y}`))
  const outlines = new Set()
  pixels.forEach(p => {
    ;[[-1,0],[1,0],[0,-1],[0,1]].forEach(([dx,dy]) => {
      const nx = p.x+dx, ny = p.y+dy
      if (!filled.has(`${nx},${ny}`)) outlines.add(`${nx},${ny}`)
    })
  })

  return (
    <svg viewBox={viewBox} style={{
      width: size, height: size * 0.68,
      imageRendering: 'pixelated',
      filter: glow ? `drop-shadow(0 0 20px ${glow})` : 'none',
      ...style,
    }}>
      {[...outlines].map((key, i) => {
        const [x,y] = key.split(',').map(Number)
        return <rect key={`o${i}`} x={x*6} y={y*6} width={6} height={6} fill={K} />
      })}
      {pixels.map((p, i) => (
        <rect key={i} x={p.x * 6} y={p.y * 6} width={6} height={6} fill={p.c} />
      ))}
    </svg>
  )
}

const CHARIZARD_PIXELS = [
  {x:5,y:0,c:D},{x:12,y:0,c:D},{x:5,y:1,c:D},{x:6,y:1,c:D},{x:11,y:1,c:D},{x:12,y:1,c:D},
  {x:6,y:2,c:O},{x:7,y:2,c:O},{x:8,y:2,c:O},{x:9,y:2,c:O},{x:10,y:2,c:O},{x:11,y:2,c:O},
  {x:5,y:3,c:O},{x:6,y:3,c:O},{x:7,y:3,c:E},{x:8,y:3,c:O},{x:9,y:3,c:O},{x:10,y:3,c:E},{x:11,y:3,c:O},{x:12,y:3,c:O},
  {x:5,y:4,c:O},{x:6,y:4,c:O},{x:7,y:4,c:O},{x:8,y:4,c:O},{x:9,y:4,c:O},{x:10,y:4,c:O},{x:11,y:4,c:O},{x:12,y:4,c:O},
  {x:13,y:3,c:O},{x:14,y:3,c:O},{x:13,y:4,c:'#801510'},{x:14,y:4,c:'#801510'},{x:15,y:4,c:T},
  {x:13,y:5,c:O},{x:14,y:5,c:O},
  {x:15,y:3,c:Fy},{x:16,y:3,c:F},{x:17,y:3,c:Fb},{x:16,y:2,c:Fy},{x:17,y:2,c:F},{x:16,y:4,c:F},{x:17,y:4,c:Fb},
  {x:7,y:5,c:O},{x:8,y:5,c:O},{x:9,y:5,c:O},{x:10,y:5,c:O},
  {x:0,y:3,c:W},{x:1,y:3,c:W},{x:0,y:4,c:Wd},{x:1,y:4,c:W},{x:2,y:4,c:W},
  {x:1,y:5,c:Wd},{x:2,y:5,c:W},{x:3,y:5,c:W},{x:2,y:6,c:Wd},{x:3,y:6,c:W},{x:4,y:6,c:W},{x:5,y:6,c:W},
  {x:3,y:7,c:Wd},{x:4,y:7,c:W},{x:5,y:7,c:W},
  {x:6,y:6,c:O},{x:7,y:6,c:O},{x:8,y:6,c:B},{x:9,y:6,c:B},{x:10,y:6,c:O},{x:11,y:6,c:O},
  {x:6,y:7,c:O},{x:7,y:7,c:B},{x:8,y:7,c:B},{x:9,y:7,c:B},{x:10,y:7,c:B},{x:11,y:7,c:O},
  {x:6,y:8,c:O},{x:7,y:8,c:O},{x:8,y:8,c:B},{x:9,y:8,c:B},{x:10,y:8,c:O},{x:11,y:8,c:O},
  {x:7,y:9,c:O},{x:8,y:9,c:O},{x:9,y:9,c:O},{x:10,y:9,c:O},
  {x:14,y:6,c:W},{x:15,y:6,c:W},{x:16,y:6,c:Wd},{x:13,y:7,c:W},{x:14,y:7,c:W},{x:15,y:7,c:Wd},
  {x:12,y:6,c:W},{x:13,y:6,c:W},{x:12,y:7,c:W},
  {x:4,y:7,c:O},{x:3,y:8,c:C},{x:4,y:8,c:O},{x:13,y:8,c:O},{x:14,y:8,c:C},
  {x:6,y:10,c:O},{x:7,y:10,c:O},{x:10,y:10,c:O},{x:11,y:10,c:O},
  {x:5,y:11,c:C},{x:6,y:11,c:O},{x:7,y:11,c:C},{x:10,y:11,c:C},{x:11,y:11,c:O},{x:12,y:11,c:C},
  {x:3,y:9,c:O},{x:4,y:9,c:O},{x:2,y:10,c:O},{x:3,y:10,c:O},{x:1,y:11,c:O},{x:2,y:11,c:O},
  {x:0,y:10,c:F},{x:0,y:11,c:Fb},{x:1,y:10,c:Fy},{x:0,y:9,c:Fy},
]

const VENUSAUR_PIXELS = [
  // Flower
  {x:5,y:0,c:VF},{x:6,y:0,c:VF},{x:7,y:0,c:VF},{x:8,y:0,c:VF},{x:9,y:0,c:VF},{x:10,y:0,c:VF},{x:11,y:0,c:VF},
  {x:4,y:1,c:VF},{x:5,y:1,c:'#f08090'},{x:6,y:1,c:VF},{x:7,y:1,c:'#f8d040'},{x:8,y:1,c:'#f8d040'},{x:9,y:1,c:VF},{x:10,y:1,c:'#f08090'},{x:11,y:1,c:VF},{x:12,y:1,c:VF},
  {x:4,y:2,c:VF},{x:5,y:2,c:VF},{x:6,y:2,c:'#f8d040'},{x:7,y:2,c:'#f8e868'},{x:8,y:2,c:'#f8e868'},{x:9,y:2,c:'#f8d040'},{x:10,y:2,c:VF},{x:11,y:2,c:VF},
  {x:5,y:3,c:VF},{x:6,y:3,c:VF},{x:7,y:3,c:'#f8d040'},{x:8,y:3,c:'#f8d040'},{x:9,y:3,c:VF},{x:10,y:3,c:VF},
  // Leaves
  {x:2,y:3,c:VG},{x:3,y:3,c:VG},{x:3,y:4,c:VG},{x:13,y:3,c:VG},{x:12,y:3,c:VG},{x:12,y:4,c:VG},
  {x:1,y:4,c:VG},{x:2,y:4,c:VB},{x:14,y:4,c:VG},{x:13,y:4,c:VB},
  // Body
  {x:4,y:4,c:VS},{x:5,y:4,c:VS},{x:6,y:4,c:VS},{x:7,y:4,c:VS},{x:8,y:4,c:VS},{x:9,y:4,c:VS},{x:10,y:4,c:VS},{x:11,y:4,c:VS},
  {x:3,y:5,c:VG},{x:4,y:5,c:VG},{x:5,y:5,c:VS},{x:6,y:5,c:VB},{x:7,y:5,c:VB},{x:8,y:5,c:VB},{x:9,y:5,c:VB},{x:10,y:5,c:VS},{x:11,y:5,c:VG},{x:12,y:5,c:VG},
  // Head
  {x:3,y:6,c:VG},{x:4,y:6,c:VG},{x:5,y:6,c:E},{x:6,y:6,c:VG},{x:7,y:6,c:VG},{x:8,y:6,c:VG},{x:9,y:6,c:VG},{x:10,y:6,c:E},{x:11,y:6,c:VG},{x:12,y:6,c:VG},
  {x:3,y:7,c:VG},{x:4,y:7,c:VG},{x:5,y:7,c:VG},{x:6,y:7,c:VG},{x:7,y:7,c:VG},{x:8,y:7,c:VG},{x:9,y:7,c:VG},{x:10,y:7,c:VG},{x:11,y:7,c:VG},{x:12,y:7,c:VG},
  {x:4,y:8,c:VD},{x:5,y:8,c:VG},{x:6,y:8,c:VG},{x:7,y:8,c:VD},{x:8,y:8,c:VD},{x:9,y:8,c:VG},{x:10,y:8,c:VG},{x:11,y:8,c:VD},
  // Legs
  {x:3,y:9,c:VG},{x:4,y:9,c:VG},{x:5,y:9,c:VG},{x:10,y:9,c:VG},{x:11,y:9,c:VG},{x:12,y:9,c:VG},
  {x:2,y:10,c:VD},{x:3,y:10,c:VG},{x:4,y:10,c:VD},{x:11,y:10,c:VD},{x:12,y:10,c:VG},{x:13,y:10,c:VD},
]

const BLASTOISE_PIXELS = [
  // Cannons
  {x:1,y:1,c:'#888'},{x:2,y:1,c:'#888'},{x:2,y:2,c:'#aaa'},{x:14,y:1,c:'#888'},{x:13,y:1,c:'#888'},{x:13,y:2,c:'#aaa'},
  {x:0,y:1,c:'#666'},{x:15,y:1,c:'#666'},
  // Shell
  {x:4,y:2,c:BD},{x:5,y:2,c:BL},{x:6,y:2,c:BL},{x:7,y:2,c:BL},{x:8,y:2,c:BL},{x:9,y:2,c:BL},{x:10,y:2,c:BL},{x:11,y:2,c:BD},
  {x:3,y:3,c:BD},{x:4,y:3,c:BL},{x:5,y:3,c:BC},{x:6,y:3,c:BL},{x:7,y:3,c:BD},{x:8,y:3,c:BD},{x:9,y:3,c:BL},{x:10,y:3,c:BC},{x:11,y:3,c:BL},{x:12,y:3,c:BD},
  {x:3,y:4,c:BD},{x:4,y:4,c:BL},{x:5,y:4,c:BL},{x:6,y:4,c:BD},{x:7,y:4,c:BL},{x:8,y:4,c:BL},{x:9,y:4,c:BD},{x:10,y:4,c:BL},{x:11,y:4,c:BL},{x:12,y:4,c:BD},
  // Belly
  {x:5,y:5,c:BB},{x:6,y:5,c:BB},{x:7,y:5,c:BB},{x:8,y:5,c:BB},{x:9,y:5,c:BB},{x:10,y:5,c:BB},
  // Head
  {x:5,y:6,c:BL},{x:6,y:6,c:BL},{x:7,y:6,c:BL},{x:8,y:6,c:BL},{x:9,y:6,c:BL},{x:10,y:6,c:BL},
  {x:4,y:7,c:BL},{x:5,y:7,c:BL},{x:6,y:7,c:E},{x:7,y:7,c:BL},{x:8,y:7,c:BL},{x:9,y:7,c:E},{x:10,y:7,c:BL},{x:11,y:7,c:BL},
  {x:4,y:8,c:BL},{x:5,y:8,c:BL},{x:6,y:8,c:BL},{x:7,y:8,c:BN},{x:8,y:8,c:BN},{x:9,y:8,c:BL},{x:10,y:8,c:BL},{x:11,y:8,c:BL},
  // Arms
  {x:3,y:6,c:BL},{x:2,y:7,c:BL},{x:2,y:8,c:BB},{x:12,y:6,c:BL},{x:13,y:7,c:BL},{x:13,y:8,c:BB},
  // Legs
  {x:4,y:9,c:BL},{x:5,y:9,c:BL},{x:6,y:9,c:BL},{x:9,y:9,c:BL},{x:10,y:9,c:BL},{x:11,y:9,c:BL},
  {x:3,y:10,c:BB},{x:4,y:10,c:BL},{x:5,y:10,c:BB},{x:10,y:10,c:BB},{x:11,y:10,c:BL},{x:12,y:10,c:BB},
]

const POKEMON_SPRITES = {
  charizard: { pixels: CHARIZARD_PIXELS, color: '#f0a030', glowColor: 'rgba(230,120,30,0.4)' },
  venusaur: { pixels: VENUSAUR_PIXELS, color: '#48a848', glowColor: 'rgba(72,168,72,0.4)' },
  blastoise: { pixels: BLASTOISE_PIXELS, color: '#5888c0', glowColor: 'rgba(88,136,192,0.4)' },
}

export function PokemonIcon({ pokemon = 'charizard', size = 100, glow = false }) {
  const sprite = POKEMON_SPRITES[pokemon] || POKEMON_SPRITES.charizard
  return (
    <PixelGrid
      pixels={sprite.pixels}
      viewBox="0 0 110 75"
      size={size}
      glow={glow ? sprite.glowColor : null}
    />
  )
}

export function PokemonWin({ pokemon = 'charizard', size = 180 }) {
  const sprite = POKEMON_SPRITES[pokemon] || POKEMON_SPRITES.charizard
  return (
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{
        position: 'absolute',
        width: size * 1.2, height: size * 1.2,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${sprite.glowColor} 0%, transparent 70%)`,
        animation: 'pulseGlow 2s ease-in-out infinite',
      }} />
      <PokemonIcon pokemon={pokemon} size={size} glow />
    </div>
  )
}

export function PokemonLoss({ pokemon = 'charizard', size = 140 }) {
  return (
    <div style={{ opacity: 0.35, filter: 'saturate(0.2) brightness(0.6)' }}>
      <PokemonIcon pokemon={pokemon} size={size} />
    </div>
  )
}

export function getPokemonColor(pokemon) {
  return (POKEMON_SPRITES[pokemon] || POKEMON_SPRITES.charizard).color
}

// Keep old exports for backward compat
export const CharizardIcon = (props) => <PokemonIcon pokemon="charizard" {...props} />
export const CharizardWin = (props) => <PokemonWin pokemon="charizard" {...props} />
export const CharizardLoss = (props) => <PokemonLoss pokemon="charizard" {...props} />
