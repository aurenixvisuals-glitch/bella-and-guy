"use client";
import { useState, useEffect, useRef } from "react";
import { allCategories } from "../lib/servicesData";

interface ServicesProps {
  onServiceSelect?: (service: string, catId: string) => void;
  title?: string;
  subtitle?: string;
}

export default function Services({ onServiceSelect, title, subtitle }: ServicesProps = {}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.06 }
    );
    sectionRef.current?.querySelectorAll(".reveal, .reveal-scale").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function handleCardClick(id: string) {
    if (selectedId === id) {
      setSelectedId(null);
      setSelectedService(null);
    } else {
      setSelectedId(id);
      setSelectedService(null);
      setTimeout(() => panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
    }
  }

  function handleServiceRowClick(name: string) {
    if (onServiceSelect && selectedId) {
      const cat = allCategories.find(c => c.id === selectedId);
      const value = `${name} — ${cat?.label}`;
      setSelectedService(name);
      onServiceSelect(value, selectedId);
    } else {
      setSelectedService(prev => prev === name ? null : name);
    }
  }

  function handleBook() {
    const cat = allCategories.find(c => c.id === selectedId);
    const value = selectedService
      ? `${selectedService} — ${cat?.label}`
      : (cat?.label ?? "");
    if (onServiceSelect && selectedId) {
      onServiceSelect(value, selectedId);
    } else {
      if (value) localStorage.setItem("preselectService", value);
      window.location.href = "/book";
    }
  }

  const selected = allCategories.find(c => c.id === selectedId) ?? null;

  const PriceRows = ({ services }: { services: typeof allCategories[0]["services"] }) => (
    <>
      {services.map((s, i) => {
        const isSelected = selectedService === s.name;
        return (
          <div
            key={i}
            className={`sv-price-row ${isSelected ? "sv-row-selected" : ""}`}
            onClick={() => handleServiceRowClick(s.name)}
            role="button" tabIndex={0}
            onKeyDown={e => e.key === "Enter" && handleServiceRowClick(s.name)}
          >
            <div className="sv-price-left">
              <span className="sv-row-check">{isSelected ? "✓" : ""}</span>
              {s.popular && <span className="sv-pop-tag">Popular</span>}
              <span className={`sv-price-name ${s.popular ? "bold" : ""}`}>{s.name}</span>
            </div>
            <span className="sv-price-val">₹{s.price.toLocaleString()}</span>
          </div>
        );
      })}
    </>
  );

  return (
    <>
      <style>{`
        .sv-section { background: #FAF7F0; padding: 100px 32px 120px; }

        .sv-header { text-align: center; margin-bottom: 60px; }
        .sv-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 10px; font-weight: 600; letter-spacing: 0.22em;
          text-transform: uppercase; color: #C9A84C; margin-bottom: 16px;
        }
        .sv-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(36px, 5vw, 56px); font-weight: 400;
          color: #080808; line-height: 1.1; margin-bottom: 12px;
        }
        .sv-divider { width: 40px; height: 1px; background: linear-gradient(90deg, transparent, #C9A84C, transparent); margin: 0 auto 18px; }
        .sv-subtitle { color: #6B6B6B; font-size: 15px; }

        /* Card Grid */
        .sv-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }

        .sv-card {
          background: #fff; border: 1.5px solid rgba(0,0,0,0.07); border-radius: 12px;
          padding: 24px 20px 20px; cursor: pointer;
          transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
          position: relative; overflow: hidden;
          display: flex; flex-direction: column; gap: 10px;
        }
        .sv-card::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, #E8C96D, #C9A84C);
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.3s cubic-bezier(0.22,1,0.36,1);
        }
        .sv-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.1); border-color: rgba(201,168,76,0.25); }
        .sv-card:hover::after { transform: scaleX(1); }
        .sv-card.sv-active { border-color: #C9A84C; box-shadow: 0 0 0 1px rgba(201,168,76,0.3), 0 16px 40px rgba(201,168,76,0.12); background: #fffdf6; }
        .sv-card.sv-active::after { transform: scaleX(1); }

        .sv-card-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; transition: transform 0.3s ease; }
        .sv-card:hover .sv-card-icon { transform: scale(1.08); }
        .sv-card-name { font-family: 'Cormorant Garamond', serif; font-size: 18px; font-weight: 500; color: #080808; line-height: 1.2; }
        .sv-card-meta { display: flex; align-items: center; justify-content: space-between; margin-top: auto; }
        .sv-card-from { font-size: 11.5px; color: #C9A84C; font-weight: 700; }
        .sv-card-count { font-size: 10px; color: #aaa; font-weight: 500; background: rgba(0,0,0,0.04); border-radius: 20px; padding: 2px 8px; }
        .sv-card-arrow { position: absolute; top: 16px; right: 16px; font-size: 10px; color: rgba(0,0,0,0.18); transition: all 0.25s ease; }
        .sv-card:hover .sv-card-arrow { color: #C9A84C; transform: translateX(2px); }
        .sv-card.sv-active .sv-card-arrow { color: #C9A84C; transform: rotate(90deg); }

        /* Expanded Panel */
        .sv-panel-wrap { overflow: hidden; max-height: 0; transition: max-height 0.55s cubic-bezier(0.22,1,0.36,1), opacity 0.4s ease; opacity: 0; }
        .sv-panel-wrap.open { max-height: 900px; opacity: 1; margin-top: 20px; }

        .sv-panel { background: #fff; border: 1px solid rgba(201,168,76,0.18); border-radius: 12px; overflow: hidden; box-shadow: 0 24px 64px rgba(0,0,0,0.08); }

        /* Image banner at top of panel */
        .sv-panel-img-wrap {
          position: relative; width: 100%; height: 200px; overflow: hidden;
          background: #f0ece0;
        }
        .sv-panel-img {
          width: 100%; height: 100%; object-fit: cover; object-position: center;
          transition: transform 0.6s cubic-bezier(0.22,1,0.36,1);
          display: block;
        }
        .sv-panel-img-wrap:hover .sv-panel-img { transform: scale(1.03); }
        .sv-panel-img-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.55) 100%);
        }
        .sv-panel-img-badge {
          position: absolute; bottom: 20px; left: 28px;
          display: flex; align-items: center; gap: 10px;
        }
        .sv-panel-img-icon {
          width: 44px; height: 44px; border-radius: 10px; border: 1.5px solid rgba(201,168,76,0.5);
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; background: rgba(255,255,255,0.1); backdrop-filter: blur(8px);
        }
        .sv-panel-img-label {
          font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 500; color: #fff;
          text-shadow: 0 2px 12px rgba(0,0,0,0.3); line-height: 1;
        }
        .sv-panel-img-sub { font-size: 12px; color: rgba(255,255,255,0.65); margin-top: 3px; }

        /* Fallback gradient when image is missing */
        .sv-panel-img-fallback {
          width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
          font-size: 64px; opacity: 0.25;
        }

        .sv-panel-head {
          padding: 20px 36px 20px; border-bottom: 1px solid rgba(0,0,0,0.07);
          display: flex; align-items: center; justify-content: space-between;
          background: #fffdf6;
        }
        .sv-panel-title { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 500; color: #080808; margin-bottom: 3px; }
        .sv-panel-desc { font-size: 12.5px; color: #888; line-height: 1.5; }
        .sv-panel-close {
          background: none; border: 1px solid rgba(0,0,0,0.1); border-radius: 50%;
          width: 32px; height: 32px; cursor: pointer; font-size: 16px; color: #888;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s ease; flex-shrink: 0; margin-left: 20px;
        }
        .sv-panel-close:hover { background: #f5f5f5; color: #333; }

        .sv-panel-body { padding: 0 36px; }
        .sv-price-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 0 48px; }
        .sv-price-col-single { display: grid; grid-template-columns: 1fr; }

        /* Price rows — now clickable */
        .sv-price-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 10px; border-bottom: 1px solid rgba(0,0,0,0.05);
          cursor: pointer; border-radius: 6px; margin: 0 -10px;
          transition: background 0.18s ease, border-color 0.18s ease;
          position: relative;
        }
        .sv-price-row:last-child { border-bottom: none; }
        .sv-price-row:hover { background: rgba(201,168,76,0.04); }
        .sv-price-row.sv-row-selected {
          background: rgba(201,168,76,0.08);
          border-bottom-color: rgba(201,168,76,0.15);
        }
        .sv-price-row.sv-row-selected .sv-price-name { color: #080808; font-weight: 600; }

        .sv-row-check {
          width: 18px; height: 18px; border-radius: 50%;
          border: 1.5px solid rgba(0,0,0,0.15);
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 700; color: #fff;
          flex-shrink: 0; background: transparent;
          transition: all 0.2s ease;
        }
        .sv-price-row.sv-row-selected .sv-row-check {
          background: #C9A84C; border-color: #C9A84C; color: #fff;
        }

        .sv-price-left { display: flex; align-items: center; gap: 10px; }
        .sv-pop-tag { font-size: 9px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; background: rgba(201,168,76,0.12); color: #C9A84C; padding: 2px 7px; border-radius: 2px; flex-shrink: 0; }
        .sv-price-name { font-size: 13.5px; color: #2a2a2a; font-weight: 400; transition: color 0.15s; }
        .sv-price-name.bold { font-weight: 500; }
        .sv-price-val { font-size: 14px; font-weight: 700; color: #C9A84C; flex-shrink: 0; }

        /* Footer */
        .sv-panel-foot {
          padding: 18px 36px 28px; border-top: 1px solid rgba(0,0,0,0.06);
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
        }
        .sv-gst { font-size: 11px; color: rgba(0,0,0,0.28); }

        .sv-selected-badge {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.25);
          border-radius: 100px; padding: 5px 12px 5px 8px;
          font-size: 11.5px; font-weight: 600; color: #8a6a1a;
          max-width: 260px; overflow: hidden;
        }
        .sv-selected-badge-check { color: #C9A84C; font-weight: 700; font-size: 12px; }
        .sv-selected-badge-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        .sv-book-btn {
          display: inline-flex; align-items: center; gap: 7px; flex-shrink: 0;
          padding: 11px 26px; border-radius: 4px; font-size: 11px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase; cursor: pointer; border: none;
          transition: all 0.25s ease; box-shadow: 0 4px 16px rgba(201,168,76,0.25);
          background: linear-gradient(135deg, #E8C96D, #C9A84C); color: #080808;
        }
        .sv-book-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(201,168,76,0.4); }
        .sv-book-btn.has-selection { background: linear-gradient(135deg, #C9A84C, #9E7A2E); }

        @media (max-width: 1024px) { .sv-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 700px) {
          .sv-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .sv-section { padding: 80px 16px 100px; }
          .sv-price-cols { grid-template-columns: 1fr; gap: 0; }
          .sv-panel-head { padding: 20px 20px 16px; }
          .sv-panel-body { padding: 0 20px; }
          .sv-panel-foot { flex-direction: column; align-items: flex-start; padding: 14px 20px 22px; }
          .sv-selected-badge { max-width: 100%; }
        }
        @media (max-width: 480px) {
          .sv-grid { grid-template-columns: 1fr; gap: 10px; }
          .sv-section { padding: 60px 16px 80px; }
          .sv-panel-head { padding: 16px 16px 12px; }
          .sv-panel-body { padding: 0 16px; }
          .sv-panel-foot { padding: 12px 16px 18px; }
          .sv-panel-close { width: 40px; height: 40px; }
          .sv-card-name { font-size: 14px; }
        }
      `}</style>

      <section id="services" className="sv-section" ref={sectionRef}>
        <div style={{ maxWidth: "1160px", margin: "0 auto" }}>

          <div className="sv-header">
            <div className="reveal sv-eyebrow">
              <span style={{ width: "20px", height: "1px", background: "#C9A84C", display: "inline-block" }} />
              What We Offer
            </div>
            <h2 className="reveal sv-title">{title ?? "Our Premium Services"}</h2>
            <div className="sv-divider" />
            <p className="reveal sv-subtitle">{subtitle ?? "Tap a category, select your service, then book — done in seconds"}</p>
          </div>

          <div className="sv-grid">
            {allCategories.map((cat, i) => (
              <div
                key={cat.id}
                className={`sv-card reveal-scale reveal-d${Math.min(i + 1, 12)} ${selectedId === cat.id ? "sv-active" : ""}`}
                onClick={() => handleCardClick(cat.id)}
                role="button" tabIndex={0}
                onKeyDown={e => e.key === "Enter" && handleCardClick(cat.id)}
              >
                <span className="sv-card-arrow">▶</span>
                <div className="sv-card-icon" style={{ background: cat.color }}>{cat.icon}</div>
                <div className="sv-card-name">{cat.label}</div>
                <div className="sv-card-meta">
                  <span className="sv-card-from">From ₹{Math.min(...cat.services.map(s => s.price)).toLocaleString()}</span>
                  <span className="sv-card-count">{cat.services.length} services</span>
                </div>
              </div>
            ))}
          </div>

          {/* Expanded price panel */}
          <div className={`sv-panel-wrap ${selected ? "open" : ""}`} ref={panelRef}>
            {selected && (
              <div className="sv-panel">

                {/* Category image banner */}
                <div className="sv-panel-img-wrap" style={{ background: selected.color }}>
                  <img
                    src={selected.img}
                    alt={selected.label}
                    className="sv-panel-img"
                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                  <div className="sv-panel-img-overlay" />
                  <div className="sv-panel-img-badge">
                    <div className="sv-panel-img-icon">{selected.icon}</div>
                    <div>
                      <div className="sv-panel-img-label">{selected.label}</div>
                      <div className="sv-panel-img-sub">{selected.services.length} services available</div>
                    </div>
                  </div>
                  <button
                    className="sv-panel-close"
                    style={{ position: "absolute", top: 16, right: 16, background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", backdropFilter: "blur(8px)" }}
                    onClick={() => { setSelectedId(null); setSelectedService(null); }}
                  >✕</button>
                </div>

                <div className="sv-panel-head">
                  <div>
                    <div className="sv-panel-title">{selected.desc}</div>
                    <div className="sv-panel-desc">Tap a service to select it, then book below</div>
                  </div>
                </div>

                <div className="sv-panel-body">
                  <div className={selected.services.length > 6 ? "sv-price-cols" : "sv-price-col-single"}>
                    {selected.services.length > 6 ? (
                      <>
                        <div><PriceRows services={selected.services.slice(0, Math.ceil(selected.services.length / 2))} /></div>
                        <div><PriceRows services={selected.services.slice(Math.ceil(selected.services.length / 2))} /></div>
                      </>
                    ) : (
                      <div><PriceRows services={selected.services} /></div>
                    )}
                  </div>
                </div>

                <div className="sv-panel-foot">
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {selectedService ? (
                      <div className="sv-selected-badge">
                        <span className="sv-selected-badge-check">✓</span>
                        <span className="sv-selected-badge-name">{selectedService}</span>
                      </div>
                    ) : (
                      <span className="sv-gst">*GST extra as applicable</span>
                    )}
                    {selectedService && <span style={{ fontSize: "10px", color: "rgba(0,0,0,0.28)" }}>*GST extra as applicable</span>}
                  </div>
                  <button
                    className={`sv-book-btn ${selectedService ? "has-selection" : ""}`}
                    onClick={handleBook}
                  >
                    {onServiceSelect
                      ? (selectedService ? `✓ Selected — Scroll to Book` : `Select ${selected.label} →`)
                      : (selectedService ? `Book Now →` : `Book ${selected.label} →`)
                    }
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>
    </>
  );
}
