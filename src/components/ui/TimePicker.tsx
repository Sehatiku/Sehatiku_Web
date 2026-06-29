import { useState, useRef, useEffect } from 'react'

interface TimePickerProps {
  value: string // Format "HH:MM"
  onChange: (val: string) => void
  error?: boolean
}

export default function TimePicker({ value, onChange, error }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const hourScrollRef = useRef<HTMLDivElement>(null)
  const minuteScrollRef = useRef<HTMLDivElement>(null)

  // Split value into hour and minute, default to 08:00 if invalid
  const parts = value.split(':')
  const currentHour = parts[0] || '08'
  const currentMinute = parts[1] || '00'

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
  const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'))

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Auto-scroll to selected hour/minute when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const activeHourElem = hourScrollRef.current?.querySelector('[data-selected="true"]')
        if (activeHourElem) {
          activeHourElem.scrollIntoView({ block: 'nearest', behavior: 'instant' as ScrollBehavior })
        }
        const activeMinuteElem = minuteScrollRef.current?.querySelector('[data-selected="true"]')
        if (activeMinuteElem) {
          activeMinuteElem.scrollIntoView({ block: 'nearest', behavior: 'instant' as ScrollBehavior })
        }
      }, 50)
    }
  }, [isOpen])

  const handleHourSelect = (hour: string) => {
    onChange(`${hour}:${currentMinute}`)
  }

  const handleMinuteSelect = (minute: string) => {
    onChange(`${currentHour}:${minute}`)
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <style>{`
        .timepicker-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .timepicker-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .timepicker-scrollbar::-webkit-scrollbar-thumb {
          background: #CBD5E1;
          border-radius: 4px;
        }
        .timepicker-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94A3B8;
        }
      `}</style>

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
          color: '#2B2D42',
          background: '#F7F8FA',
          outline: 'none',
          boxSizing: 'border-box',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'border-color 0.15s, background-color 0.15s'
        }}
      >
        <span style={{ fontWeight: 500 }}>{value}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#636B78" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
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
            width: '100%',
            minWidth: 180,
            background: '#FFFFFF',
            border: '1.5px solid #E2E8F0',
            borderRadius: 12,
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            padding: 10,
            boxSizing: 'border-box',
            animation: 'fadeIn 0.15s ease-out'
          }}
        >
          {/* Columns container */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {/* Hour Column */}
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 6, textAlign: 'center', letterSpacing: '0.5px' }}>Jam</div>
              <div
                ref={hourScrollRef}
                style={{
                  height: 150,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                  scrollbarWidth: 'thin',
                  paddingRight: 2
                }}
                className="timepicker-scrollbar"
              >
                {hours.map(h => {
                  const isSelected = h === currentHour
                  return (
                    <button
                      key={h}
                      type="button"
                      data-selected={isSelected}
                      onClick={() => handleHourSelect(h)}
                      style={{
                        padding: '6px 0',
                        width: '100%',
                        border: 'none',
                        borderRadius: 6,
                        background: isSelected ? '#5B6BF0' : 'transparent',
                        color: isSelected ? '#FFFFFF' : '#475569',
                        fontSize: 13,
                        fontWeight: isSelected ? 600 : 500,
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'background-color 0.1s, color 0.1s'
                      }}
                      onMouseEnter={e => {
                        if (!isSelected) e.currentTarget.style.background = '#F1F5F9'
                      }}
                      onMouseLeave={e => {
                        if (!isSelected) e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      {h}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Minute Column */}
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 6, textAlign: 'center', letterSpacing: '0.5px' }}>Menit</div>
              <div
                ref={minuteScrollRef}
                style={{
                  height: 150,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                  scrollbarWidth: 'thin',
                  paddingRight: 2
                }}
                className="timepicker-scrollbar"
              >
                {minutes.map(m => {
                  const isSelected = m === currentMinute
                  return (
                    <button
                      key={m}
                      type="button"
                      data-selected={isSelected}
                      onClick={() => handleMinuteSelect(m)}
                      style={{
                        padding: '6px 0',
                        width: '100%',
                        border: 'none',
                        borderRadius: 6,
                        background: isSelected ? '#5B6BF0' : 'transparent',
                        color: isSelected ? '#FFFFFF' : '#475569',
                        fontSize: 13,
                        fontWeight: isSelected ? 600 : 500,
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'background-color 0.1s, color 0.1s'
                      }}
                      onMouseEnter={e => {
                        if (!isSelected) e.currentTarget.style.background = '#F1F5F9'
                      }}
                      onMouseLeave={e => {
                        if (!isSelected) e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      {m}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
