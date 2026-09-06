import type { Skill, ApiResponse } from "@/lib/types";

const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_TOKEN || "";

function headers(extra?: Record<string, string>): Record<string, string> {
  const h: Record<string, string> = { "content-type": "application/json", ...extra };
  if (ADMIN_TOKEN) h["x-admin-token"] = ADMIN_TOKEN;
  return h;
}

async function request<T>(url: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(url, {
    ...init,
    headers: headers(init?.headers as Record<string, string> | undefined),
  });
  const json = (await res.json().catch(() => ({}))) as ApiResponse<T>;
  if (!res.ok) {
    throw new Error(json.error || `Request failed: ${res.status}`);
  }
  return json;
}

export const api = {
  // Admin endpoints
  listSkills: () => request<Skill[]>("/api/skills", { method: "GET" }),
  getSkill: (id: string) => request<Skill>(`/api/skills/${id}`, { method: "GET" }),
  createSkill: (payload: Partial<Skill>) =>
    request<Skill>("/api/skills", { method: "POST", body: JSON.stringify(payload) }),
  updateSkill: (id: string, payload: Partial<Skill>) =>
    request<Skill>(`/api/skills/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteSkill: (id: string) => request<Skill>(`/api/skills/${id}`, { method: "DELETE" }),
  publishSkill: (id: string, status: "draft" | "published") =>
    request<Skill>(`/api/skills/${id}/publish`, {
      method: "POST",
      body: JSON.stringify({ status }),
    }),

  // Public endpoints
  listPublic: () => request<Skill[]>("/api/public/skills", { method: "GET" }),
  getPublic: (slug: string) => request<Skill>(`/api/public/skills/${slug}`, { method: "GET" }),
};
