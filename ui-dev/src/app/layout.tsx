'use client';

import React from 'react';
import { Toaster } from 'react-hot-toast';
import './globals.scss';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-base-100 h-full" data-theme="light">
      <body className="bg-white min-h-full max-w-md mx-auto my-0 px-8 py-4 relative">
        {children}

        <Toaster />
      </body>
    </html>
  );
}
