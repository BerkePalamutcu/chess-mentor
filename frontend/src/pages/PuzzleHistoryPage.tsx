import { Chess } from 'chess.js'
import type { CSSProperties } from 'react'
import { useEffect, useState } from 'react'
import { Chessboard } from 'react-chessboard'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { ThemeToggle } from '../components/ui/ThemeToggle'
import { useAuth } from '../hooks/useAuth'
import { useViewport } from '../hooks/useViewport'
import { apiFetchHistory } from '../lib/puzzleApi'
import type { HistorySort, PuzzleAttemptItem } from '../lib/puzzleApi'

const PAGE_SIZE = 20

// ── Styles ──────────────────────────────────────────────────────────────────

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

const navLeftStyle: CSSProperties = { display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }
const navTitleStyle: CSSProperties = { fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-text-primary)' }

const contentStyle: CSSProperties = {
  flex: 1,
  width: '100%',
  maxWidth: '1000px',
  margin: '0 auto',
  padding: 'var(--space-6)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-4)',
}

const controlBarStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 'var(--space-3)',
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-4)',
}

const inputStyle: CSSProperties = {
  flex: 1,
  minWidth: 180,
  padding: '8px 12px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-bg)',
  color: 'var(--color-text-primary)',
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--font-size-sm)',
}

