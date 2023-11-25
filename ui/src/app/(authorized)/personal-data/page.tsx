'use client';

import Link from 'next/link';
import React from 'react';
import { sampleClaimDrivingBehavior, sampleClaimTrafficViolation } from 'sion-sdk';
const Card = ({
  title,
}: {
  title: string;
}) => {
  return (
    <div className="card w-96 bg-accent-200 shadow-xl mb-8 hover:shadow-2xl transition-shadow">
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
        {/* <ul>
          {credClaims.map((claim) => (
            <li key={claim.label}>
              <Checkbox
                label={toLabel(claim)}
                checked={selectedClaims.includes(claim.claim_key)}
                onChange={(checked) => select(claim.claim_key, checked)}
              />
            </li>
          ))}
        </ul> */}
      </div>
    </div>
  );
};
const Page = () => {
  const claimList = {
    drivingData: {
      title: 'MAZDA車走行データ',
      claim: sampleClaimDrivingBehavior,
    },
    safeDriving: {
      title: '安全運転データ',
      claim: sampleClaimTrafficViolation,
    },
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-2">情報開示</h1>
      <p className="text-sm text-gray-400 mb-8">データを開示する相手を選択してください</p>

      <Link href="/personal-data/all-japan">
        <Card title="全日本海上保険" />
      </Link>

      {/* <div className="grid place-items-center w-full">
        <button className="btn btn-active btn-accent">データを開示する</button>
      </div> */}
    </>
  );
};

export default Page;
