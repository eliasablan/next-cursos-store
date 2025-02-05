"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { LockKeyhole } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "sonner";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

export default function SubscriptionPaymentButton({
  courseId,
  stripePriceId,
  courseSlug,
  subscriptionId,
}: {
  courseId: string;
  stripePriceId: string;
  courseSlug: string;
  subscriptionId?: string;
}) {
  const { mutateAsync: createCheckout } =
    api.payment.createSubscriptionCheckout.useMutation();

  const handleSubscribe = async () => {
    try {
      const { sessionId } = await createCheckout({
        subscriptionId,
        courseId,
        slug: courseSlug,
        priceId: stripePriceId, // Reemplazar con ID real de precio de Stripe
      });

      const stripe = await stripePromise;
      await stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error({ error });
      toast.error(`Error al procesar el pago: ${JSON.stringify(error)}`);
    }
  };

  return (
    <div className="flex items-center justify-center p-2">
      <Button
        size="icon"
        variant="link"
        className="hover:text-accent"
        onClick={handleSubscribe}
      >
        <LockKeyhole className="h-8 w-8" />
      </Button>
    </div>
  );
}
