import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/projects/:id/visual-edit
// Updates a single field in the generated project files — no AI call, no credits.
// Body: { field: "primaryColor" | "appName" | "headerTitle" | "ctaLabel" | "searchPlaceholder", value: string, oldValue?: string }
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id: projectId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Ownership check
    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();
    if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });

    const { field, value, oldValue } = await req.json();
    if (!field || value === undefined) {
      return NextResponse.json({ error: "Missing field or value." }, { status: 400 });
    }

    // Fetch only the file(s) we need to update
    const targetPath = field === "primaryColor"
      ? "tailwind.config.js"
      : field === "appName"
      ? "app.json"
      : "app/(tabs)/index.tsx";

    const { data: fileRow } = await supabase
      .from("project_files")
      .select("id, content")
      .eq("project_id", projectId)
      .eq("path", targetPath)
      .single();

    if (!fileRow) {
      return NextResponse.json({ error: `File not found: ${targetPath}` }, { status: 404 });
    }

    let updatedContent = fileRow.content;

    if (field === "primaryColor") {
      // Replace the primary color hex value in tailwind.config.js
      updatedContent = updatedContent.replace(
        /primary:\s*["'][^"']+["']/,
        `primary: "${value}"`
      );
    } else if (field === "appName") {
      // Update expo.name in app.json
      try {
        const json = JSON.parse(updatedContent);
        if (json?.expo) json.expo.name = value;
        updatedContent = JSON.stringify(json, null, 2);
      } catch {
        return NextResponse.json({ error: "Could not parse app.json." }, { status: 422 });
      }
    } else if (oldValue && typeof oldValue === "string" && oldValue.trim()) {
      // Text field: simple string replace of the old value with the new one
      updatedContent = updatedContent.replaceAll(oldValue, value);
    } else {
      return NextResponse.json({ error: "oldValue required for text fields." }, { status: 400 });
    }

    // Save back to DB
    await supabase
      .from("project_files")
      .update({ content: updatedContent })
      .eq("id", fileRow.id);

    return NextResponse.json({ path: targetPath, content: updatedContent });
  } catch (err) {
    console.error("[/api/projects/visual-edit]", err);
    return NextResponse.json({ error: "Visual edit failed." }, { status: 500 });
  }
}
