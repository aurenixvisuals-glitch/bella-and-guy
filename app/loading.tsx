export default function Loading() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,400&family=Inter:wght@400;600&display=swap');
        .pg-load {
          position: fixed; inset: 0; background: #07070a;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          z-index: 9999; gap: 28px;
        }
        .pg-logo-ring {
          width: 72px; height: 72px; border-radius: 20px;
          background: linear-gradient(135deg, #c9a84c, #f5d98b);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Inter', sans-serif; font-weight: 800; font-size: 20px; color: #1a1000;
          box-shadow: 0 0 0 0 rgba(201,168,76,0.4);
          animation: logoPulse 2s ease-in-out infinite;
        }
        @keyframes logoPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(201,168,76,0.4), 0 8px 32px rgba(201,168,76,0.3); }
          50%      { box-shadow: 0 0 0 14px rgba(201,168,76,0), 0 8px 48px rgba(201,168,76,0.5); }
        }
        .pg-brand {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px; font-weight: 300; color: #fff; letter-spacing: 0.04em;
          animation: fadeIn 0.6s ease both;
        }
        .pg-brand em { font-style: italic; color: #c9a84c; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);} }
        .pg-bar-wrap {
          width: 160px; height: 2px; background: rgba(255,255,255,0.06);
          border-radius: 2px; overflow: hidden;
        }
        .pg-bar {
          height: 100%;
          background: linear-gradient(90deg, #c9a84c, #f5d98b, #c9a84c);
          background-size: 200% 100%;
          animation: barSlide 1.4s ease-in-out infinite;
          border-radius: 2px;
        }
        @keyframes barSlide {
          0%   { width: 0%; margin-left: 0; }
          50%  { width: 70%; margin-left: 15%; }
          100% { width: 0%; margin-left: 100%; }
        }
        .pg-sub {
          font-family: 'Inter', sans-serif;
          font-size: 10px; font-weight: 600; color: #3a3a3a;
          letter-spacing: 0.22em; text-transform: uppercase;
          animation: fadeIn 0.6s ease 0.2s both;
        }
      `}</style>
      <div className="pg-load">
        <div className="pg-logo-ring">B&G</div>
        <div className="pg-brand">Bella <em>&</em> Guy</div>
        <div className="pg-bar-wrap"><div className="pg-bar" /></div>
        <div className="pg-sub">Salon Management</div>
      </div>
    </>
  );
}
