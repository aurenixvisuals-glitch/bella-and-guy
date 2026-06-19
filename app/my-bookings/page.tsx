"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

type Booking = {
  id: number;
  full_name: string;
  service: string;
  booking_date: string;
  booking_time: string;
  status: string;
  is_home_service: boolean;
};

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  Pending:   { bg: "rgba(245,175,50,0.1)",  color: "#F5AF32" },
  Confirmed: { bg: "rgba(59,130,246,0.1)",  color: "#3B82F6" },
  Completed: { bg: "rgba(39,174,96,0.1)",   color: "#27AE60" },
  Cancelled: { bg: "rgba(220,80,80,0.1)",   color: "#DC5050" },
};

const FAQS = [
  {
    q: "How do I book an appointment?",
    a: "Visit our homepage and scroll to the Booking section. Fill in your details, choose a service, date and time, and submit. You will receive a confirmation once our team reviews your request.",
  },
  {
    q: "Can I cancel or reschedule my appointment?",
    a: "Please call or WhatsApp us at +91-XXXXXXXXXX at least 24 hours before your appointment to cancel or reschedule. Last-minute cancellations may not be accommodated.",
  },
  {
    q: "How does the Home Service work?",
    a: "Select any Home Service option while booking and provide your address. Our team will visit you at the scheduled time. Home services are available within a limited radius.",
  },
  {
    q: "Why are my bookings not showing up?",
    a: "Bookings are matched to the phone number you registered with. Ensure the phone number in your account matches what you entered while booking. Contact us if the issue persists.",
  },
  {
    q: "How do I update my account details?",
    a: "Currently, account details can be updated by contacting us directly. Self-service profile editing will be available soon.",
  },
];

