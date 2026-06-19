"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const members = [
  {
    name: "Sana Sheikh",
    role: "Founder & Creative Director",
    specialty: "Bridal Makeup",
    exp: "10 yrs",
    img: "/images/team/sana.jpg",
    initials: "SS",
    accent: "#C9A84C",
    services: ["Bridal Makeup", "Hair Color", "Hair Styling"],
  },
  {
    name: "Pooja Sharma",
    role: "Senior Skin Specialist",
    specialty: "Facials & Cleanup",
    exp: "7 yrs",
    img: "/images/team/pooja.jpg",
    initials: "PS",
    accent: "#B8956A",
    services: ["Facials", "Cleanup", "D-Tan", "Bleach"],
  },
  {
    name: "Riya Verma",
    role: "Nail Art Technician",
    specialty: "Manicure & Pedicure",
    exp: "5 yrs",
    img: "/images/team/riya.jpg",
    initials: "RV",
    accent: "#A89070",
    services: ["Manicure", "Pedicure", "Nail Art"],
  },
  {
    name: "Kavya Gupta",
    role: "Waxing & Threading Expert",
    specialty: "Rica & Chocolate Wax",
    exp: "6 yrs",
    img: "/images/team/kavya.jpg",
    initials: "KG",
    accent: "#C9A84C",
    services: ["Waxing", "Threading", "D-Tan"],
  },
  {
    name: "Arjun Singh",
    role: "Master Barber",
    specialty: "Haircut & Beard",
    exp: "8 yrs",
    img: "/images/team/arjun.jpg",
    initials: "AS",
    accent: "#8A7260",
    services: ["Haircut", "Beard Styling", "Clean Shave"],
  },
  {
    name: "Rahul Khanna",
    role: "Hair Color Specialist",
    specialty: "Balayage & Highlights",
    exp: "6 yrs",
    img: "/images/team/rahul.jpg",
    initials: "RK",
    accent: "#B09060",
    services: ["Hair Color", "Balayage", "Hair Styling"],
  },
  {
    name: "Priya Jain",
    role: "Hair Stylist",
    specialty: "Cut, Blow Dry & Spa",
    exp: "4 yrs",
    img: "/images/team/priya.jpg",
    initials: "PJ",
    accent: "#C9A84C",
    services: ["Haircut", "Hair Spa", "Head Massage"],
  },
  {
    name: "Neha Agarwal",
    role: "Beauty Therapist",
    specialty: "Home Service Specialist",
    exp: "5 yrs",
    img: "/images/team/neha.jpg",
    initials: "NA",
    accent: "#9A8060",
    services: ["Facial", "Waxing", "Manicure", "Threading"],
  },
];

