'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div>
          <h2>Global Error</h2>
          <button onClick={() => reset()}>
            Retry
          </button>
        </div>
      </body>
    </html>
  )
}
