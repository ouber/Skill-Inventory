import Link from "next/link";
import { SkillForm } from "@/components/skill-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NewSkillPage() {
  return (
    <div>
      <Button render={<Link href="/admin" />} variant="ghost" size="sm" className="mb-4 -ml-2">
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Back to admin
      </Button>
      <div className="rounded-lg border border-border bg-card p-6 md:p-8">
        <h2 className="mb-1 text-xl font-semibold">Create a new Skill</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Fill in the details below. Markdown is supported in the content field.
        </p>
        <SkillForm mode="create" />
      </div>
    </div>
  );
}
