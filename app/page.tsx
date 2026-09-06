import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SkillCard } from "@/components/skill-card";
import { Button } from "@/components/ui/button";
import { Boxes, Terminal } from "lucide-react";
import dbConnect from "@/lib/db";
import Skill from "@/lib/models/Skill";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await dbConnect();
  const skills = await Skill.find({ status: "published" })
    .sort({ updatedAt: -1 })
    .lean()
    .exec();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <section className="mb-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Terminal className="h-4 w-4" />
            <span>Internal Skill Server</span>
          </div>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">Skill Inventory</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            A central registry of reusable Skills for internal plugins and clients. Browse
            published skills below, or manage them from the{" "}
            <Link href="/admin" className="underline underline-offset-4">
              admin panel
            </Link>
            .
          </p>
          <div className="mt-4">
            <Button render={<Link href="/admin" />} variant="outline" size="sm">
              <Boxes className="mr-1.5 h-4 w-4" />
              Open Admin
            </Button>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Published Skills</h2>
            <span className="text-sm text-muted-foreground">{skills.length} total</span>
          </div>

          {skills.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-10 text-center">
              <p className="text-muted-foreground">
                No published skills yet. Create one from the admin panel.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {skills.map((skill) => (
                <SkillCard key={skill._id.toString()} skill={skill as unknown as import("@/lib/types").Skill} />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        Skill Inventory · Internal platform
      </footer>
    </div>
  );
}
