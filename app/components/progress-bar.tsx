import { clsx } from 'clsx'

type ProgressBarProps = {
  percentage: number
  showLabel?: boolean
  className?: string
}

export function ProgressBar({ percentage, showLabel = true, className }: ProgressBarProps) {
  return (
    <div className={clsx('flex items-center gap-4', className)}>
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-rule">
        <div className="h-full bg-accent transition-all duration-300" style={{ width: `${percentage}%` }} />
      </div>
      {showLabel && <span className="w-12 text-right text-sm opacity-60">{percentage}%</span>}
    </div>
  )
}
