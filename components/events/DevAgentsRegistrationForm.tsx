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
  FaLock,
  FaMobileAlt,
} from "react-icons/fa";
import { QRCodeSVG } from "qrcode.react";
import Image from "next/image";
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
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
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
    // Detect Instagram, Facebook, and other social media in-app browsers
    setIsInAppBrowser(
      /instagram|fbav|fban|fb_iab|line\//i.test(navigator.userAgent),
    );
  }, []);
  // Format UPI link
  const upiDeepLink = `upi://pay?pa=shivaganesh9108@okhdfcbank&pn=MatriXO&cu=INR`;

  const handlePayViaUPI = (e: React.MouseEvent) => {
    e.preventDefault();
    // In WebViews, window.location.href works more reliably for custom URI schemes
    window.location.href = upiDeepLink;
    toast.success("Opening UPI app...");
  };
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
    console.log("[DevAgents] Image selected:", { name: file.name, type: file.type, size: file.size });
    // Mobile browsers (especially iOS Safari) may report empty file.type for HEIC/HEIF.
    // Fall back to checking file extension when type is empty.
    const isImageByType = file.type.startsWith("image/");
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "heic", "heif", "svg", "tiff", "tif"];
    const isImageByExt = imageExtensions.includes(ext);
    if (!isImageByType && !isImageByExt) {
      toast.error("Please upload an image file (JPG, PNG, HEIC, WEBP, etc.)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10 MB");
      return;
    }
    setPaymentScreenshot(file);
    const reader = new FileReader();
    reader.onloadend = () => setScreenshotPreview(reader.result as string);
    reader.onerror = () => {
      console.error("[DevAgents] FileReader failed for preview");
      toast.error("Failed to read image. Please try a different file.");
    };
    reader.readAsDataURL(file);
    toast.success("Screenshot uploaded!");
  };

  const copyUpi = () => {
    if (!isUpiConfigured) {
      toast.error("UPI ID is not configured yet");
      return;
    }
    navigator.clipboard.writeText(DEVAGENTS_UPI_ID);
    setCopiedUpi(true);
    toast.success("UPI ID copied!");
    setTimeout(() => setCopiedUpi(false), 2000);
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
      console.log("[DevAgents] Sending registration to /api/devagents/register...");
      const response = await fetch("/api/devagents/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      console.log("[DevAgents] Response status:", response.status, response.statusText);

      // Handle 413 Payload Too Large specifically
      if (response.status === 413) {
        throw new Error(
          "Image too large for server. Please try a smaller screenshot."
        );
      }

      const result = await response.json().catch(() => ({}));
      console.log("[DevAgents] Response body:", result);
      if (!response.ok || result?.success === false) {
        throw new Error(
          result?.error ||
          result?.details ||
          `Registration failed (HTTP ${response.status})`
        );
      }
    } catch (err) {
      // Re-throw with the real message so the UI can show it
      console.error("[DevAgents] sendToGoogleSheet error:", err);
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        throw new Error(
          "Network error: Could not reach the server. Please check your connection."
        );
      }
      const msg =
        err instanceof Error ? err.message : "Failed to forward registration";
      throw new Error(msg);
    }
  };

  /* ── Compress image via canvas (mobile photos can be 5–15 MB) ───── */
  const compressScreenshot = (dataUrl: string): Promise<string> =>
    new Promise((resolve, reject) => {
      console.log("[DevAgents] Compressing image from data URL, length:", dataUrl.length);
      const img = new window.Image();
      img.onload = () => {
        try {
          // Resize to max 1200×1200 maintaining aspect ratio
          const MAX = 1200;
          let { width, height } = img;
          if (width > MAX || height > MAX) {
            const ratio = Math.min(MAX / width, MAX / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d", { alpha: false });
          if (!ctx) {
            reject(new Error("Could not get canvas context"));
            return;
          }
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);

          // Iteratively reduce quality until under 500 KB
          let quality = 0.7;
          const tryCompress = () => {
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error("Canvas toBlob failed"));
                  return;
                }
                console.log("[DevAgents] Compressed blob:", { size: blob.size, quality });
                if (blob.size > 500 * 1024 && quality > 0.15) {
                  quality -= 0.1;
                  tryCompress();
                } else {
                  // Convert compressed blob to base64 Data URL
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    const result = reader.result as string;
                    console.log("[DevAgents] Final base64 length:", result.length);
                    resolve(result);
                  };
                  reader.onerror = () => reject(new Error("Failed to read compressed image"));
                  reader.readAsDataURL(blob);
                }
              },
              "image/jpeg",
              quality,
            );
          };
          tryCompress();
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error("Failed to load image for compression"));

      // Load directly from the data URL already in memory — no File re-read needed
      img.src = dataUrl;
    });

  /* ── Final submit (after payment + screenshot) ───────────────────── */
  const handleFinalSubmit = async () => {
    if (!paymentScreenshot || !screenshotPreview) {
      toast.error("Please upload your payment screenshot");
      return;
    }
    setIsSubmitting(true);
    try {
      // Compress using the preview data URL already in memory.
      // We avoid re-reading the File object because mobile browsers
      // can invalidate File blob references between selection and submission.
      console.log("[DevAgents] Starting image compression from preview...");
      const base64Screenshot = await compressScreenshot(screenshotPreview);
      console.log("[DevAgents] Image compressed successfully, base64 length:", base64Screenshot.length);

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

      const payloadSize = JSON.stringify(payload).length;
      console.log("[DevAgents] Payload size (bytes):", payloadSize);

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
      console.error("[DevAgents] Registration error:", err);
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
  const StepDots = () => {
    const steps: { key: Step; label: string }[] = [
      { key: "form", label: "Details" },
      { key: "payment", label: "Pay" },
      { key: "success", label: "Done" },
    ];
    const currentIdx = steps.findIndex((s) => s.key === step);

    return (
      <div className="flex items-center justify-center gap-0 mb-5">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center">
            <div className="flex flex-col items-center gap-1 min-w-[3rem]">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                style={{
                  background:
                    i <= currentIdx
                      ? "linear-gradient(135deg,#3b82f6,#8b5cf6)"
                      : "rgba(255,255,255,0.08)",
                  color: "white",
                  boxShadow:
                    i === currentIdx
                      ? "0 0 12px rgba(124,58,237,0.5)"
                      : "none",
                }}
              >
                {i < currentIdx ? (
                  <FaCheckCircle className="text-xs" />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-[10px] font-medium transition-colors duration-300 ${
                  i <= currentIdx ? "text-white/70" : "text-white/30"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < 2 && (
              <div
                className="w-8 h-px -mt-4"
                style={{
                  background:
                    i < currentIdx
                      ? "linear-gradient(90deg,#3b82f6,#8b5cf6)"
                      : "rgba(255,255,255,0.1)",
                  transition: "background 0.3s ease",
                }}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

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
        className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:px-4"
        style={{ background: "rgba(9,9,15,0.85)", backdropFilter: "blur(8px)" }}
        onClick={handleBackdrop}
      >
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: isOpen ? 0 : 60, opacity: isOpen ? 1 : 0 }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          className="rounded-t-3xl sm:rounded-2xl overflow-hidden w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
          style={cardStyle}
        >
          <div
            className="h-1 w-full"
            style={{
              background: "linear-gradient(90deg,#2563eb,#7c3aed,#ec4899)",
            }}
          />
          {/* Drag handle for mobile bottom sheet */}
          <div className="flex justify-center pt-3 sm:hidden">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>
          <div className="p-5 sm:p-6 space-y-4">
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

            {/* Amount Hero */}
            <div
              className="p-4 rounded-2xl text-center relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))",
                border: "1px solid rgba(99,102,241,0.2)",
              }}
            >
              <p
                className="text-4xl font-extrabold tracking-tight"
                style={{
                  background: "linear-gradient(90deg,#60a5fa,#a78bfa,#f472b6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                ₹{PRICE}
              </p>
              <p className="text-sm text-white/50 mt-1">
                DevAgents 1.0 — Workshop Pass
              </p>
              <div className="flex items-center justify-center gap-1.5 mt-2.5">
                <span className="inline-block w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                <span className="text-xs font-semibold text-orange-300">
                  Only few seats left — Book now!
                </span>
              </div>
            </div>

            {/* PAY VIA UPI — Primary CTA for mobile */}
            {isMobile && (
              <button
                onClick={handlePayViaUPI}
                className="w-full py-4 rounded-2xl font-bold text-white text-base transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                style={{
                  background: "linear-gradient(135deg,#2563eb,#7c3aed)",
                  boxShadow: "0 4px 24px rgba(124,58,237,0.4), 0 0 0 1px rgba(124,58,237,0.2)",
                }}
              >
                <FaMobileAlt className="text-lg" />
                <span>Pay ₹{PRICE} via UPI App</span>
              </button>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-white/30 font-medium">
                {isMobile ? "or scan QR code" : "Scan QR code to pay"}
              </span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center gap-3">
              <div className="bg-white p-3 rounded-2xl shadow-lg shadow-black/20">
                <Image
                  src="/payment-qr.jpg"
                  alt="Payment QR Code"
                  width={isMobile ? 180 : 200}
                  height={isMobile ? 180 : 200}
                  className="rounded-lg"
                  priority
                />
              </div>
              <a
                href="/payment-qr.jpg"
                download="DevAgents-Payment-QR.jpg"
                onClick={() => toast.success("QR saved! Open your UPI app and scan from gallery.")}
                className="mt-2 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10"
              >
                <span>⬇️</span> Download QR Code
              </a>
              <p className="text-[11px] text-white/30 text-center mt-1">
                Works with GPay, PhonePe, Paytm & all UPI apps
              </p>
            </div>

            {/* UPI ID */}
            <div>
              <p className="text-xs text-white/40 mb-1.5">UPI ID</p>
              <div
                className="flex items-center justify-between p-3 rounded-xl transition-all duration-300"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: copiedUpi
                    ? "1px solid rgba(34,197,94,0.4)"
                    : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <span className="text-white font-mono text-sm truncate mr-2">
                  {DEVAGENTS_UPI_ID}
                </span>
                <button
                  onClick={copyUpi}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
                  style={{
                    background: copiedUpi
                      ? "rgba(34,197,94,0.15)"
                      : "rgba(59,130,246,0.1)",
                    color: copiedUpi ? "#4ade80" : "#60a5fa",
                  }}
                >
                  {copiedUpi ? (
                    <><FaCheckCircle className="text-xs" /> Copied</>
                  ) : (
                    <><FaCopy className="text-xs" /> Copy</>
                  )}
                </button>
              </div>
              {!isUpiConfigured && (
                <p className="mt-1 text-xs text-amber-300">
                  UPI ID is pending — update{" "}
                  <code>NEXT_PUBLIC_DEVAGENTS_UPI_ID</code> in the env file.
                </p>
              )}
            </div>

            {/* After Payment divider */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-white/40 font-semibold uppercase tracking-wider">After Payment</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Screenshot upload */}
            <div>
              <p className={labelClass}>Upload Payment Screenshot *</p>
              {screenshotPreview ? (
                <div className="relative">
                  <div className="rounded-xl overflow-hidden border border-green-500/30">
                    <img
                      src={screenshotPreview}
                      alt="Payment screenshot"
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-xl" />
                    <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
                      <FaCheckCircle className="text-green-400 text-sm" />
                      <span className="text-xs text-green-300 font-medium">Proof uploaded</span>
                    </div>
                  </div>
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
                  className="w-full py-6 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all active:scale-[0.98] hover:border-indigo-500/40"
                  style={{
                    borderColor: "rgba(99,102,241,0.25)",
                    background: "rgba(99,102,241,0.04)",
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-1"
                    style={{ background: "rgba(99,102,241,0.12)" }}
                  >
                    <FaUpload className="text-indigo-400 text-lg" />
                  </div>
                  <span className="text-sm text-white/50 font-medium">
                    Tap to upload payment proof
                  </span>
                  <span className="text-[11px] text-white/25">
                    JPG, PNG, HEIC — max 10 MB
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

            {/* Submit button */}
            <button
              onClick={handleFinalSubmit}
              disabled={isSubmitting || !paymentScreenshot}
              className="w-full py-4 rounded-xl font-bold text-white text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
              style={{
                background: paymentScreenshot
                  ? "linear-gradient(135deg,#16a34a,#22c55e)"
                  : "rgba(255,255,255,0.06)",
                boxShadow: paymentScreenshot
                  ? "0 4px 20px rgba(34,197,94,0.3)"
                  : "none",
              }}
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin" /> Submitting…
                </>
              ) : paymentScreenshot ? (
                <>I&apos;ve Paid — Submit ✓</>
              ) : (
                "Upload proof to continue"
              )}
            </button>

            <button
              onClick={() => !isSubmitting && setStep("form")}
              disabled={isSubmitting}
              className="w-full text-center text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              ← Back to form
            </button>

            {/* Trust footer */}
            <div className="flex items-center justify-center gap-3 pt-1 pb-1">
              <div className="flex items-center gap-1.5 text-[10px] text-white/25">
                <FaLock className="text-[8px]" />
                <span>Secure payment</span>
              </div>
              <span className="text-white/10">·</span>
              <span className="text-[10px] text-white/25">1,000+ registrations</span>
            </div>
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
              className="w-full py-4 rounded-xl font-bold text-white text-sm transition-all hover:scale-[1.02] active:scale-[0.98] mt-2"
              style={{
                background: "linear-gradient(135deg,#2563eb,#7c3aed,#ec4899)",
                boxShadow: "0 0 24px rgba(124,58,237,0.35)",
              }}
            >
              Continue to Payment →
            </button>

            <div className="flex items-center justify-center gap-2 pb-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <p className="text-xs text-white/30">
                <span className="text-white/50 font-semibold">₹{PRICE}</span> · Limited to 150 seats · Instant confirmation
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
