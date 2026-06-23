"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { allCategories } from "../../lib/servicesData";
import Navbar from "../../components/Navbar";
import {
  Store, Home, Phone, MapPin, Clock, Star, Shield, Check,
  User, Mail, Sparkles, Calendar, MessageCircle, ChevronRight, X
} from "lucide-react";

// 9:00 AM → 8:00 PM in 30-min slots
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

const STAFF_OPTIONS = [
  { name: "Any Available", role: "We'll assign the best match" },
  { name: "Sana Sheikh",   role: "Bridal Makeup & Hair Color" },
  { name: "Pooja Sharma",  role: "Facials & Cleanup" },
  { name: "Riya Verma",    role: "Manicure & Pedicure" },
  { name: "Kavya Gupta",   role: "Waxing & Threading" },
  { name: "Arjun Singh",   role: "Haircut & Beard" },
  { name: "Rahul Khanna",  role: "Hair Color & Styling" },
  { name: "Priya Jain",    role: "Haircut & Hair Spa" },
  { name: "Neha Agarwal",  role: "Home Service Specialist" },
];

function formatDate(d: string) {
  if (!d) return "";
  return new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

export default function BookPage() {
  const [isHome, setIsHome]           = useState(false);
  const [selCat, setSelCat]           = useState("");
  const [service, setService]         = useState("");
  const [selStaff, setSelStaff]       = useState("Any Available");
  const [fullName, setFullName]       = useState("");
  const [phone, setPhone]             = useState("");
  const [email, setEmail]             = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [notes, setNotes]             = useState("");
  const [address, setAddress]         = useState("");
  const [loading, setLoading]         = useState(false);
  const [spamError, setSpamError]     = useState("");
  const [honeypot, setHoneypot]       = useState("");
  const [booked, setBooked]           = useState<any>(null);

  // Get today's date as minimum
  const todayStr = new Date().toISOString().split("T")[0];

  // Pre-fill from session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const meta = session.user.user_metadata;
        if (meta?.full_name) setFullName(meta.full_name);
        if (meta?.phone)     setPhone(meta.phone);
        if (meta?.email)     setEmail(session.user.email || "");
      }
    });
  }, []);

  // Pre-fill service/staff from Services or Team page
  useEffect(() => {
    const preService = localStorage.getItem("preselectService");
    if (preService) {
      setService(preService);
      const catId = allCategories.find(c =>
        c.services.some(s => `${s.name} — ${c.label}` === preService)
      )?.id ?? allCategories.find(c => c.label === preService)?.id;
      if (catId) setSelCat(catId);
      localStorage.removeItem("preselectService");
    }
    const preStaff = localStorage.getItem("preselectStaff");
    if (preStaff) {
      setSelStaff(preStaff);
      localStorage.removeItem("preselectStaff");
    }
  }, []);

  const selectedCatData = allCategories.find(c => c.id === selCat);
  const selectedServicePrice = (() => {
    if (!service) return null;
    const [sName] = service.split(" — ");
    const cat = allCategories.find(c => c.services.some(s => s.name === sName));
    return cat?.services.find(s => s.name === sName)?.price ?? null;
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSpamError("");
    if (honeypot) return;

    const cleaned = phone.replace(/\D/g, "").replace(/^91/, "");
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      setSpamError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    const twoHrsAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("phone", cleaned)
      .gte("created_at", twoHrsAgo);
    if ((count ?? 0) >= 3) {
      setSpamError("Maximum 3 bookings allowed per 2 hours from the same number.");
      return;
    }

    setLoading(true);
    try {
      const staffVal = selStaff === "Any Available" ? "" : selStaff;
      const { data: inserted, error } = await supabase
        .from("appointments")
        .insert([{
          full_name: fullName,
          phone: cleaned,
          email: email || null,
          service,
          booking_date: bookingDate,
          booking_time: bookingTime,
          is_home_service: isHome,
          address: isHome ? address : null,
          staff: staffVal || null,
        }])
        .select("id")
        .single();
      if (error) throw error;

      try {
        await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "created",
            booking: { full_name: fullName, email, phone: cleaned, service, booking_date: bookingDate, booking_time: bookingTime, address: isHome ? address : null },
          }),
        });
      } catch {}

      setBooked({ id: inserted?.id, fullName, phone: cleaned, email, service, bookingDate, bookingTime, isHome, address, staff: staffVal, notes });
      setFullName(""); setPhone(""); setEmail(""); setService(""); setSelCat("");
      setBookingDate(""); setBookingTime(""); setAddress(""); setNotes("");
      setSelStaff("Any Available"); setIsHome(false);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        .bk-page { min-height: 100vh; background: #FAF7F0; font-family: 'Inter', sans-serif; }

        /* ── HERO STRIP ── */
        .bk-hero {
          background: linear-gradient(135deg, #080808 0%, #1a1200 50%, #080808 100%);
          padding: 128px 32px 52px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .bk-hero::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 70% 80% at 50% 110%, rgba(201,168,76,0.18), transparent);
          pointer-events: none;
        }
        .bk-hero-label {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 10px; font-weight: 700; letter-spacing: 0.24em;
          text-transform: uppercase; color: #C9A84C; margin-bottom: 14px;
        }
        .bk-hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(34px, 5vw, 54px); font-weight: 400;
          color: #fff; line-height: 1.1; margin-bottom: 12px;
        }
        .bk-hero-sub { font-size: 14px; color: rgba(255,255,255,0.4); max-width: 420px; margin: 0 auto; }

        /* ── MAIN GRID ── */
        .bk-main {
          max-width: 1200px; margin: 0 auto;
          display: grid; grid-template-columns: 300px 1fr;
          gap: 32px; padding: 40px 24px 80px;
        }

        /* ── LEFT SIDEBAR ── */
        .bk-sidebar { display: flex; flex-direction: column; gap: 16px; }

        .bk-info-card {
          background: #fff;
          border: 1px solid rgba(0,0,0,0.07);
          border-radius: 16px; padding: 22px 20px;
        }
        .bk-info-title {
          font-size: 11px; font-weight: 700; letter-spacing: 0.14em;
          text-transform: uppercase; color: rgba(0,0,0,0.35); margin-bottom: 16px;
        }
        .bk-info-row {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 9px 0; border-bottom: 1px solid rgba(0,0,0,0.05); font-size: 13px;
        }
        .bk-info-row:last-child { border-bottom: none; }
        .bk-info-icon {
          width: 30px; height: 30px; border-radius: 8px;
          background: rgba(201,168,76,0.09); color: #C9A84C;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .bk-info-text { color: #444; line-height: 1.5; }
        .bk-info-text strong { color: #080808; display: block; font-size: 12px; }

        .bk-trust-row {
          display: flex; align-items: center; gap: 9px;
          padding: 8px 0; font-size: 13px; color: #555;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .bk-trust-row:last-child { border-bottom: none; }
        .bk-trust-icon { color: #C9A84C; flex-shrink: 0; }

        .bk-rating {
          display: flex; align-items: center; gap: 8px;
          background: rgba(201,168,76,0.07); border: 1px solid rgba(201,168,76,0.18);
          border-radius: 10px; padding: 12px 14px;
        }
        .bk-rating-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px; font-weight: 500; color: #C9A84C; line-height: 1;
        }
        .bk-wa-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          background: linear-gradient(135deg, #25d366, #128c7e);
          color: #fff; border-radius: 10px; padding: 12px;
          font-size: 13px; font-weight: 600; text-decoration: none;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .bk-wa-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(37,211,102,0.3); }

        /* ── FORM AREA ── */
        .bk-form-wrap {
          background: #fff; border: 1px solid rgba(0,0,0,0.07);
          border-radius: 20px; padding: 36px 32px;
        }

        /* Type toggle */
        .bk-type-row { display: flex; gap: 10px; margin-bottom: 28px; }
        .bk-type-btn {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 14px; border-radius: 10px; font-size: 13px; font-weight: 600;
          cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.25s;
          border: 1.5px solid;
        }
        .bk-type-btn.active { border-color: #C9A84C; background: rgba(201,168,76,0.07); color: #8a6a1a; }
        .bk-type-btn:not(.active) { border-color: rgba(0,0,0,0.1); background: transparent; color: rgba(0,0,0,0.35); }
        .bk-type-btn:not(.active):hover { border-color: rgba(0,0,0,0.2); color: rgba(0,0,0,0.6); }

        /* Section heading */
        .bk-section-title {
          font-size: 11px; font-weight: 700; letter-spacing: 0.14em;
          text-transform: uppercase; color: rgba(0,0,0,0.35);
          margin-bottom: 12px; margin-top: 4px;
        }

        /* Category grid */
        .bk-cat-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 8px; margin-bottom: 20px;
        }
        .bk-cat-btn {
          padding: 10px 8px; border-radius: 10px; border: 1.5px solid;
          text-align: center; cursor: pointer; font-family: 'Inter', sans-serif;
          transition: all 0.2s; font-size: 11px; font-weight: 600;
        }
        .bk-cat-btn.active { border-color: #C9A84C; background: rgba(201,168,76,0.08); color: #8a6a1a; }
        .bk-cat-btn:not(.active) { border-color: rgba(0,0,0,0.08); background: rgba(0,0,0,0.02); color: rgba(0,0,0,0.45); }
        .bk-cat-btn:not(.active):hover { border-color: rgba(0,0,0,0.18); color: rgba(0,0,0,0.7); }
        .bk-cat-icon { font-size: 18px; margin-bottom: 4px; display: block; }

        /* Field */
        .bk-field { margin-bottom: 18px; }
        .bk-label {
          display: block; font-size: 10px; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: rgba(0,0,0,0.35); margin-bottom: 8px;
        }
        .bk-input {
          width: 100%; border: 1.5px solid rgba(0,0,0,0.1); padding: 13px 16px;
          border-radius: 10px; font-size: 14px; color: #080808;
          background: #FAFAF8; outline: none; transition: all 0.22s;
          font-family: 'Inter', sans-serif;
        }
        .bk-input:focus { border-color: #C9A84C; background: rgba(201,168,76,0.03); box-shadow: 0 0 0 3px rgba(201,168,76,0.08); }
        .bk-input::placeholder { color: rgba(0,0,0,0.22); }

        .bk-price-tag {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(79,208,128,0.1); border: 1px solid rgba(79,208,128,0.25);
          border-radius: 20px; padding: 3px 12px; font-size: 12px;
          font-weight: 700; color: #2d8f5e; margin-top: 8px;
        }

        /* Staff grid */
        .bk-staff-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(130px,1fr));
          gap: 8px; margin-bottom: 20px;
        }
        .bk-staff-btn {
          padding: 10px 10px; border-radius: 10px; border: 1.5px solid;
          text-align: left; cursor: pointer; font-family: 'Inter', sans-serif;
          transition: all 0.2s; font-size: 11.5px;
        }
        .bk-staff-btn.active { border-color: #C9A84C; background: rgba(201,168,76,0.07); }
        .bk-staff-btn:not(.active) { border-color: rgba(0,0,0,0.08); background: rgba(0,0,0,0.02); }
        .bk-staff-btn:not(.active):hover { border-color: rgba(0,0,0,0.18); }
        .bk-staff-name { font-weight: 600; color: #080808; margin-bottom: 2px; }
        .bk-staff-name.active { color: #8a6a1a; }
        .bk-staff-role { font-size: 10px; color: rgba(0,0,0,0.38); line-height: 1.3; }

        /* Time slots */
        .bk-time-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(82px,1fr));
          gap: 7px; margin-bottom: 20px;
        }
        .bk-slot {
          padding: 9px 6px; border-radius: 8px; border: 1.5px solid;
          text-align: center; cursor: pointer; font-family: 'Inter', sans-serif;
          font-size: 12px; font-weight: 600; transition: all 0.18s;
        }
        .bk-slot.active { border-color: #C9A84C; background: #C9A84C; color: #080808; }
        .bk-slot:not(.active) { border-color: rgba(0,0,0,0.08); background: rgba(0,0,0,0.02); color: rgba(0,0,0,0.5); }
        .bk-slot:not(.active):hover { border-color: rgba(201,168,76,0.5); color: #8a6a1a; background: rgba(201,168,76,0.06); }

        /* 2-col grid */
        .bk-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

        /* Divider */
        .bk-divider { border: none; border-top: 1px solid rgba(0,0,0,0.06); margin: 24px 0; }

        /* Submit */
        .bk-submit {
          width: 100%; padding: 16px;
          background: linear-gradient(135deg, #E8C96D, #C9A84C);
          color: #080808; border: none; border-radius: 10px;
          font-size: 13px; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; cursor: pointer; font-family: 'Inter', sans-serif;
          transition: all 0.3s ease; margin-top: 8px;
        }
        .bk-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(201,168,76,0.35); }
        .bk-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .bk-error {
          background: rgba(245,101,101,0.08); border: 1px solid rgba(245,101,101,0.25);
          border-radius: 10px; padding: 12px 16px; font-size: 13px;
          color: #e53e3e; display: flex; align-items: center; gap: 8px; margin-top: 12px;
        }

        /* ── SUCCESS MODAL ── */
        .bk-modal-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(4,4,8,0.78); backdrop-filter: blur(12px);
          display: flex; align-items: center; justify-content: center; padding: 20px;
          animation: bkFadeIn 0.25s ease;
        }
        @keyframes bkFadeIn { from{opacity:0} to{opacity:1} }
        .bk-modal-card {
          background: #FFFDF8; border-radius: 20px;
          border: 1px solid rgba(201,168,76,0.2);
          box-shadow: 0 40px 100px rgba(0,0,0,0.4);
          width: 100%; max-width: 480px;
          animation: bkSlideUp 0.35s cubic-bezier(0.22,1,0.36,1);
          overflow: hidden;
        }
        @keyframes bkSlideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        .bk-modal-top {
          background: linear-gradient(135deg, #1a1200, #2e1f00);
          padding: 36px 28px 28px; text-align: center; position: relative;
        }
        .bk-modal-check {
          width: 64px; height: 64px; border-radius: 50%;
          background: rgba(201,168,76,0.15); border: 2px solid rgba(201,168,76,0.4);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 14px; color: #C9A84C;
        }
        .bk-modal-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 26px; font-weight: 500; color: #fff; margin-bottom: 4px;
        }
        .bk-modal-id {
          display: inline-block; background: rgba(201,168,76,0.15);
          border: 1px solid rgba(201,168,76,0.3); border-radius: 20px;
          padding: 3px 14px; font-size: 11px; font-weight: 700;
          letter-spacing: 0.1em; color: #E8C96D; font-family: monospace; margin-top: 8px;
        }
        .bk-modal-sub { font-size: 12px; color: rgba(201,168,76,0.6); margin-top: 6px; }
        .bk-modal-body { padding: 20px 24px; }
        .bk-modal-row {
          display: flex; gap: 10px; padding: 9px 0;
          border-bottom: 1px solid rgba(0,0,0,0.05); font-size: 13px;
        }
        .bk-modal-row:last-child { border-bottom: none; }
        .bk-modal-icon {
          width: 26px; height: 26px; border-radius: 7px;
          background: rgba(201,168,76,0.1); color: #C9A84C;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .bk-modal-key { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(0,0,0,0.3); width: 60px; flex-shrink: 0; padding-top: 5px; }
        .bk-modal-val { color: #1a1000; font-weight: 500; padding-top: 4px; flex: 1; }
        .bk-modal-actions { display: flex; gap: 10px; padding: 0 24px 24px; }
        .bk-modal-wa {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
          background: linear-gradient(135deg, #25d366, #128c7e);
          color: #fff; border: none; border-radius: 10px;
          padding: 13px; font-size: 13px; font-weight: 600;
          text-decoration: none; cursor: pointer; transition: transform 0.2s;
        }
        .bk-modal-wa:hover { transform: translateY(-2px); }
        .bk-modal-close {
          padding: 13px 20px; border-radius: 10px;
          border: 1px solid rgba(0,0,0,0.12); background: transparent;
          font-size: 13px; font-weight: 600; color: rgba(0,0,0,0.4);
          cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s;
        }
        .bk-modal-close:hover { border-color: rgba(0,0,0,0.25); color: rgba(0,0,0,0.7); }
        .bk-modal-x {
          position: absolute; top: 12px; right: 12px;
          width: 30px; height: 30px; border-radius: 50%;
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.5); cursor: pointer; transition: all 0.2s;
        }
        .bk-modal-x:hover { background: rgba(255,255,255,0.18); color: #fff; }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .bk-main { grid-template-columns: 1fr; padding: 24px 16px 60px; gap: 20px; }
          .bk-sidebar { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        }
        @media (max-width: 600px) {
          .bk-sidebar { grid-template-columns: 1fr; }
          .bk-form-wrap { padding: 24px 16px; }
          .bk-2col { grid-template-columns: 1fr; }
          .bk-cat-grid { grid-template-columns: repeat(3, 1fr); }
          .bk-staff-grid { grid-template-columns: repeat(2, 1fr); }
          .bk-time-grid { grid-template-columns: repeat(4, 1fr); }
          .bk-hero { padding: 32px 16px 36px; }
          .bk-modal-actions { flex-direction: column; }
        }
      `}</style>

      <Navbar />
      {/* Hero strip */}
      <div className="bk-page">
        <div className="bk-hero">
          <div className="bk-hero-label">
            <span style={{ width: 20, height: 1, background: "#C9A84C", display: "inline-block" }} />
            Bella & Guy Salon
          </div>
          <h1 className="bk-hero-title">
            Book an Appointment
          </h1>
          <p className="bk-hero-sub">
            At our salon in Wave City or at your doorstep — we confirm within 30 minutes.
          </p>
        </div>

        <div className="bk-main">

          {/* ── LEFT SIDEBAR ── */}
          <aside className="bk-sidebar">

            {/* Salon info */}
            <div className="bk-info-card">
              <div className="bk-info-title">Salon Info</div>
              <div className="bk-info-row">
                <div className="bk-info-icon"><MapPin size={14}/></div>
                <div className="bk-info-text">
                  <strong>Location</strong>
                  Wave City, Ghaziabad, UP 201003
                </div>
              </div>
              <div className="bk-info-row">
                <div className="bk-info-icon"><Clock size={14}/></div>
                <div className="bk-info-text">
                  <strong>Working Hours</strong>
                  Mon – Sun, 9:00 AM – 8:00 PM
                </div>
              </div>
              <div className="bk-info-row">
                <div className="bk-info-icon"><Phone size={14}/></div>
                <div className="bk-info-text">
                  <strong>Call / WhatsApp</strong>
                  <a href="tel:+919625928495" style={{ color: "#C9A84C", textDecoration: "none" }}>+91 96259 28495</a>
                </div>
              </div>
            </div>

            {/* Rating */}
            <div className="bk-info-card">
              <div className="bk-rating">
                <div className="bk-rating-num">4.9</div>
                <div>
                  <div style={{ color: "#C9A84C", fontSize: 13, letterSpacing: 2 }}>★★★★★</div>
                  <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>2,000+ Google reviews</div>
                </div>
              </div>
            </div>

            {/* Trust points */}
            <div className="bk-info-card">
              <div className="bk-info-title">Why Book With Us</div>
              {[
                { icon: <Shield size={13}/>, text: "15+ certified professionals on staff" },
                { icon: <Check size={13}/>, text: "Confirmed via WhatsApp within 30 min" },
                { icon: <Sparkles size={13}/>, text: "Wella, Lotus, O3+ premium products only" },
                { icon: <Star size={13}/>, text: "Home service available across Wave City" },
                { icon: <Check size={13}/>, text: "Starting from just ₹30" },
              ].map((t, i) => (
                <div key={i} className="bk-trust-row">
                  <span className="bk-trust-icon">{t.icon}</span>
                  <span style={{ fontSize: 12, color: "#555" }}>{t.text}</span>
                </div>
              ))}
            </div>

            {/* WhatsApp CTA */}
            <a href="https://wa.me/919625928495" target="_blank" rel="noopener noreferrer" className="bk-wa-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Chat on WhatsApp
            </a>

          </aside>

          {/* ── FORM ── */}
          <div className="bk-form-wrap">

            {/* Salon / Home toggle */}
            <div className="bk-type-row">
              <button type="button" className={`bk-type-btn ${!isHome ? "active" : ""}`} onClick={() => setIsHome(false)}>
                <Store size={15}/> At Salon
              </button>
              <button type="button" className={`bk-type-btn ${isHome ? "active" : ""}`} onClick={() => setIsHome(true)}>
                <Home size={15}/> Home Service
              </button>
            </div>

            <form onSubmit={handleSubmit}>

              {/* STEP 1 — Service */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#C9A84C", color: "#080808", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>1</div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#080808" }}>Choose a Service</span>
                </div>

                <div className="bk-section-title">Service Category</div>
                <div className="bk-cat-grid">
                  {allCategories.map(cat => (
                    <button key={cat.id} type="button"
                      className={`bk-cat-btn ${selCat === cat.id ? "active" : ""}`}
                      onClick={() => { setSelCat(cat.id); setService(""); }}>
                      <span className="bk-cat-icon">{cat.icon}</span>
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="bk-field">
                  <label className="bk-label">
                    Select Service *
                    {selCat && <span style={{ color: "#C9A84C", marginLeft: 6, textTransform: "none", letterSpacing: 0, fontWeight: 400 }}>({selectedCatData?.label})</span>}
                  </label>
                  <select
                    value={service}
                    onChange={e => setService(e.target.value)}
                    className="bk-input" required
                    style={{ cursor: "pointer" }}
                  >
                    <option value="">Choose a service...</option>
                    {selCat
                      ? allCategories.filter(c => c.id === selCat).map(cat => (
                          <optgroup key={cat.id} label={`── ${cat.label} ──`}>
                            {cat.services.map(s => {
                              const val = `${s.name} — ${cat.label}`;
                              return <option key={val} value={val}>{s.name} — ₹{s.price.toLocaleString()}{s.popular ? " ⭐" : ""}</option>;
                            })}
                          </optgroup>
                        ))
                      : allCategories.map(cat => (
                          <optgroup key={cat.id} label={`── ${cat.label} ──`}>
                            {cat.services.map(s => {
                              const val = `${s.name} — ${cat.label}`;
                              return <option key={val} value={val}>{s.name} — ₹{s.price.toLocaleString()}{s.popular ? " ⭐" : ""}</option>;
                            })}
                          </optgroup>
                        ))
                    }
                  </select>
                  {selectedServicePrice !== null && (
                    <div className="bk-price-tag">
                      <Check size={11}/> Service price: ₹{selectedServicePrice.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              <hr className="bk-divider" />

              {/* STEP 2 — Staff */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#C9A84C", color: "#080808", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>2</div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#080808" }}>Staff Preference <span style={{ fontSize: 12, color: "#aaa", fontWeight: 400 }}>(optional)</span></span>
                </div>

                <div className="bk-staff-grid">
                  {STAFF_OPTIONS.map(s => (
                    <button key={s.name} type="button"
                      className={`bk-staff-btn ${selStaff === s.name ? "active" : ""}`}
                      onClick={() => setSelStaff(s.name)}>
                      <div className={`bk-staff-name ${selStaff === s.name ? "active" : ""}`}>{s.name}</div>
                      <div className="bk-staff-role">{s.role}</div>
                    </button>
                  ))}
                </div>
              </div>

              <hr className="bk-divider" />

              {/* STEP 3 — Date & Time */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#C9A84C", color: "#080808", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>3</div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#080808" }}>Date & Time</span>
                </div>

                <div className="bk-field">
                  <label className="bk-label">Preferred Date *</label>
                  <input type="date" value={bookingDate} min={todayStr}
                    onChange={e => setBookingDate(e.target.value)}
                    className="bk-input" required />
                  {bookingDate && (
                    <div style={{ fontSize: 12, color: "#888", marginTop: 6 }}>{formatDate(bookingDate)}</div>
                  )}
                </div>

                <div className="bk-section-title">Preferred Time *</div>
                <div className="bk-time-grid">
                  {TIME_SLOTS.map(slot => (
                    <button key={slot.value} type="button"
                      className={`bk-slot ${bookingTime === slot.value ? "active" : ""}`}
                      onClick={() => setBookingTime(slot.value)}>
                      {slot.label}
                    </button>
                  ))}
                </div>
                {/* Hidden required input for time validation */}
                <input type="hidden" value={bookingTime} required onChange={() => {}} />
                {!bookingTime && <div style={{ fontSize: 11, color: "#f56565", marginTop: -8, marginBottom: 12 }}>Please select a time slot</div>}
              </div>

              <hr className="bk-divider" />

              {/* STEP 4 — Personal details */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#C9A84C", color: "#080808", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>4</div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#080808" }}>Your Details</span>
                </div>

                <div className="bk-2col" style={{ marginBottom: 18 }}>
                  <div>
                    <label className="bk-label"><User size={10} style={{ display: "inline", marginRight: 4 }} />Full Name *</label>
                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                      placeholder="Your full name" className="bk-input" required />
                  </div>
                  <div>
                    <label className="bk-label"><Phone size={10} style={{ display: "inline", marginRight: 4 }} />Phone Number *</label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                      placeholder="+91 XXXXXXXXXX" className="bk-input" required />
                  </div>
                </div>

                <div className="bk-field">
                  <label className="bk-label"><Mail size={10} style={{ display: "inline", marginRight: 4 }} />Email Address <span style={{ textTransform: "none", letterSpacing: 0, fontWeight: 400, color: "rgba(0,0,0,0.25)" }}>(optional — for confirmation)</span></label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com" className="bk-input" />
                </div>

                <div className="bk-field">
                  <label className="bk-label">Special Requests / Notes <span style={{ textTransform: "none", letterSpacing: 0, fontWeight: 400, color: "rgba(0,0,0,0.25)" }}>(optional)</span></label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder="Any allergies, preferences, or special instructions..."
                    className="bk-input" style={{ height: 80, resize: "none" }} />
                </div>

                {isHome && (
                  <div className="bk-field">
                    <label className="bk-label"><MapPin size={10} style={{ display: "inline", marginRight: 4 }} />Home Address *</label>
                    <textarea value={address} onChange={e => setAddress(e.target.value)}
                      placeholder="Full address for home service (house no., street, sector, landmark)..."
                      className="bk-input" required={isHome} style={{ height: 80, resize: "none" }} />
                  </div>
                )}

                {/* Honeypot */}
                <div style={{ position: "absolute", left: "-9999px", opacity: 0, pointerEvents: "none" }} aria-hidden="true">
                  <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={e => setHoneypot(e.target.value)} />
                </div>

                {spamError && (
                  <div className="bk-error"><span>⚠️</span> {spamError}</div>
                )}

                <button
                  type="submit"
                  className="bk-submit"
                  disabled={loading || !bookingTime || !service}
                >
                  {loading ? "Booking..." : "Confirm Appointment →"}
                </button>

                <p style={{ textAlign: "center", color: "rgba(0,0,0,0.28)", fontSize: 12, marginTop: 12 }}>
                  We confirm bookings via WhatsApp within 30 minutes
                </p>
              </div>

            </form>
          </div>
        </div>
      </div>

      {/* ── SUCCESS MODAL ── */}
      {booked && (
        <div className="bk-modal-overlay" onClick={() => setBooked(null)}>
          <div className="bk-modal-card" onClick={e => e.stopPropagation()}>
            <div className="bk-modal-top">
              <button className="bk-modal-x" onClick={() => setBooked(null)}><X size={14}/></button>
              <div className="bk-modal-check"><Check size={28}/></div>
              <div className="bk-modal-title">Booking Confirmed!</div>
              {booked.id && <div className="bk-modal-id">BG-{String(booked.id).padStart(5, "0")}</div>}
              <div className="bk-modal-sub">We'll confirm via WhatsApp within 30 mins</div>
            </div>
            <div className="bk-modal-body">
              <div className="bk-modal-row">
                <div className="bk-modal-icon"><User size={12}/></div>
                <div className="bk-modal-key">Name</div>
                <div className="bk-modal-val">{booked.fullName}</div>
              </div>
              <div className="bk-modal-row">
                <div className="bk-modal-icon"><Sparkles size={12}/></div>
                <div className="bk-modal-key">Service</div>
                <div className="bk-modal-val">{booked.service}</div>
              </div>
              <div className="bk-modal-row">
                <div className="bk-modal-icon"><Calendar size={12}/></div>
                <div className="bk-modal-key">Date</div>
                <div className="bk-modal-val">{formatDate(booked.bookingDate)}</div>
              </div>
              <div className="bk-modal-row">
                <div className="bk-modal-icon"><Clock size={12}/></div>
                <div className="bk-modal-key">Time</div>
                <div className="bk-modal-val">{TIME_SLOTS.find(s => s.value === booked.bookingTime)?.label || booked.bookingTime}</div>
              </div>
              {booked.staff && (
                <div className="bk-modal-row">
                  <div className="bk-modal-icon"><Star size={12}/></div>
                  <div className="bk-modal-key">Staff</div>
                  <div className="bk-modal-val">{booked.staff}</div>
                </div>
              )}
              <div className="bk-modal-row">
                <div className="bk-modal-icon"><MapPin size={12}/></div>
                <div className="bk-modal-key">Type</div>
                <div className="bk-modal-val">{booked.isHome ? "Home Service" : "At Salon — Wave City"}</div>
              </div>
              {booked.notes && (
                <div className="bk-modal-row">
                  <div className="bk-modal-icon"><MessageCircle size={12}/></div>
                  <div className="bk-modal-key">Notes</div>
                  <div className="bk-modal-val" style={{ fontSize: 12, color: "#666" }}>{booked.notes}</div>
                </div>
              )}
            </div>
            <div className="bk-modal-actions">
              <a
                className="bk-modal-wa"
                href={`https://wa.me/919625928495?text=Hi%20Bella%20%26%20Guy!%20I%20just%20booked%20${encodeURIComponent(booked.service)}%20for%20${encodeURIComponent(formatDate(booked.bookingDate))}%20at%20${encodeURIComponent(TIME_SLOTS.find(s => s.value === booked.bookingTime)?.label || booked.bookingTime)}.%20Please%20confirm.`}
                target="_blank" rel="noopener noreferrer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Chat on WhatsApp
              </a>
              <button className="bk-modal-close" onClick={() => setBooked(null)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
