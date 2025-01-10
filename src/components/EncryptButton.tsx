"use client";

import { useRef, useState } from "react";
import { Button } from "./ui/button";
import Link from "next/link";

const TARGET_TEXT = "IA Coders";
const CYCLES_PER_LETTER = 2;
const SHUFFLE_TIME = 50;

const CHARS = "!@#$%^&*():{};|,.<>/?";

export default function EncryptButton() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [text, setText] = useState(TARGET_TEXT);

  const scramble = () => {
    let pos = 0;

    intervalRef.current = setInterval(() => {
      const scrambled = TARGET_TEXT.split("")
        .map((char, index) => {
          if (pos / CYCLES_PER_LETTER > index) {
            return char;
          }

          const randomCharIndex = Math.floor(Math.random() * CHARS.length);
          const randomChar = CHARS[randomCharIndex];

          return randomChar;
        })
        .join("");

      setText(scrambled);
      pos++;

      if (pos >= TARGET_TEXT.length * CYCLES_PER_LETTER) {
        stopScramble();
      }
    }, SHUFFLE_TIME);
  };

  const stopScramble = () => {
    clearInterval(intervalRef.current ?? undefined);

    setText(TARGET_TEXT);
  };

  return (
    <Link href="/">
      <Button
        variant="ghost"
        onMouseEnter={scramble}
        onMouseLeave={stopScramble}
        className="group relative overflow-hidden rounded-full border font-mono font-medium uppercase transition-colors"
      >
        <div className="relative z-10 flex items-center gap-2 text-lg">
          <span>{text}</span>
        </div>
      </Button>
    </Link>
  );
}
