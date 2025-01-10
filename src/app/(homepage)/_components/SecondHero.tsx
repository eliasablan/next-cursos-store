"use client";

import React from "react";
import Image from "next/image";
import { ContainerScroll } from "./21/ContainerScrollAnimation";

export function HeroScroll() {
  return (
    <div className="flex flex-col overflow-hidden">
      <ContainerScroll
        titleComponent={
          <>
            <h1 className="text-4xl font-semibold text-black dark:text-white">
              Alcanza tu potencial <br />
              <span className="mt-1 text-4xl font-bold leading-none md:text-[6rem]">
                Sigue tus cursos en IACoders
              </span>
            </h1>
          </>
        }
      >
        <Image
          src="/IACoders.jpeg"
          alt="hero"
          height={520}
          width={1400}
          className="mx-auto h-full rounded-2xl"
          draggable={false}
        />
      </ContainerScroll>
    </div>
  );
}
