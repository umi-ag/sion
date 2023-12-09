'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { insuranceList } from './dataList';

const Card = ({
  title,
  disabled,
  imgUrl,
  imgBgColor,
}: {
  title: string;
  imgUrl: string;
  imgBgColor: string;
  disabled?: boolean;
}) => {
  return (
    <div className="card card-side bg-white-100 shadow-xl relative overflow-hidden mb-8">
      <figure className={`${imgBgColor} relative w-[100px] h-[150px] p-4`}>
        <Image src={imgUrl} alt={title} width="440" height="220" />
      </figure>
      <div className="card-body">
        <h2 className="card-title justify-between">
          {title}
          {disabled ? (
            <span className="text-sm font-medium">資格なし</span>
          ) : (
            <span className="badge badge-accent">加入中</span>
          )}
        </h2>
        <span className="text-sm text-gray-400">全日本海上保険</span>
      </div>
      {disabled && <div className="absolute bg-black opacity-50 w-full h-full top-0 left-0" />}
    </div>
  );
};

const Page = () => {
  return (
    <>
      <h1 className="text-2xl font-bold mb-10">保険</h1>

      {insuranceList.map((i) => (
        <Link href={`/insurance/${i.id}`} key={i.title}>
          <Card title={i.title} imgUrl={i.imgUrl} imgBgColor={i.imgBgColor} disabled={i.disabled} />
        </Link>
      ))}
    </>
  );
};

export default Page;
