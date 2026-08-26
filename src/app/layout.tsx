import type { Metadata } from "next";
import "./globals.css";
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  localStorage.setItem('theme', 'light');
                  document.documentElement.classList.remove('dark');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-[#fbf9f5]">
        <div id="root" className="bg-[#fbf9f5]">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
