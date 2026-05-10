"use client";

import { useRef, useLayoutEffect } from "react";
import type { PreviewData } from "@/lib/preview-parser";

// ── Editable text node ───────────────────────────────────
function EditableText({
  value,
  field,
  editMode,
  onEdit,
  style,
}: {
  value: string;
  field: string;
  editMode: boolean;
  onEdit: (field: string, oldValue: string, newValue: string) => void;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  // Track the value at the time the user started editing so onBlur can diff correctly
  const savedValueRef = useRef(value);

  // Set DOM content imperatively — never pass children to contentEditable
  // so React never clobbers the user's in-progress edits on re-render
  useLayoutEffect(() => {
    if (ref.current && document.activeElement !== ref.current) {
      ref.current.textContent = value;
      savedValueRef.current = value;
    }
  }, [value]);

  if (!editMode) {
    return <span style={style}>{value}</span>;
  }

  return (
    <span
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onFocus={() => {
        savedValueRef.current = ref.current?.textContent ?? value;
        // Select all text on focus for easy replacement
        if (ref.current) {
          const range = document.createRange();
          range.selectNodeContents(ref.current);
          window.getSelection()?.removeAllRanges();
          window.getSelection()?.addRange(range);
        }
      }}
      onBlur={() => {
        const newValue = ref.current?.textContent ?? value;
        if (newValue !== savedValueRef.current) {
          onEdit(field, savedValueRef.current, newValue);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") { e.preventDefault(); ref.current?.blur(); }
        if (e.key === "Escape") {
          // Restore original text and blur
          if (ref.current) ref.current.textContent = savedValueRef.current;
          ref.current?.blur();
        }
      }}
      style={{
        ...style,
        outline: "1.5px dashed rgba(124,92,252,0.6)",
        borderRadius: 3,
        minWidth: 20,
        cursor: "text",
        padding: "0 2px",
      }}
    />
  );
}

// ── Color swatch overlay (only visible in edit mode) ─────
function ColorSwatch({
  color,
  editMode,
  onEdit,
}: {
  color: string;
  editMode: boolean;
  onEdit: (field: string, oldValue: string, newValue: string) => void;
}) {
  if (!editMode) return null;
  return (
    <div style={{ position: "absolute", top: 8, right: 8, zIndex: 20 }}>
      <label title="Change primary colour" style={{ cursor: "pointer", display: "block" }}>
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: color,
            border: "2px solid white",
            boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
          }}
        />
        <input
          type="color"
          defaultValue={color}
          style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }}
          onChange={(e) => onEdit("primaryColor", color, e.target.value)}
        />
      </label>
    </div>
  );
}

// ── Shared mini status bar ───────────────────────────────
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

