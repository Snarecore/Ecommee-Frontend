import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Fashion Time | E-Commerce Platform",
  description: "Fashion Time E-Commerce Platform",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" }
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var savedTheme = localStorage.getItem('theme');
                  if (savedTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.setAttribute('data-theme', 'dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.setAttribute('data-theme', 'light');
                  }

                  var savedAccent = localStorage.getItem('storefront-primary-color');
                  if (!savedAccent) {
                    var savedThemeConfig = localStorage.getItem('storefront-theme') || localStorage.getItem('bazaarbound-appearance');
                    if (savedThemeConfig) {
                      try {
                        var parsed = JSON.parse(savedThemeConfig);
                        savedAccent = (parsed.palette && parsed.palette.accent) || (parsed.overrides && parsed.overrides.palette && parsed.overrides.palette.accent) || parsed.accent;
                      } catch (err) {}
                    }
                  }
                  if (savedAccent) {
                    document.documentElement.style.setProperty('--color-primary', savedAccent);
                    document.documentElement.style.setProperty('--color-green-primary', savedAccent);
                    document.documentElement.style.setProperty('--color-green-secondary', savedAccent);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-[#FBF9F5] dark:bg-slate-900 text-gray-900 dark:text-gray-100 min-h-screen transition-colors duration-300" suppressHydrationWarning>
        <div id="root" className="bg-[#FBF9F5] dark:bg-slate-900 min-h-screen transition-colors duration-300">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
