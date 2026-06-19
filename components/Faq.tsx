"use client";
import { useState } from "react";

const faqs = [
  {
    q: "Do you offer home service?",
    a: "Yes. We offer professional home service across Wave City and surrounding areas of Ghaziabad. Our certified experts arrive fully equipped. Simply select 'Home Service' when booking."
  },
  {
    q: "How do I book an appointment?",
    a: "Book directly on this website using the 'Book Appointment' form above, or WhatsApp us at +91 98765 43210. We confirm bookings within 30 minutes."
  },
  {
    q: "What are your timings?",
    a: "We're open 7 days a week, 9:00 AM to 8:00 PM. Home service slots are available from 9:00 AM to 7:00 PM."
  },
  {
    q: "Is the salon hygienic and safe?",
    a: "Absolutely. We follow strict hygiene protocols — sterilized tools, disposable items for every client, and regular sanitization throughout the day. Your safety is non-negotiable."
  },
  {
    q: "Which products do you use?",
    a: "We use premium international brands including Wella, Schwarzkopf, O3+, and VLCC. All products are 100% authentic and dermatologically approved."
  },
  {
    q: "Can I get bridal makeup at home?",
    a: "Yes — our bridal home package is one of our most popular services. Our makeup artists arrive at your home or venue with a complete professional kit. We recommend booking at least 3–5 days in advance."
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <style>{`
        .faq-section {
          background: #FAF7F0;
          padding: 120px 32px;
          position: relative;
        }

        .faq-item {
          border-bottom: 1px solid rgba(0,0,0,0.07);
          transition: all 0.2s ease;
        }

        .faq-item:first-of-type { border-top: 1px solid rgba(0,0,0,0.07); }

        .faq-trigger {
          width: 100%;
          padding: 24px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          gap: 24px;
        }

        .faq-q {
          font-family: 'Cormorant Garamond', serif;
          font-size: 19px;
          font-weight: 500;
          color: #080808;
          transition: color 0.2s ease;
          line-height: 1.3;
        }

        .faq-trigger:hover .faq-q { color: #C9A84C; }
        .faq-open .faq-q { color: #C9A84C; }

        .faq-icon {
          width: 28px; height: 28px;
          border: 1px solid rgba(0,0,0,0.12);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          color: rgba(0,0,0,0.35);
          font-size: 16px;
        }

        .faq-open .faq-icon {
          background: #C9A84C;
          border-color: #C9A84C;
          color: #080808;
          transform: rotate(45deg);
        }

        .faq-answer {
          overflow: hidden;
          transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
        }

        .faq-answer-inner {
          padding-bottom: 24px;
          color: #6B6B6B;
          font-size: 15px;
          line-height: 1.75;
          max-width: 640px;
        }

        .faq-cta {
          text-align: center;
          margin-top: 60px;
          padding: 48px 40px;
          background: #ffffff;
          border-radius: 4px;
          border: 1px solid rgba(201,168,76,0.1);
        }
      `}</style>

      <section id="faq" className="faq-section">
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>

          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              fontSize: "10px", fontWeight: "600", letterSpacing: "0.22em",
              textTransform: "uppercase", color: "#C9A84C", marginBottom: "16px", display: "block"
            }}>Common Questions</span>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(36px, 5vw, 52px)", fontWeight: "400",
              color: "#080808", marginBottom: "12px"
            }}>
              Frequently Asked
            </h2>
            <div style={{ width: "40px", height: "1px", background: "linear-gradient(90deg, transparent, #C9A84C, transparent)", margin: "0 auto" }} />
          </div>

          <div>
            {faqs.map((faq, i) => (
              <div key={i} className={`faq-item ${open === i ? "faq-open" : ""}`}>
                <button className="faq-trigger" onClick={() => setOpen(open === i ? null : i)}>
                  <span className="faq-q">{faq.q}</span>
                  <span className="faq-icon">+</span>
                </button>
                <div className="faq-answer" style={{ maxHeight: open === i ? "300px" : "0", opacity: open === i ? 1 : 0 }}>
                  <div className="faq-answer-inner">{faq.a}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="faq-cta">
            <p style={{ color: "#6B6B6B", marginBottom: "20px", fontSize: "15px" }}>
              Still have questions? We'd love to help.
            </p>
            <a href="https://wa.me/919876543210" target="_blank" style={{
              display: "inline-flex", alignItems: "center", gap: "10px",
              background: "#080808", color: "#FFFFFF",
              padding: "13px 32px", borderRadius: "3px",
              fontSize: "12px", fontWeight: "600", textDecoration: "none",
              letterSpacing: "0.1em", textTransform: "uppercase",
              transition: "all 0.3s ease"
            }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#C9A84C";
                (e.currentTarget as HTMLElement).style.color = "#080808";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#080808";
                (e.currentTarget as HTMLElement).style.color = "#FFFFFF";
              }}>
              Ask on WhatsApp →
            </a>
          </div>
        </div>
      </section>
    </>
  );
}