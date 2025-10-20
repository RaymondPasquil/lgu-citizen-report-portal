import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LGU Citizen Report Portal",
  description: "Report issues in your community and track their resolution",
  keywords: ["LGU", "Citizen Report", "Government", "Community", "Service"],
  authors: [{ name: "LGU IT Department" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "LGU Citizen Report Portal",
    description: "Report issues in your community and track their resolution",
    url: "https://lgu-reports.gov.ph",
    siteName: "LGU Reports",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LGU Citizen Report Portal",
    description: "Report issues in your community and track their resolution",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
