"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Smartphone, Clock, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";

type Project = {
  id: string;
  name: string;
  prompt: string;
  status: string;
  created_at: string;
};

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  draft:      { label: "Draft",      color: "#64748b", bg: "rgba(100,116,139,0.12)" },
  generating: { label: "Generating", color: "#f59e0b", bg: "rgba(245,158,11,0.12)"  },
  ready:      { label: "Ready",      color: "#34d399", bg: "rgba(52,211,153,0.12)"  },
  error:      { label: "Error",      color: "#f87171", bg: "rgba(248,113,113,0.12)" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function ProjectGrid({ projects }: { projects: Project[] }) {
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Deleted", `"${deleteTarget.name}" has been deleted.`);
      setDeleteTarget(null);
      router.refresh(); // re-fetch server component
    } catch (err) {
      toast.error("Delete failed", err instanceof Error ? err.message : "Try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => {
          const s = STATUS_STYLE[project.status] ?? STATUS_STYLE.draft;
          return (
            <div key={project.id} className="relative group">
              <Link href={`/project/${project.id}`}>
                <div
                  className="rounded-2xl p-5 h-full cursor-pointer transition-all duration-200 hover:border-violet-500/30"
                  style={{
                    background: "rgba(14,14,28,0.6)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600/20 to-cyan-600/20 border border-violet-500/10 flex items-center justify-center mb-4">
                    <Smartphone size={18} className="text-violet-400" />
                  </div>

                  <h3
                    className="text-white font-semibold text-base mb-1 group-hover:text-violet-300 transition-colors line-clamp-1 pr-8"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    {project.name}
                  </h3>

                  <p
                    className="text-[#64748b] text-xs leading-relaxed line-clamp-2 mb-4"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    {project.prompt}
                  </p>

                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: s.bg, color: s.color, fontFamily: "var(--font-inter)" }}
                    >
                      {s.label}
                    </span>
                    <div className="flex items-center gap-1 text-[#4a5568] text-xs" style={{ fontFamily: "var(--font-inter)" }}>
                      <Clock size={11} />
                      {timeAgo(project.created_at)}
                    </div>
                  </div>
                </div>
              </Link>

              {/* Delete button — appears on hover */}
              <button
                onClick={(e) => { e.preventDefault(); setDeleteTarget(project); }}
                className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-150 text-[#4a5568] hover:text-red-400 hover:bg-red-500/10"
                title="Delete project"
              >
                <Trash2 size={13} />
              </button>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete this project?"
        message={`"${deleteTarget?.name}" and all its files will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete project"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
