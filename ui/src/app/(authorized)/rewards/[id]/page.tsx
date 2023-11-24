'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

export const runtime = 'edge';

const DataListItem = ({
  label,
  value,
  active,
}: { label: string; value: string; active: boolean }) => {
  return (
    <li className="flex justify-start items-center gap-2">
      <div
        className={`badge ${active ? 'badge-accent' : 'bg-gray-400 border-gray-400'} badge-sm`}
      />
      <p>
        {label}: <span className="font-semibold">{value}</span>
      </p>
    </li>
  );
};

const DataList = ({ data }: { data: { label: string; value: string; active: boolean }[] }) => {
  return (
    <ul>
      {data.map((item) => (
        <DataListItem key={item.label} label={item.label} value={item.value} active={item.active} />
      ))}
    </ul>
  );
};

const DataCard = ({
  title,
  data,
}: {
  title: string;
  data: { label: string; value: string; active: boolean }[];
}) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>

      <p className="text-sm text-gray-400">申請に使用されるデータ</p>
      <div className="mb-2">
        <DataList data={data.filter((d) => d.active)} />
      </div>

      <p className="text-sm text-gray-400">以下のデータは使用されません</p>
      <DataList data={data.filter((d) => !d.active)} />
    </div>
  );
};

const Page = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const id = params.id;

  const dataList = {
    marketing: {
      title: 'MAZDAマーケティング',
      data: [
        {
          label: 'MAZDA車での走行距離',
          value: '20,345km',
          active: true,
        },
        {
          label: 'MAZDA車の保有期間',
          value: '3年',
          active: true,
        },
        {
          label: 'イベント参加回数',
          value: '8回',
          active: false,
        },
      ],
    },
    ownership: {
      title: 'MAZDA車保有',
      data: [
        {
          label: '総走行距離',
          value: '33,456km',
          active: true,
        },
        {
          label: '事故回数',
          value: '2回',
          active: false,
        },
        {
          label: '急ブレーキ回数',
          value: '8回',
          active: true,
        },
        {
          label: '急ハンドル回数',
          value: '3回',
          active: true,
        },
      ],
    },
  };

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

      <p className="text-sm mb-8">以下のデータから証明を生成し、特典を申請します。</p>

      <DataCard {...dataList.marketing} />
      <DataCard {...dataList.ownership} />

      <div className="grid place-items-center w-full">
        <button
          className="btn btn-active btn-accent"
          onClick={() => {
            router.push(`/rewards/${id}/review`);
          }}
        >
          申請する
        </button>
      </div>
    </>
  );
};

export default Page;
