"use client"
import { TypewriterEffectSmooth } from "./ui/typewriter-effect";

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
 <TypewriterEffectSmooth words={words} />
        
        <div className="text-stone-400 mx-auto max-w-2xl text-md text-center">
          Your social media assistant creating catchy captions, suggesting trending songs, 
          and helping you build the perfect profile.
        </div>
        </div>
        )
    }