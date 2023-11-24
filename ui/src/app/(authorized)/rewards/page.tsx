'use client';

import Image from 'next/image';
import Link from 'next/link';

const RewardCard = () => {
  return (
    <div className="card card-compact w-96 bg-white shadow-xl hover:shadow-2xl transition-shadow">
      <figure className="bg-red-400">
        <Image src="/images/roadster.png" alt="MAZDA Roadster" width="440" height="220" />
      </figure>
      <div className="card-body">
        <h2 className="card-title">
          <p>
            MAZDA ロードスター
            <br />
            無料レンタル券
          </p>
          <div className="badge badge-accent">申請可能</div>
        </h2>
      </div>
    </div>
  );
};

const Page = () => {
  return (
    <>
      <h1 className="text-2xl font-bold mb-8">特典</h1>
      <Link href="/rewards/roadster">
        <RewardCard />
      </Link>
    </>
  );
};

export default Page;
