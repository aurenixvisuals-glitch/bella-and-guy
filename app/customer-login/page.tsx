"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

type Mode = "login" | "signup" | "forgot";

const VALID_INDIAN_MOBILE = /^[6-9]\d{9}$/;

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.259c-.806.54-1.837.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
    <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

const BackArrow = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M8.5 2L3.5 6.5L8.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function CustomerLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push("/my-bookings");
    });
  }, []);

  function switchMode(m: Mode) {
    setMode(m);
    setError("");
    setSuccess("");
  }

  async function handleGoogleLogin() {
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/my-bookings` },
    });
    if (error) { setError(error.message); setLoading(false); }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) {
      setError("Incorrect email or password. Please try again.");
    } else {
      router.push("/my-bookings");
    }
    setLoading(false);
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!fullName.trim() || !phone.trim() || !email.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    const digits = phone.replace(/\D/g, "");
    if (!VALID_INDIAN_MOBILE.test(digits)) {
      setError("Enter a valid 10-digit Indian mobile number (starting with 6, 7, 8 or 9).");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { full_name: fullName.trim(), phone: digits } },
    });
    if (error) {
      setError(error.message);
    } else {
      router.push("/my-bookings");
    }
    setLoading(false);
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!email.trim()) { setError("Please enter your email address."); return; }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: `${window.location.origin}/reset-password` }
    );
    if (error) { setError(error.message); }
    else { setSuccess("Password reset link sent! Check your inbox (and spam folder)."); }
    setLoading(false);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Inter:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .cl-page { min-height: 100vh; background: #080808; display: flex; align-items: center; justify-content: center; font-family: 'Inter', sans-serif; padding: 40px 16px; position: relative; overflow: hidden; }
        .cl-glow { position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.12; pointer-events: none; }
        .cl-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(201,168,76,0.15); border-radius: 8px; padding: 48px 40px; width: 100%; max-width: 440px; position: relative; z-index: 1; }
        .cl-back-btn { display: inline-flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.35); font-size: 12px; font-weight: 500; letter-spacing: 0.08em; text-decoration: none; margin-bottom: 32px; transition: all 0.2s; padding: 8px 14px; border: 1px solid rgba(255,255,255,0.08); border-radius: 4px; background: rgba(255,255,255,0.02); }
        .cl-back-btn:hover { color: #C9A84C; border-color: rgba(201,168,76,0.25); background: rgba(201,168,76,0.04); }
        .cl-logo { width: 72px; height: 72px; border-radius: 50%; overflow: hidden; margin: 0 auto 8px; display: block; }
        .cl-subtitle { text-align: center; font-size: 11px; color: rgba(201,168,76,0.55); letter-spacing: 0.22em; text-transform: uppercase; margin-bottom: 36px; }
        .cl-tabs { display: flex; border: 1px solid rgba(201,168,76,0.2); border-radius: 4px; margin-bottom: 28px; overflow: hidden; }
        .cl-tab { flex: 1; padding: 12px; background: none; border: none; color: rgba(255,255,255,0.35); font-size: 11.5px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; }
        .cl-tab.active { background: rgba(201,168,76,0.1); color: #C9A84C; }
        .cl-google-btn { width: 100%; padding: 13px 16px; background: #ffffff; border: none; border-radius: 4px; color: #1f1f1f; font-size: 13.5px; font-weight: 600; font-family: 'Inter', sans-serif; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: background 0.2s, box-shadow 0.2s; margin-bottom: 4px; }
        .cl-google-btn:hover { background: #f2f2f2; box-shadow: 0 2px 10px rgba(0,0,0,0.3); }
        .cl-google-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .cl-or { display: flex; align-items: center; gap: 12px; margin: 20px 0; }
        .cl-or-line { flex: 1; height: 1px; background: rgba(255,255,255,0.08); }
        .cl-or-text { font-size: 11px; color: rgba(255,255,255,0.25); letter-spacing: 0.1em; text-transform: uppercase; flex-shrink: 0; }
        .cl-label { display: block; font-size: 10.5px; font-weight: 600; color: rgba(255,255,255,0.45); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px; }
        .cl-input { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09); border-radius: 4px; padding: 13px 16px; color: #fff; font-size: 14px; font-family: 'Inter', sans-serif; transition: border-color 0.2s; outline: none; }
        .cl-input:focus { border-color: rgba(201,168,76,0.45); background: rgba(255,255,255,0.05); }
        .cl-input::placeholder { color: rgba(255,255,255,0.2); }
        .cl-field { margin-bottom: 20px; }
        .cl-pass-wrap { position: relative; }
        .cl-eye { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: rgba(255,255,255,0.35); font-size: 14px; padding: 0; }
        .cl-btn { width: 100%; padding: 15px; background: linear-gradient(135deg, #E8C96D, #C9A84C); border: none; border-radius: 4px; color: #0A0A0A; font-size: 11.5px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; cursor: pointer; margin-top: 8px; font-family: 'Inter', sans-serif; transition: opacity 0.2s, transform 0.15s; }
        .cl-btn:hover:not(:disabled) { transform: translateY(-1px); opacity: 0.9; }
        .cl-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .cl-error { background: rgba(220,50,50,0.08); border: 1px solid rgba(220,50,50,0.25); color: #ff7070; padding: 12px 16px; border-radius: 4px; font-size: 13px; margin-bottom: 20px; line-height: 1.55; }
        .cl-success { background: rgba(39,174,96,0.08); border: 1px solid rgba(39,174,96,0.25); color: #4ade80; padding: 12px 16px; border-radius: 4px; font-size: 13px; margin-bottom: 20px; line-height: 1.55; }
        .cl-forgot-link { display: block; text-align: right; font-size: 11.5px; color: rgba(255,255,255,0.3); margin-top: -10px; margin-bottom: 20px; transition: color 0.2s; cursor: pointer; background: none; border: none; font-family: 'Inter', sans-serif; }
        .cl-forgot-link:hover { color: #C9A84C; }
        .cl-back-mode { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: rgba(255,255,255,0.3); cursor: pointer; background: none; border: none; font-family: 'Inter', sans-serif; margin-bottom: 24px; transition: color 0.2s; padding: 0; }
        .cl-back-mode:hover { color: #C9A84C; }
        .cl-forgot-title { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 500; color: #fff; margin-bottom: 8px; }
        .cl-forgot-sub { font-size: 13px; color: rgba(255,255,255,0.35); margin-bottom: 28px; line-height: 1.6; }
        .cl-phone-hint { font-size: 11px; color: rgba(255,255,255,0.22); margin-top: 5px; }
      `}</style>

      <div className="cl-page">
        <div className="cl-glow" style={{ width: 400, height: 400, background: "#C9A84C", top: -100, right: -100 }} />
        <div className="cl-glow" style={{ width: 300, height: 300, background: "#6B3FA0", bottom: -80, left: -80 }} />

        <div className="cl-card">
          <a href="/" className="cl-back-btn"><BackArrow /> Back to Home</a>

          <img src="/images/logo.png" alt="Bella & Guy" className="cl-logo" />
          <div className="cl-subtitle">Member Portal</div>

          {/* ── FORGOT PASSWORD ── */}
          {mode === "forgot" && (
            <>
              <button className="cl-back-mode" onClick={() => switchMode("login")}>
                <BackArrow /> Back to Sign In
              </button>
              <div className="cl-forgot-title">Reset Password</div>
              <div className="cl-forgot-sub">
                Enter the email linked to your account and we'll send you a reset link.
              </div>
              {error && <div className="cl-error">{error}</div>}
              {success && <div className="cl-success">{success}</div>}
              {!success && (
                <form onSubmit={handleForgot}>
                  <div className="cl-field">
                    <label className="cl-label">Email Address</label>
                    <input className="cl-input" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                  <button className="cl-btn" type="submit" disabled={loading}>
                    {loading ? "Sending link..." : "Send Reset Link →"}
                  </button>
                </form>
              )}
            </>
          )}

          {/* ── SIGN IN / CREATE ACCOUNT ── */}
          {mode !== "forgot" && (
            <>
              <div className="cl-tabs">
                <button className={`cl-tab ${mode === "login" ? "active" : ""}`} onClick={() => switchMode("login")}>Sign In</button>
                <button className={`cl-tab ${mode === "signup" ? "active" : ""}`} onClick={() => switchMode("signup")}>Create Account</button>
              </div>

              {error && <div className="cl-error">{error}</div>}
              {success && <div className="cl-success">{success}</div>}

              <button type="button" className="cl-google-btn" onClick={handleGoogleLogin} disabled={loading}>
                <GoogleIcon /> Continue with Google
              </button>

              <div className="cl-or">
                <div className="cl-or-line" />
                <span className="cl-or-text">or</span>
                <div className="cl-or-line" />
              </div>

              {/* SIGN IN */}
              {mode === "login" && (
                <form onSubmit={handleLogin}>
                  <div className="cl-field">
                    <label className="cl-label">Email Address</label>
                    <input className="cl-input" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                  <div className="cl-field">
                    <label className="cl-label">Password</label>
                    <div className="cl-pass-wrap">
                      <input className="cl-input" type={showPass ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingRight: 44 }} />
                      <button type="button" className="cl-eye" onClick={() => setShowPass(!showPass)}>{showPass ? "🙈" : "👁️"}</button>
                    </div>
                  </div>
                  <button type="button" className="cl-forgot-link" onClick={() => switchMode("forgot")}>
                    Forgot password?
                  </button>
                  <button className="cl-btn" type="submit" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In →"}
                  </button>
                </form>
              )}

              {/* SIGN UP */}
              {mode === "signup" && (
                <form onSubmit={handleSignup}>
                  <div className="cl-field">
                    <label className="cl-label">Full Name</label>
                    <input className="cl-input" type="text" placeholder="Your full name" value={fullName} onChange={e => setFullName(e.target.value)} required />
                  </div>
                  <div className="cl-field">
                    <label className="cl-label">Phone Number</label>
                    <input className="cl-input" type="tel" placeholder="10-digit mobile number" value={phone} onChange={e => setPhone(e.target.value)} required />
                    <div className="cl-phone-hint">Valid Indian mobile number required (starts with 6–9)</div>
                  </div>
                  <div className="cl-field">
                    <label className="cl-label">Email Address</label>
                    <input className="cl-input" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                  <div className="cl-field">
                    <label className="cl-label">Password</label>
                    <div className="cl-pass-wrap">
                      <input className="cl-input" type={showPass ? "text" : "password"} placeholder="Minimum 6 characters" value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingRight: 44 }} />
                      <button type="button" className="cl-eye" onClick={() => setShowPass(!showPass)}>{showPass ? "🙈" : "👁️"}</button>
                    </div>
                  </div>
                  <button className="cl-btn" type="submit" disabled={loading}>
                    {loading ? "Creating account..." : "Create Account →"}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
