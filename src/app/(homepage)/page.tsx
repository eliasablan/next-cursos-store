import Header from "@/components/Header";
// import { HeroIcons } from "./_components/FirstHero";
import { HeroScroll } from "./_components/SecondHero";
// import { HeroWorldMap } from "./_components/ThirdHero";
import Footer from "./_components/Footer";
// import { GravityHero } from "./_components/FourthHero";
import { MarqueeEffectDouble } from "./_components/FifthHero";
import { TopLightHero } from "./_components/SixthHero";

export default async function Home() {
  return (
    <>
      <Header />
      <main className="mt-14">
        <TopLightHero />
        {/* <HeroIcons /> */}
        <HeroScroll />
        {/* <HeroWorldMap /> */}
        {/* <GravityHero /> */}
        <MarqueeEffectDouble />
        <Footer />
      </main>
    </>
  );
}
