import mongoose, { Schema, model, models } from "mongoose";

export type SkillStatus = "draft" | "published";

export interface ISkill {
  name: string;
  slug: string;
  description: string;
  content: string;
  category?: string;
  tags: string[];
  version: string;
  status: SkillStatus;
  author?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SkillSchema = new Schema<ISkill>(
  {
    name: {
      type: String,
      required: [true, "Skill name is required"],
      trim: true,
      maxlength: [120, "Skill name cannot exceed 120 characters"],
    },
    slug: {
      type: String,
      required: [true, "Skill slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be kebab-case"],
    },
    description: {
      type: String,
      required: [true, "Skill description is required"],
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    content: {
      type: String,
      required: [true, "Skill content is required"],
    },
    category: {
      type: String,
      trim: true,
      default: "",
    },
    tags: {
      type: [String],
      default: [],
    },
    version: {
      type: String,
      default: "1.0.0",
      trim: true,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    author: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Ensure uniqueness on slug at the database level (strong consistency)
SkillSchema.index({ slug: 1 }, { unique: true });
SkillSchema.index({ status: 1, updatedAt: -1 });
SkillSchema.index({ category: 1 });

const Skill = models.Skill || model<ISkill>("Skill", SkillSchema);

export default Skill;
