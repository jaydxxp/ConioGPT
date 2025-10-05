"use client";
import { Card, CardOg } from "@/components/Cards";
import { NavbarDemo } from "@/components/Navbar";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import Link from "next/link";

export default function TypewriterEffectSmoothDemo() {
  const words = [
    { text: "Your" },
    { text: "AI" },
    { text: "Co-Creator" },
    { text: "for" },
    { text:"Social" },
    { text:"Media" },
    { text: "Magic", className: "text-blue-500 dark:text-blue-500" },
    { text:"✨" }
  ];

  return (
    <div>
      <BackgroundBeams/>
      <NavbarDemo/>

      
      <div className="flex flex-col items-center justify-center h-[30rem] space-y-6">
        <TypewriterEffectSmooth words={words} />
        
        <div className="text-stone-400 mx-auto max-w-2xl text-md text-center">
          Your social media assistant creating catchy captions, suggesting trending songs, 
          and helping you build the perfect profile.
        </div>

        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-4">
          <Link href={"/chat"}>
            <HoverBorderGradient
              containerClassName="rounded-full"
              as="button"
              className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2 cursor-pointer"
            >
              <span>Get Started for free</span>
            </HoverBorderGradient>
          </Link>
        </div>
      </div>

      <div className="text-white font-bold text-3xl flex justify-center">Features That Make Your Content Shine</div>
      <div className="mt-16 mb-10 flex justify-center">
        <CardOg />
      </div>
      <div className="flex bg-slate-900 h-20 justify-center">
        <div className="flex items-center">
        <h1 className="text-white font-bold ">ConioGPT </h1>
        </div>
      </div>
    </div>
  );
}

