interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-5 w-5 border-2',
  md: 'h-10 w-10 border-3',
  lg: 'h-16 w-16 border-4',
};

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <div
      className={`
        ${sizeClasses[size]}
        rounded-full
        animate-spin
        ${className}
      `}
      style={{
        borderColor: 'var(--border-color)',
        borderTopColor: 'var(--accent-color)',
      }}
    />
  );
}
