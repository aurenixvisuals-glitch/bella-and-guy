"use client";
import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const dotRef       = useRef<HTMLDivElement>(null);
  const ringRef      = useRef<HTMLDivElement>(null);
  const particleRef  = useRef<HTMLDivElement>(null);
  const pos          = useRef({ x: -200, y: -200 });
  const ringPos      = useRef({ x: -200, y: -200 });
  const rafRef       = useRef<number>(0);
  const lastSpawn    = useRef(0);
  const [visible,  setVisible]  = useState(false);
  const [clicking, setClicking] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    // ── RAF loop: smooth ring follows dot (lerp 0.13) ──
    function loop() {
      const lp = 0.13;
      ringPos.current.x += (pos.current.x - ringPos.current.x) * lp;
      ringPos.current.y += (pos.current.y - ringPos.current.y) * lp;

      const dx = Math.round(pos.current.x * 100) / 100;
      const dy = Math.round(pos.current.y * 100) / 100;
      const rx = Math.round(ringPos.current.x * 100) / 100;
      const ry = Math.round(ringPos.current.y * 100) / 100;

      if (dotRef.current)
        dotRef.current.style.transform = `translate3d(${dx}px,${dy}px,0)`;
      if (ringRef.current)
        ringRef.current.style.transform = `translate3d(${rx}px,${ry}px,0)`;

      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    document.body.classList.add("cursor-active");

    // ── Spawn particle (imperative, no React state) ──
    function spawnParticle(x: number, y: number, count = 1) {
      if (!particleRef.current) return;
      for (let i = 0; i < count; i++) {
        const p    = document.createElement("div");
        const size = Math.random() * 5 + 2;
        const angle= Math.random() * Math.PI * 2;
        const dist = Math.random() * 32 + 8;
        const dx   = Math.cos(angle) * dist;
        const dy   = Math.sin(angle) * dist;
        const dur  = Math.random() * 350 + 380;
        const gold = Math.random() > 0.45;

        p.style.cssText = `
          position:absolute;
          left:${x}px; top:${y}px;
          width:${size}px; height:${size}px;
          border-radius:50%;
          background:${gold ? "rgba(201,168,76,0.88)" : "rgba(232,201,109,0.72)"};
          box-shadow:0 0 ${size * 2.5}px rgba(201,168,76,0.65);
          pointer-events:none;
          transform:translate3d(-50%,-50%,0) scale(1);
          opacity:1;
          will-change:transform,opacity;
        `;
        particleRef.current.appendChild(p);

        // Double-rAF ensures browser has painted initial state
        requestAnimationFrame(() => requestAnimationFrame(() => {
          p.style.transition = `transform ${dur}ms cubic-bezier(0.22,0.61,0.36,1), opacity ${dur}ms ease`;
          p.style.transform  = `translate3d(calc(-50% + ${dx}px),calc(-50% + ${dy}px),0) scale(0)`;
          p.style.opacity    = "0";
        }));

        setTimeout(() => p.remove(), dur + 20);
      }
    }

    // ── Event delegation for hover (single listener, no leaks) ──
    const INTERACTIVE = "a,button,input,select,textarea,[role='button'],label,[tabindex]";
    function onBodyEnter(e: MouseEvent) {
      if ((e.target as Element).closest(INTERACTIVE)) setHovering(true);
    }
    function onBodyLeave(e: MouseEvent) {
      if ((e.target as Element).closest(INTERACTIVE)) setHovering(false);
    }

    function onMove(e: MouseEvent) {
      pos.current = { x: e.clientX, y: e.clientY };
      setVisible(true);

      const now = Date.now();
      if (now - lastSpawn.current > 35) {
        lastSpawn.current = now;
        spawnParticle(e.clientX, e.clientY, 1);
      }
    }

    function onDown(e: MouseEvent) {
      setClicking(true);
      spawnParticle(e.clientX, e.clientY, 10);
    }
    function onUp()    { setClicking(false); }
    function onLeave() { setVisible(false); }
    function onEnter() { setVisible(true); }

    document.addEventListener("mousemove",   onMove,      { passive: true });
    document.addEventListener("mouseenter",  onEnter);
    document.addEventListener("mouseleave",  onLeave);
    document.addEventListener("mousedown",   onDown);
    document.addEventListener("mouseup",     onUp);
    document.body.addEventListener("mouseover",  onBodyEnter, { passive: true });
    document.body.addEventListener("mouseout",   onBodyLeave, { passive: true });

    return () => {
      cancelAnimationFrame(rafRef.current);
      document.body.classList.remove("cursor-active");
      document.removeEventListener("mousemove",  onMove);
      document.removeEventListener("mouseenter", onEnter);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mousedown",  onDown);
      document.removeEventListener("mouseup",    onUp);
      document.body.removeEventListener("mouseover",  onBodyEnter);
      document.body.removeEventListener("mouseout",   onBodyLeave);
    };
  }, []);

  // Touch devices — no custom cursor
  if (typeof window !== "undefined" && window.matchMedia("(pointer:coarse)").matches) return null;

  const dotSize  = clicking ? 5  : hovering ? 11 : 7;
  const ringSize = clicking ? 16 : hovering ? 52 : 34;

  return (
    <>
      <style>{`
        body.cursor-active *, body.cursor-active *::before, body.cursor-active *::after { cursor: none !important; }
        .cc-dot, .cc-ring, .cc-particles { pointer-events:none; position:fixed; top:0; left:0; z-index:99999; will-change:transform; }
        .cc-particles { z-index:99998; width:0; height:0; overflow:visible; }
      `}</style>

      <div ref={particleRef} className="cc-particles" />

      {/* Trailing ring */}
      <div ref={ringRef} className="cc-ring" style={{
        width: ringSize, height: ringSize,
        marginLeft: -(ringSize / 2), marginTop: -(ringSize / 2),
        borderRadius: "50%",
        border: `1.5px solid rgba(201,168,76,${hovering ? 0.8 : 0.52})`,
        background: hovering ? "rgba(201,168,76,0.07)" : "transparent",
        backdropFilter: hovering ? "blur(3px)" : "none",
        opacity: visible ? (hovering ? 0.75 : 0.48) : 0,
        transition: [
          "width .35s cubic-bezier(.34,1.56,.64,1)",
          "height .35s cubic-bezier(.34,1.56,.64,1)",
          "margin .35s cubic-bezier(.34,1.56,.64,1)",
          "opacity .3s ease",
          "border-color .2s ease",
          "background .2s ease",
        ].join(","),
      }} />

      {/* Inner dot */}
      <div ref={dotRef} className="cc-dot" style={{
        width: dotSize, height: dotSize,
        marginLeft: -(dotSize / 2), marginTop: -(dotSize / 2),
        borderRadius: "50%",
        background: hovering ? "linear-gradient(135deg,#E8C96D,#C9A84C)" : "#C9A84C",
        opacity: visible ? 1 : 0,
        boxShadow: hovering
          ? "0 0 14px rgba(201,168,76,1), 0 0 30px rgba(201,168,76,0.5)"
          : "0 0 8px rgba(201,168,76,0.8)",
        transition: [
          "width .2s ease", "height .2s ease", "margin .2s ease",
          "opacity .3s ease", "box-shadow .25s ease",
        ].join(","),
      }} />
    </>
  );
}
