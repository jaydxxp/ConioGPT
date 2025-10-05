"use client";
import { NavbarDemo } from "@/components/Navbar";
import ScrollStack, { ScrollStackItem } from "@/components/ScrollStack";
import { BackgroundBeams } from "@/components/ui/background-beams";

export default function About() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="fixed inset-0 z-0">
        <BackgroundBeams />
      </div>

      <div className="relative z-10">
        <NavbarDemo />
        
        <ScrollStack className="h-screen">
          <ScrollStackItem itemClassName="bg-stone-500">
            <h2>Our Vision</h2>
            <p>
              We believe social media should be fun, creative, and effortless.
              That’s why we built an assistant that helps you focus on expressing
              yourself, while it takes care of the hard part.
            </p>
          </ScrollStackItem>

          <ScrollStackItem itemClassName="bg-white">
            <h2>Captions & Creativity</h2>
            <p>
              Words matter. With a touch of AI, you can instantly craft captions
              that are witty, engaging, and perfectly tailored to your post.
            </p>
          </ScrollStackItem>

          <ScrollStackItem itemClassName="bg-white">
            <h2>Music & Trends</h2>
            <p>
              The right sound makes your content shine. We suggest trending songs
              and audio that match your vibe.
            </p>
          </ScrollStackItem>

          <ScrollStackItem itemClassName="bg-white">
            <h2>Profiles That Stand Out</h2>
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
