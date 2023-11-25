'use client';

import Link from 'next/link';
import React from 'react';
import { CredentialCard } from './CredentialCard';
import { credentialList } from './data';

const Page = () => {
  return (
    <>
      <h1 className="text-2xl font-bold mb-8">証明書一覧</h1>
      {credentialList.map((cred) => (
        <Link href={`/creds/${cred.id}`} key={cred.id}>
          <CredentialCard cred={cred} />
        </Link>
      ))}
    </>
  );
};

export default Page;
