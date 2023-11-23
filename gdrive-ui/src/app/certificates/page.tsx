import React from 'react';

const Certificate: React.FC<{ title: string; value: number }> = (props) => {
  return (
    <div className="bg-base-100 rounded-md p-4 mb-6">
      <h2 className="font-semibold mb-4">{props.title}</h2>
      <span className="text-3xl font-bold">{props.value}</span>
    </div>
  );
};

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
