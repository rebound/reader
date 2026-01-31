import { clsx } from 'clsx'

type SpinnerProps = {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'h-5 w-5 border-2',
  md: 'h-10 w-10 border-3',
  lg: 'h-16 w-16 border-4',
} as const

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return <div className={clsx(sizeClasses[size], 'animate-spin rounded-full border-rule border-t-accent', className)} />
}
