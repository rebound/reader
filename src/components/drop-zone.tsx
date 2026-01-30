import { type DragEvent, type ReactNode } from 'react';

interface DropZoneProps {
  isActive: boolean;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: DragEvent<HTMLDivElement>) => void;
  children: ReactNode;
  className?: string;
}

export function DropZone({
  isActive,
  onDrop,
  onDragOver,
  onDragLeave,
  children,
  className = '',
}: DropZoneProps) {
  return (
    <div
      className={`
        border-2 border-dashed rounded-2xl
        transition-colors duration-200
        ${className}
      `}
      style={{
        borderColor: isActive ? 'var(--accent-color)' : 'var(--border-color)',
        backgroundColor: isActive ? 'rgba(var(--accent-color), 0.05)' : 'transparent',
      }}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      {children}
    </div>
  );
}
