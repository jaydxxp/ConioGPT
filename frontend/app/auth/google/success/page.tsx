"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GoogleSuccess() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {

      localStorage.setItem("token", `Bearer ${token}`);

      window.history.replaceState({}, document.title, window.location.pathname);
      router.replace("/chat");
    } else {

      router.replace("/auth/signin");
    }
  }, [router]);

  return <div>Signing you in...</div>;
}