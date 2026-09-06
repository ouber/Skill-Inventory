import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import dbConnect from "@/lib/db";
import Skill from "@/lib/models/Skill";
import { formatDate } from "@/lib/format";
import { MarkdownView } from "@/components/markdown-view";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function SkillDetailPage({ params }: PageProps) {
  const { slug } = await params;
  await dbConnect();
  const skill = await Skill.findOne({ slug, status: "published" }).lean().exec();

  if (!skill) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
        <Button render={<Link href="/" />} variant="ghost" size="sm" className="mb-6 -ml-2">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to skills
        </Button>

        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{skill.name}</h1>
            <Badge variant="secondary">v{skill.version}</Badge>
            {skill.category && <Badge variant="outline">{skill.category}</Badge>}
          </div>
          <p className="mt-3 text-muted-foreground">{skill.description}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>Slug: <code className="rounded bg-muted px-1.5 py-0.5">{skill.slug}</code></span>
            {skill.author && <span>Author: {skill.author}</span>}
            <span>Updated {formatDate(skill.updatedAt)}</span>
          </div>
          {skill.tags?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {skill.tags.map((t: string) => (
                <span
                  key={t}
                  className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </header>

        <article className="rounded-lg border border-border bg-card p-6 md:p-8">
          <MarkdownView content={skill.content} />
        </article>

        <div className="mt-8 rounded-lg border border-dashed border-border p-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Client endpoint (published skill)
          </p>
          <code className="block break-all text-sm">
            GET /api/public/skills/{skill.slug}
          </code>
        </div>
      </main>

      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        Skill Inventory · Internal platform
      </footer>
    </div>
  );
}
