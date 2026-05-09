import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parsePreviewData } from "@/lib/preview-parser";
import { generateSnackCode, SNACK_DEPENDENCIES } from "@/lib/snack-generators";

const SNACK_API = "https://exp.host/--/api/v2/snack/save";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { projectId } = await req.json();
    if (!projectId) return NextResponse.json({ error: "projectId required." }, { status: 400 });

    // Fetch project + files
    const { data: project } = await supabase
      .from("projects")
      .select("name, scaffold_type")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });

    const { data: files } = await supabase
      .from("project_files")
      .select("path, content")
      .eq("project_id", projectId);

    // Parse preview data from generated files
    const previewData = parsePreviewData(
      (files ?? []).map((f) => ({ path: f.path, content: f.content })),
      project.scaffold_type ?? "auth-feed"
    );

    // Generate Snack-compatible App.js
    const appCode = generateSnackCode(previewData);

    // Call Expo Snack API
    const snackRes = await fetch(SNACK_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: project.name,
        description: `Built with Kaafi — kaafi.app`,
        files: {
          "App.js": { type: "CODE", contents: appCode },
        },
        dependencies: SNACK_DEPENDENCIES,
        sdkVersion: "51.0.0",
      }),
    });

    if (!snackRes.ok) {
      const errText = await snackRes.text();
      throw new Error(`Snack API error: ${snackRes.status} ${errText.slice(0, 100)}`);
    }

    const snackData = await snackRes.json();
    const snackId = snackData.id ?? snackData.hashId;

    if (!snackId) throw new Error("No snack ID returned from Expo API");

    const embedUrl = `https://snack.expo.dev/embedded/${snackId}?platform=web&preview=true&theme=light&supportedPlatforms=web`;

    return NextResponse.json({ snackId, embedUrl });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to create preview.";
    console.error("[/api/preview/snack]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
