import { Chess } from 'chess.js'
import { useEffect, useReducer, useRef } from 'react'
import type { AttemptResult, PuzzleOut } from '../lib/puzzleApi'
import { apiSubmitAttempt } from '../lib/puzzleApi'

// ── Phase ─────────────────────────────────────────────────────────────────────

export const Phase = {
  Idle: 'idle',
  Loading: 'loading',
  Intro: 'intro',         // showing position before setup move
  PlayerTurn: 'player_turn',
  WrongMove: 'wrong_move',
  OpponentMove: 'opponent_move',
  Solved: 'solved',
  Failed: 'failed',
} as const
export type Phase = (typeof Phase)[keyof typeof Phase]

/** Standard chess starting position. react-chessboard v5 requires a real FEN (not the string 'start'). */
export const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

// ── State ─────────────────────────────────────────────────────────────────────

export type PuzzleState = {
  phase: Phase
  puzzle: PuzzleOut | null
  fen: string
  orientation: 'white' | 'black'
  /** Solution moves only — moves[1:] from puzzle.moves */
  solutionMoves: string[]
  moveIndex: number
  hintsUsed: number
  mistakes: number
  solutionRevealed: boolean
  startTime: number | null
  /** Set when the puzzle is solved or failed — used to freeze the final elapsed time */
  endTime: number | null
  attemptResult: AttemptResult | null
  error: string | null
  /** UCI of last wrong move for animation (cleared after timeout) */
  wrongMove: { from: string; to: string } | null
  /** Hint level: 0=none, 1=from-square, 2=from+to */
  hintLevel: number
  /** Moves user has played so far */
  movesPlayed: string[]
}

// ── Actions ───────────────────────────────────────────────────────────────────

type Action =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_PUZZLE'; puzzle: PuzzleOut; fen: string; orientation: 'white' | 'black'; solutionMoves: string[] }
  | { type: 'SETUP_MOVE_DONE'; fen: string }
  | { type: 'CORRECT_MOVE'; fen: string; uci: string }
  | { type: 'WRONG_MOVE'; from: string; to: string }
  | { type: 'OPPONENT_MOVE_DONE'; fen: string }
  | { type: 'REPLAY_MOVE'; fen: string }
  | { type: 'SOLVED'; result: AttemptResult }
  | { type: 'FAILED'; result: AttemptResult }
  | { type: 'HINT' }
  | { type: 'REVEAL_SOLUTION' }
  | { type: 'ERROR'; message: string }
  | { type: 'RESET' }

const initialState: PuzzleState = {
  phase: Phase.Idle,
  puzzle: null,
  fen: START_FEN,
  orientation: 'white',
  solutionMoves: [],
  moveIndex: 0,
  hintsUsed: 0,
  mistakes: 0,
  solutionRevealed: false,
  startTime: null,
  endTime: null,
  attemptResult: null,
  error: null,
  wrongMove: null,
  hintLevel: 0,
  movesPlayed: [],
}

