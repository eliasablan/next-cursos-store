import { HeroScroll } from "./_components/SecondHero";
import { MarqueeEffectDouble } from "./_components/FifthHero";
import { TopLightHero } from "./_components/SixthHero";

export default async function Home() {
  return (
    <div className="mt-14">
      <TopLightHero />
      <HeroScroll />
      <MarqueeEffectDouble />
    </div>
  );
}
