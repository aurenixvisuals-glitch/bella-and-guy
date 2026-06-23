"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabase";
import { allCategories } from "../../lib/servicesData";
import {
  Store, Home, Check, User, Phone, Mail, MapPin,
  Clock, Star, X, Sparkles, Calendar, Edit2, ChevronRight,
  MessageCircle
} from "lucide-react";

/* ── Time slots ────────────────────────────────────────────── */
const TIME_SLOTS = Array.from({ length: 23 }, (_, i) => {
  const totalMins = 9 * 60 + i * 30;
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return {
    label: `${h12}:${m.toString().padStart(2, "0")} ${ampm}`,
    value: `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`,
  };
});

function formatDate(d: string) {
  if (!d) return "";
  return new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

const PROGRESS = ["Location", "Gender", "Category", "Service", "Date", "Time", "Details", "Review"];

/* ── Main Component ─────────────────────────────────────────── */
export default function BookPage() {
  const [step, setStep]               = useState(1);
  const [isHome, setIsHome]           = useState<boolean | null>(null);
  const [gender, setGender]           = useState<"female" | "male" | "">("");
  const [selCat, setSelCat]           = useState("");
  const [service, setService]         = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [fullName, setFullName]       = useState("");
  const [phone, setPhone]             = useState("");
  const [email, setEmail]             = useState("");
  const [flatNo, setFlatNo]           = useState("");
  const [street, setStreet]           = useState("");
  const [landmark, setLandmark]       = useState("");
  const [city, setCity]               = useState("Ghaziabad");
  const [pincode, setPincode]         = useState("");
  const [notes, setNotes]             = useState("");
  const [honeypot, setHoneypot]       = useState("");
  const [spamError, setSpamError]     = useState("");
  const [loading, setLoading]         = useState(false);
  const [booked, setBooked]           = useState<any>(null);
  const [detailsError, setDetailsError] = useState("");

  const stepRefs = useRef<(HTMLDivElement | null)[]>(Array(8).fill(null));
  const todayStr = new Date().toISOString().split("T")[0];

  /* ── Pre-fill ─────────────────────────────────────── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const m = session.user.user_metadata;
        if (m?.full_name) setFullName(m.full_name);
        if (m?.phone)     setPhone(m.phone);
        if (m?.email)     setEmail(session.user.email || "");
      }
    });
    const pre = localStorage.getItem("preselectService");
    if (pre) {
      setService(pre);
      const cat = allCategories.find(c => c.services.some(s => `${s.name} — ${c.label}` === pre));
      if (cat) setSelCat(cat.id);
      localStorage.removeItem("preselectService");
    }
  }, []);

  /* ── Scroll ───────────────────────────────────────── */
  function scrollToStep(n: number) {
    setTimeout(() => {
      const el = stepRefs.current[n - 1];
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - 130;
      window.scrollTo({ top, behavior: "smooth" });
    }, 120);
  }

  function advance(n: number) {
    setStep(n);
    scrollToStep(n);
  }

  function editStep(n: number) {
    // Reset everything after n
    if (n <= 1) { setIsHome(null); }
    if (n <= 2) { setGender(""); }
    if (n <= 3) { setSelCat(""); }
    if (n <= 4) { setService(""); }
    if (n <= 5) { setBookingDate(""); }
    if (n <= 6) { setBookingTime(""); }
    advance(n);
  }

  /* ── Derived ──────────────────────────────────────── */
  const visibleCats = allCategories.filter(c => {
    const gMatch = !gender || c.gender === gender || c.gender === "both";
    const hMatch = isHome === null || (isHome ? c.homeService : true);
    return gMatch && hMatch;
  });

  const selectedCat = allCategories.find(c => c.id === selCat);

  const servicePrice = (() => {
    if (!service) return null;
    const [sName] = service.split(" — ");
    for (const cat of allCategories) {
      const sv = cat.services.find(s => s.name === sName);
      if (sv) return sv.price;
    }
    return null;
  })();

  const fullAddress = [flatNo, street, landmark, city, pincode].filter(Boolean).join(", ");

  /* ── Submit ───────────────────────────────────────── */
  async function handleSubmit() {
    setSpamError(""); setDetailsError("");
    if (honeypot) return;
    if (!fullName.trim()) { setDetailsError("Full name is required."); return; }
    const cleaned = phone.replace(/\D/g, "").replace(/^91/, "");
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      setDetailsError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }
    if (isHome && !fullAddress) { setSpamError("Please enter your address for home service."); return; }

    const twoHrsAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("phone", cleaned)
      .gte("created_at", twoHrsAgo);
    if ((count ?? 0) >= 3) { setSpamError("Max 3 bookings per 2 hours from the same number."); return; }

    setLoading(true);
    try {
      const { data: inserted, error } = await supabase
        .from("appointments")
        .insert([{
          full_name: fullName, phone: cleaned, email: email || null,
          service, booking_date: bookingDate, booking_time: bookingTime,
          is_home_service: isHome, address: isHome ? fullAddress : null,
          staff: null, notes: notes || null,
        }])
        .select("id").single();
      if (error) throw error;

      const bookingPayload = {
        id: inserted?.id,
        full_name: fullName, email, phone: cleaned,
        service, booking_date: bookingDate, booking_time: bookingTime,
        is_home_service: isHome, address: isHome ? fullAddress : null,
        notes: notes || null,
      };

      // Email notification
      try {
        await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "created", booking: bookingPayload }),
        });
      } catch {}

      // WhatsApp notification to salon owner
      try {
        await fetch("/api/send-whatsapp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ booking: bookingPayload }),
        });
      } catch {}

      setBooked({ id: inserted?.id, fullName, phone: cleaned, email, service, bookingDate, bookingTime, isHome, address: fullAddress, notes });
    } catch (err: any) {
      alert("Booking failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  /* ── Step summaries ────────────────────────────────── */
  const summaries: Record<number, string> = {
    1: isHome !== null ? (isHome ? "Home Service" : "At Salon — Wave City") : "",
    2: gender === "female" ? "Female" : gender === "male" ? "Male" : "",
    3: selectedCat?.label ?? "",
    4: service ? `${service.split(" — ")[0]}  ·  ₹${servicePrice?.toLocaleString() ?? ""}` : "",
    5: bookingDate ? formatDate(bookingDate) : "",
    6: bookingTime ? (TIME_SLOTS.find(s => s.value === bookingTime)?.label ?? bookingTime) : "",
    7: fullName ? `${fullName}  ·  ${phone}` : "",
  };

  /* ── Step Card helper ──────────────────────────────── */
  const StepCard = ({
    num, title, children,
  }: { num: number; title: string; children: React.ReactNode }) => {
    const isActive    = step === num;
    const isCompleted = step > num;
    const isLocked    = step < num;
    return (
      <div
        ref={el => { stepRefs.current[num - 1] = el; }}
        style={{
          background: "#fff",
          border: `1.5px solid ${isActive ? "rgba(201,168,76,0.4)" : "rgba(0,0,0,0.07)"}`,
          borderRadius: 16,
          marginBottom: 12,
          overflow: "hidden",
          transition: "border-color 0.3s ease, box-shadow 0.3s ease",
          boxShadow: isActive ? "0 4px 24px rgba(201,168,76,0.1)" : "none",
          opacity: isLocked ? 0.5 : 1,
        }}
      >
        {/* Header */}
        <div
          onClick={() => isCompleted ? editStep(num) : undefined}
          style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "16px 20px",
            cursor: isCompleted ? "pointer" : "default",
          }}
        >
          {/* Step circle */}
          <div style={{
            width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700,
            background: isCompleted ? "rgba(45,143,94,0.12)" : isActive ? "#C9A84C" : "rgba(0,0,0,0.06)",
            color: isCompleted ? "#2d8f5e" : isActive ? "#080808" : "rgba(0,0,0,0.3)",
            border: `2px solid ${isCompleted ? "rgba(45,143,94,0.3)" : isActive ? "#C9A84C" : "transparent"}`,
          }}>
            {isCompleted ? <Check size={15} /> : num}
          </div>

          {/* Title + summary */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 13, fontWeight: 700, color: isLocked ? "rgba(0,0,0,0.3)" : "#080808",
              letterSpacing: "0.01em",
            }}>
              {title}
            </div>
            {isCompleted && summaries[num] && (
              <div style={{ fontSize: 12, color: "#6b4f10", marginTop: 2, fontWeight: 500 }}>
                {summaries[num]}
              </div>
            )}
          </div>

          {/* Edit chip */}
          {isCompleted && (
            <div style={{
              display: "flex", alignItems: "center", gap: 4,
              fontSize: 11, color: "rgba(0,0,0,0.35)", fontWeight: 600,
              background: "rgba(0,0,0,0.04)", borderRadius: 20, padding: "4px 10px",
              letterSpacing: "0.04em",
            }}>
              <Edit2 size={11} /> Edit
            </div>
          )}
        </div>

        {/* Body */}
        <AnimatePresence initial={false}>
          {isActive && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
              style={{ overflow: "hidden" }}
            >
              <div style={{ padding: "0 20px 24px" }}>
                <div style={{ height: 1, background: "rgba(0,0,0,0.05)", marginBottom: 20 }} />
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  /* ══════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════ */
  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { background: #FAF7F0; }

        /* Progress bar */
        .pbk-bar {
          position: sticky; top: 0; z-index: 90;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0,0,0,0.07);
          padding: 14px 20px 10px;
        }
        .pbk-inner {
          max-width: 720px; margin: 0 auto;
          display: flex; align-items: flex-start; gap: 0;
        }
        .pbk-item {
          flex: 1; display: flex; flex-direction: column; align-items: center;
          gap: 5px; position: relative;
        }
        .pbk-item:not(:last-child)::after {
          content: ""; position: absolute;
          top: 13px; left: calc(50% + 14px);
          right: calc(-50% + 14px);
          height: 2px;
          background: rgba(0,0,0,0.08);
          transition: background 0.4s;
        }
        .pbk-item.done:not(:last-child)::after { background: #2d8f5e; }
        .pbk-dot {
          width: 26px; height: 26px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700;
          border: 2px solid rgba(0,0,0,0.1);
          background: transparent; color: rgba(0,0,0,0.3);
          transition: all 0.3s;
        }
        .pbk-item.active .pbk-dot { border-color: #C9A84C; background: #C9A84C; color: #080808; }
        .pbk-item.done .pbk-dot { border-color: #2d8f5e; background: rgba(45,143,94,0.12); color: #2d8f5e; }
        .pbk-lbl {
          font-size: 9px; font-weight: 600; letter-spacing: 0.05em;
          text-transform: uppercase; color: rgba(0,0,0,0.28);
          text-align: center; line-height: 1.2;
        }
        .pbk-item.active .pbk-lbl { color: #C9A84C; }
        .pbk-item.done .pbk-lbl { color: #2d8f5e; }

        /* Hero */
        .bk2-hero {
          background: linear-gradient(135deg, #080808 0%, #1a1200 50%, #080808 100%);
          padding: 56px 20px 40px;
          text-align: center; position: relative;
        }
        .bk2-hero::before {
          content: ""; position: absolute; inset: 0;
          background: radial-gradient(ellipse 60% 70% at 50% 110%, rgba(201,168,76,0.2), transparent);
          pointer-events: none;
        }

        /* Location cards */
        .loc-card {
          flex: 1; border: 2px solid rgba(0,0,0,0.08); border-radius: 14px;
          padding: 22px 16px; text-align: center; cursor: pointer;
          transition: all 0.22s; background: #FAFAF8;
          display: flex; flex-direction: column; align-items: center; gap: 10px;
        }
        .loc-card:hover { border-color: rgba(201,168,76,0.4); transform: translateY(-2px); }
        .loc-card.sel { border-color: #C9A84C; background: rgba(201,168,76,0.06); }
        .loc-icon {
          width: 52px; height: 52px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 24px;
        }

        /* Gender cards */
        .gen-card {
          flex: 1; border: 2px solid rgba(0,0,0,0.08); border-radius: 14px;
          padding: 26px 16px; text-align: center; cursor: pointer;
          transition: all 0.22s; background: #FAFAF8;
          display: flex; flex-direction: column; align-items: center; gap: 12px;
        }
        .gen-card:hover { border-color: rgba(201,168,76,0.4); transform: translateY(-2px); }
        .gen-card.sel { border-color: #C9A84C; background: rgba(201,168,76,0.06); }

        /* Category grid */
        .cat-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 9px;
        }
        .cat-btn {
          border: 1.5px solid rgba(0,0,0,0.08); border-radius: 11px;
          padding: 13px 8px; text-align: center; cursor: pointer;
          font-family: 'Inter', sans-serif; transition: all 0.2s;
          background: #FAFAF8; font-size: 11px; font-weight: 600;
          color: rgba(0,0,0,0.5);
        }
        .cat-btn:hover { border-color: rgba(201,168,76,0.4); color: #8a6a1a; }
        .cat-btn.sel { border-color: #C9A84C; background: rgba(201,168,76,0.07); color: #8a6a1a; }
        .cat-icon { font-size: 20px; margin-bottom: 5px; display: block; }

        /* Service cards */
        .svc-card {
          border: 1.5px solid rgba(0,0,0,0.07); border-radius: 12px;
          padding: 14px 16px; cursor: pointer; transition: all 0.2s;
          background: #FAFAF8; display: flex; align-items: center; gap: 12px;
        }
        .svc-card:hover { border-color: rgba(201,168,76,0.35); background: rgba(201,168,76,0.03); }
        .svc-card.sel { border-color: #C9A84C; background: rgba(201,168,76,0.07); }

        /* Time slots */
        .time-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;
        }
        .time-btn {
          padding: 10px 6px; border-radius: 9px;
          border: 1.5px solid rgba(0,0,0,0.08);
          text-align: center; cursor: pointer; font-family: 'Inter', sans-serif;
          font-size: 12px; font-weight: 600; transition: all 0.18s;
          color: rgba(0,0,0,0.5); background: #FAFAF8;
        }
        .time-btn:hover { border-color: rgba(201,168,76,0.5); color: #8a6a1a; }
        .time-btn.sel { border-color: #C9A84C; background: #C9A84C; color: #080808; }

        /* Inputs */
        .bk2-input {
          width: 100%; border: 1.5px solid rgba(0,0,0,0.1); padding: 13px 16px;
          border-radius: 10px; font-size: 14px; color: #080808;
          background: #FAFAF8; outline: none; transition: all 0.22s;
          font-family: 'Inter', sans-serif;
        }
        .bk2-input:focus { border-color: #C9A84C; background: rgba(201,168,76,0.03); box-shadow: 0 0 0 3px rgba(201,168,76,0.08); }
        .bk2-input::placeholder { color: rgba(0,0,0,0.2); }
        .bk2-label {
          display: block; font-size: 10px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: rgba(0,0,0,0.35); margin-bottom: 7px;
        }
        .bk2-field { margin-bottom: 16px; }
        .bk2-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        /* Review rows */
        .rv-row {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 11px 0; border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .rv-row:last-child { border-bottom: none; }
        .rv-icon {
          width: 28px; height: 28px; border-radius: 8px;
          background: rgba(201,168,76,0.1); color: #C9A84C;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .rv-key { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(0,0,0,0.28); width: 70px; flex-shrink: 0; padding-top: 4px; }
        .rv-val { color: #080808; font-weight: 500; font-size: 13px; padding-top: 3px; flex: 1; }
        .rv-edit { font-size: 11px; color: #C9A84C; font-weight: 600; cursor: pointer; text-decoration: underline; flex-shrink: 0; padding-top: 4px; }

        /* Submit button */
        .bk2-submit {
          width: 100%; padding: 16px;
          background: linear-gradient(135deg, #E8C96D, #C9A84C);
          color: #080808; border: none; border-radius: 12px;
          font-size: 14px; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; cursor: pointer; font-family: 'Inter', sans-serif;
          transition: all 0.3s; margin-top: 20px;
        }
        .bk2-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(201,168,76,0.35); }
        .bk2-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        /* CTA next button */
        .bk2-next {
          display: inline-flex; align-items: center; gap: 6px;
          background: #080808; color: #fff; border: none;
          padding: 12px 24px; border-radius: 10px;
          font-size: 12px; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; cursor: pointer; font-family: 'Inter', sans-serif;
          transition: all 0.25s;
        }
        .bk2-next:hover { background: #C9A84C; color: #080808; }

        /* Success modal */
        .bk2-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(4,4,8,0.78); backdrop-filter: blur(12px);
          display: flex; align-items: center; justify-content: center; padding: 20px;
          animation: bkFIn 0.25s ease;
        }
        @keyframes bkFIn { from{opacity:0} to{opacity:1} }
        .bk2-modal {
          background: #FFFDF8; border-radius: 20px;
          border: 1px solid rgba(201,168,76,0.2);
          box-shadow: 0 40px 100px rgba(0,0,0,0.4);
          width: 100%; max-width: 460px;
          animation: bkSUp 0.35s cubic-bezier(0.22,1,0.36,1);
          overflow: hidden;
        }
        @keyframes bkSUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }

        /* Modal success top */
        .bk2-modal-top {
          background: linear-gradient(135deg, #1a1200, #2e1f00);
          padding: 36px 28px 28px; text-align: center; position: relative;
        }
        .bk2-modal-check {
          width: 64px; height: 64px; border-radius: 50%;
          background: rgba(201,168,76,0.15); border: 2px solid rgba(201,168,76,0.4);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 14px; color: #C9A84C;
        }

        /* Responsive */
        @media (max-width: 600px) {
          .bk2-2col { grid-template-columns: 1fr; }
          .cat-grid { grid-template-columns: repeat(3, 1fr); }
          .time-grid { grid-template-columns: repeat(3, 1fr); }
          .pbk-lbl { display: none; }
          .pbk-dot { width: 22px; height: 22px; font-size: 10px; }
        }
        @media (max-width: 400px) {
          .cat-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      {/* ── Progress Bar ── */}
      <div className="pbk-bar">
        <div className="pbk-inner">
          {PROGRESS.map((label, i) => {
            const n = i + 1;
            const cls = step > n ? "done" : step === n ? "active" : "";
            return (
              <div key={i} className={`pbk-item ${cls}`}>
                <div className="pbk-dot">
                  {step > n ? <Check size={12} /> : n}
                </div>
                <div className="pbk-lbl">{label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Hero ── */}
      <div className="bk2-hero">
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#C9A84C", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span style={{ width: 20, height: 1, background: "#C9A84C", display: "inline-block" }} />
            Bella & Guy Salon
            <span style={{ width: 20, height: 1, background: "#C9A84C", display: "inline-block" }} />
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px,5vw,48px)", fontWeight: 400, color: "#fff", margin: 0, lineHeight: 1.1 }}>
            Book an Appointment
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", marginTop: 10, marginBottom: 0 }}>
            At salon or home — we confirm within 30 minutes
          </p>
        </div>
      </div>

      {/* ── Steps ── */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 16px 80px" }}>

        {/* ─ STEP 1: LOCATION ─ */}
        <StepCard num={1} title="Where would you like your service?">
          <div style={{ display: "flex", gap: 12 }}>
            <div className={`loc-card ${isHome === false ? "sel" : ""}`} onClick={() => { setIsHome(false); advance(2); }}>
              <div className="loc-icon" style={{ background: "rgba(201,168,76,0.1)" }}>
                <Store size={26} color="#C9A84C" />
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#080808" }}>At Salon</div>
              <div style={{ fontSize: 11, color: "#888", lineHeight: 1.4 }}>Visit us at Wave City, Ghaziabad</div>
              {isHome === false && <div style={{ fontSize: 11, fontWeight: 700, color: "#2d8f5e" }}><Check size={11} style={{ display: "inline" }} /> Selected</div>}
            </div>
            <div className={`loc-card ${isHome === true ? "sel" : ""}`} onClick={() => { setIsHome(true); advance(2); }}>
              <div className="loc-icon" style={{ background: "rgba(45,143,94,0.1)" }}>
                <Home size={26} color="#2d8f5e" />
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#080808" }}>Home Service</div>
              <div style={{ fontSize: 11, color: "#888", lineHeight: 1.4 }}>We come to your doorstep</div>
              {isHome === true && <div style={{ fontSize: 11, fontWeight: 700, color: "#2d8f5e" }}><Check size={11} style={{ display: "inline" }} /> Selected</div>}
            </div>
          </div>
        </StepCard>

        {/* ─ STEP 2: GENDER ─ */}
        <StepCard num={2} title="Select your preference">
          <div style={{ display: "flex", gap: 12 }}>
            <div className={`gen-card ${gender === "female" ? "sel" : ""}`} onClick={() => { setGender("female"); advance(3); }}>
              <div style={{ fontSize: 38 }}>♀</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#080808" }}>Female</div>
              <div style={{ fontSize: 11, color: "#888" }}>Facials, waxing, makeup & more</div>
              {gender === "female" && <div style={{ fontSize: 11, fontWeight: 700, color: "#2d8f5e" }}><Check size={11} style={{ display: "inline" }} /> Selected</div>}
            </div>
            <div className={`gen-card ${gender === "male" ? "sel" : ""}`} onClick={() => { setGender("male"); advance(3); }}>
              <div style={{ fontSize: 38 }}>♂</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#080808" }}>Male</div>
              <div style={{ fontSize: 11, color: "#888" }}>Haircut, beard, grooming & more</div>
              {gender === "male" && <div style={{ fontSize: 11, fontWeight: 700, color: "#2d8f5e" }}><Check size={11} style={{ display: "inline" }} /> Selected</div>}
            </div>
          </div>
        </StepCard>

        {/* ─ STEP 3: CATEGORY ─ */}
        <StepCard num={3} title="Choose a service category">
          <div className="cat-grid">
            {visibleCats.map(cat => (
              <div key={cat.id} className={`cat-btn ${selCat === cat.id ? "sel" : ""}`}
                onClick={() => { setSelCat(cat.id); advance(4); }}>
                <span className="cat-icon">{cat.icon}</span>
                {cat.label}
              </div>
            ))}
          </div>
        </StepCard>

        {/* ─ STEP 4: SERVICE ─ */}
        <StepCard num={4} title="Select a service">
          {selectedCat ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {selectedCat.services.map(svc => {
                const val = `${svc.name} — ${selectedCat.label}`;
                const isSel = service === val;
                return (
                  <div key={svc.name} className={`svc-card ${isSel ? "sel" : ""}`}
                    onClick={() => { setService(val); advance(5); }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#080808" }}>{svc.name}</span>
                        {svc.popular && (
                          <span style={{ fontSize: 9, fontWeight: 700, background: "rgba(201,168,76,0.15)", color: "#8a6a1a", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 20, padding: "1px 7px", letterSpacing: "0.06em", textTransform: "uppercase" }}>Popular</span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{selectedCat.desc}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: isSel ? "#8a6a1a" : "#080808" }}>₹{svc.price.toLocaleString()}</div>
                      {isSel && <Check size={14} color="#2d8f5e" style={{ marginTop: 2 }} />}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ color: "#aaa", fontSize: 13 }}>Please select a category first.</div>
          )}
        </StepCard>

        {/* ─ STEP 5: DATE ─ */}
        <StepCard num={5} title="Pick a date">
          <div className="bk2-field">
            <label className="bk2-label">Preferred Date</label>
            <input
              type="date" className="bk2-input"
              value={bookingDate} min={todayStr}
              onChange={e => setBookingDate(e.target.value)}
            />
            {bookingDate && (
              <div style={{ fontSize: 12, color: "#8a6a1a", marginTop: 8, fontWeight: 500 }}>
                {formatDate(bookingDate)}
              </div>
            )}
          </div>
          {bookingDate && (
            <button className="bk2-next" onClick={() => advance(6)}>
              Continue <ChevronRight size={14} />
            </button>
          )}
        </StepCard>

        {/* ─ STEP 6: TIME ─ */}
        <StepCard num={6} title="Choose a time slot">
          <div className="time-grid">
            {TIME_SLOTS.map(slot => (
              <button key={slot.value} type="button"
                className={`time-btn ${bookingTime === slot.value ? "sel" : ""}`}
                onClick={() => { setBookingTime(slot.value); advance(7); }}>
                {slot.label}
              </button>
            ))}
          </div>
        </StepCard>

        {/* ─ STEP 7: DETAILS ─ */}
        <StepCard num={7} title="Your details">
          <div className="bk2-2col" style={{ marginBottom: 14 }}>
            <div>
              <label className="bk2-label"><User size={10} style={{ display: "inline", marginRight: 4 }} />Full Name *</label>
              <input type="text" className="bk2-input" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" />
            </div>
            <div>
              <label className="bk2-label"><Phone size={10} style={{ display: "inline", marginRight: 4 }} />Phone *</label>
              <input type="tel" className="bk2-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 XXXXXXXXXX" />
            </div>
          </div>
          <div className="bk2-field">
            <label className="bk2-label"><Mail size={10} style={{ display: "inline", marginRight: 4 }} />Email <span style={{ textTransform: "none", letterSpacing: 0, fontWeight: 400, color: "rgba(0,0,0,0.25)" }}>(optional)</span></label>
            <input type="email" className="bk2-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
          </div>

          {/* Address (only for home service) */}
          {isHome && (
            <div style={{ background: "rgba(201,168,76,0.04)", border: "1.5px solid rgba(201,168,76,0.15)", borderRadius: 12, padding: "16px 14px", marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#8a6a1a", marginBottom: 12, display: "flex", alignItems: "center", gap: 5 }}>
                <MapPin size={11} /> Home Service Address
              </div>
              <div className="bk2-2col" style={{ marginBottom: 10 }}>
                <div>
                  <label className="bk2-label">Flat / House No. *</label>
                  <input type="text" className="bk2-input" value={flatNo} onChange={e => setFlatNo(e.target.value)} placeholder="e.g. A-204" />
                </div>
                <div>
                  <label className="bk2-label">Pincode *</label>
                  <input type="text" className="bk2-input" value={pincode} onChange={e => setPincode(e.target.value)} placeholder="201301" maxLength={6} />
                </div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <label className="bk2-label">Street / Colony / Sector *</label>
                <input type="text" className="bk2-input" value={street} onChange={e => setStreet(e.target.value)} placeholder="e.g. Sector 5, Wave City" />
              </div>
              <div className="bk2-2col">
                <div>
                  <label className="bk2-label">Landmark <span style={{ textTransform: "none", fontWeight: 400, letterSpacing: 0, color: "rgba(0,0,0,0.3)" }}>(optional)</span></label>
                  <input type="text" className="bk2-input" value={landmark} onChange={e => setLandmark(e.target.value)} placeholder="Near Metro Station" />
                </div>
                <div>
                  <label className="bk2-label">City</label>
                  <input type="text" className="bk2-input" value={city} onChange={e => setCity(e.target.value)} />
                </div>
              </div>
              {fullAddress && (
                <div style={{ marginTop: 10, background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#6b4f10" }}>
                  <strong>Full address:</strong> {fullAddress}
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="bk2-field">
            <label className="bk2-label"><MessageCircle size={10} style={{ display: "inline", marginRight: 4 }} />Special Request <span style={{ textTransform: "none", letterSpacing: 0, fontWeight: 400, color: "rgba(0,0,0,0.25)" }}>(optional)</span></label>
            <textarea className="bk2-input" value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Any special request for our team? e.g. Female staff preferred, sensitive skin..."
              style={{ height: 80, resize: "none" }} />
          </div>

          {/* Honeypot */}
          <div style={{ position: "absolute", left: "-9999px", opacity: 0, pointerEvents: "none" }} aria-hidden="true">
            <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={e => setHoneypot(e.target.value)} />
          </div>

          {detailsError && (
            <div style={{ background: "rgba(245,101,101,0.08)", border: "1px solid rgba(245,101,101,0.25)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#e53e3e", marginBottom: 14 }}>
              ⚠ {detailsError}
            </div>
          )}

          <button className="bk2-next"
            onClick={() => {
              setDetailsError("");
              if (!fullName.trim()) { setDetailsError("Full name is required."); return; }
              const cl = phone.replace(/\D/g, "").replace(/^91/, "");
              if (!/^[6-9]\d{9}$/.test(cl)) { setDetailsError("Enter a valid 10-digit Indian mobile number."); return; }
              advance(8);
            }}>
            Review Booking <ChevronRight size={14} />
          </button>
        </StepCard>

        {/* ─ STEP 8: REVIEW & CONFIRM ─ */}
        <StepCard num={8} title="Review & Confirm">
          <div style={{ marginBottom: 20 }}>
            <div className="rv-row">
              <div className="rv-icon"><Store size={13} /></div>
              <div className="rv-key">Location</div>
              <div className="rv-val">{isHome ? "Home Service" : "At Salon — Wave City"}</div>
              <div className="rv-edit" onClick={() => editStep(1)}>Edit</div>
            </div>
            <div className="rv-row">
              <div className="rv-icon"><User size={13} /></div>
              <div className="rv-key">Gender</div>
              <div className="rv-val">{gender === "female" ? "Female" : "Male"}</div>
              <div className="rv-edit" onClick={() => editStep(2)}>Edit</div>
            </div>
            <div className="rv-row">
              <div className="rv-icon"><Sparkles size={13} /></div>
              <div className="rv-key">Category</div>
              <div className="rv-val">{selectedCat?.label}</div>
              <div className="rv-edit" onClick={() => editStep(3)}>Edit</div>
            </div>
            <div className="rv-row">
              <div className="rv-icon"><Star size={13} /></div>
              <div className="rv-key">Service</div>
              <div className="rv-val">{service.split(" — ")[0]}</div>
              <div className="rv-edit" onClick={() => editStep(4)}>Edit</div>
            </div>
            <div className="rv-row">
              <div className="rv-icon"><Calendar size={13} /></div>
              <div className="rv-key">Date</div>
              <div className="rv-val">{formatDate(bookingDate)}</div>
              <div className="rv-edit" onClick={() => editStep(5)}>Edit</div>
            </div>
            <div className="rv-row">
              <div className="rv-icon"><Clock size={13} /></div>
              <div className="rv-key">Time</div>
              <div className="rv-val">{TIME_SLOTS.find(s => s.value === bookingTime)?.label}</div>
              <div className="rv-edit" onClick={() => editStep(6)}>Edit</div>
            </div>
            <div className="rv-row">
              <div className="rv-icon"><User size={13} /></div>
              <div className="rv-key">Name</div>
              <div className="rv-val">{fullName}</div>
              <div className="rv-edit" onClick={() => editStep(7)}>Edit</div>
            </div>
            <div className="rv-row">
              <div className="rv-icon"><Phone size={13} /></div>
              <div className="rv-key">Phone</div>
              <div className="rv-val">{phone}</div>
            </div>
            {email && (
              <div className="rv-row">
                <div className="rv-icon"><Mail size={13} /></div>
                <div className="rv-key">Email</div>
                <div className="rv-val">{email}</div>
              </div>
            )}
            {isHome && fullAddress && (
              <div className="rv-row">
                <div className="rv-icon"><MapPin size={13} /></div>
                <div className="rv-key">Address</div>
                <div className="rv-val">{fullAddress}</div>
              </div>
            )}
            {notes && (
              <div className="rv-row">
                <div className="rv-icon"><MessageCircle size={13} /></div>
                <div className="rv-key">Notes</div>
                <div className="rv-val" style={{ fontSize: 12, color: "#666" }}>{notes}</div>
              </div>
            )}
          </div>

          {/* Price summary */}
          {servicePrice !== null && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(201,168,76,0.07)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 10, padding: "12px 16px", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(0,0,0,0.45)" }}>Total</span>
              <span style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Cormorant Garamond', serif", color: "#080808" }}>₹{servicePrice.toLocaleString()}</span>
            </div>
          )}

          {spamError && (
            <div style={{ background: "rgba(245,101,101,0.08)", border: "1px solid rgba(245,101,101,0.25)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#e53e3e", marginBottom: 12 }}>
              ⚠ {spamError}
            </div>
          )}

          <button className="bk2-submit" disabled={loading} onClick={handleSubmit}>
            {loading ? "Confirming..." : "✓  Confirm Booking"}
          </button>
          <p style={{ textAlign: "center", color: "rgba(0,0,0,0.25)", fontSize: 11, marginTop: 10, marginBottom: 0 }}>
            We confirm via WhatsApp within 30 minutes
          </p>
        </StepCard>

      </div>

      {/* ── Success Modal ── */}
      {booked && (
        <div className="bk2-overlay" onClick={() => setBooked(null)}>
          <div className="bk2-modal" onClick={e => e.stopPropagation()}>
            <div className="bk2-modal-top">
              <button onClick={() => setBooked(null)} style={{ position: "absolute", top: 12, right: 12, width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>
                <X size={14} />
              </button>
              <div className="bk2-modal-check"><Check size={28} /></div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 500, color: "#fff", marginBottom: 4 }}>Booking Confirmed!</div>
              {booked.id && (
                <div style={{ display: "inline-block", background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 20, padding: "3px 14px", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#E8C96D", fontFamily: "monospace" }}>
                  BG-{String(booked.id).padStart(5, "0")}
                </div>
              )}
              <div style={{ fontSize: 12, color: "rgba(201,168,76,0.55)", marginTop: 6 }}>We'll confirm via WhatsApp within 30 mins</div>
            </div>
            <div style={{ padding: "16px 24px" }}>
              {[
                { icon: <Sparkles size={12} />, key: "Service", val: booked.service.split(" — ")[0] },
                { icon: <Calendar size={12} />, key: "Date", val: formatDate(booked.bookingDate) },
                { icon: <Clock size={12} />, key: "Time", val: TIME_SLOTS.find(s => s.value === booked.bookingTime)?.label ?? booked.bookingTime },
                { icon: <MapPin size={12} />, key: "Type", val: booked.isHome ? "Home Service" : "At Salon — Wave City" },
              ].map((r, i) => (
                <div key={i} className="rv-row">
                  <div className="rv-icon">{r.icon}</div>
                  <div className="rv-key">{r.key}</div>
                  <div className="rv-val">{r.val}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, padding: "0 24px 24px" }}>
              <a className="bk2-submit" style={{ flex: 1, textDecoration: "none", textAlign: "center", background: "linear-gradient(135deg,#25d366,#128c7e)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                href={`https://wa.me/919625928495?text=Hi%20Bella%20%26%20Guy!%20I%20just%20booked%20${encodeURIComponent(booked.service)}%20for%20${encodeURIComponent(formatDate(booked.bookingDate))}.%20Please%20confirm.`}
                target="_blank" rel="noopener noreferrer">
                Chat on WhatsApp
              </a>
              <button style={{ padding: "13px 20px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.12)", background: "transparent", fontSize: 13, fontWeight: 600, color: "rgba(0,0,0,0.4)", cursor: "pointer", fontFamily: "Inter,sans-serif" }}
                onClick={() => { setBooked(null); window.location.href = "/"; }}>
                Home
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
