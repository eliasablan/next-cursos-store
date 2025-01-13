"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Hero = React.forwardRef<HTMLElement, HeroProps>(
  (
    {
      className,
      gradient = true,
      blur = true,
      title,
      subtitle,
      actions,
      titleClassName,
      subtitleClassName,
      actionsClassName,
      ...props
    },
    ref,
  ) => {
    return (
      <section
        ref={ref}
        className={cn(
          "bg-background relative z-0 flex min-h-[80vh] w-full flex-col items-center justify-center overflow-hidden rounded-md",
          className,
        )}
        {...props}
      >
        {gradient && (
          <div className="absolute top-0 isolate z-0 flex w-screen flex-1 items-start justify-center">
            {blur && (
              <div className="absolute top-0 z-50 h-48 w-screen bg-transparent opacity-10 backdrop-blur-md" />
            )}

            {/* Main glow */}
            <div className="bg-primary/60 absolute inset-auto z-50 h-36 w-[28rem] -translate-y-[-30%] rounded-full opacity-80 blur-3xl" />

            {/* Lamp effect */}
            <motion.div
              initial={{ width: "8rem" }}
              viewport={{ once: true }}
              transition={{ ease: "easeInOut", delay: 0.3, duration: 0.8 }}
              whileInView={{ width: "16rem" }}
              className="bg-primary/60 absolute top-0 z-30 h-36 -translate-y-[20%] rounded-full blur-2xl"
            />

            {/* Top line */}
            <motion.div
              initial={{ width: "15rem" }}
              viewport={{ once: true }}
              transition={{ ease: "easeInOut", delay: 0.3, duration: 0.8 }}
              whileInView={{ width: "30rem" }}
              className="bg-primary/60 absolute inset-auto z-50 h-0.5 -translate-y-[-10%]"
            />

            {/* Left gradient cone */}
            <motion.div
              initial={{ opacity: 0.5, width: "15rem" }}
              whileInView={{ opacity: 1, width: "30rem" }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                ease: "easeInOut",
              }}
              style={{
                backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
              }}
              className="bg-gradient-conic from-primary/60 absolute inset-auto right-1/2 h-56 w-[30rem] overflow-visible via-transparent to-transparent [--conic-position:from_70deg_at_center_top]"
            >
              <div className="bg-background absolute bottom-0 left-0 z-20 h-40 w-[100%] [mask-image:linear-gradient(to_top,white,transparent)]" />
              <div className="bg-background absolute bottom-0 left-0 z-20 h-[100%] w-40 [mask-image:linear-gradient(to_right,white,transparent)]" />
            </motion.div>

            {/* Right gradient cone */}
            <motion.div
              initial={{ opacity: 0.5, width: "15rem" }}
              whileInView={{ opacity: 1, width: "30rem" }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                ease: "easeInOut",
              }}
              style={{
                backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
              }}
              className="bg-gradient-conic to-primary/60 absolute inset-auto left-1/2 h-56 w-[30rem] from-transparent via-transparent [--conic-position:from_290deg_at_center_top]"
            >
              <div className="bg-background absolute bottom-0 right-0 z-20 h-[100%] w-40 [mask-image:linear-gradient(to_left,white,transparent)]" />
              <div className="bg-background absolute bottom-0 right-0 z-20 h-40 w-[100%] [mask-image:linear-gradient(to_top,white,transparent)]" />
            </motion.div>
          </div>
        )}

        <motion.div
          initial={{ y: 100, opacity: 0.5 }}
          viewport={{ once: true }}
          transition={{ ease: "easeInOut", delay: 0.3, duration: 0.8 }}
          whileInView={{ y: 0, opacity: 1 }}
          className="container relative z-50 flex flex-1 -translate-y-20 flex-col justify-center gap-4 px-5 md:px-10"
        >
          <div className="flex flex-col items-center space-y-4 text-center">
            <h1
              className={cn(
                "text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl",
                titleClassName,
              )}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                className={cn(
                  "text-muted-foreground text-xl",
                  subtitleClassName,
                )}
              >
                {subtitle}
              </p>
            )}
            {actions && actions.length > 0 && (
              <div className={cn("flex gap-4", actionsClassName)}>
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant || "default"}
                    asChild
                  >
                    <Link href={action.href}>{action.label}</Link>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </section>
    );
  },
);
Hero.displayName = "Hero";

export { Hero };
