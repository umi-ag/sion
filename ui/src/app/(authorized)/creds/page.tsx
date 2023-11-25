'use client';

import Link from 'next/link';
import React from 'react';
import { CredencialCard } from './CredentailCard';
import { CredentailProfile, credencialList } from './data';

const Page = () => {
  return (
    <>
      <h1 className="text-2xl font-bold mb-8">証明書一覧</h1>
      {credencialList.map((cred) => (
        <Link href={`/creds/${cred.id}`} key={cred.id}>
          <CredencialCard cred={cred} />
        </Link>
      ))}
    </>
  );
};

export default Page;
