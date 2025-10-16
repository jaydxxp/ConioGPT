"use client";

import React, { useEffect, useState } from "react";

export default function DesktopOnly() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const detect = () => {
      const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
      const mobileUA = /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(ua);
      const narrow = typeof window !== "undefined" ? window.innerWidth < 1024 : false;
      setIsMobile(mobileUA || narrow);
    };

    detect();
    window.addEventListener("resize", detect);
    return () => window.removeEventListener("resize", detect);
  }, []);

  if (!isMobile) return null;

  return (
    <div aria-hidden="true" style={{
      position: "fixed",
      inset: 0,
      zIndex: 99999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(0,0,0,0.95)",
      color: "white",
      padding: 20,
      textAlign: "center"
    }}>
      <div style={{ maxWidth: 720 }}>
        <h1 style={{ fontSize: 22, marginBottom: 12 }}>Desktop only</h1>
        <p style={{ opacity: 0.9, marginBottom: 18 }}>
          This app is currently supported on laptop/desktop only. Please open the site on a desktop or a device with a wider screen.
        </p>
        <p style={{ opacity: 0.7, fontSize: 13 }}>
          If you’re on a tablet, rotate to landscape or increase the browser width. Mobile support is coming soon.
        </p>
      </div>
    </div>
  );
}