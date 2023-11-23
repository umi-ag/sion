'use client';

import React from 'react';
import { Toaster } from 'react-hot-toast';
import { FooterMenu } from 'src/components/FooterMenu';
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

        <div className="absolute bottom-0 left-0 w-full">
          <FooterMenu />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
