"use client";

import React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";

const ResponsiveDialog = ({
  children,
  ...props
}: {
  children: React.ReactNode;
}) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  return isDesktop ? (
    <Dialog {...props}>{children}</Dialog>
  ) : (
    <Drawer {...props}>{children}</Drawer>
  );
};

const ResponsiveDialogTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof DialogTrigger>
>(({ children, ...props }, ref) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const Component = isDesktop ? DialogTrigger : DrawerTrigger;
  return (
    <Component ref={ref} {...props}>
      {children}
    </Component>
  );
});
ResponsiveDialogTrigger.displayName = "ResponsiveDialogTrigger";

const ResponsiveDialogContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof DialogContent> & { className?: string }
>(({ children, className, ...props }, ref) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <DialogContent ref={ref} className={className} {...props}>
        {children}
      </DialogContent>
    );
  }

  return (
    <DrawerContent className={className} {...props}>
      {children}
    </DrawerContent>
  );
});
ResponsiveDialogContent.displayName = "ResponsiveDialogContent";

const ResponsiveDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const Component = isDesktop ? DialogHeader : DrawerHeader;
  return <Component className={className} {...props} />;
};
ResponsiveDialogHeader.displayName = "ResponsiveDialogHeader";

const ResponsiveDialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentPropsWithoutRef<typeof DialogTitle>
>((props, ref) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const Component = isDesktop ? DialogTitle : DrawerTitle;
  return <Component ref={ref} {...props} />;
});
ResponsiveDialogTitle.displayName = "ResponsiveDialogTitle";

const ResponsiveDialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<typeof DialogDescription>
>((props, ref) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const Component = isDesktop ? DialogDescription : DrawerDescription;
  return <Component ref={ref} {...props} />;
});
ResponsiveDialogDescription.displayName = "ResponsiveDialogDescription";

const ResponsiveDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const Component = isDesktop ? DialogFooter : DrawerFooter;
  return <Component className={className} {...props} />;
};
ResponsiveDialogFooter.displayName = "ResponsiveDialogFooter";

const ResponsiveDialogClose = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof DialogClose>
>((props, ref) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const Component = isDesktop ? DialogClose : DrawerClose;
  return <Component ref={ref} {...props} />;
});
ResponsiveDialogClose.displayName = "ResponsiveDialogClose";

export {
  ResponsiveDialog,
  ResponsiveDialogTrigger,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogClose,
};
