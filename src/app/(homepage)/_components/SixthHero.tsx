import { Hero } from "./21/TopLight";

function TopLightHero() {
  return (
    <Hero
      title="AI that works for you."
      subtitle="Transform your workflow with intelligent automation. Simple, powerful, reliable."
      actions={[
        {
          label: "Try Demo",
          href: "#",
          variant: "outline",
        },
        {
          label: "Start Free",
          href: "#",
          variant: "default",
        },
      ]}
      titleClassName="text-5xl md:text-6xl font-extrabold"
      subtitleClassName="text-lg md:text-xl max-w-[600px]"
      actionsClassName="mt-8"
    />
  );
}

export { TopLightHero };
