import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Skill from "@/lib/models/Skill";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * GET /api/public/skills/:slug
 * Public fetch of a single PUBLISHED skill's full content (for plugin/client consumption).
 * Returns 404 if the skill does not exist or is not published.
 */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();
    const { slug } = await params;

    const skill = await Skill.findOne({ slug, status: "published" })
      .select("name slug description content category tags version author updatedAt")
      .lean()
      .exec();

    if (!skill) {
      return NextResponse.json(
        { success: false, error: "Published skill not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: skill });
  } catch (error) {
    console.error("GET /api/public/skills/:slug error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
