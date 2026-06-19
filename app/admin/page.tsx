"use client";

import { useEffect, useState, useMemo } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { allCategories } from "../../lib/servicesData";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

// ── Types ──────────────────────────────────────────────
type Tab = "dashboard" | "bookings" | "revenue" | "staff" | "contacts";
type FilterType = "all" | "today" | "week" | "month";

type Booking = {
  id: number; full_name: string; phone: string; service: string;
  booking_date: string; booking_time: string;
  address?: string; status: string; staff?: string;
  is_home_service?: boolean; created_at?: string;
};
type Contact = { id: number; name: string; phone: string; message: string; };
type StaffRow = { id: number; name: string; email?: string; role: string; active: boolean; };

// ── Service price lookup ───────────────────────────────
const SERVICE_PRICES: Record<string, number> = {};
allCategories.forEach(cat => {
  cat.services.forEach(s => {
    SERVICE_PRICES[`${s.name} — ${cat.label}`] = s.price;
    SERVICE_PRICES[s.name] = s.price; // backwards compat
  });
});

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  Pending:   { bg: "rgba(245,199,90,0.14)",  text: "#f5c75a", dot: "#f5c75a" },
  Confirmed: { bg: "rgba(90,180,245,0.14)",  text: "#5ab4f5", dot: "#5ab4f5" },
  Completed: { bg: "rgba(79,208,128,0.14)",  text: "#4fd080", dot: "#4fd080" },
  Cancelled: { bg: "rgba(245,101,101,0.14)", text: "#f56565", dot: "#f56565" },
};

