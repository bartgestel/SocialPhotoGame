CREATE TYPE "public"."difficulty_level" AS ENUM('EASY', 'MEDIUM', 'HARD', 'EXPERT');--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "difficulty_level" SET DEFAULT 'EASY'::"public"."difficulty_level";--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "difficulty_level" SET DATA TYPE "public"."difficulty_level" USING "difficulty_level"::"public"."difficulty_level";