'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const RewardCard = ({
  claimed,
}: {
  claimed?: boolean;
}) => {
  return (
    <div className="card card-compact w-96 bg-white shadow-xl hover:shadow-2xl transition-shadow">
      <figure className="bg-red-400 relative">
        {/* 右上に「取得済み」というリボンを掛ける */}
        {claimed && (
          <div className="absolute top-[30px] right-[-40px] rotate-45 shadow-xl">
            <p className="bg-gradient-to-r from-green-200 to-green-500 w-40 text-center font-bold">
              取得済み
            </p>
          </div>
        )}
        <Image src="/images/roadster.png" alt="MAZDA Roadster" width="440" height="220" />
      </figure>
      <div className="card-body">
        <h2 className="card-title">
          <p>
            MAZDA ロードスター
            <br />
            無料レンタル券
          </p>
          {!claimed && <div className="badge badge-accent">申請可能</div>}
        </h2>
      </div>
    </div>
  );
};

const Page = () => {
  const searchParams = useSearchParams();
  const claimed = searchParams.get('claimed');

  return (
    <>
      <h1 className="text-2xl font-bold mb-8">特典</h1>
      <Link href="/rewards/roadster">
        <RewardCard claimed={claimed?.includes('roadster')} />
      </Link>
    </>
  );
};

export default Page;