const pillStyle = (active: boolean): CSSProperties => ({
  padding: '6px 12px',
  borderRadius: 'var(--radius-full)',
  border: `1px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
  background: active ? 'var(--color-primary-subtle)' : 'transparent',
  color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
  fontSize: 'var(--font-size-sm)',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'var(--font-sans)',
})

const rowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '90px 70px 1fr 130px 110px',
  alignItems: 'center',
  gap: 'var(--space-3)',
  padding: 'var(--space-3) var(--space-4)',
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
}

const headerRowStyle: CSSProperties = {
  ...rowStyle,
  background: 'transparent',
  border: 'none',
  padding: '0 var(--space-4)',
  fontSize: 'var(--font-size-xs, 0.75rem)',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--color-text-muted)',
}

const resultBadge = (solved: boolean): CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '2px 10px',
  borderRadius: 'var(--radius-full)',
  fontSize: 'var(--font-size-sm)',
  fontWeight: 700,
  background: solved ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
  color: solved ? 'var(--color-success)' : 'var(--color-error)',
})

const tagStyle: CSSProperties = {
  display: 'inline-block',
  padding: '1px 8px',
  borderRadius: 'var(--radius-full)',
  background: 'var(--color-primary-subtle)',
  color: 'var(--color-primary)',
  fontSize: '0.72rem',
  fontWeight: 500,
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatTheme(t: string): string {
  return t.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ')
    .split(' ').filter(Boolean).map(w => w[0].toUpperCase() + w.slice(1)).join(' ')
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) +
    ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

function formatTime(seconds: number): string {
  const s = Math.round(seconds)
  const m = Math.floor(s / 60)
  return `${m}:${(s % 60).toString().padStart(2, '0')}`
}

/** The "motif" the solver faces = the position after the puzzle's setup move, oriented to the mover. */
function motifPosition(item: PuzzleAttemptItem): { fen: string; orientation: 'white' | 'black' } {
  try {
    const chess = new Chess(item.fen)
    const setup = item.moves[0]
    if (setup) {
      chess.move({ from: setup.slice(0, 2), to: setup.slice(2, 4), promotion: setup[4] as 'q' | undefined })
    }
    return { fen: chess.fen(), orientation: chess.turn() === 'w' ? 'white' : 'black' }
  } catch {
    return { fen: item.fen, orientation: 'white' }
  }
}

const PREVIEW_W = 240

/** Floating mini-board shown while hovering a history row. */
function BoardPreview({ item, x, y }: { item: PuzzleAttemptItem; x: number; y: number }) {
  const { fen, orientation } = motifPosition(item)
  // Keep the card on-screen near the cursor.
  const cardW = PREVIEW_W + 24
  const cardH = PREVIEW_W + 96
  const left = Math.min(x + 20, window.innerWidth - cardW - 8)
  const top = Math.min(Math.max(y - cardH / 2, 8), window.innerHeight - cardH - 8)

  return (
    <div style={{
      position: 'fixed', left, top, width: cardW, zIndex: 100, pointerEvents: 'none',
      background: 'var(--color-surface)', border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', padding: 'var(--space-3)',
    }}>
      <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', width: PREVIEW_W, height: PREVIEW_W }}>
        <Chessboard
          options={{
            position: fen,
            boardOrientation: orientation,
            allowDragging: false,
            showAnimations: false,
            boardStyle: { borderRadius: '0' },
            darkSquareStyle: { backgroundColor: '#779952' },
            lightSquareStyle: { backgroundColor: '#edeed1' },
          }}
        />
      </div>
      <div style={{ marginTop: 'var(--space-2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
        <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
          {orientation === 'white' ? 'White' : 'Black'} to move
        </span>
        <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-text-secondary)' }}>{item.rating}</span>
      </div>
      <div style={{ marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {item.themes.slice(0, 4).map(t => <span key={t} style={tagStyle}>{formatTheme(t)}</span>)}
        {item.themes.length === 0 && <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>No motif tags</span>}
      </div>
    </div>
  )
}

// ── Component ───────────────────────────────────────────────────────────────

export function PuzzleHistoryPage() {
  const { accessToken } = useAuth()
  const navigate = useNavigate()
  const { isMobile } = useViewport()

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [result, setResult] = useState<'all' | 'solved' | 'failed'>('all')
  const [sort, setSort] = useState<HistorySort>('date')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(0)

  const [items, setItems] = useState<PuzzleAttemptItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hover, setHover] = useState<{ item: PuzzleAttemptItem; x: number; y: number } | null>(null)

  // Debounce the search box.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(id)
  }, [search])

  useEffect(() => {
    if (!accessToken) return
    const controller = new AbortController()
    // eslint-disable-next-line react-hooks/set-state-in-effect -- show spinner while (re)fetching
    setLoading(true)
    apiFetchHistory({
      accessToken,
      signal: controller.signal,
      result: result === 'all' ? undefined : result,
      search: debouncedSearch || undefined,
      sort,
      order,
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    })
      .then(res => {
        setItems(res.items)
        setTotal(res.total)
        setError(null)
      })
      .catch(e => {
        if (e.name !== 'AbortError') setError(e instanceof Error ? e.message : 'Failed to load history')
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [accessToken, debouncedSearch, result, sort, order, page])

  function solveAgain(item: PuzzleAttemptItem) {
    navigate('/puzzles', {
      state: {
        puzzle: {
          id: item.puzzle_id,
          lichess_id: item.lichess_id,
          fen: item.fen,
          moves: item.moves,
          rating: item.rating,
          themes: item.themes,
          opening_tags: item.opening_tags,
          popularity: 0,
        },
      },
    })
  }

  function toggleSort(col: HistorySort) {
    if (sort === col) {
      setOrder(o => (o === 'desc' ? 'asc' : 'desc'))
    } else {
      setSort(col)
      setOrder('desc')
    }
    setPage(0)
  }

  function changeSearch(value: string) {
    setSearch(value)
    setPage(0)
  }

  function changeResult(r: 'all' | 'solved' | 'failed') {
    setResult(r)
    setPage(0)
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const arrow = (col: HistorySort) => (sort === col ? (order === 'desc' ? ' ↓' : ' ↑') : '')
  // On phones the table collapses to a two-column card; otherwise the full 5-column table.
  const gridCols = isMobile ? '1fr auto' : '90px 70px 1fr 130px 110px'

  return (
    <div style={pageStyle}>
      <nav style={{ ...navStyle, padding: isMobile ? 'var(--space-3) var(--space-4)' : 'var(--space-4) var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <div style={navLeftStyle}>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: '6px 10px',
              borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'transparent',
              color: 'var(--color-text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-sans)',
              fontSize: 'var(--font-size-sm)', fontWeight: 600,
            }}
            title="Back to home"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Home
          </button>
          <span style={navTitleStyle}>🗂 Puzzle History</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Button variant="primary" size="sm" onClick={() => navigate('/puzzles')}>Solve Puzzles</Button>
          <ThemeToggle />
        </div>
      </nav>

      <div style={{ ...contentStyle, padding: isMobile ? 'var(--space-4)' : 'var(--space-6)' }}>
        {/* Controls */}
        <div style={controlBarStyle}>
          <input
            style={inputStyle}
            placeholder="Search by theme or puzzle id…"
            value={search}
            onChange={e => changeSearch(e.target.value)}
          />
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {(['all', 'solved', 'failed'] as const).map(r => (
              <button key={r} style={pillStyle(result === r)} onClick={() => changeResult(r)}>
                {r === 'all' ? 'All' : r === 'solved' ? 'Solved' : 'Failed'}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button style={pillStyle(sort === 'date')} onClick={() => toggleSort('date')}>Date{arrow('date')}</button>
            <button style={pillStyle(sort === 'rating')} onClick={() => toggleSort('rating')}>Rating{arrow('rating')}</button>
            <button style={pillStyle(sort === 'result')} onClick={() => toggleSort('result')}>Result{arrow('result')}</button>
          </div>
        </div>

        {error && (
          <div style={{ color: 'var(--color-error)', fontWeight: 600 }}>{error}</div>
        )}

        {/* List */}
        {!error && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {!isMobile && (
              <div style={{ ...headerRowStyle, gridTemplateColumns: gridCols }}>
                <span>Result</span>
                <span>Rating</span>
                <span>Themes / Moves</span>
                <span>Last tried</span>
                <span style={{ textAlign: 'right' }}>Action</span>
              </div>
            )}

            {loading && items.length === 0 && (
              <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading…</div>
            )}

            {!loading && items.length === 0 && (
              <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                No puzzles found. {total === 0 && 'Solve some puzzles to build your history!'}
              </div>
            )}

            {items.map(item => (
              <div
                key={item.id}
                style={{ ...rowStyle, gridTemplateColumns: gridCols }}
                onMouseEnter={e => {
                  if (isMobile) return
                  const r = e.currentTarget.getBoundingClientRect()
                  setHover({ item, x: r.right, y: r.top + r.height / 2 })
                }}
                onMouseLeave={() => setHover(h => (h?.item.id === item.id ? null : h))}
              >
                <span>
                  <span style={resultBadge(item.result === 'solved')}>
                    {item.result === 'solved' ? '✓ Solved' : '✗ Failed'}
                  </span>
                </span>
                <span style={{ fontWeight: 700, color: 'var(--color-text-primary)', textAlign: isMobile ? 'right' : 'left' }}>{item.rating}</span>
                <span style={{ minWidth: 0, gridColumn: isMobile ? '1 / -1' : undefined }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '4px' }}>
                    {item.themes.slice(0, 4).map(t => <span key={t} style={tagStyle}>{formatTheme(t)}</span>)}
                    {item.themes.length === 0 && <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>—</span>}
                  </div>
                  <div style={{
                    fontSize: '0.72rem', color: 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }} title={item.moves_played.join(' ')}>
                    {item.moves_played.length > 0 ? `Your moves: ${item.moves_played.join(' ')}` : 'No moves played'}
                    {item.hints_used > 0 && ` · ${item.hints_used} hint${item.hints_used > 1 ? 's' : ''}`}
                    {item.time_seconds > 0 && ` · ${formatTime(item.time_seconds)}`}
                  </div>
                </span>
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{formatDate(item.created_at)}</span>
                <span style={{ textAlign: 'right' }}>
                  <Button variant="ghost" size="sm" onClick={() => solveAgain(item)}>Solve again</Button>
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > PAGE_SIZE && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
            <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>← Prev</Button>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
              Page {page + 1} of {totalPages} · {total} puzzles
            </span>
            <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>Next →</Button>
          </div>
        )}
      </div>

      {hover && !isMobile && <BoardPreview item={hover.item} x={hover.x} y={hover.y} />}
    </div>
  )
}
