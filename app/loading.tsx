export default function Loading() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#09090B",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "3px solid #1E1E28",
          borderTopColor: "#E8334A",
          animation: "spin 0.8s linear infinite",
        }}/>
        <span style={{ fontSize: 12, color: "#3A3A5E", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          loading
        </span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
