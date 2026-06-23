import type { CSSProperties } from 'react'
import { Chessboard } from 'react-chessboard'
import { SettingsLayout } from '../components/layout/SettingsLayout'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useViewport } from '../hooks/useViewport'
import { useBoardSettings } from '../lib/boardStore'
import { boardThemes, resolveBoardTheme } from '../lib/boardThemes'

const PREVIEW_FEN = 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1'

const sectionTitleStyle: CSSProperties = {
  fontSize: 'var(--font-size-lg)',
  fontWeight: 700,
  color: 'var(--color-text-primary)',
  marginBottom: 'var(--space-1)',
}

const sectionDescStyle: CSSProperties = {
  fontSize: 'var(--font-size-sm)',
  color: 'var(--color-text-secondary)',
  marginBottom: 'var(--space-5)',
}

const swatchGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(132px, 1fr))',
  gap: 'var(--space-3)',
}

function swatchButtonStyle(active: boolean): CSSProperties {
  return {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-2)',
    padding: 'var(--space-2)',
    borderRadius: 'var(--radius-lg)',
    border: `2px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
    background: 'var(--color-surface-2)',
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
    boxShadow: active ? 'var(--shadow-sm)' : 'none',
  }
}

const swatchLabelStyle: CSSProperties = {
  fontSize: 'var(--font-size-sm)',
  fontWeight: 600,
  color: 'var(--color-text-primary)',
  textAlign: 'left',
}

const toggleRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: 'var(--space-3) 0',
}

const toggleLabelStyle: CSSProperties = {
  fontSize: 'var(--font-size-base)',
  fontWeight: 500,
  color: 'var(--color-text-primary)',
}

function MiniBoard({ light, dark }: { light: string; dark: string }) {
  // 4x4 checker preview rendered with plain divs — cheap, no chess engine needed.
  const cells = []
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      cells.push(
        <div
          key={`${r}-${c}`}
          style={{ background: (r + c) % 2 === 0 ? light : dark, width: '100%', height: '100%' }}
        />,
      )
    }
  }
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: 'repeat(4, 1fr)',
        aspectRatio: '1',
        width: '100%',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }}
    >
      {cells}
    </div>
  )
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div style={toggleRowStyle}>
      <span style={toggleLabelStyle}>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        style={{
          width: 44,
          height: 26,
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--color-border)',
          background: checked ? 'var(--color-primary)' : 'var(--color-surface-2)',
          position: 'relative',
          cursor: 'pointer',
          transition: 'background var(--transition-fast)',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 2,
            left: checked ? 20 : 2,
            width: 20,
            height: 20,
            borderRadius: 'var(--radius-full)',
            background: '#ffffff',
            boxShadow: 'var(--shadow-sm)',
            transition: 'left var(--transition-fast)',
          }}
        />
      </button>
    </div>
  )
}

export function BoardSettingsPage() {
  const { themeId, showNotation, showAnimations, setThemeId, setShowNotation, setShowAnimations, reset } =
    useBoardSettings()
  const { isMobile } = useViewport()
  const active = resolveBoardTheme(themeId)
  const previewSize = isMobile ? 260 : 320

  return (
    <SettingsLayout title="Board">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        <Card>
          <div style={sectionTitleStyle}>Preview</div>
          <div style={sectionDescStyle}>Changes apply instantly across every board in the app.</div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: previewSize, height: previewSize, borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
              <Chessboard
                options={{
                  position: PREVIEW_FEN,
                  allowDragging: false,
                  boardStyle: { borderRadius: '0' },
                  darkSquareStyle: { backgroundColor: active.dark },
                  lightSquareStyle: { backgroundColor: active.light },
                  showNotation,
                  showAnimations: false,
                }}
              />
            </div>
          </div>
        </Card>

        <Card>
          <div style={sectionTitleStyle}>Board theme</div>
          <div style={sectionDescStyle}>Pick the square colors for your boards.</div>
          <div style={swatchGridStyle}>
            {boardThemes.map(theme => (
              <button
                key={theme.id}
                style={swatchButtonStyle(theme.id === themeId)}
                onClick={() => setThemeId(theme.id)}
                aria-pressed={theme.id === themeId}
              >
                <MiniBoard light={theme.light} dark={theme.dark} />
                <span style={swatchLabelStyle}>{theme.label}</span>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <div style={sectionTitleStyle}>Options</div>
          <div style={{ ...sectionDescStyle, marginBottom: 'var(--space-2)' }}>Fine-tune how the board behaves.</div>
          <Toggle checked={showNotation} onChange={setShowNotation} label="Show coordinates" />
          <div style={{ borderTop: '1px solid var(--color-border)' }} />
          <Toggle checked={showAnimations} onChange={setShowAnimations} label="Animate piece moves" />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
            <Button variant="ghost" size="sm" onClick={reset}>
              Reset to defaults
            </Button>
          </div>
        </Card>
      </div>
    </SettingsLayout>
  )
}
