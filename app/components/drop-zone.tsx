import { clsx } from 'clsx'
import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import type { ReactNode } from 'react'
import type { Accept } from 'react-dropzone'

type DropZoneProps = {
  onFilesAccepted: (files: File[]) => void
  accept?: Accept
  multiple?: boolean
  disabled?: boolean
  children?: ReactNode
  className?: string
}

export function DropZone({
  onFilesAccepted,
  accept = {
    'application/epub+zip': ['.epub'],
    'application/pdf': ['.pdf'],
  },
  multiple = true,
  disabled = false,
  children,
  className,
}: DropZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFilesAccepted(acceptedFiles)
      }
    },
    [onFilesAccepted],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple,
    disabled,
  })

  return (
    <div
      {...getRootProps()}
      className={clsx(
        'cursor-pointer rounded-2xl border-2 border-dashed transition-colors duration-200',
        isDragActive && 'border-accent bg-accent/5',
        !isDragActive && 'border-rule bg-transparent',
        className,
      )}
    >
      <input {...getInputProps()} />
      {children}
    </div>
  )
}
