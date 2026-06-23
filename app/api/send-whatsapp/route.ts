import { NextRequest, NextResponse } from "next/server";

const OWNER_PHONE = process.env.OWNER_WHATSAPP_PHONE ?? "919625928495";
const API_KEY     = process.env.CALLMEBOT_API_KEY ?? "";

function formatTime(t: string) {
  if (!t) return t;
  const [hStr, mStr] = t.split(":");
  const h = parseInt(hStr, 10);
  const m = mStr ?? "00";
  const ampm = h >= 12 ? "PM" : "AM";
  const h12  = h % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

function formatDate(d: string) {
  if (!d) return d;
  return new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function buildMessage(b: {
  id?: number | string;
  full_name: string;
  phone: string;
  service: string;
  booking_date: string;
  booking_time: string;
  is_home_service: boolean;
  address?: string | null;
  notes?: string | null;
}) {
  const bookingId = b.id ? `BG-${String(b.id).padStart(5, "0")}` : "—";
  const type      = b.is_home_service ? "Home Service" : "At Salon";

  const lines = [
    "🔔 *NEW BOOKING — Bella & Guy*",
    "━━━━━━━━━━━━━━━━━━━━",
    `📋 *Booking ID:* ${bookingId}`,
    `👤 *Name:* ${b.full_name}`,
    `📱 *Phone:* ${b.phone}`,
    `✂️ *Service:* ${b.service}`,
    `📅 *Date:* ${formatDate(b.booking_date)}`,
    `⏰ *Time:* ${formatTime(b.booking_time)}`,
    `📍 *Type:* ${type}`,
  ];

  if (b.is_home_service && b.address) {
    lines.push(`🗺️ *Address:* ${b.address}`);
  }

  if (b.notes) {
    lines.push(`📝 *Note:* ${b.notes}`);
  }

  lines.push("━━━━━━━━━━━━━━━━━━━━");
  lines.push("Reply on WhatsApp to confirm.");

  return lines.join("\n");
}

export async function POST(req: NextRequest) {
  try {
    const { booking } = await req.json();
    if (!booking) {
      return NextResponse.json({ ok: false, error: "No booking data" }, { status: 400 });
    }

    if (!API_KEY) {
      console.warn("[send-whatsapp] CALLMEBOT_API_KEY not set — skipping WhatsApp notification");
      return NextResponse.json({ ok: false, error: "CALLMEBOT_API_KEY not configured" }, { status: 200 });
    }

    const message     = buildMessage(booking);
    const encodedMsg  = encodeURIComponent(message);
    const url         = `https://api.callmebot.com/whatsapp.php?phone=${OWNER_PHONE}&text=${encodedMsg}&apikey=${API_KEY}`;

    console.log("[send-whatsapp] Sending notification for booking:", booking.id);

    const res  = await fetch(url, { method: "GET" });
    const text = await res.text();

    console.log("[send-whatsapp] CallMeBot response:", res.status, text.slice(0, 120));

    if (!res.ok) {
      return NextResponse.json({ ok: false, error: text }, { status: 502 });
    }

    return NextResponse.json({ ok: true, response: text });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[send-whatsapp] ERROR:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
