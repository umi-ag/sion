import Link from 'next/link';
import React from 'react';
import { Certificate } from './Certificate';
import { certificates } from './data';

const Page = () => {
  return (
    <>
      <h1 className="text-2xl font-bold mb-8">証明書一覧</h1>
      {certificates.map((certificate) => (
        <Link href={`/certificates/${certificate.id}`}>
          <Certificate key={certificate.id} certificate={certificate} />
        </Link>
      ))}
    </>
  );
};

export default Page;