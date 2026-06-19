"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "../lib/supabase";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("home");
  const [customerLoggedIn, setCustomerLoggedIn] = useState(false);
  const [customerName, setCustomerName] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setCustomerLoggedIn(true);
        const name = session.user.user_metadata?.full_name || session.user.email || "";
        setCustomerName(name.split(" ")[0]);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCustomerLoggedIn(!!session);
      if (session) {
        const name = session.user.user_metadata?.full_name || session.user.email || "";
        setCustomerName(name.split(" ")[0]);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => { setScrolled(window.scrollY > 60); ticking = false; });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: "#home", id: "home" },
    { label: "Services", href: "#services", id: "services" },
    { label: "Home Service", href: "#home-service", id: "home-service" },
    { label: "Gallery", href: "#gallery", id: "gallery" },
    { label: "Reviews", href: "#reviews", id: "reviews" },
    { label: "Contact", href: "#contact", id: "contact" },
  ];

  return (
    <>
      <style>{`
        .nav-link {
          position: relative;
          color: rgba(255,255,255,0.7);
          text-decoration: none;
          font-size: 11.5px;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          transition: color 0.25s ease;
          padding-bottom: 2px;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 1px;
          background: #C9A84C;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .nav-link:hover { color: #C9A84C; }
        .nav-link:hover::after { width: 100%; }
        .nav-link.active { color: #C9A84C; }
        .nav-link.active::after { width: 100%; }

        .nav-book-btn {
          position: relative;
          background: transparent;
          border: 1px solid rgba(201, 168, 76, 0.5);
          color: #C9A84C;
          padding: 9px 22px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          text-decoration: none;
          transition: all 0.3s ease;
          overflow: hidden;
          display: inline-block;
        }
        .nav-book-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #E8C96D, #C9A84C);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: -1;
        }
        .nav-book-btn:hover {
          color: #0A0A0A;
          border-color: transparent;
          box-shadow: 0 8px 24px rgba(201, 168, 76, 0.3);
        }
        .nav-book-btn:hover::before { transform: scaleX(1); }

        .mobile-nav-link {
          display: flex;
          align-items: center;
          padding: 14px 0;
          color: rgba(255,255,255,0.7);
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          transition: color 0.2s ease;
        }
        .mobile-nav-link:hover { color: #C9A84C; }

        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .mobile-btn { display: none !important; }
        }
        @media (max-width: 767px) {
          .desktop-nav { display: none !important; }
          .mobile-btn { display: flex !important; }
        }

        .hamburger-line {
          display: block;
          width: 22px;
          height: 1.5px;
          background: #C9A84C;
          transition: all 0.3s ease;
          transform-origin: center;
        }
      `}</style>

      <nav style={{
        position: "fixed", zIndex: 1000,
        transition: "top 0.6s cubic-bezier(0.4,0,0.2,1), left 0.6s cubic-bezier(0.4,0,0.2,1), right 0.6s cubic-bezier(0.4,0,0.2,1), border-radius 0.6s cubic-bezier(0.4,0,0.2,1), background 0.6s cubic-bezier(0.4,0,0.2,1), box-shadow 0.6s cubic-bezier(0.4,0,0.2,1), border 0.6s cubic-bezier(0.4,0,0.2,1)",
        top:    scrolled ? "10px" : "0",
        left:   scrolled ? "16px" : "0",
        right:  scrolled ? "16px" : "0",
        borderRadius: scrolled ? "16px" : "0",
        /* Always dark warm glass — works on both light & dark backgrounds */
        background: scrolled ? "rgba(12,9,6,0.72)" : "transparent",
        backdropFilter: scrolled ? "blur(40px) saturate(180%) brightness(90%)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(40px) saturate(180%) brightness(90%)" : "none",
        border: scrolled ? "1px solid rgba(255,255,255,0.10)" : "none",
        boxShadow: scrolled
          ? "inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.3), 0 16px 48px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)"
          : "none",
      }}>
        <div style={{ maxWidth: "1260px", margin: "0 auto", padding: scrolled ? "0 20px" : "0 32px", transition: "padding 0.4s ease" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: scrolled ? "58px" : "80px", transition: "height 0.4s ease" }}>

            {/* Logo */}
            <a href="#home" style={{ display: "flex", alignItems: "center", gap: "14px", textDecoration: "none" }}>
              <div style={{
                width: "42px", height: "42px", borderRadius: "50%",
                border: "1px solid rgba(201,168,76,0.4)", overflow: "hidden",
                background: "#141414", flexShrink: 0,
                transition: "border-color 0.3s ease"
              }}>
                <Image src="/images/logo.png" alt="Bella & Guy" width={42} height={42} style={{ objectFit: "cover" }} />
              </div>
              <div>
                <div style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "20px", fontWeight: "600", color: "#FFFFFF",
                  letterSpacing: "0.04em", lineHeight: "1.1"
                }}>
                  Bella <span style={{ color: "#C9A84C" }}>&</span> Guy
                </div>
                <div style={{ fontSize: "8px", color: "rgba(201,168,76,0.7)", letterSpacing: "0.28em", textTransform: "uppercase" }}>
                  Unisex Salon
                </div>
              </div>
            </a>

            {/* Desktop nav */}
            <div className="desktop-nav" style={{ alignItems: "center", gap: "36px" }}>
              {navLinks.map((link) => (
                <a key={link.label} href={link.href} className={`nav-link ${activeLink === link.id ? "active" : ""}`}
                  onClick={() => setActiveLink(link.id)}>
                  {link.label}
                </a>
              ))}
              <a href="#booking" className="nav-book-btn">Book Now</a>
              {customerLoggedIn ? (
                <a href="/my-bookings" style={{ color: "#C9A84C", fontSize: "11.5px", fontWeight: 600, letterSpacing: "0.1em", textDecoration: "none", textTransform: "uppercase", border: "1px solid rgba(201,168,76,0.4)", padding: "9px 16px", borderRadius: 4 }}>
                  👤 {customerName}
                </a>
              ) : (
                <a href="/customer-login" style={{ color: "rgba(255,255,255,0.6)", fontSize: "11.5px", fontWeight: 500, letterSpacing: "0.1em", textDecoration: "none", textTransform: "uppercase" }}>
                  Login
                </a>
              )}
            </div>

            {/* Mobile hamburger */}
            <button className="mobile-btn" onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "8px", flexDirection: "column", gap: "5px", alignItems: "center" }}>
              <span className="hamburger-line" style={{ transform: menuOpen ? "rotate(45deg) translate(4.5px, 4.5px)" : "none" }} />
              <span className="hamburger-line" style={{ opacity: menuOpen ? 0 : 1, transform: menuOpen ? "scaleX(0)" : "none" }} />
              <span className="hamburger-line" style={{ transform: menuOpen ? "rotate(-45deg) translate(4.5px, -4.5px)" : "none" }} />
            </button>
          </div>

          {/* Mobile menu */}
          <div style={{
            maxHeight: menuOpen ? "500px" : "0",
            overflow: "hidden",
            transition: "max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          }}>
            <div style={{ paddingBottom: "24px" }}>
              {navLinks.map((link) => (
                <a key={link.label} href={link.href} className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
                  {link.label}
                </a>
              ))}
              <a href="#booking" onClick={() => setMenuOpen(false)} style={{
                display: "inline-block", marginTop: "20px",
                background: "linear-gradient(135deg, #E8C96D, #C9A84C)",
                color: "#0A0A0A", padding: "13px 32px", borderRadius: "4px",
                fontSize: "12px", fontWeight: "700", letterSpacing: "0.12em",
                textTransform: "uppercase", textDecoration: "none"
              }}>
                Book Appointment
              </a>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}