"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaSpinner,
  FaCheckCircle,
  FaCopy,
  FaUpload,
  FaTrash,
} from "react-icons/fa";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";
import { DEVAGENTS_UPI_ID } from "@/lib/eventBranding";

interface DevAgentsRegistrationFormProps {
  event: any;
  onClose: () => void;
}

const PRICE = 199;

const generateTransactionCode = () => {
  const ts = Date.now();
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `DEVAGENTS-${ts}-${rand}`;
};

type Step = "form" | "payment" | "success";

export default function DevAgentsRegistrationForm({
  event,
  onClose,
}: DevAgentsRegistrationFormProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(
    null,
  );
  const [transactionCode] = useState(generateTransactionCode);
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const isSubmittingRef = useRef(false);
  const isUpiConfigured =
    DEVAGENTS_UPI_ID.trim().length > 0 &&
    !DEVAGENTS_UPI_ID.includes("YOUR_UPI_ID_HERE");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    college: "",
    year: "",
    branch: "",
    city: "",
    github: "",
    linkedIn: "",
    experienceLevel: "",
    whyAttend: "",
    agreeTerms: false,
  });

  // Auto-fill from auth user
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.displayName || prev.fullName,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  useEffect(() => {
    isSubmittingRef.current = isSubmitting;
  }, [isSubmitting]);

  const requestClose = useCallback(() => {
    if (isSubmittingRef.current) return;

    setIsOpen(false);

    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
    }

    closeTimerRef.current = window.setTimeout(() => {
      onClose();
    }, 220);
  }, [onClose]);

  // Lock background scroll while the modal is mounted
  useEffect(() => {
    setMounted(true);
    setIsOpen(true);

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    const previousBodyStyles = {
      overflow: document.body.style.overflow,
      paddingRight: document.body.style.paddingRight,
      overscrollBehavior: document.body.style.overscrollBehavior,
    };
    const previousDocumentStyles = {
      overflow: document.documentElement.style.overflow,
      overscrollBehavior: document.documentElement.style.overscrollBehavior,
    };

    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.overscrollBehavior = "none";

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      document.body.style.overflow = previousBodyStyles.overflow;
      document.body.style.paddingRight = previousBodyStyles.paddingRight;
      document.body.style.overscrollBehavior =
        previousBodyStyles.overscrollBehavior;
      document.documentElement.style.overflow = previousDocumentStyles.overflow;
      document.documentElement.style.overscrollBehavior =
        previousDocumentStyles.overscrollBehavior;
    };
  }, []);

  // Close on Escape (but not while a submission is in flight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [requestClose]);

  // Mobile detection
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    setIsMobile(
      /android|iphone|ipad|ipod|mobile/.test(ua) || window.innerWidth < 768,
    );
  }, []);

  const upiDeepLink = isUpiConfigured
    ? `upi://pay?pa=${DEVAGENTS_UPI_ID}&pn=matriXO&am=${PRICE}&cu=INR&tn=${encodeURIComponent(`DevAgents1.0-${transactionCode}`)}`
    : "";

  /* ── Handlers ─────────────────────────────────────────────────────── */
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5 MB");
      return;
    }
    setPaymentScreenshot(file);
    const reader = new FileReader();
    reader.onloadend = () => setScreenshotPreview(reader.result as string);
    reader.readAsDataURL(file);
    toast.success("Screenshot uploaded!");
  };

  const copyUpi = () => {
    if (!isUpiConfigured) {
      toast.error("UPI ID is not configured yet");
      return;
    }
    navigator.clipboard.writeText(DEVAGENTS_UPI_ID);
    toast.success("UPI ID copied!");
  };

  const copyTxCode = () => {
    navigator.clipboard.writeText(transactionCode);
    toast.success("Transaction code copied!");
  };

  /* ── Validation ──────────────────────────────────────────────────── */
  const validateForm = (): boolean => {
    if (!formData.fullName.trim()) {
      toast.error("Full name is required");
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      toast.error("Valid email is required");
      return false;
    }
    if (
      !formData.phone.trim() ||
      formData.phone.replace(/\D/g, "").length < 10
    ) {
      toast.error("Valid 10-digit phone number is required");
      return false;
    }
    if (!formData.college.trim()) {
      toast.error("College / Institution is required");
      return false;
    }
    if (!formData.year) {
      toast.error("Year of study is required");
      return false;
    }
    if (!formData.branch.trim()) {
      toast.error("Branch / Specialization is required");
      return false;
    }
    if (!formData.city.trim()) {
      toast.error("City is required");
      return false;
    }
    if (!formData.experienceLevel) {
      toast.error("Experience level is required");
      return false;
    }
    if (!formData.agreeTerms) {
      toast.error("Please agree to the terms & conditions");
      return false;
    }
    return true;
  };

  /* ── Submit to Google Sheet ──────────────────────────────────────── */
  const sendToGoogleSheet = async (data: Record<string, unknown>) => {
    try {
      const response = await fetch("/api/devagents/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || result?.success === false) {
        throw new Error(result?.error || "Registration failed");
      }
    } catch (err) {
      // Re-throw with the real message so the UI can show it
      const msg =
        err instanceof Error ? err.message : "Failed to forward registration";
      throw new Error(msg);
    }
  };

  /* ── Final submit (after payment + screenshot) ───────────────────── */
  const handleFinalSubmit = async () => {
    if (!paymentScreenshot) {
      toast.error("Please upload your payment screenshot");
      return;
    }
    setIsSubmitting(true);
    try {
      // Convert screenshot to base64
      const toBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

      const base64Screenshot = await toBase64(paymentScreenshot);

      const payload: Record<string, unknown> = {
        action: "register",
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        college: formData.college.trim(),
        year: formData.year,
        branch: formData.branch.trim(),
        city: formData.city.trim(),
        github: formData.github.trim(),
        linkedIn: formData.linkedIn.trim(),
        experienceLevel: formData.experienceLevel,
        whyAttend: formData.whyAttend.trim(),
        screenshotFileName: paymentScreenshot.name,
        paymentScreenshot: base64Screenshot,
      };

      await sendToGoogleSheet(payload);

      // Store in localStorage to prevent duplicate submissions
      const stored: string[] = JSON.parse(
        localStorage.getItem("devagents_registrations") || "[]",
      );
      if (!stored.includes(formData.email)) {
        stored.push(formData.email);
        localStorage.setItem("devagents_registrations", JSON.stringify(stored));
      }

      setStep("success");
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Shared styles ───────────────────────────────────────────────── */
  const cardStyle: React.CSSProperties = {
    background: "rgba(22,22,35,0.95)",
    backdropFilter: "blur(24px)",
    border: "1px solid rgba(124,58,237,0.35)",
  };

  const inputClass =
    "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 " +
    "focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all text-sm";

  const labelClass = "block text-sm font-medium text-white/60 mb-1.5";

  /* ── Step indicator ──────────────────────────────────────────────── */
  const StepDots = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {(["form", "payment", "success"] as Step[]).map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
            style={{
              background:
                step === s
                  ? "linear-gradient(135deg,#3b82f6,#8b5cf6)"
                  : step === "payment" && s === "form"
                    ? "linear-gradient(135deg,#3b82f6,#8b5cf6)"
                    : step === "success"
                      ? "linear-gradient(135deg,#3b82f6,#8b5cf6)"
                      : "rgba(255,255,255,0.08)",
              color: "white",
              boxShadow: step === s ? "0 0 12px rgba(124,58,237,0.5)" : "none",
            }}
          >
            {(step === "payment" && s === "form") || step === "success" ? (
              <FaCheckCircle className="text-xs" />
            ) : (
              i + 1
            )}
          </div>
          {i < 2 && (
            <div
              className="w-8 h-px"
              style={{
                background:
                  (step === "payment" && i === 0) || step === "success"
                    ? "linear-gradient(90deg,#3b82f6,#8b5cf6)"
                    : "rgba(255,255,255,0.1)",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );

  /* ── Backdrop ────────────────────────────────────────────────────── */
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) requestClose();
  };

  if (!mounted) {
    return null;
  }

  /* ══════════════════════════════════════════════════════════════════
     SUCCESS SCREEN
  ══════════════════════════════════════════════════════════════════ */
  if (step === "success") {
    return createPortal(
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
        style={{ background: "rgba(9,9,15,0.85)", backdropFilter: "blur(8px)" }}
        onClick={handleBackdrop}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: isOpen ? 1 : 0.95, opacity: isOpen ? 1 : 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="rounded-2xl overflow-hidden w-full max-w-md"
          style={cardStyle}
        >
          <div
            className="h-1 w-full"
            style={{
              background: "linear-gradient(90deg,#2563eb,#7c3aed,#ec4899)",
            }}
          />
          <div className="p-8 text-center space-y-5">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 20,
                delay: 0.1,
              }}
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
              style={{
                background: "rgba(34,197,94,0.15)",
                boxShadow: "0 0 30px rgba(34,197,94,0.25)",
              }}
            >
              <FaCheckCircle className="text-green-400 text-4xl" />
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Registration Received!
              </h3>
              <p className="text-white/50 text-sm leading-relaxed">
                We&apos;ve received your registration and payment screenshot.
                We&apos;ll review it and send a QR approval email to{" "}
                <span className="text-blue-400 font-medium">
                  {formData.email}
                </span>
                . Approval may take up to 24 hours.
              </p>
            </div>
            <div
              className="p-3 rounded-xl text-xs text-white/40"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              Transaction ref:{" "}
              <span className="text-white/60 font-mono">{transactionCode}</span>
            </div>
            <button
              onClick={requestClose}
              className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg,#2563eb,#7c3aed,#ec4899)",
              }}
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>,
      document.body,
    );
  }

  /* ══════════════════════════════════════════════════════════════════
     PAYMENT SCREEN
  ══════════════════════════════════════════════════════════════════ */
  if (step === "payment") {
    return createPortal(
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
        style={{ background: "rgba(9,9,15,0.85)", backdropFilter: "blur(8px)" }}
        onClick={handleBackdrop}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: isOpen ? 1 : 0.95, opacity: isOpen ? 1 : 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="rounded-2xl overflow-hidden w-full max-w-md max-h-[90vh] overflow-y-auto"
          style={cardStyle}
        >
          <div
            className="h-1 w-full"
            style={{
              background: "linear-gradient(90deg,#2563eb,#7c3aed,#ec4899)",
            }}
          />
          <div className="p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Complete Payment
                </h3>
                <p className="text-xs text-white/40">
                  Step 2 of 3 — Pay ₹{PRICE} via UPI
                </p>
              </div>
              <button
                onClick={requestClose}
                disabled={isSubmitting}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-colors"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <FaTimes className="text-xs" />
              </button>
            </div>

            <StepDots />

            {/* Amount */}
            <div
              className="p-4 rounded-xl text-center"
              style={{
                background: "rgba(59,130,246,0.07)",
                border: "1px solid rgba(59,130,246,0.18)",
              }}
            >
              <p
                className="text-4xl font-bold"
                style={{
                  background: "linear-gradient(90deg,#4F8BFF,#8B5CF6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                ₹{PRICE}
              </p>
              <p className="text-xs text-white/40 mt-1">
                DevAgents 1.0 — Workshop Pass
              </p>
            </div>

            {/* Transaction code */}
            <div>
              <p className="text-xs text-white/40 mb-1.5 uppercase tracking-wider">
                Your Transaction Reference
              </p>
              <div
                className="flex items-center justify-between p-3 rounded-xl gap-2"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <span className="text-white/70 font-mono text-xs truncate">
                  {transactionCode}
                </span>
                <button
                  onClick={copyTxCode}
                  className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-blue-400 hover:text-blue-300"
                  style={{ background: "rgba(59,130,246,0.1)" }}
                >
                  <FaCopy className="text-xs" /> Copy
                </button>
              </div>
              <p className="text-xs text-white/30 mt-1">
                Add this as a note in your UPI transaction
              </p>
            </div>

            {/* QR or deep link */}
            {isMobile ? (
              <>
                {isUpiConfigured ? (
                  <a
                    href={upiDeepLink}
                    className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-bold text-white transition-all hover:scale-[1.02]"
                    style={{
                      background:
                        "linear-gradient(135deg,#2563eb,#7c3aed,#ec4899)",
                      boxShadow: "0 0 20px rgba(124,58,237,0.35)",
                    }}
                  >
                    <span className="text-xl">📱</span>
                    <span>Pay ₹{PRICE} with UPI App</span>
                  </a>
                ) : (
                  <div className="w-full rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-5 text-center text-sm text-white/60">
                    UPI ID will be added soon. Once configured, this button will
                    open your payment app directly.
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div
                  className="p-4 rounded-2xl"
                  style={{ background: "rgba(255,255,255,0.96)" }}
                >
                  {isUpiConfigured ? (
                    <QRCodeSVG
                      value={upiDeepLink}
                      size={180}
                      bgColor="#f5f5f5"
                      fgColor="#1e1b4b"
                    />
                  ) : (
                    <div className="flex h-[180px] w-[180px] items-center justify-center rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
                      UPI QR will appear
                      <br />
                      after ID is added
                    </div>
                  )}
                </div>
                <p className="text-xs text-white/40 text-center">
                  Scan with GPay, PhonePe, Paytm or any UPI app
                </p>
              </div>
            )}

            {/* UPI ID */}
            <div>
              <p className="text-xs text-white/40 mb-1.5 uppercase tracking-wider">
                UPI ID
              </p>
              <div
                className="flex items-center justify-between p-3 rounded-xl"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <span className="text-white font-mono text-sm">
                  {DEVAGENTS_UPI_ID}
                </span>
                <button
                  onClick={copyUpi}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-blue-400 hover:text-blue-300"
                  style={{ background: "rgba(59,130,246,0.1)" }}
                >
                  <FaCopy /> Copy
                </button>
              </div>
              {!isUpiConfigured && (
                <p className="mt-1 text-xs text-amber-300">
                  UPI ID is pending — update{" "}
                  <code>NEXT_PUBLIC_DEVAGENTS_UPI_ID</code> in the env file.
                </p>
              )}
            </div>

            {/* Screenshot upload */}
            <div>
              <p className={labelClass}>Upload Payment Screenshot *</p>
              {screenshotPreview ? (
                <div className="relative">
                  <img
                    src={screenshotPreview}
                    alt="Payment screenshot"
                    className="w-full h-40 object-cover rounded-xl border border-white/10"
                  />
                  <button
                    onClick={() => {
                      setPaymentScreenshot(null);
                      setScreenshotPreview(null);
                    }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors"
                    style={{ background: "rgba(239,68,68,0.7)" }}
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-28 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all hover:border-blue-500/40"
                  style={{
                    borderColor: "rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  <FaUpload className="text-white/30 text-xl" />
                  <span className="text-xs text-white/40">
                    Click to upload (max 5 MB)
                  </span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleScreenshotChange}
              />
            </div>

            {/* Confirm button */}
            <button
              onClick={handleFinalSubmit}
              disabled={isSubmitting || !paymentScreenshot}
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: paymentScreenshot
                  ? "linear-gradient(135deg,#2563eb,#7c3aed,#ec4899)"
                  : "rgba(255,255,255,0.06)",
                boxShadow: paymentScreenshot
                  ? "0 0 20px rgba(124,58,237,0.35)"
                  : "none",
              }}
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin" /> Submitting…
                </>
              ) : (
                "Complete Registration"
              )}
            </button>

            <button
              onClick={() => !isSubmitting && setStep("form")}
              disabled={isSubmitting}
              className="w-full text-center text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              ← Back to form
            </button>
          </div>
        </motion.div>
      </motion.div>,
      document.body,
    );
  }

  /* ══════════════════════════════════════════════════════════════════
     REGISTRATION FORM
  ══════════════════════════════════════════════════════════════════ */
  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isOpen ? 1 : 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
      style={{ background: "rgba(9,9,15,0.85)", backdropFilter: "blur(8px)" }}
      onClick={handleBackdrop}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: isOpen ? 1 : 0.95, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="rounded-2xl overflow-hidden w-full max-w-lg max-h-[90vh] overflow-y-auto"
        style={cardStyle}
      >
        <div
          className="h-1 w-full"
          style={{
            background: "linear-gradient(90deg,#2563eb,#7c3aed,#ec4899)",
          }}
        />
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-xl font-bold text-white">
                Register for DevAgents 1.0
              </h3>
              <p className="text-xs text-white/40 mt-0.5">
                Step 1 of 3 — Fill in your details
              </p>
            </div>
            <button
              onClick={requestClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-colors"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <FaTimes className="text-xs" />
            </button>
          </div>

          <StepDots />

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (validateForm()) setStep("payment");
            }}
            className="space-y-4"
          >
            {/* Row: Name */}
            <div>
              <label className={labelClass}>Full Name *</label>
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Your full name"
                className={inputClass}
              />
            </div>

            {/* Row: Email + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Email *</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Phone Number *</label>
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit number"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Row: College */}
            <div>
              <label className={labelClass}>College / Institution *</label>
              <input
                name="college"
                value={formData.college}
                onChange={handleChange}
                placeholder="Name of your college or organisation"
                className={inputClass}
              />
            </div>

            {/* Row: Year + Branch */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Year of Study *</label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="" disabled>
                    Select year
                  </option>
                  <option>1st Year</option>
                  <option>2nd Year</option>
                  <option>3rd Year</option>
                  <option>4th Year</option>
                  <option>Working Professional</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Branch / Specialization *</label>
                <input
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  placeholder="e.g. CSE, ECE, MBA…"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Row: City */}
            <div>
              <label className={labelClass}>City *</label>
              <input
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Your current city"
                className={inputClass}
              />
            </div>

            {/* Row: GitHub + LinkedIn */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  GitHub Profile{" "}
                  <span className="text-white/30">(optional)</span>
                </label>
                <input
                  name="github"
                  value={formData.github}
                  onChange={handleChange}
                  placeholder="github.com/username"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  LinkedIn Profile{" "}
                  <span className="text-white/30">(optional)</span>
                </label>
                <input
                  name="linkedIn"
                  value={formData.linkedIn}
                  onChange={handleChange}
                  placeholder="linkedin.com/in/username"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Experience Level */}
            <div>
              <label className={labelClass}>Experience Level *</label>
              <select
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="" disabled>
                  Select your level
                </option>
                <option>Complete Beginner</option>
                <option>Some Programming Experience</option>
                <option>Intermediate Developer</option>
                <option>Advanced Developer</option>
              </select>
            </div>

            {/* Why Attend */}
            <div>
              <label className={labelClass}>
                Why do you want to attend?{" "}
                <span className="text-white/30">(optional)</span>
              </label>
              <textarea
                name="whyAttend"
                value={formData.whyAttend}
                onChange={handleChange}
                placeholder="Tell us briefly what you hope to learn or build…"
                rows={3}
                className={inputClass}
                style={{ resize: "none" }}
              />
            </div>

            {/* Agree to terms */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="mt-1 w-4 h-4 rounded border-white/20 accent-blue-500 cursor-pointer"
              />
              <span className="text-xs text-white/50 group-hover:text-white/70 transition-colors leading-relaxed">
                I agree to the{" "}
                <a
                  href="/terms"
                  target="_blank"
                  className="text-blue-400 underline"
                >
                  terms & conditions
                </a>{" "}
                and understand the{" "}
                <a
                  href="/refund"
                  target="_blank"
                  className="text-blue-400 underline"
                >
                  refund policy
                </a>
                .
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-4 rounded-xl font-bold text-white text-sm transition-all hover:scale-[1.02] mt-2"
              style={{
                background: "linear-gradient(135deg,#2563eb,#7c3aed,#ec4899)",
                boxShadow: "0 0 24px rgba(124,58,237,0.35)",
              }}
            >
              Continue to Payment →
            </button>

            <p className="text-center text-xs text-white/20 pb-2">
              Ticket price:{" "}
              <span className="text-white/40 font-semibold">₹{PRICE}</span> ·
              Limited to 150 seats
            </p>
          </form>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
