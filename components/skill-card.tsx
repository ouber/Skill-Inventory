import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import type { Skill } from "@/lib/types";

export function SkillCard({ skill }: { skill: Skill }) {
  return (
    <Link href={`/skills/${skill.slug}`} className="block h-full">
      <Card className="h-full transition-all hover:shadow-md hover:border-primary/40">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base leading-tight">{skill.name}</CardTitle>
            <Badge variant="secondary" className="shrink-0">
              v{skill.version}
            </Badge>
          </div>
          {skill.category ? (
            <Badge variant="outline" className="w-fit">
              {skill.category}
            </Badge>
          ) : null}
        </CardHeader>
        <CardContent className="pt-0">
          <p className="line-clamp-2 text-sm text-muted-foreground">{skill.description}</p>
          {skill.tags?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {skill.tags.slice(0, 4).map((t) => (
                <span
                  key={t}
                  className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            Updated {formatDate(skill.updatedAt)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
