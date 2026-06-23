import { Chess } from 'chess.js'
import type { CSSProperties } from 'react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChessBoard } from '../components/chess/ChessBoard'
import { Button } from '../components/ui/Button'
import { ThemeToggle } from '../components/ui/ThemeToggle'
import { useAuth } from '../hooks/useAuth'
import { useViewport } from '../hooks/useViewport'
import { Phase, usePuzzle } from '../hooks/usePuzzle'
import { apiFetchHistory, apiFetchNextPuzzle, apiFetchPuzzleProfile, apiFetchThemes } from '../lib/puzzleApi'
import type { PuzzleAttemptItem, PuzzleOut, PuzzleProfile } from '../lib/puzzleApi'

// ── Styles ────────────────────────────────────────────────────────────────────

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  background: 'var(--color-bg)',
  fontFamily: 'var(--font-sans)',
  display: 'flex',
  flexDirection: 'column',
}

const navStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: 'var(--space-4) var(--space-6)',
  borderBottom: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  position: 'sticky',
  top: 0,
  zIndex: 10,
}

const navLeftStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-4)',
}

const navTitleStyle: CSSProperties = {
  fontSize: 'var(--font-size-xl)',
  fontWeight: 700,
  color: 'var(--color-text-primary)',
}

const navRightStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-3)',
}

const contentStyle: CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: 'var(--space-6)',
  gap: 'var(--space-5)',
}

const filterBarStyle: CSSProperties = {
  width: '100%',
  maxWidth: '1000px',
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-4) var(--space-5)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-3)',
}

const filterRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: 'var(--space-2)',
}

const filterLabelStyle: CSSProperties = {
  fontSize: 'var(--font-size-sm)',
  fontWeight: 600,
  color: 'var(--color-text-secondary)',
  minWidth: '80px',
}

const boardAreaStyle: CSSProperties = {
  display: 'flex',
  gap: 'var(--space-5)',
  width: '100%',
  maxWidth: '1000px',
  alignItems: 'flex-start',
  flexWrap: 'wrap',
}

const infoPanelStyle: CSSProperties = {
  flex: 1,
  minWidth: '260px',
  minHeight: '480px',
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-5)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-4)',
}

