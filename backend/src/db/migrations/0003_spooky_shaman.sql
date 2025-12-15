CREATE TABLE "picture_comments" (
	"comment_id" text PRIMARY KEY NOT NULL,
	"picture_id" text NOT NULL,
	"commenter_id" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "picture_comments" ADD CONSTRAINT "picture_comments_picture_id_pictures_picture_id_fk" FOREIGN KEY ("picture_id") REFERENCES "public"."pictures"("picture_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "picture_comments" ADD CONSTRAINT "picture_comments_commenter_id_user_id_fk" FOREIGN KEY ("commenter_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_comments_by_picture" ON "picture_comments" USING btree ("picture_id");