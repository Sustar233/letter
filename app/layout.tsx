import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = "https://starlit-letter.openai.site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "一封信｜写在星空下",
  description: "一封沿着回忆、祝愿与两条星轨缓缓展开的私人信件。",
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
    title: "一封信｜写在星空下",
    description: "有些话适合留到夜深，再慢慢写给你。",
    type: "website",
    images: [{ url: "/og.png", width: 1536, height: 1024, alt: "一封写在星空下的信" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "一封信｜写在星空下",
    description: "有些话适合留到夜深，再慢慢写给你。",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "dark",
  themeColor: "#030c18",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
