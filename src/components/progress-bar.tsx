interface ProgressBarProps {
  percentage: number;
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({ percentage, showLabel = true, className = '' }: ProgressBarProps) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div
        className="flex-1 h-1 rounded-full overflow-hidden"
        style={{ backgroundColor: 'var(--border-color)' }}
      >
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${percentage}%`,
            backgroundColor: 'var(--accent-color)',
          }}
        />
      </div>
      {showLabel && <span className="text-sm opacity-60 w-12 text-right">{percentage}%</span>}
    </div>
  );
}
