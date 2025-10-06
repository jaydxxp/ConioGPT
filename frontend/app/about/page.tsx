"use client";
import { NavbarDemo } from "@/components/Navbar";
import ScrollStack, { ScrollStackItem } from "@/components/ScrollStack";
import { BackgroundBeams } from "@/components/ui/background-beams";
import Image from "next/image";

export default function About() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="fixed inset-0 z-0">
        <BackgroundBeams />
      </div>

      <div className="relative z-10">
        <NavbarDemo />
        
        <ScrollStack className="h-screen">
          <ScrollStackItem itemClassName="bg-gray-950 flex flex-row gap-4">
           <Image src="/1.png" alt="the image" height={20} width={500}/>
            <p className="text-justify p-4">
              We believe social media should be fun, creative, and effortless.
              That’s why we built an assistant that helps you focus on expressing
              yourself, while it takes care of the hard part. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages.
            </p>
          </ScrollStackItem>

          <ScrollStackItem itemClassName="bg-white flex flex-row gap-4">
            <Image src={"/2.png"} alt="Second image" height={20} width={500}/>
            <p>
              Words matter. With a touch of AI, you can instantly craft captions
              that are witty, engaging, and perfectly tailored to your post.
            </p>
          </ScrollStackItem>

          <ScrollStackItem itemClassName="bg-white flex flex-row gap-4">
            <Image src={"/3.png"} alt="Second image" height={20} width={500}/>
            <p>
              The right sound makes your content shine. We suggest trending songs
              and audio that match your vibe.
            </p>
          </ScrollStackItem>

          <ScrollStackItem itemClassName="bg-white flex flex-row gap-4">
            <Image src={"/4.png"} alt="Second image" height={20} width={500}/>
            <p>
              Your profile is your digital first impression. We help you design
              bios and ideas that capture attention and reflect your personality.
            </p>
          </ScrollStackItem>
        </ScrollStack>
      </div>
    </div>
  );
}
