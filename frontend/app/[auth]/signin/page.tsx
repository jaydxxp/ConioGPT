"use client"

import { NavbarDemo } from "@/components/Navbar"
import { SigninFormDemo } from "@/components/Signin"
import { SignupFormDemo } from "@/components/Signup"
import { BackgroundBeams } from "@/components/ui/background-beams"

export default function Signup() {
  return (
    <div className="relative min-h-screen">
      
      <div className="absolute inset-0 z-0">
        <BackgroundBeams />
      </div>
      <div className="relative z-10">
        <NavbarDemo />
        <div className="flex justify-center items-center min-h-[80vh]">
          <SigninFormDemo />
        </div>
      </div>
    </div>
  )
}
