"use client";

import React from "react";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabaseAdmin as supabase } from "../../lib/supabaseAdmin";
import { allCategories } from "../../lib/servicesData";
import { CalendarDays, Calendar, TrendingUp, User, LogOut, Check, Phone, MapPin, Home, Info } from "lucide-react";

type Booking = {
  id: number; full_name: string; phone: string; service: string;
  booking_date: string; booking_time: string;
  address?: string; status: string; staff?: string; created_at?: string;
};
type StaffRow = { id: number; name: string; email: string; role: string; active: boolean; };
type Tab = "today" | "schedule" | "revenue" | "profile";

const SERVICE_PRICES: Record<string, number> = {};
allCategories.forEach(cat => {
  cat.services.forEach(s => {
    SERVICE_PRICES[`${s.name} — ${cat.label}`] = s.price;
    SERVICE_PRICES[s.name] = s.price;
  });
});

function getPrice(service: string): number {
  if (!service) return 0;
  if (SERVICE_PRICES[service]) return SERVICE_PRICES[service];
  // fuzzy: find by partial match
  const key = Object.keys(SERVICE_PRICES).find(k =>
    k.toLowerCase().includes(service.toLowerCase()) ||
    service.toLowerCase().includes(k.toLowerCase().split(" — ")[0])
  );
  return key ? SERVICE_PRICES[key] : 0;
}

