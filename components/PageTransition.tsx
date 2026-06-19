"use client";
import { useEffect, useState } from "react";

export default function PageTransition() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 500);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <>
      <style>{`
        .pt-veil {
          position: fixed; inset: 0; z-index: 99999; pointer-events: none;
          background: #07070a;
          animation: ptFade 0.5s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        @keyframes ptFade {
          0%   { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
      <div className="pt-veil" />
    </>
  );
}
