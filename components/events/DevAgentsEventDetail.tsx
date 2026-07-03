"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import Image from "next/image";
import { useTheme } from "next-themes";
import {
  FaCalendar,
  FaMapMarkerAlt,
  FaClock,
  FaUsers,
  FaCheckCircle,
  FaInstagram,
  FaLinkedin,
  FaGithub,
  FaChevronDown,
  FaRupeeSign,
  FaBolt,
  FaLock,
  FaSubway,
  FaBus,
  FaMotorcycle,
  FaTaxi,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { BiCodeAlt } from "react-icons/bi";
import { Zap, Lock, CheckCircle2 } from "lucide-react";
import DevAgentsRegistrationForm from "./DevAgentsRegistrationForm";
import {
  DEVAGENTS_SPEAKER_IMAGE_URL,
  MATRIXO_LOGO_DARK_URL,
  MATRIXO_LOGO_LIGHT_URL,
  THE_STUDENT_SPOT_LOGO_DARK_URL,
  THE_STUDENT_SPOT_LOGO_LIGHT_URL,
  ANY_EVENTS_AHEAD_LOGO_DARK_URL,
  ANY_EVENTS_AHEAD_LOGO_LIGHT_URL,
} from "@/lib/eventBranding";

/* ─────────────────────────────────────────────────────────────────────────
   Animation variant (used everywhere)
───────────────────────────────────────────────────────────────────────── */
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

/* ─────────────────────────────────────────────────────────────────────────
   Deterministic particles — avoids SSR / client hydration mismatch
───────────────────────────────────────────────────────────────────────── */
const PARTICLES = Array.from({ length: 25 }, (_, i) => ({
  id: i,
  top: `${((i * 137.508) % 100).toFixed(2)}%`,
  left: `${((i * 97.3) % 100).toFixed(2)}%`,
  size: `${2 + (i % 3)}px`,
  delay: `${((i * 0.4) % 5).toFixed(1)}s`,
  duration: `${5 + (i % 5)}s`,
  color: (["#60a5fa", "#a78bfa", "#f472b6"] as const)[i % 3],
}));

/* ─────────────────────────────────────────────────────────────────────────
   Static data
───────────────────────────────────────────────────────────────────────── */
const LEARNING_OUTCOMES = [
  {
    icon: "🤖",
    title: "What is Agentic AI",
    desc: "Understand the fundamentals of AI agents",
  },
  {
    icon: "🧠",
    title: "LLMs vs AI Agents",
    desc: "Key differences and when to use each",
  },
  {
    icon: "✍️",
    title: "Prompt Engineering",
    desc: "Craft effective prompts for AI systems",
  },
  {
    icon: "🏗️",
    title: "Agent Architecture",
    desc: "Design and structure AI agent systems",
  },
  {
    icon: "🌐",
    title: "Multi-Agent Systems",
    desc: "Build collaborative AI agent networks",
  },
  {
    icon: "💾",
    title: "AI Memory",
    desc: "Implement persistent memory in agents",
  },
  {
    icon: "🔧",
    title: "Tool Calling",
    desc: "Enable agents to use external tools",
  },
  {
    icon: "📚",
    title: "RAG Concepts",
    desc: "Retrieval-Augmented Generation basics",
  },
  {
    icon: "⚙️",
    title: "Building AI Agents",
    desc: "Hands-on agent development experience",
  },
  {
    icon: "🔄",
    title: "Workflow Automation",
    desc: "Automate complex tasks with agents",
  },
  {
    icon: "💼",
    title: "Real-world Use Cases",
    desc: "Apply agents to practical problems",
  },
  {
    icon: "✅",
    title: "Best Practices",
    desc: "Production-ready agent development tips",
  },
];

const EVENT_HIGHLIGHTS = [
  {
    icon: "🚀",
    title: "Build AI Agents",
    desc: "Create your first autonomous AI agent",
  },
  {
    icon: "🧠",
    title: "Hands-on Labs",
    desc: "Learn by doing with guided labs",
  },
  {
    icon: "💻",
    title: "Live Coding",
    desc: "Code along with expert instructors",
  },
  { icon: "🤝", title: "Networking", desc: "Connect with AI enthusiasts" },
  { icon: "🎁", title: "Gifts & Swags", desc: "Exclusive event merchandise" },
  {
    icon: "🏆",
    title: "Top 3 Recognition",
    desc: "Win recognition for best agents",
  },
  {
    icon: "📜",
    title: "Digital Certificate",
    desc: "Official certification from Microsoft Learn & matriXO",
  },
  {
    icon: "⚡",
    title: "Real Projects",
    desc: "Build production-ready projects",
  },
];

interface AgendaItem {
  time: string;
  icon: string;
  title: string;
  desc: string;
  badge?: string;
}

const AGENDA: AgendaItem[] = [
  {
    time: "3:30 PM",
    icon: "👋",
    title: "Registration & Networking",
    desc: "Check-in, meet fellow participants, and settle in",
  },
  {
    time: "4:00 PM",
    icon: "🚀",
    title: "Opening Session",
    desc: "Introduction, the Future of AI, and why AI Agents matter today",
  },
  {
    time: "4:30 PM",
    icon: "🧠",
    title: "Session 1: LLMs & Prompt Engineering",
    desc: "Deep dive into large language models and crafting effective prompts",
  },
  {
    time: "5:00 PM",
    icon: "🤖",
    title: "Session 2: Agentic AI Deep Dive",
    desc: "Autonomous AI, Planning, Reasoning, Tool Calling, Memory & Multi-Agent Systems",
  },
  {
    time: "5:45 PM",
    icon: "💻",
    title: "Session 3: Hands-on Workshop",
    desc: "Live Coding — Build your own AI agents and work on real projects",
  },
  {
    time: "6:30 PM",
    icon: "🔥",
    title: "Fireside Chat (Planned)",
    desc: "AI Careers, Future Jobs, and Startups",
    badge: "Subject to confirmation",
  },
  {
    time: "6:45 PM",
    icon: "🏆",
    title: "Hands-on Challenge + Recognition",
    desc: "Top 3 participants get special recognition and prizes",
  },
  {
    time: "7:00 PM",
    icon: "🎓",
    title: "Closing Ceremony",
    desc: "Certificates, Networking, and Group Photo",
  },
];

const WHATS_INCLUDED = [
  "3-hour live workshop",
  "Practical coding session",
  "Workshop resources & materials",
  "AI prompts & templates",
  "Source code access",
  "Community access",
  "Event stickers",
  "Networking opportunity",
  "Digital participation certificate from matriXO",
  "Partner certificates (subject to confirmation)",
];

const PARTNERS = [
  {
    name: "The Student Spot",
    role: "Community Partner",
    logoLight: THE_STUDENT_SPOT_LOGO_LIGHT_URL,
    logoDark: THE_STUDENT_SPOT_LOGO_DARK_URL,
  },
  {
    name: "Any Events Ahead",
    role: "Event Partner",
    logoLight: ANY_EVENTS_AHEAD_LOGO_LIGHT_URL,
    logoDark: ANY_EVENTS_AHEAD_LOGO_DARK_URL,
  },
];

const WHO_SHOULD_ATTEND = [
  { icon: "🎓", label: "Students" },
  { icon: "👨‍💻", label: "Developers" },
  { icon: "🚀", label: "Founders" },
  { icon: "🤖", label: "AI Enthusiasts" },
  { icon: "⚙️", label: "Software Engineers" },
  { icon: "💼", label: "Freelancers" },
  { icon: "✍️", label: "Content Creators" },
  { icon: "🌟", label: "Anyone Interested in AI" },
];

const FAQS = [
  {
    q: "Is it beginner-friendly?",
    a: "Yes! DevAgents 1.0 is designed for beginners. No prior AI experience is required to attend and benefit from this workshop.",
  },
  {
    q: "Do I need coding knowledge?",
    a: "Basic programming knowledge is recommended for the hands-on session, but not mandatory. You can still attend for learning and networking.",
  },
  {
    q: "Should I bring a laptop?",
    a: "A laptop is mandatory for the hands-on coding session. If you are attending only to listen, it is optional.",
  },
  {
    q: "Will I get a certificate?",
    a: "All attendees will receive a digital participation certificate from matriXO. Partner certificates are subject to confirmation.",
  },
  {
    q: "Is food included?",
    a: "Food and refreshments are to be announced. Stay tuned to our official channels for updates.",
  },
  {
    q: "Can working professionals attend?",
    a: "Yes, absolutely! DevAgents 1.0 is open to students, developers, founders, and working professionals alike.",
  },
  {
    q: "Will recordings be available?",
    a: "Availability of recordings will be based on organizer policy, to be announced closer to the event.",
  },
  {
    q: "What is the refund policy?",
    a: "Refund policy is to be announced. Please check our official website and channels for the latest updates.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────────────────── */
interface CountdownType {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/* ─────────────────────────────────────────────────────────────────────────
   Partner logo — theme-aware with graceful fallback if an asset is missing
───────────────────────────────────────────────────────────────────────── */
function PartnerLogo({ name, src }: { name: string; src: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
        style={{
          background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
        }}
      >
        {name.charAt(0)}
      </div>
    );
  }

  return (
    <div className="w-6 h-6 relative flex-shrink-0">
      <Image
        src={src}
        alt={name}
        fill
        sizes="24px"
        className="object-contain"
        unoptimized
        onError={() => setFailed(true)}
      />
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════════
   Component
═════════════════════════════════════════════════════════════════════════ */
export default function DevAgentsEventDetail({ event }: { event: any }) {
  const { resolvedTheme } = useTheme();
  const [showRegistration, setShowRegistration] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<CountdownType>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [countdownExpired, setCountdownExpired] = useState(false);
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const isDarkMode = resolvedTheme !== "light";
  const pageBgClass = isDarkMode
    ? "bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.95),_rgba(9,9,15,1)_55%)]"
    : "bg-gradient-to-b from-slate-50 via-white to-slate-100";
  const surfaceClass = isDarkMode
    ? "bg-[rgba(22,22,35,0.85)] border-[rgba(255,255,255,0.08)] backdrop-blur-xl"
    : "bg-white/80 border-slate-200/80 backdrop-blur-xl shadow-sm";
  const textPrimaryClass = isDarkMode ? "text-white" : "text-slate-900";
  const textSecondaryClass = isDarkMode ? "text-slate-300" : "text-slate-600";
  const mutedPanelClass = isDarkMode
    ? "bg-[rgba(22,22,35,0.85)] border-[rgba(255,255,255,0.08)]"
    : "bg-slate-100 border-slate-200";
  const accentButtonClass =
    "bg-gradient-to-r from-blue-600 via-violet-500 to-pink-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-violet-500/25 hover:scale-[1.03] active:scale-[.98]";
  const secondaryButtonClass = isDarkMode
    ? "bg-white/5 text-white border border-white/[.12] hover:bg-white/10 hover:border-[#7C3AED]"
    : "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50";

  /* Countdown ──────────────────────────────────────────────────────────── */
  useEffect(() => {
    const targetDate = event?.date ? new Date(event.date) : null;
    if (!targetDate || isNaN(targetDate.getTime())) return;

    const tick = () => {
      const diff = targetDate.getTime() - Date.now();
      if (diff <= 0) {
        setCountdownExpired(true);
        return;
      }
      setCountdown({
        days: Math.floor(diff / 86_400_000),
        hours: Math.floor((diff % 86_400_000) / 3_600_000),
        minutes: Math.floor((diff % 3_600_000) / 60_000),
        seconds: Math.floor((diff % 60_000) / 1_000),
      });
    };
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [event?.date]);

  /* Sticky CTA scroll listener ─────────────────────────────────────────── */
  useEffect(() => {
    const onScroll = () => setShowStickyCTA(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Helpers ────────────────────────────────────────────────────────────── */
  const formatEventDate = (dateStr: string): string => {
    try {
      return format(new Date(dateStr), "MMM dd, yyyy");
    } catch {
      return "TBA";
    }
  };

  const scrollToAgenda = () =>
    document
      .getElementById("agenda")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

  const scrollToHowToReach = () =>
    document
      .getElementById("how-to-reach")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

  /* ───────────────────────────────────────────────────────────────────── */
  return (
    <div
      className={`devagents-shell min-h-screen font-sans overflow-x-hidden ${pageBgClass}`}
      data-theme={isDarkMode ? "dark" : "light"}
    >
      {/* ── Injected CSS keyframes ────────────────────────────────────────── */}
      <style>{`
        @keyframes gridMove {
          0%   { background-position: 0 0;    }
          100% { background-position: 0 60px; }
        }
        @keyframes floatUp {
          0%, 100% { transform: translateY(0px);   opacity: .4; }
          50%       { transform: translateY(-20px); opacity: .8; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(124,58,237,.3); }
          50%       { box-shadow: 0 0 40px rgba(124,58,237,.6); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1;  transform: scale(1);   }
          50%       { opacity: .5; transform: scale(1.8); }
        }
        @keyframes borderGlow {
          0%, 100% { border-color: rgba(59,130,246,.25); }
          50%       { border-color: rgba(139,92,246,.5);  }
        }
        .da-pulse-glow  { animation: pulse-glow  2s  ease-in-out infinite; }
        .da-pulse-dot   { animation: pulseDot    1.5s ease-in-out infinite; }
        .da-border-glow { animation: borderGlow  3s  ease-in-out infinite; }
        .da-card-hover  { transition: transform .3s ease, box-shadow .3s ease, border-color .3s ease; }
        .da-card-hover:hover {
          transform:  translateY(-4px) scale(1.02);
          border-color: #7C3AED !important;
          box-shadow: 0 20px 40px rgba(124,58,237,.25), 0 0 0 1px rgba(124,58,237,.35);
        }

        .devagents-shell[data-theme="light"] .text-white,
        .devagents-shell[data-theme="light"] .text-slate-300,
        .devagents-shell[data-theme="light"] .text-slate-400,
        .devagents-shell[data-theme="light"] .text-slate-500,
        .devagents-shell[data-theme="light"] .text-blue-400,
        .devagents-shell[data-theme="light"] .text-violet-300 {
          color: #0f172a !important;
        }

        .devagents-shell[data-theme="light"] .text-transparent {
          color: transparent !important;
        }

        .devagents-shell[data-theme="light"] .devagents-light-strong {
          color: #020617 !important;
        }
      `}</style>

      {/* ══════════════════════════════════════════════════════════════════
          1. HERO SECTION
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-16">
        {/* Background stack */}
        <div className="absolute inset-0 pointer-events-none select-none">
          {/* Base gradient */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, #09090F 0%, #0F172A 50%, #09090F 100%)",
            }}
          />

          {/* Animated grid */}
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                "linear-gradient(rgba(124,58,237,.07) 1px, transparent 1px)," +
                "linear-gradient(90deg, rgba(124,58,237,.07) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
              animation: "gridMove 20s linear infinite",
            }}
          />

          {/* Gradient orbs */}
          <div
            className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full blur-3xl opacity-20"
            style={{
              background: "radial-gradient(circle, #3b82f6, transparent)",
            }}
          />
          <div
            className="absolute -bottom-20 -right-20 w-[620px] h-[620px] rounded-full blur-3xl opacity-15"
            style={{
              background: "radial-gradient(circle, #8b5cf6, transparent)",
            }}
          />
          <div
            className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-10"
            style={{
              background: "radial-gradient(circle, #ec4899, transparent)",
            }}
          />

          {/* Floating particles */}
          {PARTICLES.map((p) => (
            <div
              key={p.id}
              className="absolute rounded-full"
              style={{
                top: p.top,
                left: p.left,
                width: p.size,
                height: p.size,
                background: p.color,
                animation: `floatUp ${p.duration} ease-in-out ${p.delay} infinite`,
              }}
            />
          ))}
        </div>

        {/* LIVE · OFFLINE badge */}
        <div
          className="absolute top-6 right-6 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{
            background: isDarkMode ? "rgba(9,9,15,.6)" : "rgba(255,255,255,.8)",
            backdropFilter: "blur(12px)",
            border: isDarkMode
              ? "1px solid rgba(34,197,94,.3)"
              : "1px solid rgba(34,197,94,.18)",
          }}
        >
          <span className="w-2 h-2 rounded-full bg-green-500 da-pulse-dot" />
          <span className="text-xs font-semibold tracking-widest text-green-400">
            LIVE · OFFLINE
          </span>
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          {/* Badge pill */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="inline-flex mb-8"
          >
            <div
              className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium"
              style={{
                background: isDarkMode
                  ? "rgba(124,58,237,.12)"
                  : "rgba(15,23,42,.04)",
                backdropFilter: "blur(12px)",
                border: isDarkMode
                  ? "1px solid rgba(124,58,237,.30)"
                  : "1px solid rgba(124,58,237,.18)",
              }}
            >
              <span className="text-blue-400">✦</span>
              <span
                className={`bg-gradient-to-r from-[#4F8BFF] via-violet-500 to-pink-500 bg-clip-text text-transparent font-semibold`}
              >
                Agentic AI Workshop · matriXO
              </span>
              <span className="text-violet-400">✦</span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className={`text-5xl md:text-7xl font-bold font-display leading-tight mb-6 ${textPrimaryClass}`}
          >
            <span className="bg-gradient-to-r from-[#4F8BFF] via-violet-500 to-pink-500 bg-clip-text text-transparent">
              Build Your First
            </span>
            <br />
            <span className={textPrimaryClass}>AI Agent.</span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className={`text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed ${textSecondaryClass}`}
          >
            Learn to build autonomous AI agents using modern Agentic AI
            frameworks through an immersive, hands-on workshop.
          </motion.p>

          {/* CTA row */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <button
              onClick={() => setShowRegistration(true)}
              className={`px-8 py-4 rounded-2xl font-bold text-white text-lg transition-all duration-300 ${accentButtonClass}`}
              style={{
                boxShadow: isDarkMode
                  ? "0 8px 30px rgba(124,58,237,.35)"
                  : "0 8px 24px rgba(124,58,237,.20)",
              }}
            >
              Register Now →
            </button>
            <button
              onClick={scrollToAgenda}
              className={`px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:scale-[1.02] active:scale-[.98] ${secondaryButtonClass}`}
            >
              View Agenda
            </button>
          </motion.div>

          {/* Stat chips */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto mb-12"
          >
            {[
              { label: "₹199 Only", emoji: "💰" },
              { label: "Limited Seats", emoji: "🔥" },
              { label: "120 Participants", emoji: "👥" },
              { label: "Hands-on Learning", emoji: "💻" },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium justify-center"
                style={{
                  background: isDarkMode
                    ? "rgba(255,255,255,.05)"
                    : "rgba(15,23,42,.04)",
                  backdropFilter: "blur(12px)",
                  border: isDarkMode
                    ? "1px solid rgba(255,255,255,.12)"
                    : "1px solid rgba(148,163,184,.22)",
                }}
              >
                <span>{s.emoji}</span>
                <span className={textSecondaryClass}>{s.label}</span>
              </div>
            ))}
          </motion.div>

          {/* Countdown timer */}
          {!countdownExpired && (
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="flex flex-col items-center gap-4"
            >
              <p className="text-xs font-medium tracking-widest uppercase text-slate-500">
                Event Starts In
              </p>
              <div className="flex gap-3">
                {(
                  [
                    { v: countdown.days, l: "Days" },
                    { v: countdown.hours, l: "Hours" },
                    { v: countdown.minutes, l: "Minutes" },
                    { v: countdown.seconds, l: "Seconds" },
                  ] as { v: number; l: string }[]
                ).map(({ v, l }) => (
                  <div key={l} className="flex flex-col items-center gap-1">
                    <div
                      className="w-16 h-16 md:w-20 md:h-20 rounded-xl flex items-center justify-center"
                      style={{
                        background: "rgba(22,22,35,.85)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid rgba(124,58,237,.3)",
                      }}
                    >
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={v}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.2 }}
                          className="text-2xl md:text-3xl font-bold font-display text-white tabular-nums"
                        >
                          {String(v).padStart(2, "0")}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {l}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          2. EVENT DETAILS BAR
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className={`rounded-3xl p-6 ${surfaceClass}`}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  icon: "📅",
                  label: "Date",
                  value: event?.date ? formatEventDate(event.date) : "TBA",
                },
                {
                  icon: "📍",
                  label: "Venue",
                  value:
                    event?.venue ||
                    "DraperU India(Formerly Draper Startup House Hyderabad), Rajiv gandhi Nagar, Gachibowli, Hyderabad, Telangana 500032",
                },
                { icon: "⏰", label: "Time", value: "3:30 PM – 7:00 PM" },
                {
                  icon: "👥",
                  label: "Capacity",
                  value: "120 Participants",
                },
              ].map((item) => {
                const isVenue = item.label === "Venue";
                const cardContent = (
                  <>
                    <span className="text-2xl leading-none mt-0.5 flex-shrink-0">
                      {item.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                        {item.label}
                      </p>
                      <p
                        className={`text-sm font-semibold mt-0.5 truncate ${textPrimaryClass}`}
                      >
                        {item.value}
                      </p>
                    </div>
                  </>
                );

                if (isVenue) {
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={scrollToHowToReach}
                      aria-label="View directions to DraperU India"
                      className="flex items-start gap-3 p-3 rounded-xl w-full text-left cursor-pointer transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[0_0_0_1px_rgba(124,58,237,.4),0_8px_28px_rgba(124,58,237,.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                      style={{
                        background: isDarkMode
                          ? "rgba(255,255,255,.03)"
                          : "rgba(15,23,42,.03)",
                      }}
                    >
                      {cardContent}
                    </button>
                  );
                }

                return (
                  <div
                    key={item.label}
                    className="flex items-start gap-3 p-3 rounded-xl"
                    style={{
                      background: isDarkMode
                        ? "rgba(255,255,255,.03)"
                        : "rgba(15,23,42,.03)",
                    }}
                  >
                    {cardContent}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          3. ABOUT SECTION
      ══════════════════════════════════════════════════════════════════ */}
      <section id="about" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
              <span className="bg-gradient-to-r from-[#4F8BFF] via-violet-500 to-pink-500 bg-clip-text text-transparent">
                About DevAgents 1.0
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-10 items-start">
            {/* Left — description */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-4"
            >
              <p className={`${textSecondaryClass} leading-relaxed`}>
                {event?.description ||
                  "DevAgents 1.0 is a premier Agentic AI workshop organised by matriXO, designed to introduce participants to the world of autonomous AI agents. This is not just another tech talk — it is an immersive, hands-on experience."}
              </p>
              <p className={`${textSecondaryClass} leading-relaxed`}>
                Whether you are a student exploring AI, a developer looking to
                upskill, or a founder wanting to integrate AI into your product
                — DevAgents 1.0 is the perfect launchpad for your AI agent
                journey.
              </p>
              <ul className="space-y-3 pt-2">
                {[
                  "Beginner-friendly — no prior AI experience needed",
                  "Hands-on practical learning approach",
                  "Live coding with real AI frameworks",
                  "Build real projects you can showcase",
                ].map((point) => (
                  <li
                    key={point}
                    className={`flex items-start gap-3 text-sm ${textSecondaryClass}`}
                  >
                    <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <FaCheckCircle className="text-blue-400 text-[10px]" />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Right — callout stats */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className={`rounded-3xl p-8 space-y-5 ${surfaceClass}`}>
                {[
                  { stat: "3 Hours", label: "Intensive Workshop", emoji: "⏱️" },
                  { stat: "₹199", label: "All-inclusive Price", emoji: "💰" },
                  {
                    stat: "120 Seats",
                    label: "Limited Availability",
                    emoji: "🎟️",
                  },
                ].map(({ stat, label, emoji }) => (
                  <div
                    key={stat}
                    className="flex items-center gap-4 p-4 rounded-2xl"
                    style={{
                      background: isDarkMode
                        ? "rgba(255,255,255,.04)"
                        : "rgba(15,23,42,.04)",
                    }}
                  >
                    <span className="text-3xl leading-none flex-shrink-0">
                      {emoji}
                    </span>
                    <div>
                      <p className="text-2xl font-bold font-display bg-gradient-to-r from-[#4F8BFF] via-violet-500 to-pink-500 bg-clip-text text-transparent">
                        {stat}
                      </p>
                      <p className={textSecondaryClass}>{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          4. LEARNING OUTCOMES + 5. WORKSHOP AGENDA
      ══════════════════════════════════════════════════════════════════ */}
      <section id="outcomes" className="py-20 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[6fr_5fr] gap-8 lg:gap-10 items-start">
          {/* What You'll Learn */}
          <div>
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2
                className={`text-3xl md:text-4xl font-bold font-display mb-4 ${textPrimaryClass}`}
              >
                What You&apos;ll Learn
              </h2>
              <p className={textSecondaryClass}>
                12 core modules packed into an intensive 3-hour session
              </p>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {LEARNING_OUTCOMES.map((item, i) => (
                <motion.div
                  key={item.title}
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className={`da-card-hover da-border-glow p-4 rounded-2xl cursor-default flex flex-col items-center text-center aspect-square ${surfaceClass}`}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center mb-2 text-base"
                    style={{
                      background:
                        "linear-gradient(135deg,rgba(59,130,246,.2),rgba(139,92,246,.2))",
                    }}
                  >
                    {item.icon}
                  </div>
                  <h3 className={`font-bold text-sm mb-1 ${textPrimaryClass}`}>
                    {item.title}
                  </h3>
                  <p
                    className={`text-xs leading-relaxed ${textSecondaryClass}`}
                  >
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Workshop Agenda */}
          <div id="agenda">
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold font-display text-white mb-4">
                Workshop Agenda
              </h2>
              <p className="text-slate-400">
                A packed 3.5-hour journey into Agentic AI
              </p>
            </motion.div>

            <div className="relative">
              {/* Glowing vertical timeline line */}
              <div
                className="absolute left-[44px] top-0 bottom-0 w-px"
                style={{
                  background: "linear-gradient(to bottom, #3b82f6, #8b5cf6)",
                }}
              />

              <div className="space-y-4">
                {AGENDA.map((item, index) => (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.06 }}
                    className="relative flex gap-6 items-start"
                  >
                    {/* Icon + time */}
                    <div className="flex-shrink-0 flex flex-col items-center gap-1 w-[88px]">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-base z-10 relative"
                        style={{
                          background: "linear-gradient(135deg,#1e40af,#5b21b6)",
                          border: "2px solid rgba(124,58,237,.5)",
                        }}
                      >
                        {item.icon}
                      </div>
                      <span className="text-[11px] text-blue-400 font-semibold tabular-nums font-display">
                        {item.time}
                      </span>
                    </div>

                    {/* Content card */}
                    <div
                      className="flex-1 p-3 rounded-xl mb-1"
                      style={{
                        background: "rgba(22,22,35,.85)",
                        border: "1px solid rgba(255,255,255,.08)",
                      }}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="font-bold text-white text-sm">
                          {item.title}
                        </h3>
                        {item.badge && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full text-yellow-400 font-medium flex-shrink-0"
                            style={{
                              background: "rgba(234,179,8,.1)",
                              border: "1px solid rgba(234,179,8,.25)",
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          6. EVENT HIGHLIGHTS + 7. WHAT'S INCLUDED
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Event Highlights */}
          <div>
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold font-display text-white mb-4">
                Event Highlights
              </h2>
              <p className="text-slate-400">
                Everything you get at DevAgents 1.0
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 gap-4">
              {EVENT_HIGHLIGHTS.map((item, i) => (
                <motion.div
                  key={item.title}
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="da-card-hover da-border-glow p-5 rounded-2xl text-center cursor-default"
                  style={{
                    background: "rgba(22,22,35,.85)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,.08)",
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3"
                    style={{
                      background:
                        "linear-gradient(135deg,rgba(59,130,246,.15),rgba(139,92,246,.15))",
                    }}
                  >
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-white text-sm mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* What's Included */}
          <div>
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="text-3xl md:text-4xl font-bold font-display text-white mb-4">
                What&apos;s Included
              </h2>
              <p className="text-slate-400">
                Everything bundled in your ₹199 pass
              </p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="rounded-2xl p-8"
              style={{
                background: "rgba(22,22,35,.85)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,.08)",
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-3">
                {WHATS_INCLUDED.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                      <FaCheckCircle className="text-green-400 text-[10px]" />
                    </div>
                    <span className="text-slate-300 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          7.5 HOW TO REACH
      ══════════════════════════════════════════════════════════════════ */}
      <section id="how-to-reach" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2
              className={`text-3xl md:text-4xl font-bold font-display mb-4 ${textPrimaryClass}`}
            >
              📍 How to Reach?
            </h2>
            <p className={textSecondaryClass}>
              Getting to DraperU India is quick and easy
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-6 lg:gap-8 items-stretch">
            {/* Map Card */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className={`da-card-hover rounded-[20px] overflow-hidden flex flex-col ${surfaceClass}`}
            >
              <div className="p-6 pb-4 flex items-start gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg,rgba(59,130,246,.2),rgba(139,92,246,.2))",
                  }}
                >
                  <FaMapMarkerAlt className="text-blue-400 text-lg" />
                </div>
                <div className="min-w-0">
                  <h3 className={`font-bold text-lg ${textPrimaryClass}`}>
                    DraperU India
                  </h3>
                  <p className="text-xs text-slate-500">
                    (Formerly Draper Startup House Hyderabad)
                  </p>
                  <p className={`text-sm mt-1 ${textSecondaryClass}`}>
                    Rajiv Gandhi Nagar, Gachibowli, Hyderabad - 500032
                  </p>
                </div>
              </div>

              <div className="w-full h-[320px] lg:h-[380px] px-6">
                <iframe
                  src="https://www.google.com/maps?q=DraperU%20India%20Rajiv%20Gandhi%20Nagar%20Gachibowli%20Hyderabad%20500032&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="DraperU India location map"
                  className="w-full h-full rounded-2xl"
                />
              </div>

              <div className="p-6 pt-4 mt-auto">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=DraperU+India+Rajiv+Gandhi+Nagar+Gachibowli+Hyderabad+500032"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[.98] ${accentButtonClass}`}
                >
                  <FaMapMarkerAlt />
                  Open in Google Maps
                  <FaExternalLinkAlt className="text-xs" />
                </a>
              </div>
            </motion.div>

            {/* Transport Cards */}
            <div className="flex flex-col gap-5">
              {/* Metro */}
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.05 }}
                className={`da-card-hover rounded-[20px] p-6 ${surfaceClass}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg,rgba(59,130,246,.2),rgba(139,92,246,.2))",
                    }}
                  >
                    <FaSubway className="text-blue-400" />
                  </div>
                  <h3 className={`font-bold ${textPrimaryClass}`}>By Metro</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">Nearest Metro</span>
                    <span
                      className={`font-semibold text-right ${textPrimaryClass}`}
                    >
                      Raidurg Metro Station
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">Distance</span>
                    <span className={`font-semibold ${textPrimaryClass}`}>
                      ~2 km
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">Travel Time</span>
                    <span
                      className={`font-semibold text-right ${textPrimaryClass}`}
                    >
                      5–8 min by cab/auto
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Bus */}
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className={`da-card-hover rounded-[20px] p-6 ${surfaceClass}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg,rgba(59,130,246,.2),rgba(139,92,246,.2))",
                    }}
                  >
                    <FaBus className="text-violet-400" />
                  </div>
                  <h3 className={`font-bold ${textPrimaryClass}`}>By Bus</h3>
                </div>

                <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-2">
                  Nearby Bus Stops
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {["Indra Nagar", "Gachibowli X Road", "IIIT Bus Stop"].map(
                    (stop) => (
                      <span
                        key={stop}
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${textSecondaryClass}`}
                        style={{
                          background: isDarkMode
                            ? "rgba(255,255,255,.05)"
                            : "rgba(15,23,42,.04)",
                          borderColor: isDarkMode
                            ? "rgba(255,255,255,.1)"
                            : "rgba(15,23,42,.1)",
                        }}
                      >
                        {stop}
                      </span>
                    ),
                  )}
                </div>

                <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-2">
                  Bus Routes
                </p>
                <div className="flex flex-wrap gap-2">
                  {["113M/W", "198", "216M", "217D/A", "17H/47W"].map(
                    (route) => (
                      <span
                        key={route}
                        className="px-3 py-1 rounded-full text-xs font-bold text-violet-300"
                        style={{
                          background:
                            "linear-gradient(135deg,rgba(59,130,246,.15),rgba(139,92,246,.15))",
                          border: "1px solid rgba(124,58,237,.3)",
                        }}
                      >
                        {route}
                      </span>
                    ),
                  )}
                </div>
              </motion.div>

              {/* Rapido / Uber */}
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.15 }}
                className={`da-card-hover rounded-[20px] p-6 ${surfaceClass}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg,rgba(59,130,246,.2),rgba(139,92,246,.2))",
                    }}
                  >
                    <FaTaxi className="text-pink-400" />
                  </div>
                  <h3 className={`font-bold ${textPrimaryClass}`}>
                    Rapido / Uber
                  </h3>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      icon: <FaMotorcycle className="text-blue-400" />,
                      label: "Rapido Bike",
                      time: "5–8 min",
                      price: "₹35–70",
                    },
                    {
                      icon: <FaTaxi className="text-violet-400" />,
                      label: "Uber/Ola Auto",
                      time: "5–10 min",
                      price: "₹60–120",
                    },
                    {
                      icon: <FaTaxi className="text-pink-400" />,
                      label: "Uber Cab",
                      time: "5–8 min",
                      price: "₹120–220",
                    },
                  ].map((r) => (
                    <div
                      key={r.label}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl"
                      style={{
                        background: isDarkMode
                          ? "rgba(255,255,255,.03)"
                          : "rgba(15,23,42,.03)",
                      }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {r.icon}
                        <span
                          className={`text-sm font-semibold truncate ${textPrimaryClass}`}
                        >
                          {r.label}
                        </span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-sm font-bold ${textPrimaryClass}`}>
                          {r.price}
                        </p>
                        <p className="text-xs text-slate-500">{r.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          8. TICKET SECTION
      ══════════════════════════════════════════════════════════════════ */}
      <section id="tickets" className="py-20 px-4">
        <div className="max-w-lg mx-auto">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-display text-white mb-4">
              Get Your Pass
            </h2>
            <p className="text-slate-400">Secure your spot at DevAgents 1.0</p>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="rounded-2xl overflow-hidden da-pulse-glow"
            style={{
              background: "rgba(22,22,35,.85)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(124,58,237,.35)",
            }}
          >
            {/* Rainbow top bar */}
            <div
              className="h-1 w-full"
              style={{
                background: "linear-gradient(90deg, #3B82F6, #8B5CF6, #EC4899)",
              }}
            />

            <div className="p-8">
              {/* Pass badge */}
              <div className="flex justify-center mb-6">
                <span
                  className="px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase text-violet-300"
                  style={{
                    background:
                      "linear-gradient(135deg,rgba(59,130,246,.2),rgba(139,92,246,.2))",
                    border: "1px solid rgba(124,58,237,.35)",
                  }}
                >
                  DevAgents 1.0 Pass
                </span>
              </div>

              {/* Price */}
              <div className="text-center mb-8">
                <p className="text-6xl font-bold font-display bg-gradient-to-r from-[#4F8BFF] via-violet-500 to-pink-500 bg-clip-text text-transparent">
                  ₹199
                </p>
                <p className="text-slate-500 text-sm mt-1">
                  One-time · No hidden fees
                </p>
              </div>

              {/* Includes list */}
              <div className="space-y-3 mb-8">
                {[
                  "3-hour live workshop",
                  "Workshop resources & materials",
                  "Digital participation certificate",
                  "Hands-on coding labs",
                  "Community access",
                  "Event stickers & swags",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <FaCheckCircle className="text-green-400 text-[10px]" />
                    </div>
                    <span className="text-slate-300 text-sm">{item}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={() => setShowRegistration(true)}
                className="w-full py-4 rounded-xl font-bold text-white text-lg transition-all duration-200 hover:scale-[1.02] active:scale-[.98]"
                style={{
                  background:
                    "linear-gradient(135deg, #2563EB, #8B5CF6, #EC4899)",
                  boxShadow: "0 8px 30px rgba(124,58,237,.35)",
                }}
              >
                Register Now — ₹199
              </button>

              {/* Trust badges */}
              <div
                className="flex flex-wrap justify-center gap-4 mt-5 pt-5 border-t"
                style={{ borderColor: "rgba(255,255,255,.06)" }}
              >
                {[
                  "🔒 Secure Payments",
                  "⚡ Instant Verification",
                  "🎟️ Limited to 150 seats",
                ].map((b) => (
                  <span key={b} className="text-xs text-slate-500">
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          9. SPEAKERS
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-display text-white mb-4">
              Speakers
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Main speaker */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="rounded-2xl p-8 text-center"
              style={{
                background: "rgba(22,22,35,.85)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(124,58,237,.25)",
              }}
            >
              {/* Gradient avatar */}
              <div className="w-24 h-24 rounded-full mx-auto mb-5 overflow-hidden flex items-center justify-center border border-white/10 bg-white/5">
                {DEVAGENTS_SPEAKER_IMAGE_URL ? (
                  <Image
                    src={DEVAGENTS_SPEAKER_IMAGE_URL}
                    alt="Shiva Ganesh Talikota"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-3xl font-bold text-white font-display"
                    style={{
                      background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                    }}
                  >
                    SG
                  </div>
                )}
              </div>
              <h3 className="text-xl font-bold text-white mb-1">
                Shiva Ganesh Talikota
              </h3>
              <p className="text-sm text-blue-400 font-medium mb-1">
                Founder — matriXO
              </p>
              <p className="text-xs text-slate-500 mb-5">
                Agentic AI Speaker · AI Educator · Startup Founder
              </p>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs text-blue-400 transition-colors hover:text-blue-300"
                style={{
                  background: "rgba(59,130,246,.1)",
                  border: "1px solid rgba(59,130,246,.2)",
                }}
              >
                <FaLinkedin /> LinkedIn Profile
              </a>
            </motion.div>

            {/* Guest placeholder */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="rounded-2xl p-8 flex flex-col items-center justify-center text-center"
              style={{
                border: "1px dashed rgba(255,255,255,.1)",
                background: "rgba(255,255,255,.02)",
              }}
            >
              <span className="text-4xl mb-4">🎤</span>
              <h3 className="text-slate-400 font-medium mb-2">
                More speakers to be announced...
              </h3>
              <p className="text-xs text-slate-600">
                Stay tuned for guest speaker announcements
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          10. WHO SHOULD ATTEND
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-display text-white mb-4">
              Who Should Attend
            </h2>
            <p className="text-slate-400">
              DevAgents 1.0 is for everyone curious about AI
            </p>
          </motion.div>

          <div className="flex flex-wrap gap-3 justify-center">
            {WHO_SHOULD_ATTEND.map((item) => (
              <motion.div
                key={item.label}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium da-card-hover cursor-default"
                style={{
                  background: "rgba(124,58,237,.12)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(124,58,237,.30)",
                }}
              >
                <span>{item.icon}</span>
                <span className="text-slate-300">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          11. FAQ
      ══════════════════════════════════════════════════════════════════ */}
      <section id="faq" className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-display text-white mb-4">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <div className="space-y-3">
            {FAQS.map((faq, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="rounded-xl overflow-hidden"
                style={{
                  background: "rgba(22,22,35,.85)",
                  border: `1px solid ${expandedFaq === index ? "rgba(124,58,237,.4)" : "rgba(255,255,255,.08)"}`,
                  transition: "border-color .3s",
                }}
              >
                <button
                  onClick={() =>
                    setExpandedFaq(expandedFaq === index ? null : index)
                  }
                  className="w-full flex items-center justify-between p-5 text-left gap-4"
                >
                  <span className="text-white font-medium text-sm">
                    {faq.q}
                  </span>
                  <FaChevronDown
                    className="text-slate-400 flex-shrink-0 transition-transform duration-300"
                    style={{
                      transform:
                        expandedFaq === index
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                    }}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {expandedFaq === index && (
                    <motion.div
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div
                        className="px-5 pb-5 border-t text-slate-400 text-sm leading-relaxed"
                        style={{ borderColor: "rgba(255,255,255,.05)" }}
                      >
                        <div className="pt-4">{faq.a}</div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          12. GALLERY PLACEHOLDER
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-display text-white mb-3">
              Event Gallery
            </h2>
            <p className="text-slate-500 text-sm">
              Photos will be added after the event
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }, (_, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="relative h-52 rounded-2xl overflow-hidden flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, hsl(${220 + i * 20},60%,9%), hsl(${260 + i * 15},60%,12%))`,
                  border: "1px solid rgba(255,255,255,.06)",
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    backdropFilter: "blur(2px)",
                    background: "rgba(9,9,15,.35)",
                  }}
                />
                <div className="relative flex flex-col items-center gap-2">
                  <span className="text-5xl">📷</span>
                  <span
                    className="text-xs font-medium px-3 py-1 rounded-full text-slate-400"
                    style={{
                      background: "rgba(9,9,15,.6)",
                      border: "1px solid rgba(255,255,255,.1)",
                    }}
                  >
                    Coming Soon
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          14. SPONSORS & PARTNERS
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-display text-white mb-4">
              Sponsors &amp; Partners
            </h2>
          </motion.div>

          <div className="flex flex-col items-center gap-8">
            {/* Organizer badge */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div
                className="flex items-center gap-3 px-6 py-3 rounded-full"
                style={{
                  background: isDarkMode
                    ? "rgba(124,58,237,.12)"
                    : "rgba(255,255,255,.8)",
                  border: isDarkMode
                    ? "1px solid rgba(124,58,237,.30)"
                    : "1px solid rgba(148,163,184,.22)",
                }}
              >
                <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-white/10 flex-shrink-0">
                  <Image
                    src={
                      isDarkMode
                        ? MATRIXO_LOGO_DARK_URL
                        : MATRIXO_LOGO_LIGHT_URL
                    }
                    alt="matriXO"
                    width={32}
                    height={32}
                    className="object-contain w-full h-full"
                    unoptimized
                  />
                </div>
                <span className="text-white font-semibold">matriXO</span>
                <span className="text-xs text-slate-500">— Main Organizer</span>
              </div>
            </motion.div>

            {/* Partner cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-lg mx-auto">
              {PARTNERS.map((partner) => (
                <motion.div
                  key={partner.name}
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="h-20 rounded-xl flex flex-col items-center justify-center gap-0.5 px-2"
                  style={{
                    border: "1px dashed rgba(255,255,255,.1)",
                    background: "rgba(255,255,255,.02)",
                  }}
                >
                  <PartnerLogo
                    name={partner.name}
                    src={isDarkMode ? partner.logoDark : partner.logoLight}
                  />
                  <p className="text-slate-300 text-[11px] font-semibold leading-tight text-center">
                    {partner.name}
                  </p>
                  <p className="text-slate-600 text-[10px] leading-tight text-center">
                    {partner.role}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          15. CONTACT SECTION
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-display text-white mb-4">
              Get in Touch
            </h2>
            <p className="text-slate-400">
              Have questions? Reach us through any of these channels
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              {
                icon: "📧",
                label: "Email",
                value: "hello@matrixo.in",
                href: "mailto:hello@matrixo.in",
              },
              {
                icon: "📸",
                label: "Instagram",
                value: "@matrixo_in",
                href: "https://www.instagram.com/matrixo_in",
              },
              {
                icon: "💼",
                label: "LinkedIn",
                value: "matriXO",
                href: "https://linkedin.com/company/matrixo",
              },
              {
                icon: "🌐",
                label: "Website",
                value: "matrixo.in",
                href: "https://matrixo.in",
              },
              {
                icon: "💬",
                label: "Community",
                value: "Join our community",
                href: "https://chat.whatsapp.com/CW5HbObfsi7CcLkoATLJ91",
              },
            ].map((item) => (
              <motion.a
                key={item.label}
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={
                  item.href.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex items-center gap-4 p-5 rounded-xl da-card-hover"
                style={{
                  background: "rgba(22,22,35,.85)",
                  border: "1px solid rgba(255,255,255,.08)",
                }}
              >
                <span className="text-2xl leading-none flex-shrink-0">
                  {item.icon}
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">
                    {item.label}
                  </p>
                  <p className="text-white text-sm font-medium truncate">
                    {item.value}
                  </p>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          16. DEVAGENTS FOOTER (special pre-footer)
      ══════════════════════════════════════════════════════════════════ */}
      <footer
        className="py-16 px-4"
        style={{
          background: "rgba(9,9,15,.6)",
          borderTop: "1px solid rgba(255,255,255,.05)",
        }}
      >
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h3 className="text-3xl font-bold font-display bg-gradient-to-r from-[#4F8BFF] via-violet-500 to-pink-500 bg-clip-text text-transparent">
              DevAgents 1.0
            </h3>
            <p className="text-slate-600 text-sm mt-1">Built by matriXO</p>
          </motion.div>

          {/* Links */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-6 text-xs text-slate-600"
          >
            <span>© 2026 matriXO</span>
            <a
              href="/privacy"
              className="hover:text-slate-400 transition-colors"
            >
              Privacy Policy
            </a>
            <a href="/terms" className="hover:text-slate-400 transition-colors">
              Terms
            </a>
            <a
              href="/refund"
              className="hover:text-slate-400 transition-colors"
            >
              Refund Policy
            </a>
          </motion.div>

          {/* Social icons */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex justify-center gap-4"
          >
            {[
              {
                Icon: FaInstagram,
                href: "https://www.instagram.com/matrixo_in",
                label: "Instagram",
              },
              {
                Icon: FaLinkedin,
                href: "https://linkedin.com/company/matrixo",
                label: "LinkedIn",
              },
              {
                Icon: FaGithub,
                href: "https://github.com/matrixo",
                label: "GitHub",
              },
            ].map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-white transition-all duration-200 hover:scale-110 hover:border-[#7C3AED]"
                style={{
                  background: "rgba(255,255,255,.05)",
                  border: "1px solid rgba(255,255,255,.12)",
                }}
              >
                <Icon />
              </a>
            ))}
          </motion.div>

          <p className="text-xs text-slate-700">
            © 2026 matriXO. All rights reserved.
          </p>
        </div>
      </footer>

      {/* ══════════════════════════════════════════════════════════════════
          STICKY BOTTOM CTA  (appears after scrollY > 600)
      ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showStickyCTA && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-40 p-4"
            style={{
              background:
                "linear-gradient(to top, rgba(9,9,15,.97) 60%, transparent)",
            }}
          >
            <div
              className="max-w-md mx-auto flex items-center justify-between gap-4 px-5 py-4 rounded-2xl"
              style={{
                background: "rgba(22,22,35,.9)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(124,58,237,.35)",
              }}
            >
              <div>
                <p className="text-white font-semibold text-sm">
                  DevAgents 1.0
                </p>
                <p className="text-blue-400 text-xs font-bold">₹199 Only</p>
              </div>
              <button
                onClick={() => setShowRegistration(true)}
                className="flex-shrink-0 px-6 py-2.5 rounded-xl font-bold text-white text-sm transition-all duration-200 hover:scale-[1.03] active:scale-[.97]"
                style={{
                  background:
                    "linear-gradient(135deg, #2563EB, #8B5CF6, #EC4899)",
                  boxShadow: "0 4px 20px rgba(124,58,237,.35)",
                }}
              >
                Register Now →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════
          REGISTRATION MODAL
          Note: DevAgentsRegistrationForm renders its own complete,
          self-contained fixed overlay (backdrop + centered card). It must
          NOT be wrapped in another fixed inset-0 overlay here, or the page
          ends up with two stacked full-screen backdrops that fight over
          pointer events (confirmed via automated click-through testing).
      ══════════════════════════════════════════════════════════════════ */}
      {showRegistration && (
        <DevAgentsRegistrationForm
          event={event}
          onClose={() => setShowRegistration(false)}
        />
      )}
    </div>
  );
}
