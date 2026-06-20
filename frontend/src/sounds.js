let audioCtx = null

function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  return audioCtx
}

function playNote(freq, duration, type = 'square', volume = 0.08) {
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.value = volume
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + duration)
}

function playNotes(notes, tempo = 0.15) {
  notes.forEach(([freq, dur], i) => {
    setTimeout(() => playNote(freq, dur || tempo, 'square', 0.06), i * tempo * 1000)
  })
}

export function sfxSelect() {
  playNote(880, 0.08, 'square', 0.05)
  setTimeout(() => playNote(1320, 0.1, 'square', 0.05), 60)
}

export function sfxBattleStart() {
  const notes = [
    [330], [392], [440], [523], [659], [784],
  ]
  playNotes(notes, 0.08)
}

export function sfxAppear() {
  playNote(220, 0.15, 'square', 0.04)
  setTimeout(() => playNote(330, 0.15, 'square', 0.04), 120)
  setTimeout(() => playNote(262, 0.2, 'square', 0.04), 240)
}

export function sfxAttack() {
  for (let i = 0; i < 6; i++) {
    setTimeout(() => playNote(200 + Math.random() * 400, 0.04, 'sawtooth', 0.04), i * 30)
  }
}

export function sfxVictory() {
  const melody = [
    [523, 0.12], [523, 0.12], [523, 0.12], [523, 0.3],
    [415, 0.3], [466, 0.3], [523, 0.15],
    [466, 0.1], [523, 0.5],
  ]
  playNotes(melody, 0.15)
}

export function sfxDefeat() {
  const melody = [
    [392, 0.3], [370, 0.3], [349, 0.3], [330, 0.5],
  ]
  playNotes(melody, 0.25)
}

export function sfxChartTick() {
  playNote(1200 + Math.random() * 400, 0.02, 'sine', 0.01)
}

let bgmInterval = null

export function startBgm() {
  stopBgm()
  const bassLine = [131, 165, 175, 165, 131, 165, 196, 165]
  let beat = 0
  bgmInterval = setInterval(() => {
    const freq = bassLine[beat % bassLine.length]
    playNote(freq, 0.15, 'triangle', 0.03)
    if (beat % 2 === 0) {
      playNote(freq * 2, 0.08, 'square', 0.015)
    }
    beat++
  }, 250)
}

export function stopBgm() {
  if (bgmInterval) {
    clearInterval(bgmInterval)
    bgmInterval = null
  }
}