export default function MyBookings() {
  const router = useRouter();
  const [tab, setTab] = useState<"bookings" | "profile" | "help">("bookings");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [memberSince, setMemberSince] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push("/customer-login"); return; }

    const meta = session.user.user_metadata;
    const name = meta?.full_name || session.user.email?.split("@")[0] || "Guest";
    const phone = meta?.phone || "";
    const email = session.user.email || "";
    const created = session.user.created_at
      ? new Date(session.user.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
      : "";

    setUserName(name);
    setUserEmail(email);
    setUserPhone(phone);
    setMemberSince(created);

    fetchBookings(phone);
  }

  async function fetchBookings(phone: string) {
    if (!phone) { setLoading(false); return; }
    const { data } = await supabase
      .from("appointments")
      .select("*")
      .eq("phone", phone)
      .order("id", { ascending: false });
    if (data) setBookings(data);
    setLoading(false);
  }

  async function doLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  const upcoming = bookings.filter(b => b.status === "Pending" || b.status === "Confirmed");
  const past     = bookings.filter(b => b.status === "Completed" || b.status === "Cancelled");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&family=Inter:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { background: #080808; font-family: 'Inter', sans-serif; margin: 0; }

        .mb-page { min-height: 100vh; background: #080808; font-family: 'Inter', sans-serif; }

        .mb-topbar { background: rgba(10,10,10,0.97); border-bottom: 1px solid rgba(201,168,76,0.12); backdrop-filter: blur(16px); position: sticky; top: 0; z-index: 100; }
        .mb-topbar-inner { max-width: 1100px; margin: 0 auto; padding: 0 32px; height: 64px; display: flex; align-items: center; justify-content: space-between; }
        .mb-brand { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 500; color: #FFFFFF; text-decoration: none; }
        .mb-nav-actions { display: flex; align-items: center; gap: 16px; }
        .mb-book-link { font-size: 11.5px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #C9A84C; text-decoration: none; transition: opacity 0.2s; }
        .mb-book-link:hover { opacity: 0.7; }
        .mb-back-btn { display: inline-flex; align-items: center; gap: 7px; color: rgba(255,255,255,0.35); font-size: 11.5px; font-weight: 500; letter-spacing: 0.06em; text-decoration: none; transition: all 0.2s; padding: 7px 14px; border: 1px solid rgba(255,255,255,0.08); border-radius: 4px; background: rgba(255,255,255,0.02); }
        .mb-back-btn:hover { color: #C9A84C; border-color: rgba(201,168,76,0.25); background: rgba(201,168,76,0.04); }
        .mb-logout-btn { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.4); padding: 8px 16px; border-radius: 4px; font-size: 11.5px; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s ease; }
        .mb-logout-btn:hover { border-color: rgba(220,80,80,0.3); color: #e06060; }

        .mb-content { max-width: 1100px; margin: 0 auto; padding: 48px 32px; }

        .mb-hero { margin-bottom: 40px; }
        .mb-greeting { font-family: 'Cormorant Garamond', serif; font-size: 40px; font-weight: 400; color: #FFFFFF; margin-bottom: 6px; }
        .mb-sub { color: rgba(255,255,255,0.28); font-size: 14px; }

        .mb-tabs { display: flex; gap: 4px; margin-bottom: 40px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 6px; padding: 4px; width: fit-content; }
        .mb-tab-btn { padding: 10px 22px; border: none; border-radius: 4px; font-size: 11.5px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s; background: none; color: rgba(255,255,255,0.35); }
        .mb-tab-btn.active { background: rgba(201,168,76,0.12); color: #C9A84C; }
        .mb-tab-btn:hover:not(.active) { color: rgba(255,255,255,0.6); }

        .mb-stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 14px; margin-bottom: 48px; }
        .mb-stat-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 4px; padding: 22px; }
        .mb-stat-label { font-size: 10px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.28); margin-bottom: 10px; }
        .mb-stat-value { font-family: 'Cormorant Garamond', serif; font-size: 34px; font-weight: 400; color: #FFFFFF; line-height: 1; }
        .mb-stat-value.gold { color: #C9A84C; }

        .mb-section-title { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 500; color: #FFFFFF; margin-bottom: 18px; padding-bottom: 14px; border-bottom: 1px solid rgba(255,255,255,0.06); }

        .mb-booking-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 4px; padding: 22px; margin-bottom: 10px; display: flex; align-items: center; gap: 20px; transition: all 0.25s ease; flex-wrap: wrap; }
        .mb-booking-card:hover { border-color: rgba(201,168,76,0.2); background: rgba(201,168,76,0.02); }
        .mb-booking-date { min-width: 60px; text-align: center; flex-shrink: 0; }
        .mb-booking-date-day { font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 500; color: #C9A84C; line-height: 1; }
        .mb-booking-date-month { font-size: 10px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.28); margin-top: 2px; }
        .mb-booking-divider { width: 1px; height: 38px; background: rgba(255,255,255,0.07); flex-shrink: 0; }
        .mb-booking-info { flex: 1; }
        .mb-booking-service { font-size: 15px; font-weight: 600; color: #FFFFFF; margin-bottom: 4px; }
        .mb-booking-meta { font-size: 12.5px; color: rgba(255,255,255,0.28); }
        .mb-status-badge { padding: 5px 12px; border-radius: 100px; font-size: 10.5px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; flex-shrink: 0; }
        .mb-home-tag { font-size: 10px; color: #C9A84C; background: rgba(201,168,76,0.08); border: 1px solid rgba(201,168,76,0.2); padding: 3px 8px; border-radius: 100px; font-weight: 600; letter-spacing: 0.06em; margin-top: 4px; display: inline-block; }
        .mb-empty { text-align: center; padding: 48px 20px; color: rgba(255,255,255,0.2); font-size: 14px; }
        .mb-book-cta { display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #E8C96D, #C9A84C); color: #080808; padding: 12px 28px; border-radius: 4px; font-size: 11.5px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; text-decoration: none; margin-top: 16px; transition: all 0.3s ease; }
        .mb-book-cta:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(201,168,76,0.28); }

        .mb-profile-hero { background: linear-gradient(135deg, rgba(201,168,76,0.06) 0%, rgba(255,255,255,0.02) 100%); border: 1px solid rgba(201,168,76,0.18); border-radius: 8px; padding: 40px; margin-bottom: 28px; display: flex; align-items: center; gap: 36px; flex-wrap: wrap; }
        .mb-profile-avatar { width: 96px; height: 96px; border-radius: 50%; border: 2px solid rgba(201,168,76,0.45); background: rgba(201,168,76,0.08); display: flex; align-items: center; justify-content: center; flex-shrink: 0; position: relative; }
        .mb-profile-avatar::after { content: ''; position: absolute; inset: -5px; border-radius: 50%; border: 1px solid rgba(201,168,76,0.12); }
        .mb-profile-initials { font-family: 'Cormorant Garamond', serif; font-size: 34px; font-weight: 500; color: #C9A84C; line-height: 1; }
        .mb-profile-hero-info { flex: 1; min-width: 200px; }
        .mb-profile-hero-name { font-family: 'Cormorant Garamond', serif; font-size: 34px; font-weight: 400; color: #FFFFFF; margin-bottom: 6px; line-height: 1.15; }
        .mb-profile-hero-email { font-size: 13.5px; color: rgba(255,255,255,0.4); margin-bottom: 3px; }
        .mb-profile-hero-phone { font-size: 13.5px; color: rgba(255,255,255,0.3); margin-bottom: 18px; }
        .mb-profile-badges { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .mb-badge-verified { display: inline-flex; align-items: center; gap: 5px; background: rgba(39,174,96,0.1); border: 1px solid rgba(39,174,96,0.25); color: #4ade80; padding: 5px 13px; border-radius: 100px; font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
        .mb-badge-member { display: inline-flex; align-items: center; gap: 5px; background: rgba(201,168,76,0.08); border: 1px solid rgba(201,168,76,0.22); color: #C9A84C; padding: 5px 13px; border-radius: 100px; font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
        .mb-profile-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 14px; margin-bottom: 32px; }
        .mb-profile-stat { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; padding: 24px 22px; text-align: center; transition: border-color 0.2s; }
        .mb-profile-stat:hover { border-color: rgba(201,168,76,0.18); }
        .mb-profile-stat-val { font-family: 'Cormorant Garamond', serif; font-size: 42px; font-weight: 400; color: #C9A84C; line-height: 1; margin-bottom: 10px; }
        .mb-profile-stat-lbl { font-size: 10px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(255,255,255,0.25); }
        .mb-profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 28px; }
        @media (max-width: 600px) { .mb-profile-grid { grid-template-columns: 1fr; } .mb-profile-hero { padding: 28px 22px; gap: 24px; } .mb-profile-hero-name { font-size: 26px; } }
        .mb-profile-field { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07); border-radius: 6px; padding: 22px 24px; transition: border-color 0.2s; }
        .mb-profile-field:hover { border-color: rgba(255,255,255,0.12); }
        .mb-profile-field-icon { font-size: 18px; margin-bottom: 12px; opacity: 0.7; }
        .mb-profile-field-label { font-size: 10px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(255,255,255,0.28); margin-bottom: 8px; }
        .mb-profile-field-value { font-size: 15px; color: #FFFFFF; font-weight: 500; word-break: break-all; }
        .mb-profile-field-value.muted { color: rgba(255,255,255,0.3); font-style: italic; font-size: 14px; font-weight: 400; }
        .mb-profile-note { background: rgba(201,168,76,0.04); border: 1px solid rgba(201,168,76,0.13); border-radius: 6px; padding: 16px 20px; font-size: 13px; color: rgba(255,255,255,0.3); line-height: 1.65; display: flex; gap: 12px; align-items: flex-start; }
        .mb-profile-note-icon { flex-shrink: 0; opacity: 0.5; margin-top: 1px; }

        .mb-faq-item { border: 1px solid rgba(255,255,255,0.07); border-radius: 4px; margin-bottom: 8px; overflow: hidden; }
        .mb-faq-q { width: 100%; background: rgba(255,255,255,0.03); border: none; text-align: left; padding: 18px 22px; color: rgba(255,255,255,0.75); font-size: 14px; font-weight: 500; font-family: 'Inter', sans-serif; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: color 0.2s; gap: 12px; }
        .mb-faq-q:hover { color: #C9A84C; }
        .mb-faq-q.open { color: #C9A84C; }
        .mb-faq-chevron { font-size: 12px; flex-shrink: 0; transition: transform 0.25s; color: rgba(255,255,255,0.3); }
        .mb-faq-chevron.open { transform: rotate(180deg); color: #C9A84C; }
        .mb-faq-a { padding: 0 22px 18px; color: rgba(255,255,255,0.42); font-size: 13.5px; line-height: 1.7; background: rgba(255,255,255,0.02); }

        .mb-contact-card { background: rgba(201,168,76,0.04); border: 1px solid rgba(201,168,76,0.14); border-radius: 4px; padding: 28px; margin-top: 32px; }
        .mb-contact-title { font-family: 'Cormorant Garamond', serif; font-size: 20px; color: #FFFFFF; font-weight: 500; margin-bottom: 16px; }
        .mb-contact-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; color: rgba(255,255,255,0.45); font-size: 13.5px; }
        .mb-contact-row a { color: #C9A84C; text-decoration: none; }
        .mb-contact-row a:hover { text-decoration: underline; }
        .mb-contact-icon { width: 32px; height: 32px; background: rgba(201,168,76,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }

        @media (max-width: 767px) {
          .mb-content { padding: 32px 20px; }
          .mb-greeting { font-size: 30px; }
          .mb-topbar-inner { padding: 0 20px; }
        }
      `}</style>

      <div className="mb-page">
        {/* Top bar */}
        <div className="mb-topbar">
          <div className="mb-topbar-inner">
            <a href="/" className="mb-brand">
              Bella <span style={{ color: "#C9A84C" }}>&</span> Guy
            </a>
            <div className="mb-nav-actions">
              <a href="/" className="mb-back-btn">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M8.5 2L3.5 6.5L8.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Back to Home
              </a>
              <a href="/#booking" className="mb-book-link">+ New Booking</a>
              <button onClick={() => setShowLogout(true)} className="mb-logout-btn">Sign Out</button>
            </div>
          </div>
        </div>

        <div className="mb-content">
          {/* Header */}
          <div className="mb-hero">
            <div className="mb-greeting">
              Welcome back, {userName.split(" ")[0]}
            </div>
            <div className="mb-sub">Manage your appointments and account at Bella & Guy</div>
          </div>

          {/* Tab navigation */}
          <div className="mb-tabs">
            <button className={`mb-tab-btn ${tab === "bookings" ? "active" : ""}`} onClick={() => setTab("bookings")}>
              Appointments
            </button>
            <button className={`mb-tab-btn ${tab === "profile" ? "active" : ""}`} onClick={() => setTab("profile")}>
              My Profile
            </button>
            <button className={`mb-tab-btn ${tab === "help" ? "active" : ""}`} onClick={() => setTab("help")}>
              Help
            </button>
          </div>

          {/* ── APPOINTMENTS TAB ── */}
          {tab === "bookings" && (
            <>
              {loading ? (
                <div style={{ textAlign: "center", padding: "60px", color: "rgba(255,255,255,0.25)" }}>
                  Loading your appointments...
                </div>
              ) : (
                <>
                  <div className="mb-stats-row">
                    <div className="mb-stat-card">
                      <div className="mb-stat-label">Total Appointments</div>
                      <div className="mb-stat-value">{bookings.length}</div>
                    </div>
                    <div className="mb-stat-card">
                      <div className="mb-stat-label">Upcoming</div>
                      <div className="mb-stat-value gold">{upcoming.length}</div>
                    </div>
                    <div className="mb-stat-card">
                      <div className="mb-stat-label">Completed</div>
                      <div className="mb-stat-value">{past.filter(b => b.status === "Completed").length}</div>
                    </div>
                    <div className="mb-stat-card">
                      <div className="mb-stat-label">Home Services</div>
                      <div className="mb-stat-value">{bookings.filter(b => b.is_home_service).length}</div>
                    </div>
                  </div>

                  {upcoming.length > 0 && (
                    <div style={{ marginBottom: "48px" }}>
                      <div className="mb-section-title">Upcoming Appointments</div>
                      {upcoming.map((b) => {
                        const d = new Date(b.booking_date);
                        const s = STATUS_STYLES[b.status] || STATUS_STYLES["Pending"];
                        return (
                          <div key={b.id} className="mb-booking-card">
                            <div className="mb-booking-date">
                              <div className="mb-booking-date-day">{d.getDate()}</div>
                              <div className="mb-booking-date-month">{d.toLocaleDateString("en", { month: "short" })}</div>
                            </div>
                            <div className="mb-booking-divider" />
                            <div className="mb-booking-info">
                              <div className="mb-booking-service">{b.service}</div>
                              <div className="mb-booking-meta">{b.booking_time} · {b.booking_date}</div>
                              {b.is_home_service && <span className="mb-home-tag">Home Service</span>}
                            </div>
                            <span className="mb-status-badge" style={{ background: s.bg, color: s.color }}>{b.status}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {past.length > 0 && (
                    <div style={{ marginBottom: "48px" }}>
                      <div className="mb-section-title">Past Appointments</div>
                      {past.map((b) => {
                        const d = new Date(b.booking_date);
                        const s = STATUS_STYLES[b.status] || STATUS_STYLES["Completed"];
                        return (
                          <div key={b.id} className="mb-booking-card" style={{ opacity: 0.6 }}>
                            <div className="mb-booking-date">
                              <div className="mb-booking-date-day">{d.getDate()}</div>
                              <div className="mb-booking-date-month">{d.toLocaleDateString("en", { month: "short" })}</div>
                            </div>
                            <div className="mb-booking-divider" />
                            <div className="mb-booking-info">
                              <div className="mb-booking-service">{b.service}</div>
                              <div className="mb-booking-meta">{b.booking_time} · {b.booking_date}</div>
                              {b.is_home_service && <span className="mb-home-tag">Home Service</span>}
                            </div>
                            <span className="mb-status-badge" style={{ background: s.bg, color: s.color }}>{b.status}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {bookings.length === 0 && (
                    <div className="mb-empty">
                      <p style={{ fontSize: "16px", marginBottom: "8px", color: "rgba(255,255,255,0.35)" }}>No appointments yet</p>
                      <p>Your booking history will appear here once you make your first appointment.</p>
                      <a href="/#booking" className="mb-book-cta">Book Your First Appointment →</a>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* ── PROFILE TAB ── */}
          {tab === "profile" && (() => {
            const initials = userName.split(" ").filter(Boolean).map(w => w[0].toUpperCase()).slice(0, 2).join("") || "?";
            return (
              <div>
                {/* Hero card */}
                <div className="mb-profile-hero">
                  <div className="mb-profile-avatar">
                    <span className="mb-profile-initials">{initials}</span>
                  </div>
                  <div className="mb-profile-hero-info">
                    <div className="mb-profile-hero-name">{userName}</div>
                    <div className="mb-profile-hero-email">{userEmail}</div>
                    <div className="mb-profile-hero-phone">{userPhone ? `+91 ${userPhone}` : "No phone on file"}</div>
                    <div className="mb-profile-badges">
                      <span className="mb-badge-verified">✓ Verified</span>
                      <span className="mb-badge-member">✦ Member since {memberSince}</span>
                    </div>
                  </div>
                </div>

                {/* Appointment stats */}
                <div className="mb-profile-stats">
                  <div className="mb-profile-stat">
                    <div className="mb-profile-stat-val">{bookings.length}</div>
                    <div className="mb-profile-stat-lbl">Total</div>
                  </div>
                  <div className="mb-profile-stat">
                    <div className="mb-profile-stat-val">{past.filter(b => b.status === "Completed").length}</div>
                    <div className="mb-profile-stat-lbl">Completed</div>
                  </div>
                  <div className="mb-profile-stat">
                    <div className="mb-profile-stat-val">{upcoming.length}</div>
                    <div className="mb-profile-stat-lbl">Upcoming</div>
                  </div>
                  <div className="mb-profile-stat">
                    <div className="mb-profile-stat-val">{bookings.filter(b => b.is_home_service).length}</div>
                    <div className="mb-profile-stat-lbl">Home Services</div>
                  </div>
                </div>

                {/* Account detail fields */}
                <div className="mb-section-title">Account Information</div>
                <div className="mb-profile-grid">
                  <div className="mb-profile-field">
                    <div className="mb-profile-field-icon">👤</div>
                    <div className="mb-profile-field-label">Full Name</div>
                    <div className="mb-profile-field-value">{userName || <span className="muted">Not set</span>}</div>
                  </div>
                  <div className="mb-profile-field">
                    <div className="mb-profile-field-icon">✉️</div>
                    <div className="mb-profile-field-label">Email Address</div>
                    <div className="mb-profile-field-value">{userEmail}</div>
                  </div>
                  <div className="mb-profile-field">
                    <div className="mb-profile-field-icon">📱</div>
                    <div className="mb-profile-field-label">Phone Number</div>
                    <div className={`mb-profile-field-value ${!userPhone ? "muted" : ""}`}>
                      {userPhone ? `+91 ${userPhone}` : "Not provided"}
                    </div>
                  </div>
                  <div className="mb-profile-field">
                    <div className="mb-profile-field-icon">📅</div>
                    <div className="mb-profile-field-label">Member Since</div>
                    <div className="mb-profile-field-value">{memberSince || "—"}</div>
                  </div>
                  <div className="mb-profile-field">
                    <div className="mb-profile-field-icon">🔒</div>
                    <div className="mb-profile-field-label">Account Status</div>
                    <div className="mb-profile-field-value" style={{ color: "#4ade80" }}>Active & Verified</div>
                  </div>
                  <div className="mb-profile-field">
                    <div className="mb-profile-field-icon">✦</div>
                    <div className="mb-profile-field-label">Membership</div>
                    <div className="mb-profile-field-value" style={{ color: "#C9A84C" }}>Regular Member</div>
                  </div>
                </div>

                <div className="mb-profile-note">
                  <span className="mb-profile-note-icon">ℹ️</span>
                  <span>
                    To update your name or phone number, please visit the salon or contact us on WhatsApp.
                    Self-service profile editing is coming soon.
                  </span>
                </div>
              </div>
            );
          })()}

          {/* ── HELP TAB ── */}
          {tab === "help" && (
            <div>
              <div className="mb-section-title">Frequently Asked Questions</div>

              {FAQS.map((faq, i) => (
                <div key={i} className="mb-faq-item">
                  <button
                    className={`mb-faq-q ${openFaq === i ? "open" : ""}`}
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    {faq.q}
                    <span className={`mb-faq-chevron ${openFaq === i ? "open" : ""}`}>▼</span>
                  </button>
                  {openFaq === i && <div className="mb-faq-a">{faq.a}</div>}
                </div>
              ))}

              <div className="mb-contact-card">
                <div className="mb-contact-title">Still need help?</div>
                <div className="mb-contact-row">
                  <div className="mb-contact-icon">📞</div>
                  <span>Call us: <a href="tel:+91XXXXXXXXXX">+91-XXXXXXXXXX</a></span>
                </div>
                <div className="mb-contact-row">
                  <div className="mb-contact-icon">💬</div>
                  <span>WhatsApp: <a href="https://wa.me/91XXXXXXXXXX" target="_blank" rel="noreferrer">Message us</a></span>
                </div>
                <div className="mb-contact-row">
                  <div className="mb-contact-icon">📍</div>
                  <span>Visit us at our salon — we're happy to assist in person.</span>
                </div>
                <div className="mb-contact-row">
                  <div className="mb-contact-icon">🕐</div>
                  <span>Hours: Monday – Saturday, 10:00 AM – 8:00 PM</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showLogout && (
        <>
          <style>{`
            .mb-ovl{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.6);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;animation:mbFd 0.2s ease;}
            @keyframes mbFd{from{opacity:0}to{opacity:1}}
            .mb-cm{background:rgba(18,14,10,0.92);backdrop-filter:blur(40px) saturate(180%);border:1px solid rgba(255,255,255,0.1);border-top:1px solid rgba(255,255,255,0.18);border-radius:20px;padding:32px 28px 24px;width:100%;max-width:340px;margin:16px;box-shadow:inset 0 1.5px 0 rgba(255,255,255,0.12),0 32px 64px rgba(0,0,0,0.6);animation:mbUp 0.25s cubic-bezier(0.22,1,0.36,1);}
            @keyframes mbUp{from{opacity:0;transform:translateY(16px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
            .mb-ci{width:44px;height:44px;border-radius:12px;background:rgba(245,101,101,0.1);border:1px solid rgba(245,101,101,0.2);display:flex;align-items:center;justify-content:center;font-size:18px;margin-bottom:16px;}
            .mb-ct{font-size:16px;font-weight:700;color:#fff;margin-bottom:8px;font-family:'Inter',sans-serif;}
            .mb-cx{font-size:13px;color:rgba(255,255,255,0.45);line-height:1.6;margin-bottom:24px;}
            .mb-cbs{display:flex;gap:10px;}
            .mb-ck{flex:1;padding:11px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:rgba(255,255,255,0.6);font-size:13px;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;transition:all 0.2s;}
            .mb-ck:hover{background:rgba(255,255,255,0.09);color:#fff;}
            .mb-co{flex:1;padding:11px;background:rgba(245,101,101,0.15);border:1px solid rgba(245,101,101,0.3);border-radius:10px;color:#f87171;font-size:13px;font-weight:700;cursor:pointer;font-family:'Inter',sans-serif;transition:all 0.2s;}
            .mb-co:hover{background:rgba(245,101,101,0.25);}
          `}</style>
          <div className="mb-ovl" onClick={() => setShowLogout(false)}>
            <div className="mb-cm" onClick={e => e.stopPropagation()}>
              <div className="mb-ci">↩️</div>
              <div className="mb-ct">Sign Out</div>
              <div className="mb-cx">Are you sure you want to sign out from your account?</div>
              <div className="mb-cbs">
                <button className="mb-ck" onClick={() => setShowLogout(false)}>Stay</button>
                <button className="mb-co" onClick={doLogout}>Sign Out</button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
