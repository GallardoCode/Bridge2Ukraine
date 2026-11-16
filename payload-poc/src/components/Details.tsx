type Line = { id?: string | null; label: string; value: string }

export const Details = ({ lines, className }: { lines?: Line[] | null; className?: string }) => {
  if (!lines?.length) return null
  return (
    <div className={className}>
      {lines.map((line, i) => (
        <p key={line.id ?? i}>
          <strong>{line.label}:</strong> {line.value}
        </p>
      ))}
    </div>
  )
}
