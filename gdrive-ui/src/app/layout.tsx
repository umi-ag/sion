"use client";

import "./globals.scss";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-base-100">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
