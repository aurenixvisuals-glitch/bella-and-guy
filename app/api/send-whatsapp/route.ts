import { NextRequest, NextResponse } from "next/server";

const INSTANCE_ID   = process.env.ULTRAMSG_INSTANCE_ID ?? "";
const ULTRAMSG_TOKEN = process.env.ULTRAMSG_TOKEN ?? "";
const OWNER_PHONE   = process.env.OWNER_WHATSAPP_PHONE ?? "919625928495";

function fmt12h(t: string) {
  if (!t) return t;
  const [hStr, mStr] = t.split(":");
  const h = parseInt(hStr, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${mStr ?? "00"} ${ampm}`;
}

function fmtDate(d: string) {
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
  const id   = b.id ? `BG-${String(b.id).padStart(5, "0")}` : "—";
  const type = b.is_home_service ? "🏠 Home Service" : "🏛 At Salon";

  const lines = [
    "🔔 *New Booking Received*",
    "━━━━━━━━━━━━━━━━━━━━",
    `📋 *Booking ID:* ${id}`,
    `👤 *Customer Name:* ${b.full_name}`,
    `📱 *Phone Number:* +91${b.phone}`,
    `✂️ *Service:* ${b.service}`,
    `📍 *Booking Type:* ${type}`,
    `📅 *Date:* ${fmtDate(b.booking_date)}`,
    `⏰ *Time:* ${fmt12h(b.booking_time)}`,
  ];

  if (b.is_home_service && b.address) {
    lines.push(`🗺️ *Address:* ${b.address}`);
  }

  if (b.notes) {
    lines.push(`📝 *Special Note:* ${b.notes}`);
  }

  lines.push("━━━━━━━━━━━━━━━━━━━━");

  return lines.join("\n");
}

export async function POST(req: NextRequest) {
  try {
    const { booking } = await req.json();

    if (!booking) {
      return NextResponse.json({ ok: false, error: "No booking data" }, { status: 400 });
    }

    if (!INSTANCE_ID || !ULTRAMSG_TOKEN) {
      console.warn("[send-whatsapp] UltraMsg not configured — ULTRAMSG_INSTANCE_ID or ULTRAMSG_TOKEN missing");
      return NextResponse.json({ ok: false, error: "WhatsApp not configured" });
    }

    const message = buildMessage(booking);
    const to      = OWNER_PHONE.startsWith("+") ? OWNER_PHONE : `+${OWNER_PHONE}`;
    const url     = `https://api.ultramsg.com/${INSTANCE_ID}/messages/chat`;

    console.log(`[send-whatsapp] Sending to ${to} via UltraMsg instance ${INSTANCE_ID}`);

    const body = new URLSearchParams({
      token:    ULTRAMSG_TOKEN,
      to,
      body:     message,
      priority: "10",
    });

    const res  = await fetch(url, {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:    body.toString(),
    });

    const data = await res.json().catch(() => ({}));
    console.log("[send-whatsapp] UltraMsg response:", res.status, JSON.stringify(data));

    if (!res.ok || data?.error) {
      return NextResponse.json({ ok: false, error: data?.error ?? "UltraMsg error" }, { status: 502 });
    }

    return NextResponse.json({ ok: true, msgId: data?.id });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[send-whatsapp] ERROR:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
