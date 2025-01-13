import { Gravity, MatterBody } from "./21/Gravity";

function GravityHero() {
  return (
    <div className="font-azeretMono relative flex h-full min-h-[500px] w-full flex-col">
      <div className="font-calendas w-full pt-20 text-center text-6xl italic sm:text-7xl md:text-8xl">
        fancy
      </div>
      <p className="w-full pt-4 text-center text-base sm:text-xl md:text-2xl">
        components made with:
      </p>
      <Gravity gravity={{ x: 0, y: 1 }} className="h-full w-full">
        <MatterBody
          matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
          x="30%"
          y="10%"
        >
          <div className="rounded-full bg-[#0015ff] px-8 py-4 text-xl text-white hover:cursor-pointer sm:text-2xl md:text-3xl">
            react
          </div>
        </MatterBody>
        <MatterBody
          matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
          x="30%"
          y="30%"
        >
          <div className="rounded-full bg-[#E794DA] px-8 py-4 text-xl text-white hover:cursor-grab sm:text-2xl md:text-3xl">
            typescript
          </div>
        </MatterBody>
        <MatterBody
          matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
          x="40%"
          y="20%"
          angle={10}
        >
          <div className="rounded-full bg-[#1f464d] px-8 py-4 text-xl text-white hover:cursor-grab sm:text-2xl md:text-3xl">
            motion
          </div>
        </MatterBody>
        <MatterBody
          matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
          x="75%"
          y="10%"
        >
          <div className="[#E794DA] rounded-full bg-[#ff5941] px-8 py-4 text-xl text-white hover:cursor-grab sm:text-2xl md:text-3xl">
            tailwind
          </div>
        </MatterBody>
        <MatterBody
          matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
          x="80%"
          y="20%"
        >
          <div className="[#E794DA] rounded-full bg-orange-500 px-8 py-4 text-xl text-white hover:cursor-grab sm:text-2xl md:text-3xl">
            drei
          </div>
        </MatterBody>
        <MatterBody
          matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
          x="50%"
          y="10%"
        >
          <div className="[#E794DA] rounded-full bg-[#ffd726] px-8 py-4 text-xl text-white hover:cursor-grab sm:text-2xl md:text-3xl">
            matter-js
          </div>
        </MatterBody>
      </Gravity>
    </div>
  );
}

export { GravityHero };
