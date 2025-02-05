ALTER TABLE "course" RENAME COLUMN "price" TO "stripe_price";--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "stripe_product_id" varchar;