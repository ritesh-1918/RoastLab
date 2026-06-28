"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#09090B",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: "#FAFAFA",
      textAlign: "center",
      padding: "0 24px",
    }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>💀</div>
      <p style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 8px" }}>
        something crashed
      </p>
      <p style={{ fontSize: 14, color: "#8B8BA3", margin: "0 0 8px", maxWidth: 400 }}>
        {error.message || "an unexpected error occurred"}
      </p>
      {error.digest && (
        <p style={{ fontSize: 11, color: "#3A3A5E", margin: "0 0 28px", fontFamily: "monospace" }}>
          digest: {error.digest}
        </p>
      )}
      <button
        onClick={reset}
        style={{
          padding: "12px 24px",
          background: "#E8334A",
          color: "#fff",
          border: "none",
          borderRadius: 10,
          fontWeight: 700,
          fontSize: 14,
          cursor: "pointer",
          letterSpacing: "-0.02em",
        }}
      >
        try again
      </button>
    </div>
  );
}
