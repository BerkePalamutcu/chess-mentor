import type { CSSProperties } from 'react'
import { Chessboard } from 'react-chessboard'
import type { PuzzleState } from '../../hooks/usePuzzle'
import { useBoardSettings } from '../../lib/boardStore'
import { resolveBoardTheme } from '../../lib/boardThemes'

type Props = {
  state: PuzzleState
  onPieceDrop: (from: string, to: string) => boolean
  width?: number
  /** When reviewing finished puzzles, override the board position. */
  overrideFen?: string
  /** Highlight the move (from/to) currently shown in review. */
  reviewMove?: { from: string; to: string } | null
}

function buildSquareStyles(
  state: PuzzleState,
  reviewMove?: { from: string; to: string } | null,
): Record<string, CSSProperties> {
  const styles: Record<string, CSSProperties> = {}

  // Review mode: just highlight the last-played move.
  if (reviewMove) {
    const hl: CSSProperties = { backgroundColor: 'rgba(59, 130, 246, 0.45)' }
    styles[reviewMove.from] = hl
    styles[reviewMove.to] = hl
    return styles
  }

  const { phase, wrongMove, hintLevel, solutionMoves, moveIndex } = state

  const correctMove = solutionMoves[moveIndex]

  if (phase === 'wrong_move' && wrongMove) {
    const flash: CSSProperties = { backgroundColor: 'rgba(220, 38, 38, 0.55)' }
    styles[wrongMove.from] = flash
    styles[wrongMove.to] = flash
  }

  if (phase === 'player_turn' && hintLevel >= 1 && correctMove) {
    styles[correctMove.slice(0, 2)] = { backgroundColor: 'rgba(250, 204, 21, 0.65)' }
  }
  if (phase === 'player_turn' && hintLevel >= 2 && correctMove) {
    styles[correctMove.slice(2, 4)] = { backgroundColor: 'rgba(34, 197, 94, 0.65)' }
  }

  return styles
}

const boardWrapperStyle: CSSProperties = {
  borderRadius: 'var(--radius-lg)',
  overflow: 'hidden',
  boxShadow: 'var(--shadow-lg)',
}

export function ChessBoard({ state, onPieceDrop, width = 480, overrideFen, reviewMove }: Props) {
  const isReviewing = overrideFen != null
  const isDraggable = !isReviewing && state.phase === 'player_turn'
  const customStyles = buildSquareStyles(state, isReviewing ? reviewMove : null)

  const { themeId, showNotation, showAnimations } = useBoardSettings()
  const theme = resolveBoardTheme(themeId)

  return (
    <div style={{ ...boardWrapperStyle, width, height: width, flexShrink: 0 }}>
      <Chessboard
        options={{
          position: overrideFen ?? state.fen,
          boardOrientation: state.orientation,
          onPieceDrop: ({ sourceSquare, targetSquare }) => onPieceDrop(sourceSquare, targetSquare ?? ''),
          allowDragging: isDraggable,
          squareStyles: customStyles,
          boardStyle: { borderRadius: '0' },
          darkSquareStyle: { backgroundColor: theme.dark },
          lightSquareStyle: { backgroundColor: theme.light },
          showNotation,
          animationDurationInMs: showAnimations ? 200 : 0,
          showAnimations,
        }}
      />
    </div>
  )
}
