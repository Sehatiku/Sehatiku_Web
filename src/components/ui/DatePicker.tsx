import { useState, useRef, useEffect } from 'react'

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

  // Handle outside clicks to close picker
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            zIndex: 100,
            marginTop: 6,
            width: 290,
            background: '#FFFFFF',
            border: '1.5px solid #E2E8F0',
            borderRadius: 12,
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
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
            <div style={{ display: 'flex', gap: 4 }}>
              <select
                value={viewMonth}
                onChange={e => setViewMonth(parseInt(e.target.value))}
                style={{
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#1E293B',
                  background: '#F1F5F9',
                  padding: '4px 6px',
                  borderRadius: 6,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {MONTH_NAMES.map((name, i) => (
                  <option key={name} value={i}>{name}</option>
                ))}
              </select>

              <select
                value={viewYear}
                onChange={e => setViewYear(parseInt(e.target.value))}
                style={{
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#1E293B',
                  background: '#F1F5F9',
                  padding: '4px 6px',
                  borderRadius: 6,
                  outline: 'none',
                  cursor: 'pointer'
                }}
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
        </div>
      )}
    </div>
  )
}
