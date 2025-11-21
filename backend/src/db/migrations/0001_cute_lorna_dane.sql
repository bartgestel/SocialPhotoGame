CREATE TYPE "public"."friendship_status" AS ENUM('PENDING', 'ACCEPTED', 'BLOCKED');--> statement-breakpoint
CREATE TYPE "public"."picture_status" AS ENUM('LOCKED', 'UNLOCKED', 'VIEWED', 'EXPIRED');--> statement-breakpoint
CREATE TABLE "friendships" (
	"friendship_id" text PRIMARY KEY NOT NULL,
	"requester_id" text NOT NULL,
	"addressee_id" text NOT NULL,
	"status" "friendship_status" DEFAULT 'PENDING',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "unique_friendship" UNIQUE("requester_id","addressee_id")
);
--> statement-breakpoint
CREATE TABLE "games" (
	"game_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "games_game_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"description" text,
	"difficulty_level" integer DEFAULT 1,
	"asset_bundle_url" text,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "picture_recipients" (
	"recipient_record_id" text PRIMARY KEY NOT NULL,
	"picture_id" text NOT NULL,
	"receiver_id" text NOT NULL,
	"status" "picture_status" DEFAULT 'LOCKED',
	"received_at" timestamp with time zone DEFAULT now(),
	"opened_at" timestamp with time zone,
	CONSTRAINT "unique_picture_receiver" UNIQUE("picture_id","receiver_id")
);
--> statement-breakpoint
CREATE TABLE "pictures" (
	"picture_id" text PRIMARY KEY NOT NULL,
	"sender_id" text NOT NULL,
	"media_url" text NOT NULL,
	"media_type" text DEFAULT 'IMAGE',
	"view_duration" integer DEFAULT 10,
	"required_game_id" integer,
	"game_config" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"expires_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "unlock_attempts" (
	"attempt_id" text PRIMARY KEY NOT NULL,
	"recipient_record_id" text NOT NULL,
	"score_achieved" integer DEFAULT 0,
	"is_successful" boolean DEFAULT false,
	"started_at" timestamp with time zone DEFAULT now(),
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "username" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "current_streak" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "last_active_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_requester_id_user_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_addressee_id_user_id_fk" FOREIGN KEY ("addressee_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "picture_recipients" ADD CONSTRAINT "picture_recipients_picture_id_pictures_picture_id_fk" FOREIGN KEY ("picture_id") REFERENCES "public"."pictures"("picture_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "picture_recipients" ADD CONSTRAINT "picture_recipients_receiver_id_user_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pictures" ADD CONSTRAINT "pictures_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pictures" ADD CONSTRAINT "pictures_required_game_id_games_game_id_fk" FOREIGN KEY ("required_game_id") REFERENCES "public"."games"("game_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unlock_attempts" ADD CONSTRAINT "unlock_attempts_recipient_record_id_picture_recipients_recipient_record_id_fk" FOREIGN KEY ("recipient_record_id") REFERENCES "public"."picture_recipients"("recipient_record_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_friendships_lookup" ON "friendships" USING btree ("requester_id","addressee_id");--> statement-breakpoint
CREATE INDEX "idx_active_friends_req" ON "friendships" USING btree ("requester_id") WHERE status = 'ACCEPTED';--> statement-breakpoint
CREATE INDEX "idx_active_friends_addr" ON "friendships" USING btree ("addressee_id") WHERE status = 'ACCEPTED';--> statement-breakpoint
CREATE INDEX "idx_inbox_feed" ON "picture_recipients" USING btree ("receiver_id","status") WHERE status IN ('LOCKED', 'UNLOCKED');--> statement-breakpoint
CREATE INDEX "idx_pictures_cleanup" ON "pictures" USING btree ("expires_at");--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_username_unique" UNIQUE("username");