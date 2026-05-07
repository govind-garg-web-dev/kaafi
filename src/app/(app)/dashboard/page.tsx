import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Smartphone } from "lucide-react";
import ProjectGrid from "@/components/app/ProjectGrid";
import WelcomeModal from "@/components/app/WelcomeModal";

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
      <WelcomeModal isFirstTime={list.length === 0} />
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
        <ProjectGrid projects={list} />
      )}
    </div>
  );
}
