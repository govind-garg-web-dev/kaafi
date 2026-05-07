import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import JSZip from "jszip";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check plan — export only for Builder+
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();

    if (!profile || profile.plan === "hobby") {
      return NextResponse.json({ error: "Upgrade to Builder to export source code." }, { status: 403 });
    }

    const { projectId } = await req.json();

    const { data: project } = await supabase
      .from("projects")
      .select("name")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });

    const { data: files } = await supabase
      .from("project_files")
      .select("path, content")
      .eq("project_id", projectId);

    const zip = new JSZip();
    const folder = zip.folder(project.name.replace(/\s+/g, "-").toLowerCase()) ?? zip;

    for (const file of files ?? []) {
      folder.file(file.path, file.content);
    }

    // Add setup README
    folder.file("KAAFI_README.md", `# ${project.name}\n\nBuilt with [Kaafi](https://kaafi.app)\n\n## Setup\n\n\`\`\`bash\nnpm install\nnpx expo start\n\`\`\`\n`);

    const buffer = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${project.name.replace(/\s+/g, "-").toLowerCase()}.zip"`,
      },
    });
  } catch (err) {
    console.error("[/api/export]", err);
    return NextResponse.json({ error: "Export failed." }, { status: 500 });
  }
}