function reducer(state: PuzzleState, action: Action): PuzzleState {
  switch (action.type) {
    case 'LOAD_START':
      // Preserve visual state so the board doesn't collapse and cause a layout jump
      return { ...initialState, phase: Phase.Loading, puzzle: state.puzzle, fen: state.fen, orientation: state.orientation }
    case 'LOAD_PUZZLE':
      return {
        ...initialState,
        phase: Phase.Intro,
        puzzle: action.puzzle,
        fen: action.fen,
        orientation: action.orientation,
        solutionMoves: action.solutionMoves,
        startTime: Date.now(),
      }
    case 'SETUP_MOVE_DONE':
      return { ...state, phase: Phase.PlayerTurn, fen: action.fen }
    case 'CORRECT_MOVE': {
      const next = state.moveIndex + 1
      const isLast = next >= state.solutionMoves.length
      return {
        ...state,
        fen: action.fen,
        moveIndex: next,
        movesPlayed: [...state.movesPlayed, action.uci],
        phase: isLast ? Phase.Solved : Phase.OpponentMove,
        endTime: isLast ? Date.now() : state.endTime,
        hintLevel: 0,
      }
    }
    case 'WRONG_MOVE':
      return {
        ...state,
        phase: Phase.WrongMove,
        mistakes: state.mistakes + 1,
        wrongMove: { from: action.from, to: action.to },
        movesPlayed: [...state.movesPlayed, `${action.from}${action.to}`],
      }
    case 'OPPONENT_MOVE_DONE':
      // Advance past the opponent's reply so moveIndex points at the next player move.
      // Without this, the hint and move-validation target the move the opponent just played.
      return { ...state, phase: Phase.PlayerTurn, fen: action.fen, moveIndex: state.moveIndex + 1 }
    case 'REPLAY_MOVE':
      // Visual-only update while replaying a revealed solution — must NOT change phase
      return { ...state, fen: action.fen }
    case 'SOLVED':
      return { ...state, phase: Phase.Solved, attemptResult: action.result }
    case 'FAILED':
      return { ...state, phase: Phase.Failed, attemptResult: action.result, solutionRevealed: true, endTime: state.endTime ?? Date.now() }
    case 'HINT':
      return { ...state, hintsUsed: state.hintsUsed + 1, hintLevel: Math.min(2, state.hintLevel + 1) }
    case 'REVEAL_SOLUTION':
      // Reveal marks the puzzle failed immediately so the board freezes and the attempt is submitted
      return { ...state, solutionRevealed: true, phase: Phase.Failed, endTime: state.endTime ?? Date.now() }
    case 'ERROR':
      return { ...state, phase: Phase.Idle, error: action.message }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export type UsePuzzleReturn = {
  state: PuzzleState
  loadPuzzle: (puzzle: PuzzleOut) => void
  handlePieceDrop: (from: string, to: string) => boolean
  requestHint: () => void
  revealSolution: () => void
  reset: () => void
}

export function usePuzzle(accessToken: string | null): UsePuzzleReturn {
  const [state, dispatch] = useReducer(reducer, initialState)
  const chessRef = useRef<Chess>(new Chess())
  // Stable ref kept in sync via effect — used only inside setTimeout/async callbacks
  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  })

  // ── Setup move animation ──────────────────────────────────────────────────
  useEffect(() => {
    if (state.phase !== Phase.Intro || !state.puzzle) return
    const puzzle = state.puzzle
    const timer = setTimeout(() => {
      const chess = chessRef.current
      const setupUCI = puzzle.moves[0]
      chess.move({ from: setupUCI.slice(0, 2), to: setupUCI.slice(2, 4), promotion: setupUCI[4] as 'q' | undefined })
      dispatch({ type: 'SETUP_MOVE_DONE', fen: chess.fen() })
    }, 600)
    return () => clearTimeout(timer)
  }, [state.phase, state.puzzle])

  // ── Opponent move animation ───────────────────────────────────────────────
  useEffect(() => {
    if (state.phase !== Phase.OpponentMove) return
    const timer = setTimeout(() => {
      const { moveIndex, solutionMoves } = stateRef.current
      // After a correct user move, moveIndex was already incremented.
      // The opponent's move is at the new moveIndex.
      const oppUCI = solutionMoves[moveIndex]
      if (!oppUCI) return
      const chess = chessRef.current
      chess.move({ from: oppUCI.slice(0, 2), to: oppUCI.slice(2, 4), promotion: oppUCI[4] as 'q' | undefined })
      dispatch({ type: 'OPPONENT_MOVE_DONE', fen: chess.fen() })
    }, 500)
    return () => clearTimeout(timer)
  }, [state.phase])

  // ── Wrong move fails the puzzle ───────────────────────────────────────────
  // Flash the mistake briefly, then mark the puzzle failed and reveal the solution.
  // (The solution replay is driven by the solutionRevealed effect below.)
  useEffect(() => {
    if (state.phase !== Phase.WrongMove) return
    const timer = setTimeout(() => dispatch({ type: 'REVEAL_SOLUTION' }), 900)
    return () => clearTimeout(timer)
  }, [state.phase, state.mistakes])

  // ── Replay the solution once it is revealed (wrong move or "Show Solution") ─
  // REVEAL_SOLUTION already set phase=Failed; here we only replay the remaining moves visually.
  // REPLAY_MOVE updates the board fen without touching the terminal phase. setState happens inside
  // setTimeout (async), so it doesn't trigger cascading-render lint.
  const replayedRef = useRef(false)
  useEffect(() => {
    if (!state.solutionRevealed) {
      replayedRef.current = false
      return
    }
    if (replayedRef.current) return
    replayedRef.current = true

    const { solutionMoves } = stateRef.current
    let idx = stateRef.current.moveIndex
    let timer: ReturnType<typeof setTimeout>
    function playNext() {
      if (idx >= solutionMoves.length) return
      const uci = solutionMoves[idx]
      const chess = chessRef.current
      chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] as 'q' | undefined })
      dispatch({ type: 'REPLAY_MOVE', fen: chess.fen() })
      idx++
      if (idx < solutionMoves.length) timer = setTimeout(playNext, 700)
    }
    timer = setTimeout(playNext, 300)
    return () => clearTimeout(timer)
  }, [state.solutionRevealed])

  // ── Submit attempt when solved/failed ─────────────────────────────────────
  useEffect(() => {
    if ((state.phase !== Phase.Solved && state.phase !== Phase.Failed) || !state.puzzle || !accessToken) return
    if (state.attemptResult) return  // already submitted

    const elapsed = state.startTime ? ((state.endTime ?? Date.now()) - state.startTime) / 1000 : 0
    apiSubmitAttempt({
      accessToken,
      puzzleId: state.puzzle.id,
      result: state.phase === Phase.Solved ? 'solved' : 'failed',
      movesPlayed: state.movesPlayed,
      hintsUsed: state.hintsUsed,
      solutionRevealed: state.solutionRevealed,
      timeSeconds: elapsed,
    })
      .then(result => dispatch({ type: state.phase === Phase.Solved ? 'SOLVED' : 'FAILED', result }))
      .catch(() => {}) // silent — UI can still proceed
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase])

  // ── Public API ────────────────────────────────────────────────────────────

  function loadPuzzle(puzzle: PuzzleOut) {
    dispatch({ type: 'LOAD_START' })
    const chess = new Chess(puzzle.fen)
    chessRef.current = chess
    // Determine orientation: after setup move, whose turn is it?
    const tempChess = new Chess(puzzle.fen)
    tempChess.move({ from: puzzle.moves[0].slice(0, 2), to: puzzle.moves[0].slice(2, 4), promotion: puzzle.moves[0][4] as 'q' | undefined })
    const orientation = tempChess.turn() === 'w' ? 'white' : 'black'
    dispatch({
      type: 'LOAD_PUZZLE',
      puzzle,
      fen: puzzle.fen,
      orientation,
      solutionMoves: puzzle.moves.slice(1),  // skip setup move
    })
  }

  function handlePieceDrop(from: string, to: string): boolean {
    if (stateRef.current.phase !== Phase.PlayerTurn) return false
    const { moveIndex, solutionMoves } = stateRef.current
    const expected = solutionMoves[moveIndex]
    if (!expected) return false

    const eFrom = expected.slice(0, 2)
    const eTo = expected.slice(2, 4)
    const ePromo = expected[4] as 'q' | 'r' | 'b' | 'n' | undefined

    if (from === eFrom && to === eTo) {
      const chess = chessRef.current
      const move = chess.move({ from, to, promotion: ePromo || 'q' })
      if (!move) return false
      dispatch({ type: 'CORRECT_MOVE', fen: chess.fen(), uci: `${from}${to}${ePromo ?? ''}`.trim() })
      return true
    }

    // Wrong move — validate it's at least a legal chess move before flashing
    const tempChess = new Chess(chessRef.current.fen())
    const legalMove = tempChess.move({ from, to, promotion: 'q' })
    if (!legalMove) return false  // not even legal — snap back silently

    dispatch({ type: 'WRONG_MOVE', from, to })
    return false  // snap piece back
  }

  function requestHint() {
    if (stateRef.current.phase !== Phase.PlayerTurn) return
    dispatch({ type: 'HINT' })
  }

  function revealSolution() {
    if (stateRef.current.solutionRevealed) return
    // The solutionRevealed effect handles replaying the remaining moves.
    dispatch({ type: 'REVEAL_SOLUTION' })
  }

  function reset() {
    dispatch({ type: 'RESET' })
  }

  return { state, loadPuzzle, handlePieceDrop, requestHint, revealSolution, reset }
}
