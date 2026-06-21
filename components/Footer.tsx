"use client";

export default function Footer() {
  const services = ["Facial & Cleanup", "Waxing & Threading", "Hair Color", "Bridal Makeup", "Men's Haircut", "Home Service"];
  const links = [
    { label: "Home", href: "#home" },
    { label: "Services", href: "#services" },
    { label: "Home Service", href: "#home-service" },
    { label: "Gallery", href: "#gallery" },
    { label: "Book Appointment", href: "#booking" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <>
      <style>{`
        .footer {
          background: #080808;
          border-top: 1px solid rgba(201,168,76,0.1);
        }

        .footer-main {
          max-width: 1260px;
          margin: 0 auto;
          padding: 80px 32px 56px;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1.5fr;
          gap: 60px;
        }

        .footer-brand-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          font-weight: 500;
          color: #FFFFFF;
          letter-spacing: 0.02em;
          margin-bottom: 4px;
        }

        .footer-brand-sub {
          font-size: 9px;
          color: rgba(201,168,76,0.6);
          letter-spacing: 0.28em;
          text-transform: uppercase;
          margin-bottom: 24px;
        }

        .footer-desc {
          color: rgba(255,255,255,0.3);
          font-size: 14px;
          line-height: 1.75;
          max-width: 240px;
          margin-bottom: 28px;
        }

        .footer-col-title {
          color: rgba(255,255,255,0.5);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          margin-bottom: 24px;
        }

        .footer-link {
          display: block;
          color: rgba(255,255,255,0.3);
          font-size: 14px;
          text-decoration: none;
          margin-bottom: 12px;
          transition: color 0.2s ease;
        }
        .footer-link:hover { color: #C9A84C; }

        .footer-contact-item {
          display: block;
          color: rgba(255,255,255,0.3);
          font-size: 14px;
          margin-bottom: 12px;
          line-height: 1.5;
          text-decoration: none;
          transition: color 0.2s ease;
        }
        a.footer-contact-item:hover { color: #C9A84C; }

        .footer-bottom {
          border-top: 1px solid rgba(255,255,255,0.05);
          max-width: 1260px;
          margin: 0 auto;
          padding: 24px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .footer-copyright {
          color: rgba(255,255,255,0.18);
          font-size: 12.5px;
        }

        .footer-location {
          display: flex;
          align-items: center;
          gap: 8px;
          color: rgba(255,255,255,0.15);
          font-size: 12px;
        }

        .footer-social-row {
          display: flex;
          gap: 10px;
          margin-top: 4px;
        }

        .footer-social-btn {
          width: 34px; height: 34px;
          border-radius: 3px;
          border: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px;
          transition: all 0.25s ease;
          cursor: pointer;
          text-decoration: none;
        }
        .footer-social-btn:hover {
          border-color: rgba(201,168,76,0.3);
          background: rgba(201,168,76,0.08);
        }

        .footer-book-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 16px;
          background: linear-gradient(135deg, #E8C96D, #C9A84C);
          color: #080808;
          padding: 11px 24px;
          border-radius: 3px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          text-decoration: none;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .footer-book-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(201,168,76,0.35);
        }

        @media (max-width: 900px) {
          .footer-main {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 560px) {
          .footer-main {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 480px) {
          .footer-main { padding: 48px 16px 32px; gap: 32px; }
          .footer-bottom { padding: 20px 16px; }
          .footer-social-btn { width: 40px; height: 40px; font-size: 16px; }
          .footer-book-btn { width: 100%; justify-content: center; }
        }
      `}</style>

      <footer className="footer">
        <div className="footer-main">
          <div>
            <div className="footer-brand-name">
              Bella <span style={{ color: "#C9A84C" }}>&</span> Guy
            </div>
            <div className="footer-brand-sub">Unisex Salon · Wave City</div>
            <p className="footer-desc">
              Premium beauty & grooming for men and women. At our salon in Ghaziabad, or at your doorstep.
            </p>
            <div className="footer-social-row">
              {[
                { icon: "f", href: "#" },
                { icon: "◉", href: "#" },
                { icon: "▶", href: "#" },
              ].map((s, i) => (
                <a key={i} href={s.href} className="footer-social-btn" style={{ color: "rgba(255,255,255,0.35)" }}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <div className="footer-col-title">Services</div>
            {services.map((s, i) => (
              <a key={i} href="#services" className="footer-link">{s}</a>
            ))}
          </div>

          <div>
            <div className="footer-col-title">Quick Links</div>
            {links.map((l, i) => (
              <a key={i} href={l.href} className="footer-link">{l.label}</a>
            ))}
          </div>

          <div>
            <div className="footer-col-title">Contact</div>
            <span className="footer-contact-item">Wave City, Ghaziabad, UP 201003</span>
            <a href="tel:+919876543210" className="footer-contact-item">+91 98765 43210</a>
            <span className="footer-contact-item">Mon – Sun, 9:00 AM – 8:00 PM</span>
            <a href="#booking" className="footer-book-btn">
              Book Now →
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <span className="footer-copyright">© 2026 Bella & Guy. All Rights Reserved.</span>
          <span className="footer-location">
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "rgba(201,168,76,0.4)", display: "inline-block" }} />
            Wave City, Ghaziabad, UP
          </span>
          <a href="/login" style={{ fontSize: "11px", color: "rgba(255,255,255,0.08)", textDecoration: "none", letterSpacing: "0.06em", transition: "color 0.3s ease" }}
            onMouseEnter={e => (e.currentTarget.style.color = "rgba(201,168,76,0.5)") as any}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.08)") as any}>
            Staff Portal
          </a>
        </div>
      </footer>
    </>
  );
}