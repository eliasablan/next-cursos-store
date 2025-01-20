import { Hero } from "./21/TopLight";

function TopLightHero() {
  return (
    <Hero
      title="¡Descubre tu potencial!"
      subtitle="Crea, vende y compra cursos en un solo lugar. Conéctate con una comunidad de aprendices y educadores."
      actions={[
        {
          label: "Prueba la Demo",
          href: "/ingresar",
          variant: "outline",
        },
        {
          label: "Comienza gratis",
          href: "/ingresar",
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
