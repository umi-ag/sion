'use client';
export const runtime = 'edge';

import { LineChart, generateRandomData } from 'src/components/LineChart';
import { Certificate } from '../Certificate';
import { certificates } from '../data';

import {
  CredentialClaim,
  claimSchemaListDrivingBehavior,
  sampleClaimDrivingBehavior,
} from 'sion-sdk';
import { useState } from 'react';
import { moveCallIssueCreds } from 'src/libs/authenticator/issueCreds';
import { useZkLogin } from 'src/store';

const Page = ({ params }: { params: { id: string } }) => {
  const cert = certificates.find((certificate) => certificate.id === params.id) as Certificate;
  const graphData = generateRandomData(JSON.stringify(cert), 20, 10, 50);

  const [credClaims, setCredClaims] = useState<CredentialClaim[]>([]);

  const { zkLogin } = useZkLogin();

  return (
    <>
      <h1 className="text-2xl font-bold mb-8">{cert.title}</h1>

      <div className="grid place-items-center scale-x-[200%] mb-8">
        <LineChart data={graphData} />
      </div>

      <button
        className="btn btn-primary"
        onClick={() => {
          console.log({ sampleClaimDrivingBehavior });
          console.log({ claimSchemaListDrivingBehavior });
        }}
      >
        btn
      </button>

      <button
        className="btn btn-primary"
        onClick={async () => {
          const args = {
            memberAddress: zkLogin.zkLoginAddress,
            claimList: sampleClaimDrivingBehavior,
          };
          console.log({ args });
          await moveCallIssueCreds(args);
          setCredClaims(sampleClaimDrivingBehavior);
        }}
      >
        証明書をリクエスト
      </button>

      <div className="mb-8">
        <p className="text-lg font-semibold mb-2">現在のスコア</p>
        <p>{cert.value}</p>
      </div>

      <div className="mb-8">
        <p className="text-lg font-semibold mb-2">過去6ヶ月の走行データ</p>
        <ul className="list-disc pl-4">
          <li>総走行距離: 12,345km</li>
          <li>急ハンドル回数: 6回</li>
          <li>風ブレーキ回数: 7回</li>
        </ul>
      </div>
    </>
  );
};

export default Page;
