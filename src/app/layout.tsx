import "~/styles/globals.css";

import type { Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: {
    default: "Talk Tracker - Conference Talk Proposal Manager",
    template: "%s | Talk Tracker",
  },
  description:
    "Track your conference speaking engagements, manage reusable talk content, and evaluate which events to submit to using a Six Sigma weighted scoring matrix.",
  keywords: [
    "conference",
    "speaking",
    "talks",
    "proposals",
    "cfp",
    "devrel",
    "developer relations",
    "six sigma",
    "scoring matrix",
  ],
  authors: [{ name: "Matt Stratton" }],
  creator: "Matt Stratton",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://talk-tracker-lyart.vercel.app",
    siteName: "Talk Tracker",
    title: "Talk Tracker - Conference Talk Proposal Manager",
    description:
      "Track your conference speaking engagements, manage reusable talk content, and evaluate which events to submit to using a Six Sigma weighted scoring matrix.",
    images: [
      {
        url: "https://talk-tracker-lyart.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Talk Tracker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Talk Tracker - Conference Talk Proposal Manager",
    description:
      "Track your conference speaking engagements, manage reusable talk content, and evaluate which events to submit to using a Six Sigma weighted scoring matrix.",
    images: ["https://talk-tracker-lyart.vercel.app/og-image.png"],
    creator: "@mattstratton",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html className={`${geist.variable}`} lang="en">
      <body>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
