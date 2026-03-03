CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(25) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
