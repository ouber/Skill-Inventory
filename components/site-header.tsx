import Link from "next/link";
import { Boxes, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Boxes className="h-4 w-4" />
          </span>
          <span>Skill Inventory</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Button render={<Link href="/" />} variant="ghost" size="sm">
            Skills
          </Button>
          <Button render={<Link href="/admin" />} variant="outline" size="sm">
            <Settings2 className="mr-1.5 h-3.5 w-3.5" />
            Admin
          </Button>
        </nav>
      </div>
    </header>
  );
}
