"use client";
import {  CardOg } from "@/components/Cards";
import { NavbarDemo } from "@/components/Navbar";
import TypewriterEffectSmoothDemo from "@/components/TypeWriter";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const token = localStorage.getItem("token");

    if (!token) {
      e.preventDefault(); 
      router.push(`/auth/signin`); 
      return;
    }
   
  };
  return (
    <div>
    <BackgroundBeams/>
      <NavbarDemo/>
      <div className="flex flex-col items-center justify-center h-[30rem] space-y-6">
        <TypewriterEffectSmoothDemo/>
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-4">
          <Link href={"/chat"}>
            <HoverBorderGradient
              containerClassName="rounded-full"
              as="button" onClick={handleClick}
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
      <div className="flex bg-zinc-900 h-20 justify-center">
        <div className="flex items-center">
        <h1 className="text-stone-400 font-bold ">@ConioGPT </h1>
        </div>
      </div>

    </div>
  );
}

