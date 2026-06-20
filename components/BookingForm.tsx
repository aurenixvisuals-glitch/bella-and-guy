"use client";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { allCategories } from "../lib/servicesData";
import { Store, Home, X, Calendar, Clock, Phone, Mail, MapPin, User, Sparkles } from "lucide-react";

interface BookingDetails {
  id?: number;
  fullName: string; phone: string; email: string; service: string;
  bookingDate: string; bookingTime: string; isHome: boolean; address: string;
}

function formatDate(d: string) {
  if (!d) return "";
  return new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });
}
function formatTime(t: string) {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hr = parseInt(h);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
}
function playSuccessSound() {
  try {
    const ctx = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "sine"; osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.14;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.22, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.58);
      osc.start(t); osc.stop(t + 0.6);
    });
  } catch {}
}

const CONFETTI = [
  { color: "#C9A84C", tx:  0,   ty: -78, size: 10, delay: 0.64 },
  { color: "#E8C96D", tx:  55,  ty: -55, size: 7,  delay: 0.67 },
  { color: "#F5D98B", tx:  78,  ty:  0,  size: 9,  delay: 0.70 },
  { color: "#C9A84C", tx:  55,  ty:  55, size: 6,  delay: 0.72 },
  { color: "#9E7A2E", tx:  0,   ty:  78, size: 8,  delay: 0.74 },
  { color: "#E8C96D", tx: -55,  ty:  55, size: 7,  delay: 0.71 },
  { color: "#C9A84C", tx: -78,  ty:  0,  size: 9,  delay: 0.68 },
  { color: "#F5D98B", tx: -55,  ty: -55, size: 6,  delay: 0.65 },
  { color: "#E8C96D", tx:  38,  ty: -70, size: 5,  delay: 0.78 },
  { color: "#C9A84C", tx:  70,  ty: -38, size: 5,  delay: 0.66 },
  { color: "#9E7A2E", tx:  70,  ty:  38, size: 5,  delay: 0.76 },
  { color: "#F5D98B", tx: -38,  ty: -70, size: 5,  delay: 0.63 },
  { color: "#C9A84C", tx: -70,  ty:  38, size: 5,  delay: 0.79 },
  { color: "#E8C96D", tx: -70,  ty: -38, size: 5,  delay: 0.62 },
];

// Pre-compute per-particle keyframes (avoids CSS custom property type issues)
const CONFETTI_CSS = CONFETTI.map((c, i) =>
  `@keyframes bcFly${i}{from{transform:translate(0,0) scale(1.3);opacity:1}to{transform:translate(${c.tx}px,${c.ty}px) scale(0);opacity:0}}`
).join("");

