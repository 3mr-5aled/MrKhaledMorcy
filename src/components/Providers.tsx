"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { RamadanDecoration } from "./RamadanDecoration";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <RamadanDecoration />
      <Toaster />
      {children}
    </SessionProvider>
  );
}
