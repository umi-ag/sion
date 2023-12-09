'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { Data, dataList, insuranceList, toPercent } from '../dataList';

export const runtime = 'edge';

const DataListItem = (data: Data) => {
  const { title, description, value, threshold, active } = data;
  return (
    <li className="rounded border border-gray-200 px-2 py-4 mb-4 last:mb-0">
      <div className="flex justify-start items-center gap-2 mb-2">
        <div className={`badge ${active ? 'badge-accent' : 'bg-gray-400 border-gray-400'}`}>OK</div>
        <p className="font-semibold">{title}</p>
      </div>

      <p className="mb-2">{description}</p>

      <div className="w-full h-6 relative">
        <progress
          className="progress progress-warning w-full h-full"
          value={toPercent(data)}
          max="100"
        />
        <div className="absolute top-0 left-0 w-full h-full grid place-items-center font-semibold">
          <span>
            {value} / {threshold}
          </span>
        </div>
      </div>
    </li>
  );
};

const DataList = ({ data }: { data: Data[] }) => {
  return (
    <ul>
      {data.map((item) => (
        <DataListItem key={item.title} {...item} />
      ))}
    </ul>
  );
};

const DataCard = ({
  title,
  data,
}: {
  title: string;
  data: Data[];
}) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>

      <p className="text-sm text-gray-400">申請に使用されるデータ</p>
      <div className="mb-2">
        <DataList data={data.filter((d) => d.active)} />
      </div>

      {/* <p className="text-sm text-gray-400">以下のデータは使用されません</p>
      <DataList data={data.filter((d) => !d.active)} /> */}
    </div>
  );
};

const Page = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const id = params.id;
  const insurance = useMemo(() => insuranceList.find((i) => i.id === id), [id]);
  if (!insurance) {
    return <div>Not found</div>;
  }

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

      <p className="text-sm mb-8">以下のデータから証明を生成し、保険の申請をします。</p>

      <DataCard {...dataList.marketing} />
      <DataCard {...dataList.ownership} />

      <div className="grid place-items-center w-full">
        <button
          className="btn btn-active btn-accent"
          onClick={() => {
            router.push(`/insurance/${id}/review`);
          }}
        >
          申請する
        </button>
      </div>
    </>
  );
};

export default Page;
