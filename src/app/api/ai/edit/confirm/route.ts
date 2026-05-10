import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const CREDIT_COST = 1;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { projectId, patches, currentFiles } = await req.json();

    if (!projectId || !Array.isArray(patches) || !Array.isArray(currentFiles)) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // Re-check credits at confirm time (race-condition safe)
    const { data: profile } = await supabase
      .from("profiles")
      .select("credits_balance")
      .eq("id", user.id)
      .single();

    if (!profile || profile.credits_balance < CREDIT_COST) {
      return NextResponse.json({ error: "Insufficient credits." }, { status: 402 });
    }

    // Deduct credit
    await supabase
      .from("profiles")
      .update({ credits_balance: profile.credits_balance - CREDIT_COST })
      .eq("id", user.id);

    await supabase.from("credit_transactions").insert({
      user_id: user.id,
      delta: -CREDIT_COST,
      reason: "Chat edit (confirmed)",
      project_id: projectId,
    });

    // Save snapshot of current files BEFORE applying patches
    await supabase.from("project_snapshots").insert({
      project_id: projectId,
      files: currentFiles,
    });

    // Keep only the 5 most recent snapshots
    const { data: allSnapshots } = await supabase
      .from("project_snapshots")
      .select("id")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (allSnapshots && allSnapshots.length > 5) {
      const toDelete = allSnapshots.slice(5).map((s) => s.id);
      await supabase.from("project_snapshots").delete().in("id", toDelete);
    }

    // Apply patches to DB — update existing rows by (project_id, path)
    // Never upsert without onConflict: it inserts duplicates instead of updating
    for (const patch of patches as { path: string; content: string }[]) {
      await supabase
        .from("project_files")
        .update({ content: patch.content })
        .eq("project_id", projectId)
        .eq("path", patch.path);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/ai/edit/confirm]", err);
    return NextResponse.json({ error: "Confirm failed." }, { status: 500 });
  }
}
