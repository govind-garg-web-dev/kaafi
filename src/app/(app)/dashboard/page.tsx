import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Smartphone, Clock } from "lucide-react";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  draft:      { label: "Draft",      color: "#64748b", bg: "rgba(100,116,139,0.12)" },
  generating: { label: "Generating", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  ready:      { label: "Ready",      color: "#34d399", bg: "rgba(52,211,153,0.12)" },
  error:      { label: "Error",      color: "#f87171", bg: "rgba(248,113,113,0.12)" },
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const list = (projects ?? []) as Array<{
    id: string; name: string; prompt: string;
    status: string; created_at: string;
  }>;

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-playfair)" }}>
            Your projects
          </h1>
          <p className="text-[#64748b] text-sm mt-1" style={{ fontFamily: "var(--font-inter)" }}>
            {list.length === 0 ? "Build your first app — it takes 2 minutes." : `${list.length} project${list.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <Link href="/new">
          <button className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm">
            <Plus size={15} />
            New project
          </button>
        </Link>
      </div>

      {list.length === 0 ? (
        /* Empty state */
        <div
          className="rounded-3xl p-16 text-center"
          style={{ background: "rgba(14,14,28,0.5)", border: "1px dashed rgba(255,255,255,0.08)" }}
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600/20 to-cyan-600/20 border border-violet-500/20 flex items-center justify-center mx-auto mb-4">
            <Smartphone size={28} className="text-violet-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-playfair)" }}>
            No projects yet
          </h2>
          <p className="text-[#64748b] text-sm mb-6 max-w-xs mx-auto" style={{ fontFamily: "var(--font-inter)" }}>
            Describe your app idea and answer a few questions. Kaafi builds the rest.
          </p>
          <Link href="/new">
            <button className="btn-primary px-6 py-3 text-sm inline-flex items-center gap-2">
              <Plus size={15} />
              Build your first app
            </button>
          </Link>
        </div>
      ) : (
        /* Project grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((project) => {
            const s = STATUS_STYLE[project.status] ?? STATUS_STYLE.draft;
            return (
              <Link key={project.id} href={`/project/${project.id}`}>
                <div
                  className="rounded-2xl p-5 h-full cursor-pointer group transition-all duration-200 hover:border-violet-500/30"
                  style={{
                    background: "rgba(14,14,28,0.6)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  {/* Icon placeholder */}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600/20 to-cyan-600/20 border border-violet-500/10 flex items-center justify-center mb-4">
                    <Smartphone size={18} className="text-violet-400" />
                  </div>

                  {/* Name */}
                  <h3
                    className="text-white font-semibold text-base mb-1 group-hover:text-violet-300 transition-colors line-clamp-1"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    {project.name}
                  </h3>

                  {/* Prompt */}
                  <p
                    className="text-[#64748b] text-xs leading-relaxed line-clamp-2 mb-4"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    {project.prompt}
                  </p>

                  {/* Footer */}
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
            );
          })}
        </div>
      )}
    </div>
  );
}
