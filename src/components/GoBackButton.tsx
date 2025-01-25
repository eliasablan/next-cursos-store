"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ButtonProps, Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BackButtonProps = ButtonProps & {
  size?: "default" | "sm" | "lg" | "icon";
  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "ghost"
    | "link"
    | "destructive";
};

export default function GoBackButton({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: BackButtonProps) {
  const router = useRouter();
  return (
    <Button
      {...props}
      size={size}
      variant={variant}
      className={cn("h-7 w-7", className)}
      onClick={() => router.back()}
    >
      <ChevronLeft className="h-4 w-4" />
      <span className="sr-only">Regresar</span>
    </Button>
  );
}
