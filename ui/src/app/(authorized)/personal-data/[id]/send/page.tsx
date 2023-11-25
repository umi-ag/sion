'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const Status1 = () => {
  return (
    <div className="grid place-items-center">
      <p className="mb-4">全日本海上保険にデータを送信しています...</p>
      <span className="loading loading-ring loading-lg" />
    </div>
  );
};

const Status2 = () => {
  const router = useRouter();

  return (
    <div className="grid place-items-center">
      <p className="mb-4">送信完了！</p>
      <div className="grid place-items-center w-full">
        <button
          className="btn btn-active btn-accent"
          onClick={() => {
            router.push('/personal-data');
          }}
        >
          もどる
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
      <h1 className="text-2xl font-bold mb-2">情報開示</h1>

      <div className="grid place-items-center h-1/2">
        {status === 1 && <Status1 />}
        {status >= 2 && <Status2 />}
      </div>
    </>
  );
};

export default Page;
