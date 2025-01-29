CREATE TABLE IF NOT EXISTS "lesson_assistances" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"lessonId" varchar(255) NOT NULL,
	"assisted" boolean,
	"studentId" varchar(255) NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lesson_assistances" ADD CONSTRAINT "lesson_assistances_lessonId_lesson_id_fk" FOREIGN KEY ("lessonId") REFERENCES "public"."lesson"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lesson_assistances" ADD CONSTRAINT "lesson_assistances_studentId_user_id_fk" FOREIGN KEY ("studentId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
