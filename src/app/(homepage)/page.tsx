import Header from "@/app/(homepage)/_components/Header";
import { HeroIcons } from "./_components/FirstHero";
import { HeroScroll } from "./_components/SecondHero";

export default async function Home() {
  return (
    <>
      <Header />
      <main className="m-2 mt-16 border">
        <HeroIcons />
        <HeroScroll />
      </main>
    </>
  );
}