export default function BookingForm() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [isHome, setIsHome] = useState(false);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [booked, setBooked] = useState<BookingDetails | null>(null);
  const [preselected, setPreselected] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const meta = session.user.user_metadata;
        if (meta?.full_name) setFullName(meta.full_name);
        if (meta?.phone) setPhone(meta.phone);
      }
    });

    // Auto-select Home Service if flag was set before form mounted
    const checkHomeFlag = () => {
      const t = sessionStorage.getItem("bookingType");
      if (t === "home") { setIsHome(true); sessionStorage.removeItem("bookingType"); }
    };
    checkHomeFlag();

    // Primary: hashchange fires AFTER browser navigates to #booking — most reliable
    const onHashChange = () => {
      if (window.location.hash === "#booking") checkHomeFlag();
    };
    window.addEventListener("hashchange", onHashChange);

    // Backup: custom event (for when hash is already #booking)
    const typeHandler = (e: Event) => {
      const val = (e as CustomEvent<string>).detail;
      if (val === "home") setIsHome(true);
    };
    window.addEventListener("select-booking-type", typeHandler);

    // Preselect from localStorage on mount (in case page was already loaded)
    const stored = localStorage.getItem("preselectService");
    if (stored) { setService(stored); setPreselected(true); localStorage.removeItem("preselectService"); }

    // Listen for live preselect events from Services component
    const handler = (e: Event) => {
      const value = (e as CustomEvent<string>).detail;
      if (value) { setService(value); setPreselected(true); }
    };
    window.addEventListener("preselect-service", handler);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("select-booking-type", typeHandler);
      window.removeEventListener("preselect-service", handler);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: inserted, error } = await supabase
        .from("appointments")
        .insert([{
          full_name: fullName, phone, email: email || null, service,
          booking_date: bookingDate, booking_time: bookingTime,
          is_home_service: isHome, address: isHome ? address : null,
        }])
        .select("id")
        .single();
      if (error) throw error;
      // Send email notifications (silently fails if not configured)
      try {
        await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "created",
            booking: { full_name: fullName, email, phone, service, booking_date: bookingDate, booking_time: bookingTime, address: isHome ? address : null },
          }),
        });
      } catch {}
      setBooked({ id: inserted?.id, fullName, phone, email, service, bookingDate, bookingTime, isHome, address });
      setShowModal(true);
      playSuccessSound();
      setFullName(""); setPhone(""); setEmail(""); setService("");
      setBookingDate(""); setBookingTime("");
      setIsHome(false); setAddress(""); setPreselected(false);
    } catch (err: unknown) {
      alert("Error: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .booking-section { background: #FAF7F0; padding: 120px 32px; position: relative; }

        .booking-card {
          background: #FFFFFF; border-radius: 4px; padding: 56px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.07); border: 1px solid rgba(0,0,0,0.06);
          max-width: 720px; margin: 0 auto;
        }

        .booking-type-btn {
          flex: 1; padding: 14px 16px; border-radius: 3px;
          font-size: 12px; font-weight: 600; letter-spacing: 0.08em;
          text-transform: uppercase; cursor: pointer; font-family: 'Inter', sans-serif;
          transition: all 0.3s ease;
        }
        .booking-type-btn.active { border: 1px solid #C9A84C; background: rgba(201,168,76,0.08); color: #C9A84C; }
        .booking-type-btn:not(.active) { border: 1px solid rgba(0,0,0,0.1); background: transparent; color: rgba(0,0,0,0.35); }
        .booking-type-btn:not(.active):hover { border-color: rgba(0,0,0,0.2); color: rgba(0,0,0,0.6); }

        .field-label { display: block; font-size: 10px; font-weight: 700; color: rgba(0,0,0,0.35); text-transform: uppercase; letter-spacing: 0.14em; margin-bottom: 8px; }

        .field-input {
          width: 100%; border: 1px solid rgba(0,0,0,0.1); padding: 13px 16px;
          border-radius: 3px; font-size: 14.5px; color: #080808;
          background: #FAFAF8; outline: none; transition: all 0.25s ease;
          font-family: 'Inter', sans-serif;
        }
        .field-input:focus { border-color: #C9A84C; background: rgba(201,168,76,0.03); box-shadow: 0 0 0 3px rgba(201,168,76,0.08); }
        .field-input::placeholder { color: rgba(0,0,0,0.2); }

        /* Preselected highlight on the service select */
        .field-input.preselected {
          border-color: #C9A84C;
          background: rgba(201,168,76,0.04);
          color: #8a6a1a; font-weight: 500;
        }

        .preselect-hint {
          display: flex; align-items: center; gap: 7px; margin-top: 7px;
          font-size: 11.5px; color: #8a6a1a; font-weight: 500;
        }
        .preselect-hint-dot { width: 7px; height: 7px; border-radius: 50%; background: #C9A84C; }

        .booking-submit-btn {
          width: 100%; padding: 16px;
          background: linear-gradient(135deg, #E8C96D, #C9A84C);
          color: #080808; border: none; border-radius: 3px;
          font-size: 12px; font-weight: 700; letter-spacing: 0.14em;
          text-transform: uppercase; cursor: pointer; font-family: 'Inter', sans-serif;
          transition: all 0.35s ease; position: relative; overflow: hidden; margin-top: 8px;
        }
        .booking-submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(201,168,76,0.35); }
        .booking-submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        @media (max-width: 600px) {
          .booking-card { padding: 28px 20px; }
        }

        /* ── Booking Confirmation Modal ── */
        @keyframes bcOverlayIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes bcCardIn {
          from { opacity: 0; transform: translateY(40px) scale(0.94); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes bcCircleDraw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes bcCheckDraw {
          to { stroke-dashoffset: 0; }
        }
        ${CONFETTI_CSS}
        @keyframes bcPulse {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(2.8); opacity: 0; }
        }
        @keyframes bcGlow {
          0%,100% { box-shadow: 0 0 0 0 rgba(201,168,76,0); }
          50%      { box-shadow: 0 0 32px 8px rgba(201,168,76,0.18); }
        }

        .bc-overlay {
          position: fixed; inset: 0; z-index: 10001;
          background: rgba(4,4,8,0.78);
          backdrop-filter: blur(14px) saturate(160%);
          -webkit-backdrop-filter: blur(14px) saturate(160%);
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
          animation: bcOverlayIn 0.3s ease forwards;
        }
        .bc-card {
          position: relative;
          background: #FFFDF8;
          border-radius: 24px;
          border: 1px solid rgba(201,168,76,0.22);
          box-shadow: 0 40px 100px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06) inset;
          width: 100%; max-width: 460px;
          overflow: hidden;
          animation: bcCardIn 0.45s cubic-bezier(0.22,1,0.36,1) 0.1s both;
        }

        /* Gold top band */
        .bc-top-band {
          background: linear-gradient(135deg, #1a1200 0%, #2e1f00 50%, #1a1200 100%);
          padding: 44px 32px 36px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .bc-top-band::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 80% 60% at 50% 120%, rgba(201,168,76,0.18), transparent);
        }

        /* Confetti container */
        .bc-confetti-wrap {
          position: absolute; inset: 0; pointer-events: none; overflow: hidden;
        }
        .bc-confetti {
          position: absolute;
          left: 50%; top: 45%;
          border-radius: 50%;
          animation-duration: 0.75s;
          animation-timing-function: cubic-bezier(0.22,0.61,0.36,1);
          animation-fill-mode: both;
          will-change: transform, opacity;
        }

        /* SVG checkmark */
        .bc-check-wrap {
          position: relative; display: inline-flex; align-items: center; justify-content: center;
          width: 80px; height: 80px; margin: 0 auto 4px;
        }
        .bc-pulse-ring {
          position: absolute; inset: -8px; border-radius: 50%;
          border: 2px solid rgba(201,168,76,0.5);
          animation: bcPulse 1.6s ease-out 0.9s infinite;
        }
        .bc-check-svg { width: 80px; height: 80px; }
        .bc-check-circle {
          fill: none; stroke: #C9A84C; stroke-width: 2;
          stroke-dasharray: 167; stroke-dashoffset: 167;
          animation: bcCircleDraw 0.65s cubic-bezier(0.65,0,0.45,1) 0.35s forwards;
          transform-origin: center; transform: rotate(-90deg);
        }
        .bc-check-path {
          fill: none; stroke: #E8C96D; stroke-width: 3.5;
          stroke-linecap: round; stroke-linejoin: round;
          stroke-dasharray: 50; stroke-dashoffset: 50;
          animation: bcCheckDraw 0.4s cubic-bezier(0.65,0,0.45,1) 0.9s forwards;
        }

        .bc-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px; font-weight: 500;
          color: #FFFFFF; letter-spacing: 0.02em;
          margin-bottom: 6px; position: relative;
        }
        .bc-subtitle {
          font-size: 12.5px; color: rgba(201,168,76,0.7);
          letter-spacing: 0.04em; position: relative;
        }

        /* Details section */
        .bc-body { padding: 24px 28px 28px; }
        .bc-row {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .bc-row:last-child { border-bottom: none; }
        .bc-row-icon {
          width: 28px; height: 28px; border-radius: 8px;
          background: rgba(201,168,76,0.1);
          display: flex; align-items: center; justify-content: center;
          color: #C9A84C; flex-shrink: 0; margin-top: 1px;
        }
        .bc-row-label {
          font-size: 10px; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; color: rgba(0,0,0,0.3);
          width: 60px; flex-shrink: 0; padding-top: 6px;
        }
        .bc-row-val {
          font-size: 13.5px; color: #1a1000; font-weight: 500;
          flex: 1; padding-top: 5px; line-height: 1.4;
        }
        .bc-tag {
          display: inline-block;
          background: rgba(201,168,76,0.1);
          color: #8a6a1a; border-radius: 20px;
          padding: 2px 12px; font-size: 12px;
        }

        /* Buttons */
        .bc-actions { display: flex; gap: 10px; padding: 0 28px 24px; }
        .bc-wa-btn {
          flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          background: linear-gradient(135deg, #25d366, #128c7e);
          color: #fff; border: none; border-radius: 10px;
          padding: 13px 20px; font-size: 13px; font-weight: 600;
          letter-spacing: 0.03em; text-decoration: none; cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .bc-wa-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(37,211,102,0.3); }
        .bc-close-btn {
          padding: 13px 22px; border-radius: 10px;
          border: 1px solid rgba(0,0,0,0.12); background: transparent;
          font-size: 13px; font-weight: 600; color: rgba(0,0,0,0.4);
          cursor: pointer; font-family: 'Inter', sans-serif;
          transition: all 0.2s ease;
        }
        .bc-close-btn:hover { border-color: rgba(0,0,0,0.25); color: rgba(0,0,0,0.7); }
        .bc-x {
          position: absolute; top: 14px; right: 14px;
          width: 32px; height: 32px; border-radius: 50%;
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.5); cursor: pointer;
          transition: background 0.2s, color 0.2s; z-index: 2;
        }
        .bc-x:hover { background: rgba(255,255,255,0.15); color: #fff; }

        @media (max-width: 500px) {
          .bc-card { border-radius: 20px; }
          .bc-top-band { padding: 36px 24px 28px; }
          .bc-body { padding: 20px 20px 20px; }
          .bc-actions { padding: 0 20px 20px; flex-direction: column; }
        }
      `}</style>

      <section className="booking-section">
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>

          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "10px", fontWeight: "600", letterSpacing: "0.22em", textTransform: "uppercase", color: "#C9A84C", marginBottom: "16px" }}>
              <span style={{ width: "20px", height: "1px", background: "#C9A84C", display: "inline-block" }} />
              Reserve Your Spot
            </span>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(36px, 5vw, 52px)", fontWeight: "400", color: "#080808", marginBottom: "12px" }}>
              Book an Appointment
            </h2>
            <div style={{ width: "40px", height: "1px", background: "linear-gradient(90deg, transparent, #C9A84C, transparent)", margin: "0 auto 20px" }} />
            <p style={{ color: "#6B6B6B", fontSize: "15px" }}>At-salon or home service — we'll confirm within 30 minutes.</p>
          </div>

          {/* Scroll anchor placed here so #booking lands at the card, not section top */}
          <div id="booking" style={{ position: "relative", top: "-8px" }} />
          <div className="booking-card">
            <div style={{ display: "flex", gap: "12px", marginBottom: "32px" }}>
              {[false, true].map((val) => (
                <button key={String(val)} type="button" onClick={() => setIsHome(val)}
                  className={`booking-type-btn ${isHome === val ? "active" : ""}`}>
                  {val ? <><Home size={14} style={{marginRight:7}}/>Home Service</> : <><Store size={14} style={{marginRight:7}}/>At Salon</>}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label className="field-label">Full Name *</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                    placeholder="Your name" className="field-input" required />
                </div>
                <div>
                  <label className="field-label">Phone Number *</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="+91 XXXXXXXXXX" className="field-input" required />
                </div>
              </div>

              <div>
                <label className="field-label">Email Address <span style={{ color:"rgba(0,0,0,0.25)",fontWeight:400,textTransform:"none",letterSpacing:0 }}>(optional — for confirmation email)</span></label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com" className="field-input" />
              </div>

              <div>
                <label className="field-label">Select Service *</label>
                <select
                  value={service}
                  onChange={e => { setService(e.target.value); setPreselected(false); }}
                  className={`field-input ${preselected ? "preselected" : ""}`}
                  required
                >
                  <option value="">Choose a service...</option>
                  {allCategories.map(cat => (
                    <optgroup key={cat.id} label={`── ${cat.label} ──`}>
                      {cat.services.map(s => {
                        const val = `${s.name} — ${cat.label}`;
                        return <option key={val} value={val}>{s.name} — ₹{s.price.toLocaleString()}</option>;
                      })}
                    </optgroup>
                  ))}
                </select>
                {preselected && service && (
                  <div className="preselect-hint">
                    <span className="preselect-hint-dot" />
                    Selected from services menu — change anytime
                  </div>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label className="field-label">Preferred Date *</label>
                  <input type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)}
                    className="field-input" required />
                </div>
                <div>
                  <label className="field-label">Preferred Time *</label>
                  <input type="time" value={bookingTime} onChange={e => setBookingTime(e.target.value)}
                    className="field-input" required />
                </div>
              </div>

              {isHome && (
                <div>
                  <label className="field-label">Home Address *</label>
                  <textarea value={address} onChange={e => setAddress(e.target.value)}
                    placeholder="Full address for home service..."
                    className="field-input" required={isHome}
                    style={{ height: "90px", resize: "none" }} />
                </div>
              )}

              <button type="submit" className="booking-submit-btn" disabled={loading}>
                {loading ? "Booking..." : "Confirm Appointment →"}
              </button>

              <p style={{ textAlign: "center", color: "rgba(0,0,0,0.3)", fontSize: "12.5px" }}>
                We confirm bookings via WhatsApp call within 30 minutes
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* ── Booking Confirmation Modal ── */}
      {showModal && booked && (
        <div className="bc-overlay" onClick={() => setShowModal(false)}>
          <div className="bc-card" onClick={e => e.stopPropagation()}>

            {/* Top dark band with animation */}
            <div className="bc-top-band">
              {/* Close X */}
              <button className="bc-x" onClick={() => setShowModal(false)}>
                <X size={14} />
              </button>

              {/* Confetti particles */}
              <div className="bc-confetti-wrap">
                {CONFETTI.map((c, i) => (
                  <div key={i} className="bc-confetti" style={{
                    width: c.size, height: c.size,
                    background: c.color,
                    animationName: `bcFly${i}`,
                    animationDelay: `${c.delay}s`,
                  }} />
                ))}
              </div>

              {/* Animated checkmark */}
              <div className="bc-check-wrap">
                <div className="bc-pulse-ring" />
                <svg className="bc-check-svg" viewBox="0 0 52 52">
                  <circle className="bc-check-circle" cx="26" cy="26" r="25" />
                  <path className="bc-check-path" d="M14.5 26.5 L22 34 L37.5 18" />
                </svg>
              </div>

              <h2 className="bc-title">Booking Confirmed!</h2>
              {booked.id && (
                <div style={{ display:"inline-block", background:"rgba(201,168,76,0.15)", border:"1px solid rgba(201,168,76,0.3)", borderRadius:20, padding:"3px 14px", fontSize:11, fontWeight:700, letterSpacing:"0.12em", color:"#E8C96D", marginBottom:6, fontFamily:"monospace" }}>
                  BG-{String(booked.id).padStart(5,"0")}
                </div>
              )}
              <p className="bc-subtitle">We&apos;ll confirm via WhatsApp within 30 mins</p>
            </div>

            {/* Details */}
            <div className="bc-body">
              {booked.id && (
                <div className="bc-row">
                  <span className="bc-row-icon" style={{ background:"rgba(201,168,76,0.15)" }}>
                    <span style={{ fontSize:10, fontWeight:800, color:"#C9A84C", fontFamily:"monospace" }}>#</span>
                  </span>
                  <span className="bc-row-label">Booking</span>
                  <span className="bc-row-val" style={{ fontFamily:"monospace", fontWeight:700, color:"#C9A84C", letterSpacing:"0.06em" }}>
                    BG-{String(booked.id).padStart(5,"0")}
                  </span>
                </div>
              )}
              <div className="bc-row">
                <span className="bc-row-icon"><User size={13}/></span>
                <span className="bc-row-label">Name</span>
                <span className="bc-row-val">{booked.fullName}</span>
              </div>
              <div className="bc-row">
                <span className="bc-row-icon"><Phone size={13}/></span>
                <span className="bc-row-label">Phone</span>
                <span className="bc-row-val">{booked.phone}</span>
              </div>
              {booked.email && (
                <div className="bc-row">
                  <span className="bc-row-icon"><Mail size={13}/></span>
                  <span className="bc-row-label">Email</span>
                  <span className="bc-row-val">{booked.email}</span>
                </div>
              )}
              <div className="bc-row">
                <span className="bc-row-icon"><Sparkles size={13}/></span>
                <span className="bc-row-label">Service</span>
                <span className="bc-row-val">{booked.service}</span>
              </div>
              <div className="bc-row">
                <span className="bc-row-icon"><Calendar size={13}/></span>
                <span className="bc-row-label">Date</span>
                <span className="bc-row-val">{formatDate(booked.bookingDate)}</span>
              </div>
              <div className="bc-row">
                <span className="bc-row-icon"><Clock size={13}/></span>
                <span className="bc-row-label">Time</span>
                <span className="bc-row-val">{formatTime(booked.bookingTime)}</span>
              </div>
              <div className="bc-row">
                <span className="bc-row-icon"><MapPin size={13}/></span>
                <span className="bc-row-label">Type</span>
                <span className="bc-row-val">
                  <span className="bc-tag">{booked.isHome ? "Home Service" : "At Salon — Wave City"}</span>
                </span>
              </div>
              {booked.isHome && booked.address && (
                <div className="bc-row">
                  <span className="bc-row-icon"><Home size={13}/></span>
                  <span className="bc-row-label">Address</span>
                  <span className="bc-row-val">{booked.address}</span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="bc-actions">
              <a
                className="bc-wa-btn"
                href={`https://wa.me/919876543210?text=Hi%20Bella%20%26%20Guy!%20I%20just%20booked%20${encodeURIComponent(booked.service)}%20for%20${encodeURIComponent(formatDate(booked.bookingDate))}%20at%20${encodeURIComponent(formatTime(booked.bookingTime))}.%20Please%20confirm.`}
                target="_blank" rel="noopener noreferrer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Chat on WhatsApp
              </a>
              <button className="bc-close-btn" onClick={() => setShowModal(false)}>
                Done
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
