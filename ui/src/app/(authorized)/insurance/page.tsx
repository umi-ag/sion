'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

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
    <div className="card card-compact relative w-96 bg-white shadow-xl hover:shadow-2xl transition-shadow mb-8 overflow-hidden">
      <figure className={`${imgBgColor} relative`}>
        <Image src={imgUrl} alt="MAZDA Roadster" width="440" height="220" />
      </figure>
      <div className="card-body">
        <h2 className="card-title">
          <p>{title}</p>

          {disabled ? (
            <span className="text-sm font-medium">資格がありません</span>
          ) : (
            <span className="badge badge-accent">加入中</span>
          )}
        </h2>
      </div>
      {disabled && <div className="absolute bg-black opacity-50 w-full h-full top-0 left-0" />}
    </div>
  );
};

const Card2 = ({
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
            // <span className="text-sm font-medium">資格がありません</span>
            <span className="text-sm font-medium">資格なし</span>
          ) : (
            <span className="badge badge-accent">加入中</span>
          )}
        </h2>
        <span className="text-sm text-gray-400">全日本海上保険</span>
        {/* <span className="text-sm font-medium">資格がありません</span> */}
      </div>
      {disabled && <div className="absolute bg-black opacity-50 w-full h-full top-0 left-0" />}
    </div>
  );
};

const Page = () => {
  const data = [
    {
      title: 'ゴールド保険',
      imgUrl: '/images/gold-insurance.png',
      imgBgColor: 'bg-yellow-400',
      disabled: true,
    },
    {
      title: 'シルバー保険',
      imgUrl: '/images/silver-insurance.png',
      imgBgColor: 'bg-gray-400',
      disabled: false,
    },
    {
      title: 'ブロンズ保険',
      imgUrl: '/images/bronze-insurance.png',
      // imgBgColor: 'bg-amber-800',
      imgBgColor: 'bg-orange-400',
      disabled: false,
    },
  ];

  return (
    <>
      <h1 className="text-2xl font-bold mb-10">保険</h1>
      {/* <p className="text-sm text-gray-400 mb-8">データを開示する相手を選択してください</p> */}

      {data.map((d) => (
        <Link href="/insurance/driver" key={d.title}>
          <Card2
            title={d.title}
            imgUrl={d.imgUrl}
            imgBgColor={d.imgBgColor}
            disabled={d.disabled}
          />
        </Link>
      ))}

      {/* <Link href="/insurance/driver">
        <Card title="ゴールド保険" disabled />
      </Link>

      <Link href="/insurance/driver">
        <Card title="シルバー保険" />
      </Link>

      <Link href="/insurance/driver">
        <Card title="ブロンズ保険" />
      </Link> */}
    </>
  );
};

export default Page;
