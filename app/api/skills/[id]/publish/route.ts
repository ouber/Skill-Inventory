import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Skill from "@/lib/models/Skill";
import { isAuthorized, unauthorizedResponse } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/skills/:id/publish
 * Toggle a skill's status between draft <-> published (admin write).
 * Body { status: "published" | "draft" } is optional; if omitted, it flips.
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  if (!isAuthorized(req)) return unauthorizedResponse();

  try {
    await dbConnect();
    const { id } = await params;

    const skill = await Skill.findById(id).exec();
    if (!skill) {
      return NextResponse.json({ success: false, error: "Skill not found" }, { status: 404 });
    }

    let body: { status?: string } = {};
    try {
      body = await req.json();
    } catch {
      /* body optional */
    }

    const target =
      body.status === "published" || body.status === "draft"
        ? body.status
        : skill.status === "published"
          ? "draft"
          : "published";

    skill.status = target as "draft" | "published";
    await skill.save();

    return NextResponse.json({ success: true, data: skill });
  } catch (error) {
    console.error("POST /api/skills/:id/publish error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
