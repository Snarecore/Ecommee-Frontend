import React from "react";
import NavBar from "@/component/layout/navbar/index";
import Footer from "@/component/layout/Footer";
import { Toaster } from "react-hot-toast";
import { InitialStateService } from "@/services/initial-state-service";

export const metadata = {
  title: "Authentication - Fashion Time",
  description: "Secure login and authentication for Fashion Time",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#FBF9F5] dark:bg-slate-900 min-h-screen transition-colors duration-300 flex flex-col justify-between">
      <InitialStateService />
      <NavBar />
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
            fontSize: "14px",
          },
        }}
      />
      <main className="flex-1 flex items-center justify-center py-8 md:py-14 px-4 sm:px-6 lg:px-8 bg-[#FBF9F5] dark:bg-slate-900 transition-colors duration-300">
        {children}
      </main>
      <Footer />
    </div>
  );
}
