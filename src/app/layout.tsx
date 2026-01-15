import "~/styles/globals.css";

import type { Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: {
    default: "Prowl - Conference Presence Manager",
    template: "%s | Prowl",
  },
  description:
    "Prowl the conference circuit with your DevRel team. Manage speaking engagements, sponsorships, budget tracking, and event prioritization all in one place.",
  keywords: [
    "conference",
    "speaking",
    "talks",
    "proposals",
    "cfp",
    "devrel",
    "developer relations",
    "sponsorship",
    "event management",
    "six sigma",
    "scoring matrix",
  ],
  authors: [{ name: "Matt Stratton" }],
  creator: "Matt Stratton",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://prowl.vercel.app",
    siteName: "Prowl",
    title: "Prowl - Conference Presence Manager",
    description:
      "Prowl the conference circuit with your DevRel team. Manage speaking engagements, sponsorships, budget tracking, and event prioritization all in one place.",
    images: [
      {
        url: "https://prowl.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Prowl",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Prowl - Conference Presence Manager",
    description:
      "Prowl the conference circuit with your DevRel team. Manage speaking engagements, sponsorships, budget tracking, and event prioritization all in one place.",
    images: ["https://prowl.vercel.app/og-image.png"],
    creator: "@mattstratton",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: { url: "/favicon.svg", type: "image/svg+xml" },
  },
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
