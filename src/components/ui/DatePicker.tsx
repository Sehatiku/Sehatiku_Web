import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

interface DatePickerProps {
  value: string // Format "YYYY-MM-DD"
  onChange: (val: string) => void
  error?: boolean
  placeholder?: string
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const DAYS_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

export default function DatePicker({ value, onChange, error, placeholder = 'Pilih tanggal' }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)

  // Popup position (fixed, rendered in a portal so it can never be clipped
  // by an ancestor's overflow:hidden / scroll container).
  const POPUP_WIDTH = 306
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 })

  // Always anchor the popup directly BELOW the field.
  const reposition = useCallback(() => {
    const btn = containerRef.current
    if (!btn) return
    const r = btn.getBoundingClientRect()
    let left = r.left
    if (left + POPUP_WIDTH > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - POPUP_WIDTH - 8)
    }
    setCoords({ top: r.bottom + 6, left })
  }, [])

  // Parse initial value or default to today
  const today = new Date()
  let selectedYear = today.getFullYear()
  let selectedMonth = today.getMonth()
  let selectedDay = today.getDate()

  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const parts = value.split('-')
    selectedYear = parseInt(parts[0])
    selectedMonth = parseInt(parts[1]) - 1
    selectedDay = parseInt(parts[2])
  }

  // State to track which month/year the calendar popup is currently viewing
  const [viewYear, setViewYear] = useState(selectedYear)
  const [viewMonth, setViewMonth] = useState(selectedMonth)

  // Synchronize view state with selected value when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setViewYear(selectedYear)
      setViewMonth(selectedMonth)
    }
  }, [isOpen, selectedYear, selectedMonth])

  // Handle outside clicks to close picker (popup lives in a portal, so check
  // both the trigger and the popup).
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const t = event.target as Node
      if (
        containerRef.current && !containerRef.current.contains(t) &&
        popupRef.current && !popupRef.current.contains(t)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Find the nearest scrollable ancestor so we can nudge the field up when
  // there isn't room for the popup below it.
  const getScrollParent = (el: HTMLElement | null): HTMLElement | null => {
    let p = el?.parentElement ?? null
    while (p) {
      const oy = getComputedStyle(p).overflowY
      if ((oy === 'auto' || oy === 'scroll') && p.scrollHeight > p.clientHeight) return p
      p = p.parentElement
    }
    return null
  }

  // Position the popup on open and keep it anchored while scrolling/resizing.
  useEffect(() => {
    if (!isOpen) return

    // If the popup wouldn't fit below the field, scroll the container so it does.
    const btn = containerRef.current
    if (btn) {
      const r = btn.getBoundingClientRect()
      const estHeight = 360
      const overflow = (r.bottom + 6 + estHeight) - (window.innerHeight - 8)
      if (overflow > 0) {
        const sp = getScrollParent(btn)
        if (sp) sp.scrollBy({ top: overflow, behavior: 'auto' })
      }
    }

    reposition()
    const onScroll = () => reposition()
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onScroll)
    }
  }, [isOpen, reposition])

  // Helper date generators
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(prev => prev - 1)
    } else {
      setViewMonth(prev => prev - 1)
    }
  }

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(prev => prev + 1)
    } else {
      setViewMonth(prev => prev + 1)
    }
  }

  const handleDateSelect = (day: number) => {
    const y = String(viewYear)
    const m = String(viewMonth + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    onChange(`${y}-${m}-${d}`)
    setIsOpen(false)
  }

  // Format date to display nicely (e.g., "29 Juni 2026")
  const getDisplayValue = () => {
    if (!value) return placeholder
    const parts = value.split('-')
    if (parts.length !== 3) return value
    const y = parseInt(parts[0])
    const m = parseInt(parts[1]) - 1
    const d = parseInt(parts[2])
    return `${d} ${MONTH_NAMES[m]} ${y}`
  }

  const currentYearNum = today.getFullYear()
  // Years dropdown list (from 100 years ago to today)
  const years = Array.from({ length: 110 }, (_, i) => currentYearNum - i)

  // Generate calendar grid array
  const totalDays = getDaysInMonth(viewYear, viewMonth)
  const firstDayIndex = getFirstDayOfMonth(viewYear, viewMonth)

  const dayCells = []
  // Padding cells for previous month
  for (let i = 0; i < firstDayIndex; i++) {
    dayCells.push(null)
  }
  // Days of this month
  for (let i = 1; i <= totalDays; i++) {
    dayCells.push(i)
  }

  // Shared clean style for the month / year selects (native arrow removed,
  // replaced with a consistent custom chevron).
  const chevron =
    "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='24'%20height='24'%20viewBox='0%200%2024%2024'%20fill='none'%20stroke='%2364748B'%20stroke-width='2.5'%20stroke-linecap='round'%20stroke-linejoin='round'%3E%3Cpolyline%20points='6%209%2012%2015%2018%209'/%3E%3C/svg%3E"
  const selectStyle: React.CSSProperties = {
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    border: '1px solid #E2E8F0',
    fontSize: 13,
    fontWeight: 700,
    color: '#1E293B',
    background: `#F8FAFC url("${chevron}") no-repeat right 9px center`,
    backgroundSize: '11px',
    padding: '7px 28px 7px 12px',
    borderRadius: 9,
    outline: 'none',
    cursor: 'pointer',
    height: 34,
    transition: 'border-color 0.15s, background-color 0.15s, box-shadow 0.15s',
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '10px 13px',
          border: `1.5px solid ${error ? '#EF4444' : '#DCDFE8'}`,
          borderRadius: 9,
          fontSize: 13,
          color: value ? '#2B2D42' : '#8A93A1',
          background: '#F7F8FA',
          outline: 'none',
          boxSizing: 'border-box',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'border-color 0.15s, background-color 0.15s'
        }}
      >
        <span style={{ fontWeight: value ? 500 : 400 }}>{getDisplayValue()}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#636B78" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>

      {isOpen && createPortal(
        <div
          ref={popupRef}
          style={{
            position: 'fixed',
            top: coords.top,
            left: coords.left,
            zIndex: 3000,
            width: POPUP_WIDTH,
            background: '#FFFFFF',
            border: '1.5px solid #E2E8F0',
            borderRadius: 12,
            boxShadow: '0 20px 45px -12px rgba(15, 36, 68, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
            padding: '14px 16px',
            boxSizing: 'border-box',
            animation: 'fadeIn 0.15s ease-out'
          }}
        >
          {/* Header Month / Year controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <button
              type="button"
              onClick={handlePrevMonth}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: 6,
                color: '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {/* Quick selectors for Month & Year */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select
                value={viewMonth}
                onChange={e => setViewMonth(parseInt(e.target.value))}
                style={{ ...selectStyle, minWidth: 108 }}
                onFocus={e => { e.currentTarget.style.borderColor = '#5B6BF0'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(91,107,240,0.15)' }}
                onBlur={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = 'none' }}
              >
                {MONTH_NAMES.map((name, i) => (
                  <option key={name} value={i}>{name}</option>
                ))}
              </select>

              <select
                value={viewYear}
                onChange={e => setViewYear(parseInt(e.target.value))}
                style={{ ...selectStyle, minWidth: 82 }}
                onFocus={e => { e.currentTarget.style.borderColor = '#5B6BF0'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(91,107,240,0.15)' }}
                onBlur={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = 'none' }}
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: 6,
                color: '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* Weekdays Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
            {DAYS_SHORT.map(d => (
              <div key={d} style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textAlign: 'center', textTransform: 'uppercase' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {dayCells.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} />
              }

              const isSelected = viewYear === selectedYear && viewMonth === selectedMonth && day === selectedDay && value !== ''
              const isToday = viewYear === today.getFullYear() && viewMonth === today.getMonth() && day === today.getDate()

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDateSelect(day)}
                  style={{
                    borderRadius: 8,
                    height: 30,
                    width: '100%',
                    background: isSelected ? '#5B6BF0' : 'transparent',
                    color: isSelected ? '#FFFFFF' : (isToday ? '#5B6BF0' : '#475569'),
                    fontSize: 12,
                    fontWeight: isSelected || isToday ? 700 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.1s',
                    outline: 'none',
                    border: isToday && !isSelected ? '1.5px solid #5B6BF0' : 'none'
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) e.currentTarget.style.background = '#F1F5F9'
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent'
                  }}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {/* Footer controls: Today / Clear */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', marginTop: 12, paddingTop: 10 }}>
            <button
              type="button"
              onClick={() => {
                onChange('')
                setIsOpen(false)
              }}
              style={{
                border: 'none',
                background: 'transparent',
                fontSize: 11,
                fontWeight: 600,
                color: '#EF4444',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: 4
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              Hapus
            </button>
            <button
              type="button"
              onClick={() => {
                const y = String(today.getFullYear())
                const m = String(today.getMonth() + 1).padStart(2, '0')
                const d = String(today.getDate()).padStart(2, '0')
                onChange(`${y}-${m}-${d}`)
                setIsOpen(false)
              }}
              style={{
                border: 'none',
                background: 'transparent',
                fontSize: 11,
                fontWeight: 600,
                color: '#5B6BF0',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: 4
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#EEEFFE'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              Hari Ini
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
