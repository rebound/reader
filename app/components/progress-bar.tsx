import { clsx } from 'clsx'
import type { KeyboardEvent, MouseEvent } from 'react'

type ProgressBarProps = {
  percentage: number
  showLabel?: boolean
  className?: string
  onSeek?: (percentage: number) => void
}

export function ProgressBar({ percentage, showLabel = true, className, onSeek }: ProgressBarProps) {
  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!onSeek) return
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newPercentage = Math.round((clickX / rect.width) * 100)
    onSeek(Math.max(0, Math.min(100, newPercentage)))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!onSeek) return
    const step = e.shiftKey ? 10 : 5
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault()
      onSeek(Math.min(100, percentage + step))
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault()
      onSeek(Math.max(0, percentage - step))
    } else if (e.key === 'Home') {
      e.preventDefault()
      onSeek(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      onSeek(100)
    }
  }

  return (
    <div className={clsx('flex items-center gap-4', className)}>
      <div
        className={clsx('flex flex-1 items-center py-3', onSeek && 'cursor-pointer')}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role={onSeek ? 'slider' : undefined}
        aria-valuenow={onSeek ? percentage : undefined}
        aria-valuemin={onSeek ? 0 : undefined}
        aria-valuemax={onSeek ? 100 : undefined}
        tabIndex={onSeek ? 0 : undefined}
      >
        <div className="h-1 w-full overflow-hidden rounded-full bg-rule">
          <div
            className="pointer-events-none h-full bg-accent transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      {showLabel && <span className="w-12 text-right text-sm opacity-60">{percentage}%</span>}
    </div>
  )
}
