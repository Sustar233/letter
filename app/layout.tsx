import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = "https://starlit-letter.openai.site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "写给另一颗星",
  description: "我们曾短暂地经过彼此的世界。",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
  referrer: "no-referrer",
  openGraph: {
    title: "写给另一颗星",
    description: "我们曾短暂地经过彼此的世界。",
    type: "website",
    images: [{ url: "/og.png", width: 1536, height: 1024, alt: "写给另一颗星" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "写给另一颗星",
    description: "我们曾短暂地经过彼此的世界。",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "dark",
  themeColor: "#05070d",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
