'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { FaEye, FaEyeSlash, FaSearch, FaGlobe, FaLock, FaSyncAlt } from 'react-icons/fa'
import eventsData from '@/data/events.json'
import { useEmployeeAuth, isAdminOrSubAdmin } from '@/lib/employeePortalContext'
import { useEventVisibility, updateEventVisibility } from '@/lib/eventVisibility'
import { format } from 'date-fns'
import { toast } from 'sonner'

export default function EventVisibilityManager() {
  const { employee } = useEmployeeAuth()
  const { visibilityMap, loading } = useEventVisibility()
  const [searchQuery, setSearchQuery] = useState('')
  const [savingSlug, setSavingSlug] = useState<string | null>(null)

  const isAdmin = isAdminOrSubAdmin(employee?.role)

  const filteredEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const sorted = [...eventsData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    if (!query) return sorted

    return sorted.filter((event) =>
      event.title.toLowerCase().includes(query) ||
      event.tagline.toLowerCase().includes(query) ||
      event.category.toLowerCase().includes(query) ||
      event.location.toLowerCase().includes(query)
    )
  }, [searchQuery])

  const hiddenCount = eventsData.filter((event) => visibilityMap[event.slug]?.hidden).length
  const visibleCount = eventsData.length - hiddenCount

  const handleToggle = async (event: any) => {
    if (!employee || !isAdmin) return

    const isHidden = visibilityMap[event.slug]?.hidden === true
    const nextHidden = !isHidden

    setSavingSlug(event.slug)
    try {
      await updateEventVisibility(event.slug, {
        hidden: nextHidden,
        eventId: event.id,
        eventTitle: event.title,
        updatedBy: employee.employeeId,
        updatedByName: employee.name,
      })

      toast.success(nextHidden ? 'Event hidden from public pages' : 'Event made public again')
    } catch (error: any) {
      console.error('Event visibility update failed:', error)
      toast.error(error?.message || 'Failed to update event visibility')
    } finally {
      setSavingSlug(null)
    }
  }

  if (!isAdmin) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-300">
        <FaLock className="mx-auto mb-3 text-2xl" />
        <p className="font-semibold">Access denied</p>
        <p className="text-sm text-red-200/80 mt-1">Only admins and sub-admins can manage event visibility.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <FaGlobe className="text-primary-400" />
              Event Visibility
            </h3>
            <p className="mt-1 text-sm text-neutral-400">
              Hide or unhide public events. Hidden events disappear from the public listing and detail pages.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center sm:flex sm:items-center sm:gap-4">
            <div className="rounded-xl border border-white/10 bg-black/10 px-4 py-3">
              <div className="text-2xl font-bold text-white">{visibleCount}</div>
              <div className="text-xs text-neutral-400">Visible</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/10 px-4 py-3">
              <div className="text-2xl font-bold text-amber-400">{hiddenCount}</div>
              <div className="text-xs text-neutral-400">Hidden</div>
            </div>
          </div>
        </div>

        <div className="mt-4 relative">
          <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events by title, location, or category..."
            className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-10 pr-4 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-neutral-400">
          <FaSyncAlt className="mr-2 animate-spin" />
          Loading visibility settings…
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-neutral-400">
          No events found.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredEvents.map((event, index) => {
            const isHidden = visibilityMap[event.slug]?.hidden === true
            const isBusy = savingSlug === event.slug

            return (
              <motion.div
                key={event.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`rounded-2xl border p-4 sm:p-5 backdrop-blur-xl transition-all ${
                  isHidden
                    ? 'border-red-500/20 bg-red-500/10'
                    : 'border-emerald-500/20 bg-emerald-500/10'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="truncate text-lg font-bold text-white">{event.title}</h4>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                        isHidden ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {isHidden ? 'Hidden' : 'Visible'}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-neutral-300">{event.tagline}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-neutral-400">
                      <span className="rounded-full bg-white/10 px-2.5 py-1">{event.category}</span>
                      <span className="rounded-full bg-white/10 px-2.5 py-1">
                        {format(new Date(event.date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggle(event)}
                    disabled={isBusy}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all disabled:opacity-60 ${
                      isHidden
                        ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                        : 'bg-red-500 text-white hover:bg-red-400'
                    }`}
                  >
                    {isBusy ? (
                      <FaSyncAlt className="animate-spin" />
                    ) : isHidden ? (
                      <FaEye />
                    ) : (
                      <FaEyeSlash />
                    )}
                    {isHidden ? 'Unhide event' : 'Hide event'}
                  </button>

                  <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-xs text-neutral-300">
                    <FaLock className="text-neutral-500" />
                    Admin / Sub-admin
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
