export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-950 dark:via-purple-950/10 dark:to-blue-950/20">
      {/* Branded dual-ring spinner */}
      <div className="relative h-14 w-14">
        <div className="absolute inset-0 rounded-full border-4 border-blue-500/20" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin" />
      </div>
      <p className="font-display text-lg font-semibold gradient-text">matriXO</p>
      <span className="sr-only">Loading…</span>
    </div>
  )
}
