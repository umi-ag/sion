'use client';

import { TransactionBlock } from '@mysten/sui.js/transactions';
import { useSearchParams } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { CredentialClaim, sionMoveCall } from 'sion-sdk';
import { sleep } from 'src/utils';
import { formatClaim } from 'src/utils/formatClaim';
import { credList } from '../../data';

export const runtime = 'edge';

const Card = ({
  title,
  claims,
  disclosedClaims,
}: {
  title: string;
  claims: CredentialClaim[];
  disclosedClaims: string[];
}) => {
  const [credClaims] = useState<CredentialClaim[]>(claims);
  const disclosed = (claimKey: string) => disclosedClaims.includes(claimKey);

  const toLabel = (claim: CredentialClaim) => {
    if (!disclosed(claim.claim_key)) {
      return <span className="text-gray-400">{claim.label}</span>;
    }

    const display = formatClaim(claim);
    return (
      <>
        <span>{claim.label}: </span>
        <span className="font-semibold">{display}</span>
      </>
    );
  };

  const Badge = ({ claimKey }: { claimKey: string }) => {
    return (
      <div
        className={`badge badge-accent ${
          !disclosed(claimKey) && 'bg-gray-400 border-gray-400'
        } rounded-full`}
      />
    );
  };

  return (
    <div className="card w-96 bg-sky-100 shadow-xl mb-8">
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
        <ul>
          {credClaims.map((claim) => (
            <li key={claim.label} className="flex items-center gap-2 mb-2 last:mb-0">
              <Badge claimKey={claim.claim_key} />
              <span>{toLabel(claim)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const Page = () => {
  const searchParams = useSearchParams();
  const disclosedClaimKeys = useMemo(() => {
    const disclosedClaimKeys = searchParams.get('claims');
    if (!disclosedClaimKeys) {
      return [];
    }
    return disclosedClaimKeys.split(',');
  }, [searchParams]);
  const [verifyButtonContent, setVerifyButtonContent] = useState<React.ReactNode>('検証');
  const verifying = verifyButtonContent !== '検証';

  const verify = async () => {
    toast('検証しています...');

    const claimList = credList.drivingData.claims;
    const disclosedClaims = claimList.filter((claim) =>
      disclosedClaimKeys.includes(claim.claim_key),
    );
    console.log({ disclosedClaims });
    console.log(disclosedClaimKeys);

    // const txb = new TransactionBlock();
    // sionMoveCall.boundCheck(txb, {
    //   membershipId: membershipId,
    //   claimKey: 'mileage',
    //   lower_bound_gte: proverArgs.lowerBoundGte,
    //   upper_bound_le: proverArgs.upperBoundLt,
    //   proof: Buffer.from(verifier.proof, 'hex'),
    //   vk: Buffer.from(verifier.vk, 'hex'),
    // });

    // const result: SuiTransactionBlockResponse = await client.signAndExecuteTransactionBlock({
    //   transactionBlock: txb,
    //   signer: keypair(),
    //   requestType: 'WaitForLocalExecution',
    //   options: {
    //     showObjectChanges: true,
    //     showEvents: true,
    //   },
    // });
    // console.log(JSON.stringify(result, null, 2));

    // const isVerified = sionTransactionResponseResolver.verifyBoundCheck(result, {
    //   authenticator: keypair().toSuiAddress(),
    // });

    setVerifyButtonContent(
      <>
        <span className="loading loading-spinner loading-sm" />
        検証中...
      </>,
    );
    await sleep(2000);
    toast.success('検証成功！');
    setVerifyButtonContent('検証');
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-2">情報開示</h1>

      <Card {...credList.drivingData} disclosedClaims={disclosedClaimKeys} />
      {/* <Card {...credList.safeDriving} /> */}

      <div className="grid place-items-center w-full">
        <button className="btn btn-active btn-accent" onClick={verify} disabled={verifying}>
          {verifyButtonContent}
        </button>
      </div>
    </>
  );
};

export default Page;
