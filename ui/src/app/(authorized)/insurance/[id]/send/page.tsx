'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export const runtime = 'edge';

const Status1 = () => {
  return (
    <div className="grid place-items-center">
      <p className="mb-4">データを送信しています...</p>
      <span className="loading loading-ring loading-lg" />
    </div>
  );
};

const Status2 = () => {
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();

  const next = () => {
    router.push(`/insurance/${id}/verify?${searchParams.toString()}`);
  };

  return (
    <div className="grid place-items-center">
      <p className="mb-4">送信完了！</p>
      <div className="grid place-items-center w-full">
        <button className="btn btn-active btn-accent" onClick={next}>
          検証する
        </button>
      </div>
    </div>
  );
};

const Page = () => {
  const [status, setStatus] = useState(1);

  // 5秒おきにステータスを更新
  setTimeout(() => {
    setStatus(status + 1);
  }, 6e3);

  return (
    <>
      <h1 className="text-2xl font-bold mb-2">保険</h1>

      <div className="grid place-items-center h-64">
        {status === 1 && <Status1 />}
        {status >= 2 && <Status2 />}
      </div>
    </>
  );
};

export default Page;
