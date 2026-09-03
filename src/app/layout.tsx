import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#2e3192",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "IndiaMART - Buyer & Supplier Feedback & Rating Portal",
  description: "Official IndiaMART Buyer Feedback & Rating Portal. Share verified experiences, submit seller reviews, and track OTP verification securely.",
  keywords: ["IndiaMART", "B2B Feedback", "Supplier Review", "Buyer Verification", "IndiaMART Complaints", "IndiaMART Help Center"],
  authors: [{ name: "IndiaMART Technical Team" }],
  openGraph: {
    title: "IndiaMART Feedback & Review Portal",
    description: "Official IndiaMART portal for verified buyer ratings and supplier feedback.",
    url: "https://www.indiamart.com",
    siteName: "IndiaMART",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-[#f3f5f8] antialiased text-gray-900 font-sans">
        {children}
      </body>
    </html>
  );
}
