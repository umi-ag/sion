import React from 'react';
import { Certificate } from './Certificate';

const Page = () => {
  const certificates = [
    { title: 'MAZDAロイヤリティ指数', value: 100 },
    { title: '安全運転指数', value: 200 },
    { title: 'SUV', value: 300 },
  ];

  return (
    <>
      <h1 className="text-2xl font-bold mb-8">証明書一覧</h1>
      {certificates.map((certificate) => (
        <Certificate key={certificate.title} title={certificate.title} value={certificate.value} />
      ))}
    </>
  );
};

export default Page;
