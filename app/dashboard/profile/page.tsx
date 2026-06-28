"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { LogoMark } from "@/components/logo";
import { LayoutDashboard, FileText, User, CreditCard, ExternalLink, Mail, Calendar, Shield, Camera, Check, X, Loader2, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const NAV = [
  { label: "Overview",  href: "/dashboard",         icon: LayoutDashboard },
  { label: "Reports",   href: "/dashboard/reports",  icon: FileText },
  { label: "Profile",   href: "/dashboard/profile",  icon: User },
  { label: "Billing",   href: "/dashboard/billing",  icon: CreditCard },
];

export default function ProfilePage() {
  const router = useRouter();
  const { isLoaded, user } = useUser();

  const [editingName, setEditingName] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameError, setNameError] = useState("");

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  if (!isLoaded) {
    return (
      <div style={{ minHeight: "100vh", background: "#09090B", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={20} style={{ color: "#E8334A", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (!user) { router.push("/sign-in"); return null; }

  const email = user.emailAddresses[0]?.emailAddress ?? "—";
  const created = new Date(user.createdAt!).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
  const providers = user.externalAccounts.map(a => a.provider);
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Anonymous";
  const initials = ((user.firstName?.[0] ?? "") + (user.lastName?.[0] ?? "")).toUpperCase() || email[0]?.toUpperCase() || "U";

  function startEditName() {
    setFirstName(user!.firstName ?? "");
    setLastName(user!.lastName ?? "");
    setEditingName(true);
    setNameError("");
    setNameSuccess(false);
  }

  async function saveName() {
    setSavingName(true); setNameError("");
    try {
      await user!.update({ firstName: firstName.trim(), lastName: lastName.trim() });
      setEditingName(false);
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 3000);
    } catch (e: unknown) {
      setNameError((e as { errors?: { message: string }[] })?.errors?.[0]?.message ?? "Failed to save.");
    } finally { setSavingName(false); }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      setPhotoError("Use JPEG, PNG, WebP, or GIF.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) { setPhotoError("Max 5 MB."); return; }
    setUploadingPhoto(true); setPhotoError("");
    try {
      await user!.setProfileImage({ file });
    } catch (e: unknown) {
      setPhotoError((e as { errors?: { message: string }[] })?.errors?.[0]?.message ?? "Upload failed.");
    } finally { setUploadingPhoto(false); if (fileRef.current) fileRef.current.value = ""; }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#09090B", color: "#FAFAFA", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <header style={{ borderBottom: "1px solid #1E1E28", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", background: "#09090B", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <LogoMark size={24} />
            <span style={{ fontWeight: 900, fontSize: 14, letterSpacing: "-0.04em", color: "#FAFAFA" }}>ROAST<span style={{ color: "#E8334A" }}>LAB</span></span>
          </Link>
          <span style={{ color: "#27273A", fontSize: 18 }}>/</span>
          <span style={{ fontSize: 13, color: "#8B8BA3", fontWeight: 500 }}>Profile</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: "#8B8BA3", textDecoration: "none", padding: "6px 10px", borderRadius: 6, border: "1px solid #27273A" }}>
            New audit <ExternalLink size={11} />
          </Link>
          <UserButton />
        </div>
      </header>

      <div style={{ display: "flex", flex: 1 }}>
        {/* Sidebar */}
        <aside style={{ width: 220, borderRight: "1px solid #1E1E28", padding: "24px 12px", display: "flex", flexDirection: "column", gap: 4, position: "sticky", top: 60, height: "calc(100vh - 60px)", overflowY: "auto", flexShrink: 0 }} className="hidden md:flex">
          {NAV.map(({ label, href, icon: Icon }) => {
            const active = href === "/dashboard/profile";
            return (
              <Link key={href} href={href} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: active ? 600 : 500, color: active ? "#FAFAFA" : "#8B8BA3", textDecoration: "none", padding: "9px 12px", borderRadius: 8, background: active ? "#16161E" : "transparent", border: active ? "1px solid #27273A" : "1px solid transparent" }}>
                <Icon size={15} style={{ color: active ? "#E8334A" : "inherit" }} />
                {label}
              </Link>
            );
          })}
        </aside>

        <main style={{ flex: 1, padding: "32px", maxWidth: 720 }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 4px" }}>Profile</h1>
            <p style={{ fontSize: 13, color: "#8B8BA3", margin: 0 }}>Your account details — changes save instantly</p>
          </div>

          {/* Avatar + name card */}
          <div style={{ background: "#111117", border: "1px solid #1E1E28", borderRadius: 16, padding: "28px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 24, flexWrap: "wrap" }}>
              {/* Avatar with upload overlay */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{ width: 80, height: 80, borderRadius: "50%", overflow: "hidden", border: "2px solid #27273A", flexShrink: 0, position: "relative" }}>
                  {user.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.imageUrl} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", background: "#E8334A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, color: "#fff" }}>
                      {initials}
                    </div>
                  )}
                  {uploadingPhoto && (
                    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Loader2 size={18} style={{ color: "#fff", animation: "spin 1s linear infinite" }} />
                    </div>
                  )}
                </div>
                {/* Camera button */}
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploadingPhoto}
                  title="Change photo"
                  style={{ position: "absolute", bottom: 0, right: 0, width: 26, height: 26, borderRadius: "50%", background: "#E8334A", border: "2px solid #09090B", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                >
                  <Camera size={12} style={{ color: "#fff" }} />
                </button>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" style={{ display: "none" }} onChange={handlePhotoUpload} />
              </div>

              {/* Name section */}
              <div style={{ flex: 1 }}>
                {!editingName ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <p style={{ fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>{displayName}</p>
                    <button onClick={startEditName} style={{ background: "none", border: "1px solid #27273A", borderRadius: 6, padding: "4px 8px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, color: "#8B8BA3", fontSize: 11 }}>
                      <Pencil size={10} /> Edit
                    </button>
                    <AnimatePresence>
                      {nameSuccess && (
                        <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                          style={{ fontSize: 11, color: "#32D74B", display: "flex", alignItems: "center", gap: 3 }}>
                          <Check size={10} /> Saved
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name"
                        style={{ flex: 1, background: "#09090B", border: "1px solid #27273A", borderRadius: 8, padding: "9px 12px", color: "#FAFAFA", fontSize: 14, outline: "none" }}
                      />
                      <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name"
                        style={{ flex: 1, background: "#09090B", border: "1px solid #27273A", borderRadius: 8, padding: "9px 12px", color: "#FAFAFA", fontSize: 14, outline: "none" }}
                      />
                    </div>
                    {nameError && <p style={{ margin: 0, fontSize: 12, color: "#FF2D55" }}>{nameError}</p>}
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={saveName} disabled={savingName}
                        style={{ padding: "8px 16px", background: "#E8334A", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                        {savingName ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }}/> : <Check size={12}/>} Save
                      </button>
                      <button onClick={() => setEditingName(false)}
                        style={{ padding: "8px 12px", background: "transparent", color: "#8B8BA3", border: "1px solid #27273A", borderRadius: 8, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                        <X size={12}/> Cancel
                      </button>
                    </div>
                  </div>
                )}
                <p style={{ fontSize: 13, color: "#8B8BA3", margin: "6px 0 0" }}>{email}</p>
                {photoError && <p style={{ margin: "6px 0 0", fontSize: 12, color: "#FF2D55" }}>{photoError}</p>}
              </div>
            </div>
          </div>

          {/* Info fields */}
          <div style={{ background: "#111117", border: "1px solid #1E1E28", borderRadius: 16, overflow: "hidden", marginBottom: 16 }}>
            {[
              { icon: Mail,     label: "Email",               value: email },
              { icon: Calendar, label: "Member since",        value: created },
              { icon: Shield,   label: "Connected accounts",  value: providers.length > 0 ? providers.join(", ") : "Email only" },
            ].map(({ icon: Icon, label, value }, i, arr) => (
              <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: i < arr.length - 1 ? "1px solid #1E1E28" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Icon size={15} style={{ color: "#4A4A62" }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#8B8BA3" }}>{label}</span>
                </div>
                <span style={{ fontSize: 13, color: "#FAFAFA", fontWeight: 500 }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Danger zone / account settings */}
          <div style={{ background: "#111117", border: "1px solid #1E1E28", borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#FAFAFA", margin: "0 0 4px" }}>Password & security</p>
              <p style={{ fontSize: 12, color: "#8B8BA3", margin: 0 }}>Change password or manage 2FA via the account menu →</p>
            </div>
            <UserButton showName />
          </div>
        </main>
      </div>
    </div>
  );
}
