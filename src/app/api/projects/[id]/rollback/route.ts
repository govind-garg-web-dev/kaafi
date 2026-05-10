import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ id: string }> };

// POST /api/projects/:id/rollback — restore the most recent snapshot
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id: projectId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Verify project belongs to this user
    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });

    // Get the most recent snapshot
    const { data: snapshot } = await supabase
      .from("project_snapshots")
      .select("id, files")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!snapshot) {
      return NextResponse.json({ error: "No snapshot available to restore." }, { status: 404 });
    }

    const files = snapshot.files as { path: string; content: string }[];

    // Restore each file in the snapshot
    for (const file of files) {
      await supabase
        .from("project_files")
        .upsert({ project_id: projectId, path: file.path, content: file.content });
    }

    // Delete the used snapshot so the next undo goes one step further back
    await supabase.from("project_snapshots").delete().eq("id", snapshot.id);

    // Check if more snapshots remain (so client knows whether to keep showing undo button)
    const { count } = await supabase
      .from("project_snapshots")
      .select("id", { count: "exact", head: true })
      .eq("project_id", projectId);

    return NextResponse.json({ files, hasMore: (count ?? 0) > 0 });
  } catch (err) {
    console.error("[/api/projects/rollback]", err);
    return NextResponse.json({ error: "Rollback failed." }, { status: 500 });
  }
}
