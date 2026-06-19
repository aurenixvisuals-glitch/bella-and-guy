import { NextRequest, NextResponse } from "next/server";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";
const FROM = "Bella & Guy Salon <onboarding@resend.dev>";

async function sendViaResend(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY not set");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, booking } = body;

    console.log("[send-email] type:", type, "booking:", booking?.full_name);

    if (!booking) return NextResponse.json({ ok: false, error: "No booking" }, { status: 400 });

    const { full_name, email, phone, service, booking_date, booking_time, address, staff } = booking;

    const rowStyle = `display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f0ebe0;font-size:14px;`;
    const labelStyle = `color:#999;font-weight:500;`;
    const valueStyle = `color:#1a1000;font-weight:600;text-align:right;`;
    const baseStyle = `font-family:'Inter',Arial,sans-serif;background:#f9f6f0;padding:40px 0;`;
    const cardStyle = `background:#fff;max-width:560px;margin:0 auto;border-radius:8px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);`;
    const headerStyle = `background:#1a1000;padding:32px 40px;text-align:center;`;
    const bodyStyle = `padding:36px 40px;`;
    const footerStyle = `background:#f5f0e8;padding:20px 40px;text-align:center;font-size:12px;color:#999;`;

    function detailsTable() {
      return `<div style="background:#faf7f0;border-radius:6px;padding:20px 24px;margin:20px 0;">
        <div style="${rowStyle}"><span style="${labelStyle}">Service</span><span style="${valueStyle}">${service}</span></div>
        <div style="${rowStyle}"><span style="${labelStyle}">Date</span><span style="${valueStyle}">${booking_date}</span></div>
        <div style="${rowStyle}"><span style="${labelStyle}">Time</span><span style="${valueStyle}">${booking_time}</span></div>
        ${staff ? `<div style="${rowStyle}"><span style="${labelStyle}">Staff</span><span style="${valueStyle}">${staff}</span></div>` : ""}
        <div style="display:flex;justify-content:space-between;padding:10px 0;font-size:14px;"><span style="${labelStyle}">Type</span><span style="${valueStyle}">${address ? "Home Service" : "At Salon"}</span></div>
      </div>`;
    }

    let clientSubject = "", clientHtml = "", adminSubject = "", adminHtml = "";

    if (type === "created") {
      clientSubject = "Booking Received — Bella & Guy Salon";
      clientHtml = `<div style="${baseStyle}"><div style="${cardStyle}">
        <div style="${headerStyle}">
          <div style="color:#c9a84c;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:8px;">Bella & Guy Salon</div>
          <div style="color:#fff;font-size:22px;font-weight:600;">Booking Received ✓</div>
        </div>
        <div style="${bodyStyle}">
          <p style="color:#333;font-size:15px;margin:0 0 4px;">Hello <strong>${full_name}</strong>,</p>
          <p style="color:#666;font-size:14px;margin:0 0 20px;">We've received your appointment request. We'll confirm within 30 minutes via WhatsApp.</p>
          ${detailsTable()}
        </div>
        <div style="${footerStyle}">Bella & Guy Salon · Professional Beauty Services</div>
      </div></div>`;

      adminSubject = `New Booking — ${full_name} — ${service}`;
      adminHtml = `<div style="${baseStyle}"><div style="${cardStyle}">
        <div style="${headerStyle}">
          <div style="color:#c9a84c;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:8px;">Admin Alert</div>
          <div style="color:#fff;font-size:22px;font-weight:600;">New Booking 📋</div>
        </div>
        <div style="${bodyStyle}">
          <p style="color:#333;font-size:15px;margin:0 0 20px;"><strong>${full_name}</strong> (${phone}) has made a new booking.</p>
          ${detailsTable()}
          ${email ? `<p style="color:#888;font-size:13px;margin-top:16px;">Client email: <strong>${email}</strong></p>` : ""}
        </div>
        <div style="${footerStyle}">Bella & Guy Salon — Admin Notification</div>
      </div></div>`;
    }

    if (type === "cancelled") {
      clientSubject = "Booking Cancelled — Bella & Guy Salon";
      clientHtml = `<div style="${baseStyle}"><div style="${cardStyle}">
        <div style="background:#3d1010;padding:32px 40px;text-align:center;">
          <div style="color:#f87171;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:8px;">Bella & Guy Salon</div>
          <div style="color:#fff;font-size:22px;font-weight:600;">Booking Cancelled</div>
        </div>
        <div style="${bodyStyle}">
          <p style="color:#333;font-size:15px;margin:0 0 4px;">Hello <strong>${full_name}</strong>,</p>
          <p style="color:#666;font-size:14px;margin:0 0 20px;">We're sorry, your appointment has been cancelled. Please contact us to reschedule.</p>
          ${detailsTable()}
        </div>
        <div style="${footerStyle}">Bella & Guy Salon · We apologize for the inconvenience.</div>
      </div></div>`;

      adminSubject = `Booking Cancelled — ${full_name} — ${service}`;
      adminHtml = `<div style="${baseStyle}"><div style="${cardStyle}">
        <div style="background:#3d1010;padding:32px 40px;text-align:center;">
          <div style="color:#f87171;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:8px;">Admin Alert</div>
          <div style="color:#fff;font-size:22px;font-weight:600;">Booking Cancelled 🚫</div>
        </div>
        <div style="${bodyStyle}">
          <p style="color:#333;font-size:15px;margin:0 0 20px;"><strong>${full_name}</strong>'s booking has been cancelled.</p>
          ${detailsTable()}
        </div>
        <div style="${footerStyle}">Bella & Guy Salon — Admin Notification</div>
      </div></div>`;
    }

    if (type === "rescheduled") {
      const new_date = booking.new_date || "";
      const new_time = booking.new_time || "";
      clientSubject = "Appointment Rescheduled — Bella & Guy Salon";
      clientHtml = `<div style="${baseStyle}"><div style="${cardStyle}">
        <div style="background:#0a2010;padding:32px 40px;text-align:center;">
          <div style="color:#4fd080;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:8px;">Bella & Guy Salon</div>
          <div style="color:#fff;font-size:22px;font-weight:600;">Appointment Rescheduled 📅</div>
        </div>
        <div style="${bodyStyle}">
          <p style="color:#333;font-size:15px;margin:0 0 4px;">Hello <strong>${full_name}</strong>,</p>
          <p style="color:#666;font-size:14px;margin:0 0 20px;">Your appointment has been rescheduled.</p>
          <div style="background:#faf7f0;border-radius:6px;padding:20px 24px;margin:20px 0;">
            <div style="${rowStyle}"><span style="${labelStyle}">Service</span><span style="${valueStyle}">${service}</span></div>
            <div style="${rowStyle}"><span style="${labelStyle}">New Date</span><span style="color:#4fd080;font-weight:700;">${new_date}</span></div>
            <div style="display:flex;justify-content:space-between;padding:10px 0;font-size:14px;"><span style="${labelStyle}">New Time</span><span style="color:#4fd080;font-weight:700;">${new_time}</span></div>
          </div>
        </div>
        <div style="${footerStyle}">Bella & Guy Salon · See you soon!</div>
      </div></div>`;

      adminSubject = `Rescheduled — ${full_name} → ${new_date} ${new_time}`;
      adminHtml = `<div style="${baseStyle}"><div style="${cardStyle}">
        <div style="${headerStyle}">
          <div style="color:#c9a84c;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:8px;">Admin Alert</div>
          <div style="color:#fff;font-size:22px;font-weight:600;">Booking Rescheduled 📅</div>
        </div>
        <div style="${bodyStyle}">
          <p style="color:#333;font-size:15px;margin:0 0 20px;"><strong>${full_name}</strong>'s booking moved to <strong>${new_date} at ${new_time}</strong>.</p>
          ${detailsTable()}
        </div>
        <div style="${footerStyle}">Bella & Guy Salon — Admin Notification</div>
      </div></div>`;
    }

    const results: string[] = [];

    if (clientSubject && email) {
      console.log("[send-email] Sending client email to:", email);
      const r = await sendViaResend(email, clientSubject, clientHtml);
      results.push("client:" + r.id);
    }

    if (adminSubject && ADMIN_EMAIL) {
      console.log("[send-email] Sending admin email to:", ADMIN_EMAIL);
      const r = await sendViaResend(ADMIN_EMAIL, adminSubject, adminHtml);
      results.push("admin:" + r.id);
    }

    console.log("[send-email] Done:", results);
    return NextResponse.json({ ok: true, sent: results });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[send-email] ERROR:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
