'use client';

import React from 'react';
import { FooterMenu } from 'src/components/FooterMenu';

export default function AuthorizedRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}

      <div className="absolute bottom-0 left-0 w-full">
        <FooterMenu />
      </div>
    </>
  );
}
