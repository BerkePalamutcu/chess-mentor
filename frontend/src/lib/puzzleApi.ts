import { request } from './http'

const BASE = '/api'

export type PuzzleOut = {
  id: number
  lichess_id: string
  fen: string
  moves: string[]
  rating: number
  themes: string[]
  opening_tags: string[]
  popularity: number
}

export type AttemptResult = {
  rating_before: number
  rating_after: number
  delta: number
  puzzles_solved: number
  puzzles_attempted: number
  streak: number
  is_repeat: boolean
}

export type PuzzleProfile = {
  rating: number
  rating_deviation: number
  puzzles_solved: number
  puzzles_attempted: number
  streak: number
  best_streak: number
}

export type PuzzleAttemptItem = {
  id: number
  puzzle_id: number
  lichess_id: string
  fen: string
  moves: string[]
  rating: number
  themes: string[]
  opening_tags: string[]
  result: 'solved' | 'failed'
  moves_played: string[]
  hints_used: number
  solution_revealed: boolean
  time_seconds: number
  rating_before: number
  rating_after: number
  created_at: string
}

export type HistoryResponse = {
  items: PuzzleAttemptItem[]
  total: number
}

export type HistorySort = 'date' | 'rating' | 'result'

type FetchOptions = {
  accessToken: string
  signal?: AbortSignal
}

export async function apiFetchNextPuzzle(
  opts: FetchOptions & {
    minRating?: number
    maxRating?: number
    themes?: string[]
  },
): Promise<PuzzleOut> {
  const params = new URLSearchParams()
  if (opts.minRating != null) params.set('min_rating', String(opts.minRating))
  if (opts.maxRating != null) params.set('max_rating', String(opts.maxRating))
  if (opts.themes?.length) params.set('themes', opts.themes.join(','))

  return request<PuzzleOut>(`${BASE}/puzzles/next?${params}`, {
    authToken: opts.accessToken,
    signal: opts.signal,
  })
}

export async function apiSubmitAttempt(
  opts: FetchOptions & {
    puzzleId: number
    result: 'solved' | 'failed'
    movesPlayed: string[]
    hintsUsed: number
    solutionRevealed: boolean
    timeSeconds: number
  },
): Promise<AttemptResult> {
  return request<AttemptResult>(`${BASE}/puzzles/attempt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    authToken: opts.accessToken,
    body: JSON.stringify({
      puzzle_id: opts.puzzleId,
      result: opts.result,
      moves_played: opts.movesPlayed,
      hints_used: opts.hintsUsed,
      solution_revealed: opts.solutionRevealed,
      time_seconds: opts.timeSeconds,
    }),
  })
}

export async function apiFetchPuzzleProfile(accessToken: string): Promise<PuzzleProfile> {
  return request<PuzzleProfile>(`${BASE}/puzzles/profile`, { authToken: accessToken })
}

export async function apiFetchHistory(
  opts: FetchOptions & {
    result?: 'solved' | 'failed'
    search?: string
    sort?: HistorySort
    order?: 'asc' | 'desc'
    limit?: number
    offset?: number
  },
): Promise<HistoryResponse> {
  const params = new URLSearchParams()
  if (opts.result) params.set('result', opts.result)
  if (opts.search) params.set('search', opts.search)
  if (opts.sort) params.set('sort', opts.sort)
  if (opts.order) params.set('order', opts.order)
  if (opts.limit != null) params.set('limit', String(opts.limit))
  if (opts.offset != null) params.set('offset', String(opts.offset))

  return request<HistoryResponse>(`${BASE}/puzzles/history?${params}`, {
    authToken: opts.accessToken,
    signal: opts.signal,
  })
}

export async function apiFetchThemes(accessToken: string): Promise<string[]> {
  const data = await request<{ themes: string[] }>(`${BASE}/puzzles/themes`, { authToken: accessToken })
  return data.themes
}
