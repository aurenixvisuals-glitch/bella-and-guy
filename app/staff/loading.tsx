export default function StaffLoading() {
  return (
    <>
      <style>{`
        .sl { position:fixed;inset:0;background:#07070a;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;z-index:9999; }
        .sl-ring { width:52px;height:52px;border-radius:50%;border:2px solid rgba(201,168,76,0.12);border-top:2px solid #c9a84c;animation:slSpin 0.8s linear infinite; }
        @keyframes slSpin{to{transform:rotate(360deg);}}
        .sl-text { font-family:sans-serif;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#2a2a2a;animation:slFade 0.6s ease both; }
        @keyframes slFade{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}
        .sl-bar { width:120px;height:1px;background:rgba(255,255,255,0.04);border-radius:1px;overflow:hidden; }
        .sl-fill { height:100%;background:linear-gradient(90deg,#c9a84c,#f5d98b,#c9a84c);background-size:200% 100%;animation:slBar 1.2s ease-in-out infinite; }
        @keyframes slBar{0%{width:0%;margin-left:0;}50%{width:60%;margin-left:20%;}100%{width:0%;margin-left:100%;}}
      `}</style>
      <div className="sl">
        <div className="sl-ring" />
        <div className="sl-text">Staff Portal</div>
        <div className="sl-bar"><div className="sl-fill"/></div>
      </div>
    </>
  );
}
