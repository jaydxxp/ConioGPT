"use client";

import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import Link from "next/link";

export default function TypewriterEffectSmoothDemo() {
  const words = [
    {
      text: "Your",
    },
    {
      text: "AI",
    },
    {
      text: "Co-Creator",
    },
    {
      text: "for",
    },
    {
      text:"Social"
    },
    {
      text:"Media"
    },
    {
      text: "Magic",
      className: "text-blue-500 dark:text-blue-500",
    },
    {
      text:"✨"
    }
  ];
  return (
    <div className="flex flex-col items-center justify-center h-[40rem]">
      <TypewriterEffectSmooth words={words} />
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-4">
        <Link href={"/chat"}>
        <button className="w-40 h-10 rounded-xl bg-black border dark:border-white border-transparent text-white text-sm cursor-pointer">
          Let's Start
        </button>
        </Link>
      
      </div>
    </div>
  );
}
