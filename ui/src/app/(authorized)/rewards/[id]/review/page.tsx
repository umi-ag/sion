'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export const runtime = 'edge';

const Status1 = () => {
  return (
    <div className="grid place-items-center">
      <div className="w-60">
        <ul className="steps steps-vertical">
          <li className="step">証明生成中です...</li>
          <li className="step">審査</li>
        </ul>
      </div>
      <span className="loading loading-ring loading-lg" />
    </div>
  );
};

const Status2 = () => {
  return (
    <div className="grid place-items-center">
      <div className="w-60">
        <ul className="steps steps-vertical">
          <li className="step step-primary">証明生成完了！</li>
          <li className="step">審査中です...</li>
        </ul>
      </div>
      <span className="loading loading-ring loading-lg" />
    </div>
  );
};

const Status3 = () => {
  const router = useRouter();
  return (
    <div className="grid place-items-center">
      <div className="w-60 mb-8">
        <ul className="steps steps-vertical">
          <li className="step step-primary">証明生成完了！</li>
          <li className="step step-primary">審査完了！</li>
        </ul>
      </div>

      <div className="grid place-items-center w-full">
        <button
          className="btn btn-active btn-accent"
          onClick={() => {
            router.push('/rewards?claimed=roadster');
          }}
        >
          特典を受け取る
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
  }, 3e3);

  return (
    <>
      <h1 className="text-2xl font-bold mb-8">
        MAZDAロードスター
        <br />
        無料レンタル券
      </h1>

      <figure className="bg-red-400 rounded-xl shadow-xl mb-8">
        <Image src="/images/roadster.png" alt="MAZDA Roadster" width="440" height="220" />
      </figure>

      {status === 1 && <Status1 />}
      {status === 2 && <Status2 />}
      {status >= 3 && <Status3 />}

      {/* <div className="grid place-items-center h-40">
        <p className="text-center">1. 証明生成</p>
        <span className="loading loading-dots loading-lg" />
        <p className="text-center">2. 審査</p>
        <span className="loading loading-dots loading-lg" />
      </div> */}

      {/* <div>
        <ul className="steps steps-vertical">
          <li className="step step-primary">証明生成完了！</li>
          <li className="step">審査中です...</li>
        </ul>

        <span className="loading loading-ring loading-lg" />
      </div>

      <div>
        <ul className="steps steps-vertical">
          <li className="step step-primary">証明生成完了！</li>
          <li className="step step-primary">審査完了！</li>
        </ul>
      </div> */}
    </>
  );
};

export default Page;
