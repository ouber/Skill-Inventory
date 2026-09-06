import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Skill from "@/lib/models/Skill";

export const dynamic = "force-dynamic";

/**
 * GET /api/public/skills
 * Public list of PUBLISHED skills — consumed by internal plugins/clients.
 * Supports ?category= & ?q= filtering.
 *
 * Note: this endpoint intentionally omits draft skills and strips fields that
 * are not useful to consumers.
 */
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const q = searchParams.get("q");

    const filter: Record<string, unknown> = { status: "published" };
    if (category) filter.category = category;
    if (q) {
      const regex = new RegExp(q, "i");
      filter.$or = [{ name: regex }, { slug: regex }, { description: regex }, { tags: regex }];
    }

    const skills = await Skill.find(filter)
      .select("name slug description category tags version author updatedAt")
      .sort({ updatedAt: -1 })
      .lean()
      .exec();

    return NextResponse.json({
      success: true,
      data: skills,
      count: skills.length,
    });
  } catch (error) {
    console.error("GET /api/public/skills error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
