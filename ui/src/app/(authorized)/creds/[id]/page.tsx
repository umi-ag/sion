'use client';
export const runtime = 'edge';

import { LineChart, generateRandomData } from 'src/components/LineChart';

import { Decimal } from 'decimal.js';

import {
  CredentialClaim,
  claimSchemaListDrivingBehavior,
  sampleClaimDrivingBehavior,
} from 'sion-sdk';
import { useState } from 'react';
import { moveCallIssueCreds } from 'src/libs/authenticator/issueCreds';
import { useZkLogin } from 'src/store';
import { match } from 'ts-pattern';
import numeral from 'numeral';
import { sleep } from 'src/utils';

const Page = ({ params }: { params: { id: string } }) => {
  // const cert = certificates.find((certificate) => certificate.id === params.id) as Certificate;
  // const graphData = generateRandomData(JSON.stringify(cert), 20, 10, 50);

  const [credClaims, setCredClaims] = useState<CredentialClaim[]>([]);

  const { zkLogin } = useZkLogin();

  const [ status, setStatus] = useState<'waiting' | 'loading' | 'done'>('waiting');

  const DisplayClaim = (claim: CredentialClaim) => {
    let number = new Decimal(claim.claim_value.toString()).div(1e6).toNumber();
    const display = match(claim.type)
      .with('count', () => `${numeral(number).format('0')} 回`)
      .with('meter', () => `${numeral(number / 1000).format('0')} km`)
      .with('ratio', () => `${numeral(number).format('0.0 %')}`)
      .with('hour', () => `${numeral(number).format('0')} 時間`)
      .otherwise(() => '');

    return (
      <li className="flex items-center gap-3">
        <span>{claim.label}:</span>
        <span>{display}</span>
      </li>
    );
  };

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
        {
          match(status)
          .with('waiting', () => '証明書をリクエスト')
          .with('loading', () => '証明車を発行中...')
          .with('done', () => '証明書 発行済み')
          .exhaustive()
        }
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
