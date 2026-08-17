import type { Metadata } from "next";
import "../App.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Bazaarbound",
  description: "Bazaarbound E-Commerce Platform",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light">
      <body>
        <div id="root">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
