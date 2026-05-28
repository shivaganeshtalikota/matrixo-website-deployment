'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { FaCalendar, FaMapMarkerAlt, FaTicketAlt, FaSearch, FaFilter, FaClock, FaStar } from 'react-icons/fa'
import eventsData from '@/data/events.json'
import { format, isFuture, isPast, compareDesc, compareAsc } from 'date-fns'
import HeadingHighlight from '@/components/HeadingHighlight'

type SortOption = 'upcoming' | 'latest' | 'all'

export default function EventsListing() {
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortOption, setSortOption] = useState<SortOption>('upcoming')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredAndSortedEvents = useMemo(() => {
    let filtered = eventsData.filter(event => {
      const matchesCategory = categoryFilter === 'all' || event.category.toLowerCase() === categoryFilter.toLowerCase()
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            event.tagline.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            event.location.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesCategory && matchesSearch
    })

    // Sort based on selected option
    if (sortOption === 'upcoming') {
      filtered = filtered
        .filter(event => isFuture(new Date(event.date)))
        .sort((a, b) => compareAsc(new Date(a.date), new Date(b.date)))
    } else if (sortOption === 'latest') {
      filtered = filtered.sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)))
    }

    return filtered
  }, [categoryFilter, sortOption, searchTerm])

  const activeFilterClass =
    'bg-[#4B5563] text-white shadow-[0_2px_6px_rgba(0,0,0,0.08)] hover:bg-[#2F3542] dark:bg-white dark:text-[#111111] dark:shadow-[0_2px_8px_rgba(255,255,255,0.08)] dark:hover:bg-[#F3F3F3]'

  return (
    <div className="min-h-screen pt-5 pb-20">
      {/* Header */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-black text-gray-900 dark:text-white py-16 sm:py-20 overflow-hidden">
        <div className="absolute top-1/3 -right-32 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -left-32 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="container-custom px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4 sm:mb-6">
              <HeadingHighlight text="Explore Programs" />
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300">
              Workshops, hackathons, bootcamps, and technical events designed to accelerate your tech career
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters and Search - Compact Version */}
      <section className="bg-white/40 dark:bg-white/[0.02] backdrop-blur-md py-3 sm:py-4 border-b border-gray-200/30 dark:border-white/[0.06]">
        <div className="container-custom px-4 sm:px-6">
          {/* Compact Filter Row */}
          <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
            {/* Search - Compact */}
            <div className="relative w-full lg:w-80">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Search programs, topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-full glass-input text-sm"
              />
            </div>

            {/* Sort Options - Compact */}
            <div className="flex items-center gap-2 flex-wrap">
              <FaClock className="text-gray-500 text-sm" />
              {[
                { value: 'upcoming', label: 'Upcoming', icon: FaClock },
                { value: 'latest', label: 'Latest', icon: FaStar },
                { value: 'all', label: 'All', icon: FaCalendar }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortOption(option.value as SortOption)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)] flex items-center gap-1.5 ${
                    sortOption === option.value
                      ? activeFilterClass
                      : 'glass-chip text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <option.icon className="text-xs" />
                  {option.label}
                </button>
              ))}
            </div>

            {/* Category Filter Buttons - Compact */}
            <div className="flex items-center gap-2 flex-wrap">
              <FaFilter className="text-gray-500 text-sm" />
              {[
                { value: 'all', label: 'All Programs' },
                { value: 'course', label: 'Courses' },
                { value: 'workshop', label: 'Workshops' },
                { value: 'hackathon', label: 'Hackathons' },
                { value: 'bootcamp', label: 'Bootcamps' },
                { value: 'event', label: 'Events' }
              ].map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategoryFilter(cat.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
                    categoryFilter === cat.value
                      ? activeFilterClass
                      : 'glass-chip text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredAndSortedEvents.length}</span> program{filteredAndSortedEvents.length !== 1 ? 's' : ''}
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="section-padding bg-transparent">
        <div className="container-custom px-4 sm:px-6">
          {filteredAndSortedEvents.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-gray-500">No programs found matching your criteria</p>
                <button
                  onClick={() => {
                    setCategoryFilter('all')
                    setSortOption('all')
                    setSearchTerm('')
                  }}
                  className={`mt-4 px-6 py-3 rounded-full transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${activeFilterClass}`}
                >
                  Clear All Filters
                </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {filteredAndSortedEvents.map((event, index) => {
                const eventLink = (event as any).externalLink || `/events/${event.slug}`
                const isExternal = !!(event as any).externalLink

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                  >
                    <Link 
                      href={eventLink}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                    >
                      <div className="group glass-card overflow-hidden
                                    transition-all duration-200 hover:-translate-y-2 border-2 border-transparent 
                                    hover:border-blue-500/30 h-full flex flex-col">
                        {/* Image */}
                        <div className="relative h-40 sm:h-44 md:h-48 bg-gradient-to-br from-blue-500/20 to-purple-600/20 overflow-hidden">
                          {event.images?.thumbnail ? (
                            <Image
                              src={event.images.thumbnail}
                              alt={event.title}
                              fill
                              className="object-cover object-center"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-6xl font-bold gradient-text">
                              {event.title.charAt(0)}
                            </div>
                          )}
                          {event.featured && (
                            <div className="absolute top-4 right-4 bg-gradient-to-r from-pink-500 to-rose-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                              FEATURED
                            </div>
                          )}
                          {event.status === 'sold-out' && (
                            <div className="absolute top-4 right-4 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-celebrate animate-shine">
                              🎉 SOLD OUT 🎊
                            </div>
                          )}
                          <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold">
                            {event.category.toUpperCase()}
                          </div>
                          {isFuture(new Date(event.date)) && event.status !== 'sold-out' && (
                            <div className="absolute top-4 left-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                              UPCOMING
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-4 sm:p-5 md:p-6 flex-1 flex flex-col">
                          <h3 className="text-xl sm:text-2xl font-bold mb-2 text-gray-900 dark:text-white transition-all duration-200 line-clamp-2">
                            <HeadingHighlight text={event.title} />
                          </h3>
                          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 line-clamp-2">
                            {event.tagline}
                          </p>

                          {/* Details */}
                          <div className="space-y-2 mb-4 flex-1">
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <FaCalendar className="mr-2 text-blue-500 flex-shrink-0" />
                              {format(new Date(event.date), 'MMM dd, yyyy • hh:mm a')}
                            </div>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <FaMapMarkerAlt className="mr-2 text-purple-600 flex-shrink-0" />
                              {event.location}
                            </div>
                          </div>

                          {/* Price & CTA */}
                          <div className="flex items-center justify-between">
                            {event.status === 'sold-out' ? (
                              <div className="w-full">
                                <div className="bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 dark:from-red-900/20 dark:via-orange-900/20 dark:to-yellow-900/20 border-2 border-red-500 rounded-xl p-4 text-center">
                                  <span className="text-3xl mb-2 block">🎉</span>
                                  <span className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">
                                    SOLD OUT!
                                  </span>
                                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    🎊 All tickets claimed! 🎊
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div>
                                  <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">From</span>
                                  <div className="flex items-baseline gap-1 sm:gap-2">
                                    <span className="text-xl sm:text-2xl font-bold gradient-text">
                                      ₹{Math.min(...event.tickets.map((t: any) => t.price))}
                                    </span>
                                    {event.tickets.some((t: any) => t.originalPrice) && (
                                      <span className="text-xs sm:text-sm text-gray-400 line-through">
                                        ₹{(event.tickets.find((t: any) => t.originalPrice) as any)?.originalPrice}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="flex items-center space-x-1.5 sm:space-x-2 bg-gradient-to-r from-neon-blue to-neon-purple 
                                           text-white px-3 sm:px-4 py-2 rounded-full font-semibold text-xs sm:text-sm shadow-lg 
                                           hover:shadow-neon-blue/50 transition-shadow"
                                >
                                  <FaTicketAlt className="text-xs sm:text-sm" />
                                  <span>Book</span>
                                </motion.button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
