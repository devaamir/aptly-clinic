import type { FC } from 'react'
import { useState } from 'react'
import './MiniCalendar.css'

interface MiniCalendarProps {
  minDate?: Date
  maxDate?: Date
  selected?: Date | null
  onSelect: (date: Date) => void
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

const MiniCalendar: FC<MiniCalendarProps> = ({ minDate, maxDate, selected, onSelect }) => {
  const today = new Date()
  const [view, setView] = useState(new Date(today.getFullYear(), today.getMonth(), 1))

  const year = view.getFullYear()
  const month = view.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (Date | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ]

  const isDisabled = (d: Date) => {
    if (minDate && d < new Date(minDate.setHours(0,0,0,0))) return true
    if (maxDate && d > new Date(maxDate.setHours(23,59,59,999))) return true
    return false
  }

  const isSelected = (d: Date) => selected?.toDateString() === d.toDateString()
  const isToday = (d: Date) => d.toDateString() === today.toDateString()

  const prevMonth = () => setView(new Date(year, month - 1, 1))
  const nextMonth = () => setView(new Date(year, month + 1, 1))

  return (
    <div className="mini-cal">
      <div className="mini-cal-header">
        <button className="mini-cal-nav" onClick={prevMonth}>‹</button>
        <span className="mini-cal-title">{MONTHS[month]} {year}</span>
        <button className="mini-cal-nav" onClick={nextMonth}>›</button>
      </div>
      <div className="mini-cal-grid">
        {DAYS.map(d => <div key={d} className="mini-cal-day-name">{d}</div>)}
        {cells.map((d, i) => d ? (
          <div
            key={i}
            className={`mini-cal-cell ${isSelected(d) ? 'selected' : ''} ${isToday(d) ? 'today' : ''} ${isDisabled(d) ? 'disabled' : ''}`}
            onClick={() => !isDisabled(d) && onSelect(d)}
          >
            {d.getDate()}
          </div>
        ) : <div key={i} />)}
      </div>
    </div>
  )
}

export default MiniCalendar
