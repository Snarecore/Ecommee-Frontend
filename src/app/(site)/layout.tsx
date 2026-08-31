import React from "react";
import NavBar from "@/component/layout/navbar/index";
import Footer from "@/component/layout/Footer";
import { Toaster } from "react-hot-toast";
import { InitialStateService } from "@/services/initial-state-service";
import FloatingChat from "@/component/chat/FloatingChat";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#FBF9F5] dark:bg-slate-900 min-h-screen transition-colors duration-300">
      <InitialStateService />
      <NavBar />
      <Toaster position="top-right" reverseOrder={false} />
      <main className="min-h-screen mx-auto bg-[#FBF9F5] dark:bg-slate-900 transition-colors duration-300">
        {children}
      </main>
      <FloatingChat />
      <Footer />
    </div>
  );
}
