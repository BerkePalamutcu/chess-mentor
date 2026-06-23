// ─── Design System Tokens ─────────────────────────────────────────────────────
// Single source of truth for all visual design decisions.
// Change values here; every component updates automatically via CSS variables.

export type ThemeMode = 'light' | 'dark'

type TokenMap = Record<string, string>

export const lightTokens: TokenMap = {
  // Backgrounds
  '--color-bg':          '#f0f4f8',
  '--color-bg-subtle':   '#e8edf3',
  '--color-surface':     '#ffffff',
  '--color-surface-2':   '#f7f9fc',
  '--color-overlay':     'rgba(0, 0, 0, 0.4)',

  // Borders
  '--color-border':      '#d0dbe8',
  '--color-border-focus':'#1a56db',

  // Text
  '--color-text-primary':   '#1e2a3a',
  '--color-text-secondary': '#4a5568',
  '--color-text-muted':     '#718096',
  '--color-text-inverse':   '#ffffff',

  // Brand / Primary
  '--color-primary':       '#1a56db',
  '--color-primary-hover': '#1341c0',
  '--color-primary-subtle':'#e8f0fe',
  '--color-primary-text':  '#ffffff',

  // Semantic
  '--color-error':        '#c53030',
  '--color-error-bg':     '#fff5f5',
  '--color-error-border': '#fed7d7',
  '--color-success':      '#276749',
  '--color-success-bg':   '#f0fff4',
  '--color-warning':      '#975a16',
  '--color-warning-bg':   '#fffbeb',

  // Component tokens
  '--color-input-bg':     '#ffffff',
  '--color-input-border': '#cbd5e0',

  // Radius
  '--radius-sm':  '4px',
  '--radius-md':  '8px',
  '--radius-lg':  '12px',
  '--radius-xl':  '16px',
  '--radius-full':'9999px',

  // Shadows
  '--shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.10)',
  '--shadow-md': '0 4px 6px rgba(0, 0, 0, 0.07), 0 10px 15px rgba(0, 0, 0, 0.10)',
  '--shadow-lg': '0 10px 25px rgba(0, 0, 0, 0.10), 0 20px 48px rgba(0, 0, 0, 0.12)',

  // Typography
  '--font-sans': "'Inter', 'Segoe UI', system-ui, sans-serif",
  '--font-size-sm':   '0.875rem',
  '--font-size-base': '1rem',
  '--font-size-lg':   '1.125rem',
  '--font-size-xl':   '1.25rem',
  '--font-size-2xl':  '1.5rem',
  '--font-size-3xl':  '1.875rem',

  // Spacing scale (use as --space-N)
  '--space-1':  '4px',
  '--space-2':  '8px',
  '--space-3':  '12px',
  '--space-4':  '16px',
  '--space-5':  '20px',
  '--space-6':  '24px',
  '--space-8':  '32px',
  '--space-10': '40px',
  '--space-12': '48px',
  '--space-16': '64px',

  // Transitions
  '--transition-fast':   '120ms ease',
  '--transition-normal': '200ms ease',
}

export const darkTokens: TokenMap = {
  // Backgrounds (chess-club night palette — deep navy)
  '--color-bg':          '#0f172a',
  '--color-bg-subtle':   '#1e293b',
  '--color-surface':     '#1e293b',
  '--color-surface-2':   '#263348',
  '--color-overlay':     'rgba(0, 0, 0, 0.6)',

  // Borders
  '--color-border':      '#334155',
  '--color-border-focus':'#60a5fa',

  // Text
  '--color-text-primary':   '#f1f5f9',
  '--color-text-secondary': '#94a3b8',
  '--color-text-muted':     '#64748b',
  '--color-text-inverse':   '#0f172a',

  // Brand / Primary
  '--color-primary':       '#60a5fa',
  '--color-primary-hover': '#93c5fd',
  '--color-primary-subtle':'#1e3a5f',
  '--color-primary-text':  '#0f172a',

  // Semantic
  '--color-error':        '#fc8181',
  '--color-error-bg':     '#1a1a2e',
  '--color-error-border': '#742a2a',
  '--color-success':      '#68d391',
  '--color-success-bg':   '#1a2e1a',
  '--color-warning':      '#f6e05e',
  '--color-warning-bg':   '#2d2a1a',

  // Component tokens
  '--color-input-bg':     '#263348',
  '--color-input-border': '#475569',

  // Radius (same as light)
  '--radius-sm':  '4px',
  '--radius-md':  '8px',
  '--radius-lg':  '12px',
  '--radius-xl':  '16px',
  '--radius-full':'9999px',

  // Shadows (darker, more diffuse)
  '--shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.4)',
  '--shadow-md': '0 4px 6px rgba(0, 0, 0, 0.3), 0 10px 15px rgba(0, 0, 0, 0.4)',
  '--shadow-lg': '0 10px 25px rgba(0, 0, 0, 0.4), 0 20px 48px rgba(0, 0, 0, 0.5)',

  // Typography (same as light)
  '--font-sans': "'Inter', 'Segoe UI', system-ui, sans-serif",
  '--font-size-sm':   '0.875rem',
  '--font-size-base': '1rem',
  '--font-size-lg':   '1.125rem',
  '--font-size-xl':   '1.25rem',
  '--font-size-2xl':  '1.5rem',
  '--font-size-3xl':  '1.875rem',

  // Spacing scale
  '--space-1':  '4px',
  '--space-2':  '8px',
  '--space-3':  '12px',
  '--space-4':  '16px',
  '--space-5':  '20px',
  '--space-6':  '24px',
  '--space-8':  '32px',
  '--space-10': '40px',
  '--space-12': '48px',
  '--space-16': '64px',

  // Transitions
  '--transition-fast':   '120ms ease',
  '--transition-normal': '200ms ease',
}

export const themeTokens: Record<ThemeMode, TokenMap> = {
  light: lightTokens,
  dark: darkTokens,
}
