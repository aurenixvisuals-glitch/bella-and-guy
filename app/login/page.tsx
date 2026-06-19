"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

type LoginType = "admin" | "staff";

export default function LoginPage() {
  const router = useRouter();
  const [loginType, setLoginType] = useState<LoginType>("admin");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [showPass, setShowPass]   = useState(false);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Incorrect email or password.");
      setLoading(false);
      return;
    }

    const userEmail = data.user?.email?.trim().toLowerCase() ?? "";
    const { data: sd } = await supabase.from("staff").select("*").ilike("email", userEmail);
    const staffRow = sd?.[0];

    if (loginType === "admin") {
      // Admin tab: must exist in staff table with role admin (or no role column)
      if (!staffRow) {
        await supabase.auth.signOut();
        setError("Access denied. You are not an admin.");
        setLoading(false);
        return;
      }
      // If role column exists, check it
      if (staffRow.role && staffRow.role !== "admin") {
        await supabase.auth.signOut();
        setError("Access denied. Please use the Staff tab.");
        setLoading(false);
        return;
      }
      router.push("/admin");
    } else {
      // Staff tab: must exist in staff table
      if (!staffRow) {
        await supabase.auth.signOut();
        setError("Access denied. No staff record found.");
        setLoading(false);
        return;
      }
      if (staffRow.role && staffRow.role === "admin") {
        await supabase.auth.signOut();
        setError("Access denied. Please use the Admin tab.");
        setLoading(false);
        return;
      }
      router.push("/staff");
    }
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; }

        .lp {
          min-height: 100vh; background: #07070f;
          display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden;
        }

        /* blobs */
        .bl { position: absolute; border-radius: 50%; filter: blur(90px); pointer-events: none; }
        .bl1 { width: 480px; height: 480px; background: radial-gradient(circle,rgba(201,168,76,0.18),transparent); top:-160px; left:-160px; animation: b1 9s ease-in-out infinite; }
        .bl2 { width: 360px; height: 360px; background: radial-gradient(circle,rgba(90,130,245,0.12),transparent); bottom:-100px; right:-100px; animation: b2 11s ease-in-out infinite; }
        @keyframes b1{0%,100%{transform:translate(0,0);}50%{transform:translate(28px,36px);}}
        @keyframes b2{0%,100%{transform:translate(0,0);}50%{transform:translate(-18px,-26px);}}

        /* grid */
        .grid { position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(rgba(201,168,76,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,0.03) 1px,transparent 1px);background-size:56px 56px; }

        /* card */
        .card {
          position:relative;z-index:10;width:100%;max-width:420px;margin:16px;
          background:rgba(255,255,255,0.09);
          backdrop-filter:blur(48px) saturate(220%) brightness(114%);
          -webkit-backdrop-filter:blur(48px) saturate(220%) brightness(114%);
          border:1px solid rgba(255,255,255,0.22);
          border-radius:24px;
          padding:42px 38px 36px;
          box-shadow:
            inset 0 1.5px 0 rgba(255,255,255,0.55),
            inset 0 -1px 0 rgba(0,0,0,0.18),
            inset 1px 0 0 rgba(255,255,255,0.18),
            inset -1px 0 0 rgba(255,255,255,0.08),
            0 32px 80px rgba(0,0,0,0.55),
            0 4px 16px rgba(0,0,0,0.2);
          animation:cu 0.55s cubic-bezier(0.22,1,0.36,1) both;
          overflow:hidden;
        }
        .card::before {
          content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:0;
          background:
            radial-gradient(ellipse 70% 45% at 20% 5%, rgba(255,255,255,0.2), transparent 60%),
            radial-gradient(ellipse 40% 55% at 80% 95%, rgba(255,255,255,0.07), transparent 60%);
        }
        .card > * { position:relative;z-index:1; }
        @keyframes cu{from{opacity:0;transform:translateY(28px) scale(0.97);}to{opacity:1;transform:translateY(0) scale(1);}}

        /* logo */
        .logo {
          width:60px;height:60px;border-radius:16px;
          background:linear-gradient(135deg,#c9a84c,#f5d98b);
          display:flex;align-items:center;justify-content:center;
          font-weight:800;font-size:17px;color:#1a1000;
          margin:0 auto 18px;
          box-shadow:0 6px 28px rgba(201,168,76,0.32);
          animation:li 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s both;
        }
        @keyframes li{from{opacity:0;transform:scale(0.65) rotate(-8deg);}to{opacity:1;transform:scale(1) rotate(0);}}

        .brand { text-align:center; font-family:'Cormorant Garamond',serif; font-size:28px; font-weight:600; color:#fff; letter-spacing:0.01em; }
        .brand em { font-style:italic; color:#c9a84c; }
        .brand-sub { text-align:center; font-size:10px; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; color:#3a3a3a; margin-top:5px; margin-bottom:28px; }

        /* TABS */
        .tabs { display:grid; grid-template-columns:1fr 1fr; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:10px; padding:3px; margin-bottom:26px; }
        .tab {
          padding:10px 0; border-radius:8px; border:none; cursor:pointer;
          font-size:12px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase;
          font-family:'Inter',sans-serif; transition:all 0.22s; background:transparent; color:#3a3a3a;
        }
        .tab.on { background:rgba(201,168,76,0.12); color:#c9a84c; box-shadow:inset 0 1px 0 rgba(201,168,76,0.15); }
        .tab:hover:not(.on) { color:#666; }

        /* FIELDS */
        .flabel { display:block; font-size:11px; font-weight:600; color:#484848; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:8px; }
        .fwrap { position:relative; margin-bottom:14px; }
        .finput {
          width:100%; padding:13px 14px;
          background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);
          border-radius:10px; color:#fff; font-size:14px; font-family:'Inter',sans-serif;
          outline:none; transition:border-color 0.2s,background 0.2s,box-shadow 0.2s;
        }
        .finput:focus { border-color:rgba(201,168,76,0.45); background:rgba(201,168,76,0.04); box-shadow:0 0 0 3px rgba(201,168,76,0.07); }
        .finput::placeholder { color:#333; }

        .eye { position:absolute; right:13px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#444; font-size:14px; padding:4px; transition:color 0.2s; }
        .eye:hover { color:#c9a84c; }

        .err { background:rgba(245,101,101,0.08); border:1px solid rgba(245,101,101,0.18); border-radius:9px; padding:9px 13px; font-size:13px; color:#f56565; margin-bottom:14px; display:flex; align-items:center; gap:7px; }

        /* SUBMIT */
        .sub {
          width:100%; padding:13px; margin-top:6px;
          background:linear-gradient(135deg,#c9a84c,#e8c55a);
          color:#1a1000; font-size:14px; font-weight:700; letter-spacing:0.04em;
          font-family:'Inter',sans-serif; border:none; border-radius:10px; cursor:pointer;
          transition:transform 0.15s,box-shadow 0.2s,opacity 0.2s;
          box-shadow:0 4px 18px rgba(201,168,76,0.28);
        }
        .sub:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 7px 24px rgba(201,168,76,0.4); }
        .sub:disabled { opacity:0.6; cursor:not-allowed; }

        .spin { display:inline-block; width:15px; height:15px; border:2px solid rgba(26,16,0,0.25); border-top-color:#1a1000; border-radius:50%; animation:sp 0.7s linear infinite; vertical-align:middle; margin-right:7px; }
        @keyframes sp{to{transform:rotate(360deg);}}

        .fnote { text-align:center; font-size:11px; color:#252525; margin-top:22px; }

        /* particles */
        .pt { position:absolute; width:2px; height:2px; background:#c9a84c; border-radius:50%; opacity:0; pointer-events:none; animation:pf linear infinite; }
        @keyframes pf{0%{opacity:0;transform:translateY(0) scale(0);}10%{opacity:0.5;transform:translateY(-18px) scale(1);}100%{opacity:0;transform:translateY(-180px) scale(0.4);}}
      `}</style>

      <div className="lp">
        <div className="bl bl1" /><div className="bl bl2" /><div className="grid" />

        {[...Array(7)].map((_,i) => (
          <div key={i} className="pt" style={{ left:`${12+i*12}%`, bottom:`${8+(i%3)*14}%`, animationDuration:`${4+i*1.1}s`, animationDelay:`${i*0.65}s` }} />
        ))}

        <div className="card">
          <div className="logo">B&G</div>
          <div className="brand">Bella <em>&</em> Guy</div>
          <div className="brand-sub">Salon Management</div>

          {/* TABS */}
          <div className="tabs">
            <button className={`tab ${loginType==="admin"?"on":""}`} onClick={() => { setLoginType("admin"); setError(""); }}>
              🛡 Admin
            </button>
            <button className={`tab ${loginType==="staff"?"on":""}`} onClick={() => { setLoginType("staff"); setError(""); }}>
              💇 Staff
            </button>
          </div>

          {/* FORM */}
          <form onSubmit={login}>
            {error && <div className="err"><span>⚠</span>{error}</div>}

            <label className="flabel">Email Address</label>
            <div className="fwrap">
              <input
                type="email" className="finput"
                placeholder="your@email.com"
                value={email} onChange={e => setEmail(e.target.value)}
                required autoComplete="email"
              />
            </div>

            <label className="flabel">Password</label>
            <div className="fwrap">
              <input
                type={showPass?"text":"password"} className="finput"
                placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
                required autoComplete="current-password"
                style={{ paddingRight:42 }}
              />
              <button type="button" className="eye" onClick={() => setShowPass(!showPass)} tabIndex={-1}>
                {showPass?"🙈":"👁"}
              </button>
            </div>

            <button type="submit" className="sub" disabled={loading}>
              {loading && <span className="spin" />}
              {loading ? "Signing in…" : loginType==="admin" ? "Sign In as Admin" : "Sign In as Staff"}
            </button>
          </form>

          <div className="fnote">🔐 Secured · Bella & Guy Salon</div>
        </div>
      </div>
    </>
  );
}
