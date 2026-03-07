import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AuthLayout from "@/components/AuthLayout";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const outfit     = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const jetbrains  = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400","500","700"] });

export const metadata: Metadata = {
  title: "BharatLearn Dev Coach",
  description: "AI-powered CS learning platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${jetbrains.variable}`}>
      <body>
        <AuthLayout>{children}</AuthLayout>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
