'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { insuranceList } from '../../dataList';

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

const Status3 = ({
  insurance,
}: {
  insurance: (typeof insuranceList)[0];
}) => {
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
            router.push(`/insurance?claimed=${insurance.id}`);
          }}
        >
          特典を受け取る
        </button>
      </div>
    </div>
  );
};

const Page = ({ params }: { params: { id: string } }) => {
  const [status, setStatus] = useState(1);
  const id = params.id;
  const insurance = useMemo(() => insuranceList.find((i) => i.id === id), [id]);

  if (!insurance) {
    return <div>Not found</div>;
  }

  // 5秒おきにステータスを更新
  setTimeout(() => {
    setStatus(status + 1);
  }, 3e3);

  return (
    <>
      <h1 className="text-2xl font-bold mb-8">{insurance.title}</h1>

      <figure
        className={`${insurance.imgBgColor} p-4 w-full h-[200px] relative rounded-xl shadow-xl mb-8 grid place-items-center`}
      >
        <Image
          src={insurance.imgUrl}
          alt={insurance.title}
          width="440"
          height="220"
          className="object-scale-down max-h-[150px]"
        />
      </figure>

      {status === 1 && <Status1 />}
      {status === 2 && <Status2 />}
      {status >= 3 && <Status3 insurance={insurance} />}
    </>
  );
};

export default Page;
