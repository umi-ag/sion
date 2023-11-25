'use client';
export const runtime = 'edge';

import { useState } from 'react';
import { CredentialClaim, sampleClaimDrivingBehavior } from 'sion-sdk';
import { useZkLogin } from 'src/store';
import { sleep } from 'src/utils';
import { match } from 'ts-pattern';
import { DisplayClaim } from './DisplayClaim';

const Page = ({ params }: { params: { id: string } }) => {
  // const cert = certificates.find((certificate) => certificate.id === params.id) as Certificate;
  // const graphData = generateRandomData(JSON.stringify(cert), 20, 10, 50);

  const [credClaims, setCredClaims] = useState<CredentialClaim[]>([]);

  const { zkLogin } = useZkLogin();

  const [status, setStatus] = useState<'waiting' | 'loading' | 'done'>('waiting');

  return (
    <>
      <h1 className="text-2xl font-bold mb-8">MAZDA車走行データ</h1>
      <h2 className="text-lg font-bold mb-8">発行者: マツダ株式会社</h2>

      {/* <div className="grid place-items-center scale-x-[200%] mb-8">
        <LineChart data={graphData} />
      </div> */}

      <button
        className="btn btn-primary"
        onClick={async () => {
          setStatus('loading');
          const args = {
            memberAddress: zkLogin.zkLoginAddress,
            claimList: sampleClaimDrivingBehavior,
          };
          console.log({ args });
          // await moveCallIssueCreds(args);
          await sleep(3000);
          setCredClaims(sampleClaimDrivingBehavior);
          setStatus('done');
        }}
      >
        {match(status)
          .with('waiting', () => '証明書をリクエスト')
          .with('loading', () => '証明書を発行中...')
          .with('done', () => '証明書 発行済み')
          .exhaustive()}
      </button>

      <div className="my-8">
        <p className="text-lg font-semibold mb-2">過去24ヶ月の走行データ</p>
        <ul className="list-disc pl-4">
          {credClaims.map((claim) => (
            <DisplayClaim key={claim.label} {...claim} />
          ))}
        </ul>
      </div>
    </>
  );
};

export default Page;
