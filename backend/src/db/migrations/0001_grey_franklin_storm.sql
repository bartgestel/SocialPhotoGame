ALTER TABLE "picture_recipients" DROP CONSTRAINT "unique_picture_receiver";--> statement-breakpoint
DROP INDEX "idx_inbox_feed";--> statement-breakpoint
ALTER TABLE "picture_recipients" ALTER COLUMN "receiver_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "picture_recipients" ADD COLUMN "recipient_identifier" text;--> statement-breakpoint
ALTER TABLE "pictures" ADD COLUMN "share_token" text NOT NULL;--> statement-breakpoint
ALTER TABLE "pictures" ADD COLUMN "max_unlocks" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "pictures" ADD COLUMN "current_unlocks" integer DEFAULT 0;--> statement-breakpoint
CREATE INDEX "idx_recipients_by_picture" ON "picture_recipients" USING btree ("picture_id");--> statement-breakpoint
CREATE INDEX "idx_pictures_share_token" ON "pictures" USING btree ("share_token");--> statement-breakpoint
CREATE INDEX "idx_inbox_feed" ON "picture_recipients" USING btree ("receiver_id","status") WHERE receiver_id IS NOT NULL AND status IN ('LOCKED', 'UNLOCKED');--> statement-breakpoint
ALTER TABLE "pictures" ADD CONSTRAINT "pictures_share_token_unique" UNIQUE("share_token");