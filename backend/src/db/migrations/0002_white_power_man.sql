ALTER TABLE "games" ADD COLUMN "has_pieces" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "grid_size" integer DEFAULT 0;--> statement-breakpoint
CREATE INDEX "idx_session_user" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_attempts_by_recipient" ON "unlock_attempts" USING btree ("recipient_record_id");