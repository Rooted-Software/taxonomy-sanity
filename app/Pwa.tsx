'use client' 

import { useEffect } from "react";
import type { Workbox } from "workbox-window";
declare global {
  interface Window {
    workbox: Workbox;
  }
}

export default function Pwa() {
  useEffect(() => {
    if (
      "serviceWorker" in navigator &&
      window.workbox !== undefined
    ) {
      const wb = window.workbox;
      wb.register();
    }
  }, []);
  return <></>;
}