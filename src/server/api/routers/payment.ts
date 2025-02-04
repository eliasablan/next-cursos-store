import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import Stripe from "stripe";
import { env } from "@/env";

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-01-27.acacia",
});

export const paymentRouter = createTRPCRouter({
  createSubscriptionCheckout: protectedProcedure
    .input(z.object({ courseId: z.string(), priceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price: input.priceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${process.env.NEXTAUTH_URL}/cursos/${input.courseId}?success=true`,
        cancel_url: `${process.env.NEXTAUTH_URL}/cursos/${input.courseId}?canceled=true`,
        metadata: {
          courseId: input.courseId,
          userId: ctx.session.user.id,
        },
      });

      return { sessionId: session.id };
    }),
});
