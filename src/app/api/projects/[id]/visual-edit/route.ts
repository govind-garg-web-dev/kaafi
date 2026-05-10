import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/projects/:id/visual-edit
// Updates a single display field in the generated project files — no AI, no credits.
// Body: { field: "primaryColor" | "appName" | "headerTitle" | "ctaLabel" | "searchPlaceholder", value: string }
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id: projectId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();
    if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });

    const { field, value } = await req.json();
    if (!field || value === undefined || value === null) {
      return NextResponse.json({ error: "Missing field or value." }, { status: 400 });
    }

    const targetPath =
      field === "primaryColor" ? "tailwind.config.js" :
      field === "appName"      ? "app.json" :
                                  "app/(tabs)/index.tsx";

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
    let matched = false;

    if (field === "primaryColor") {
      // tailwind.config.js: replace the primary color value
      const next = updatedContent.replace(
        /primary:\s*["'][^"']*["']/,
        `primary: "${value}"`
      );
      matched = next !== updatedContent;
      updatedContent = next;

    } else if (field === "appName") {
      // app.json: update expo.name
      try {
        const json = JSON.parse(updatedContent);
        if (json?.expo) { json.expo.name = value; matched = true; }
        updatedContent = JSON.stringify(json, null, 2);
      } catch {
        return NextResponse.json({ error: "Could not parse app.json." }, { status: 422 });
      }

    } else if (field === "headerTitle") {
      // index.tsx: replace the big header text (className contains font-bold)
      const next = updatedContent.replace(
        /(className=["'][^"']*font-bold[^"']*["'][^>]*>)\s*([^<\n]{1,60})\s*(<\/Text>)/,
        `$1${value}$3`
      );
      matched = next !== updatedContent;
      updatedContent = next;

    } else if (field === "ctaLabel") {
      // index.tsx: replace the CTA button label (Text inside TouchableOpacity)
      const next = updatedContent.replace(
        /(<Text[^>]*>)\s*([A-Za-z][A-Za-z0-9 ]{0,20})\s*(<\/Text>\s*<\/TouchableOpacity>)/,
        `$1${value}$3`
      );
      matched = next !== updatedContent;
      updatedContent = next;

    } else if (field === "searchPlaceholder") {
      // index.tsx: replace the placeholder prop
      const next = updatedContent.replace(
        /placeholder=["'][^"']*["']/,
        `placeholder="${value}"`
      );
      matched = next !== updatedContent;
      updatedContent = next;

    } else {
      return NextResponse.json({ error: `Unknown field: ${field}` }, { status: 400 });
    }

    if (!matched && field !== "appName") {
      // Pattern didn't find a match — still save what we have but warn the client
      console.warn(`[visual-edit] Pattern for field "${field}" did not match in ${targetPath}`);
    }

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
