"use client";
import { useState, useEffect, useRef } from "react";
import { allCategories, ServiceItem } from "../lib/servicesData";

interface ServicesProps {
  onServiceSelect?: (service: string, catId: string) => void;
  title?: string;
  subtitle?: string;
}

const CAT_GRADIENTS: Record<string, [string, string]> = {
  wax:           ["#fdf8e8", "#f0e0a0"],
  "dtan-bleach": ["#eaf4ff", "#b8d8f4"],
  cleanup:       ["#eafaf2", "#a8e0c4"],
  facial:        ["#fff5e6", "#f5d498"],
  japanese:      ["#f0ecff", "#c8b4f0"],
  "mani-pedi":   ["#fef0f8", "#f4c0e0"],
  body:          ["#edf8f2", "#a0d8b8"],
  "hair-spa":    ["#fff4ec", "#f4c8a0"],
  "hair-color":    ["#f5ecff", "#d0a8f0"],
  "threading-wax": ["#fff0f5", "#f4b8d0"],
  "men-grooming":  ["#edf2fc", "#b8c8e8"],
  "men-color":     ["#fdf5e8", "#f0d4a4"],
};

export default function Services({ onServiceSelect, title, subtitle }: ServicesProps = {}) {
  const [selectedId, setSelectedId]       = useState<string>(allCategories[0].id);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [gender, setGender]               = useState<"female" | "male">("female");
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.06 }
    );
    sectionRef.current?.querySelectorAll(".reveal").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => { setSelectedGroup(null); }, [selectedId]);

  const displayCats = gender === "female"
    ? allCategories.filter(c => c.gender === "female" || c.gender === "both")
    : allCategories.filter(c => c.gender === "male"   || c.gender === "both");

  useEffect(() => {
    const dCats = gender === "female"
      ? allCategories.filter(c => c.gender === "female" || c.gender === "both")
      : allCategories.filter(c => c.gender === "male"   || c.gender === "both");
    if (!dCats.find(c => c.id === selectedId)) {
      setSelectedId(dCats[0]?.id ?? allCategories[0].id);
    }
    setSelectedGroup(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gender]);

  const selectedCat = displayCats.find(c => c.id === selectedId) ?? displayCats[0] ?? allCategories[0];
  const groups        = [...new Set(selectedCat.services.filter(s => s.group).map(s => s.group!))];
  const visibleServices = selectedGroup
    ? selectedCat.services.filter(s => s.group === selectedGroup)
    : selectedCat.services;

  function handleBookService(service: ServiceItem) {
    if (!selectedCat.homeService) {
      window.location.href = "tel:+919625928495";
      return;
    }
    const key   = service.group ? `${service.group} – ${service.name}` : service.name;
    const value = `${key} — ${selectedCat.label}`;
    if (onServiceSelect) {
      onServiceSelect(value, selectedId);
    } else {
      localStorage.setItem("preselectService", value);
      localStorage.setItem("preselectGender", gender);
      window.location.href = "/book";
    }
  }

  function getCardSubtitle(svc: ServiceItem, catId: string): string {
    if (catId === "wax") {
      const m: Record<string, string> = {
        "Honey Wax":           "Natural honey formula | Gentle on all skin",
        "White Chocolate Wax": "Moisturizing formula | Nourishes as it removes",
        "Rica Wax":            "Rica formula | Best for sensitive skin",
      };
      return svc.group ? (m[svc.group] ?? "") : "";
    }
    if (catId === "dtan-bleach") {
      const m: Record<string, string> = {
        "D-Tan":       "Removes sun tan & dark spots | 20 min treatment",
        "Face Bleach": "Brightens complexion | Visible in 1 session",
        "Body Bleach": "Full coverage | Evens skin tone",
      };
      return svc.group ? (m[svc.group] ?? "") : "";
    }
    if (svc.desc) return svc.desc.split("·")[0].trim();
    return "";
  }

  function getCardDesc(svc: ServiceItem): string {
    if (!svc.desc) return "";
    const parts = svc.desc.split("·").map(p => p.trim()).filter(Boolean);
    return parts.slice(1).join(" · ");
  }

  return (
    <>
      <style>{`
        /* ── Section ─────────────────────────────────────────────── */
        .sv-section { background: #FAF7F0; padding: 100px 0 120px; }
        .sv-container { max-width: 1200px; margin: 0 auto; padding: 0 32px; }

        /* ── Header ──────────────────────────────────────────────── */
        .sv-header { text-align: center; margin-bottom: 40px; }
        .sv-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 10px; font-weight: 600; letter-spacing: 0.22em;
          text-transform: uppercase; color: #C9A84C; margin-bottom: 16px;
        }
        .sv-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(34px, 5vw, 54px); font-weight: 400;
          color: #080808; line-height: 1.1; margin-bottom: 12px;
        }
        .sv-divider {
          width: 40px; height: 1px;
          background: linear-gradient(90deg, transparent, #C9A84C, transparent);
          margin: 0 auto 16px;
        }
        .sv-subtitle { color: #6B6B6B; font-size: 15px; }

        /* ── Gender Toggle ───────────────────────────────────────── */
        .sv-gender-outer {
          display: flex; justify-content: center;
          padding: 0 32px 28px;
        }
        .sv-gender-pill {
          display: inline-flex;
          background: rgba(0,0,0,0.06);
          border-radius: 100px;
          padding: 4px;
          gap: 2px;
        }
        .sv-gen-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 32px; border-radius: 100px;
          border: none; background: transparent;
          font-size: 13.5px; font-weight: 600; cursor: pointer;
          transition: all 0.25s ease; color: #666;
          letter-spacing: 0.02em;
        }
        .sv-gen-btn .sv-gen-symbol { font-size: 18px; }
        .sv-gen-btn.sv-gen-on {
          background: #C9A84C;
          color: #080808;
          box-shadow: 0 3px 14px rgba(201,168,76,0.35);
        }
        .sv-gen-btn:not(.sv-gen-on):hover { background: rgba(0,0,0,0.05); color: #333; }

        /* ── Category Tabs ───────────────────────────────────────── */
        .sv-tabs-bar {
          background: #fff;
          border-bottom: 1px solid rgba(0,0,0,0.08);
          box-shadow: 0 2px 12px rgba(0,0,0,0.05);
        }
        .sv-tabs-scroll {
          display: flex; overflow-x: auto;
          scrollbar-width: none;
          max-width: 1200px; margin: 0 auto;
          padding: 0 24px; gap: 4px;
        }
        .sv-tabs-scroll::-webkit-scrollbar { display: none; }

        .sv-tab {
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          padding: 14px 18px 10px; border: none; background: transparent;
          cursor: pointer; position: relative; white-space: nowrap;
          transition: all 0.2s ease; min-width: 76px; flex-shrink: 0;
        }
        .sv-tab::after {
          content: ''; position: absolute;
          bottom: 0; left: 10px; right: 10px; height: 2.5px;
          background: #C9A84C; border-radius: 2px;
          transform: scaleX(0); transition: transform 0.2s ease;
        }
        .sv-tab.sv-tab-on::after { transform: scaleX(1); }
        .sv-tab.sv-tab-on .sv-tab-label { color: #C9A84C; font-weight: 700; }

        .sv-tab-icon-ring {
          width: 50px; height: 50px; border-radius: 50%;
          border: 1.5px solid rgba(0,0,0,0.1);
          background: #f9f6f0;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px;
          transition: all 0.2s ease; overflow: hidden;
        }
        .sv-tab.sv-tab-on .sv-tab-icon-ring { border-color: rgba(201,168,76,0.4); }
        .sv-tab:hover .sv-tab-icon-ring { border-color: rgba(201,168,76,0.3); }
        .sv-tab-label { font-size: 11px; color: #555; font-weight: 500; transition: color 0.2s; }

        /* ── Group Chips ─────────────────────────────────────────── */
        .sv-chips-row {
          display: flex; gap: 8px; overflow-x: auto;
          scrollbar-width: none; padding: 14px 32px;
          max-width: 1200px; margin: 0 auto;
        }
        .sv-chips-row::-webkit-scrollbar { display: none; }
        .sv-chip {
          border: 1.5px solid rgba(0,0,0,0.13); background: #fff;
          color: #555; font-size: 12px; font-weight: 500;
          padding: 6px 18px; border-radius: 100px;
          cursor: pointer; white-space: nowrap; flex-shrink: 0;
          transition: all 0.2s ease;
        }
        .sv-chip:hover { border-color: rgba(201,168,76,0.45); color: #C9A84C; }
        .sv-chip.sv-chip-on {
          background: #080808; color: #fff;
          border-color: #080808; font-weight: 600;
        }

        /* ── Category Info Bar ───────────────────────────────────── */
        .sv-cat-bar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 0 18px;
          border-bottom: 1px solid rgba(0,0,0,0.07);
          margin-bottom: 20px;
        }
        .sv-cat-bar-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px; font-weight: 500; color: #080808; margin-bottom: 2px;
        }
        .sv-cat-bar-desc { font-size: 12.5px; color: #888; }
        .sv-cat-count {
          background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.25);
          color: #9a7520; font-size: 11px; font-weight: 700;
          padding: 5px 14px; border-radius: 100px; letter-spacing: 0.04em; flex-shrink: 0;
        }

        /* ── Cards Grid ──────────────────────────────────────────── */
        .sv-cards-body { max-width: 1200px; margin: 0 auto; padding: 0 32px 40px; }
        .sv-cards-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
        }

        /* ── Service Card ────────────────────────────────────────── */
        .sv-sc {
          background: #fff; border-radius: 16px; overflow: hidden;
          border: 1px solid rgba(0,0,0,0.07);
          box-shadow: 0 2px 12px rgba(0,0,0,0.05);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          display: flex; flex-direction: column;
        }
        .sv-sc:hover {
          transform: translateY(-5px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.12);
        }

        /* Image placeholder */
        .sv-sc-img {
          position: relative; height: 185px;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden; flex-shrink: 0;
        }
        .sv-sc-img-icon { font-size: 56px; opacity: 0.28; }
        .sv-sc-img-photo {
          position: absolute; inset: 0; width: 100%; height: 100%;
          object-fit: cover; object-position: center;
        }

        /* Badges over image */
        .sv-sc-pop {
          position: absolute; top: 10px; right: 10px; z-index: 2;
          background: #C9A84C; color: #080808;
          font-size: 8px; font-weight: 800; letter-spacing: 0.12em;
          text-transform: uppercase; padding: 3px 10px; border-radius: 100px;
        }
        .sv-sc-group {
          position: absolute; top: 10px; left: 10px; z-index: 2;
          background: rgba(8,8,8,0.6); backdrop-filter: blur(6px);
          color: rgba(255,255,255,0.9);
          font-size: 9px; font-weight: 600; letter-spacing: 0.06em;
          padding: 3px 10px; border-radius: 100px;
          max-width: 60%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .sv-sc-dur {
          position: absolute; bottom: 10px; left: 12px; z-index: 2;
          background: rgba(8,8,8,0.65); backdrop-filter: blur(4px);
          color: #fff; font-size: 10.5px; font-weight: 500;
          padding: 4px 11px; border-radius: 100px;
          display: flex; align-items: center; gap: 5px;
        }

        /* Card body */
        .sv-sc-body {
          padding: 16px 18px 18px;
          display: flex; flex-direction: column; gap: 8px; flex: 1;
        }
        .sv-sc-name {
          font-size: 14.5px; font-weight: 700; color: #111; line-height: 1.3;
        }
        .sv-sc-subtitle {
          font-size: 12px; color: #666; line-height: 1.5;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .sv-sc-desc {
          font-size: 11.5px; color: #999; line-height: 1.55;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .sv-sc-price-row {
          display: flex; align-items: baseline; gap: 6px; margin-top: 2px;
        }
        .sv-sc-price { font-size: 18px; font-weight: 800; color: #C9A84C; }
        .sv-sc-gst { font-size: 10px; color: #bbb; }

        .sv-sc-btn { margin-top: auto; padding-top: 4px; }
        .sv-sc-btn button {
          width: 100%; padding: 10px 0;
          background: linear-gradient(135deg, #E8C96D, #C9A84C);
          color: #080808; border: none; border-radius: 8px;
          font-size: 11.5px; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; cursor: pointer;
          transition: all 0.25s ease;
        }
        .sv-sc-btn button:hover {
          background: linear-gradient(135deg, #d4a830, #9E7A2E);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(201,168,76,0.4);
        }
        .sv-sc-btn button.call-btn { background: #f0f0f0; color: #333; }
        .sv-sc-btn button.call-btn:hover { background: #e5e5e5; box-shadow: none; }

        /* ── Responsive ──────────────────────────────────────────── */
        @media (max-width: 1024px) {
          .sv-cards-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 700px) {
          .sv-section { padding: 72px 0 100px; }
          .sv-container { padding: 0 16px; }
          .sv-cards-body { padding: 0 16px 32px; }
          .sv-chips-row { padding: 12px 16px; }
          .sv-cards-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .sv-sc-img { height: 150px; }
          .sv-tab { min-width: 68px; padding: 12px 12px 10px; }
          .sv-tab-icon-ring { width: 44px; height: 44px; font-size: 19px; }
          .sv-sc-body { padding: 12px 13px 14px; gap: 6px; }
          .sv-sc-name { font-size: 13px; }
          .sv-sc-desc { font-size: 11px; }
          .sv-sc-price { font-size: 16px; }
          .sv-gen-btn { padding: 9px 22px; font-size: 13px; }
          .sv-gender-outer { padding-bottom: 20px; }
        }
        @media (max-width: 400px) {
          .sv-cards-grid { grid-template-columns: 1fr; }
          .sv-sc-img { height: 180px; }
        }
      `}</style>

      <section id="services" className="sv-section" ref={sectionRef}>

        {/* Header */}
        <div className="sv-container">
          <div className="sv-header">
            <div className="reveal sv-eyebrow">
              <span style={{ width: "20px", height: "1px", background: "#C9A84C", display: "inline-block" }} />
              Home Services
            </div>
            <h2 className="reveal sv-title">{title ?? "Our Premium Services"}</h2>
            <div className="sv-divider" />
            <p className="reveal sv-subtitle">
              {subtitle ?? "All services at your doorstep — browse by category, pick your treatment, book in seconds"}
            </p>
          </div>
        </div>

        {/* ── Gender Toggle ── */}
        <div className="sv-gender-outer">
          <div className="sv-gender-pill">
            <button
              className={`sv-gen-btn ${gender === "female" ? "sv-gen-on" : ""}`}
              onClick={() => setGender("female")}
            >
              <span className="sv-gen-symbol">♀</span> Female
            </button>
            <button
              className={`sv-gen-btn ${gender === "male" ? "sv-gen-on" : ""}`}
              onClick={() => setGender("male")}
            >
              <span className="sv-gen-symbol">♂</span> Male
            </button>
          </div>
        </div>

        {/* ── Category Tabs ── */}
        <div className="sv-tabs-bar">
          <div className="sv-tabs-scroll">
            {displayCats.map(cat => {
              const [c1, c2] = CAT_GRADIENTS[cat.id] ?? ["#f5f5f5", "#e5e5e5"];
              const isOn = selectedId === cat.id;
              return (
                <button
                  key={cat.id}
                  className={`sv-tab ${isOn ? "sv-tab-on" : ""}`}
                  onClick={() => setSelectedId(cat.id)}
                >
                  <div
                    className="sv-tab-icon-ring"
                    style={isOn ? { background: `linear-gradient(135deg, ${c1}, ${c2})`, borderColor: "rgba(201,168,76,0.4)" } : {}}
                  >
                    <span>{cat.icon}</span>
                  </div>
                  <span className="sv-tab-label">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Group Filter Chips ── */}
        {groups.length > 0 && (
          <div className="sv-chips-row">
            <button
              className={`sv-chip ${selectedGroup === null ? "sv-chip-on" : ""}`}
              onClick={() => setSelectedGroup(null)}
            >
              All ({selectedCat.services.length})
            </button>
            {groups.map(g => (
              <button
                key={g}
                className={`sv-chip ${selectedGroup === g ? "sv-chip-on" : ""}`}
                onClick={() => setSelectedGroup(selectedGroup === g ? null : g)}
              >{g}</button>
            ))}
          </div>
        )}

        {/* ── Cards ── */}
        <div className="sv-cards-body">
          <div className="sv-cat-bar">
            <div>
              <div className="sv-cat-bar-name">{selectedCat.label}</div>
              <div className="sv-cat-bar-desc">{selectedCat.desc}</div>
            </div>
            <div className="sv-cat-count">
              {visibleServices.length} service{visibleServices.length !== 1 ? "s" : ""}
            </div>
          </div>

          <div className="sv-cards-grid">
            {visibleServices.map((service, i) => {
              const [c1, c2] = CAT_GRADIENTS[selectedCat.id] ?? ["#f5f5f5", "#e5e5e5"];
              return (
                <div key={`${service.group ?? ""}-${service.name}-${i}`} className="sv-sc">
                  <div className="sv-sc-img" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                    <span className="sv-sc-img-icon">{selectedCat.icon}</span>
                    {service.popular && <span className="sv-sc-pop">Popular</span>}
                    {service.group  && <span className="sv-sc-group">{service.group}</span>}
                    {service.duration && (
                      <div className="sv-sc-dur">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                        </svg>
                        {service.duration}
                      </div>
                    )}
                  </div>
                  <div className="sv-sc-body">
                    <div className="sv-sc-name">{service.name}</div>
                    {getCardSubtitle(service, selectedCat.id) && (
                      <div className="sv-sc-subtitle">{getCardSubtitle(service, selectedCat.id)}</div>
                    )}
                    {getCardDesc(service) && (
                      <div className="sv-sc-desc">{getCardDesc(service)}</div>
                    )}
                    <div className="sv-sc-price-row">
                      <span className="sv-sc-price">₹{service.price.toLocaleString()}</span>
                      <span className="sv-sc-gst">Incl. GST</span>
                    </div>
                    <div className="sv-sc-btn">
                      <button
                        className={selectedCat.homeService ? "" : "call-btn"}
                        onClick={() => handleBookService(service)}
                      >
                        {selectedCat.homeService ? "Book Home Service →" : "📞 Call to Book"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </section>
    </>
  );
}
