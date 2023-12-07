'use client';

import Link from 'next/link';
import React from 'react';

const Card = ({
  title,
}: {
  title: string;
}) => {
  return (
    <div className="card w-96 bg-accent-200 shadow-xl mb-8 hover:shadow-2xl transition-shadow">
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
      </div>
    </div>
  );
};

const Page = () => {
  return (
    <>
      <h1 className="text-2xl font-bold mb-2">情報開示</h1>
      <p className="text-sm text-gray-400 mb-8">データを開示する相手を選択してください</p>

      <Link href="/personal-data/all-japan">
        <Card title="全日本海上保険" />
      </Link>
    </>
  );
};

export default Page;
