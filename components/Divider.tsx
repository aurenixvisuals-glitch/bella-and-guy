export default function Divider({ dark = false }: { dark?: boolean }) {
  const bg = dark ? "#0C0C0C" : "#FAF7F0";
  const line = dark ? "rgba(201,168,76,0.18)" : "rgba(201,168,76,0.25)";

  return (
    <div style={{ background: bg, padding: "0 32px", display: "flex", alignItems: "center", gap: "16px", height: "48px" }}>
      <div style={{ flex: 1, height: "1px", background: `linear-gradient(90deg, transparent, ${line})` }} />
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
        <span style={{ color: "#C9A84C", opacity: 0.35, fontSize: "6px" }}>◆</span>
        <span style={{ color: "#C9A84C", opacity: 0.65, fontSize: "9px" }}>◆</span>
        <span style={{ color: "#C9A84C", opacity: 0.35, fontSize: "6px" }}>◆</span>
      </div>
      <div style={{ flex: 1, height: "1px", background: `linear-gradient(90deg, ${line}, transparent)` }} />
    </div>
  );
}
