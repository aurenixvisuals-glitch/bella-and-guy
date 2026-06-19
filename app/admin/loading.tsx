export default function AdminLoading() {
  return (
    <>
      <style>{`
        .al { position:fixed;inset:0;background:#07070a;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;z-index:9999; }
        .al-logo { width:72px;height:72px;border-radius:50%;overflow:hidden;flex-shrink:0;animation:alPulse 1.8s ease-in-out infinite; }
        .al-logo img { width:100%;height:100%;object-fit:cover;display:block; }
        @keyframes alPulse{0%,100%{box-shadow:0 0 0 0 rgba(201,168,76,0.4);}50%{box-shadow:0 0 0 12px rgba(201,168,76,0);}}
        .al-text { font-family:sans-serif;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#2a2a2a;animation:alFade 0.6s ease both; }
        @keyframes alFade{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}
        .al-dots { display:flex;gap:6px; }
        .al-dot { width:5px;height:5px;border-radius:50%;background:#c9a84c;animation:alDot 1.2s ease-in-out infinite; }
        .al-dot:nth-child(2){animation-delay:0.2s;}
        .al-dot:nth-child(3){animation-delay:0.4s;}
        @keyframes alDot{0%,80%,100%{transform:scale(0.5);opacity:0.3;}40%{transform:scale(1);opacity:1;}}
      `}</style>
      <div className="al">
        <div className="al-logo"><img src="/images/logo.png" alt="Bella & Guy" /></div>
        <div className="al-text">Admin Panel</div>
        <div className="al-dots">
          <div className="al-dot"/><div className="al-dot"/><div className="al-dot"/>
        </div>
      </div>
    </>
  );
}
