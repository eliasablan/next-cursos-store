import Header from "@/app/(homepage)/_components/Header";
import { HeroIcons } from "./_components/FirstHero";
import { HeroScroll } from "./_components/SecondHero";
import { HeroWorldMap } from "./_components/ThirdHero";
import Footer from "./_components/Footer";

export default async function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroIcons />
        <HeroScroll />
        <HeroWorldMap />
        <Footer />
      </main>
    </>
  );
}
