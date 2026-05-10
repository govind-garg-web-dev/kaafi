import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/projects/:id/visual-edit — no AI, no credits
// Body: { field, value, oldValue? }
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

    const { field, value, oldValue } = await req.json();
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
      // Replace primary color hex in tailwind.config.js
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

    } else if (field === "searchPlaceholder" && oldValue) {
      // placeholder="..." — replace the exact old placeholder value
      updatedContent = updatedContent.replace(
        `placeholder="${oldValue}"`,
        `placeholder="${value}"`
      );
      // Also try single-quoted variant
      if (updatedContent === fileRow.content) {
        updatedContent = updatedContent.replace(
          `placeholder='${oldValue}'`,
          `placeholder='${value}'`
        );
      }

    } else if (oldValue) {
      // headerTitle / ctaLabel — the parser extracts these from between JSX tags,
      // so >${oldValue}< is guaranteed to be in the file
      const between = `>${oldValue}<`;
      const betweenNew = `>${value}<`;
      if (updatedContent.includes(between)) {
        // Replace only the first occurrence to avoid clobbering duplicates
        updatedContent = updatedContent.replace(between, betweenNew);
      } else {
        // Fallback: plain replaceAll (works if parser extracted exact text)
        updatedContent = updatedContent.replace(oldValue, value);
      }

    } else {
      return NextResponse.json({ error: "oldValue required for this field." }, { status: 400 });
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
