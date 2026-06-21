"use client";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";

const slides = [
  {
    src: "/images/salon-exterior.jpg",
    fallback: "/images/salon-front.jpg",
    label: "Bella & Guy",
    sub: "Wave City's Premier Unisex Salon",
  },
  {
    src: "/images/salon-entrance.jpg",
    fallback: "/images/salon-front.jpg",
    label: "Our Entrance",
    sub: "Walk in, walk out beautiful",
  },
  {
    src: "/images/interior-chairs.jpg",
    fallback: "/images/interior1.jpg",
    label: "Styling Area",
    sub: "Premium chairs & modern ambiance",
  },
  {
    src: "/images/wash-station.jpg",
    fallback: "/images/interior2.jpg",
    label: "Hair Wash Station",
    sub: "Fully equipped & hygienically maintained",
  },
  {
    src: "/images/manicure-station.jpg",
    fallback: "/images/reception.jpg",
    label: "Nail Studio",
    sub: "Manicure, Pedicure & nail art",
  },
  {
    src: "/images/team.jpg",
    fallback: "/images/team.jpg",
    label: "The Bella & Guy Team",
    sub: "15+ certified beauty professionals",
  },
];

const INTERVAL = 4200;

export default function Gallery() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const goTo = useCallback((idx: number) => {
    if (animating) return;
    setAnimating(true);
    setPrev(current);
    setCurrent(idx);
    setProgress(0);
    startTimeRef.current = Date.now();
    setTimeout(() => { setPrev(null); setAnimating(false); }, 700);
  }, [animating, current]);

  const next = useCallback(() => goTo((current + 1) % slides.length), [goTo, current]);
  const prev_ = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [goTo, current]);

  // Auto-advance
  useEffect(() => {
    if (paused) return;
    timerRef.current = setTimeout(next, INTERVAL);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, paused, next]);

  // Progress bar
  useEffect(() => {
    if (paused) return;
    setProgress(0);
    startTimeRef.current = Date.now();
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      setProgress(Math.min((elapsed / INTERVAL) * 100, 100));
    }, 100);
    return () => { if (progressRef.current) clearInterval(progressRef.current); };
  }, [current, paused]);

  const [imgSrcs, setImgSrcs] = useState<string[]>(slides.map(s => s.src));
  function handleImgError(i: number) {
    setImgSrcs(prev => { const n = [...prev]; n[i] = slides[i].fallback; return n; });
  }

  return (
    <>
      <style>{`
        .gl-section {
          background: #080808;
          padding: 100px 0 0;
          overflow: hidden;
        }

        .gl-header {
          text-align: center;
          padding: 0 32px 52px;
        }

        /* Slider container */
        .gl-slider {
          position: relative;
          width: 100%;
          height: clamp(380px, 62vh, 680px);
          overflow: hidden;
          cursor: pointer;
        }

        /* Each slide */
        .gl-slide {
          position: absolute; inset: 0;
          transition: opacity 0.7s cubic-bezier(0.4,0,0.2,1);
        }
        .gl-slide.active  { opacity: 1; z-index: 2; }
        .gl-slide.leaving { opacity: 0; z-index: 1; }
        .gl-slide.hidden  { opacity: 0; z-index: 0; }

        /* Ken-Burns zoom on active slide */
        .gl-slide.active .gl-img {
          animation: glKenBurns 5s ease-in-out forwards;
        }
        @keyframes glKenBurns {
          from { transform: scale(1.06); }
          to   { transform: scale(1.0); }
        }

        .gl-img { width: 100%; height: 100%; object-fit: cover; display: block; }

        /* Gradient overlays */
        .gl-overlay-bottom {
          position: absolute; inset: 0; z-index: 3;
          background: linear-gradient(
            180deg,
            rgba(8,8,8,0.08) 0%,
            rgba(8,8,8,0.0) 40%,
            rgba(8,8,8,0.6) 75%,
            rgba(8,8,8,0.92) 100%
          );
        }
        .gl-overlay-left {
          position: absolute; inset: 0; z-index: 3;
          background: linear-gradient(90deg, rgba(8,8,8,0.5) 0%, transparent 50%);
        }

        /* Caption */
        .gl-caption {
          position: absolute; bottom: 0; left: 0; right: 0; z-index: 4;
          padding: 0 64px 52px;
          display: flex; align-items: flex-end; justify-content: space-between;
        }
        .gl-caption-text { max-width: 540px; }
        .gl-caption-label {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(28px, 4vw, 48px); font-weight: 400; color: #fff;
          line-height: 1.1; margin-bottom: 8px;
          transform: translateY(12px); opacity: 0;
          transition: transform 0.65s cubic-bezier(0.22,1,0.36,1) 0.1s, opacity 0.5s ease 0.1s;
        }
        .gl-slide.active .gl-caption-label { transform: translateY(0); opacity: 1; }
        .gl-caption-sub {
          font-size: 13px; color: rgba(255,255,255,0.5); font-weight: 400; letter-spacing: 0.04em;
          transform: translateY(10px); opacity: 0;
          transition: transform 0.6s cubic-bezier(0.22,1,0.36,1) 0.22s, opacity 0.5s ease 0.22s;
        }
        .gl-slide.active .gl-caption-sub { transform: translateY(0); opacity: 1; }

        /* Dot nav */
        .gl-dots {
          display: flex; gap: 8px; align-items: center;
          padding-bottom: 6px;
        }
        .gl-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: rgba(255,255,255,0.28); border: none; cursor: pointer; padding: 0;
          transition: all 0.3s ease;
        }
        .gl-dot.on { background: #C9A84C; transform: scale(1.4); }

        /* Progress bar */
        .gl-progress {
          position: absolute; bottom: 0; left: 0; height: 2px; z-index: 5;
          background: linear-gradient(90deg, #E8C96D, #C9A84C);
          transition: width 0.03s linear;
        }

        /* Arrow buttons */
        .gl-arrow {
          position: absolute; top: 50%; transform: translateY(-50%);
          z-index: 6; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(10px); color: rgba(255,255,255,0.7);
          width: 48px; height: 48px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 20px;
          transition: all 0.25s ease;
          opacity: 0; pointer-events: none;
        }
        .gl-slider:hover .gl-arrow { opacity: 1; pointer-events: auto; }
        .gl-arrow:hover { background: rgba(201,168,76,0.2); border-color: rgba(201,168,76,0.4); color: #fff; }
        .gl-arrow.gl-prev { left: 20px; }
        .gl-arrow.gl-next { right: 20px; }

        /* Counter badge */
        .gl-counter {
          position: absolute; top: 20px; right: 20px; z-index: 6;
          background: rgba(0,0,0,0.4); backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 100px; padding: 5px 14px;
          font-size: 11px; color: rgba(255,255,255,0.5); letter-spacing: 0.1em;
        }
        .gl-counter span { color: #C9A84C; font-weight: 600; }

        /* Thumbnail strip below */
        .gl-thumbs {
          display: flex; gap: 0; overflow: hidden;
          border-top: 1px solid rgba(201,168,76,0.1);
        }
        .gl-thumb {
          flex: 1; position: relative; height: 90px;
          cursor: pointer; overflow: hidden;
          transition: flex 0.4s cubic-bezier(0.22,1,0.36,1);
          opacity: 0.45;
          border-right: 1px solid rgba(0,0,0,0.4);
        }
        .gl-thumb:last-child { border-right: none; }
        .gl-thumb:hover { opacity: 0.7; }
        .gl-thumb.on { flex: 2; opacity: 1; }
        .gl-thumb-overlay {
          position: absolute; inset: 0; z-index: 2;
          background: rgba(0,0,0,0.25);
          transition: background 0.3s ease;
        }
        .gl-thumb.on .gl-thumb-overlay { background: rgba(0,0,0,0.0); }
        .gl-thumb-bar {
          position: absolute; bottom: 0; left: 0; right: 0; height: 2px; z-index: 3;
          background: #C9A84C; transform: scaleX(0); transform-origin: left;
          transition: transform 0.3s ease;
        }
        .gl-thumb.on .gl-thumb-bar { transform: scaleX(1); }

        @media (max-width: 768px) {
          .gl-caption { padding: 0 24px 36px; }
          .gl-thumbs { display: none; }
          .gl-arrow { width: 38px; height: 38px; font-size: 16px; }
          .gl-dots { padding-bottom: 4px; }
        }
        @media (max-width: 480px) {
          .gl-caption { padding: 0 14px 24px; flex-direction: column; align-items: flex-start; gap: 8px; }
          .gl-caption-sub { font-size: 11px; }
          .gl-arrow { display: none; }
        }
      `}</style>

      <section id="gallery" className="gl-section">

        <div className="gl-header">
          <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "10px", fontWeight: "600", letterSpacing: "0.22em", textTransform: "uppercase", color: "#C9A84C", marginBottom: "16px" }}>
            <span style={{ width: "20px", height: "1px", background: "#C9A84C", display: "inline-block" }} />
            Our Space
          </span>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(34px,5vw,54px)", fontWeight: "400", color: "#fff", lineHeight: "1.1" }}>
            Inside Bella & Guy
          </h2>
          <div style={{ width: "40px", height: "1px", background: "linear-gradient(90deg,transparent,#C9A84C,transparent)", margin: "16px auto 0" }} />
        </div>

        {/* Main slider */}
        <div
          className="gl-slider"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => { setPaused(false); startTimeRef.current = Date.now() - progress / 100 * INTERVAL; }}
        >
          {slides.map((slide, i) => (
            <div
              key={i}
              className={`gl-slide ${i === current ? "active" : i === prev ? "leaving" : "hidden"}`}
            >
              <Image
                src={imgSrcs[i]}
                alt={slide.label}
                fill
                className="gl-img"
                style={{ objectFit: "cover" }}
                priority={i === 0}
                onError={() => handleImgError(i)}
              />
              <div className="gl-overlay-bottom" />
              <div className="gl-overlay-left" />
              <div className="gl-caption">
                <div className="gl-caption-text">
                  <div className="gl-caption-label">{slide.label}</div>
                  <div className="gl-caption-sub">{slide.sub}</div>
                </div>
                <div className="gl-dots">
                  {slides.map((_, d) => (
                    <button key={d} className={`gl-dot ${d === current ? "on" : ""}`} onClick={() => goTo(d)} />
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Progress bar */}
          <div className="gl-progress" style={{ width: `${progress}%` }} />

          {/* Counter */}
          <div className="gl-counter"><span>{current + 1}</span> / {slides.length}</div>

          {/* Arrows */}
          <button className="gl-arrow gl-prev" onClick={e => { e.stopPropagation(); prev_(); }}>‹</button>
          <button className="gl-arrow gl-next" onClick={e => { e.stopPropagation(); next(); }}>›</button>
        </div>

        {/* Thumbnail strip */}
        <div className="gl-thumbs">
          {slides.map((slide, i) => (
            <div key={i} className={`gl-thumb ${i === current ? "on" : ""}`} onClick={() => goTo(i)}>
              <Image src={imgSrcs[i]} alt={slide.label} fill style={{ objectFit: "cover" }} onError={() => handleImgError(i)} />
              <div className="gl-thumb-overlay" />
              <div className="gl-thumb-bar" />
            </div>
          ))}
        </div>

      </section>
    </>
  );
}