const STATUS: Record<string, { bg: string; color: string; dot: string }> = {
  Pending:   { bg: "rgba(245,199,90,0.12)",  color: "#f5c75a", dot: "#f5c75a" },
  Confirmed: { bg: "rgba(90,180,245,0.12)",  color: "#5ab4f5", dot: "#5ab4f5" },
  Completed: { bg: "rgba(79,208,128,0.12)",  color: "#4fd080", dot: "#4fd080" },
  Cancelled: { bg: "rgba(245,101,101,0.12)", color: "#f56565", dot: "#f56565" },
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Inter',sans-serif;background:#07070f;}
.sp{min-height:100vh;background:#07070f;color:#d0d0d0;font-family:'Inter',sans-serif;}

/* TOPBAR */
.tb{background:rgba(10,10,18,0.98);border-bottom:1px solid rgba(201,168,76,0.1);padding:0 20px;display:flex;align-items:center;gap:12px;position:sticky;top:0;z-index:50;height:60px;}
.tb-av{width:38px;height:38px;border-radius:11px;background:linear-gradient(135deg,#c9a84c,#f5d98b);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;color:#1a1000;flex-shrink:0;}
.tb-name{font-size:14px;font-weight:700;color:#fff;}
.tb-role{font-size:10px;color:#484848;text-transform:uppercase;letter-spacing:0.08em;}
.live-pill{display:flex;align-items:center;gap:5px;background:rgba(79,208,128,0.08);border:1px solid rgba(79,208,128,0.18);border-radius:20px;padding:5px 10px;font-size:11px;color:#4fd080;margin-left:auto;}
.live-dot{width:6px;height:6px;border-radius:50%;background:#4fd080;animation:lp 1.6s ease-in-out infinite;}
@keyframes lp{0%,100%{box-shadow:0 0 0 0 rgba(79,208,128,0.4);}50%{box-shadow:0 0 0 4px rgba(79,208,128,0);}}
.lo-btn{background:rgba(245,101,101,0.08);border:1px solid rgba(245,101,101,0.15);color:#f56565;padding:7px 14px;border-radius:9px;font-size:11px;font-family:'Inter',sans-serif;cursor:pointer;font-weight:500;margin-left:8px;}

/* BOTTOM NAV */
.bnav{position:fixed;bottom:0;left:0;right:0;background:rgba(10,10,18,0.98);border-top:1px solid rgba(255,255,255,0.06);display:flex;z-index:50;padding-bottom:env(safe-area-inset-bottom);}
.bni{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:10px 0;cursor:pointer;border:none;background:transparent;color:#383838;font-family:'Inter',sans-serif;transition:all 0.15s;}
.bni.on{color:#c9a84c;}
.bni-ic{font-size:19px;line-height:1;}
.bni-lb{font-size:9px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;}

/* CONTENT */
.pb{padding:18px 18px 80px;}

/* KPI */
.kpi-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px;}
.kpi{background:rgba(12,12,20,0.97);border:1px solid rgba(255,255,255,0.05);border-radius:14px;padding:16px 14px;}
.kpi-l{font-size:9px;font-weight:700;color:#363636;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;}
.kpi-v{font-size:26px;font-weight:700;line-height:1;}
.kpi-s{font-size:10px;color:#383838;margin-top:5px;}

/* TODAY TIMELINE */
.tl-wrap{background:rgba(12,12,20,0.97);border:1px solid rgba(255,255,255,0.05);border-radius:14px;overflow:hidden;margin-bottom:14px;}
.tl-head{padding:14px 16px 12px;border-bottom:1px solid rgba(255,255,255,0.04);display:flex;align-items:center;justify-content:space-between;}
.tl-title{font-size:12px;font-weight:700;color:#c9a84c;text-transform:uppercase;letter-spacing:0.08em;}
.tl-count{font-size:11px;color:#484848;background:rgba(255,255,255,0.04);padding:3px 9px;border-radius:20px;}
.tl-item{display:flex;gap:14px;padding:14px 16px;border-bottom:1px solid rgba(255,255,255,0.03);align-items:flex-start;}
.tl-item:last-child{border-bottom:none;}
.tl-time{font-size:13px;font-weight:700;color:#c9a84c;min-width:44px;flex-shrink:0;margin-top:1px;}
.tl-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:5px;}
.tl-info{flex:1;min-width:0;}
.tl-client{font-size:13px;font-weight:600;color:#fff;}
.tl-svc{font-size:11px;color:#686868;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.tl-tags{display:flex;gap:6px;margin-top:7px;flex-wrap:wrap;}
.tag{padding:3px 9px;border-radius:20px;font-size:10px;font-weight:600;}
.tag-home{background:rgba(34,197,94,0.1);color:#22c55e;}
.tag-price{background:rgba(79,208,128,0.1);color:#4fd080;}
.tl-actions{display:flex;gap:6px;flex-shrink:0;margin-top:2px;}
.btn{padding:6px 12px;border-radius:7px;cursor:pointer;font-size:10px;font-weight:700;font-family:'Inter',sans-serif;border:1px solid;transition:all 0.15s;}
.btn:hover{opacity:0.85;}
.b-done{background:rgba(79,208,128,0.12);color:#4fd080;border-color:rgba(79,208,128,0.25);}
.b-wa{background:rgba(37,211,102,0.1);color:#25d366;border-color:rgba(37,211,102,0.2);}
.b-cancel{background:rgba(245,101,101,0.08);color:#f56565;border-color:rgba(245,101,101,0.15);}
.b-confirm{background:rgba(90,180,245,0.1);color:#5ab4f5;border-color:rgba(90,180,245,0.2);}

/* SCHEDULE */
.sc-day{margin-bottom:16px;}
.sc-day-head{font-size:10px;font-weight:700;color:#484848;text-transform:uppercase;letter-spacing:0.1em;padding:8px 0 8px;display:flex;align-items:center;gap:8px;}
.sc-day-head::after{content:'';flex:1;height:1px;background:rgba(255,255,255,0.04);}
.appt-card{background:rgba(12,12,20,0.97);border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:14px;margin-bottom:8px;display:flex;gap:12px;align-items:flex-start;transition:border-color 0.2s;}
.appt-card:hover{border-color:rgba(201,168,76,0.18);}
.appt-av{width:34px;height:34px;border-radius:9px;background:rgba(201,168,76,0.1);color:#c9a84c;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0;}
.appt-body{flex:1;min-width:0;}
.appt-name{font-size:13px;font-weight:600;color:#fff;}
.appt-svc{font-size:11px;color:#686868;margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.appt-meta{display:flex;gap:8px;margin-top:7px;flex-wrap:wrap;align-items:center;}
.appt-time{font-size:11px;font-weight:700;color:#c9a84c;}
.appt-right{display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0;}
.sbadge{padding:4px 9px;border-radius:20px;font-size:10px;font-weight:700;}
.appt-price{font-size:12px;font-weight:700;color:#4fd080;}

/* REVENUE */
.rev-kpi{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;}
.rev-card{background:rgba(12,12,20,0.97);border:1px solid rgba(255,255,255,0.05);border-radius:14px;padding:18px 16px;}
.rev-lbl{font-size:9px;font-weight:700;color:#363636;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;}
.rev-val{font-size:24px;font-weight:700;}
.rev-sub{font-size:10px;color:#383838;margin-top:4px;}
.svc-row{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:12px;}
.svc-row:last-child{border-bottom:none;}
.svc-bar-wrap{flex:1;margin:0 12px;height:3px;background:rgba(255,255,255,0.06);border-radius:2px;}
.svc-bar{height:100%;background:linear-gradient(90deg,#c9a84c,#f5d98b);border-radius:2px;}

/* PROFILE */
.prof-hero{background:rgba(201,168,76,0.05);border:1px solid rgba(201,168,76,0.12);border-radius:16px;padding:22px;margin-bottom:14px;display:flex;gap:18px;align-items:center;}
.prof-av{width:64px;height:64px;border-radius:18px;background:linear-gradient(135deg,rgba(201,168,76,0.2),rgba(201,168,76,0.06));color:#c9a84c;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;border:1px solid rgba(201,168,76,0.2);flex-shrink:0;}
.prof-name{font-size:20px;font-weight:700;color:#fff;margin-bottom:4px;}
.prof-role{font-size:10px;color:#c9a84c;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;}
.prof-email{font-size:12px;color:#484848;margin-top:4px;}
.stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px;}
.stat-box{background:rgba(12,12,20,0.97);border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:14px;text-align:center;}
.stat-v{font-size:22px;font-weight:700;margin-bottom:4px;}
.stat-l{font-size:9px;color:#383838;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;}
.info-row{background:rgba(12,12,20,0.97);border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:14px 16px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;font-size:13px;}
.info-k{color:#484848;font-weight:500;}
.info-v{color:#ddd;font-weight:600;}

/* TOAST */
.toast{background:rgba(79,208,128,0.1);border:1px solid rgba(79,208,128,0.22);border-radius:12px;padding:11px 16px;margin-bottom:14px;font-size:13px;color:#4fd080;animation:sfi 0.3s ease;}
@keyframes sfi{from{opacity:0;transform:translateY(-8px);}to{opacity:1;transform:translateY(0);}}

/* EMPTY */
.empty{text-align:center;padding:44px 16px;color:#2a2a2a;}
.empty-ic{font-size:34px;margin-bottom:10px;}

/* LOADING */
.ls{min-height:100vh;background:#07070f;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;}
.lsp{width:32px;height:32px;border-radius:50%;border:3px solid rgba(201,168,76,0.18);border-top-color:#c9a84c;animation:sp 0.8s linear infinite;}
@keyframes sp{to{transform:rotate(360deg);}}

::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.07);border-radius:2px;}
`;

export default function StaffPanel() {
  const router = useRouter();
  const [me, setMe]             = useState<StaffRow | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState<Tab>("today");
  const [toast, setToast]       = useState("");
  const [showLogout, setShowLogout] = useState(false);

  const today    = new Date().toISOString().split("T")[0];
  const tomorrow = (() => { const d = new Date(); d.setDate(d.getDate()+1); return d.toISOString().split("T")[0]; })();
  const thisMonth = new Date().toISOString().slice(0,7);

  useEffect(() => { init(); }, []);

  useEffect(() => {
    if (!me) return;
    const ch = supabase.channel("sp-live")
      .on("postgres_changes", { event:"*", schema:"public", table:"appointments" }, () => fetchBookings(me))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [me]);

  async function init() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push("/login"); return; }
    const email = session.user.email?.trim().toLowerCase() ?? "";
    const { data: sd } = await supabase.from("staff").select("*").ilike("email", email);
    const staff = sd?.[0] ?? null;
    if (!staff) { router.push("/login"); return; }
    setMe(staff);
    await fetchBookings(staff);
    setLoading(false);
  }

  async function fetchBookings(staff: StaffRow) {
    const { data } = await supabase.from("appointments").select("*")
      .eq("staff", staff.name).order("booking_date").order("booking_time");
    if (data) setBookings(data);
  }

  async function updateStatus(id: number, status: string) {
    await supabase.from("appointments").update({ status }).eq("id", id);
    if (me) fetchBookings(me);
    showToast(status === "Completed" ? "✅ Completed!" : status === "Confirmed" ? "✅ Confirmed!" : `→ ${status}`);
  }

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  function sendWA(b: Booking) {
    window.open(`https://wa.me/91${b.phone}?text=${encodeURIComponent(`Hello ${b.full_name} 👋\n\nYour appointment reminder from Bella & Guy Salon 💅\n\nService: ${b.service}\n📅 ${b.booking_date} at ⏰ ${b.booking_time}\n\nSee you soon! ❤️`)}`, "_blank");
  }

  // ── Computed ──────────────────────────────────────
  const price = (b: Booking) => getPrice(b.service);

  const todayList   = bookings.filter(b => b.booking_date === today);
  const upcomingAll = bookings.filter(b => b.status !== "Cancelled" && b.booking_date >= today);
  const totalRev    = bookings.filter(b => b.status === "Completed").reduce((s,b) => s + price(b), 0);
  const monthRev    = bookings.filter(b => b.status === "Completed" && b.booking_date?.slice(0,7) === thisMonth).reduce((s,b) => s + price(b), 0);
  const todayRev    = bookings.filter(b => b.status === "Completed" && b.booking_date === today).reduce((s,b) => s + price(b), 0);
  const completed   = bookings.filter(b => b.status === "Completed").length;
  const pending     = bookings.filter(b => b.status === "Pending" || b.status === "Confirmed").length;

  // Group upcoming bookings by date for schedule view
  const groupedByDate = useMemo(() => {
    const map: Record<string, Booking[]> = {};
    upcomingAll.forEach(b => {
      if (!map[b.booking_date]) map[b.booking_date] = [];
      map[b.booking_date].push(b);
    });
    return Object.entries(map).sort((a,b) => a[0].localeCompare(b[0])).slice(0, 14);
  }, [upcomingAll]);

  // Service revenue breakdown
  const svcRevenue = useMemo(() => {
    const map: Record<string, number> = {};
    bookings.filter(b => b.status === "Completed").forEach(b => {
      const p = price(b);
      if (p > 0) map[b.service] = (map[b.service] || 0) + p;
    });
    return Object.entries(map).sort((a,b) => b[1]-a[1]).slice(0, 8);
  }, [bookings]);
  const maxSvcRev = svcRevenue[0]?.[1] || 1;

  // Monthly breakdown
  const monthlyData = useMemo(() => Array.from({length: 6}, (_, i) => {
    const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (5-i));
    const ym = d.toISOString().slice(0,7);
    const label = d.toLocaleString("default", { month: "short" });
    const rev = bookings.filter(b => b.status === "Completed" && b.booking_date?.slice(0,7) === ym).reduce((s,b) => s + price(b), 0);
    const cnt = bookings.filter(b => b.booking_date?.slice(0,7) === ym).length;
    return { label, rev, cnt };
  }), [bookings]);
  const maxMonthRev = Math.max(...monthlyData.map(m => m.rev), 1);

  function formatDate(d: string) {
    if (d === today) return "Today";
    if (d === tomorrow) return "Tomorrow";
    return new Date(d).toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"short" });
  }

  const initials = me ? me.name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase() : "?";

  if (loading) return (
    <div className="ls"><style>{CSS}</style>
      <div className="lsp"/><div style={{ color:"#444",fontSize:13 }}>Loading…</div>
    </div>
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="sp">

        {/* TOPBAR */}
        <div className="tb">
          <div className="tb-av">{initials}</div>
          <div><div className="tb-name">{me?.name}</div><div className="tb-role">{me?.role} · Staff Panel</div></div>
          <div className="live-pill"><div className="live-dot"/>Live</div>
          <button className="lo-btn" onClick={() => setShowLogout(true)}>Logout</button>
        </div>

        <div className="pb">
          {toast && <div className="toast">{toast}</div>}

          {/* ── TODAY TAB ── */}
          {tab === "today" && (<>
            <div className="kpi-grid">
              <div className="kpi">
                <div className="kpi-l">Today's Appointments</div>
                <div className="kpi-v" style={{ color:"#c9a84c" }}>{todayList.length}</div>
                <div className="kpi-s">{todayList.filter(b=>b.status==="Pending"||b.status==="Confirmed").length} pending</div>
              </div>
              <div className="kpi">
                <div className="kpi-l">Today's Earnings</div>
                <div className="kpi-v" style={{ color:"#4fd080" }}>₹{todayRev.toLocaleString()}</div>
                <div className="kpi-s">{todayList.filter(b=>b.status==="Completed").length} completed</div>
              </div>
              <div className="kpi">
                <div className="kpi-l">Revenue This Month</div>
                <div className="kpi-v" style={{ color:"#00bfff" }}>₹{monthRev.toLocaleString()}</div>
                <div className="kpi-s">{new Date().toLocaleString("default",{month:"long"})}</div>
              </div>
              <div className="kpi">
                <div className="kpi-l">Pending</div>
                <div className="kpi-v" style={{ color:"#f5c75a" }}>{pending}</div>
                <div className="kpi-s">upcoming</div>
              </div>
            </div>

            {/* Today timeline */}
            <div className="tl-wrap">
              <div className="tl-head">
                <span className="tl-title">Today's Bookings</span>
                <span className="tl-count">{todayList.length} total</span>
              </div>
              {todayList.length === 0
                ? <div className="empty"><div className="empty-ic"><CalendarDays size={28} strokeWidth={1.5} /></div><div style={{ fontSize:13,color:"#383838" }}>No appointments today</div></div>
                : todayList.map(b => {
                    const sc = STATUS[b.status] || STATUS["Pending"];
                    const p = price(b);
                    return (
                      <div key={b.id} className="tl-item">
                        <div className="tl-time">{b.booking_time}</div>
                        <div className="tl-dot" style={{ background:sc.dot }}/>
                        <div className="tl-info">
                          <div className="tl-client">{b.full_name}</div>
                          <div className="tl-svc">{b.service}</div>
                          <div className="tl-tags">
                            <span className="tag" style={{ background:sc.bg,color:sc.color }}>{b.status}</span>
                            {b.address && <span className="tag tag-home"><Home size={10}/> Home</span>}
                            {p > 0 && <span className="tag tag-price">₹{p.toLocaleString()}</span>}
                            <span style={{ fontSize:10,color:"#484848",display:"inline-flex",alignItems:"center",gap:3 }}><Phone size={10}/> {b.phone}</span>
                          </div>
                          {b.address && <div style={{ fontSize:11,color:"#585858",marginTop:6,padding:"6px 10px",background:"rgba(255,255,255,0.02)",borderRadius:7,display:"flex",alignItems:"center",gap:4 }}><MapPin size={11}/> {b.address}</div>}
                        </div>
                        {(b.status === "Pending" || b.status === "Confirmed") && (
                          <div className="tl-actions">
                            <button className="btn b-done" onClick={()=>updateStatus(b.id,"Completed")} style={{display:"inline-flex",alignItems:"center",justifyContent:"center"}}><Check size={13}/></button>
                            <button className="btn b-confirm" onClick={()=>updateStatus(b.id,"Confirmed")}>OK</button>
                            <button className="btn b-wa" onClick={()=>sendWA(b)}>WA</button>
                          </div>
                        )}
                      </div>
                    );
                  })
              }
            </div>

            {/* Upcoming preview */}
            {upcomingAll.filter(b=>b.booking_date > today).length > 0 && (
              <div className="tl-wrap">
                <div className="tl-head">
                  <span className="tl-title">Upcoming</span>
                  <span className="tl-count" style={{ cursor:"pointer", color:"#c9a84c" }} onClick={()=>setTab("schedule")}>View All →</span>
                </div>
                {upcomingAll.filter(b=>b.booking_date > today).slice(0,3).map(b => {
                  const sc = STATUS[b.status] || STATUS["Pending"];
                  const p = price(b);
                  return (
                    <div key={b.id} className="tl-item">
                      <div className="tl-time" style={{ fontSize:11, color:"#686868" }}>{b.booking_date === tomorrow ? "Tomorrow" : b.booking_date}<br/>{b.booking_time}</div>
                      <div className="tl-dot" style={{ background:sc.dot }}/>
                      <div className="tl-info">
                        <div className="tl-client">{b.full_name}</div>
                        <div className="tl-svc">{b.service}</div>
                        <div className="tl-tags">
                          {p > 0 && <span className="tag tag-price">₹{p.toLocaleString()}</span>}
                          {b.address && <span className="tag tag-home"><Home size={10}/></span>}
                        </div>
                      </div>
                      <button className="btn b-wa" style={{ flexShrink:0 }} onClick={()=>sendWA(b)}>WA</button>
                    </div>
                  );
                })}
              </div>
            )}
          </>)}

          {/* ── SCHEDULE TAB ── */}
          {tab === "schedule" && (<>
            {groupedByDate.length === 0
              ? <div className="empty"><div className="empty-ic"><Calendar size={28} strokeWidth={1.5} /></div><div style={{ fontSize:13,color:"#383838" }}>No Bookings yet</div></div>
              : groupedByDate.map(([date, list]) => (
                <div key={date} className="sc-day">
                  <div className="sc-day-head">
                    {formatDate(date)}
                    <span style={{ background:"rgba(201,168,76,0.1)",color:"#c9a84c",borderRadius:20,padding:"2px 9px",fontSize:10,fontWeight:700 }}>{list.length}</span>
                  </div>
                  {list.map(b => {
                    const sc = STATUS[b.status] || STATUS["Pending"];
                    const p = price(b);
                    return (
                      <div key={b.id} className="appt-card">
                        <div className="appt-av">{(b.full_name||"?")[0].toUpperCase()}</div>
                        <div className="appt-body">
                          <div className="appt-name">{b.full_name}</div>
                          <div className="appt-svc">{b.service}</div>
                          <div className="appt-meta">
                            <span className="appt-time">{b.booking_time}</span>
                            <span style={{ fontSize:10,color:"#484848",display:"inline-flex",alignItems:"center",gap:3 }}><Phone size={10}/> {b.phone}</span>
                            {b.address && <span className="tag tag-home" style={{ padding:"2px 7px",fontSize:9,display:"inline-flex",alignItems:"center",gap:3 }}><Home size={9}/> Home</span>}
                          </div>
                          {b.address && <div style={{ fontSize:11,color:"#585858",marginTop:6,padding:"5px 9px",background:"rgba(255,255,255,0.02)",borderRadius:7,display:"flex",alignItems:"center",gap:4 }}><MapPin size={11}/> {b.address}</div>}
                          {(b.status==="Pending"||b.status==="Confirmed") && (
                            <div style={{ display:"flex",gap:6,marginTop:10 }}>
                              <button className="btn b-done" onClick={()=>updateStatus(b.id,"Completed")} style={{display:"inline-flex",alignItems:"center",gap:4}}><Check size={13}/>Done</button>
                              <button className="btn b-confirm" onClick={()=>updateStatus(b.id,"Confirmed")}>Confirm</button>
                              <button className="btn b-wa" onClick={()=>sendWA(b)}>WhatsApp</button>
                              <button className="btn b-cancel" onClick={()=>updateStatus(b.id,"Cancelled")}>Cancel</button>
                            </div>
                          )}
                        </div>
                        <div className="appt-right">
                          <span className="sbadge" style={{ background:sc.bg,color:sc.color }}>{b.status}</span>
                          {p > 0 && <span className="appt-price">₹{p.toLocaleString()}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            }
          </>)}

          {/* ── REVENUE TAB ── */}
          {tab === "revenue" && (<>
            <div className="rev-kpi">
              {[
                { lbl:"Total Earnings",   val:`₹${totalRev.toLocaleString()}`,  color:"#4fd080",  sub:`${completed} completed` },
                { lbl:"Revenue This Month",      val:`₹${monthRev.toLocaleString()}`,  color:"#00bfff",  sub:new Date().toLocaleString("default",{month:"long"}) },
                { lbl:"Today",            val:`₹${todayRev.toLocaleString()}`,  color:"#c9a84c",  sub:`Today ${todayList.filter(b=>b.status==="Completed").length} done` },
                { lbl:"Total Clients",  val:new Set(bookings.map(b=>b.phone)).size, color:"#e879f9", sub:"unique numbers" },
              ].map((k,i) => (
                <div key={i} className="rev-card">
                  <div className="rev-lbl">{k.lbl}</div>
                  <div className="rev-val" style={{ color:k.color }}>{k.val}</div>
                  <div className="rev-sub">{k.sub}</div>
                </div>
              ))}
            </div>

            {/* Monthly trend */}
            <div className="tl-wrap" style={{ marginBottom:14 }}>
              <div className="tl-head"><span className="tl-title">Monthly Revenue</span></div>
              <div style={{ padding:"14px 16px" }}>
                {monthlyData.map((m,i) => (
                  <div key={i} style={{ display:"flex",alignItems:"center",gap:10,marginBottom:10 }}>
                    <span style={{ fontSize:11,color:"#484848",minWidth:28 }}>{m.label}</span>
                    <div style={{ flex:1,height:6,background:"rgba(255,255,255,0.06)",borderRadius:3,overflow:"hidden" }}>
                      <div style={{ height:"100%",width:`${(m.rev/maxMonthRev)*100}%`,background:"linear-gradient(90deg,#c9a84c,#f5d98b)",borderRadius:3,transition:"width 1s ease" }}/>
                    </div>
                    <span style={{ fontSize:11,color:"#4fd080",fontWeight:700,minWidth:60,textAlign:"right" }}>₹{m.rev.toLocaleString()}</span>
                    <span style={{ fontSize:10,color:"#484848",minWidth:20 }}>{m.cnt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Service breakdown */}
            <div className="tl-wrap">
              <div className="tl-head"><span className="tl-title">Service-wise Revenue</span></div>
              <div style={{ padding:"10px 16px" }}>
                {svcRevenue.length === 0
                  ? <div style={{ color:"#2a2a2a",fontSize:12,padding:"16px 0" }}>No bookings till now
                  </div>
                  : svcRevenue.map(([svc, rev]) => (
                    <div key={svc} className="svc-row">
                      <span style={{ fontSize:11,color:"#bbb",flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",paddingRight:8 }}>{svc}</span>
                      <div className="svc-bar-wrap"><div className="svc-bar" style={{ width:`${(rev/maxSvcRev)*100}%` }}/></div>
                      <span style={{ fontSize:11,color:"#4fd080",fontWeight:700,flexShrink:0 }}>₹{rev.toLocaleString()}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          </>)}

          {/* ── PROFILE TAB ── */}
          {tab === "profile" && me && (<>
            <div className="prof-hero">
              <div className="prof-av">{initials}</div>
              <div>
                <div className="prof-name">{me.name}</div>
                <div className="prof-role">{me.role}</div>
                <div className="prof-email">{me.email}</div>
              </div>
            </div>

            <div className="stat-grid">
              {[
                { v: bookings.length,  l:"Total Bookings", c:"#c9a84c" },
                { v: completed,        l:"Completed",       c:"#4fd080" },
                { v: `₹${totalRev.toLocaleString()}`, l:"Total Revenue", c:"#e879f9" },
              ].map((s,i) => (
                <div key={i} className="stat-box">
                  <div className="stat-v" style={{ color:s.c }}>{s.v}</div>
                  <div className="stat-l">{s.l}</div>
                </div>
              ))}
            </div>

            {[
              { k:"Name",          v: me.name },
              { k:"Email",         v: me.email },
              { k:"Role",          v: me.role },
              { k:"Status",        v: me.active ? "Active" : "Inactive" },
              { k:"Today",           v: `${todayList.length} appointments` },
              { k:"Revenue This Month",     v: `₹${monthRev.toLocaleString()} revenue` },
              { k:"Most Popular Service", v: svcRevenue[0]?.[0] || "—" },
              { k:"Completion %",  v: bookings.length ? `${Math.round(completed/bookings.length*100)}%` : "—" },
            ].map((r,i) => (
              <div key={i} className="info-row">
                <span className="info-k">{r.k}</span>
                <span className="info-v">{r.v}</span>
              </div>
            ))}
          </>)}
        </div>

        {/* BOTTOM NAV */}
        <div className="bnav">
          {([
            ["today",    <CalendarDays size={15} />, "Today"],
            ["schedule", <Calendar size={15} />,     "Schedule"],
            ["revenue",  <TrendingUp size={15} />,   "Revenue"],
            ["profile",  <User size={15} />,         "Profile"],
          ] as [Tab, React.ReactNode, string][]).map(([t,ic,lb]) => (
            <button key={t} className={`bni ${tab===t?"on":""}`} onClick={()=>setTab(t)}>
              <span className="bni-ic">{ic}</span>
              <span className="bni-lb">{lb}</span>
            </button>
          ))}
        </div>

      </div>

      {showLogout && (
        <>
          <style>{`
            .sf-overlay{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.6);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;animation:sfFade 0.2s ease;}
            @keyframes sfFade{from{opacity:0}to{opacity:1}}
            .sf-box{background:rgba(18,14,10,0.92);backdrop-filter:blur(40px) saturate(180%);border:1px solid rgba(255,255,255,0.1);border-top:1px solid rgba(255,255,255,0.18);border-radius:20px;padding:32px 28px 24px;width:100%;max-width:340px;margin:16px;box-shadow:inset 0 1.5px 0 rgba(255,255,255,0.12),0 32px 64px rgba(0,0,0,0.6);animation:sfUp 0.25s cubic-bezier(0.22,1,0.36,1);}
            @keyframes sfUp{from{opacity:0;transform:translateY(16px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
            .sf-icon{width:44px;height:44px;border-radius:12px;background:rgba(245,101,101,0.1);border:1px solid rgba(245,101,101,0.2);display:flex;align-items:center;justify-content:center;font-size:18px;margin-bottom:16px;}
            .sf-title{font-size:16px;font-weight:700;color:#fff;margin-bottom:8px;font-family:'Inter',sans-serif;}
            .sf-msg{font-size:13px;color:rgba(255,255,255,0.45);line-height:1.6;margin-bottom:24px;}
            .sf-btns{display:flex;gap:10px;}
            .sf-keep{flex:1;padding:11px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:rgba(255,255,255,0.6);font-size:13px;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;transition:all 0.2s;}
            .sf-keep:hover{background:rgba(255,255,255,0.09);color:#fff;}
            .sf-out{flex:1;padding:11px;background:rgba(245,101,101,0.15);border:1px solid rgba(245,101,101,0.3);border-radius:10px;color:#f87171;font-size:13px;font-weight:700;cursor:pointer;font-family:'Inter',sans-serif;transition:all 0.2s;}
            .sf-out:hover{background:rgba(245,101,101,0.25);}
          `}</style>
          <div className="sf-overlay" onClick={() => setShowLogout(false)}>
            <div className="sf-box" onClick={e => e.stopPropagation()}>
              <div className="sf-icon"><LogOut size={24} /></div>
              <div className="sf-title">Logout</div>
              <div className="sf-msg">Are you sure you want to log out from the Staff Panel?</div>
              <div className="sf-btns">
                <button className="sf-keep" onClick={() => setShowLogout(false)}>Stay</button>
                <button className="sf-out" onClick={async () => { setShowLogout(false); document.cookie="bg_role=;path=/;max-age=0;SameSite=Strict"; await supabase.auth.signOut(); router.push("/login"); }}>Logout</button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
