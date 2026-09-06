"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api-client";
import { slugify } from "@/lib/format";
import type { Skill } from "@/lib/types";

interface SkillFormProps {
  initial?: Skill;
  mode: "create" | "edit";
}

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  content: "",
  category: "",
  tags: "",
  version: "1.0.0",
  status: "draft" as "draft" | "published",
  author: "",
};

export function SkillForm({ initial, mode }: SkillFormProps) {
  const router = useRouter();
  const [form, setForm] = useState(() =>
    initial
      ? {
          name: initial.name,
          slug: initial.slug,
          description: initial.description,
          content: initial.content,
          category: initial.category || "",
          tags: (initial.tags || []).join(", "),
          version: initial.version,
          status: initial.status,
          author: initial.author || "",
        }
      : emptyForm
  );
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.slug || !form.description || !form.content) {
      toast.error("Please fill in name, slug, description and content");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      if (mode === "create") {
        await api.createSkill(payload);
        toast.success("Skill created");
        router.push("/admin");
      } else if (initial) {
        await api.updateSkill(initial._id, payload);
        toast.success("Skill updated");
        router.push("/admin");
      }
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message || "Failed to save skill");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => {
              const name = e.target.value;
              update("name", name);
              // auto-fill slug only when empty or when it previously matched the slugified name
              if (!form.slug || form.slug === slugify(form.name)) {
                update("slug", slugify(name));
              }
            }}
            placeholder="e.g. Customer Lookup"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug *</Label>
          <Input
            id="slug"
            value={form.slug}
            onChange={(e) => update("slug", slugify(e.target.value))}
            placeholder="customer-lookup"
          />
          <p className="text-xs text-muted-foreground">URL-friendly identifier (kebab-case)</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="A short summary of what this skill does"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content (Markdown) *</Label>
        <Textarea
          id="content"
          value={form.content}
          onChange={(e) => update("content", e.target.value)}
          placeholder={"# Skill\n\nDescribe the skill's instructions here..."}
          rows={16}
          className="font-mono text-sm"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            placeholder="e.g. CRM, DevOps, Finance"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <Input
            id="tags"
            value={form.tags}
            onChange={(e) => update("tags", e.target.value)}
            placeholder="comma, separated, tags"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="version">Version</Label>
          <Input
            id="version"
            value={form.version}
            onChange={(e) => update("version", e.target.value)}
            placeholder="1.0.0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="author">Author</Label>
          <Input
            id="author"
            value={form.author}
            onChange={(e) => update("author", e.target.value)}
            placeholder="team or person"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={form.status}
            onValueChange={(v) => update("status", v as "draft" | "published")}
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : mode === "create" ? "Create Skill" : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin")}
          disabled={submitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