// ── CSS ────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
* { box-sizing: border-box; }
.adm { background: #07070f; min-height: 100vh; font-family: 'Inter', sans-serif; color: #d0d0d0; display: flex; }

/* SIDEBAR */
.sb { width: 224px; min-width: 224px; background: rgba(8,8,18,0.98); border-right: 1px solid rgba(201,168,76,0.1); display: flex; flex-direction: column; height: 100vh; position: sticky; top: 0; z-index: 100; }
.sb-logo { padding: 22px 18px 18px; border-bottom: 1px solid rgba(255,255,255,0.04); display: flex; align-items: center; gap: 11px; }
.sb-icon { width: 42px; height: 42px; border-radius: 12px; background: linear-gradient(135deg,#c9a84c,#f5d98b); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px; color: #1a1000; box-shadow: 0 4px 16px rgba(201,168,76,0.3); flex-shrink: 0; }
.sb-title { font-size: 14px; font-weight: 700; color: #fff; }
.sb-sub { font-size: 10px; color: #3a3a3a; margin-top: 2px; }
.sb-nav { flex: 1; padding: 14px 10px; display: flex; flex-direction: column; gap: 3px; overflow-y: auto; }
.nav-label { font-size: 9px; font-weight: 700; color: #2a2a2a; letter-spacing: 0.12em; text-transform: uppercase; padding: 10px 10px 6px; }
.ni { display: flex; align-items: center; gap: 9px; padding: 10px 12px; border-radius: 10px; border: none; width: 100%; cursor: pointer; font-size: 13px; font-family: 'Inter', sans-serif; text-align: left; transition: all 0.15s; color: #484848; background: transparent; }
.ni.on { background: rgba(201,168,76,0.1); color: #c9a84c; }
.ni:hover:not(.on) { background: rgba(255,255,255,0.04); color: #888; }
.ni-badge { margin-left: auto; background: rgba(201,168,76,0.12); color: #c9a84c; border-radius: 20px; padding: 2px 7px; font-size: 10px; font-weight: 600; }
.ni.on .ni-badge { background: #c9a84c; color: #0f0f12; }
.sb-foot { padding: 10px 10px 18px; display: flex; flex-direction: column; gap: 5px; border-top: 1px solid rgba(255,255,255,0.04); margin-top: auto; }
.sb-btn { width: 100%; padding: 9px 12px; border-radius: 9px; cursor: pointer; font-size: 12px; font-family: 'Inter', sans-serif; font-weight: 500; transition: all 0.15s; display: flex; align-items: center; gap: 8px; }
.sb-sec { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); color: #666; }
.sb-sec:hover { background: rgba(255,255,255,0.06); color: #bbb; }
.sb-red { background: rgba(245,101,101,0.06); border: 1px solid rgba(245,101,101,0.15); color: #f56565; }
.sb-red:hover { background: rgba(245,101,101,0.12); }

/* MAIN */
.mc { flex: 1; overflow-y: auto; min-width: 0; }
.topbar { display: flex; justify-content: space-between; align-items: center; padding: 18px 28px; border-bottom: 1px solid rgba(255,255,255,0.04); background: rgba(7,7,15,0.92); backdrop-filter: blur(12px); position: sticky; top: 0; z-index: 50; }
.tb-title { font-size: 20px; font-weight: 700; color: #fff; }
.tb-sub { font-size: 11px; color: #383838; margin-top: 2px; }
.live-pill { display: flex; align-items: center; gap: 6px; background: rgba(79,208,128,0.08); border: 1px solid rgba(79,208,128,0.18); border-radius: 20px; padding: 5px 12px; font-size: 11px; color: #4fd080; font-weight: 500; }
.live-dot { width: 7px; height: 7px; border-radius: 50%; background: #4fd080; animation: lp 1.6s ease-in-out infinite; }
@keyframes lp { 0%,100%{box-shadow:0 0 0 0 rgba(79,208,128,0.4);}50%{box-shadow:0 0 0 5px rgba(79,208,128,0);} }

/* PAGE */
.pb { padding: 24px 28px; }

/* TOAST */
.toast { display: flex; align-items: center; gap: 10px; background: rgba(79,208,128,0.1); border: 1px solid rgba(79,208,128,0.22); border-radius: 12px; padding: 12px 16px; margin-bottom: 18px; font-size: 13px; color: #4fd080; animation: sdn 0.4s cubic-bezier(0.22,1,0.36,1); }
@keyframes sdn { from{opacity:0;transform:translateY(-10px);}to{opacity:1;transform:translateY(0);} }

/* STATS GRID */
.sg { display: grid; grid-template-columns: repeat(auto-fill, minmax(136px,1fr)); gap: 10px; margin-bottom: 22px; }
.sc { background: rgba(14,14,22,0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 14px; padding: 15px; transition: all 0.2s; animation: sfi 0.5s ease both; }
.sc:hover { border-color: rgba(201,168,76,0.2); transform: translateY(-2px); }
@keyframes sfi { from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);} }
.sc-lbl { font-size: 9px; font-weight: 700; color: #363636; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 7px; }
.sc-val { font-size: 24px; font-weight: 700; line-height: 1; }
.sc-sub { font-size: 10px; color: #383838; margin-top: 5px; }

/* SECTION CARD */
.card { background: rgba(12,12,20,0.97); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 18px 20px; margin-bottom: 16px; }
.card-title { font-size: 13px; font-weight: 600; color: #c9a84c; margin-bottom: 14px; display: flex; align-items: center; gap: 7px; }

/* TABLE */
.tw { background: rgba(12,12,20,0.97); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; overflow: auto; }
table { width: 100%; border-collapse: collapse; }
th { padding: 11px 14px; text-align: left; font-size: 9px; font-weight: 700; color: #363636; text-transform: uppercase; letter-spacing: 0.08em; background: rgba(7,7,15,0.8); border-bottom: 1px solid rgba(255,255,255,0.04); white-space: nowrap; }
tr { border-bottom: 1px solid rgba(255,255,255,0.03); transition: background 0.1s; }
tr:hover { background: rgba(255,255,255,0.02); }
tr:last-child { border-bottom: none; }
td { padding: 11px 14px; font-size: 12px; color: #bbb; vertical-align: middle; }
.nc { display: flex; align-items: center; gap: 9px; }
.av { width: 30px; height: 30px; border-radius: 9px; background: rgba(201,168,76,0.1); color: #c9a84c; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
.sw { position: relative; display: inline-flex; align-items: center; }
.sd { position: absolute; left: 8px; width: 6px; height: 6px; border-radius: 50%; pointer-events: none; }
.ss { appearance: none; border: none; outline: none; border-radius: 20px; padding: 5px 10px 5px 22px; font-size: 11px; font-weight: 600; font-family: 'Inter', sans-serif; cursor: pointer; }
.stf { background: rgba(255,255,255,0.04); color: #bbb; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 5px 9px; font-size: 11px; font-family: 'Inter', sans-serif; outline: none; cursor: pointer; }
.empty td { padding: 44px; text-align: center; color: #2a2a2a; font-size: 13px; }
.aw { display: flex; gap: 5px; flex-wrap: wrap; }
.btn { border-radius: 8px; padding: 5px 11px; cursor: pointer; font-size: 11px; font-weight: 500; font-family: 'Inter', sans-serif; border: 1px solid; transition: all 0.15s; white-space: nowrap; }
.btn:hover { opacity: 0.85; transform: translateY(-1px); }
.bv { background: rgba(90,180,245,0.1); color: #5ab4f5; border-color: rgba(90,180,245,0.2); }
.bc { background: rgba(79,208,128,0.1); color: #4fd080; border-color: rgba(79,208,128,0.2); }
.bx { background: rgba(245,101,101,0.1); color: #f56565; border-color: rgba(245,101,101,0.2); }
.bw { background: rgba(37,211,102,0.1); color: #25d366; border-color: rgba(37,211,102,0.2); }
.br { background: rgba(90,130,245,0.1); color: #7ba8ff; border-color: rgba(90,130,245,0.2); }
.bd { background: rgba(255,80,80,0.07); color: #f56565; border-color: rgba(255,80,80,0.12); }
.bg { background: rgba(201,168,76,0.1); color: #c9a84c; border-color: rgba(201,168,76,0.25); }

/* FILTER */
.fb { display: flex; gap: 10px; align-items: center; margin-bottom: 14px; flex-wrap: wrap; }
.si { flex: 1; min-width: 180px; position: relative; }
.si-ic { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); font-size: 12px; opacity: 0.25; pointer-events: none; }
.si input { width: 100%; padding: 9px 10px 9px 32px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 9px; color: #fff; font-size: 13px; font-family: 'Inter', sans-serif; outline: none; transition: border-color 0.2s; }
.si input:focus { border-color: rgba(201,168,76,0.35); }
.si input::placeholder { color: #333; }
.fb-btns { display: flex; gap: 5px; flex-wrap: wrap; }
.fb-btn { padding: 8px 14px; border-radius: 9px; border: 1px solid rgba(255,255,255,0.07); background: rgba(255,255,255,0.03); color: #444; font-size: 12px; font-family: 'Inter', sans-serif; cursor: pointer; font-weight: 500; transition: all 0.15s; }
.fb-btn:hover { background: rgba(255,255,255,0.06); color: #888; }
.fb-btn.on { background: #c9a84c; color: #0f0f12; border-color: #c9a84c; font-weight: 600; }

/* REVENUE TAB */
.kpi-row { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px,1fr)); gap: 12px; margin-bottom: 22px; }
.kpi { background: rgba(12,12,20,0.97); border: 1px solid rgba(255,255,255,0.05); border-radius: 14px; padding: 18px 16px; }
.kpi-lbl { font-size: 10px; font-weight: 600; color: #383838; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
.kpi-val { font-size: 26px; font-weight: 700; }
.kpi-sub { font-size: 11px; color: #383838; margin-top: 5px; }

/* STAFF CARDS */
.staff-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px,1fr)); gap: 14px; margin-bottom: 20px; }
.staff-card { background: rgba(12,12,20,0.97); border: 1px solid rgba(255,255,255,0.05); border-radius: 14px; padding: 20px; transition: all 0.25s; }
.staff-card:hover { border-color: rgba(201,168,76,0.2); transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.3); }
.staff-av { width: 48px; height: 48px; border-radius: 14px; background: linear-gradient(135deg,rgba(201,168,76,0.2),rgba(201,168,76,0.08)); color: #c9a84c; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; margin-bottom: 12px; border: 1px solid rgba(201,168,76,0.15); }
.staff-name { font-size: 15px; font-weight: 600; color: #fff; margin-bottom: 3px; }
.staff-role { font-size: 10px; color: #484848; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 14px; }
.staff-stat { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 12px; }
.staff-stat:last-child { border-bottom: none; }
.staff-stat-k { color: #484848; }
.staff-stat-v { font-weight: 600; }

/* CALENDAR */
.react-calendar { background: transparent !important; border: none !important; color: #888 !important; font-family: 'Inter', sans-serif !important; width: 100% !important; }
.react-calendar__tile { color: #888 !important; border-radius: 7px !important; font-size: 12px !important; }
.react-calendar__tile--active { background: #c9a84c !important; color: #0f0f12 !important; }
.react-calendar__tile:hover { background: rgba(201,168,76,0.15) !important; }
.react-calendar__navigation button { color: #c9a84c !important; background: transparent !important; font-size: 13px !important; }
.react-calendar__month-view__weekdays__weekday { color: #3a3a3a !important; font-size: 10px; }
.react-calendar__tile--weekend { color: #f56565 !important; }
.react-calendar__tile--hasActive { background: rgba(201,168,76,0.2) !important; }

/* MODAL */
.mb { position: fixed; inset: 0; background: rgba(0,0,0,0.78); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 9999; animation: mbi 0.2s ease; overflow-y: auto; padding: 20px; }
@keyframes mbi { from{opacity:0;}to{opacity:1;} }
.mbox { background: #0e0e1a; border: 1px solid rgba(201,168,76,0.15); border-radius: 20px; padding: 26px; width: 520px; max-width: 100%; animation: msl 0.3s cubic-bezier(0.22,1,0.36,1); }
@keyframes msl { from{opacity:0;transform:translateY(20px) scale(0.97);}to{opacity:1;transform:translateY(0) scale(1);} }
.mt { font-size: 16px; font-weight: 700; color: #c9a84c; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
.mr { display: flex; gap: 6px; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 13px; }
.mr:last-of-type { border-bottom: none; }
.mk { color: #444; min-width: 110px; font-weight: 500; }
.mv { color: #ddd; }
.hb { margin: 14px 0; background: rgba(201,168,76,0.05); border: 1px solid rgba(201,168,76,0.12); border-radius: 12px; padding: 14px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.hs { font-size: 12px; color: #555; margin-bottom: 3px; }
.hv { font-size: 18px; font-weight: 700; }
.ma { display: flex; gap: 8px; margin-top: 18px; flex-wrap: wrap; }

/* LOADING */
.ls { min-height: 100vh; background: #07070f; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; font-family: 'Inter', sans-serif; }
.lsp { width: 34px; height: 34px; border-radius: 50%; border: 3px solid rgba(201,168,76,0.18); border-top-color: #c9a84c; animation: sp 0.8s linear infinite; }
@keyframes sp { to{transform:rotate(360deg);} }

/* SCROLLBAR */
::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.07); border-radius: 3px; }

/* CHART TOOLTIPS */
.recharts-default-tooltip { background: #0e0e1a !important; border: 1px solid rgba(201,168,76,0.2) !important; border-radius: 8px !important; font-size: 12px; }

/* REVENUE BARS */
.rev-row { display: flex; justify-content: space-between; align-items: center; padding: 9px 0; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 13px; }
.rev-row:last-child { border-bottom: none; }
.rev-bar-wrap { flex: 1; margin: 0 16px; height: 4px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden; }
.rev-bar { height: 100%; background: linear-gradient(90deg,#c9a84c,#f5d98b); border-radius: 2px; transition: width 1s cubic-bezier(0.22,1,0.36,1); }
.tomorrow-box { background: rgba(245,199,90,0.06); border: 1px solid rgba(245,199,90,0.2); border-radius: 12px; padding: 14px 18px; margin-bottom: 18px; }
`;

export default function AdminPage() {
  const router = useRouter();
  const [bookings, setBookings]   = useState<Booking[]>([]);
  const [contacts, setContacts]   = useState<Contact[]>([]);
  const [staffs, setStaffs]       = useState<StaffRow[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [search, setSearch]       = useState("");
  const [filter, setFilter]       = useState<FilterType>("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedDate, setSelectedDate]       = useState<Date>(new Date());
  const [notification, setNotification] = useState("");
  const [loading, setLoading]     = useState(true);
  const [currentStaff, setCurrentStaff] = useState<StaffRow | null>(null);
  const isAdmin = !currentStaff || currentStaff.role === "admin";

  // ── Fetch ──────────────────────────────────────────
  useEffect(() => { Notification.requestPermission(); }, []);

  useEffect(() => { init(); }, []);

  useEffect(() => {
    const ch = supabase.channel("appts")
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, payload => {
        fetchBookings();
        if (payload.eventType === "INSERT") {
          const n = payload.new as Booking;
          setNotification(`🔔 New: ${n.full_name} — ${n.service}`);
          if (Notification.permission === "granted")
            new Notification("New Booking", { body: `${n.full_name} booked ${n.service}` });
          setTimeout(() => setNotification(""), 5000);
        }
      }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  async function init() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push("/login"); return; }
    const email = session.user.email?.trim().toLowerCase() ?? "";
    const { data: sd } = await supabase.from("staff").select("*").ilike("email", email);
    const staff = sd?.[0] ?? null;
    // Block customers — only staff table members can access admin panel
    if (!staff) { await supabase.auth.signOut(); router.push("/login"); return; }
    setCurrentStaff(staff);
    await Promise.all([fetchBookings(staff), fetchContacts(), fetchStaff()]);
    setLoading(false);
  }

  async function fetchBookings(staff?: StaffRow | null) {
    let q = supabase.from("appointments").select("*").order("id", { ascending: false });
    if (staff && staff.role === "staff") q = q.eq("staff", staff.name);
    const { data } = await q;
    if (data) setBookings(data);
  }

  async function fetchContacts() {
    const { data } = await supabase.from("contacts").select("*").order("id", { ascending: false });
    if (data) setContacts(data);
  }

  async function fetchStaff() {
    const { data } = await supabase.from("staff").select("*").eq("active", true);
    if (data) setStaffs(data);
  }

  async function updateStatus(id: number, status: string) {
    await supabase.from("appointments").update({ status }).eq("id", id);
    fetchBookings(currentStaff);
  }

  async function assignStaff(id: number, staff: string) {
    await supabase.from("appointments").update({ staff }).eq("id", id);
    fetchBookings(currentStaff);
  }

  async function deleteBooking(id: number) {
    if (!confirm("Delete this booking permanently?")) return;
    await supabase.from("appointments").delete().eq("id", id);
    fetchBookings(currentStaff);
  }

  async function deleteContact(id: number) {
    if (!confirm("Delete this message?")) return;
    await supabase.from("contacts").delete().eq("id", id);
    fetchContacts();
  }

  // ── Computed values ───────────────────────────────
  const today       = new Date().toISOString().split("T")[0];
  const thisMonth   = new Date().toISOString().slice(0, 7);
  const tomorrow    = (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split("T")[0]; })();

  const price = (b: Booking) => SERVICE_PRICES[b.service] || 0;

  const totalRevenue  = useMemo(() => bookings.filter(b => b.status !== "Cancelled").reduce((s, b) => s + price(b), 0), [bookings]);
  const monthRevenue  = useMemo(() => bookings.filter(b => b.status !== "Cancelled" && b.booking_date?.slice(0,7) === thisMonth).reduce((s,b) => s + price(b), 0), [bookings]);
  const todayRevenue  = useMemo(() => bookings.filter(b => b.status !== "Cancelled" && b.booking_date === today).reduce((s,b) => s + price(b), 0), [bookings]);
  const completedCnt  = bookings.filter(b => b.status === "Completed").length;
  const avgBooking    = completedCnt ? Math.round(totalRevenue / completedCnt) : 0;

  // Monthly chart data — last 12 months
  const monthlyChart = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (11 - i));
      const ym = d.toISOString().slice(0, 7);
      const label = d.toLocaleString("default", { month: "short" });
      const rev = bookings.filter(b => b.status !== "Cancelled" && b.booking_date?.slice(0,7) === ym).reduce((s,b) => s + price(b), 0);
      const cnt = bookings.filter(b => b.booking_date?.slice(0,7) === ym).length;
      return { name: label, Revenue: rev, Bookings: cnt };
    });
  }, [bookings]);

  // Service revenue breakdown
  const serviceRevenue = useMemo(() => {
    const map: Record<string,number> = {};
    bookings.filter(b => b.status !== "Cancelled").forEach(b => {
      map[b.service] = (map[b.service] || 0) + price(b);
    });
    return Object.entries(map).sort((a,b) => b[1]-a[1]).slice(0, 10);
  }, [bookings]);

  const maxServiceRev = serviceRevenue[0]?.[1] || 1;

  // Staff performance
  const staffPerformance = useMemo(() => staffs.map(s => {
    const sb = bookings.filter(b => b.staff === s.name);
    const rev = sb.filter(b => b.status !== "Cancelled").reduce((sum,b) => sum + price(b), 0);
    const done = sb.filter(b => b.status === "Completed").length;
    const top = Object.entries(sb.reduce((a,b) => { a[b.service]=(a[b.service]||0)+1; return a; }, {} as Record<string,number>)).sort((a,b)=>b[1]-a[1])[0];
    return { ...s, total: sb.length, done, revenue: rev, avg: sb.length ? Math.round(rev/sb.length) : 0, topService: top?.[0] || "—" };
  }), [staffs, bookings]);

  // Filter bookings
  const filteredBookings = useMemo(() => bookings.filter(b => {
    const q = search.toLowerCase();
    const m = (b.full_name?.toLowerCase().includes(q) || b.phone?.includes(q) || b.service?.toLowerCase().includes(q));
    if (filter === "today") return m && b.booking_date === today;
    if (filter === "week")  {
      const d = new Date(b.booking_date); const now = new Date();
      const wStart = new Date(now); wStart.setDate(now.getDate() - now.getDay());
      return m && d >= wStart;
    }
    if (filter === "month") return m && b.booking_date?.slice(0,7) === thisMonth;
    return m;
  }), [bookings, search, filter]);

  // Customer history for modal
  const custHistory = selectedBooking ? bookings.filter(b => b.phone === selectedBooking.phone) : [];
  const custSpent   = custHistory.filter(b => b.status !== "Cancelled").reduce((s,b) => s + price(b), 0);

  // Tomorrow bookings
  const tmrBookings = bookings.filter(b => b.booking_date === tomorrow);

  // ── PDF Exports ────────────────────────────────────
  function pdfAppointments() {
    const doc = new jsPDF();
    doc.setFontSize(18); doc.setTextColor(201, 168, 76);
    doc.text("Bella & Guy — Appointments Report", 14, 18);
    doc.setFontSize(10); doc.setTextColor(120, 120, 120);
    doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}  |  Total: ${filteredBookings.length}`, 14, 26);
    autoTable(doc, {
      startY: 32,
      head: [["#", "Name", "Phone", "Service", "Date", "Time", "Status", "Staff", "Type"]],
      body: filteredBookings.map((b, i) => [
        i+1, b.full_name, b.phone, b.service, b.booking_date, b.booking_time,
        b.status, b.staff || "—", b.address ? "Home" : "Salon"
      ]),
      headStyles: { fillColor: [20, 20, 30], textColor: [201, 168, 76], fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: [200, 200, 200], fillColor: [14, 14, 22] },
      alternateRowStyles: { fillColor: [18, 18, 28] },
      styles: { cellPadding: 3 },
    });
    const pg = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10); doc.setTextColor(79, 208, 128);
    doc.text(`Total Revenue (non-cancelled): ₹${totalRevenue.toLocaleString()}`, 14, pg);
    doc.save(`appointments-${today}.pdf`);
  }

  function pdfRevenue() {
    const doc = new jsPDF();
    doc.setFontSize(18); doc.setTextColor(201, 168, 76);
    doc.text("Bella & Guy — Revenue Report", 14, 18);
    doc.setFontSize(10); doc.setTextColor(120,120,120);
    doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, 14, 26);

    doc.setFontSize(11); doc.setTextColor(255,255,255);
    doc.text(`Total Revenue: ₹${totalRevenue.toLocaleString()}`, 14, 36);
    doc.text(`This Month: ₹${monthRevenue.toLocaleString()}`, 14, 44);
    doc.text(`Today: ₹${todayRevenue.toLocaleString()}`, 14, 52);
    doc.text(`Avg Booking Value: ₹${avgBooking.toLocaleString()}`, 14, 60);

    autoTable(doc, {
      startY: 68,
      head: [["Month", "Revenue (₹)", "Bookings"]],
      body: monthlyChart.map(m => [m.name, `₹${m.Revenue.toLocaleString()}`, m.Bookings]),
      headStyles: { fillColor: [20,20,30], textColor: [201,168,76], fontSize: 9 },
      bodyStyles: { fontSize: 9, textColor: [200,200,200], fillColor: [14,14,22] },
      alternateRowStyles: { fillColor: [18,18,28] },
    });

    const y2 = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12); doc.setTextColor(201,168,76);
    doc.text("Top Services by Revenue", 14, y2);
    autoTable(doc, {
      startY: y2 + 6,
      head: [["Service", "Revenue (₹)"]],
      body: serviceRevenue.map(([s, r]) => [s, `₹${r.toLocaleString()}`]),
      headStyles: { fillColor: [20,20,30], textColor: [201,168,76], fontSize: 9 },
      bodyStyles: { fontSize: 9, textColor: [200,200,200], fillColor: [14,14,22] },
      alternateRowStyles: { fillColor: [18,18,28] },
    });
    doc.save(`revenue-report-${today}.pdf`);
  }

  function pdfStaff() {
    const doc = new jsPDF();
    doc.setFontSize(18); doc.setTextColor(201,168,76);
    doc.text("Bella & Guy — Staff Performance Report", 14, 18);
    doc.setFontSize(10); doc.setTextColor(120,120,120);
    doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, 14, 26);
    autoTable(doc, {
      startY: 32,
      head: [["Staff Name", "Role", "Total Bookings", "Completed", "Revenue (₹)", "Avg/Booking", "Top Service"]],
      body: staffPerformance.map(s => [s.name, s.role, s.total, s.done, `₹${s.revenue.toLocaleString()}`, `₹${s.avg.toLocaleString()}`, s.topService]),
      headStyles: { fillColor: [20,20,30], textColor: [201,168,76], fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: [200,200,200], fillColor: [14,14,22] },
      alternateRowStyles: { fillColor: [18,18,28] },
    });
    doc.save(`staff-report-${today}.pdf`);
  }

  function csvExport() {
    const h = ["ID","Name","Phone","Service","Date","Time","Address","Status","Staff","Type","Price"];
    const rows = filteredBookings.map(b => [b.id, b.full_name, b.phone, b.service, b.booking_date, b.booking_time, b.address||"", b.status, b.staff||"", b.address?"Home":"Salon", price(b)]);
    const csv = [h,...rows].map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `bookings-${today}.csv`; a.click();
  }

  function sendWA(phone: string, msg: string) { window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`, "_blank"); }

  if (loading) return (
    <div className="ls"><style>{CSS}</style>
      <div className="lsp" />
      <div style={{ color: "#444", fontSize: 13 }}>Loading Bella & Guy Admin…</div>
    </div>
  );

  const NAV: [Tab, string, string, number][] = [
    ["dashboard", "⬛", "Dashboard", bookings.length],
    ["bookings",  "📋", "Appointments", bookings.length],
    ["revenue",   "📈", "Revenue", 0],
    ["staff",     "👥", "Staff", staffs.length],
    ["contacts",  "💬", "Messages", contacts.length],
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="adm">

        {/* SIDEBAR */}
        <aside className="sb">
          <div className="sb-logo">
            <div className="sb-icon">B&G</div>
            <div><div className="sb-title">Bella & Guy</div><div className="sb-sub">Admin Panel</div></div>
          </div>
          <nav className="sb-nav">
            <div className="nav-label">Navigation</div>
            {NAV.map(([tab, icon, label, count]) => (
              <button key={tab} className={`ni ${activeTab === tab ? "on" : ""}`} onClick={() => setActiveTab(tab)}>
                <span style={{ fontSize: 15 }}>{icon}</span>
                <span style={{ flex: 1 }}>{label}</span>
                {count > 0 && <span className="ni-badge">{count}</span>}
              </button>
            ))}
          </nav>
          {isAdmin && (
            <div className="sb-foot">
              <div className="nav-label">Export</div>
              <button className="sb-btn sb-sec" onClick={pdfAppointments}>📄 Appointments PDF</button>
              <button className="sb-btn sb-sec" onClick={pdfRevenue}>💰 Revenue PDF</button>
              <button className="sb-btn sb-sec" onClick={pdfStaff}>👥 Staff PDF</button>
              <button className="sb-btn sb-sec" onClick={csvExport}>⬇ Export CSV</button>
              <button className="sb-btn sb-red" onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }}>↩ Logout</button>
            </div>
          )}
          {!isAdmin && (
            <div className="sb-foot">
              <button className="sb-btn sb-red" onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }}>↩ Logout</button>
            </div>
          )}
        </aside>

        {/* MAIN */}
        <div className="mc">
          <div className="topbar">
            <div>
              <div className="tb-title">
                { activeTab === "dashboard" ? "Dashboard" : activeTab === "bookings" ? "Appointments" : activeTab === "revenue" ? "Revenue Analytics" : activeTab === "staff" ? "Staff Management" : "Messages" }
              </div>
              <div className="tb-sub">
                {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {currentStaff && <span style={{ fontSize: 11, color: "#484848" }}>Logged in as <strong style={{ color: "#c9a84c" }}>{currentStaff.name}</strong></span>}
              <div className="live-pill"><div className="live-dot" /> Live</div>
            </div>
          </div>

          <div className="pb">
            {notification && <div className="toast">{notification}</div>}

            {/* ── DASHBOARD TAB ── */}
            {activeTab === "dashboard" && (<>
              <div className="sg">
                {[
                  { lbl: "Total Bookings",  val: bookings.length,        color: "#c9a84c", sub: "all time" },
                  { lbl: "Today",           val: bookings.filter(b=>b.booking_date===today).length, color: "#c4a4ff", sub: `₹${todayRevenue.toLocaleString()} today` },
                  { lbl: "Pending",         val: bookings.filter(b=>b.status==="Pending").length, color: "#f5c75a", sub: "needs action" },
                  { lbl: "Confirmed",       val: bookings.filter(b=>b.status==="Confirmed").length, color: "#5ab4f5", sub: "upcoming" },
                  { lbl: "Completed",       val: completedCnt,           color: "#4fd080", sub: "served" },
                  { lbl: "Cancelled",       val: bookings.filter(b=>b.status==="Cancelled").length, color: "#f56565", sub: "" },
                  { lbl: "Total Customers", val: new Set(bookings.map(b=>b.phone)).size, color: "#f5a623", sub: "unique" },
                  { lbl: "Home Services",   val: bookings.filter(b=>b.address).length, color: "#22c55e", sub: "doorstep" },
                  { lbl: "Total Revenue",   val: `₹${totalRevenue.toLocaleString()}`, color: "#00d26a", sub: "excl. cancelled" },
                  { lbl: "This Month",      val: `₹${monthRevenue.toLocaleString()}`, color: "#00bfff", sub: new Date().toLocaleString("default",{month:"long"}) },
                  { lbl: "Avg / Booking",   val: `₹${avgBooking.toLocaleString()}`, color: "#e879f9", sub: "completed only" },
                  { lbl: "Messages",        val: contacts.length,        color: "#fb923c", sub: "from website" },
                ].map((s,i) => (
                  <div key={i} className="sc" style={{ animationDelay: `${i*0.04}s` }}>
                    <div className="sc-lbl">{s.lbl}</div>
                    <div className="sc-val" style={{ color: s.color }}>{s.val}</div>
                    {s.sub && <div className="sc-sub">{s.sub}</div>}
                  </div>
                ))}
              </div>

              {/* Tomorrow reminder */}
              {tmrBookings.length > 0 && (
                <div className="tomorrow-box" style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#f5c75a", marginBottom: 10 }}>
                    📅 {tmrBookings.length} appointment{tmrBookings.length>1?"s":""} tomorrow
                  </div>
                  <button className="btn bw" onClick={() => {
                    tmrBookings.forEach(b => sendWA(b.phone, `Hello ${b.full_name}, reminder from Bella & Guy Salon ❤️\n\nYour appointment:\n📅 ${b.booking_date} at ⏰ ${b.booking_time}\nService: ${b.service}\n\nSee you soon!`));
                  }}>Send All Reminders via WhatsApp</button>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                <div className="card">
                  <div className="card-title">🏆 Top Services</div>
                  {Object.entries(bookings.reduce((a,b) => { a[b.service]=(a[b.service]||0)+1; return a; }, {} as Record<string,number>)).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([s,c]) => (
                    <div key={s} className="rev-row">
                      <span style={{ fontSize: 12, color: "#bbb", flex: 1 }}>{s}</span>
                      <span style={{ fontSize: 11, color: "#484848", background: "rgba(255,255,255,0.04)", padding: "2px 8px", borderRadius: 20 }}>{c}×</span>
                    </div>
                  ))}
                </div>
                <div className="card">
                  <div className="card-title">📅 Today's Schedule</div>
                  {bookings.filter(b=>b.booking_date===today).length === 0
                    ? <div style={{ color: "#2a2a2a", fontSize: 13 }}>No appointments today</div>
                    : bookings.filter(b=>b.booking_date===today).map(b => (
                      <div key={b.id} style={{ display:"flex", gap:10, padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                        <div style={{ width:8,height:8,borderRadius:"50%",background:"#c9a84c",marginTop:4,flexShrink:0 }} />
                        <div>
                          <div style={{ fontSize:11,color:"#c9a84c",fontWeight:600 }}>{b.booking_time}</div>
                          <div style={{ fontSize:12,color:"#ccc" }}>{b.full_name} — {b.service}</div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>

              <div className="card">
                <div className="card-title">📈 Revenue — Last 12 Months</div>
                <div style={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyChart} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="name" tick={{ fill: "#484848", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#484848", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v>=1000?`${Math.round(v/1000)}k`:v}`} />
                      <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, "Revenue"]} contentStyle={{ background:"#0e0e1a", border:"1px solid rgba(201,168,76,0.2)", borderRadius:8, color:"#fff", fontSize:12 }} />
                      <Bar dataKey="Revenue" fill="#c9a84c" radius={[5,5,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>)}

            {/* ── BOOKINGS TAB ── */}
            {activeTab === "bookings" && (<>
              <div className="fb">
                <div className="si">
                  <span className="si-ic">🔍</span>
                  <input placeholder="Search name, phone, service…" value={search} onChange={e=>setSearch(e.target.value)} />
                </div>
                <div className="fb-btns">
                  {(["all","today","week","month"] as FilterType[]).map(f => (
                    <button key={f} className={`fb-btn ${filter===f?"on":""}`} onClick={()=>setFilter(f)}>
                      {f==="all"?"All":f==="today"?"Today":f==="week"?"This Week":"This Month"}
                    </button>
                  ))}
                </div>
                {isAdmin && <button className="btn bg" onClick={pdfAppointments}>📄 PDF</button>}
                {isAdmin && <button className="btn bg" onClick={csvExport}>⬇ CSV</button>}
              </div>

              <div className="tw">
                <table>
                  <thead><tr>
                    {["#","Client","Phone","Service","Date","Time","Type","Status","Staff","Price","Actions"].map(h=><th key={h}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {filteredBookings.length === 0
                      ? <tr className="empty"><td colSpan={11}>No bookings found</td></tr>
                      : filteredBookings.map((b, i) => {
                          const sc = STATUS_CONFIG[b.status] || STATUS_CONFIG["Pending"];
                          return (
                            <tr key={b.id}>
                              <td style={{ color: "#3a3a3a", fontSize: 11 }}>{i+1}</td>
                              <td><div className="nc"><div className="av">{(b.full_name||"?")[0].toUpperCase()}</div><span style={{ fontWeight:500,color:"#eee" }}>{b.full_name}</span></div></td>
                              <td style={{ fontFamily:"monospace",fontSize:11,color:"#484848" }}>{b.phone}</td>
                              <td style={{ maxWidth:160 }}>{b.service}</td>
                              <td style={{ color:"#c9a84c",fontFamily:"monospace",fontSize:11 }}>{b.booking_date}</td>
                              <td style={{ fontFamily:"monospace",fontSize:11 }}>{b.booking_time}</td>
                              <td><span style={{ fontSize:10,padding:"3px 8px",borderRadius:20,background: b.address?"rgba(34,197,94,0.12)":"rgba(90,130,245,0.12)",color: b.address?"#22c55e":"#7ba8ff" }}>{b.address?"Home":"Salon"}</span></td>
                              <td>
                                <div className="sw">
                                  <span className="sd" style={{ background: sc.dot }} />
                                  <select value={b.status||"Pending"} onChange={e=>updateStatus(b.id,e.target.value)} className="ss" style={{ background:sc.bg,color:sc.text }}>
                                    {Object.keys(STATUS_CONFIG).map(s=><option key={s}>{s}</option>)}
                                  </select>
                                </div>
                              </td>
                              <td>
                                {isAdmin
                                  ? <select value={b.staff||""} onChange={e=>assignStaff(b.id,e.target.value)} className="stf">
                                      <option value="">Assign</option>
                                      {staffs.length>0 ? staffs.map(s=><option key={s.id} value={s.name}>{s.name}</option>) : ["Sana","Pooja","Riya","Arjun"].map(n=><option key={n}>{n}</option>)}
                                    </select>
                                  : <span style={{ fontSize:12,color:"#bbb" }}>{b.staff||"—"}</span>
                                }
                              </td>
                              <td style={{ color:"#4fd080",fontWeight:600,fontSize:12 }}>{price(b)?`₹${price(b).toLocaleString()}`:"—"}</td>
                              <td>
                                <div className="aw">
                                  <button className="btn bv" onClick={()=>setSelectedBooking(b)}>View</button>
                                  <button className="btn bc" onClick={()=>{updateStatus(b.id,"Confirmed");sendWA(b.phone,`Hello ${b.full_name}, your appointment is confirmed ✅\n\nService: ${b.service}\n📅 ${b.booking_date} at ⏰ ${b.booking_time}\n\nBella & Guy Salon`);}}>✓ Confirm</button>
                                  <button className="btn bw" onClick={()=>sendWA(b.phone,"")}>WA</button>
                                  <button className="btn br" onClick={()=>{const nd=prompt("New date (YYYY-MM-DD)");const nt=prompt("New time (HH:MM)");if(!nd||!nt)return;supabase.from("appointments").update({booking_date:nd,booking_time:nt}).eq("id",b.id).then(()=>{fetchBookings(currentStaff);sendWA(b.phone,`Hello ${b.full_name}, your appointment has been rescheduled.\n\nNew Date: ${nd}\nNew Time: ${nt}\n\nBella & Guy Salon`);});}}>📅</button>
                                  {isAdmin && <button className="btn bd" onClick={()=>deleteBooking(b.id)}>✕</button>}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                    }
                  </tbody>
                </table>
              </div>
            </>)}

            {/* ── REVENUE TAB ── */}
            {activeTab === "revenue" && (<>
              <div className="kpi-row">
                {[
                  { lbl: "Total Revenue",    val: `₹${totalRevenue.toLocaleString()}`,   color: "#4fd080",  sub: "all time (excl. cancelled)" },
                  { lbl: "This Month",       val: `₹${monthRevenue.toLocaleString()}`,   color: "#00bfff",  sub: new Date().toLocaleString("default",{month:"long",year:"numeric"}) },
                  { lbl: "Today",            val: `₹${todayRevenue.toLocaleString()}`,   color: "#c9a84c",  sub: new Date().toLocaleDateString("en-IN") },
                  { lbl: "Avg / Booking",    val: `₹${avgBooking.toLocaleString()}`,     color: "#e879f9",  sub: `from ${completedCnt} completed` },
                  { lbl: "Total Bookings",   val: bookings.length,                        color: "#f5a623",  sub: "all time" },
                  { lbl: "Completed",        val: completedCnt,                           color: "#4fd080",  sub: `${bookings.length?Math.round(completedCnt/bookings.length*100):0}% rate` },
                ].map((k,i) => (
                  <div key={i} className="kpi">
                    <div className="kpi-lbl">{k.lbl}</div>
                    <div className="kpi-val" style={{ color: k.color }}>{k.val}</div>
                    <div className="kpi-sub">{k.sub}</div>
                  </div>
                ))}
              </div>

              <div className="card">
                <div className="card-title">📊 Monthly Revenue — Last 12 Months</div>
                <div style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyChart} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="name" tick={{ fill:"#484848",fontSize:11 }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="rev" tick={{ fill:"#484848",fontSize:10 }} axisLine={false} tickLine={false} tickFormatter={v=>`₹${v>=1000?`${Math.round(v/1000)}k`:v}`} />
                      <YAxis yAxisId="cnt" orientation="right" tick={{ fill:"#484848",fontSize:10 }} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(v:any, n:any) => [n==="Revenue"?`₹${Number(v).toLocaleString()}`:v, n]} contentStyle={{ background:"#0e0e1a",border:"1px solid rgba(201,168,76,0.2)",borderRadius:8,color:"#fff",fontSize:12 }} />
                      <Legend wrapperStyle={{ fontSize:11,color:"#484848" }} />
                      <Line yAxisId="rev" type="monotone" dataKey="Revenue" stroke="#c9a84c" strokeWidth={2} dot={{ fill:"#c9a84c",r:3 }} activeDot={{ r:5 }} />
                      <Line yAxisId="cnt" type="monotone" dataKey="Bookings" stroke="#5ab4f5" strokeWidth={2} dot={{ fill:"#5ab4f5",r:3 }} activeDot={{ r:5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:16 }}>
                <div className="card">
                  <div className="card-title">💰 Revenue by Service</div>
                  {serviceRevenue.length === 0
                    ? <div style={{ color:"#2a2a2a",fontSize:13 }}>No data yet</div>
                    : serviceRevenue.map(([s, r]) => (
                      <div key={s} className="rev-row">
                        <span style={{ fontSize:11,color:"#bbb",flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",paddingRight:8 }}>{s}</span>
                        <div className="rev-bar-wrap"><div className="rev-bar" style={{ width:`${(r/maxServiceRev)*100}%` }} /></div>
                        <span style={{ fontSize:11,color:"#4fd080",fontWeight:600,flexShrink:0 }}>₹{r.toLocaleString()}</span>
                      </div>
                    ))
                  }
                </div>

                <div className="card">
                  <div className="card-title">👩 Revenue by Staff</div>
                  {staffPerformance.length === 0
                    ? <div style={{ color:"#2a2a2a",fontSize:13 }}>No assigned bookings yet</div>
                    : staffPerformance.sort((a,b)=>b.revenue-a.revenue).map(s => (
                      <div key={s.id} className="rev-row">
                        <div>
                          <div style={{ fontSize:13,color:"#eee",fontWeight:500 }}>{s.name}</div>
                          <div style={{ fontSize:10,color:"#484848" }}>{s.total} bookings</div>
                        </div>
                        <div style={{ textAlign:"right" }}>
                          <div style={{ fontSize:13,color:"#4fd080",fontWeight:700 }}>₹{s.revenue.toLocaleString()}</div>
                          <div style={{ fontSize:10,color:"#484848" }}>avg ₹{s.avg.toLocaleString()}</div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>

              {isAdmin && (
                <div style={{ display:"flex",gap:10,flexWrap:"wrap" }}>
                  <button className="btn bg" onClick={pdfRevenue}>📄 Export Revenue PDF</button>
                  <button className="btn bg" onClick={csvExport}>⬇ Export CSV</button>
                </div>
              )}
            </>)}

            {/* ── STAFF TAB ── */}
            {activeTab === "staff" && (<>
              <div className="staff-grid">
                {staffPerformance.length === 0
                  ? <div style={{ color:"#2a2a2a",fontSize:13 }}>No active staff found. Add staff in the Supabase staff table.</div>
                  : staffPerformance.map(s => (
                    <div key={s.id} className="staff-card">
                      <div className="staff-av">{s.name[0]}</div>
                      <div className="staff-name">{s.name}</div>
                      <div className="staff-role">{s.role}</div>
                      {[
                        ["Total Bookings", s.total, "#c9a84c"],
                        ["Completed",      s.done,  "#4fd080"],
                        ["Revenue",        `₹${s.revenue.toLocaleString()}`, "#00d26a"],
                        ["Avg / Booking",  `₹${s.avg.toLocaleString()}`,     "#e879f9"],
                        ["Top Service",    s.topService, "#5ab4f5"],
                      ].map(([k,v,c]) => (
                        <div key={k as string} className="staff-stat">
                          <span className="staff-stat-k">{k}</span>
                          <span className="staff-stat-v" style={{ color: c as string }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  ))
                }
              </div>

              {/* Staff bookings table */}
              <div className="card" style={{ marginTop:4 }}>
                <div className="card-title">📋 All Staff Assignments</div>
                <div className="tw">
                  <table>
                    <thead><tr>
                      {["Client","Service","Date","Time","Status","Staff"].map(h=><th key={h}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {bookings.filter(b=>b.staff).length === 0
                        ? <tr className="empty"><td colSpan={6}>No assigned bookings yet</td></tr>
                        : bookings.filter(b=>b.staff).map(b => {
                            const sc = STATUS_CONFIG[b.status] || STATUS_CONFIG["Pending"];
                            return (
                              <tr key={b.id}>
                                <td><div className="nc"><div className="av">{(b.full_name||"?")[0].toUpperCase()}</div><span>{b.full_name}</span></div></td>
                                <td>{b.service}</td>
                                <td style={{ color:"#c9a84c",fontFamily:"monospace",fontSize:11 }}>{b.booking_date}</td>
                                <td style={{ fontFamily:"monospace",fontSize:11 }}>{b.booking_time}</td>
                                <td><div className="sw"><span className="sd" style={{ background:sc.dot }} /><span className="ss" style={{ background:sc.bg,color:sc.text,paddingLeft:22 }}>{b.status}</span></div></td>
                                <td style={{ color:"#c9a84c",fontWeight:500 }}>{b.staff}</td>
                              </tr>
                            );
                          })
                      }
                    </tbody>
                  </table>
                </div>
              </div>

              {isAdmin && (
                <div style={{ marginTop:14 }}>
                  <button className="btn bg" onClick={pdfStaff}>📄 Export Staff PDF</button>
                </div>
              )}
            </>)}

            {/* ── CONTACTS TAB ── */}
            {activeTab === "contacts" && (
              <div className="tw">
                <table>
                  <thead><tr>{["Name","Phone","Message","Actions"].map(h=><th key={h}>{h}</th>)}</tr></thead>
                  <tbody>
                    {contacts.length === 0
                      ? <tr className="empty"><td colSpan={4}>No messages yet</td></tr>
                      : contacts.map(c => (
                        <tr key={c.id}>
                          <td><div className="nc"><div className="av">{(c.name||"?")[0].toUpperCase()}</div><span style={{ fontWeight:500,color:"#eee" }}>{c.name}</span></div></td>
                          <td style={{ fontFamily:"monospace",fontSize:11,color:"#484848" }}>{c.phone}</td>
                          <td style={{ color:"#888",maxWidth:340 }}>{c.message}</td>
                          <td>
                            <div className="aw">
                              <button className="btn bw" onClick={()=>sendWA(c.phone,"")}>WhatsApp</button>
                              {isAdmin && <button className="btn bd" onClick={()=>deleteContact(c.id)}>Delete</button>}
                            </div>
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </div>

        {/* BOOKING DETAIL MODAL */}
        {selectedBooking && (
          <div className="mb" onClick={()=>setSelectedBooking(null)}>
            <div className="mbox" onClick={e=>e.stopPropagation()}>
              <div className="mt">📋 Appointment #{selectedBooking.id}
                <button onClick={()=>setSelectedBooking(null)} style={{ marginLeft:"auto",background:"none",border:"none",color:"#484848",cursor:"pointer",fontSize:18 }}>✕</button>
              </div>

              {[
                ["Client",   selectedBooking.full_name],
                ["Phone",    selectedBooking.phone],
                ["Service",  selectedBooking.service],
                ["Date",     selectedBooking.booking_date],
                ["Time",     selectedBooking.booking_time],
                ["Type",     selectedBooking.address ? "Home Service" : "Salon Visit"],
                ["Address",  selectedBooking.address || "N/A"],
                ["Status",   selectedBooking.status],
                ["Staff",    selectedBooking.staff || "Not assigned"],
                ["Price",    price(selectedBooking) ? `₹${price(selectedBooking).toLocaleString()}` : "—"],
              ].map(([k,v]) => (
                <div className="mr" key={k}>
                  <span className="mk">{k}</span>
                  <span className="mv" style={{ color: k==="Price"?"#4fd080":k==="Status"?(STATUS_CONFIG[v]?.text||"#ddd"):"#ddd" }}>{v}</span>
                </div>
              ))}

              <div className="hb">
                <div>
                  <div className="hs">Total Visits</div>
                  <div className="hv" style={{ color:"#c9a84c" }}>{custHistory.length}</div>
                </div>
                <div>
                  <div className="hs">Total Spent</div>
                  <div className="hv" style={{ color:"#4fd080" }}>₹{custSpent.toLocaleString()}</div>
                </div>
                <div>
                  <div className="hs">Last Visit</div>
                  <div style={{ fontSize:13,color:"#bbb",marginTop:3 }}>{custHistory[0]?.booking_date || "—"}</div>
                </div>
                <div>
                  <div className="hs">Fav Service</div>
                  <div style={{ fontSize:11,color:"#5ab4f5",marginTop:3 }}>
                    {Object.entries(custHistory.reduce((a,b)=>{a[b.service]=(a[b.service]||0)+1;return a;},{}as Record<string,number>)).sort((a,b)=>b[1]-a[1])[0]?.[0] || "—"}
                  </div>
                </div>
              </div>

              <div className="ma">
                <button className="btn bw" onClick={()=>sendWA(selectedBooking.phone,"")}>💬 WhatsApp</button>
                <button className="btn bc" onClick={()=>{updateStatus(selectedBooking.id,"Confirmed");sendWA(selectedBooking.phone,`Hello ${selectedBooking.full_name}, your appointment is confirmed ✅\nService: ${selectedBooking.service}\n📅 ${selectedBooking.booking_date} at ${selectedBooking.booking_time}\nBella & Guy Salon`);}}>✓ Confirm</button>
                <button className="btn bg" onClick={()=>sendWA(selectedBooking.phone, `Hello ${selectedBooking.full_name}, thank you for visiting Bella & Guy Salon ❤️\n\nWe'd love your feedback!\n⭐ Leave a review on Google:\nhttps://g.page/r/bella-guy-salon/review\n\nThank you 🙏`)}>⭐ Request Review</button>
                <button className="btn bx" onClick={()=>{updateStatus(selectedBooking.id,"Cancelled");sendWA(selectedBooking.phone,`Hello ${selectedBooking.full_name}, unfortunately we couldn't confirm your appointment.\nService: ${selectedBooking.service} on ${selectedBooking.booking_date}.\nPlease contact us for another slot.\nBella & Guy Salon`);setSelectedBooking(null);}}>Cancel</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