const sectionTitleStyle: CSSProperties = {
  fontSize: 'var(--font-size-sm)',
  fontWeight: 600,
  color: 'var(--color-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

const statusBoxStyle = (ok: boolean | null): CSSProperties => ({
  padding: 'var(--space-3) var(--space-4)',
  borderRadius: 'var(--radius-md)',
  background: ok === null
    ? 'var(--color-bg-subtle)'
    : ok
    ? 'var(--color-success-bg)'
    : 'var(--color-error-bg)',
  color: ok === null
    ? 'var(--color-text-secondary)'
    : ok
    ? 'var(--color-success)'
    : 'var(--color-error)',
  fontSize: 'var(--font-size-base)',
  fontWeight: 600,
  textAlign: 'center',
})

const tagStyle: CSSProperties = {
  display: 'inline-block',
  padding: '2px 10px',
  borderRadius: 'var(--radius-full)',
  background: 'var(--color-primary-subtle)',
  color: 'var(--color-primary)',
  fontSize: 'var(--font-size-sm)',
  fontWeight: 500,
}

const deltaBadge = (delta: number): CSSProperties => ({
  fontSize: 'var(--font-size-xl)',
  fontWeight: 800,
  color: delta >= 0 ? 'var(--color-success)' : 'var(--color-error)',
})

const presetBtnStyle = (active: boolean): CSSProperties => ({
  padding: '4px 12px',
  borderRadius: 'var(--radius-full)',
  border: `1px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
  background: active ? 'var(--color-primary-subtle)' : 'transparent',
  color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
  fontSize: 'var(--font-size-sm)',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all var(--transition-fast)',
  fontFamily: 'var(--font-sans)',
})

const themePillStyle = (selected: boolean): CSSProperties => ({
  padding: '3px 10px',
  borderRadius: 'var(--radius-full)',
  border: `1px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
  background: selected ? 'var(--color-primary-subtle)' : 'transparent',
  color: selected ? 'var(--color-primary)' : 'var(--color-text-secondary)',
  fontSize: '0.8rem',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all var(--transition-fast)',
  userSelect: 'none',
  fontFamily: 'var(--font-sans)',
})

const boardOverlayStyle = (show: boolean): CSSProperties => ({
  position: 'absolute',
  inset: 0,
  background: show ? 'rgba(0,0,0,0.48)' : 'rgba(0,0,0,0.18)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 'var(--radius-lg)',
  backdropFilter: show ? 'blur(2px)' : 'none',
  pointerEvents: show ? 'auto' : 'none',
  transition: 'opacity var(--transition-normal)',
})

// ── Rating presets ─────────────────────────────────────────────────────────────

const PRESETS = [
  { label: 'Any',      min: undefined, max: undefined },
  { label: 'Beginner', min: 400,  max: 1000 },
  { label: 'Easy',     min: 1000, max: 1400 },
  { label: 'Medium',   min: 1400, max: 1800 },
  { label: 'Hard',     min: 1800, max: 2200 },
  { label: 'Expert',   min: 2200, max: undefined },
] as const

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTheme(t: string): string {
  return t
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/([a-zA-Z])(\d)/g, '$1 $2')
    .replace(/(\d)([a-zA-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .split(' ')
    .filter(w => w.length > 0)
    .map(w => w[0].toUpperCase() + w.slice(1))
    .join(' ')
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function uciParts(uci: string): { from: string; to: string; promotion?: 'q' | 'r' | 'b' | 'n' } {
  return { from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] as 'q' | 'r' | 'b' | 'n' | undefined }
}

/** Build the FEN after each ply, starting from the puzzle's initial position. fens[i] = position after i moves. */
function buildReviewFens(puzzle: PuzzleOut): string[] {
  const chess = new Chess(puzzle.fen)
  const fens = [chess.fen()]
  for (const uci of puzzle.moves) {
    const { from, to, promotion } = uciParts(uci)
    try {
      chess.move({ from, to, promotion: promotion ?? 'q' })
    } catch {
      break // malformed move data — stop where we can
    }
    fens.push(chess.fen())
  }
  return fens
}

/** A history attempt carries the full puzzle, so we can re-load it without another fetch. */
function itemToPuzzle(item: PuzzleAttemptItem): PuzzleOut {
  return {
    id: item.puzzle_id,
    lichess_id: item.lichess_id,
    fen: item.fen,
    moves: item.moves,
    rating: item.rating,
    themes: item.themes,
    opening_tags: item.opening_tags,
    popularity: 0,
  }
}

/** Live-ticking timer. Isolated component so only it re-renders each second (not the board). */
function PuzzleTimer({ startTime, endTime, running }: { startTime: number | null; endTime: number | null; running: boolean }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(id)
  }, [running])

  if (startTime === null) return <>0:00</>
  const end = endTime ?? (running ? now : startTime)
  return <>{formatDuration(Math.max(0, end - startTime))}</>
}

function phaseMessage(phase: string, mistakes: number): { text: string; ok: boolean | null } {
  switch (phase) {
    case Phase.Idle:
    case Phase.Loading:    return { text: 'Loading puzzle…', ok: null }
    case Phase.Intro:      return { text: 'Watch the position…', ok: null }
    case Phase.PlayerTurn: return mistakes > 0
      ? { text: `Your turn — ${mistakes} mistake${mistakes > 1 ? 's' : ''} so far`, ok: null }
      : { text: 'Your turn — find the best move!', ok: null }
    case Phase.WrongMove:   return { text: 'Wrong move! Try again.', ok: false }
    case Phase.OpponentMove: return { text: "Opponent's response…", ok: null }
    case Phase.Solved:      return { text: '✓ Puzzle solved!', ok: true }
    case Phase.Failed:      return { text: '✗ Puzzle failed', ok: false }
    default:                return { text: '', ok: null }
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PuzzlePage() {
  const { accessToken } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { width, isMobile } = useViewport()
  const { state, loadPuzzle, handlePieceDrop, requestHint, revealSolution } = usePuzzle(accessToken)

  // Responsive layout: stack board + info panel when there isn't room for them side by side,
  // and size the board to the available width.
  const stack = width < 860
  const contentPad = isMobile ? 16 : 24
  const boardSize = stack ? Math.max(240, Math.min(480, width - contentPad * 2)) : 480

  const [profile, setProfile] = useState<PuzzleProfile | null>(null)
  const [allThemes, setAllThemes] = useState<string[]>([])
  const [selectedThemes, setSelectedThemes] = useState<string[]>([])
  const [preset, setPreset] = useState(0)
  const [fetching, setFetching] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [showThemes, setShowThemes] = useState(false)
  const [showTimer, setShowTimer] = useState(() => localStorage.getItem('puzzleShowTimer') !== 'false')

  // Recent attempted puzzles (deduped, most-recent first) for prev/next navigation.
  const [navList, setNavList] = useState<PuzzleOut[]>([])
  // Index into navList of the puzzle being shown, or -1 when on a fresh random puzzle.
  const [navCursor, setNavCursor] = useState(-1)
  // Move-review pointer once a puzzle is finished, tagged with the puzzle it belongs to so it
  // auto-resets when a new puzzle loads (no reset effect needed). null = show live final position.
  const [review, setReview] = useState<{ puzzleId: number; idx: number } | null>(null)

  function toggleTimer() {
    setShowTimer(prev => {
      const next = !prev
      localStorage.setItem('puzzleShowTimer', String(next))
      return next
    })
  }

  useEffect(() => {
    if (!accessToken) return
    apiFetchThemes(accessToken).then(setAllThemes).catch(() => {})
    apiFetchPuzzleProfile(accessToken).then(setProfile).catch(() => {})
  }, [accessToken])

  // Refresh profile + recent-puzzle nav list whenever an attempt finishes.
  useEffect(() => {
    if (!accessToken) return
    if (state.phase !== Phase.Solved && state.phase !== Phase.Failed) return
    if (!state.attemptResult) return
    apiFetchPuzzleProfile(accessToken).then(setProfile).catch(() => {})
    refreshNavList()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, state.phase, state.attemptResult])

  // Build the deduped list of recently attempted puzzles (most recent first) for prev/next nav.
  function refreshNavList() {
    if (!accessToken) return
    apiFetchHistory({ accessToken, limit: 100, sort: 'date', order: 'desc' })
      .then(res => {
        const seen = new Set<number>()
        const list: PuzzleOut[] = []
        for (const item of res.items) {
          if (seen.has(item.puzzle_id)) continue
          seen.add(item.puzzle_id)
          list.push(itemToPuzzle(item))
        }
        setNavList(list)
      })
      .catch(() => {})
  }

  useEffect(() => {
    refreshNavList()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken])

  // A puzzle handed over from the History page ("Solve again"). Consuming one-shot router
  // navigation state is exactly what an effect is for; the load + state-clear run once because
  // we immediately replace the history entry, after which `incoming` is undefined.
  useEffect(() => {
    const incoming = (location.state as { puzzle?: PuzzleOut } | null)?.puzzle
    if (!incoming) return
    loadPuzzle(incoming)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNavCursor(-1)
    navigate(location.pathname, { replace: true, state: null })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state])

  async function fetchAndLoadPuzzle() {
    if (!accessToken) return
    setFetching(true)
    setFetchError(null)
    try {
      const p = PRESETS[preset]
      const puzzle = await apiFetchNextPuzzle({
        accessToken,
        minRating: p.min,
        maxRating: p.max,
        themes: selectedThemes.length > 0 ? selectedThemes : undefined,
      })
      loadPuzzle(puzzle)
      setNavCursor(-1)
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : 'Failed to load puzzle')
    } finally {
      setFetching(false)
    }
  }

  // Step to an older (dir=+1) or newer (dir=-1) previously-attempted puzzle.
  function navigatePuzzle(dir: 1 | -1) {
    if (navList.length === 0) return
    const target = navCursor === -1 ? (dir === 1 ? 0 : -1) : navCursor + dir
    if (target < 0 || target >= navList.length) return
    loadPuzzle(navList[target])
    setNavCursor(target)
  }

  const canGoOlder = navList.length > 0 && (navCursor === -1 || navCursor < navList.length - 1)
  const canGoNewer = navCursor > 0

  function toggleTheme(t: string) {
    setSelectedThemes(prev =>
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
    )
  }

  const isDone = state.phase === Phase.Solved || state.phase === Phase.Failed
  const isIdle = state.phase === Phase.Idle
  const isLoading = state.phase === Phase.Loading
  const msgInfo = phaseMessage(state.phase, state.mistakes)
  const delta = state.attemptResult?.delta

  // ── Move review (after a puzzle is finished) ───────────────────────────────
  const reviewFens = isDone && state.puzzle ? buildReviewFens(state.puzzle) : []
  const totalPlies = Math.max(0, reviewFens.length - 1)
  // The pointer only counts when it belongs to the current puzzle; otherwise we're at the live position.
  const reviewIdx = review && state.puzzle && review.puzzleId === state.puzzle.id ? review.idx : null
  const effectiveReviewIdx = reviewIdx ?? totalPlies
  const overrideFen = isDone && reviewIdx !== null ? reviewFens[reviewIdx] : undefined
  const reviewMove =
    isDone && reviewIdx !== null && reviewIdx >= 1 && state.puzzle
      ? { from: state.puzzle.moves[reviewIdx - 1].slice(0, 2), to: state.puzzle.moves[reviewIdx - 1].slice(2, 4) }
      : null

  function reviewSeek(idx: number) {
    if (!isDone || !state.puzzle) return
    setReview({ puzzleId: state.puzzle.id, idx: Math.max(0, Math.min(totalPlies, idx)) })
  }

  return (
    <div style={pageStyle}>
      {/* Nav */}
      <nav style={{ ...navStyle, padding: isMobile ? 'var(--space-3) var(--space-4)' : 'var(--space-4) var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <div style={navLeftStyle}>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: '6px 10px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              background: 'transparent',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 600,
              transition: 'all var(--transition-fast)',
            }}
            title="Back to home"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Home
          </button>
          <span style={{ ...navTitleStyle, fontSize: isMobile ? 'var(--font-size-base)' : 'var(--font-size-xl)' }}>♟ Puzzle Trainer</span>
        </div>
        <div style={navRightStyle}>
          {showTimer && state.puzzle && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
              padding: '4px 12px', borderRadius: 'var(--radius-full)',
              background: 'var(--color-bg-subtle)', color: 'var(--color-text-primary)',
              fontVariantNumeric: 'tabular-nums', fontWeight: 700, fontSize: 'var(--font-size-base)',
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="13" r="8" />
                <path d="M12 9v4l2 2M9 2h6" />
              </svg>
              <PuzzleTimer startTime={state.startTime} endTime={state.endTime} running={state.startTime !== null && !isDone} />
            </div>
          )}
          {profile && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-1)' }}>
              <span style={{ fontSize: 'var(--font-size-xs, 0.75rem)', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rating</span>
              <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1 }}>{Math.round(profile.rating)}</span>
            </div>
          )}
          <ThemeToggle />
        </div>
      </nav>

      <div style={{ ...contentStyle, padding: isMobile ? 'var(--space-4)' : 'var(--space-6)' }}>
        {/* Filter bar */}
        <div style={filterBarStyle}>
          <div style={filterRowStyle}>
            <span style={filterLabelStyle}>Difficulty</span>
            {PRESETS.map((p, i) => (
              <button key={p.label} style={presetBtnStyle(preset === i)} onClick={() => setPreset(i)}>
                {p.label}
              </button>
            ))}
          </div>

          <div style={filterRowStyle}>
            <span style={filterLabelStyle}>Themes</span>
            <button style={presetBtnStyle(false)} onClick={() => setShowThemes(v => !v)}>
              {showThemes ? 'Hide ▲' : `Browse ▼${selectedThemes.length > 0 ? ` (${selectedThemes.length} selected)` : ''}`}
            </button>
            {selectedThemes.length > 0 && (
              <button style={presetBtnStyle(false)} onClick={() => setSelectedThemes([])}>
                Clear all
              </button>
            )}
          </div>

          {showThemes && allThemes.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', maxHeight: '160px', overflowY: 'auto', paddingRight: 'var(--space-1)' }}>
              {allThemes.map(t => (
                <button key={t} style={themePillStyle(selectedThemes.includes(t))} onClick={() => toggleTheme(t)}>
                  {formatTheme(t)}
                </button>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)', marginTop: 'var(--space-1)', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
              <button
                onClick={toggleTimer}
                role="switch"
                aria-checked={showTimer}
                style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-sans)', fontSize: 'var(--font-size-sm)', fontWeight: 600,
                  color: 'var(--color-text-secondary)', padding: 0,
                }}
                title={showTimer ? 'Hide the puzzle timer' : 'Show a timer for each puzzle'}
              >
                <span style={{
                  position: 'relative', width: 36, height: 20, borderRadius: 'var(--radius-full)',
                  background: showTimer ? 'var(--color-primary)' : 'var(--color-border)',
                  transition: 'background var(--transition-fast)', flexShrink: 0,
                }}>
                  <span style={{
                    position: 'absolute', top: 2, left: showTimer ? 18 : 2, width: 16, height: 16,
                    borderRadius: '50%', background: '#fff', transition: 'left var(--transition-fast)',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.25)',
                  }} />
                </span>
                Timer
              </button>
              {fetchError && (
                <span style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>{fetchError}</span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <ReviewBtn label="←" title="Previous attempted puzzle" onClick={() => navigatePuzzle(1)} disabled={!canGoOlder} />
              <ReviewBtn label="→" title="Next attempted puzzle" onClick={() => navigatePuzzle(-1)} disabled={!canGoNewer} />
              <Button
                variant="primary"
                size="md"
                loading={fetching}
                onClick={fetchAndLoadPuzzle}
              >
                {isIdle ? 'Start Puzzle' : 'New Puzzle'}
              </Button>
            </div>
          </div>
        </div>

        {/* Board + info — always rendered to prevent layout jumps */}
        <div style={{ ...boardAreaStyle, flexDirection: stack ? 'column' : 'row', alignItems: stack ? 'stretch' : 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', flexShrink: 0, alignItems: 'center', alignSelf: stack ? 'center' : 'auto' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <ChessBoard state={state} onPieceDrop={handlePieceDrop} width={boardSize} overrideFen={overrideFen} reviewMove={reviewMove} />
            {(isIdle || isLoading) && (
              <div style={boardOverlayStyle(isIdle)}>
                {isIdle && (
                  <div style={{ color: '#fff', fontSize: 'var(--font-size-sm)', fontWeight: 600, textAlign: 'center', padding: 'var(--space-4)', lineHeight: 1.6 }}>
                    Select a difficulty above<br />and press <strong>Start Puzzle</strong>
                  </div>
                )}
                {isLoading && (
                  <div style={{ color: '#fff', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                    Loading…
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Move review controls — step through the solution after finishing */}
          {isDone && totalPlies > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)',
              padding: 'var(--space-2) var(--space-3)', background: 'var(--color-surface)',
              border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)',
            }}>
              <ReviewBtn label="⏮" title="First position" onClick={() => reviewSeek(0)} disabled={effectiveReviewIdx <= 0} />
              <ReviewBtn label="◀" title="Previous move" onClick={() => reviewSeek(effectiveReviewIdx - 1)} disabled={effectiveReviewIdx <= 0} />
              <span style={{
                minWidth: 96, textAlign: 'center', fontSize: 'var(--font-size-sm)', fontWeight: 700,
                color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums',
              }}>
                Move {effectiveReviewIdx} / {totalPlies}
              </span>
              <ReviewBtn label="▶" title="Next move" onClick={() => reviewSeek(effectiveReviewIdx + 1)} disabled={effectiveReviewIdx >= totalPlies} />
              <ReviewBtn label="⏭" title="Final position" onClick={() => reviewSeek(totalPlies)} disabled={effectiveReviewIdx >= totalPlies} />
            </div>
          )}
          </div>

          <div style={{ ...infoPanelStyle, minHeight: stack ? 'auto' : '480px', minWidth: stack ? 0 : '260px', width: stack ? '100%' : undefined }}>
            {state.puzzle ? (
              <>
                {/* Whose move */}
                {!isDone && (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)',
                    padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)',
                    background: 'var(--color-bg-subtle)', color: 'var(--color-text-primary)',
                    fontSize: 'var(--font-size-sm)', fontWeight: 700,
                  }}>
                    <span style={{
                      width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                      background: state.orientation === 'white' ? '#ffffff' : '#1a1a1a',
                      border: '1px solid var(--color-border)',
                    }} />
                    {state.orientation === 'white' ? 'White to play' : 'Black to play'}
                  </div>
                )}

                {/* Status */}
                <div style={statusBoxStyle(msgInfo.ok)}>{msgInfo.text}</div>

                {/* Completion time */}
                {isDone && showTimer && state.startTime !== null && (
                  <div style={{ textAlign: 'center', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', fontWeight: 600, marginTop: 'calc(-1 * var(--space-2))' }}>
                    {state.phase === Phase.Solved ? 'Solved' : 'Finished'} in{' '}
                    <span style={{ color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                      <PuzzleTimer startTime={state.startTime} endTime={state.endTime} running={false} />
                    </span>
                  </div>
                )}

                {/* Replay notice — re-solving doesn't change rating or stats */}
                {isDone && state.attemptResult?.is_repeat && (
                  <div style={{
                    textAlign: 'center', fontSize: 'var(--font-size-sm)', fontWeight: 600,
                    color: 'var(--color-text-secondary)', background: 'var(--color-bg-subtle)',
                    borderRadius: 'var(--radius-md)', padding: 'var(--space-2) var(--space-3)',
                  }}>
                    🔁 Replay — rating & stats unchanged
                  </div>
                )}

                {/* Rating delta */}
                {isDone && state.attemptResult && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={sectionTitleStyle}>Puzzle Rating</div>
                      <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        {state.puzzle.rating}
                      </div>
                    </div>
                    {delta !== undefined && delta !== 0 && (
                      <div style={{ textAlign: 'right' }}>
                        <div style={sectionTitleStyle}>Your Rating</div>
                        <div style={deltaBadge(delta)}>
                          {delta > 0 ? `+${Math.round(delta)}` : Math.round(delta)}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!isDone && (
                  <div>
                    <div style={sectionTitleStyle}>Puzzle Rating</div>
                    <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      {state.puzzle.rating}
                    </div>
                  </div>
                )}

                {/* Themes */}
                {state.puzzle.themes.length > 0 && (
                  <div>
                    <div style={{ ...sectionTitleStyle, marginBottom: 'var(--space-2)' }}>Themes</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                      {state.puzzle.themes.map(t => (
                        <span key={t} style={tagStyle}>{formatTheme(t)}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'auto' }}>
                  {!isDone && !state.solutionRevealed && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={requestHint}
                        disabled={state.phase !== Phase.PlayerTurn}
                      >
                        {state.hintLevel === 0
                          ? '💡 Hint (show from-square)'
                          : state.hintLevel === 1
                          ? '💡 Hint (show target too)'
                          : '💡 Max hints used'}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={revealSolution}
                        disabled={state.phase === Phase.Loading || state.phase === Phase.Intro}
                      >
                        Show Solution
                      </Button>
                    </>
                  )}

                  {isDone && (
                    <Button variant="primary" size="md" onClick={fetchAndLoadPuzzle} loading={fetching}>
                      Next Puzzle →
                    </Button>
                  )}
                </div>
              </>
            ) : (
              /* Idle — no puzzle loaded yet */
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-4)', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', lineHeight: 1 }}>♟</div>
                <div>
                  <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 'var(--space-1)' }}>
                    Ready to train?
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                    Pick a difficulty above and<br />press <strong>Start Puzzle</strong> to begin.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ReviewBtn({ label, title, onClick, disabled }: { label: string; title: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 36, height: 36, borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)', background: 'var(--color-surface)',
        color: disabled ? 'var(--color-text-muted)' : 'var(--color-text-secondary)',
        cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.5 : 1,
        fontFamily: 'var(--font-sans)', fontSize: 'var(--font-size-base)', fontWeight: 700,
        transition: 'all var(--transition-fast)', flexShrink: 0,
      }}
    >
      {label}
    </button>
  )
}
