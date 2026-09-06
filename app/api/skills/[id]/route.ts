import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Skill from "@/lib/models/Skill";
import { isAuthorized, unauthorizedResponse } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/skills/:id
 * Fetch a single skill by its Mongo _id (admin view, includes drafts).
 */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();
    const { id } = await params;
    const skill = await Skill.findById(id).lean().exec();
    if (!skill) {
      return NextResponse.json({ success: false, error: "Skill not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: skill });
  } catch (error) {
    console.error("GET /api/skills/:id error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/skills/:id
 * Update a skill (admin write).
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  if (!isAuthorized(req)) return unauthorizedResponse();

  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const skill = await Skill.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).exec();

    if (!skill) {
      return NextResponse.json({ success: false, error: "Skill not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: skill });
  } catch (error) {
    console.error("PUT /api/skills/:id error:", error);
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

/**
 * DELETE /api/skills/:id
 * Delete a skill (admin write).
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  if (!isAuthorized(req)) return unauthorizedResponse();

  try {
    await dbConnect();
    const { id } = await params;
    const skill = await Skill.findByIdAndDelete(id).exec();
    if (!skill) {
      return NextResponse.json({ success: false, error: "Skill not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: skill });
  } catch (error) {
    console.error("DELETE /api/skills/:id error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
