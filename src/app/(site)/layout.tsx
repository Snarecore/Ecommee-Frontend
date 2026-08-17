'use client';

import React from "react";
import NavBar from "@/component/layout/navbar/index";
import Footer from "@/component/layout/Footer";
import { Toaster } from "react-hot-toast";
import { InitialStateService } from "@/services/initial-state-service";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[var(--color-white-primary)]">
      <InitialStateService />
      <NavBar />
      <Toaster position="top-right" reverseOrder={false} />
      <main className="min-h-screen mx-auto">
        {children}
      </main>
      <Footer />
    </div>
  );
}
