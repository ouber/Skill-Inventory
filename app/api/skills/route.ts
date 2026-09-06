import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Skill from "@/lib/models/Skill";
import { isAuthorized, unauthorizedResponse } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/skills
 * Admin list of all skills (including drafts). Supports ?status= & ?category= & ?q=
 */
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const q = searchParams.get("q");

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (q) {
      const regex = new RegExp(q, "i");
      filter.$or = [{ name: regex }, { slug: regex }, { description: regex }, { tags: regex }];
    }

    const skills = await Skill.find(filter).sort({ updatedAt: -1 }).lean().exec();

    return NextResponse.json({
      success: true,
      data: skills,
      count: skills.length,
    });
  } catch (error) {
    console.error("GET /api/skills error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/skills
 * Create a new skill (admin write).
 */
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorizedResponse();

  try {
    await dbConnect();
    const body = await req.json();

    const {
      name,
      slug,
      description,
      content,
      category = "",
      tags = [],
      version = "1.0.0",
      status = "draft",
      author = "",
    } = body || {};

    if (!name || !slug || !description || !content) {
      return NextResponse.json(
        { success: false, error: "name, slug, description and content are required" },
        { status: 400 }
      );
    }

    const skill = await Skill.create({
      name,
      slug,
      description,
      content,
      category,
      tags,
      version,
      status,
      author,
    });

    return NextResponse.json({ success: true, data: skill }, { status: 201 });
  } catch (error) {
    console.error("POST /api/skills error:", error);
    if ((error as { code?: number }).code === 11000) {
      return NextResponse.json(
        { success: false, error: "A skill with this slug already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
