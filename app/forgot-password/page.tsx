"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { useSignIn } from "@clerk/nextjs";
import { ArrowLeft, Mail, KeyRound, Eye, EyeOff, CheckCircle } from "lucide-react";

type Step = "email" | "code" | "newpass" | "done";

export default function ForgotPasswordPage() {
  const { isLoaded, signIn, setActive } = useSignIn();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPass, setNewPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || !signIn) return;
    setLoading(true); setError("");
    try {
      await signIn.create({ strategy: "reset_password_email_code", identifier: email });
      setStep("code");
    } catch (err: unknown) {
      const msg = (err as { errors?: { message: string }[] })?.errors?.[0]?.message ?? "Failed to send reset code.";
      setError(msg);
    } finally { setLoading(false); }
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || !signIn) return;
    setLoading(true); setError("");
    try {
      const result = await signIn.attemptFirstFactor({ strategy: "reset_password_email_code", code });
      if (result.status === "needs_new_password") {
        setStep("newpass");
      } else {
        setError("Unexpected state. Try again.");
      }
    } catch (err: unknown) {
      const msg = (err as { errors?: { message: string }[] })?.errors?.[0]?.message ?? "Invalid code.";
      setError(msg);
    } finally { setLoading(false); }
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || !signIn) return;
    setLoading(true); setError("");
    try {
      const result = await signIn.resetPassword({ password: newPass });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        setStep("done");
      } else {
        setError("Something went wrong. Try again.");
      }
    } catch (err: unknown) {
      const msg = (err as { errors?: { message: string }[] })?.errors?.[0]?.message ?? "Failed to reset password.";
      setError(msg);
    } finally { setLoading(false); }
  }

  const steps = [
    { key: "email",   label: "Email",    num: 1 },
    { key: "code",    label: "Verify",   num: 2 },
    { key: "newpass", label: "Password", num: 3 },
  ];

  const currentStep = steps.findIndex(s => s.key === step);

  return (
    <div style={{ minHeight: "100vh", background: "#09090B", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", color: "#FAFAFA" }}>
      {/* Logo */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32, textAlign: "center" }}>
        <Link href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid #E8334A", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#E8334A" }}/>
          </div>
          <span style={{ fontWeight: 900, fontSize: 16, letterSpacing: "-0.04em" }}>ROAST<span style={{ color: "#E8334A" }}>LAB</span></span>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ width: "100%", maxWidth: 420 }}
      >
        {/* Card */}
        <div style={{ background: "#111117", border: "1px solid #1E1E28", borderRadius: 20, overflow: "hidden" }}>
          {/* Red top bar */}
          <div style={{ height: 3, background: "linear-gradient(90deg, #E8334A, #FF6B3D)" }}/>

          <div style={{ padding: "32px 28px" }}>
            {step !== "done" && (
              <>
                <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 900, letterSpacing: "-0.03em" }}>
                  Reset password
                </h1>
                <p style={{ margin: "0 0 28px", fontSize: 13, color: "#8B8BA3" }}>
                  {step === "email" && "Enter your email to receive a reset code."}
                  {step === "code"  && `Code sent to ${email}. Enter it below.`}
                  {step === "newpass" && "Choose a strong new password."}
                </p>

                {/* Step indicator */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 28 }}>
                  {steps.map((s, i) => {
                    const done = i < currentStep;
                    const active = i === currentStep;
                    const c = done ? "#32D74B" : active ? "#E8334A" : "#27273A";
                    return (
                      <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 24, height: 24, borderRadius: "50%", background: `${c}22`, border: `1.5px solid ${c}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: c }}>
                          {done ? "✓" : s.num}
                        </div>
                        <span style={{ fontSize: 11, fontWeight: active ? 700 : 500, color: active ? "#FAFAFA" : "#4A4A62" }}>{s.label}</span>
                        {i < steps.length - 1 && <div style={{ width: 20, height: 1, background: "#27273A", margin: "0 2px" }}/>}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 8, background: "rgba(255,45,85,0.08)", border: "1px solid rgba(255,45,85,0.2)", fontSize: 13, color: "#FF6B8A" }}>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email step */}
            {step === "email" && (
              <form onSubmit={sendCode}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#8B8BA3", marginBottom: 6 }}>Email address</label>
                <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#09090B", border: "1px solid #27273A", borderRadius: 10, padding: "0 14px", marginBottom: 20 }}>
                  <Mail size={14} style={{ color: "#4A4A62", flexShrink: 0 }} />
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                    style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 14, color: "#FAFAFA", padding: "12px 0" }}
                  />
                </div>
                <button type="submit" disabled={loading || !email}
                  style={{ width: "100%", padding: "13px", borderRadius: 10, background: loading ? "#1E1E28" : "linear-gradient(135deg, #E8334A, #FF6B3D)", color: loading ? "#4A4A62" : "#fff", border: "none", fontSize: 14, fontWeight: 700, cursor: loading ? "default" : "pointer", letterSpacing: "-0.01em" }}>
                  {loading ? "Sending…" : "Send reset code →"}
                </button>
              </form>
            )}

            {/* Code step */}
            {step === "code" && (
              <form onSubmit={verifyCode}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#8B8BA3", marginBottom: 6 }}>6-digit code</label>
                <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#09090B", border: "1px solid #27273A", borderRadius: 10, padding: "0 14px", marginBottom: 20 }}>
                  <KeyRound size={14} style={{ color: "#4A4A62", flexShrink: 0 }} />
                  <input type="text" required value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="123456" maxLength={6}
                    style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 20, color: "#FAFAFA", padding: "12px 0", letterSpacing: "0.2em", fontFamily: "monospace" }}
                  />
                </div>
                <button type="submit" disabled={loading || code.length < 6}
                  style={{ width: "100%", padding: "13px", borderRadius: 10, background: loading ? "#1E1E28" : "linear-gradient(135deg, #E8334A, #FF6B3D)", color: loading ? "#4A4A62" : "#fff", border: "none", fontSize: 14, fontWeight: 700, cursor: loading ? "default" : "pointer", letterSpacing: "-0.01em" }}>
                  {loading ? "Verifying…" : "Verify code →"}
                </button>
                <button type="button" onClick={() => setStep("email")}
                  style={{ marginTop: 12, width: "100%", padding: "10px", background: "transparent", border: "1px solid #27273A", borderRadius: 8, color: "#8B8BA3", fontSize: 13, cursor: "pointer" }}>
                  ← Back
                </button>
              </form>
            )}

            {/* New password step */}
            {step === "newpass" && (
              <form onSubmit={resetPassword}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#8B8BA3", marginBottom: 6 }}>New password</label>
                <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#09090B", border: "1px solid #27273A", borderRadius: 10, padding: "0 14px", marginBottom: 20 }}>
                  <input type={showPass ? "text" : "password"} required value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Minimum 8 characters" minLength={8}
                    style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 14, color: "#FAFAFA", padding: "12px 0" }}
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", color: "#4A4A62", padding: 0 }}>
                    {showPass ? <EyeOff size={14}/> : <Eye size={14}/>}
                  </button>
                </div>
                <button type="submit" disabled={loading || newPass.length < 8}
                  style={{ width: "100%", padding: "13px", borderRadius: 10, background: loading ? "#1E1E28" : "linear-gradient(135deg, #E8334A, #FF6B3D)", color: loading ? "#4A4A62" : "#fff", border: "none", fontSize: 14, fontWeight: 700, cursor: loading ? "default" : "pointer", letterSpacing: "-0.01em" }}>
                  {loading ? "Resetting…" : "Reset password →"}
                </button>
              </form>
            )}

            {/* Done */}
            {step === "done" && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center", padding: "8px 0" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(50,215,75,0.12)", border: "2px solid #32D74B", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                  <CheckCircle size={28} style={{ color: "#32D74B" }}/>
                </div>
                <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800 }}>Password reset!</h2>
                <p style={{ margin: "0 0 24px", fontSize: 13, color: "#8B8BA3" }}>You&apos;re logged in. Redirecting to dashboard…</p>
                <Link href="/dashboard" style={{ display: "inline-block", padding: "12px 24px", background: "#E8334A", color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                  Go to dashboard →
                </Link>
              </motion.div>
            )}
          </div>
        </div>

        <div style={{ marginTop: 20, textAlign: "center" }}>
          <Link href="/sign-in" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, color: "#8B8BA3", textDecoration: "none" }}>
            <ArrowLeft size={12}/> Back to sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
