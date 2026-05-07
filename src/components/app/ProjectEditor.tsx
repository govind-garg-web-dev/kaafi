"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Download, RotateCcw, Smartphone, Code2, ChevronDown, Loader2, Pencil, Trash2, Check, X } from "lucide-react";
import type { Project, ProjectFile } from "@/lib/supabase/types";
import { useToast } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useRouter } from "next/navigation";

type Message = { role: "user" | "assistant"; content: string };

const DEVICES = ["iPhone 15", "Pixel 8", "iPad"];

function PhoneBezel({ children, device }: { children: React.ReactNode; device: string }) {
  const isTablet = device === "iPad";
  return (
    <div
      className="relative mx-auto flex-shrink-0"
      style={{
        width: isTablet ? 380 : 270,
        height: isTablet ? 520 : 560,
      }}
    >
      {/* Glow */}
      <div className="absolute inset-0 rounded-[44px] bg-gradient-to-br from-violet-600/20 to-cyan-600/10 blur-2xl scale-105 pointer-events-none" />

      {/* Frame */}
      <div
        className="relative w-full h-full rounded-[44px] overflow-hidden border border-white/12"
        style={{ background: "#0e0e1c", boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}
      >
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-6 bg-[#07070f] rounded-b-2xl z-20" />

        {/* Screen */}
        <div className="absolute inset-0 overflow-hidden">{children}</div>
      </div>

      {/* Side buttons */}
      <div className="absolute right-[-4px] top-28 w-1 h-12 bg-[#1a1a2e] rounded-r-sm" />
      <div className="absolute left-[-4px] top-20 w-1 h-8 bg-[#1a1a2e] rounded-l-sm" />
      <div className="absolute left-[-4px] top-32 w-1 h-8 bg-[#1a1a2e] rounded-l-sm" />
    </div>
  );
}

function PreviewPane({ files, device }: { files: ProjectFile[]; device: string }) {
  // Show a visual representation of the generated files
  const indexFile = files.find((f) => f.path.includes("(tabs)/index"));
  const hasFiles = files.length > 0;

  return (
    <PhoneBezel device={device}>
      <div className="absolute inset-0 bg-white overflow-auto" style={{ paddingTop: 28 }}>
        {!hasFiles ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center px-6">
              <div className="text-4xl mb-3">⏳</div>
              <p className="text-gray-500 text-sm">Generating your app…</p>
            </div>
          </div>
        ) : (
          <div className="h-full">
            {/* Fake top bar */}
            <div className="px-4 pt-2 pb-3 border-b border-gray-100">
              <div className="h-5 bg-gray-200 rounded w-2/3 mb-1.5" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
            {/* Fake feed */}
            <div className="px-4 pt-4 flex flex-col gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-xl border border-gray-100 p-3 bg-white shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-lg">
                      {["🐾", "🍱", "💰", "📅"][i - 1]}
                    </div>
                    <div className="flex-1">
                      <div className="h-3.5 bg-gray-200 rounded mb-1 w-4/5" />
                      <div className="h-2.5 bg-gray-100 rounded w-3/5" />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-medium">
                      Book
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PhoneBezel>
  );
}

function CodePane({ files }: { files: ProjectFile[] }) {
  const [activeFile, setActiveFile] = useState(files[0]?.path ?? "");
  const current = files.find((f) => f.path === activeFile);

  return (
    <div className="flex flex-col h-full overflow-hidden rounded-2xl border border-white/7" style={{ background: "#0d0d1a" }}>
      {/* File tabs */}
      <div className="flex overflow-x-auto border-b border-white/6 flex-shrink-0" style={{ scrollbarWidth: "none" }}>
        {files.map((f) => (
          <button
            key={f.path}
            onClick={() => setActiveFile(f.path)}
            className="px-4 py-2.5 text-xs whitespace-nowrap flex-shrink-0 border-r border-white/5 transition-colors"
            style={{
              fontFamily: "var(--font-inter)",
              background: activeFile === f.path ? "rgba(124,92,252,0.12)" : "transparent",
              color: activeFile === f.path ? "#a78bfa" : "#64748b",
            }}
          >
            {f.path.split("/").pop()}
          </button>
        ))}
      </div>
      {/* Code content */}
      <div className="flex-1 overflow-auto p-4">
        <pre className="text-xs text-[#94a3b8] leading-relaxed whitespace-pre-wrap break-words" style={{ fontFamily: "monospace" }}>
          {current?.content ?? "Select a file"}
        </pre>
      </div>
    </div>
  );
}

export default function ProjectEditor({
  project,
  files: initialFiles,
}: {
  project: Project;
  files: ProjectFile[];
}) {
  const [files] = useState(initialFiles);
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [device, setDevice] = useState(DEVICES[0]);
  const [deviceOpen, setDeviceOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [creditEstimate, setCreditEstimate] = useState<{ type: "light" | "heavy"; credits: 1 | 2 } | null>(null);
  const [classifying, setClassifying] = useState(false);
  const classifyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [exporting, setExporting] = useState(false);
  const [projectName, setProjectName] = useState(project.name);
  const [editingName, setEditingName] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Rename project
  const handleRename = async () => {
    const trimmed = projectName.trim();
    if (!trimmed || trimmed === project.name) { setEditingName(false); return; }
    setSavingName(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Renamed", `Project renamed to "${trimmed}".`);
      setEditingName(false);
    } catch (err) {
      toast.error("Rename failed", err instanceof Error ? err.message : "Try again.");
      setProjectName(project.name); // revert
    } finally {
      setSavingName(false);
    }
  };

  // Delete project
  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Deleted", "Project has been deleted.");
      router.push("/dashboard");
    } catch (err) {
      toast.error("Delete failed", err instanceof Error ? err.message : "Try again.");
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  // Debounced credit cost classification
  const handleInputChange = (val: string) => {
    setInput(val);
    if (classifyTimer.current) clearTimeout(classifyTimer.current);
    if (!val.trim()) { setCreditEstimate(null); setClassifying(false); return; }
    setClassifying(true);
    classifyTimer.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/ai/classify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: val.trim() }),
        });
        const data = await res.json();
        setCreditEstimate(data);
      } catch {
        setCreditEstimate({ type: "light", credits: 1 });
      } finally {
        setClassifying(false);
      }
    }, 600);
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const userMsg = input.trim();
    setInput("");
    setSending(true);
    setMessages((m) => [...m, { role: "user", content: userMsg }]);

    try {
      const res = await fetch("/api/ai/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id, message: userMsg, files }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Edit failed");
      setMessages((m) => [...m, { role: "assistant", content: data.reply ?? "Changes applied." }]);
      toast.success("Change applied");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setMessages((m) => [...m, { role: "assistant", content: msg }]);
      toast.error("Edit failed", msg);
    } finally {
      setSending(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Export failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project.name.replace(/\s+/g, "-").toLowerCase()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("ZIP downloaded", "Your source code is ready.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Export failed.";
      toast.error("Export failed", msg);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left: Preview + Code */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-white/5">
        {/* Top bar */}
        <div className="h-14 border-b border-white/5 flex items-center justify-between px-5 flex-shrink-0">
          <div className="flex items-center gap-1 rounded-xl p-1" style={{ background: "rgba(255,255,255,0.04)" }}>
            {(["preview", "code"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize"
                style={{
                  background: activeTab === tab ? "rgba(124,92,252,0.18)" : "transparent",
                  color: activeTab === tab ? "#a78bfa" : "#64748b",
                  fontFamily: "var(--font-inter)",
                }}
              >
                {tab === "preview" ? <Smartphone size={13} /> : <Code2 size={13} />}
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Device picker */}
            {activeTab === "preview" && (
              <div className="relative">
                <button
                  onClick={() => setDeviceOpen(!deviceOpen)}
                  className="flex items-center gap-1.5 text-xs text-[#64748b] hover:text-white transition-colors px-3 py-1.5 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.04)", fontFamily: "var(--font-inter)" }}
                >
                  {device}
                  <ChevronDown size={12} />
                </button>
                <AnimatePresence>
                  {deviceOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute right-0 top-full mt-1 rounded-xl overflow-hidden shadow-xl z-20"
                      style={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      {DEVICES.map((d) => (
                        <button key={d} onClick={() => { setDevice(d); setDeviceOpen(false); }}
                          className="block w-full text-left px-4 py-2.5 text-xs text-[#94a3b8] hover:text-white hover:bg-white/5 transition-colors"
                          style={{ fontFamily: "var(--font-inter)" }}>
                          {d}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Export */}
            <button
              onClick={handleExport}
              disabled={exporting}
              className="btn-outline flex items-center gap-1.5 px-3 py-1.5 text-xs"
            >
              {exporting ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
              Export ZIP
            </button>
          </div>
        </div>

        {/* Preview / Code area */}
        <div className="flex-1 overflow-hidden flex items-center justify-center p-8">
          {activeTab === "preview" ? (
            <PreviewPane files={files} device={device} />
          ) : (
            <div className="w-full h-full">
              <CodePane files={files} />
            </div>
          )}
        </div>
      </div>

      {/* Right: Chat */}
      <div className="w-80 flex-shrink-0 flex flex-col">
        {/* Chat header */}
        <div className="h-14 border-b border-white/5 flex items-center justify-between px-4 flex-shrink-0 gap-2">
          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="flex items-center gap-1">
                <input
                  ref={nameInputRef}
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRename();
                    if (e.key === "Escape") { setProjectName(project.name); setEditingName(false); }
                  }}
                  autoFocus
                  className="flex-1 bg-transparent text-white text-sm font-semibold outline-none border-b border-violet-500 pb-0.5 min-w-0"
                  style={{ fontFamily: "var(--font-playfair)" }}
                />
                <button onClick={handleRename} disabled={savingName} className="text-violet-400 hover:text-violet-300 p-1 flex-shrink-0">
                  {savingName ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                </button>
                <button onClick={() => { setProjectName(project.name); setEditingName(false); }} className="text-[#64748b] hover:text-white p-1 flex-shrink-0">
                  <X size={13} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditingName(true)}
                className="flex items-center gap-1.5 group text-left w-full"
              >
                <p className="text-white text-sm font-semibold line-clamp-1 group-hover:text-violet-300 transition-colors" style={{ fontFamily: "var(--font-playfair)" }}>
                  {projectName}
                </p>
                <Pencil size={11} className="text-[#4a5568] group-hover:text-violet-400 flex-shrink-0 transition-colors" />
              </button>
            )}
            <p className="text-[#4a5568] text-xs" style={{ fontFamily: "var(--font-inter)" }}>
              {files.length} files · 1 credit/edit
            </p>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            title="Delete project"
            className="text-[#4a5568] hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/8 flex-shrink-0"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Delete confirmation */}
        <ConfirmDialog
          open={showDeleteConfirm}
          title="Delete this project?"
          message={`"${projectName}" and all its files will be permanently deleted. This cannot be undone.`}
          confirmLabel="Delete project"
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3" style={{ scrollbarWidth: "thin", scrollbarColor: "#2a2a4a transparent" }}>
          {messages.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[#4a5568] text-sm" style={{ fontFamily: "var(--font-inter)" }}>
                Tell me what to change.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                {[
                  "Change the primary colour to green",
                  "Make the header text larger",
                  "Add a search bar to the home screen",
                ].map((s) => (
                  <button key={s} onClick={() => setInput(s)}
                    className="text-xs text-left px-3 py-2 rounded-xl text-[#64748b] hover:text-white transition-all hover:bg-white/5"
                    style={{ border: "1px solid rgba(255,255,255,0.07)", fontFamily: "var(--font-inter)" }}>
                    &ldquo;{s}&rdquo;
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
                style={{
                  background: msg.role === "user" ? "rgba(124,92,252,0.18)" : "rgba(255,255,255,0.05)",
                  color: msg.role === "user" ? "#e2d9ff" : "#94a3b8",
                  border: msg.role === "user" ? "1px solid rgba(124,92,252,0.3)" : "1px solid rgba(255,255,255,0.07)",
                  fontFamily: "var(--font-inter)",
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex justify-start">
              <div className="flex gap-1 px-4 py-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
                {[0, 1, 2].map((i) => (
                  <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                    className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                ))}
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-white/5">
          <div className="flex gap-2 items-end">
            <textarea
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Describe a change…"
              rows={2}
              className="flex-1 bg-transparent text-white text-sm resize-none outline-none placeholder-[#3a3a5a] leading-relaxed py-2 px-3 rounded-xl"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "var(--font-inter)" }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="p-2.5 rounded-xl btn-primary flex-shrink-0 disabled:opacity-40"
            >
              {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            </button>
          </div>

          {/* Credit cost estimate */}
          <div className="flex items-center justify-between mt-1.5 px-1">
            <AnimatePresence mode="wait">
              {classifying && input.trim() ? (
                <motion.span key="classifying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-xs text-[#3a3a5a] flex items-center gap-1" style={{ fontFamily: "var(--font-inter)" }}>
                  <Loader2 size={10} className="animate-spin" /> estimating…
                </motion.span>
              ) : creditEstimate && input.trim() ? (
                <motion.span key="estimate" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    fontFamily: "var(--font-inter)",
                    background: creditEstimate.type === "heavy" ? "rgba(245,158,11,0.12)" : "rgba(124,92,252,0.12)",
                    color: creditEstimate.type === "heavy" ? "#f59e0b" : "#a78bfa",
                  }}>
                  ~{creditEstimate.credits} credit{creditEstimate.credits > 1 ? "s" : ""} · {creditEstimate.type} edit
                </motion.span>
              ) : (
                <motion.span key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-xs text-[#3a3a5a]" style={{ fontFamily: "var(--font-inter)" }}>
                  ~1–2 credits per edit
                </motion.span>
              )}
            </AnimatePresence>
            <span className="text-xs text-[#3a3a5a]" style={{ fontFamily: "var(--font-inter)" }}>Enter to send</span>
          </div>
        </div>
      </div>
    </div>
  );
}
