"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

export default function ForgotPasswordPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.push("/dashboard/profile");
    } else {
      // Redirect to Clerk's sign-in with password reset
      router.push("/sign-in?reset_password=true");
    }
  }, [isSignedIn, router]);

  return (
    <div style={{ minHeight: "100vh", background: "#09090B", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: "#8B8BA3" }}>Redirecting…</span>
    </div>
  );
}