export default function Team() {
  const sectionRef = useRef<HTMLElement>(null);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.06 }
    );
    sectionRef.current?.querySelectorAll(".reveal, .reveal-scale").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function handleBook(name: string) {
    const el = document.getElementById("booking");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      <style>{`
        .tm-section { background: #FAF7F0; padding: 100px 32px 110px; }

        .tm-header { text-align: center; margin-bottom: 64px; }

        /* Grid */
        .tm-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        /* Card */
        .tm-card {
          background: rgba(255,255,255,0.28);
          backdrop-filter: blur(32px) saturate(180%);
          -webkit-backdrop-filter: blur(32px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.72);
          border-radius: 20px;
          padding: 28px 20px 22px;
          text-align: center;
          position: relative; overflow: hidden;
          transition:
            transform 0.5s cubic-bezier(0.4,0,0.2,1),
            box-shadow 0.5s cubic-bezier(0.4,0,0.2,1),
            background 0.5s cubic-bezier(0.4,0,0.2,1),
            border-color 0.5s cubic-bezier(0.4,0,0.2,1);
          display: flex; flex-direction: column; align-items: center;
          box-shadow:
            inset 0 1.5px 0 rgba(255,255,255,0.88),
            0 6px 24px rgba(180,150,80,0.09),
            0 2px 6px rgba(0,0,0,0.05);
        }
        .tm-card::before {
          content:''; position:absolute; top:0; left:0; right:0; height:35%;
          background: linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0));
          border-radius: 20px 20px 0 0; pointer-events:none; z-index:0;
        }
        .tm-card > * { position: relative; z-index: 1; }
        .tm-card::after {
          content: ''; position: absolute; inset: 0; border-radius: 20px; pointer-events: none;
          background: radial-gradient(ellipse 70% 50% at 50% 0%, rgba(201,168,76,0.08), transparent);
          opacity: 0;
          transition: opacity 0.5s cubic-bezier(0.4,0,0.2,1);
        }
        .tm-card:hover {
          transform: translateY(-6px);
          background: rgba(255,255,255,0.38);
          border-color: rgba(255,255,255,0.88);
          box-shadow:
            inset 0 1.5px 0 rgba(255,255,255,0.95),
            0 20px 48px rgba(180,150,80,0.14),
            0 4px 12px rgba(0,0,0,0.06);
        }
        .tm-card:hover::after { opacity: 1; }

        /* Photo */
        .tm-photo-wrap {
          width: 96px; height: 96px; border-radius: 50%;
          position: relative; margin-bottom: 18px;
          flex-shrink: 0;
        }
        .tm-photo-ring {
          position: absolute; inset: -3px; border-radius: 50%;
          border: 2px solid rgba(201,168,76,0.25);
          transition: border-color 0.3s ease, transform 0.3s ease;
        }
        .tm-card:hover .tm-photo-ring { border-color: rgba(201,168,76,0.7); transform: scale(1.04); }
        .tm-photo-inner {
          width: 96px; height: 96px; border-radius: 50%; overflow: hidden;
          background: linear-gradient(135deg, #f0e8d0, #e8dcc8);
          display: flex; align-items: center; justify-content: center;
          position: relative;
        }
        .tm-initials {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px; font-weight: 500; color: #C9A84C;
          line-height: 1;
        }

        /* Exp badge */
        .tm-exp-badge {
          position: absolute; bottom: -2px; right: -2px;
          background: linear-gradient(135deg, #E8C96D, #C9A84C);
          color: #080808; font-size: 8.5px; font-weight: 800;
          letter-spacing: 0.06em; text-transform: uppercase;
          border-radius: 100px; padding: 3px 8px;
          border: 2px solid #fff;
          white-space: nowrap;
        }

        /* Text */
        .tm-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 19px; font-weight: 600; color: #080808;
          margin-bottom: 5px; line-height: 1.2;
        }
        .tm-role {
          font-size: 11px; color: #aaa; font-weight: 500;
          letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 12px;
        }
        .tm-specialty {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(201,168,76,0.08); border: 1px solid rgba(201,168,76,0.2);
          border-radius: 100px; padding: 4px 12px;
          font-size: 11px; color: #C9A84C; font-weight: 600;
          margin-bottom: 16px;
        }
        .tm-specialty-dot { width: 5px; height: 5px; border-radius: 50%; background: #C9A84C; }

        /* Services tags */
        .tm-tags {
          display: flex; flex-wrap: wrap; gap: 5px; justify-content: center;
          margin-bottom: 18px;
        }
        .tm-tag {
          font-size: 10px; color: rgba(0,0,0,0.4); font-weight: 500;
          background: rgba(0,0,0,0.04); border-radius: 3px; padding: 3px 8px;
        }

        /* Book button */
        .tm-book-btn {
          display: inline-flex; align-items: center; gap: 6px;
          background: #080808; color: #fff;
          padding: 9px 20px; border-radius: 4px; border: none;
          font-size: 10.5px; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; cursor: pointer; font-family: 'Inter', sans-serif;
          transition: all 0.25s ease; width: 100%; justify-content: center;
          transform: translateY(6px); opacity: 0;
        }
        .tm-card:hover .tm-book-btn { transform: translateY(0); opacity: 1; }
        .tm-book-btn:hover { background: #C9A84C; color: #080808; }

        /* Mobile */
        @media (max-width: 1100px) { .tm-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 750px)  { .tm-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; } .tm-section { padding: 80px 16px 90px; } }
        @media (max-width: 420px)  { .tm-grid { grid-template-columns: 1fr 1fr; } }
      `}</style>

      <section id="team" className="tm-section" ref={sectionRef}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

          <div className="tm-header">
            <div className="reveal" style={{ marginBottom: "16px" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "10px", fontWeight: "600", letterSpacing: "0.22em", textTransform: "uppercase", color: "#C9A84C" }}>
                <span style={{ width: "20px", height: "1px", background: "#C9A84C", display: "inline-block" }} />
                The People Behind the Magic
              </span>
            </div>
            <h2 className="reveal" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(34px,5vw,54px)", fontWeight: "400", color: "#080808", marginBottom: "12px", lineHeight: "1.1" }}>
              Meet Our <em style={{ fontStyle: "italic", color: "#C9A84C" }}>Specialists</em>
            </h2>
            <div style={{ width: "40px", height: "1px", background: "linear-gradient(90deg,transparent,#C9A84C,transparent)", margin: "0 auto 18px" }} />
            <p className="reveal" style={{ color: "#6B6B6B", fontSize: "15px", maxWidth: "500px", margin: "0 auto" }}>
              Certified professionals with a passion for beauty — each expert trained in the latest techniques.
            </p>
          </div>

          <div className="tm-grid">
            {members.map((m, i) => (
              <div key={i} className={`tm-card reveal-scale reveal-d${Math.min(i + 1, 12)}`}>

                <div className="tm-photo-wrap">
                  <div className="tm-photo-ring" />
                  <div className="tm-photo-inner">
                    {!imgErrors[i] ? (
                      <Image
                        src={m.img} alt={m.name}
                        fill style={{ objectFit: "cover", borderRadius: "50%" }}
                        onError={() => setImgErrors(prev => ({ ...prev, [i]: true }))}
                      />
                    ) : (
                      <span className="tm-initials">{m.initials}</span>
                    )}
                  </div>
                  <span className="tm-exp-badge">{m.exp}</span>
                </div>

                <div className="tm-name">{m.name}</div>
                <div className="tm-role">{m.role}</div>

                <div className="tm-specialty">
                  <span className="tm-specialty-dot" />
                  {m.specialty}
                </div>

                <div className="tm-tags">
                  {m.services.map((s, j) => (
                    <span key={j} className="tm-tag">{s}</span>
                  ))}
                </div>

                <button className="tm-book-btn" onClick={() => handleBook(m.name)}>
                  Book with {m.name.split(" ")[0]} →
                </button>
              </div>
            ))}
          </div>

        </div>
      </section>
    </>
  );
}
