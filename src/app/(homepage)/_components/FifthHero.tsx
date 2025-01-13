import { MarqueeAnimation } from "./21/MarqueeEffect";

function MarqueeEffectDouble() {
  return (
    <div className="flex flex-col gap-4">
      <MarqueeAnimation
        direction="left"
        baseVelocity={-3}
        className="bg-green-500 py-2 text-white"
      >
        Bundui Components
      </MarqueeAnimation>
      <MarqueeAnimation
        direction="right"
        baseVelocity={-3}
        className="bg-purple-500 py-2 text-white"
      >
        Bundui Components
      </MarqueeAnimation>
    </div>
  );
}

export { MarqueeEffectDouble };
