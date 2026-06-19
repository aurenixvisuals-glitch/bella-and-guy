"use client";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { allCategories } from "../lib/servicesData";

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
  const [success, setSuccess] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [preselected, setPreselected] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsLoggedIn(true);
        const meta = session.user.user_metadata;
        if (meta?.full_name) setFullName(meta.full_name);
        if (meta?.phone) setPhone(meta.phone);
      }
    });

    // Preselect from localStorage on mount (in case page was already loaded)
    const stored = localStorage.getItem("preselectService");
    if (stored) { setService(stored); setPreselected(true); localStorage.removeItem("preselectService"); }

    // Listen for live preselect events from Services component
    const handler = (e: Event) => {
      const value = (e as CustomEvent<string>).detail;
      if (value) { setService(value); setPreselected(true); }
    };
    window.addEventListener("preselect-service", handler);
    return () => window.removeEventListener("preselect-service", handler);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from("appointments").insert([{
        full_name: fullName, phone, email: email || null, service,
        booking_date: bookingDate, booking_time: bookingTime,
        is_home_service: isHome, address: isHome ? address : null,
      }]);
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
      setSuccess(true);
      setFullName(""); setPhone(""); setEmail(""); setService("");
      setBookingDate(""); setBookingTime("");
      setIsHome(false); setAddress(""); setPreselected(false);
      setTimeout(() => setSuccess(false), 6000);
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

        .success-banner {
          background: rgba(39,174,96,0.07); border: 1px solid rgba(39,174,96,0.2);
          border-radius: 3px; padding: 16px 20px; margin-bottom: 28px;
          display: flex; align-items: center; gap: 12px;
          color: #1a7a40; font-size: 14px; font-weight: 500;
        }

        @media (max-width: 600px) {
          .booking-card { padding: 28px 20px; }
        }
      `}</style>

      <section id="booking" className="booking-section">
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

          <div className="booking-card">
            <div style={{ display: "flex", gap: "12px", marginBottom: "32px" }}>
              {[false, true].map((val) => (
                <button key={String(val)} type="button" onClick={() => setIsHome(val)}
                  className={`booking-type-btn ${isHome === val ? "active" : ""}`}>
                  {val ? "🏠  Home Service" : "🏪  At Salon"}
                </button>
              ))}
            </div>

            {success && (
              <div className="success-banner">
                <span style={{ fontSize: "18px" }}>✓</span>
                Appointment booked! We'll confirm via WhatsApp shortly.
              </div>
            )}

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
    </>
  );
}
