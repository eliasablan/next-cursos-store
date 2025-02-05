import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import stripe from "@/server/stripe";
import { subscriptions } from "@/server/db/schema";

export const paymentRouter = createTRPCRouter({
  createProduct: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        price: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const product = await stripe.products.create({
        name: input.name,
        description:
          input.description +
          "\n\nBy:" +
          JSON.stringify({
            name: ctx.session.user.name,
            email: ctx.session.user.email,
          }),
        default_price_data: {
          currency: "usd",
          unit_amount: input.price * 100,
        },
      });
      return product;
    }),

  createSubscriptionCheckout: protectedProcedure
    .input(
      z.object({
        courseId: z.string(),
        subscriptionId: z.string().optional(),
        priceId: z.string(),
        slug: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let subscription = input.subscriptionId;
      if (!subscription) {
        const [newSubscription] = await ctx.db
          .insert(subscriptions)
          .values({
            courseId: input.courseId,
            studentId: ctx.session.user.id,
          })
          .returning();
        subscription = newSubscription?.id;
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price: input.priceId,
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.APP_URL}/cursos/${input.slug}?success=true`,
        cancel_url: `${process.env.APP_URL}/cursos/${input.slug}?canceled=true`,
        metadata: {
          courseId: input.courseId,
          subscriptionId: subscription!,
          courseSlug: input.slug,
          userName: ctx.session.user.name!,
          userId: ctx.session.user.id,
        },
      });

      return { sessionId: session.id };
    }),
});
