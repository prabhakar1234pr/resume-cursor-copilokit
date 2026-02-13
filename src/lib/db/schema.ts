import { pgTable, uuid, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export const resumes = pgTable("resumes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  personalInfo: jsonb("personal_info")
    .$type<{
      name: string;
      email: string;
      phone: string;
      location: string;
    }>()
    .notNull(),
  summary: text("summary").notNull(),
  experience: text("experience").notNull(),
  education: text("education").notNull(),
  skills: text("skills").notNull(),
  projects: text("projects"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tailoredResumes = pgTable("tailored_resumes", {
  id: uuid("id").defaultRandom().primaryKey(),
  resumeId: uuid("resume_id")
    .references(() => resumes.id, { onDelete: "cascade" })
    .notNull(),
  userId: text("user_id").notNull(),
  jobDescription: text("job_description").notNull(),
  tailoredContent: text("tailored_content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Resume = typeof resumes.$inferSelect;
export type NewResume = typeof resumes.$inferInsert;
export type TailoredResume = typeof tailoredResumes.$inferSelect;
export type NewTailoredResume = typeof tailoredResumes.$inferInsert;