// ── Shared bottom tab bar ────────────────────────────────
function TabBar({ tabs, primary }: { tabs: { label: string; icon: string; active?: boolean }[]; primary: string }) {
  return (
    <div style={{ borderTop: "1px solid #f1f5f9", background: "white", paddingBottom: 8, paddingTop: 6 }} className="flex-shrink-0">
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

type EditProps = {
  editMode: boolean;
  onEdit: (field: string, oldValue: string, newValue: string) => void;
};

// ── Feed preview ─────────────────────────────────────────
function FeedPreview({ data, editMode, onEdit }: { data: PreviewData } & EditProps) {
  const { primaryColor: p, items, headerTitle, searchPlaceholder, appName, ctaLabel } = data;
  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden" style={{ position: "relative" }}>
      <ColorSwatch color={p} editMode={editMode} onEdit={onEdit} />
      <StatusBar />
      <div style={{ background: "white", padding: "8px 14px 10px", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: "#111827", marginBottom: 6 }}>
          <EditableText value={headerTitle || appName} field="headerTitle" editMode={editMode} onEdit={onEdit} />
        </div>
        <div style={{ background: "#f3f4f6", borderRadius: 10, padding: "6px 10px", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>🔍</span>
          <EditableText value={searchPlaceholder} field="searchPlaceholder" editMode={editMode} onEdit={onEdit} style={{ fontSize: 11, color: "#9ca3af" }} />
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
                <EditableText value={ctaLabel} field="ctaLabel" editMode={editMode} onEdit={onEdit} style={{ fontSize: 10, color: "white", fontWeight: 600 }} />
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
function MapPreview({ data, editMode, onEdit }: { data: PreviewData } & EditProps) {
  const { primaryColor: p, items, headerTitle, appName, ctaLabel } = data;
  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden" style={{ position: "relative" }}>
      <ColorSwatch color={p} editMode={editMode} onEdit={onEdit} />
      <StatusBar />
      <div style={{ background: "white", padding: "8px 14px 10px", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: "#111827" }}>
          <EditableText value={headerTitle || appName} field="headerTitle" editMode={editMode} onEdit={onEdit} />
        </div>
        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Near your location</div>
      </div>
      <div style={{ height: 140, background: "linear-gradient(135deg, #e0f2fe, #bae6fd)", position: "relative", flexShrink: 0 }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 24 }}>🗺️</span>
          <span style={{ fontSize: 10, color: "#6b7280" }}>Tap to explore nearby</span>
        </div>
        {items.slice(0, 3).map((item, i) => (
          <div key={item.id} style={{ position: "absolute", width: 28, height: 28, borderRadius: "50%", background: i === 0 ? p : "white", border: `2px solid ${p}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, top: 30 + i * 35, left: 40 + i * 55, boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>{item.emoji}</div>
        ))}
      </div>
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
              <EditableText value={ctaLabel} field="ctaLabel" editMode={editMode} onEdit={onEdit} style={{ fontSize: 10, color: "white", fontWeight: 600 }} />
            </div>
          </div>
        ))}
      </div>
      <TabBar primary={p} tabs={[{ label: "Map", icon: "🗺️", active: true }, { label: "List", icon: "📋" }, { label: "Profile", icon: "👤" }]} />
    </div>
  );
}

// ── Booking preview ──────────────────────────────────────
function BookingPreview({ data, editMode, onEdit }: { data: PreviewData } & EditProps) {
  const { primaryColor: p, items, headerTitle, appName, ctaLabel } = data;
  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden" style={{ position: "relative" }}>
      <ColorSwatch color={p} editMode={editMode} onEdit={onEdit} />
      <StatusBar />
      <div style={{ background: "white", padding: "8px 14px 12px", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: "#111827" }}>
          <EditableText value={headerTitle || appName} field="headerTitle" editMode={editMode} onEdit={onEdit} />
        </div>
        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Book your appointment</div>
      </div>
      <div className="flex-1 overflow-hidden px-3 pt-3 flex flex-col gap-2.5">
        {items.slice(0, 3).map((item) => (
          <div key={item.id} style={{ background: "white", borderRadius: 14, padding: "12px", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <div className="flex items-start gap-2.5">
              <div style={{ width: 42, height: 42, borderRadius: 12, background: p + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{item.emoji}</div>
              <div className="flex-1 min-w-0">
                <div style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{item.title}</div>
                <div style={{ fontSize: 10, color: "#6b7280", marginTop: 1 }}>{item.subtitle}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: p }}>{item.meta}</span>
                  <div style={{ background: p, borderRadius: 8, padding: "4px 10px" }}>
                    <EditableText value={ctaLabel} field="ctaLabel" editMode={editMode} onEdit={onEdit} style={{ fontSize: 10, color: "white", fontWeight: 600 }} />
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
function EcommercePreview({ data, editMode, onEdit }: { data: PreviewData } & EditProps) {
  const { primaryColor: p, items, headerTitle, appName, searchPlaceholder } = data;
  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden" style={{ position: "relative" }}>
      <ColorSwatch color={p} editMode={editMode} onEdit={onEdit} />
      <StatusBar />
      <div style={{ background: "white", padding: "8px 14px 10px", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#111827" }}>
            <EditableText value={headerTitle || appName} field="headerTitle" editMode={editMode} onEdit={onEdit} />
          </div>
          <div style={{ fontSize: 20 }}>🛒</div>
        </div>
        <div style={{ background: "#f3f4f6", borderRadius: 10, padding: "6px 10px", display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>🔍</span>
          <EditableText value={searchPlaceholder} field="searchPlaceholder" editMode={editMode} onEdit={onEdit} style={{ fontSize: 11, color: "#9ca3af" }} />
        </div>
      </div>
      <div className="flex-1 overflow-hidden px-3 pt-3">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {items.slice(0, 4).map((item) => (
            <div key={item.id} style={{ background: "white", borderRadius: 12, border: "1px solid #f1f5f9", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div style={{ height: 60, background: p + "12", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>{item.emoji}</div>
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
function ChatPreview({ data, editMode, onEdit }: { data: PreviewData } & EditProps) {
  const { primaryColor: p, items, headerTitle, appName } = data;
  return (
    <div className="flex flex-col h-full bg-white overflow-hidden" style={{ position: "relative" }}>
      <ColorSwatch color={p} editMode={editMode} onEdit={onEdit} />
      <StatusBar />
      <div style={{ padding: "8px 14px 10px", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: "#111827" }}>
          <EditableText value={headerTitle || appName} field="headerTitle" editMode={editMode} onEdit={onEdit} />
        </div>
      </div>
      <div className="flex-1 overflow-hidden flex flex-col">
        {items.slice(0, 4).map((item, i) => (
          <div key={item.id} style={{ display: "flex", alignItems: "center", padding: "10px 14px", borderBottom: "1px solid #f9fafb", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: p + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{item.emoji}</div>
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
export default function DynamicPreview({
  data,
  editMode = false,
  onEdit = () => {},
}: {
  data: PreviewData;
  editMode?: boolean;
  onEdit?: (field: string, oldValue: string, newValue: string) => void;
}) {
  const props = { data, editMode, onEdit };
  switch (data.templateType) {
    case "auth-map":       return <MapPreview {...props} />;
    case "auth-booking":   return <BookingPreview {...props} />;
    case "auth-ecommerce": return <EcommercePreview {...props} />;
    case "auth-chat":      return <ChatPreview {...props} />;
    default:               return <FeedPreview {...props} />;
  }
}
