'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Data, dataList, toPercent } from './dataList';

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
          className="progress progress-accent w-full h-full"
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
