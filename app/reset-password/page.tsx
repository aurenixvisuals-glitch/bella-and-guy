"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
    } else {
      setSuccess("Password updated successfully! Redirecting to sign in...");
      setTimeout(() => router.push("/customer-login"), 2500);
    }
    setLoading(false);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Inter:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .rp-page { min-height: 100vh; background: #080808; display: flex; align-items: center; justify-content: center; font-family: 'Inter', sans-serif; padding: 40px 16px; position: relative; overflow: hidden; }
        .rp-glow { position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.12; pointer-events: none; }
        .rp-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(201,168,76,0.15); border-radius: 8px; padding: 48px 40px; width: 100%; max-width: 420px; position: relative; z-index: 1; }
        .rp-logo { width: 72px; height: 72px; border-radius: 50%; overflow: hidden; margin: 0 auto 8px; display: block; }
        .rp-subtitle { text-align: center; font-size: 11px; color: rgba(201,168,76,0.55); letter-spacing: 0.22em; text-transform: uppercase; margin-bottom: 36px; }
        .rp-title { font-family: 'Cormorant Garamond', serif; font-size: 26px; font-weight: 500; color: #FFFFFF; margin-bottom: 8px; }
        .rp-desc { font-size: 13px; color: rgba(255,255,255,0.35); margin-bottom: 28px; line-height: 1.6; }
        .rp-label { display: block; font-size: 10.5px; font-weight: 600; color: rgba(255,255,255,0.45); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px; }
        .rp-input { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09); border-radius: 4px; padding: 13px 16px; color: #fff; font-size: 14px; font-family: 'Inter', sans-serif; transition: border-color 0.2s; outline: none; }
        .rp-input:focus { border-color: rgba(201,168,76,0.45); }
        .rp-input::placeholder { color: rgba(255,255,255,0.2); }
        .rp-field { margin-bottom: 20px; }
        .rp-pass-wrap { position: relative; }
        .rp-eye { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: rgba(255,255,255,0.35); font-size: 14px; padding: 0; }
        .rp-btn { width: 100%; padding: 15px; background: linear-gradient(135deg, #E8C96D, #C9A84C); border: none; border-radius: 4px; color: #0A0A0A; font-size: 11.5px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; cursor: pointer; margin-top: 8px; font-family: 'Inter', sans-serif; transition: opacity 0.2s; }
        .rp-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .rp-error { background: rgba(220,50,50,0.08); border: 1px solid rgba(220,50,50,0.25); color: #ff7070; padding: 12px 16px; border-radius: 4px; font-size: 13px; margin-bottom: 20px; line-height: 1.55; }
        .rp-success { background: rgba(39,174,96,0.08); border: 1px solid rgba(39,174,96,0.25); color: #4ade80; padding: 12px 16px; border-radius: 4px; font-size: 13px; margin-bottom: 20px; line-height: 1.55; }
        .rp-waiting { text-align: center; color: rgba(255,255,255,0.3); font-size: 13px; line-height: 1.7; padding: 10px 0; }
      `}</style>

      <div className="rp-page">
        <div className="rp-glow" style={{ width: 400, height: 400, background: "#C9A84C", top: -100, right: -100 }} />
        <div className="rp-glow" style={{ width: 300, height: 300, background: "#6B3FA0", bottom: -80, left: -80 }} />

        <div className="rp-card">
          <img src="/images/logo.png" alt="Bella & Guy" className="rp-logo" />
          <div className="rp-subtitle">Member Portal</div>

          <div className="rp-title">Set New Password</div>
          <div className="rp-desc">
            Choose a strong new password for your account. You'll be redirected to sign in once it's saved.
          </div>

          {error && <div className="rp-error">{error}</div>}
          {success && <div className="rp-success">{success}</div>}

          {!ready && !success && (
            <div className="rp-waiting">
              Verifying your reset link…<br />
              <span style={{ fontSize: "11px", opacity: 0.6 }}>If this page stays blank, try clicking the link in your email again.</span>
            </div>
          )}

          {ready && !success && (
            <form onSubmit={handleReset}>
              <div className="rp-field">
                <label className="rp-label">New Password</label>
                <div className="rp-pass-wrap">
                  <input
                    className="rp-input"
                    type={showPass ? "text" : "password"}
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    style={{ paddingRight: 44 }}
                  />
                  <button type="button" className="rp-eye" onClick={() => setShowPass(!showPass)}>
                    {showPass ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
              <div className="rp-field">
                <label className="rp-label">Confirm New Password</label>
                <input
                  className="rp-input"
                  type="password"
                  placeholder="Re-enter your new password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                />
              </div>
              <button className="rp-btn" type="submit" disabled={loading}>
                {loading ? "Updating password..." : "Update Password →"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
