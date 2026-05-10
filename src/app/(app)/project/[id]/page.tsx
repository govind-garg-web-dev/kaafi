import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProjectEditor from "@/components/app/ProjectEditor";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!project) notFound();

  const { data: files } = await supabase
    .from("project_files")
    .select("*")
    .eq("project_id", id);

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  return (
    <ProjectEditor
      project={project}
      files={files ?? []}
      userPlan={profile?.plan ?? "hobby"}
    />
  );
}
