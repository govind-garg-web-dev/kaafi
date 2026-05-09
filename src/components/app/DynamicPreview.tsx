"use client";

import type { PreviewData } from "@/lib/preview-parser";

// Shared mini status bar
function StatusBar() {
  return (
    <div className="flex items-center justify-between px-4 pt-2 pb-1 flex-shrink-0">
      <span style={{ fontSize: 10, color: "#9ca3af" }}>9:41</span>
      <div className="flex items-center gap-1">
        <div style={{ fontSize: 9, color: "#9ca3af" }}>●●●●</div>
        <div style={{ width: 14, height: 7, borderRadius: 2, border: "1px solid #d1d5db", position: "relative" }}>
          <div style={{ position: "absolute", left: 1, top: 1, bottom: 1, width: "70%", background: "#22c55e", borderRadius: 1 }} />
        </div>
      </div>
    </div>
  );
}

// Shared bottom tab bar
function TabBar({ tabs, primary }: { tabs: { label: string; icon: string; active?: boolean }[]; primary: string }) {
  return (
    <div style={{ borderTop: "1px solid #f1f5f9", background: "white", paddingBottom: 8, paddingTop: 6 }}
      className="flex-shrink-0">
      <div className="flex">
        {tabs.map((tab) => (
          <div key={tab.label} className="flex-1 flex flex-col items-center gap-0.5 py-1">
            <span style={{ fontSize: 16 }}>{tab.icon}</span>
            <span style={{ fontSize: 9, color: tab.active ? primary : "#94a3b8", fontWeight: tab.active ? 600 : 400 }}>
              {tab.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Feed preview ─────────────────────────────────────────
function FeedPreview({ data }: { data: PreviewData }) {
  const { primaryColor: p, items, headerTitle, searchPlaceholder, appName, ctaLabel } = data;
  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      <StatusBar />
      <div style={{ background: "white", padding: "8px 14px 10px", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: "#111827", marginBottom: 6 }}>{headerTitle || appName}</div>
        <div style={{ background: "#f3f4f6", borderRadius: 10, padding: "6px 10px", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>🔍</span>
          <span style={{ fontSize: 11, color: "#9ca3af" }}>{searchPlaceholder}</span>
        </div>
      </div>
      <div className="flex-1 overflow-hidden px-3 pt-3 flex flex-col gap-2">
        {items.slice(0, 3).map((item) => (
          <div key={item.id} style={{ background: "white", borderRadius: 14, padding: "10px 12px", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <div className="flex items-center gap-2.5">
              <div style={{ width: 38, height: 38, borderRadius: 10, background: p + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                {item.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div style={{ fontSize: 12, fontWeight: 600, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</div>
                <div style={{ fontSize: 10, color: "#6b7280", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.subtitle}</div>
              </div>
              <div style={{ background: p, borderRadius: 8, padding: "4px 8px", flexShrink: 0 }}>
                <span style={{ fontSize: 10, color: "white", fontWeight: 600 }}>{ctaLabel}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <TabBar primary={p} tabs={[{ label: "Home", icon: "🏠", active: true }, { label: "Explore", icon: "🔍" }, { label: "Profile", icon: "👤" }]} />
    </div>
  );
}

// ── Map preview ──────────────────────────────────────────
function MapPreview({ data }: { data: PreviewData }) {
  const { primaryColor: p, items, headerTitle, appName, ctaLabel } = data;
  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      <StatusBar />
      <div style={{ background: "white", padding: "8px 14px 10px", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: "#111827" }}>{headerTitle || appName}</div>
        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Near your location</div>
      </div>
      {/* Map area */}
      <div style={{ height: 140, background: "linear-gradient(135deg, #e0f2fe, #bae6fd)", position: "relative", flexShrink: 0 }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 24 }}>🗺️</span>
          <span style={{ fontSize: 10, color: "#6b7280" }}>Tap to explore nearby</span>
        </div>
        {items.slice(0, 3).map((item, i) => (
          <div key={item.id} style={{
            position: "absolute", width: 28, height: 28, borderRadius: "50%",
            background: i === 0 ? p : "white",
            border: `2px solid ${p}`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
            top: 30 + i * 35, left: 40 + i * 55, boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}>{item.emoji}</div>
        ))}
      </div>
      {/* Nearby list */}
      <div className="flex-1 overflow-hidden px-3 pt-3 flex flex-col gap-2">
        <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 2 }}>Nearby</div>
        {items.slice(0, 2).map((item) => (
          <div key={item.id} style={{ background: "white", borderRadius: 12, padding: "9px 12px", border: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>{item.emoji}</span>
            <div className="flex-1 min-w-0">
              <div style={{ fontSize: 11, fontWeight: 600, color: "#111827" }}>{item.title}</div>
              <div style={{ fontSize: 10, color: "#9ca3af" }}>📍 {item.meta}</div>
            </div>
            <div style={{ background: p, borderRadius: 7, padding: "3px 7px" }}>
              <span style={{ fontSize: 10, color: "white", fontWeight: 600 }}>{ctaLabel}</span>
            </div>
          </div>
        ))}
      </div>
      <TabBar primary={p} tabs={[{ label: "Map", icon: "🗺️", active: true }, { label: "List", icon: "📋" }, { label: "Profile", icon: "👤" }]} />
    </div>
  );
}

// ── Booking preview ──────────────────────────────────────
function BookingPreview({ data }: { data: PreviewData }) {
  const { primaryColor: p, items, headerTitle, appName, ctaLabel } = data;
  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      <StatusBar />
      <div style={{ background: "white", padding: "8px 14px 12px", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: "#111827" }}>{headerTitle || appName}</div>
        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Book your appointment</div>
      </div>
      <div className="flex-1 overflow-hidden px-3 pt-3 flex flex-col gap-2.5">
        {items.slice(0, 3).map((item) => (
          <div key={item.id} style={{ background: "white", borderRadius: 14, padding: "12px", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <div className="flex items-start gap-2.5">
              <div style={{ width: 42, height: 42, borderRadius: 12, background: p + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                {item.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{item.title}</div>
                <div style={{ fontSize: 10, color: "#6b7280", marginTop: 1 }}>{item.subtitle}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: p }}>{item.meta}</span>
                  <div style={{ background: p, borderRadius: 8, padding: "4px 10px" }}>
                    <span style={{ fontSize: 10, color: "white", fontWeight: 600 }}>{ctaLabel}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <TabBar primary={p} tabs={[{ label: "Services", icon: "🗓️", active: true }, { label: "Bookings", icon: "📅" }, { label: "Profile", icon: "👤" }]} />
    </div>
  );
}

// ── eCommerce preview ────────────────────────────────────
function EcommercePreview({ data }: { data: PreviewData }) {
  const { primaryColor: p, items, headerTitle, appName, searchPlaceholder } = data;
  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      <StatusBar />
      <div style={{ background: "white", padding: "8px 14px 10px", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#111827" }}>{headerTitle || appName}</div>
          <div style={{ fontSize: 20 }}>🛒</div>
        </div>
        <div style={{ background: "#f3f4f6", borderRadius: 10, padding: "6px 10px", display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>🔍</span>
          <span style={{ fontSize: 11, color: "#9ca3af" }}>{searchPlaceholder}</span>
        </div>
      </div>
      <div className="flex-1 overflow-hidden px-3 pt-3">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {items.slice(0, 4).map((item) => (
            <div key={item.id} style={{ background: "white", borderRadius: 12, border: "1px solid #f1f5f9", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div style={{ height: 60, background: p + "12", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>
                {item.emoji}
              </div>
              <div style={{ padding: "8px 8px" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 5 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: p }}>{item.meta}</span>
                  <div style={{ background: p, borderRadius: 6, width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ color: "white", fontSize: 14, lineHeight: 1 }}>+</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <TabBar primary={p} tabs={[{ label: "Shop", icon: "🏪", active: true }, { label: "Cart", icon: "🛒" }, { label: "Profile", icon: "👤" }]} />
    </div>
  );
}

// ── Chat preview ─────────────────────────────────────────
function ChatPreview({ data }: { data: PreviewData }) {
  const { primaryColor: p, items, headerTitle, appName } = data;
  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      <StatusBar />
      <div style={{ padding: "8px 14px 10px", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: "#111827" }}>{headerTitle || appName}</div>
      </div>
      <div className="flex-1 overflow-hidden flex flex-col">
        {items.slice(0, 4).map((item, i) => (
          <div key={item.id} style={{ display: "flex", alignItems: "center", padding: "10px 14px", borderBottom: "1px solid #f9fafb", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: p + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
              {item.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>{item.title}</span>
                <span style={{ fontSize: 10, color: "#9ca3af" }}>{i === 0 ? "2m" : i === 1 ? "1h" : "Yesterday"}</span>
              </div>
              <div style={{ fontSize: 11, color: "#6b7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.subtitle}</div>
            </div>
            {i === 0 && (
              <div style={{ width: 18, height: 18, borderRadius: "50%", background: p, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 9, color: "white", fontWeight: 700 }}>3</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <TabBar primary={p} tabs={[{ label: "Chats", icon: "💬", active: true }, { label: "Explore", icon: "🔍" }, { label: "Profile", icon: "👤" }]} />
    </div>
  );
}

// ── Router ───────────────────────────────────────────────
export default function DynamicPreview({ data }: { data: PreviewData }) {
  switch (data.templateType) {
    case "auth-map":       return <MapPreview data={data} />;
    case "auth-booking":   return <BookingPreview data={data} />;
    case "auth-ecommerce": return <EcommercePreview data={data} />;
    case "auth-chat":      return <ChatPreview data={data} />;
    default:               return <FeedPreview data={data} />;
  }
}
