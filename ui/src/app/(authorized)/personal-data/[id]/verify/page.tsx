'use client';

import { useSearchParams } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { CredentialClaim } from 'sion-sdk';
import { formatClaim } from 'src/utils/formatClaim';
import { claimList } from '../../data';

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
    <div className="card w-96 bg-accent-200 shadow-xl mb-8">
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

  return (
    <>
      <h1 className="text-2xl font-bold mb-2">情報開示</h1>

      <Card {...claimList.drivingData} disclosedClaims={disclosedClaimKeys} />
      {/* <Card {...claimList.safeDriving} /> */}

      <div className="grid place-items-center w-full">
        <button className="btn btn-active btn-accent">検証</button>
      </div>
    </>
  );
};

export default Page;
