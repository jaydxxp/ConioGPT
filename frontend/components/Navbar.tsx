"use client";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function NavbarDemo() {
  const router =useRouter();
  const navItems = [
    {
      name: "Signin",
      link: "/auth/signin",
    },
    {
      name: "Signup",
      link: "/auth/signup",
    },
    {
      name: "About",
      link: "/about",
    },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    router.push("/auth/signin");
  };

  return (
    <div className="relative w-full">
      <Navbar>

        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />
          <div className="flex items-center gap-4 relative">
            {isLoggedIn ? (
              <div className="relative">
               
                <button
                  onClick={() => setShowLogout((prev) => !prev)}
                  className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white font-bold"
                >
                  U
                </button>
               
                {showLogout && (
                  <div className="absolute right-0 mt-2 w-24 bg-white border rounded shadow-lg z-10">
                    <button
                      onClick={handleLogout}
                      className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <NavbarButton onClick={() => router.push("/auth/signin")}>
                Login
              </NavbarButton>
            )}
          </div>
        </NavBody>


        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative text-neutral-600 dark:text-neutral-300"
              >
                <span className="block">{item.name}</span>
              </a>
            ))}
            <div className="flex w-full flex-col gap-4">
              <NavbarButton
                onClick={() => {setIsMobileMenuOpen(false); router.push("/auth/signin")}}
                variant="primary"
                className="w-full"
                
              >
                Login
              </NavbarButton>
              
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
      <DummyContent />

      {/* Navbar */}
    </div>
  );
}

const DummyContent = () => {
  return (
    <div className="container mx-auto p-8 pt-24">
      
      
    </div>
  );
};
