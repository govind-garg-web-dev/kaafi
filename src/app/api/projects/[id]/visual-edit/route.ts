import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/projects/:id/visual-edit — no AI, no credits
// Body: { field, value }
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

    if (field === "primaryColor") {
      // Replace primary color value in tailwind.config.js
      updatedContent = updatedContent.replace(
        /primary:\s*["'][^"']*["']/,
        `primary: "${value}"`
      );

    } else if (field === "appName") {
      try {
        const json = JSON.parse(updatedContent);
        if (json?.expo) json.expo.name = value;
        updatedContent = JSON.stringify(json, null, 2);
      } catch {
        return NextResponse.json({ error: "Could not parse app.json." }, { status: 422 });
      }

    } else if (field === "headerTitle") {
      // Match the main screen header: any font-bold Text across all scaffold sizes
      // Covers text-xl, text-2xl, text-3xl used across scaffolds
      const replaced = updatedContent.replace(
        /(text-(?:xl|2xl|3xl) font-bold[^"]*"[^>]*>)\s*([^<\n]+?)\s*(<\/Text>)/,
        `$1${value}$3`
      );
      if (replaced !== updatedContent) {
        updatedContent = replaced;
      } else {
        // Fallback: replace between any font-bold Text tags
        updatedContent = updatedContent.replace(
          /(font-bold[^"]*"[^>]*>)\s*([^<\n]+?)\s*(<\/Text>)/,
          `$1${value}$3`
        );
      }

    } else if (field === "ctaLabel") {
      // Match the CTA button text: white text with font-semibold inside TouchableOpacity
      const replaced = updatedContent.replace(
        /(<Text className="text-white[^"]*font-semibold[^"]*">)\s*([^<\n]+?)\s*(<\/Text>)/,
        `$1${value}$3`
      );
      if (replaced !== updatedContent) {
        updatedContent = replaced;
      } else {
        // Broader fallback: any Text just before </TouchableOpacity>
        updatedContent = updatedContent.replace(
          /(<Text[^>]*>)\s*([A-Za-z][A-Za-z0-9 ]{0,20})\s*(<\/Text>\s*<\/TouchableOpacity>)/,
          `$1${value}$3`
        );
      }

    } else if (field === "searchPlaceholder") {
      // Match the search TextInput (className contains flex-1, unlike auth inputs which use bg-gray-50)
      // Try both attribute orderings
      const replaced = updatedContent
        .replace(
          /(placeholder=")([^"]+)("(?:[^>]*className="[^"]*flex-1))/,
          `$1${value}$3`
        )
        .replace(
          /(className="[^"]*flex-1[^"]*"[^>]*placeholder=")([^"]+)(")/,
          `$1${value}$3`
        );
      if (replaced !== updatedContent) {
        updatedContent = replaced;
      } else {
        // Fallback: replace any placeholder that isn't an email/password hint
        updatedContent = updatedContent.replace(
          /placeholder="([^"@•]{3,60})"/,
          `placeholder="${value}"`
        );
      }

    } else {
      return NextResponse.json({ error: `Unknown field: ${field}` }, { status: 400 });
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
