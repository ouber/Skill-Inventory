import { notFound } from "next/navigation";
import Link from "next/link";
import { SkillForm } from "@/components/skill-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import dbConnect from "@/lib/db";
import Skill from "@/lib/models/Skill";
import type { Skill as SkillType } from "@/lib/types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSkillPage({ params }: PageProps) {
  const { id } = await params;
  await dbConnect();
  const skill = await Skill.findById(id).lean().exec();

  if (!skill) {
    notFound();
  }

  const data = skill as unknown as SkillType;

  return (
    <div>
      <Button render={<Link href="/admin" />} variant="ghost" size="sm" className="mb-4 -ml-2">
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Back to admin
      </Button>
      <div className="rounded-lg border border-border bg-card p-6 md:p-8">
        <h2 className="mb-1 text-xl font-semibold">Edit Skill</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Update the details for <span className="font-medium">{skill.name}</span>.
        </p>
        <SkillForm mode="edit" initial={data} />
      </div>
    </div>
  );
}
